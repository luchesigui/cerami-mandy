"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useAuth } from "@modules/auth/auth-context"

export default function AccountNavLink({ className }: { className?: string }) {
  const { authenticated, logout } = useAuth()

  if (authenticated) {
    return (
      <>
        <LocalizedClientLink
          href="/conta"
          className={className}
          data-testid="nav-account-link"
          title="Minha Conta"
        >
          Minha Conta
        </LocalizedClientLink>
        <button
          type="button"
          onClick={logout}
          className={className}
          data-testid="nav-logout-button"
          title="Sair da conta"
        >
          Sair
        </button>
      </>
    )
  }

  return (
    <LocalizedClientLink href="/entrar" className={className} data-testid="nav-account-link">
      Entrar
    </LocalizedClientLink>
  )
}
