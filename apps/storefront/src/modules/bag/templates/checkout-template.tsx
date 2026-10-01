"use client"

import { useParams } from "next/navigation"
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

type FormErrors = Partial<Record<keyof CustomerForm, string>>

const getFieldErrors = (form: CustomerForm): FormErrors => {
  const errors: FormErrors = {}

  const nameTrimmed = form.name.trim()
  if (!nameTrimmed) {
    errors.name = "Informe seu nome completo."
  } else if (nameTrimmed.split(/\s+/).filter(Boolean).length < 2) {
    errors.name = "Informe nome e sobrenome."
  }

  const emailTrimmed = form.email.trim()
  if (!emailTrimmed) {
    errors.email = "Informe seu e-mail."
  } else if (!isValidEmail(emailTrimmed)) {
    errors.email = "Informe um e-mail válido."
  }

  const phoneDigits = digits(form.phone)
  if (!phoneDigits) {
    errors.phone = "Informe seu telefone."
  } else if (!isValidPhone(form.phone)) {
    errors.phone = "Informe um telefone válido com DDD."
  }

  const cpfDigits = digits(form.cpf)
  if (!cpfDigits) {
    errors.cpf = "Informe seu CPF."
  } else if (cpfDigits.length !== 11 || !isValidCpf(form.cpf)) {
    errors.cpf = "CPF inválido."
  }

  const cepDigits = digits(form.cep)
  if (!cepDigits) {
    errors.cep = "Informe o CEP."
  } else if (!isValidCep(form.cep)) {
    errors.cep = "CEP inválido (8 dígitos)."
  }

  if (!form.street.trim()) {
    errors.street = "Informe o nome da rua / logradouro."
  }

  if (!form.number.trim()) {
    errors.number = "Informe o número (ou S/N)."
  }

  if (!form.neighborhood.trim()) {
    errors.neighborhood = "Informe o bairro."
  }

  if (!form.city.trim()) {
    errors.city = "Informe a cidade."
  }

  const stateUpper = form.state.trim().toUpperCase()
  if (!stateUpper) {
    errors.state = "Informe a UF."
  } else if (!BR_STATES.includes(stateUpper)) {
    errors.state = "UF inválida (ex: SP)."
  }

  return errors
}

const Field = ({
  label,
  error,
  className = "",
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string | null
}) => (
  <label className={`block text-xs font-bold uppercase tracking-wide ${className}`}>
    <span className="flex items-center justify-between">
      <span>{label}</span>
      {required && (
        <span className="text-[10px] font-normal lowercase tracking-normal text-[#13110C]/50">
          obrigatório
        </span>
      )}
    </span>
    <input
      {...props}
      required={required}
      aria-invalid={!!error}
      className={`mt-1 w-full rounded-full border bg-white px-4 py-2.5 text-sm font-normal normal-case tracking-normal outline-none transition-colors ${
        error
          ? "border-red-600 bg-red-50/40 text-[#13110C] focus:border-red-600"
          : "border-[#13110C]/20 focus:border-[#13110C]"
      }`}
    />
    {error && (
      <span
        className="mt-1 block text-xs font-normal normal-case tracking-normal text-red-700"
        role="alert"
      >
        {error}
      </span>
    )}
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
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerForm, boolean>>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
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
      if (submitError) setSubmitError(null)
    }

  const markTouched = (key: keyof CustomerForm) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }

  const fieldErrors = getFieldErrors(form)
  const formValid = Object.keys(fieldErrors).length === 0
  const firstErrorMessage = Object.values(fieldErrors)[0]

  const getVisibleError = (key: keyof CustomerForm): string | undefined => {
    const error = fieldErrors[key]
    if (!error) return undefined
    if (attemptedSubmit || touched[key]) return error
    const val = form[key]?.trim?.() ?? ""
    if (val.length > 0) {
      if (key === "name" && val.split(/\s+/).filter(Boolean).length < 2) return error
      if (key === "cpf" && digits(val).length >= 11) return error
      if (key === "email" && val.includes("@") && !isValidEmail(val)) return error
      if (key === "phone" && digits(val).length >= 10 && !isValidPhone(val)) return error
      if (key === "state" && val.length === 2 && !BR_STATES.includes(val.toUpperCase())) return error
    }
    return undefined
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

  const handlePay = async () => {
    setAttemptedSubmit(true)

    const errorKeys = Object.keys(fieldErrors) as (keyof CustomerForm)[]
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0]
      const input = document.querySelector<HTMLInputElement>(`[name="${firstKey}"]`)
      input?.focus()
      return
    }

    if (!bag.shipping) {
      const shippingSection = document.getElementById("shipping-calculator")
      shippingSection?.scrollIntoView({ behavior: "smooth" })
      return
    }

    if (hasUnavailable || submitting) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone,
            cpf: form.cpf,
          },
          address: {
            cep: form.cep,
            street: form.street.trim(),
            number: form.number.trim(),
            complement: form.complement.trim(),
            neighborhood: form.neighborhood.trim(),
            city: form.city.trim(),
            state: form.state.trim().toUpperCase(),
          },
          productIds: bag.ids,
          shippingServiceId: bag.shipping.id,
          countryCode,
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
      // Straight to InfinitePay; the order page is where it sends the customer back.
      const token = encodeURIComponent(data.accessToken)
      const orderPage = `/${countryCode}/pedido/${data.orderId}`
      window.location.assign(
        `/api/pedidos/${data.orderId}/pagar?t=${token}&back=${encodeURIComponent(orderPage)}`
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
          <Field
            label="Nome completo"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={update("name")}
            onBlur={() => markTouched("name")}
            error={getVisibleError("name")}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={update("email")}
              onBlur={() => markTouched("email")}
              error={getVisibleError("email")}
            />
            <Field
              label="Telefone"
              name="phone"
              type="tel"
              autoComplete="tel-national"
              placeholder="(11) 91234-5678"
              required
              value={form.phone}
              onChange={update("phone", maskPhone)}
              onBlur={() => markTouched("phone")}
              error={getVisibleError("phone")}
            />
          </div>
          <div>
            <Field
              label="CPF"
              name="cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              required
              value={form.cpf}
              onChange={update("cpf", maskCpf)}
              onBlur={() => markTouched("cpf")}
              error={getVisibleError("cpf")}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">Endereço de entrega</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
            <div>
              <Field
                label="CEP"
                name="cep"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                required
                value={form.cep}
                onChange={update("cep", maskCep)}
                onBlur={() => markTouched("cep")}
                error={cepError || getVisibleError("cep")}
              />
            </div>
            <Field
              label="Rua"
              name="street"
              autoComplete="address-line1"
              required
              value={form.street}
              onChange={update("street")}
              onBlur={() => markTouched("street")}
              error={getVisibleError("street")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Field
              label="Número"
              name="number"
              inputMode="numeric"
              required
              value={form.number}
              onChange={update("number")}
              onBlur={() => markTouched("number")}
              error={getVisibleError("number")}
            />
            <Field
              label="Complemento"
              name="complement"
              autoComplete="address-line2"
              value={form.complement}
              onChange={update("complement")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_100px]">
            <Field
              label="Bairro"
              name="neighborhood"
              required
              value={form.neighborhood}
              onChange={update("neighborhood")}
              onBlur={() => markTouched("neighborhood")}
              error={getVisibleError("neighborhood")}
            />
            <Field
              label="Cidade"
              name="city"
              autoComplete="address-level2"
              required
              value={form.city}
              onChange={update("city")}
              onBlur={() => markTouched("city")}
              error={getVisibleError("city")}
            />
            <Field
              label="UF"
              name="state"
              autoComplete="address-level1"
              maxLength={2}
              required
              value={form.state}
              onChange={update("state", (v) => v.toUpperCase())}
              onBlur={() => markTouched("state")}
              error={getVisibleError("state")}
            />
          </div>
        </section>

        <div>
          <ShippingCalculator showCepInput={false} />
          {attemptedSubmit && !bag.shipping && (
            <p className="mt-3 text-xs font-bold text-red-700" role="alert">
              Selecione uma das opções de frete acima para continuar.
            </p>
          )}
        </div>
      </form>

      <aside className="h-fit space-y-6 rounded-3xl bg-[#FFF6E8] p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">Resumo do pedido</h2>
        <BagItems items={items} missing={missing} editable={false} />
        <OrderSummary subtotal={subtotal} />
        <div>
          <button
            type="button"
            onClick={handlePay}
            disabled={submitting || hasUnavailable}
            className="w-full rounded-full bg-[#FCAB42] px-10 py-3.5 text-base font-bold uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#FCAB42]/50"
          >
            {submitting ? "Reservando..." : "Reservar e pagar"}
          </button>
          {submitError ? (
            <p className="mt-2 text-center text-xs font-bold text-red-700" role="alert">
              {submitError}
            </p>
          ) : hasUnavailable ? (
            <p className="mt-2 text-center text-xs font-bold text-red-700">
              Remova as peças indisponíveis para continuar.
            </p>
          ) : attemptedSubmit && firstErrorMessage ? (
            <p className="mt-2 text-center text-xs font-bold text-red-700" role="alert">
              {firstErrorMessage}
            </p>
          ) : !bag.shipping ? (
            <p
              className={`mt-2 text-center text-xs ${
                attemptedSubmit ? "font-bold text-red-700" : "text-[#13110C]/60"
              }`}
            >
              Escolha o frete para continuar.
            </p>
          ) : !formValid ? (
            <p
              className={`mt-2 text-center text-xs ${
                attemptedSubmit ? "font-bold text-red-700" : "text-[#13110C]/60"
              }`}
            >
              {attemptedSubmit
                ? "Preencha os campos destacados em vermelho acima."
                : "Preencha seus dados e o endereço para continuar."}
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-[#13110C]/60">
              Pix ou cartão em até 12x. A peça fica reservada por 30 minutos.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

export default CheckoutTemplate
