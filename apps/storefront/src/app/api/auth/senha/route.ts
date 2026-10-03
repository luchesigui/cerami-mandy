import { NextRequest, NextResponse } from "next/server"

import {
  getCustomerAuthByEmail,
  setCustomerPassword,
} from "@lib/auth/customer"
import { isValidPassword, verifyPassword } from "@lib/auth/password"
import { getSession } from "@lib/auth/session"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  try {
    const body = (await req.json()) as {
      currentPassword?: string
      newPassword?: string
    }

    const { currentPassword, newPassword } = body

    if (!newPassword || !isValidPassword(newPassword)) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      )
    }

    const customerAuth = await getCustomerAuthByEmail(session.email)
    if (!customerAuth) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 })
    }

    // If customer already has a password, verify current password
    if (customerAuth.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Informe a sua senha atual." },
          { status: 400 }
        )
      }
      if (!verifyPassword(currentPassword, customerAuth.passwordHash)) {
        return NextResponse.json(
          { error: "Senha atual incorreta." },
          { status: 400 }
        )
      }
    }

    await setCustomerPassword(session.customerId, newPassword)

    return NextResponse.json({
      ok: true,
      message: customerAuth.passwordHash
        ? "Senha alterada com sucesso."
        : "Senha cadastrada com sucesso.",
    })
  } catch (err) {
    console.error("[auth] senha route error:", err)
    return NextResponse.json(
      { error: "Não foi possível atualizar a senha agora." },
      { status: 500 }
    )
  }
}
