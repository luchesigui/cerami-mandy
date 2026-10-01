import { NextRequest, NextResponse } from "next/server"

import {
  confirmPayment,
  expireIfOverdue,
  getOrder,
  hasOrderAccess,
  toPublicOrder,
} from "@lib/orders"
import { PaymentProviderError } from "@lib/payments/infinitepay"

const UUID = /^[0-9a-f-]{36}$/

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const search = req.nextUrl.searchParams
  const notFound = NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  if (!UUID.test(id)) return notFound

  let order = await getOrder(`order.${id}`)
  if (!order || !hasOrderAccess(order, search.get("t"))) return notFound

  // InfinitePay appends these to the redirect URL after a payment.
  const transactionNsu = search.get("transaction_nsu")
  const slug = search.get("slug")

  try {
    if (transactionNsu && slug) {
      order = await confirmPayment(order, {
        transactionNsu,
        slug,
        receiptUrl: search.get("receipt_url") ?? undefined,
      })
    }
  } catch (err) {
    // Keep showing the last known state; the webhook may still confirm it.
    if (!(err instanceof PaymentProviderError)) throw err
    console.error("[pedidos]", err.message)
  }

  order = await expireIfOverdue(order)
  return NextResponse.json(toPublicOrder(order))
}
