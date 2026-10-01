import "server-only"

import crypto from "node:crypto"

import { safeEqual } from "@lib/safe-equal"

const BASE_URL = "https://api.abacatepay.com/v2"

// Published by AbacatePay for webhook signatures (docs.abacatepay.com/pages/webhooks).
const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9"

export type PixStatus =
  | "PENDING"
  | "EXPIRED"
  | "CANCELLED"
  | "PAID"
  | "UNDER_DISPUTE"
  | "REFUNDED"
  | "REDEEMED"
  | "APPROVED"
  | "FAILED"

export type PixCharge = {
  id: string
  amount: number
  status: PixStatus
  devMode: boolean
  brCode: string
  brCodeBase64: string
  expiresAt: string
}

export class PaymentProviderError extends Error {}

export const isDevMode = () => process.env.ABACATEPAY_DEV_MODE === "true"

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = process.env.ABACATEPAY_API_KEY
  if (!apiKey) {
    throw new PaymentProviderError("ABACATEPAY_API_KEY must be set")
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...init.headers,
    },
    cache: "no-store",
  })

  const body = (await res.json().catch(() => null)) as {
    data?: T
    error?: string | null
  } | null

  if (!res.ok || !body?.data) {
    throw new PaymentProviderError(
      `AbacatePay ${path} responded ${res.status}: ${body?.error ?? "no data"}`
    )
  }

  return body.data
}

export function createPixCharge(input: {
  amountCents: number
  expiresIn: number
  description: string
  customer: { name: string; email: string; cellphone: string; taxId: string }
  externalId: string
  metadata: Record<string, string>
}) {
  return request<PixCharge>("/transparents/create", {
    method: "POST",
    body: JSON.stringify({
      method: "PIX",
      data: {
        amount: input.amountCents,
        expiresIn: input.expiresIn,
        description: input.description,
        customer: input.customer,
        externalId: input.externalId,
        metadata: input.metadata,
      },
    }),
  })
}

export function checkPixCharge(id: string) {
  return request<Pick<PixCharge, "id" | "status" | "expiresAt">>(
    `/transparents/check?id=${encodeURIComponent(id)}`
  )
}

export function simulatePixPayment(id: string) {
  if (!isDevMode()) {
    throw new PaymentProviderError("Payment simulation is only available in dev mode")
  }
  return request<PixCharge>(
    `/transparents/simulate-payment?id=${encodeURIComponent(id)}`,
    { method: "POST", body: "{}" }
  )
}

export function verifyWebhook({
  rawBody,
  signature,
  secret,
}: {
  rawBody: string
  signature: string | null
  secret: string | null
}) {
  const expectedSecret = process.env.ABACATEPAY_WEBHOOK_SECRET
  if (!expectedSecret || !secret || !signature) return false
  if (!safeEqual(secret, expectedSecret)) return false

  const expectedSignature = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(rawBody, "utf8")
    .digest("base64")

  return safeEqual(expectedSignature, signature)
}

// The event payload shape is not documented per event, so look for the charge id
// anywhere in it instead of depending on a specific path.
export function findChargeId(data: unknown): string | null {
  if (typeof data === "string") return data.startsWith("pix_char_") ? data : null
  if (!data || typeof data !== "object") return null
  for (const value of Object.values(data)) {
    const found = findChargeId(value)
    if (found) return found
  }
  return null
}
