import { NextRequest, NextResponse } from "next/server"

import { isValidEmail } from "@lib/br-documents"
import { getOrCreateCustomer } from "@lib/auth/customer"
import { verifyOtp } from "@lib/auth/otp"
import { setSessionCookie } from "@lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; code?: string }
    const email = body?.email?.toLowerCase().trim()
    const code = body?.code?.trim()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 })
    }

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Informe o código de 6 dígitos." }, { status: 400 })
    }

    const verification = await verifyOtp(email, code)
    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: 400 })
    }

    // Get existing customer or create a new customer record
    const customer = await getOrCreateCustomer({
      email,
      name: email.split("@")[0],
    })

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
        phone: customer.phone,
        cpf: customer.cpf,
        address: customer.address,
      },
    })
  } catch (err) {
    console.error("[auth] verify-otp route error:", err)
    return NextResponse.json({ error: "Não foi possível verificar o código agora." }, { status: 500 })
  }
}
