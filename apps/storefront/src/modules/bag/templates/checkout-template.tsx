"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import {
  BR_STATES,
  digits,
  isValidCpf,
  isValidEmail,
  isValidPhone,
  maskCpf,
  maskPhone,
} from "@lib/br-documents"
import { isValidCep, maskCep, normalizeCep } from "@lib/shipping/cep"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { useBag } from "../bag-context"
import BagItems from "../components/bag-items"
import OrderSummary from "../components/order-summary"
import ShippingCalculator from "../components/shipping-calculator"
import { useBagProducts } from "../use-bag-products"

const STORAGE_KEY = "cerami-checkout"

type CustomerForm = {
  name: string
  email: string
  phone: string
  cpf: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

const EMPTY_FORM: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
}

const readForm = (): CustomerForm => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<CustomerForm>) } : EMPTY_FORM
  } catch {
    return EMPTY_FORM
  }
}

const inputClassName =
  "mt-1 w-full rounded-full border border-[#13110C]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#13110C]"

const Field = ({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className={`block text-xs font-bold uppercase tracking-wide ${className}`}>
    {label}
    <input {...props} className={`${inputClassName} font-normal normal-case tracking-normal`} />
  </label>
)

const CheckoutTemplate = () => {
  const bag = useBag()
  const { setCep } = bag
  const { items, missing, subtotal, hasUnavailable, loading } = useBagProducts()
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM)
  const [formReady, setFormReady] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const lastLookup = useRef("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()
  const { countryCode } = useParams<{ countryCode: string }>()

  useEffect(() => {
    if (!bag.hydrated) return
    const stored = readForm()
    setForm(stored.cep ? stored : { ...stored, cep: maskCep(bag.cep) })
    setFormReady(true)
    // Run once, after the bag is read from storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bag.hydrated])

  useEffect(() => {
    if (!formReady) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {
      // Storage unavailable; the form still works for this visit.
    }
  }, [form, formReady])

  // A valid CEP drives both the shipping quote and the address autofill.
  useEffect(() => {
    if (!formReady) return
    const cep = normalizeCep(form.cep)
    if (!isValidCep(cep)) return

    setCep(cep)

    if (lastLookup.current === cep) return
    lastLookup.current = cep
    setCepError(null)

    fetch(`/api/cep/${cep}`)
      .then(async (res) => {
        const data = (await res.json()) as Partial<CustomerForm> & { error?: string }
        if (!res.ok) {
          setCepError(data.error ?? "CEP não encontrado.")
          return
        }
        setForm((prev) => ({
          ...prev,
          street: data.street || prev.street,
          neighborhood: data.neighborhood || prev.neighborhood,
          city: data.city || prev.city,
          state: data.state || prev.state,
        }))
      })
      .catch(() => setCepError("Não foi possível consultar o CEP."))
  }, [form.cep, formReady, setCep])

  const update =
    (key: keyof CustomerForm, mask?: (value: string) => string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = mask ? mask(event.target.value) : event.target.value
      setForm((prev) => ({ ...prev, [key]: value }))
    }

  if (!bag.hydrated || (loading && bag.count > 0)) {
    return (
      <div className="px-6 py-24 text-center text-sm text-[#13110C]/60">
        Carregando...
      </div>
    )
  }

  if (!bag.count) {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center text-[#13110C]">
        <h1 className="text-2xl font-bold">Sua sacola está vazia</h1>
        <LocalizedClientLink
          href="/"
          className="mt-8 rounded-full bg-[#FCAB42] px-10 py-3.5 text-base font-bold uppercase"
        >
          Ver peças
        </LocalizedClientLink>
      </div>
    )
  }

  const cpfInvalid = digits(form.cpf).length === 11 && !isValidCpf(form.cpf)

  const formValid =
    form.name.trim().split(/\s+/).length >= 2 &&
    isValidEmail(form.email) &&
    isValidPhone(form.phone) &&
    isValidCpf(form.cpf) &&
    isValidCep(form.cep) &&
    !!form.street.trim() &&
    !!form.number.trim() &&
    !!form.neighborhood.trim() &&
    !!form.city.trim() &&
    BR_STATES.includes(form.state)

  const canPay = formValid && !!bag.shipping && !hasUnavailable && !submitting

  const handlePay = async () => {
    if (!canPay || !bag.shipping) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            cpf: form.cpf,
          },
          address: {
            cep: form.cep,
            street: form.street,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
          },
          productIds: bag.ids,
          shippingServiceId: bag.shipping.id,
        }),
      })
      const data = (await res.json()) as {
        orderId?: string
        accessToken?: string
        error?: string
      }
      if (!res.ok || !data.orderId || !data.accessToken) {
        setSubmitError(data.error ?? "Não foi possível finalizar o pedido.")
        // Availability or the quote changed; force a fresh quote.
        if (res.status === 409) bag.setShipping(null)
        setSubmitting(false)
        return
      }
      router.push(
        `/${countryCode}/pedido/${data.orderId}?t=${encodeURIComponent(data.accessToken)}`
      )
    } catch {
      setSubmitError("Não foi possível finalizar o pedido. Tente novamente.")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-4 py-12 text-[#13110C] sm:px-10 lg:grid-cols-[minmax(0,1fr)_400px]">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="space-y-10"
        noValidate
      >
        <div>
          <LocalizedClientLink
            href="/sacola"
            className="text-xs uppercase underline underline-offset-2 text-[#13110C]/70"
          >
            Voltar para a sacola
          </LocalizedClientLink>
          <h1 className="mt-3 text-2xl font-bold uppercase tracking-wide">
            Finalizar compra
          </h1>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">Seus dados</h2>
          <Field label="Nome completo" autoComplete="name" required value={form.name} onChange={update("name")} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="E-mail" type="email" autoComplete="email" required value={form.email} onChange={update("email")} />
            <Field label="Telefone" type="tel" autoComplete="tel-national" placeholder="(11) 91234-5678" required value={form.phone} onChange={update("phone", maskPhone)} />
          </div>
          <div>
            <Field label="CPF" inputMode="numeric" placeholder="000.000.000-00" required value={form.cpf} onChange={update("cpf", maskCpf)} aria-invalid={cpfInvalid} />
            {cpfInvalid && <p className="mt-1 text-xs text-red-700">CPF inválido.</p>}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">Endereço de entrega</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
            <div>
              <Field label="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" required value={form.cep} onChange={update("cep", maskCep)} />
              {cepError && <p className="mt-1 text-xs text-red-700">{cepError}</p>}
            </div>
            <Field label="Rua" autoComplete="address-line1" required value={form.street} onChange={update("street")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Field label="Número" inputMode="numeric" required value={form.number} onChange={update("number")} />
            <Field label="Complemento" autoComplete="address-line2" value={form.complement} onChange={update("complement")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_100px]">
            <Field label="Bairro" required value={form.neighborhood} onChange={update("neighborhood")} />
            <Field label="Cidade" autoComplete="address-level2" required value={form.city} onChange={update("city")} />
            <Field label="UF" autoComplete="address-level1" maxLength={2} required value={form.state} onChange={update("state", (v) => v.toUpperCase())} />
          </div>
        </section>

        <ShippingCalculator showCepInput={false} />
      </form>

      <aside className="h-fit space-y-6 rounded-3xl bg-[#FFF6E8] p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">Resumo do pedido</h2>
        <BagItems items={items} missing={missing} editable={false} />
        <OrderSummary subtotal={subtotal} />
        <div>
          <button
            type="button"
            onClick={handlePay}
            disabled={!canPay}
            className="w-full rounded-full bg-[#FCAB42] px-10 py-3.5 text-base font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#FCAB42]/50"
          >
            {submitting ? "Gerando Pix..." : "Pagar com Pix"}
          </button>
          {submitError ? (
            <p className="mt-2 text-center text-xs font-bold text-red-700" role="alert">
              {submitError}
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-[#13110C]/60">
              {hasUnavailable
                ? "Remova as peças indisponíveis para continuar."
                : !bag.shipping
                  ? "Escolha o frete para continuar."
                  : !formValid
                    ? "Preencha seus dados e o endereço para continuar."
                    : "A peça fica reservada para você por 30 minutos."}
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

export default CheckoutTemplate
