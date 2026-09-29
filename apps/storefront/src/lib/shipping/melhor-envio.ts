import "server-only"

import type { ShippingOption } from "./types"

export type ShippingPackage = {
  id: string
  weightGrams: number
  heightCm: number
  widthCm: number
  lengthCm: number
  price: number
}

type MelhorEnvioQuote = {
  id: number
  name: string
  price?: string
  custom_price?: string
  delivery_time?: number
  custom_delivery_time?: number
  error?: string
  company?: { name?: string; picture?: string }
}

export class ShippingQuoteError extends Error {}

const BASE_URLS = {
  sandbox: "https://sandbox.melhorenvio.com.br",
  production: "https://melhorenvio.com.br",
} as const

const getConfig = () => {
  const token = process.env.MELHOR_ENVIO_TOKEN
  const originCep = process.env.SHIPPING_ORIGIN_CEP?.replace(/\D/g, "")
  const userAgent = process.env.MELHOR_ENVIO_USER_AGENT

  if (!token || !originCep || !userAgent) {
    throw new ShippingQuoteError(
      "MELHOR_ENVIO_TOKEN, MELHOR_ENVIO_USER_AGENT and SHIPPING_ORIGIN_CEP must be set"
    )
  }

  const env =
    process.env.MELHOR_ENVIO_ENV === "production" ? "production" : "sandbox"

  return { token, originCep, userAgent, baseUrl: BASE_URLS[env] }
}

export async function quoteShipping({
  toCep,
  packages,
}: {
  toCep: string
  packages: ShippingPackage[]
}): Promise<ShippingOption[]> {
  const { token, originCep, userAgent, baseUrl } = getConfig()

  const res = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
    },
    body: JSON.stringify({
      from: { postal_code: originCep },
      to: { postal_code: toCep },
      products: packages.map((pkg) => ({
        id: pkg.id,
        width: pkg.widthCm,
        height: pkg.heightCm,
        length: pkg.lengthCm,
        weight: pkg.weightGrams / 1000,
        insurance_value: pkg.price,
        quantity: 1,
      })),
      options: { receipt: false, own_hand: false },
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new ShippingQuoteError(
      `Melhor Envio responded ${res.status}: ${await res.text()}`
    )
  }

  const quotes = (await res.json()) as MelhorEnvioQuote[]

  return quotes
    .filter((quote) => !quote.error && (quote.custom_price ?? quote.price))
    .map((quote) => ({
      id: quote.id,
      name: quote.name,
      company: quote.company?.name ?? "",
      companyLogo: quote.company?.picture ?? null,
      price: Number(quote.custom_price ?? quote.price),
      deliveryDays: quote.custom_delivery_time ?? quote.delivery_time ?? 0,
    }))
    .sort((a, b) => a.price - b.price)
}
