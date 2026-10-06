import { NextRequest, NextResponse } from "next/server"

import { notifyOrderShipped } from "@lib/orders"

export async function POST(req: NextRequest) {
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
