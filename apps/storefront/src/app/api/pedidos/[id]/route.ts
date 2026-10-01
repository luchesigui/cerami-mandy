import { NextRequest, NextResponse } from "next/server"

import {
  getOrder,
  hasOrderAccess,
  refreshOrderStatus,
  toPublicOrder,
} from "@lib/orders"
import { PaymentProviderError } from "@lib/payments/abacatepay"

const UUID = /^[0-9a-f-]{36}$/

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const notFound = NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  if (!UUID.test(id)) return notFound

  let order = await getOrder(`order.${id}`)
  if (!order || !hasOrderAccess(order, req.nextUrl.searchParams.get("t"))) {
    return notFound
  }

  try {
    order = await refreshOrderStatus(order)
  } catch (err) {
    // Keep showing the last known state if the provider is unreachable.
    if (!(err instanceof PaymentProviderError)) throw err
    console.error("[pedidos]", err.message)
  }

  return NextResponse.json(toPublicOrder(order))
}
