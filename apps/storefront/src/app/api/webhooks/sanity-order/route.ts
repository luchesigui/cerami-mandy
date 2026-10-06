import { NextRequest, NextResponse } from "next/server"

import { notifyOrderShipped } from "@lib/orders"
import { safeEqual } from "@lib/safe-equal"

export async function POST(req: NextRequest) {
  const expectedSecret =
    process.env.SANITY_WEBHOOK_SECRET || process.env.INFINITEPAY_WEBHOOK_SECRET

  const searchSecret = req.nextUrl.searchParams.get("secret")
  const headerSecret =
    req.headers.get("x-sanity-secret") ||
    req.headers.get("sanity-webhook-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")

  const providedSecret = searchSecret || headerSecret

  if (
    !expectedSecret ||
    !providedSecret ||
    !safeEqual(providedSecret, expectedSecret)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as {
    _id?: string
    _type?: string
    documentId?: string
    orderId?: string
    number?: string
    status?: string
    force?: boolean
    toEmail?: string
  } | null

  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const rawId = body._id || body.documentId || body.orderId || body.number
  if (!rawId) {
    return NextResponse.json(
      { error: "Order identifier missing" },
      { status: 400 }
    )
  }

  // Ignore draft edits until published
  if (rawId.startsWith("drafts.")) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Draft document ignored",
    })
  }

  try {
    const result = await notifyOrderShipped(rawId, {
      force: !!body.force,
      toEmail: body.toEmail?.trim() || undefined,
    })
    return NextResponse.json({ ok: result.success, ...result })
  } catch (err) {
    console.error(
      "[webhooks/sanity-order] error processing order shipment:",
      err
    )
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    )
  }
}
