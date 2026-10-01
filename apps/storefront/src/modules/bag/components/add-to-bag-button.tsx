"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { useBag } from "../bag-context"

type Props = {
  productId: string
  soldOut: boolean
  reserved?: boolean
}

const buttonClassName =
  "mt-4 inline-flex items-center justify-center self-start rounded-full bg-[#FCAB42] px-10 py-3 text-sm font-bold uppercase tracking-wider text-[#13110C] hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"

const AddToBagButton = ({ productId, soldOut, reserved = false }: Props) => {
  const { add, has, hydrated } = useBag()

  if (soldOut) {
    return (
      <button type="button" disabled title="Peça esgotada" className={buttonClassName}>
        Esgotada
      </button>
    )
  }

  if (reserved && !(hydrated && has(productId))) {
    return (
      <button
        type="button"
        disabled
        title="Alguém está finalizando a compra desta peça"
        className={buttonClassName}
      >
        Reservada
      </button>
    )
  }

  if (hydrated && has(productId)) {
    return (
      <LocalizedClientLink href="/sacola" className={buttonClassName}>
        Na sacola - ver sacola
      </LocalizedClientLink>
    )
  }

  return (
    <button
      type="button"
      disabled={!hydrated}
      onClick={() => add(productId)}
      className={buttonClassName}
    >
      Comprar
    </button>
  )
}

export default AddToBagButton
