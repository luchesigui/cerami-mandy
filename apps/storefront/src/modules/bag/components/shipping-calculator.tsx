"use client"

import { useEffect, useState } from "react"

import { isValidCep, maskCep, normalizeCep } from "@lib/shipping/cep"
import type { ShippingOption } from "@lib/shipping/types"
import { formatShippingPrice } from "@/sanity/format"

import { useBag } from "../bag-context"

type Props = {
  // The checkout already has a CEP field in the address form.
  showCepInput?: boolean
}

const ShippingCalculator = ({ showCepInput = true }: Props) => {
  const { ids, cep, shipping, hydrated, setCep, setShipping } = useBag()
  const [input, setInput] = useState("")
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const idsKey = ids.join(",")

  useEffect(() => {
    if (hydrated) setInput(maskCep(cep))
  }, [cep, hydrated])

  useEffect(() => {
    if (!hydrated || !isValidCep(cep) || !idsKey) {
      setOptions([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch("/api/frete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cep, productIds: idsKey.split(",") }),
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          options?: ShippingOption[]
          error?: string
        }
        if (cancelled) return
        if (!res.ok) {
          setOptions([])
          setError(data.error ?? "Não foi possível calcular o frete.")
          return
        }
        const fresh = data.options ?? []
        setOptions(fresh)
        if (!fresh.length) {
          setError("Nenhuma transportadora atende este CEP.")
        }
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível calcular o frete.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [cep, idsKey, hydrated])

  // Keep the stored choice in sync with the latest quote (price may change).
  useEffect(() => {
    if (!shipping || loading) return
    const current = options.find((option) => option.id === shipping.id)
    if (!current) {
      if (options.length) setShipping(null)
      return
    }
    if (
      current.price !== shipping.price ||
      current.deliveryDays !== shipping.deliveryDays
    ) {
      setShipping(current)
    }
  }, [options, shipping, loading, setShipping])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!isValidCep(input)) {
      setError("Digite um CEP válido com 8 dígitos.")
      return
    }
    setCep(normalizeCep(input))
  }

  return (
    <section className="text-[#13110C]" aria-labelledby="shipping-calculator">
      <h2 id="shipping-calculator" className="text-sm font-bold uppercase tracking-wide">
        Calcular frete
      </h2>

      {showCepInput && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <label htmlFor="bag-cep" className="sr-only">
            CEP
          </label>
          <input
            id="bag-cep"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            value={input}
            onChange={(event) => setInput(maskCep(event.target.value))}
            className="w-full min-w-0 rounded-full border border-[#13110C]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#13110C]"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-full bg-[#13110C] px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-60"
          >
            Calcular
          </button>
        </form>
      )}

      {showCepInput && (
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs underline underline-offset-2 text-[#13110C]/60"
        >
          Não sei meu CEP
        </a>
      )}

      {loading && (
        <p className="mt-4 text-sm text-[#13110C]/60">Calculando frete...</p>
      )}

      {!loading && error && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && !options.length && !showCepInput && (
        <p className="mt-3 text-sm text-[#13110C]/60">
          Informe o CEP de entrega para ver as opções de frete.
        </p>
      )}

      {!loading && !!options.length && (
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Opções de frete</legend>
          {options.map((option) => {
            const checked = shipping?.id === option.id
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                  checked
                    ? "border-[#13110C] bg-[#FCAB42]/15"
                    : "border-[#13110C]/15 hover:border-[#13110C]/40"
                }`}
              >
                <input
                  type="radio"
                  name="shipping-option"
                  checked={checked}
                  onChange={() => setShipping(option)}
                  className="accent-[#13110C]"
                />
                <span className="flex-1">
                  <span className="font-bold">
                    {option.company} {option.name}
                  </span>
                  <span className="block text-xs text-[#13110C]/60">
                    Até {option.deliveryDays}{" "}
                    {option.deliveryDays === 1 ? "dia útil" : "dias úteis"}
                  </span>
                </span>
                <span className="font-bold">
                  {formatShippingPrice(option.price)}
                </span>
              </label>
            )
          })}
        </fieldset>
      )}
    </section>
  )
}

export default ShippingCalculator
