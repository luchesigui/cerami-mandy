"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { useBag } from "../bag-context"
import BagItems from "../components/bag-items"
import OrderSummary from "../components/order-summary"
import ShippingCalculator from "../components/shipping-calculator"
import { useBagProducts } from "../use-bag-products"

const BagTemplate = () => {
  const { count, hydrated, shipping } = useBag()
  const { items, missing, subtotal, hasUnavailable, loading } = useBagProducts()

  if (!hydrated || (loading && count > 0)) {
    return (
      <div className="px-6 py-24 text-center text-sm text-[#13110C]/60">
        Carregando sacola...
      </div>
    )
  }

  if (!count) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center text-[#13110C]">
        <h1 className="text-2xl font-bold">Sua sacola está vazia</h1>
        <p className="mt-3 text-sm text-[#13110C]/70">
          Cada peça é única. Escolha a sua na vitrine.
        </p>
        <LocalizedClientLink
          href="/"
          className="mt-8 rounded-full bg-[#FCAB42] px-10 py-3.5 text-base font-bold uppercase text-[#13110C]"
        >
          Ver peças
        </LocalizedClientLink>
      </div>
    )
  }

  const canCheckout = !!shipping && !hasUnavailable

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-4 py-12 text-[#13110C] sm:px-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide">Sacola</h1>
        <div className="mt-6">
          <BagItems items={items} missing={missing} />
        </div>
      </div>

      <aside className="h-fit space-y-8 rounded-3xl bg-[#FFF6E8] p-6">
        <ShippingCalculator />
        <OrderSummary subtotal={subtotal} />
        {canCheckout ? (
          <LocalizedClientLink
            href="/finalizar"
            className="block rounded-full bg-[#FCAB42] px-10 py-3.5 text-center text-base font-bold uppercase"
          >
            Finalizar compra
          </LocalizedClientLink>
        ) : (
          <div>
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-full bg-[#FCAB42]/50 px-10 py-3.5 text-base font-bold uppercase"
            >
              Finalizar compra
            </button>
            <p className="mt-2 text-center text-xs text-[#13110C]/60">
              {hasUnavailable
                ? "Remova as peças indisponíveis para continuar."
                : "Escolha a entrega ou retirada para continuar."}
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}

export default BagTemplate
