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

  console.info(
    `[shipping] Melhor Envio env: "${env}" (MELHOR_ENVIO_ENV="${process.env.MELHOR_ENVIO_ENV}"), baseUrl: ${BASE_URLS[env]}, originCep: ${originCep.slice(0, 5)}***`
  )

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

export type MelhorEnvioSender = {
  name: string
  phone: string
  email: string
  document: string
  company_document: string | null
  state_register: string
  address: string
  complement: string
  number: string
  district: string
  city: string
  state_abbr: string
  country_id: string
  postal_code: string
}

let cachedSender: MelhorEnvioSender | null = null

export async function getSenderInfo(): Promise<MelhorEnvioSender> {
  if (cachedSender) return cachedSender

  const { token, userAgent, baseUrl, originCep } = getConfig()

  // Allow explicit override via environment variables
  if (
    process.env.SHIPPING_SENDER_NAME &&
    process.env.SHIPPING_SENDER_DOCUMENT &&
    process.env.SHIPPING_SENDER_PHONE &&
    process.env.SHIPPING_SENDER_ADDRESS &&
    process.env.SHIPPING_SENDER_NUMBER &&
    process.env.SHIPPING_SENDER_CITY &&
    process.env.SHIPPING_SENDER_STATE
  ) {
    cachedSender = {
      name: process.env.SHIPPING_SENDER_NAME,
      phone: process.env.SHIPPING_SENDER_PHONE.replace(/\D/g, ""),
      email: process.env.SHIPPING_SENDER_EMAIL || process.env.STORE_NOTIFICATION_EMAIL || "contato@ceramimandy.com.br",
      document: process.env.SHIPPING_SENDER_DOCUMENT.replace(/\D/g, ""),
      company_document: process.env.SHIPPING_SENDER_CNPJ?.replace(/\D/g, "") || null,
      state_register: process.env.SHIPPING_SENDER_IE || "ISENTO",
      address: process.env.SHIPPING_SENDER_ADDRESS,
      complement: process.env.SHIPPING_SENDER_COMPLEMENT || "",
      number: process.env.SHIPPING_SENDER_NUMBER,
      district: process.env.SHIPPING_SENDER_NEIGHBORHOOD || "",
      city: process.env.SHIPPING_SENDER_CITY,
      state_abbr: process.env.SHIPPING_SENDER_STATE,
      country_id: "BR",
      postal_code: originCep,
    }
    return cachedSender
  }

  // Fetch account profile & default address from Melhor Envio
  const [meRes, addrRes] = await Promise.all([
    fetch(`${baseUrl}/api/v2/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "User-Agent": userAgent },
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/v2/me/addresses`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "User-Agent": userAgent },
      cache: "no-store",
    }),
  ])

  if (!meRes.ok || !addrRes.ok) {
    throw new ShippingQuoteError(
      `Failed to load sender info from Melhor Envio: profile ${meRes.status}, address ${addrRes.status}`
    )
  }

  const me = (await meRes.json()) as {
    firstname?: string
    lastname?: string
    name?: string
    email?: string
    document?: string
    phone?: { area_code?: string; phone?: string }
  }
  const addrData = (await addrRes.json()) as {
    data?: Array<{
      address: string
      number: string
      complement?: string
      district?: string
      postal_code?: string
      city?: { city?: string; state?: { state_abbr?: string } }
    }>
  }
  const addr = Array.isArray(addrData?.data) ? addrData.data[0] : null

  if (!addr) {
    throw new ShippingQuoteError("No registered sender address found in Melhor Envio account")
  }

  const fullName = `${me.firstname || ""} ${me.lastname || ""}`.trim() || me.name || "Cerami Mandy"
  const phone = me.phone
    ? `${me.phone.area_code || ""}${me.phone.phone || ""}`.replace(/\D/g, "")
    : "19999999999"
  const doc = me.document ? me.document.replace(/\D/g, "") : ""

  cachedSender = {
    name: fullName,
    phone,
    email: me.email || "contato@ceramimandy.com.br",
    document: doc,
    company_document: null,
    state_register: "ISENTO",
    address: addr.address,
    complement: addr.complement || "",
    number: addr.number,
    district: addr.district || "",
    city: addr.city?.city || "",
    state_abbr: addr.city?.state?.state_abbr || "SP",
    country_id: "BR",
    postal_code: (addr.postal_code || originCep).replace(/\D/g, ""),
  }

  return cachedSender
}

export type ShipmentRecipient = {
  name: string
  phone: string
  email: string
  document: string
  address: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
  postalCode: string
}

export type CreateShipmentInput = {
  serviceId: number
  recipient: ShipmentRecipient
  packages: ShippingPackage[]
  items: Array<{ title: string; price: number }>
  insuranceValue?: number
}

export async function createShipmentCart(input: CreateShipmentInput) {
  const { token, userAgent, baseUrl } = getConfig()
  const from = await getSenderInfo()

  const cleanDoc = input.recipient.document.replace(/\D/g, "")
  const isCnpj = cleanDoc.length > 11

  const payload = {
    service: input.serviceId,
    from,
    to: {
      name: input.recipient.name.trim(),
      phone: input.recipient.phone.replace(/\D/g, ""),
      email: input.recipient.email.trim(),
      document: isCnpj ? "" : cleanDoc,
      company_document: isCnpj ? cleanDoc : null,
      state_register: "ISENTO",
      address: input.recipient.address.trim(),
      complement: input.recipient.complement?.trim() || "",
      number: input.recipient.number.trim(),
      district: input.recipient.district.trim(),
      city: input.recipient.city.trim(),
      state_abbr: input.recipient.state.trim().toUpperCase(),
      country_id: "BR",
      postal_code: input.recipient.postalCode.replace(/\D/g, ""),
    },
    products: input.items.map((item) => ({
      name:
        item.title.replace(/[^\w\sÀ-ÿ.,'-]/gi, "").trim().slice(0, 100) ||
        "Peca de ceramica",
      quantity: 1,
      unitary_value: item.price,
    })),
    volumes: input.packages.map((pkg) => ({
      height: pkg.heightCm,
      width: pkg.widthCm,
      length: pkg.lengthCm,
      weight: pkg.weightGrams / 1000,
    })),
    options: {
      insurance_value: input.insuranceValue ?? input.items.reduce((acc, i) => acc + i.price, 0),
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: true,
    },
  }

  const res = await fetch(`${baseUrl}/api/v2/me/cart`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new ShippingQuoteError(`Melhor Envio cart creation failed (${res.status}): ${errText}`)
  }

  const data = (await res.json()) as { id: string; protocol: string; price: number }
  return data
}

export type ShipmentResult = {
  cartId: string
  status: "paid" | "pending"
  labelUrl?: string
  trackingCode?: string
}

export async function checkoutAndGenerateShipment(cartId: string): Promise<ShipmentResult> {
  const { token, userAgent, baseUrl } = getConfig()

  // 1. Try checkout using account balance
  const checkoutRes = await fetch(`${baseUrl}/api/v2/me/shipment/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify({ orders: [cartId] }),
    cache: "no-store",
  })

  if (!checkoutRes.ok) {
    const errText = await checkoutRes.text()
    console.warn(
      `[shipping] Checkout for cart ${cartId} failed (${checkoutRes.status}): ${errText}. Item remains in Melhor Envio cart for manual payment.`
    )
    return { cartId, status: "pending" }
  }

  const checkoutData = (await checkoutRes.json().catch(() => null)) as { purchase?: { status?: string } } | null
  if (checkoutData?.purchase?.status !== "paid") {
    console.info(
      `[shipping] Cart ${cartId} checked out with status ${checkoutData?.purchase?.status}, waiting payment in dashboard.`
    )
    return { cartId, status: "pending" }
  }

  // 2. Generate label
  await fetch(`${baseUrl}/api/v2/me/shipment/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify({ orders: [cartId] }),
    cache: "no-store",
  }).catch((err) => console.error("[shipping] generate error:", err))

  // 3. Get print URL
  let labelUrl: string | undefined
  const printRes = await fetch(`${baseUrl}/api/v2/me/shipment/print`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify({ mode: "private", orders: [cartId] }),
    cache: "no-store",
  }).catch(() => null)

  if (printRes?.ok) {
    const printData = (await printRes.json().catch(() => null)) as { url?: string } | null
    if (printData?.url) labelUrl = printData.url
  }

  // 4. Try to fetch tracking code
  let trackingCode: string | undefined
  const orderRes = await fetch(`${baseUrl}/api/v2/me/orders/${cartId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    cache: "no-store",
  }).catch(() => null)

  if (orderRes?.ok) {
    const orderData = (await orderRes.json().catch(() => null)) as { tracking?: string; self_tracking?: string } | null
    trackingCode = orderData?.self_tracking || orderData?.tracking || undefined
  }

  return {
    cartId,
    status: "paid",
    labelUrl,
    trackingCode,
  }
}

