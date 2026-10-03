"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import {
  BR_STATES,
  maskCpf,
  maskPhone,
  isValidCpf,
  isValidPhone,
} from "@lib/br-documents"
import type { PublicOrder } from "@lib/orders"
import { isValidCep, maskCep, normalizeCep } from "@lib/shipping/cep"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatShippingPrice } from "@/sanity/format"

type CustomerData = {
  id: string
  name: string | null
  email: string
  phone: string | null
  cpf: string | null
  address: {
    cep?: string
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
  } | null
  hasPassword?: boolean
  createdAt?: string | null
}

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  aguardando_pagamento: {
    label: "Aguardando pagamento",
    color: "bg-amber-100 text-amber-900 border-amber-300",
  },
  pago: {
    label: "Pago",
    color: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  pago_conflito: {
    label: "Conflito (em análise)",
    color: "bg-rose-100 text-rose-900 border-rose-300",
  },
  enviado: {
    label: "Enviado",
    color: "bg-blue-100 text-blue-900 border-blue-300",
  },
  entregue: {
    label: "Entregue",
    color: "bg-green-100 text-green-900 border-green-300",
  },
  expirado: {
    label: "Expirado",
    color: "bg-stone-100 text-stone-600 border-stone-300",
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-stone-100 text-stone-600 border-stone-300",
  },
}

function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [orders, setOrders] = useState<PublicOrder[]>([])
  const [activeTab, setActiveTab] = useState<"pedidos" | "dados" | "endereco" | "senha">("pedidos")

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false)
  const [showPasswordNew, setShowPasswordNew] = useState(false)

  // Form states for profile & address
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    cpf: "",
  })
  const [addressForm, setAddressForm] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [savingAddress, setSavingAddress] = useState(false)
  const [addressSuccess, setAddressSuccess] = useState<string | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)

  const lastCepLookup = useRef("")

  useEffect(() => {
    fetch("/api/conta")
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/entrar?redirect=/conta")
          return
        }
        const data = await res.json()
        setCustomer(data.customer)
        setOrders(data.orders || [])
        setProfileForm({
          name: data.customer.name || "",
          phone: data.customer.phone || "",
          cpf: data.customer.cpf || "",
        })
        if (data.customer.address) {
          setAddressForm({
            cep: data.customer.address.cep ? maskCep(data.customer.address.cep) : "",
            street: data.customer.address.street || "",
            number: data.customer.address.number || "",
            complement: data.customer.address.complement || "",
            neighborhood: data.customer.address.neighborhood || "",
            city: data.customer.address.city || "",
            state: data.customer.address.state || "",
          })
        }
        setLoading(false)
      })
      .catch(() => {
        router.replace("/entrar?redirect=/conta")
      })
  }, [router])

  // ViaCEP address auto-fill
  useEffect(() => {
    const rawCep = normalizeCep(addressForm.cep)
    if (!isValidCep(rawCep)) return
    if (lastCepLookup.current === rawCep) return
    lastCepLookup.current = rawCep

    fetch(`/api/cep/${rawCep}`)
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        setAddressForm((prev) => ({
          ...prev,
          street: data.street || prev.street,
          neighborhood: data.neighborhood || prev.neighborhood,
          city: data.city || prev.city,
          state: data.state || prev.state,
        }))
      })
      .catch(() => undefined)
  }, [addressForm.cep])

  const handleLogout = async () => {
    await fetch("/api/auth/sair", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)

    if (profileForm.name.trim().split(/\s+/).filter(Boolean).length < 2) {
      setProfileError("Informe seu nome completo.")
      return
    }

    if (profileForm.phone && !isValidPhone(profileForm.phone)) {
      setProfileError("Informe um telefone válido com DDD.")
      return
    }

    if (profileForm.cpf && !isValidCpf(profileForm.cpf)) {
      setProfileError("Informe um CPF válido.")
      return
    }

    setSavingProfile(true)
    try {
      const res = await fetch("/api/conta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
          cpf: profileForm.cpf.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setProfileError(data.error ?? "Erro ao salvar os dados.")
      } else {
        setProfileSuccess("Dados atualizados com sucesso!")
        setTimeout(() => setProfileSuccess(null), 3000)
      }
    } catch {
      setProfileError("Erro ao conectar com o servidor.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressError(null)
    setAddressSuccess(null)

    const rawCep = normalizeCep(addressForm.cep)
    if (!isValidCep(rawCep)) {
      setAddressError("Informe um CEP válido.")
      return
    }

    if (!addressForm.street.trim()) {
      setAddressError("Informe a rua.")
      return
    }

    if (!addressForm.number.trim()) {
      setAddressError("Informe o número.")
      return
    }

    if (!addressForm.city.trim() || !addressForm.state.trim() || !BR_STATES.includes(addressForm.state.trim().toUpperCase())) {
      setAddressError("Informe a cidade e uma UF válida (ex: SP).")
      return
    }

    setSavingAddress(true)
    try {
      const res = await fetch("/api/conta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            cep: rawCep,
            street: addressForm.street.trim(),
            number: addressForm.number.trim(),
            complement: addressForm.complement.trim(),
            neighborhood: addressForm.neighborhood.trim(),
            city: addressForm.city.trim(),
            state: addressForm.state.trim().toUpperCase(),
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setAddressError(data.error ?? "Erro ao salvar o endereço.")
      } else {
        setAddressSuccess("Endereço salvo com sucesso!")
        setTimeout(() => setAddressSuccess(null), 3000)
      }
    } catch {
      setAddressError("Erro ao conectar com o servidor.")
    } finally {
      setSavingAddress(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (customer?.hasPassword && !passwordForm.currentPassword) {
      setPasswordError("Informe a sua senha atual.")
      return
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError("A nova senha deve ter no mínimo 6 caracteres.")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("As senhas não coincidem.")
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch("/api/auth/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword || undefined,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setPasswordError(data.error ?? "Erro ao salvar a senha.")
      } else {
        setPasswordSuccess(data.message ?? "Senha salva com sucesso!")
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setCustomer((prev) => (prev ? { ...prev, hasPassword: true } : prev))
        setTimeout(() => setPasswordSuccess(null), 4000)
      }
    } catch {
      setPasswordError("Erro de conexão ao salvar a senha.")
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-24 text-center text-sm text-[#13110C]/60">
        Carregando sua conta...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 text-[#13110C] sm:px-8">
      {/* Header com boas-vindas e botão sair */}
      <div className="flex flex-col gap-4 border-b border-[#010204]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#6b655b]">
            Minha Conta
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Olá, {customer?.name?.split(" ")[0] || "Cliente"}
          </h1>
          <p className="mt-1 text-xs text-[#6b655b]">{customer?.email}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="self-start rounded-full border border-[#010204]/20 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#13110C] transition-colors hover:bg-[#13110C] hover:text-white"
        >
          Sair da conta
        </button>
      </div>

      {/* Navegação entre abas */}
      <div className="mt-8 flex gap-2 border-b border-[#010204]/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("pedidos")}
          className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "pedidos"
              ? "bg-[#13110C] text-white"
              : "text-[#13110C]/70 hover:bg-[#FFCB98]/30"
          }`}
        >
          Meus Pedidos ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dados")}
          className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "dados"
              ? "bg-[#13110C] text-white"
              : "text-[#13110C]/70 hover:bg-[#FFCB98]/30"
          }`}
        >
          Meus Dados
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("endereco")}
          className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "endereco"
              ? "bg-[#13110C] text-white"
              : "text-[#13110C]/70 hover:bg-[#FFCB98]/30"
          }`}
        >
          Endereço de Entrega
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("senha")}
          className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "senha"
              ? "bg-[#13110C] text-white"
              : "text-[#13110C]/70 hover:bg-[#FFCB98]/30"
          }`}
        >
          Senha de Acesso
        </button>
      </div>

      {/* Conteúdo da aba Pedidos */}
      {activeTab === "pedidos" && (
        <div className="mt-8 space-y-6">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#010204]/20 bg-[#FFFDF9] p-12 text-center">
              <p className="text-base font-bold">Você ainda não tem nenhum pedido.</p>
              <p className="mt-1 text-xs text-[#6b655b]">
                Quando você adquirir uma cerâmica exclusiva, o pedido aparecerá aqui.
              </p>
              <LocalizedClientLink
                href="/"
                className="mt-6 inline-block rounded-full bg-[#FCAB42] px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#13110C]"
              >
                Conhecer as peças
              </LocalizedClientLink>
            </div>
          ) : (
            orders.map((order) => {
              const statusMeta = (order.status ? ORDER_STATUS_LABELS[order.status] : null) ?? {
                label: order.status || "Pendente",
                color: "bg-gray-100 text-gray-800 border-gray-300",
              }

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-[#010204]/15 bg-[#FFFDF9] p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
                >
                  <div className="flex flex-col gap-3 border-b border-[#010204]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#6b655b]">
                        Pedido #{order.number}
                      </span>
                      {order.createdAt && (
                        <p className="text-xs text-[#6b655b]">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="py-4">
                    <ul className="divide-y divide-[#010204]/5">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between py-2 text-sm">
                          <span className="font-medium text-[#13110C]">{item.title}</span>
                          <span className="font-bold text-[#13110C]">
                            {formatShippingPrice(item.price ?? 0)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex justify-between border-t border-[#010204]/10 pt-3 text-sm">
                      <span className="text-xs uppercase text-[#6b655b]">
                        Total com frete
                      </span>
                      <span className="text-base font-bold text-[#13110C]">
                        {formatShippingPrice(order.total ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Ações e Rastreamento */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#010204]/10 pt-4 text-xs">
                    <div>
                      {order.trackingCode ? (
                        <a
                          href={`https://melhorrastreio.com.br/rastreio/${order.trackingCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold uppercase text-[#13110C] underline underline-offset-2 hover:text-[#FCAB42]"
                        >
                          Rastrear: {order.trackingCode} ↗
                        </a>
                      ) : (
                        <span className="text-[#6b655b]">
                          {order.status === "pago"
                            ? "Preparando envio da peça"
                            : "Código de rastreio indisponível"}
                        </span>
                      )}
                    </div>

                    <LocalizedClientLink
                      href={`/pedido/${order.id}`}
                      className="rounded-full bg-[#13110C] px-5 py-2 font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                    >
                      Ver detalhes do pedido →
                    </LocalizedClientLink>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Conteúdo da aba Meus Dados */}
      {activeTab === "dados" && (
        <div className="mt-8 max-w-[600px] rounded-3xl border border-[#010204]/15 bg-[#FFFDF9] p-6 sm:p-8">
          <h2 className="text-base font-bold uppercase tracking-wide">
            Dados cadastrais
          </h2>
          <p className="mt-1 text-xs text-[#6b655b]">
            Mantenha seus dados atualizados para agilizar futuras compras.
          </p>

          {profileSuccess && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800 border border-emerald-200">
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="mt-4 rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-700 border border-red-200">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-5" noValidate>
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-bold uppercase tracking-wide"
              >
                Nome completo
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#6b655b]">
                E-mail (usado para acesso)
              </label>
              <input
                type="email"
                disabled
                value={customer?.email || ""}
                className="mt-1.5 w-full rounded-full border border-[#13110C]/10 bg-[#13110C]/5 px-5 py-2.5 text-sm text-[#13110C]/60 cursor-not-allowed outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  Telefone / WhatsApp
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  placeholder="(11) 91234-5678"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      phone: maskPhone(e.target.value),
                    }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-cpf"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  CPF
                </label>
                <input
                  id="profile-cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={profileForm.cpf}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      cpf: maskCpf(e.target.value),
                    }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-4 rounded-full bg-[#FCAB42] px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#13110C] hover:opacity-90 disabled:opacity-50"
            >
              {savingProfile ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </div>
      )}

      {/* Conteúdo da aba Endereço */}
      {activeTab === "endereco" && (
        <div className="mt-8 max-w-[600px] rounded-3xl border border-[#010204]/15 bg-[#FFFDF9] p-6 sm:p-8">
          <h2 className="text-base font-bold uppercase tracking-wide">
            Endereço padrão de entrega
          </h2>
          <p className="mt-1 text-xs text-[#6b655b]">
            Este endereço será preenchido automaticamente ao finalizar suas compras.
          </p>

          {addressSuccess && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800 border border-emerald-200">
              {addressSuccess}
            </div>
          )}

          {addressError && (
            <div className="mt-4 rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-700 border border-red-200">
              {addressError}
            </div>
          )}

          <form onSubmit={handleSaveAddress} className="mt-6 space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div>
                <label
                  htmlFor="addr-cep"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  CEP
                </label>
                <input
                  id="addr-cep"
                  type="text"
                  placeholder="00000-000"
                  value={addressForm.cep}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      cep: maskCep(e.target.value),
                    }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>

              <div>
                <label
                  htmlFor="addr-street"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  Rua / Logradouro
                </label>
                <input
                  id="addr-street"
                  type="text"
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, street: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div>
                <label
                  htmlFor="addr-number"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  Número
                </label>
                <input
                  id="addr-number"
                  type="text"
                  value={addressForm.number}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, number: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>

              <div>
                <label
                  htmlFor="addr-complement"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  Complemento
                </label>
                <input
                  id="addr-complement"
                  type="text"
                  placeholder="Apto, Bloco (opcional)"
                  value={addressForm.complement}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      complement: e.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_80px]">
              <div>
                <label
                  htmlFor="addr-neighborhood"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  Bairro
                </label>
                <input
                  id="addr-neighborhood"
                  type="text"
                  value={addressForm.neighborhood}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      neighborhood: e.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>

              <div>
                <label
                  htmlFor="addr-city"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  Cidade
                </label>
                <input
                  id="addr-city"
                  type="text"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>

              <div>
                <label
                  htmlFor="addr-state"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  UF
                </label>
                <input
                  id="addr-state"
                  type="text"
                  maxLength={2}
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      state: e.target.value.toUpperCase(),
                    }))
                  }
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingAddress}
              className="mt-4 rounded-full bg-[#FCAB42] px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#13110C] hover:opacity-90 disabled:opacity-50"
            >
              {savingAddress ? "Salvando..." : "Salvar endereço"}
            </button>
          </form>
        </div>
      )}

      {/* Conteúdo da aba Senha */}
      {activeTab === "senha" && (
        <div className="mt-8 max-w-xl rounded-3xl border border-[#010204] bg-[#FFFDF9] p-6 sm:p-8">
          <h2 className="text-lg font-bold">
            {customer?.hasPassword ? "Alterar senha de acesso" : "Definir senha de acesso"}
          </h2>
          <p className="mt-1 text-xs text-[#6b655b]">
            {customer?.hasPassword
              ? "Sua conta já possui uma senha. Você pode alterá-la quando desejar."
              : "Defina uma senha para fazer login direto, sem precisar aguardar o código de verificação por e-mail."}
          </p>

          {passwordError && (
            <div
              role="alert"
              className="mt-4 rounded-2xl border border-red-200 bg-red-50/70 p-3 text-xs font-semibold text-red-700"
            >
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div
              role="status"
              className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs font-semibold text-emerald-800"
            >
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handleSavePassword} className="mt-6 space-y-4" noValidate>
            {customer?.hasPassword && (
              <div>
                <label
                  htmlFor="curr-pwd"
                  className="block text-xs font-bold uppercase tracking-wide"
                >
                  Senha atual
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="curr-pwd"
                    type={showPasswordCurrent ? "text" : "password"}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                      if (passwordError) setPasswordError(null)
                    }}
                    className="w-full rounded-full border border-[#13110C]/20 bg-white pl-5 pr-12 py-2.5 text-sm outline-none focus:border-[#13110C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordCurrent((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b655b] hover:text-[#13110C]"
                    aria-label={showPasswordCurrent ? "Esconder senha" : "Ver senha"}
                  >
                    {showPasswordCurrent ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="new-pwd"
                className="block text-xs font-bold uppercase tracking-wide"
              >
                {customer?.hasPassword ? "Nova senha" : "Senha"}
              </label>
              <div className="relative mt-1.5">
                <input
                  id="new-pwd"
                  type={showPasswordNew ? "text" : "password"}
                  required
                  placeholder="Mínimo de 6 caracteres"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                    if (passwordError) setPasswordError(null)
                  }}
                  className="w-full rounded-full border border-[#13110C]/20 bg-white pl-5 pr-12 py-2.5 text-sm outline-none focus:border-[#13110C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordNew((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b655b] hover:text-[#13110C]"
                  aria-label={showPasswordNew ? "Esconder senha" : "Ver senha"}
                >
                  {showPasswordNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-pwd"
                className="block text-xs font-bold uppercase tracking-wide"
              >
                Confirmar {customer?.hasPassword ? "nova senha" : "senha"}
              </label>
              <input
                id="confirm-pwd"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                  if (passwordError) setPasswordError(null)
                }}
                className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-2.5 text-sm outline-none focus:border-[#13110C]"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-4 rounded-full bg-[#FCAB42] px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#13110C] hover:opacity-90 disabled:opacity-50"
            >
              {savingPassword
                ? "Salvando..."
                : customer?.hasPassword
                ? "Alterar senha"
                : "Cadastrar senha"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
