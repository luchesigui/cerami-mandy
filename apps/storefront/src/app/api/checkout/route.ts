import { NextRequest, NextResponse } from "next/server"

import { createOrder, OrderError, parseCheckoutInput } from "@lib/orders"
import { isRateLimited } from "@lib/rate-limit"

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"

  // Limit checkout creations to 5 attempts per 10 minutes per IP to avoid reservation abuse.
  if (isRateLimited(`checkout:${ip}`, { windowMs: 10 * 60 * 1000, max: 5 })) {
    return NextResponse.json(
      {
        error:
          "Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.",
      },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

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
