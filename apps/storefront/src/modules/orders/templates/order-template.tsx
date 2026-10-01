"use client"

import { useCallback, useEffect, useState } from "react"

import type { PublicOrder } from "@lib/orders"
import { useBag } from "@modules/bag/bag-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatShippingPrice } from "@/sanity/format"

const POLL_INTERVAL_MS = 5000

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
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const countdown = useCountdown(order?.pix?.expiresAt)

  const endpoint = `/api/pedidos/${orderId}?t=${encodeURIComponent(token)}`

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

  useEffect(() => {
    if (order?.status !== "aguardando_pagamento") return
    const timer = setInterval(() => {
      load().catch(() => undefined)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [order?.status, load])

  useEffect(() => {
    if (order?.status === "pago") clear()
  }, [order?.status, clear])

  const copyPix = async () => {
    if (!order?.pix?.brCode) return
    try {
      await navigator.clipboard.writeText(order.pix.brCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(false)
    }
  }

  const simulate = async () => {
    setSimulating(true)
    const res = await fetch(
      `/api/pedidos/${orderId}/simular?t=${encodeURIComponent(token)}`,
      { method: "POST" }
    ).catch(() => null)
    if (res?.ok) setOrder((await res.json()) as PublicOrder)
    setSimulating(false)
  }

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

  return (
    <div className="mx-auto max-w-[560px] space-y-8 px-4 py-12 text-[#13110C]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#13110C]/60">
        Pedido {order.number}
      </p>

      {order.status === "aguardando_pagamento" && order.pix && (
        <section className="space-y-5 text-center">
          <h1 className="text-2xl font-bold">Pague com Pix para confirmar</h1>
          <p className="text-sm text-[#13110C]/70">
            Sua peça está reservada. O código expira em{" "}
            <strong>{countdown}</strong>.
          </p>
          {order.pix.brCodeBase64 && (
            // Data URL from AbacatePay; next/image adds nothing here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.pix.brCodeBase64}
              alt="QR Code Pix"
              className="mx-auto h-[240px] w-[240px] rounded-2xl border border-[#13110C]/10 bg-white p-3"
            />
          )}
          <button
            type="button"
            onClick={copyPix}
            className="rounded-full bg-[#FCAB42] px-10 py-3.5 text-base font-bold uppercase"
          >
            {copied ? "Código copiado!" : "Copiar código Pix"}
          </button>
          <p className="text-xs text-[#13110C]/60">
            Esta página atualiza sozinha quando o pagamento for confirmado.
          </p>
          {order.devMode && (
            <button
              type="button"
              onClick={simulate}
              disabled={simulating}
              className="rounded-full border border-dashed border-[#13110C]/40 px-6 py-2 text-xs uppercase disabled:opacity-50"
            >
              {simulating ? "Simulando..." : "Simular pagamento (teste)"}
            </button>
          )}
        </section>
      )}

      {(order.status === "pago" || order.status === "enviado" || order.status === "entregue") && (
        <section className="space-y-3 text-center">
          <h1 className="text-2xl font-bold">Pedido confirmado!</h1>
          <p className="text-sm text-[#13110C]/70">
            Obrigada, {order.customerName.split(" ")[0]}! Recebemos seu pagamento e
            sua peça será embalada com carinho. Prazo de entrega: até{" "}
            {order.shipping?.deliveryDays} dias úteis após o envio.
          </p>
          <p className="text-xs text-[#13110C]/60">
            Guarde o link desta página para acompanhar seu pedido.
          </p>
        </section>
      )}

      {(order.status === "expirado" || order.status === "cancelado") && (
        <section className="space-y-5 text-center">
          <h1 className="text-2xl font-bold">O Pix expirou</h1>
          <p className="text-sm text-[#13110C]/70">
            O pagamento não foi concluído a tempo e a reserva foi liberada. Se a
            peça ainda estiver disponível, é só tentar de novo.
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
