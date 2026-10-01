import { NextRequest, NextResponse } from "next/server"

import { isValidCep, normalizeCep } from "@lib/shipping/cep"
import {
  quoteShipping,
  ShippingQuoteError,
  type ShippingPackage,
} from "@lib/shipping/melhor-envio"
import { LOCAL_PICKUP_OPTION } from "@lib/shipping/types"
import { BAG_PRODUCTS_QUERY } from "@/sanity/queries"
import { serverClient } from "@/sanity/server-client"

const MAX_ITEMS = 20

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    cep?: unknown
    productIds?: unknown
  } | null

  const cep = typeof body?.cep === "string" ? normalizeCep(body.cep) : ""
  const productIds = Array.isArray(body?.productIds)
    ? body.productIds.filter(
        (id, index, all): id is string =>
          typeof id === "string" && all.indexOf(id) === index
      )
    : []

  if (!isValidCep(cep)) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 })
  }

  if (!productIds.length || productIds.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: "Sacola vazia ou com itens demais." },
      { status: 400 }
    )
  }

  const products = await serverClient.fetch(BAG_PRODUCTS_QUERY, {
    ids: productIds,
  })

  const packages: ShippingPackage[] = []
  for (const id of productIds) {
    const product = products.find((p) => p._id === id)
    const shipping = product?.shipping

    if (!product?.available || !product.price) {
      return NextResponse.json(
        {
          error: "Uma das peças da sacola não está mais disponível.",
          productId: id,
        },
        { status: 409 }
      )
    }

    if (
      !shipping?.weightGrams ||
      !shipping.heightCm ||
      !shipping.widthCm ||
      !shipping.lengthCm
    ) {
      console.error("[frete] missing packaging measurements for", id)
      return NextResponse.json(
        {
          error: `Não conseguimos calcular o frete de "${product.title}". Fale com a gente pelo Instagram.`,
          productId: id,
        },
        { status: 422 }
      )
    }

    packages.push({
      id,
      price: product.price,
      weightGrams: shipping.weightGrams,
      heightCm: shipping.heightCm,
      widthCm: shipping.widthCm,
      lengthCm: shipping.lengthCm,
    })
  }

  try {
    const carrierOptions = await quoteShipping({ toCep: cep, packages })
    return NextResponse.json({
      options: [LOCAL_PICKUP_OPTION, ...carrierOptions],
    })
  } catch (err) {
    if (!(err instanceof ShippingQuoteError)) throw err
    console.error("[frete]", err.message)
    return NextResponse.json({
      options: [LOCAL_PICKUP_OPTION],
      warning:
        "Não foi possível calcular o frete das transportadoras. A retirada no local continua disponível.",
    })
  }
}
