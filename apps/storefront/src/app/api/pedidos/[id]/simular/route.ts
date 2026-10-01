import { NextRequest, NextResponse } from "next/server"

import { getOrder, hasOrderAccess, refreshOrderStatus, toPublicOrder } from "@lib/orders"
import { isDevMode, simulatePixPayment } from "@lib/payments/abacatepay"

// Sandbox only: pays the Pix without a bank app.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = isDevMode() ? await getOrder(`order.${id}`) : null
  if (!order || !hasOrderAccess(order, req.nextUrl.searchParams.get("t"))) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  }
  if (!order.payment?.chargeId) {
    return NextResponse.json({ error: "Pedido sem cobrança." }, { status: 409 })
  }

  await simulatePixPayment(order.payment.chargeId)
  return NextResponse.json(toPublicOrder(await refreshOrderStatus(order)))
}
