"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import type { PublicOrder } from "@lib/orders"
import { useBag } from "@modules/bag/bag-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatShippingPrice } from "@/sanity/format"

const POLL_INTERVAL_MS = 5000

const CAPTURE_METHODS: Record<string, string> = {
  pix: "Pix",
  credit_card: "cartão de crédito",
}

type Props = { orderId: string; token: string }

const useCountdown = (expiresAt: string | null | undefined) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  if (!expiresAt) return null
  const remaining = Math.max(0, new Date(expiresAt).getTime() - now)
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

const Summary = ({ order }: { order: PublicOrder }) => (
  <section className="space-y-4 rounded-3xl bg-[#FFF6E8] p-6 text-sm">
    <ul className="space-y-1">
      {order.items.map((item, index) => (
        <li key={index} className="flex justify-between gap-4">
          <span>{item.title}</span>
          <span>{formatShippingPrice(item.price ?? 0)}</span>
        </li>
      ))}
      <li className="flex justify-between gap-4">
        <span>
          Frete {order.shipping?.company} {order.shipping?.name}
        </span>
        <span>{formatShippingPrice(order.shippingTotal ?? 0)}</span>
      </li>
    </ul>
    <p className="flex justify-between border-t border-[#13110C]/15 pt-3 text-base font-bold">
      <span>Total</span>
      <span>{formatShippingPrice(order.total ?? 0)}</span>
    </p>
    {order.address && (
      <p className="text-[#13110C]/70">
        Entrega em {order.address.street}, {order.address.number}
        {order.address.complement ? ` - ${order.address.complement}` : ""},{" "}
        {order.address.neighborhood}, {order.address.city}/{order.address.state}
      </p>
    )}
  </section>
)

const OrderTemplate = ({ orderId, token }: Props) => {
  const { clear } = useBag()
  const { countryCode } = useParams<{ countryCode: string }>()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const countdown = useCountdown(order?.expiresAt)

  // On the way back from InfinitePay the URL carries transaction_nsu and slug,
  // which the API uses to confirm the payment.
  const returnParams = ["transaction_nsu", "slug", "receipt_url"]
    .flatMap((key) => {
      const value = searchParams.get(key)
      return value ? [`${key}=${encodeURIComponent(value)}`] : []
    })
    .join("&")
  const endpoint = `/api/pedidos/${orderId}?t=${encodeURIComponent(token)}${
    returnParams ? `&${returnParams}` : ""
  }`
  const payUrl = `/api/pedidos/${orderId}/pagar?t=${encodeURIComponent(
    token
  )}&back=${encodeURIComponent(`/${countryCode}/pedido/${orderId}`)}`

  const load = useCallback(async () => {
    const res = await fetch(endpoint, { cache: "no-store" })
    if (!res.ok) {
      setError("Pedido não encontrado. Confira o link.")
      return
    }
    setOrder((await res.json()) as PublicOrder)
  }, [endpoint])

  useEffect(() => {
    load().catch(() => setError("Não foi possível carregar o pedido."))
  }, [load])

  // While pending, pick up a webhook confirmation or the end of the reservation.
  useEffect(() => {
    if (order?.status !== "aguardando_pagamento") return
    const timer = setInterval(() => {
      load().catch(() => undefined)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [order?.status, load])

  const paid =
    order?.status === "pago" ||
    order?.status === "pago_conflito" ||
    order?.status === "enviado" ||
    order?.status === "entregue"

  useEffect(() => {
    if (paid) clear()
  }, [paid, clear])

  if (error) {
    return (
      <div className="px-6 py-24 text-center text-[#13110C]">
        <h1 className="text-2xl font-bold">{error}</h1>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="px-6 py-24 text-center text-sm text-[#13110C]/60">
        Carregando pedido...
      </div>
    )
  }

  const method = order.payment ? CAPTURE_METHODS[order.payment.captureMethod] : null

  return (
    <div className="mx-auto max-w-[560px] space-y-8 px-4 py-12 text-[#13110C]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#13110C]/60">
        Pedido {order.number}
      </p>

      {order.status === "aguardando_pagamento" && (
        <section className="space-y-5 text-center">
          <h1 className="text-2xl font-bold">Sua peça está reservada</h1>
          <p className="text-sm text-[#13110C]/70">
            Conclua o pagamento em até <strong>{countdown}</strong>. Você pode pagar
            com Pix ou cartão de crédito em até 12x, no ambiente seguro da
            InfinitePay.
          </p>
          <a
            href={payUrl}
            className="inline-block rounded-full bg-[#FCAB42] px-10 py-3.5 text-base font-bold uppercase"
          >
            Ir para pagamento
          </a>
          <p className="text-xs text-[#13110C]/60">
            Já pagou? Esta página atualiza sozinha quando o pagamento for confirmado.
          </p>
        </section>
      )}

      {paid && order.status !== "pago_conflito" && (
        <section className="space-y-3 text-center">
          <h1 className="text-2xl font-bold">Pedido confirmado!</h1>
          <p className="text-sm text-[#13110C]/70">
            Obrigada, {order.customerName.split(" ")[0]}! Recebemos seu pagamento
            {method ? ` via ${method}` : ""}
            {order.payment && order.payment.installments > 1
              ? ` em ${order.payment.installments}x`
              : ""}{" "}
            e sua peça será embalada com carinho. Prazo de entrega: até{" "}
            {order.shipping?.deliveryDays} dias úteis após o envio.
          </p>
          {order.payment?.receiptUrl && (
            <a
              href={order.payment.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm underline underline-offset-2"
            >
              Ver comprovante
            </a>
          )}
          <p className="text-xs text-[#13110C]/60">
            Guarde o link desta página para acompanhar seu pedido.
          </p>
        </section>
      )}

      {order.status === "pago_conflito" && (
        <section className="space-y-3 text-center">
          <h1 className="text-2xl font-bold">Recebemos seu pagamento, mas...</h1>
          <p className="text-sm text-[#13110C]/70">
            A reserva tinha expirado e a peça foi vendida para outra pessoa antes da
            confirmação. Vamos estornar o valor integral e entrar em contato pelo
            e-mail {order.email}. Desculpe pelo transtorno.
          </p>
        </section>
      )}

      {(order.status === "expirado" || order.status === "cancelado") && (
        <section className="space-y-5 text-center">
          <h1 className="text-2xl font-bold">A reserva expirou</h1>
          <p className="text-sm text-[#13110C]/70">
            O pagamento não foi concluído a tempo e a peça foi liberada. Se ela ainda
            estiver disponível, é só tentar de novo.
          </p>
          <LocalizedClientLink
            href="/sacola"
            className="inline-block rounded-full bg-[#FCAB42] px-10 py-3.5 text-base font-bold uppercase"
          >
            Voltar para a sacola
          </LocalizedClientLink>
        </section>
      )}

      <Summary order={order} />
    </div>
  )
}

export default OrderTemplate
