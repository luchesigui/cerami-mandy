import { NextRequest, NextResponse } from "next/server"

import { createOrder, OrderError, parseCheckoutInput } from "@lib/orders"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  try {
    const input = parseCheckoutInput(body)
    const { orderId, accessToken } = await createOrder(input)
    return NextResponse.json({
      orderId: orderId.replace(/^order\./, ""),
      accessToken,
    })
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("[checkout]", err)
    return NextResponse.json(
      { error: "Não foi possível finalizar o pedido. Tente novamente." },
      { status: 500 }
    )
  }
}
