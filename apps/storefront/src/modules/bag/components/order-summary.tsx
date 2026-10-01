"use client"

import { isLocalPickup } from "@lib/shipping/types"
import { formatShippingPrice } from "@/sanity/format"

import { useBag } from "../bag-context"

const OrderSummary = ({ subtotal }: { subtotal: number }) => {
  const { shipping } = useBag()
  const isPickup = isLocalPickup(shipping)

  return (
    <dl className="space-y-2 text-sm text-[#13110C]">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd>{formatShippingPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>{isPickup ? "Retirada" : "Frete"}</dt>
        <dd>
          {shipping
            ? shipping.price === 0
              ? "Grátis"
              : formatShippingPrice(shipping.price)
            : "A calcular"}
        </dd>
      </div>
      <div className="flex justify-between border-t border-[#13110C]/15 pt-3 text-base font-bold">
        <dt>Total</dt>
        <dd>{formatShippingPrice(subtotal + (shipping?.price ?? 0))}</dd>
      </div>
    </dl>
  )
}

export default OrderSummary
