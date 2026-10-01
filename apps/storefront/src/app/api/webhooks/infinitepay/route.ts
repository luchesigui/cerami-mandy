import { NextRequest, NextResponse } from "next/server"

import { confirmPayment, getOrder } from "@lib/orders"
import { PaymentProviderError } from "@lib/payments/infinitepay"
import { safeEqual } from "@lib/safe-equal"

const UUID = /^[0-9a-f-]{36}$/

// InfinitePay does not sign webhooks: the URL carries our secret, and the payment is
// confirmed through payment_check before anything changes.
export async function POST(req: NextRequest) {
  const expected = process.env.INFINITEPAY_WEBHOOK_SECRET
  const secret = req.nextUrl.searchParams.get("secret")
  if (!expected || !secret || !safeEqual(secret, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const event = (await req.json().catch(() => null)) as {
    order_nsu?: string
    transaction_nsu?: string
    invoice_slug?: string
    receipt_url?: string
  } | null

  const orderNsu = event?.order_nsu ?? ""
  const order = UUID.test(orderNsu) ? await getOrder(`order.${orderNsu}`) : null
  if (!order || !event?.transaction_nsu || !event.invoice_slug) {
    console.warn("[webhook] ignored infinitepay event for order", orderNsu)
    return NextResponse.json({ received: true })
  }

  try {
    await confirmPayment(order, {
      transactionNsu: event.transaction_nsu,
      slug: event.invoice_slug,
      receiptUrl: event.receipt_url,
    })
  } catch (err) {
    if (!(err instanceof PaymentProviderError)) throw err
    console.error("[webhook]", err.message)
    // 400 asks InfinitePay to retry later.
    return NextResponse.json({ error: "retry" }, { status: 400 })
  }

  return NextResponse.json({ received: true })
}
