"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function AccountNavLink({ className }: { className?: string }) {
  const [auth, setAuth] = useState<{
    loaded: boolean
    authenticated: boolean
    name?: string
  }>({
    loaded: false,
    authenticated: false,
  })

  useEffect(() => {
    fetch("/api/auth/sessao")
      .then((res) => res.json())
      .then((data) => {
        setAuth({
          loaded: true,
          authenticated: !!data.authenticated,
          name: data.customer?.name?.split(" ")[0] || undefined,
        })
      })
      .catch(() => {
        setAuth({ loaded: true, authenticated: false })
      })
  }, [])

  const href = auth.authenticated ? "/conta" : "/entrar"
  const label = auth.authenticated
    ? auth.name
      ? `Olá, ${auth.name}`
      : "Minha Conta"
    : "Entrar"

  return (
    <LocalizedClientLink href={href} className={className} data-testid="nav-account-link">
      {label}
    </LocalizedClientLink>
  )
}
