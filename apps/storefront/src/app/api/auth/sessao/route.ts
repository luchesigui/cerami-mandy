import { NextResponse } from "next/server"

import { getCustomerById } from "@lib/auth/customer"
import { getSession } from "@lib/auth/session"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ authenticated: false, customer: null })
  }

  const customer = await getCustomerById(session.customerId)
  if (!customer) {
    return NextResponse.json({ authenticated: false, customer: null })
  }

  return NextResponse.json({
    authenticated: true,
    customer: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cpf: customer.cpf,
      address: customer.address,
    },
  })
}
