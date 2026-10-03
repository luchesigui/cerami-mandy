import { NextRequest, NextResponse } from "next/server"

import { generateShipmentForOrder, getOrder, type Order } from "@lib/orders"
import { safeEqual } from "@lib/safe-equal"
import { writeClient } from "@/sanity/write-client"

const UUID = /^[0-9a-f-]{36}$/

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const secret = req.nextUrl.searchParams.get("secret")
  const token = req.nextUrl.searchParams.get("t")
  const expectedSecret = process.env.INFINITEPAY_WEBHOOK_SECRET

  let order: Order | null = null
  if (UUID.test(id)) {
    order = await getOrder(`order.${id}`)
  } else if (id.startsWith("CM-")) {
    order = await writeClient.fetch<Order | null>(
      `*[_type == "order" && number == $id][0]{
        _id,
        _rev,
        number,
        status,
        trackingCode,
        conflictNote,
        accessToken,
        customer,
        address,
        items[] { "productId": product._ref, title, price },
        shipping,
        subtotal,
        shippingTotal,
        total,
        payment,
        processedEvents,
        createdAt
      }`,
      { id }
    )
  }

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  }

  const isSecretValid =
    expectedSecret && secret ? safeEqual(secret, expectedSecret) : false
  const isTokenValid =
    token && order.accessToken ? safeEqual(token, order.accessToken) : false

  if (!isSecretValid && !isTokenValid) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  try {
    const result = await generateShipmentForOrder(order)
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    console.error("[api/etiqueta] failed to generate shipment:", err)
    return NextResponse.json(
      { error: (err as Error).message || "Falha ao gerar etiqueta." },
      { status: 500 }
    )
  }
}
