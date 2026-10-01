import "server-only"

import crypto from "node:crypto"

import {
  BR_STATES,
  isValidCpf,
  isValidEmail,
  isValidPhone,
  maskCpf,
  maskPhone,
} from "@lib/br-documents"
import {
  checkPixCharge,
  createPixCharge,
  PaymentProviderError,
} from "@lib/payments/abacatepay"
import { safeEqual } from "@lib/safe-equal"
import { isValidCep, normalizeCep } from "@lib/shipping/cep"
import {
  quoteShipping,
  ShippingQuoteError,
  type ShippingPackage,
} from "@lib/shipping/melhor-envio"
import {
  BAG_PRODUCTS_QUERY,
  ORDER_BY_CHARGE_QUERY,
  ORDER_BY_ID_QUERY,
} from "@/sanity/queries"
import { serverClient } from "@/sanity/server-client"
import { writeClient } from "@/sanity/write-client"

import type { ORDER_BY_ID_QUERY_RESULT } from "../../../sanity.types"

export type Order = NonNullable<ORDER_BY_ID_QUERY_RESULT>

const PIX_EXPIRES_IN_SECONDS = 30 * 60
// The reservation outlives the Pix so nobody can reserve a piece that can still be paid.
const RESERVATION_GRACE_MS = 5 * 60 * 1000
const COUNTER_ID = "order.counter"
const FIRST_ORDER_NUMBER = 1001

export class OrderError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
  }
}

export type CheckoutInput = {
  customer: { name: string; email: string; phone: string; cpf: string }
  address: {
    cep: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
  }
  productIds: string[]
  shippingServiceId: number
}

const str = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : ""

export function parseCheckoutInput(body: unknown): CheckoutInput {
  const b = (body ?? {}) as Record<string, Record<string, unknown> | unknown>
  const c = (b.customer ?? {}) as Record<string, unknown>
  const a = (b.address ?? {}) as Record<string, unknown>

  const input: CheckoutInput = {
    customer: {
      name: str(c.name),
      email: str(c.email).toLowerCase(),
      phone: str(c.phone, 30),
      cpf: str(c.cpf, 20),
    },
    address: {
      cep: normalizeCep(str(a.cep, 12)),
      street: str(a.street),
      number: str(a.number, 20),
      complement: str(a.complement) || undefined,
      neighborhood: str(a.neighborhood),
      city: str(a.city),
      state: str(a.state, 2).toUpperCase(),
    },
    productIds: Array.isArray(b.productIds)
      ? b.productIds.filter(
          (id, index, all): id is string =>
            typeof id === "string" && all.indexOf(id) === index
        )
      : [],
    shippingServiceId: Number(b.shippingServiceId),
  }

  const problems = [
    input.customer.name.split(/\s+/).length < 2 && "nome completo",
    !isValidEmail(input.customer.email) && "e-mail",
    !isValidPhone(input.customer.phone) && "telefone",
    !isValidCpf(input.customer.cpf) && "CPF",
    !isValidCep(input.address.cep) && "CEP",
    !input.address.street && "rua",
    !input.address.number && "número",
    !input.address.neighborhood && "bairro",
    !input.address.city && "cidade",
    !BR_STATES.includes(input.address.state) && "UF",
    (!input.productIds.length || input.productIds.length > 20) && "peças",
    !Number.isInteger(input.shippingServiceId) && "frete",
  ].filter(Boolean)

  if (problems.length) {
    throw new OrderError(`Confira: ${problems.join(", ")}.`, 400)
  }

  return input
}

const toCents = (value: number) => Math.round(value * 100)

async function nextOrderNumber() {
  const result = await writeClient
    .transaction()
    .createIfNotExists({
      _id: COUNTER_ID,
      _type: "orderCounter",
      value: FIRST_ORDER_NUMBER - 1,
    })
    .patch(COUNTER_ID, (patch) => patch.inc({ value: 1 }))
    .commit({ returnDocuments: true })

  const counter = result.find((doc) => doc._id === COUNTER_ID) as
    | { value?: number }
    | undefined
  return `CM-${counter?.value ?? FIRST_ORDER_NUMBER}`
}

// A draft published after a checkout write would overwrite it, so drafts get the same patch.
async function existingDrafts(ids: string[]) {
  if (!ids.length) return new Set<string>()
  const found = await writeClient.fetch<string[]>(`*[_id in $ids]._id`, {
    ids: ids.map((id) => `drafts.${id}`),
  })
  return new Set(found)
}

export async function createOrder(input: CheckoutInput) {
  const products = await serverClient.fetch(BAG_PRODUCTS_QUERY, {
    ids: input.productIds,
  })

  const packages: ShippingPackage[] = []
  const items = input.productIds.map((id) => {
    const product = products.find((p) => p._id === id)
    if (!product?.available || !product.price) {
      throw new OrderError(
        product?.reserved
          ? `"${product.title}" acabou de ser reservada por outra pessoa.`
          : "Uma das peças da sacola não está mais disponível.",
        409
      )
    }
    const shipping = product.shipping
    if (
      !shipping?.weightGrams ||
      !shipping.heightCm ||
      !shipping.widthCm ||
      !shipping.lengthCm
    ) {
      throw new OrderError(
        `Não conseguimos calcular o frete de "${product.title}".`,
        422
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
    return { id, rev: product._rev, title: product.title ?? "", price: product.price }
  })

  let shippingOption
  try {
    const options = await quoteShipping({ toCep: input.address.cep, packages })
    shippingOption = options.find((o) => o.id === input.shippingServiceId)
  } catch (err) {
    if (err instanceof ShippingQuoteError) {
      console.error("[checkout] shipping quote failed:", err.message)
      throw new OrderError("Não foi possível confirmar o frete. Tente novamente.", 502)
    }
    throw err
  }
  if (!shippingOption) {
    throw new OrderError("O frete mudou. Escolha a opção de entrega de novo.", 409)
  }

  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const total = (toCents(subtotal) + toCents(shippingOption.price)) / 100
  const orderId = `order.${crypto.randomUUID()}`
  const accessToken = crypto.randomBytes(24).toString("base64url")
  const number = await nextOrderNumber()
  const now = new Date()
  const reservedUntil = new Date(
    now.getTime() + PIX_EXPIRES_IN_SECONDS * 1000 + RESERVATION_GRACE_MS
  ).toISOString()

  const drafts = await existingDrafts(items.map((item) => item.id))
  const tx = writeClient.transaction().create({
    _id: orderId,
    _type: "order",
    number,
    status: "aguardando_pagamento",
    accessToken,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: maskPhone(input.customer.phone),
      cpf: maskCpf(input.customer.cpf),
    },
    address: input.address,
    items: items.map((item) => ({
      _key: crypto.randomUUID().slice(0, 8),
      _type: "orderItem",
      product: { _type: "reference", _ref: item.id, _weak: true },
      title: item.title,
      price: item.price,
    })),
    shipping: {
      serviceId: shippingOption.id,
      company: shippingOption.company,
      name: shippingOption.name,
      price: shippingOption.price,
      deliveryDays: shippingOption.deliveryDays,
    },
    subtotal,
    shippingTotal: shippingOption.price,
    total,
    processedEvents: [],
    createdAt: now.toISOString(),
  })
  for (const item of items) {
    // ifRevisionId makes a concurrent checkout of the same piece fail the whole transaction.
    tx.patch(item.id, (patch) =>
      patch.ifRevisionId(item.rev).set({ reservedUntil, reservedBy: orderId })
    )
    const draftId = `drafts.${item.id}`
    if (drafts.has(draftId)) {
      tx.patch(draftId, (patch) => patch.set({ reservedUntil, reservedBy: orderId }))
    }
  }

  try {
    await tx.commit()
  } catch (err) {
    console.error("[checkout] reservation failed:", (err as Error).message)
    throw new OrderError("Uma das peças acabou de ser reservada por outra pessoa.", 409)
  }

  try {
    const charge = await createPixCharge({
      amountCents: toCents(total),
      expiresIn: PIX_EXPIRES_IN_SECONDS,
      description: `Cerami Mandy - pedido ${number}`,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        cellphone: maskPhone(input.customer.phone),
        taxId: maskCpf(input.customer.cpf),
      },
      externalId: orderId,
      metadata: { orderId, orderNumber: number },
    })

    await writeClient
      .patch(orderId)
      .set({
        payment: {
          provider: "abacatepay",
          chargeId: charge.id,
          brCode: charge.brCode,
          brCodeBase64: charge.brCodeBase64,
          expiresAt: charge.expiresAt,
          devMode: charge.devMode,
        },
      })
      .commit()
  } catch (err) {
    console.error("[checkout] pix charge failed:", (err as Error).message)
    await closeOrder(orderId, "cancelado")
    if (err instanceof PaymentProviderError) {
      throw new OrderError("Não foi possível gerar o Pix agora. Tente novamente.", 502)
    }
    throw err
  }

  return { orderId, accessToken }
}

export function getOrder(orderId: string) {
  return writeClient.fetch(ORDER_BY_ID_QUERY, { id: orderId })
}

export function getOrderByCharge(chargeId: string) {
  return writeClient.fetch(ORDER_BY_CHARGE_QUERY, { chargeId })
}

// Releases reservations still held by this order and sets its final status.
async function closeOrder(orderId: string, status: "cancelado" | "expirado") {
  const order = await getOrder(orderId)
  if (!order || order.status !== "aguardando_pagamento") return

  const productIds = (order.items ?? []).flatMap((item) =>
    item.productId ? [item.productId] : []
  )
  const heldIds = await writeClient.fetch<string[]>(
    `*[_id in $ids && reservedBy == $orderId]._id`,
    {
      ids: [...productIds, ...productIds.map((id) => `drafts.${id}`)],
      orderId,
    }
  )

  const tx = writeClient
    .transaction()
    .patch(orderId, (patch) => patch.ifRevisionId(order._rev).set({ status }))
  for (const id of heldIds) {
    tx.patch(id, (patch) => patch.unset(["reservedUntil", "reservedBy"]))
  }
  await tx.commit()
}

export async function markOrderPaid(orderId: string, eventId?: string) {
  const order = await getOrder(orderId)
  if (!order) return null
  if (eventId && order.processedEvents?.includes(eventId)) return order
  if (order.status !== "aguardando_pagamento" && order.status !== "expirado") {
    return order
  }

  const productIds = (order.items ?? []).flatMap((item) =>
    item.productId ? [item.productId] : []
  )
  const drafts = await existingDrafts(productIds)
  const paidAt = new Date().toISOString()

  const tx = writeClient.transaction().patch(orderId, (patch) => {
    patch = patch
      .ifRevisionId(order._rev)
      .set({ status: "pago", "payment.paidAt": paidAt })
    return eventId
      ? patch.setIfMissing({ processedEvents: [] }).append("processedEvents", [eventId])
      : patch
  })
  for (const id of [...productIds, ...productIds.map((p) => `drafts.${p}`)]) {
    if (id.startsWith("drafts.") && !drafts.has(id)) continue
    tx.patch(id, (patch) =>
      patch.set({ inventory: 0, soldAt: paidAt }).unset(["reservedUntil", "reservedBy"])
    )
  }
  await tx.commit()
  console.info(`[orders] ${order.number} paid`)
  return getOrder(orderId)
}

// Asks AbacatePay for the charge status. Used by the webhook and by the order page,
// so a missed webhook does not leave a paid order pending.
export async function refreshOrderStatus(order: Order, eventId?: string) {
  const chargeId = order.payment?.chargeId
  if (order.status !== "aguardando_pagamento" || !chargeId) return order

  const charge = await checkPixCharge(chargeId)
  if (charge.status === "PAID" || charge.status === "APPROVED") {
    return (await markOrderPaid(order._id, eventId)) ?? order
  }
  if (["EXPIRED", "CANCELLED", "FAILED"].includes(charge.status)) {
    await closeOrder(order._id, "expirado")
    return (await getOrder(order._id)) ?? order
  }
  return order
}

export function hasOrderAccess(order: Order, token: string | null) {
  if (!token || !order.accessToken) return false
  return safeEqual(order.accessToken, token)
}

// What the customer's browser is allowed to see.
export function toPublicOrder(order: Order) {
  return {
    id: order._id.replace(/^order\./, ""),
    number: order.number,
    status: order.status,
    customerName: order.customer?.name ?? "",
    email: order.customer?.email ?? "",
    address: order.address,
    items: (order.items ?? []).map((item) => ({ title: item.title, price: item.price })),
    shipping: order.shipping,
    subtotal: order.subtotal,
    shippingTotal: order.shippingTotal,
    total: order.total,
    pix:
      order.status === "aguardando_pagamento" && order.payment
        ? {
            brCode: order.payment.brCode,
            brCodeBase64: order.payment.brCodeBase64,
            expiresAt: order.payment.expiresAt,
          }
        : null,
    devMode: !!order.payment?.devMode,
  }
}

export type PublicOrder = ReturnType<typeof toPublicOrder>
