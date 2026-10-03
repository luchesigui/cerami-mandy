"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { isValidEmail } from "@lib/br-documents"
import { notifyAuthChange } from "@modules/auth/auth-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/conta"

  const [mode, setMode] = useState<"entrar" | "cadastrar">("entrar")
  const [step, setStep] = useState<"email" | "code" | "password">("email")

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Sign up fields
  const [signupStep, setSignupStep] = useState<"form" | "verify">("form")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupCode, setSignupCode] = useState("")
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false)
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

  const handleSendCode = async (targetEmail?: string) => {
    const emailToSend = (targetEmail || email).toLowerCase().trim()
    if (!emailToSend || !isValidEmail(emailToSend)) {
      setError("Informe um e-mail válido.")
      return
    }

    setLoading(true)
    setError(null)
    setNeedsPasswordSetup(false)

    try {
      const res = await fetch("/api/auth/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o código.")
        setLoading(false)
        return
      }

      setEmail(emailToSend)
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

      notifyAuthChange()
      router.push(redirect)
      router.refresh()
    } catch {
      setError("Erro de conexão ao verificar o código.")
      setLoading(false)
    }
  }

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.toLowerCase().trim()
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError("Informe um e-mail válido.")
      return
    }

    if (!password) {
      setError("Informe a sua senha.")
      return
    }

    setLoading(true)
    setError(null)
    setNeedsPasswordSetup(false)

    try {
      const res = await fetch("/api/auth/entrar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "E-mail ou senha incorretos.")
        if (data.needsPasswordSetup) {
          setNeedsPasswordSetup(true)
        }
        setLoading(false)
        return
      }

      notifyAuthChange()
      router.push(redirect)
      router.refresh()
    } catch {
      setError("Erro de conexão ao realizar login.")
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = signupName.trim()
    const cleanEmail = signupEmail.toLowerCase().trim()

    if (!name || name.length < 2) {
      setError("Informe seu nome completo.")
      return
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError("Informe um e-mail válido.")
      return
    }

    if (!signupPassword || signupPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: cleanEmail,
          password: signupPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar sua conta.")
        if (data.hasPassword) {
          // Switch to password login with this email
          setEmail(cleanEmail)
          setMode("entrar")
          setStep("password")
        }
        setLoading(false)
        return
      }

      setSignupStep("verify")
      setResendCooldown(60)
    } catch {
      setError("Erro de conexão ao criar sua conta.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySignupCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = signupCode.replace(/\D/g, "")
    if (cleanCode.length !== 6) {
      setError("Informe o código de 6 dígitos.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.toLowerCase().trim(),
          password: signupPassword,
          code: cleanCode,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Código inválido.")
        setLoading(false)
        return
      }

      notifyAuthChange()
      router.push(redirect)
      router.refresh()
    } catch {
      setError("Erro de conexão ao validar o código.")
      setLoading(false)
    }
  }

  const handleResendSignupCode = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.toLowerCase().trim(),
          password: signupPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Não foi possível reenviar o código.")
      } else {
        setResendCooldown(60)
      }
    } catch {
      setError("Erro ao reenviar o código.")
    } finally {
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

          {/* Mode switch: Entrar / Criar conta */}
          <div className="mt-4 flex rounded-full bg-[#13110C]/5 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("entrar")
                setError(null)
              }}
              className={`flex-1 rounded-full py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                mode === "entrar"
                  ? "bg-white text-[#13110C] shadow-sm"
                  : "text-[#6b655b] hover:text-[#13110C]"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("cadastrar")
                setSignupStep("form")
                setSignupCode("")
                setError(null)
              }}
              className={`flex-1 rounded-full py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                mode === "cadastrar"
                  ? "bg-white text-[#13110C] shadow-sm"
                  : "text-[#6b655b] hover:text-[#13110C]"
              }`}
            >
              Criar conta
            </button>
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            {mode === "cadastrar"
              ? signupStep === "verify"
                ? "Confirme seu e-mail"
                : "Criar minha conta"
              : step === "code"
              ? "Código de verificação"
              : step === "password"
              ? "Entrar com senha"
              : "Acessar minha conta"}
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-[#13110C]/70">
            {mode === "cadastrar"
              ? signupStep === "verify"
                ? `Enviamos um código de 6 dígitos para ${signupEmail}. Digite-o para ativar sua conta.`
                : "Cadastre-se para acompanhar seus pedidos e compras exclusivas."
              : step === "code"
              ? `Enviamos um código de acesso de 6 dígitos para ${email}.`
              : step === "password"
              ? `Informe a senha de acesso para ${email || "sua conta"}.`
              : "Digite seu e-mail para receber um código de acesso instantâneo."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-3.5 text-center text-xs font-semibold text-red-700"
          >
            {error}
            {needsPasswordSetup && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => handleSendCode(email)}
                  disabled={loading}
                  className="rounded-full bg-[#13110C] px-4 py-1.5 text-xs font-bold text-white hover:opacity-90"
                >
                  Receber código por e-mail
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "cadastrar" ? (
          signupStep === "form" ? (
            /* Sign Up Form */
            <form onSubmit={handleSignup} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-bold uppercase tracking-wide text-[#13110C]"
                >
                  Nome completo
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Seu Nome"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value)
                    if (error) setError(null)
                  }}
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-3 text-sm outline-none transition-colors focus:border-[#13110C]"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-bold uppercase tracking-wide text-[#13110C]"
                >
                  E-mail
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  className="mt-1.5 w-full rounded-full border border-[#13110C]/20 bg-white px-5 py-3 text-sm outline-none transition-colors focus:border-[#13110C]"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-bold uppercase tracking-wide text-[#13110C]"
                >
                  Senha
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo de 6 caracteres"
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    className="w-full rounded-full border border-[#13110C]/20 bg-white pl-5 pr-12 py-3 text-sm outline-none transition-colors focus:border-[#13110C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b655b] hover:text-[#13110C]"
                    aria-label={showSignupPassword ? "Esconder senha" : "Ver senha"}
                  >
                    {showSignupPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-[#FCAB42] py-3.5 text-sm font-bold uppercase tracking-wide text-[#13110C] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Enviando código..." : "Continuar e validar e-mail"}
              </button>

              <p className="text-center text-[11px] leading-relaxed text-[#6b655b]">
                Você receberá um código de ativação de 6 dígitos no seu e-mail para validar a conta.
              </p>
            </form>
          ) : (
            /* Sign Up OTP Verification */
            <form onSubmit={handleVerifySignupCode} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="signup-code"
                  className="block text-center text-xs font-bold uppercase tracking-wide text-[#13110C]"
                >
                  Código de ativação (6 dígitos)
                </label>
                <input
                  id="signup-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="000000"
                  value={signupCode}
                  onChange={(e) => {
                    setSignupCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    if (error) setError(null)
                  }}
                  className="mt-2 w-full rounded-2xl border border-[#13110C]/30 bg-white py-3.5 text-center font-mono text-2xl font-bold tracking-[0.4em] outline-none transition-colors focus:border-[#13110C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || signupCode.replace(/\D/g, "").length !== 6}
                className="w-full rounded-full bg-[#FCAB42] py-3.5 text-sm font-bold uppercase tracking-wide text-[#13110C] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Ativando..." : "Validar e concluir cadastro"}
              </button>

              <div className="flex flex-col items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResendSignupCode}
                  className="font-medium text-[#13110C]/70 underline underline-offset-2 hover:text-[#13110C] disabled:opacity-50"
                >
                  {resendCooldown > 0
                    ? `Reenviar código em ${resendCooldown}s`
                    : "Reenviar código de ativação"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSignupStep("form")
                    setSignupCode("")
                    setError(null)
                  }}
                  className="text-[#6b655b] hover:underline"
                >
                  Voltar e editar dados
                </button>
              </div>
            </form>
          )
        ) : step === "email" ? (
          /* Step 1: Input Email to receive code OR jump to password */
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendCode()
            }}
            className="mt-6 space-y-4"
            noValidate
          >
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

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setStep("password")
                }}
                className="text-xs font-semibold text-[#13110C]/80 underline underline-offset-2 hover:text-[#13110C]"
              >
                Já tem uma senha? Entrar com senha
              </button>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-[#6b655b]">
              Se você já fez alguma compra com este e-mail, seus pedidos anteriores aparecerão automaticamente.
            </p>
          </form>
        ) : step === "code" ? (
          /* Step 2: 6-digit OTP Code interface + direct link/button to login with password */
          <form onSubmit={handleVerifyCode} className="mt-6 space-y-4" noValidate>
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

            {/* Prominent button/link to login with password instead */}
            <div className="rounded-2xl border border-[#13110C]/10 bg-[#13110C]/[0.02] p-3 text-center">
              <p className="text-xs text-[#6b655b]">Tem uma senha cadastrada?</p>
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setStep("password")
                }}
                className="mt-1 font-bold text-xs text-[#13110C] underline underline-offset-2 hover:opacity-80"
              >
                Fazer login com senha
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 pt-1 text-xs">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleSendCode()}
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
        ) : (
          /* Step 3: Login with Password */
          <form onSubmit={handleLoginWithPassword} className="mt-6 space-y-4" noValidate>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-email"
                  className="block text-xs font-bold uppercase tracking-wide text-[#13110C]"
                >
                  E-mail
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email")
                    setError(null)
                  }}
                  className="text-[11px] text-[#6b655b] hover:underline"
                >
                  Alterar
                </button>
              </div>
              <input
                id="password-email"
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

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wide text-[#13110C]"
                >
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => handleSendCode(email)}
                  disabled={loading}
                  className="text-[11px] text-[#6b655b] hover:underline hover:text-[#13110C]"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError(null)
                  }}
                  className="w-full rounded-full border border-[#13110C]/20 bg-white pl-5 pr-12 py-3 text-sm outline-none transition-colors focus:border-[#13110C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b655b] hover:text-[#13110C]"
                  aria-label={showPassword ? "Esconder senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="mt-2 w-full rounded-full bg-[#FCAB42] py-3.5 text-sm font-bold uppercase tracking-wide text-[#13110C] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar com senha"}
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  if (code) {
                    setStep("code")
                  } else {
                    handleSendCode(email)
                  }
                }}
                className="text-xs font-medium text-[#13110C]/80 underline underline-offset-2 hover:text-[#13110C]"
              >
                Entrar com código por e-mail (sem senha)
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
