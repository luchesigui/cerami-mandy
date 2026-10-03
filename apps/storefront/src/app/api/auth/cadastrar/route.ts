import { NextRequest, NextResponse } from "next/server"

import { isValidEmail } from "@lib/br-documents"
import {
  createCustomerWithPassword,
  getCustomerAuthByEmail,
} from "@lib/auth/customer"
import { isValidPassword } from "@lib/auth/password"
import { setSessionCookie } from "@lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string
      email?: string
      password?: string
    }

    const name = body?.name?.trim()
    const email = body?.email?.toLowerCase().trim()
    const password = body?.password

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
