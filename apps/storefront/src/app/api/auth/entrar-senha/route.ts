import { NextRequest, NextResponse } from "next/server"

import { isValidEmail } from "@lib/br-documents"
import { verifyCustomerCredentials } from "@lib/auth/customer"
import { setSessionCookie } from "@lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string }
    const email = body?.email?.toLowerCase().trim()
    const password = body?.password

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 })
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Informe a sua senha." }, { status: 400 })
    }

    const result = await verifyCustomerCredentials(email, password)
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          needsPasswordSetup: result.needsPasswordSetup ?? false,
          notFound: result.notFound ?? false,
        },
        { status: 400 }
      )
    }

    const { customer } = result
    await setSessionCookie({
      customerId: customer._id,
      email: customer.email ?? email,
      name: customer.name ?? undefined,
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
    console.error("[auth] entrar-senha route error:", err)
    return NextResponse.json(
      { error: "Não foi possível realizar o login agora. Tente novamente." },
      { status: 500 }
    )
  }
}
