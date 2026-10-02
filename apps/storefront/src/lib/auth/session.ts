import "server-only"

import crypto from "node:crypto"
import { cookies } from "next/headers"

import { safeEqual } from "@lib/safe-equal"

export const SESSION_COOKIE_NAME = "cm_session"
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days

export type CustomerSession = {
  customerId: string
  email: string
  name?: string
  exp: number
}

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SANITY_API_WRITE_TOKEN ||
    "cerami-mandy-fallback-secret-at-least-32-chars-long"
  )
}

export function signSession(payload: Omit<CustomerSession, "exp">): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  const session: CustomerSession = { ...payload, exp }
  const data = Buffer.from(JSON.stringify(session)).toString("base64url")
  const hmac = crypto.createHmac("sha256", getAuthSecret()).update(data).digest("base64url")
  return `${data}.${hmac}`
}

export function verifySession(token: string): CustomerSession | null {
  if (!token || !token.includes(".")) return null
  const [data, signature] = token.split(".")
  if (!data || !signature) return null

  const expectedHmac = crypto.createHmac("sha256", getAuthSecret()).update(data).digest("base64url")
  if (!safeEqual(signature, expectedHmac)) return null

  try {
    const raw = Buffer.from(data, "base64url").toString("utf-8")
    const session = JSON.parse(raw) as CustomerSession
    if (!session.customerId || !session.email || !session.exp) return null
    if (session.exp < Math.floor(Date.now() / 1000)) return null
    return session
  } catch {
    return null
  }
}

export async function getSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!token) return null
    return verifySession(token)
  } catch {
    return null
  }
}

export async function setSessionCookie(payload: Omit<CustomerSession, "exp">) {
  const token = signSession(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
