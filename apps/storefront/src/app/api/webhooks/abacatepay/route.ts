import { NextRequest, NextResponse } from "next/server"

import { getOrderByCharge, refreshOrderStatus } from "@lib/orders"
import { findChargeId, verifyWebhook } from "@lib/payments/abacatepay"

const HANDLED_EVENTS = new Set(["transparent.completed"])

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const valid = verifyWebhook({
    rawBody,
    signature: req.headers.get("x-webhook-signature"),
    secret: req.nextUrl.searchParams.get("webhookSecret"),
  })
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as { id?: string; event?: string; data?: unknown }
  if (!event.event || !HANDLED_EVENTS.has(event.event)) {
    return NextResponse.json({ received: true })
  }

  const chargeId = findChargeId(event.data)
  const order = chargeId ? await getOrderByCharge(chargeId) : null
  if (!order) {
    console.warn(`[webhook] ${event.event} ${event.id}: no order for charge ${chargeId}`)
    return NextResponse.json({ received: true })
  }

  // The payload is only a hint; the charge status from the API is the source of truth.
  await refreshOrderStatus(order, event.id)
  return NextResponse.json({ received: true })
}
