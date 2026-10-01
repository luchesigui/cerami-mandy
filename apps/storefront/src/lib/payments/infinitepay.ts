import "server-only"

import { isProductionDeploy } from "@lib/util/deploy-env"

const BASE_URL = "https://api.checkout.infinitepay.io"

export class PaymentProviderError extends Error {}

// InfinitePay has no sandbox for checkout links. With INFINITEPAY_MOCK=true (ignored on
// the production deploy) links point to /api/dev/infinitepay-checkout, which "pays" instantly, and
// payment_check accepts the mock transactions it creates.
export const isMockMode = () =>
  process.env.INFINITEPAY_MOCK === "true" && !isProductionDeploy()

export const MOCK_PREFIX = "mock-"

const getHandle = () => {
  const handle = process.env.INFINITEPAY_HANDLE?.replace(/^\$/, "")
  if (!handle) throw new PaymentProviderError("INFINITEPAY_HANDLE must be set")
  return handle
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const data = (await res.json().catch(() => null)) as T | null
  if (!res.ok || !data) {
    throw new PaymentProviderError(
      `InfinitePay ${path} responded ${res.status}: ${JSON.stringify(data)}`
    )
  }
  return data
}

const LINK_KEYS = ["url", "link", "checkout_url", "payment_url", "checkoutUrl", "paymentUrl"]

// The response shape of /links is not documented. Prefer link-like keys and never
// return one of our own URLs (the response may echo redirect_url or webhook_url).
function findCheckoutUrl(data: unknown, ours: string[]): string | null {
  const isCandidate = (value: unknown): value is string =>
    typeof value === "string" &&
    value.startsWith("https://") &&
    !ours.some((url) => url && value.startsWith(url))

  const visit = (node: unknown, preferKeys: boolean): string | null => {
    if (!node || typeof node !== "object") return null
    const entries = Object.entries(node)
    for (const [key, value] of entries) {
      if ((!preferKeys || LINK_KEYS.includes(key)) && isCandidate(value)) return value
    }
    for (const [, value] of entries) {
      const found = visit(value, preferKeys)
      if (found) return found
    }
    return null
  }

  return visit(data, true) ?? visit(data, false)
}

export async function createCheckoutLink(input: {
  orderNsu: string
  items: { description: string; priceCents: number }[]
  customer: { name: string; email: string; phone: string }
  address: {
    cep: string
    street: string
    neighborhood: string
    number: string
    complement?: string
  }
  redirectUrl: string
  webhookUrl?: string
}) {
  if (isMockMode()) {
    const amount = input.items.reduce((sum, item) => sum + item.priceCents, 0)
    const params = new URLSearchParams({
      amount: String(amount),
      redirect: input.redirectUrl,
    })
    return `${new URL(input.redirectUrl).origin}/api/dev/infinitepay-checkout?${params}`
  }

  const data = await post<unknown>("/links", {
    handle: getHandle(),
    order_nsu: input.orderNsu,
    redirect_url: input.redirectUrl,
    webhook_url: input.webhookUrl,
    items: input.items.map((item) => ({
      quantity: 1,
      price: item.priceCents,
      description: item.description,
    })),
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone_number: input.customer.phone,
    },
    address: input.address,
  })

  const url = findCheckoutUrl(data, [input.redirectUrl, input.webhookUrl ?? ""])
  if (!url) {
    throw new PaymentProviderError(
      `InfinitePay /links returned no URL: ${JSON.stringify(data)}`
    )
  }
  return url
}

export type PaymentCheck = {
  paid: boolean
  amount: number
  paidAmount: number
  installments: number
  captureMethod: string
}

// Needs the transaction_nsu and slug that come back in the webhook or the redirect.
export async function checkPayment(input: {
  orderNsu: string
  transactionNsu: string
  slug: string
}): Promise<PaymentCheck> {
  if (isMockMode() && input.transactionNsu.startsWith(MOCK_PREFIX)) {
    // The mock checkout encodes the paid amount in the slug: mock-<cents>.
    const amount = Number(input.slug.slice(MOCK_PREFIX.length)) || 0
    return { paid: true, amount, paidAmount: amount, installments: 1, captureMethod: "pix" }
  }

  const data = await post<{
    success?: boolean
    paid?: boolean
    amount?: number
    paid_amount?: number
    installments?: number
    capture_method?: string
  }>("/payment_check", {
    handle: getHandle(),
    order_nsu: input.orderNsu,
    transaction_nsu: input.transactionNsu,
    slug: input.slug,
  })

  return {
    paid: !!data.success && !!data.paid,
    amount: data.amount ?? 0,
    paidAmount: data.paid_amount ?? 0,
    installments: data.installments ?? 1,
    captureMethod: data.capture_method ?? "",
  }
}
