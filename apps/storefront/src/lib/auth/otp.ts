import "server-only"

import crypto from "node:crypto"

import { isValidEmail } from "@lib/br-documents"
import { sendAuthCodeEmail } from "@lib/email"
import { safeEqual } from "@lib/safe-equal"
import { AUTH_OTP_BY_ID_QUERY } from "@/sanity/queries"
import { writeClient } from "@/sanity/write-client"

const OTP_EXPIRATION_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

export function getOtpDocId(email: string): string {
  const hash = crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 24)
  return `authOtp.${hash}`
}

function hashCode(email: string, code: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${code.trim()}`)
    .digest("hex")
}

export async function requestOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.toLowerCase().trim()
  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: "Informe um e-mail válido." }
  }

  const code = crypto.randomInt(100000, 1000000).toString()
  const codeHash = hashCode(cleanEmail, code)
  const id = getOtpDocId(cleanEmail)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MS).toISOString()

  try {
    await writeClient.createOrReplace({
      _id: id,
      _type: "authOtp",
      email: cleanEmail,
      codeHash,
      expiresAt,
      attempts: 0,
      createdAt: now.toISOString(),
    })

    const sent = await sendAuthCodeEmail(cleanEmail, code)
    if (!sent) {
      console.warn(`[auth] Resend was not configured or failed to send to ${cleanEmail}. Dev code: ${code}`)
    }

    return { success: true }
  } catch (err) {
    console.error("[auth] Failed to generate OTP:", err)
    return { success: false, error: "Não foi possível enviar o código. Tente novamente." }
  }
}

export type VerifyOtpResult =
  | { success: true; email: string }
  | { success: false; error: string }

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const cleanEmail = email.toLowerCase().trim()
  const cleanCode = code.trim().replace(/\D/g, "")

  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, error: "O código deve ter 6 dígitos." }
  }

  const id = getOtpDocId(cleanEmail)
  const record = await writeClient.fetch(AUTH_OTP_BY_ID_QUERY, { id })

  if (!record || !record.codeHash || !record.expiresAt) {
    return { success: false, error: "Código não encontrado ou já utilizado. Solicite um novo." }
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    await writeClient.delete(id).catch(() => undefined)
    return { success: false, error: "Código expirado. Solicite um novo código." }
  }

  const attempts = record.attempts ?? 0
  if (attempts >= MAX_ATTEMPTS) {
    await writeClient.delete(id).catch(() => undefined)
    return { success: false, error: "Número máximo de tentativas excedido. Solicite um novo código." }
  }

  const expectedHash = hashCode(cleanEmail, cleanCode)
  if (!safeEqual(record.codeHash, expectedHash)) {
    await writeClient
      .patch(id)
      .inc({ attempts: 1 })
      .commit()
      .catch(() => undefined)
    const remaining = MAX_ATTEMPTS - (attempts + 1)
    return {
      success: false,
      error: remaining > 0 ? `Código incorreto. Você tem mais ${remaining} tentativa(s).` : "Código incorreto. Solicite um novo.",
    }
  }

  // Code is valid: delete the OTP record and return success.
  await writeClient.delete(id).catch(() => undefined)
  return { success: true, email: cleanEmail }
}
