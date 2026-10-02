import { NextRequest, NextResponse } from "next/server"

import { isValidEmail } from "@lib/br-documents"
import { requestOtp } from "@lib/auth/otp"
import { isRateLimited } from "@lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string }
    const email = body?.email?.toLowerCase().trim()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 })
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "ip"
    if (isRateLimited(`otp-req:${email}:${ip}`, { windowMs: 10 * 60 * 1000, max: 4 })) {
      return NextResponse.json(
        { error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente." },
        { status: 429 }
      )
    }

    const result = await requestOtp(email)
    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Erro ao enviar o código." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[auth] request-otp route error:", err)
    return NextResponse.json({ error: "Não foi possível enviar o código agora." }, { status: 500 })
  }
}
