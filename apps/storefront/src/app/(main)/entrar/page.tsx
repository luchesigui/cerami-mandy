"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { isValidEmail } from "@lib/br-documents"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/conta"

  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Check if user is already logged in
  useEffect(() => {
    fetch("/api/auth/sessao")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace(redirect)
        }
      })
      .catch(() => undefined)
  }, [router, redirect])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.toLowerCase().trim()
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError("Informe um e-mail válido.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o código.")
        setLoading(false)
        return
      }

      setStep("code")
      setResendCooldown(60)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.replace(/\D/g, "")
    if (cleanCode.length !== 6) {
      setError("Informe o código de 6 dígitos.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code: cleanCode }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Código inválido.")
        setLoading(false)
        return
      }

      // Success: redirect to target
      router.push(redirect)
      router.refresh()
    } catch {
      setError("Erro de conexão ao verificar o código.")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[440px] px-4 py-16 text-[#13110C] sm:py-24">
      <div className="rounded-3xl border border-[#010204] bg-[#FFFDF9] p-8 shadow-sm sm:p-10">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6b655b]">
            Cerami Mandy
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {step === "email" ? "Acessar minha conta" : "Código de verificação"}
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-[#13110C]/70">
            {step === "email"
              ? "Digite seu e-mail para receber um código de 6 dígitos. Sem senhas para lembrar."
              : `Enviamos um código de acesso de 6 dígitos para ${email}.`}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-3.5 text-center text-xs font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wide text-[#13110C]"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-3 text-sm outline-none transition-colors focus:border-[#13110C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#FCAB42] py-3.5 text-sm font-bold uppercase tracking-wide text-[#13110C] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Receber código de acesso"}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-[#6b655b]">
              Se você já fez alguma compra com este e-mail, seus pedidos anteriores aparecerão automaticamente.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="code"
                className="block text-center text-xs font-bold uppercase tracking-wide text-[#13110C]"
              >
                Código de 6 dígitos
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  if (error) setError(null)
                }}
                className="mt-2 w-full rounded-2xl border border-[#13110C]/30 bg-white py-3.5 text-center font-mono text-2xl font-bold tracking-[0.4em] outline-none transition-colors focus:border-[#13110C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.replace(/\D/g, "").length !== 6}
              className="w-full rounded-full bg-[#FCAB42] py-3.5 text-sm font-bold uppercase tracking-wide text-[#13110C] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Confirmar e entrar"}
            </button>

            <div className="flex flex-col items-center gap-2 pt-2 text-xs">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleSendCode}
                className="font-medium text-[#13110C]/70 underline underline-offset-2 hover:text-[#13110C] disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `Reenviar código em ${resendCooldown}s`
                  : "Reenviar código"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email")
                  setCode("")
                  setError(null)
                }}
                className="text-[#6b655b] hover:underline"
              >
                Trocar e-mail
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 border-t border-[#13110C]/10 pt-6 text-center">
          <LocalizedClientLink
            href="/"
            className="text-xs uppercase text-[#6b655b] underline underline-offset-2 hover:text-[#13110C]"
          >
            ← Voltar para a loja
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-24 text-center text-sm text-[#13110C]/60">
          Carregando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
