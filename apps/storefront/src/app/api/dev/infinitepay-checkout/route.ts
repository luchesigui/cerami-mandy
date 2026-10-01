import crypto from "node:crypto"

import { NextRequest, NextResponse } from "next/server"

import { isMockMode, MOCK_PREFIX } from "@lib/payments/infinitepay"

// Stands in for the InfinitePay checkout page in mock mode: the payment succeeds
// immediately and the customer is sent back with the params InfinitePay appends.
export async function GET(req: NextRequest) {
  if (!isMockMode()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const search = req.nextUrl.searchParams
  const amount = Number(search.get("amount"))
  const redirect = new URL(search.get("redirect") ?? "/", req.nextUrl.origin)
  if (redirect.origin !== req.nextUrl.origin || !Number.isInteger(amount)) {
    return NextResponse.json({ error: "Invalid mock checkout" }, { status: 400 })
  }

  redirect.searchParams.set("transaction_nsu", `${MOCK_PREFIX}${crypto.randomUUID()}`)
  redirect.searchParams.set("slug", `${MOCK_PREFIX}${amount}`)
  redirect.searchParams.set("capture_method", "pix")
  return NextResponse.redirect(redirect, 303)
}
