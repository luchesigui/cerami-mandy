import { NextRequest, NextResponse } from "next/server"

import {
  getCustomerById,
  getCustomerOrders,
  updateCustomerProfile,
} from "@lib/auth/customer"
import { getSession } from "@lib/auth/session"
import { isValidCpf, isValidPhone, maskCpf, maskPhone } from "@lib/br-documents"
import { toPublicOrder } from "@lib/orders"
import { isValidCep, normalizeCep } from "@lib/shipping/cep"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const customer = await getCustomerById(session.customerId)
  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 })
  }

  const rawOrders = await getCustomerOrders(session.email)
  const orders = (rawOrders || []).map((o) => toPublicOrder(o as Parameters<typeof toPublicOrder>[0]))

  return NextResponse.json({
    customer: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cpf: customer.cpf,
      address: customer.address,
      hasPassword: Boolean(customer.hasPassword),
      createdAt: customer.createdAt,
    },
    orders,
  })
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  try {
    const body = await req.json()
    const name = typeof body?.name === "string" ? body.name.trim() : undefined
    const phone = typeof body?.phone === "string" ? body.phone.trim() : undefined
    const cpf = typeof body?.cpf === "string" ? body.cpf.trim() : undefined
    const address = body?.address

    const errors: string[] = []

    if (name !== undefined) {
      if (name.split(/\s+/).filter(Boolean).length < 2) {
        errors.push("Nome completo")
      }
    }

    if (phone !== undefined && phone.length > 0) {
      if (!isValidPhone(phone)) {
        errors.push("Telefone válido")
      }
    }

    if (cpf !== undefined && cpf.length > 0) {
      if (!isValidCpf(cpf)) {
        errors.push("CPF válido")
      }
    }

    if (address) {
      const cep = typeof address.cep === "string" ? normalizeCep(address.cep) : ""
      if (cep && !isValidCep(cep)) {
        errors.push("CEP válido")
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Confira os seguintes campos: ${errors.join(", ")}.` },
        { status: 400 }
      )
    }

    const updated = await updateCustomerProfile(session.customerId, {
      name,
      phone: phone ? maskPhone(phone) : phone,
      cpf: cpf ? maskCpf(cpf) : cpf,
      address: address
        ? {
            cep: address.cep ? normalizeCep(address.cep) : undefined,
            street: typeof address.street === "string" ? address.street.trim() : undefined,
            number: typeof address.number === "string" ? address.number.trim() : undefined,
            complement: typeof address.complement === "string" ? address.complement.trim() : undefined,
            neighborhood: typeof address.neighborhood === "string" ? address.neighborhood.trim() : undefined,
            city: typeof address.city === "string" ? address.city.trim() : undefined,
            state: typeof address.state === "string" ? address.state.trim().toUpperCase() : undefined,
          }
        : undefined,
    })

    return NextResponse.json({ ok: true, customer: updated })
  } catch (err) {
    console.error("[conta] update profile error:", err)
    return NextResponse.json({ error: "Não foi possível atualizar os dados agora." }, { status: 500 })
  }
}
