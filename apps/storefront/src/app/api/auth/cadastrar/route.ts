import { NextRequest, NextResponse } from "next/server"

import { isValidEmail } from "@lib/br-documents"
import {
  createCustomerWithPassword,
  getCustomerAuthByEmail,
} from "@lib/auth/customer"
import { requestOtp, verifyOtp } from "@lib/auth/otp"
import { isValidPassword } from "@lib/auth/password"
import { setSessionCookie } from "@lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string
      email?: string
      password?: string
      code?: string
    }

    const name = body?.name?.trim()
    const email = body?.email?.toLowerCase().trim()
    const password = body?.password
    const code = body?.code?.trim()

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Informe seu nome completo." }, { status: 400 })
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 })
    }

    if (!password || !isValidPassword(password)) {
      return NextResponse.json(
        { error: "A senha deve conter no mínimo 6 caracteres." },
        { status: 400 }
      )
    }

    const existingAuth = await getCustomerAuthByEmail(email)
    if (existingAuth && existingAuth.passwordHash) {
      return NextResponse.json(
        {
          error: "Este e-mail já possui uma conta com senha. Faça login com sua senha.",
          hasPassword: true,
        },
        { status: 400 }
      )
    }

    // Step 1: Send verification code to email if code not provided
    if (!code) {
      const otpRes = await requestOtp(email, { type: "signup", name })
      if (!otpRes.success) {
        return NextResponse.json(
          { error: otpRes.error ?? "Não foi possível enviar o código de validação." },
          { status: 400 }
        )
      }

      return NextResponse.json({
        ok: true,
        step: "verify_code",
      })
    }

    // Step 2: Validate verification code
    const cleanCode = code.replace(/\D/g, "")
    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { error: "Informe o código de 6 dígitos enviado para seu e-mail." },
        { status: 400 }
      )
    }

    const verification = await verifyOtp(email, cleanCode)
    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: 400 })
    }

    // Create or link customer with validated email and password
    const customer = await createCustomerWithPassword({
      name,
      email,
      password,
    })

    await setSessionCookie({
      customerId: customer._id,
      email: customer.email ?? email,
      name: customer.name ?? name,
    })

    return NextResponse.json({
      ok: true,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    })
  } catch (err) {
    console.error("[auth] cadastrar route error:", err)
    return NextResponse.json(
      { error: "Não foi possível criar sua conta agora. Tente novamente." },
      { status: 500 }
    )
  }
}
