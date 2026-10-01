import { NextRequest, NextResponse } from "next/server"

import { canPay, getOrder, hasOrderAccess } from "@lib/orders"

const UUID = /^[0-9a-f-]{36}$/

// The InfinitePay link never expires, so customers only reach it through here,
// and only while the reservation is valid.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get("t")
  const back = req.nextUrl.searchParams.get("back") ?? ""
  const order = UUID.test(id) ? await getOrder(`order.${id}`) : null

  if (!order || !hasOrderAccess(order, token)) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  }

  if (canPay(order) && order.payment?.checkoutUrl) {
    return NextResponse.redirect(order.payment.checkoutUrl, 303)
  }

  // Expired or already paid: back to the order page, which explains the state.
  const orderPage = /^\/pedido\/[0-9a-f-]{36}$/.test(back)
    ? back
    : `/pedido/${id}`
  return NextResponse.redirect(
    new URL(`${orderPage}?t=${encodeURIComponent(token ?? "")}`, req.nextUrl.origin),
    303
  )
}
