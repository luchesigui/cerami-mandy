"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react"
import { usePathname, useRouter } from "next/navigation"

export type CustomerSession = {
  id?: string
  name?: string
  email?: string
}

type AuthContextValue = {
  authenticated: boolean
  customer: CustomerSession | null
  loaded: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cm:auth-change"))
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [customer, setCustomer] = useState<CustomerSession | null>(null)
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/sessao", { cache: "no-store" })
      if (!res.ok) {
        setAuthenticated(false)
        setCustomer(null)
        setLoaded(true)
        return
      }
      const data = await res.json()
      setAuthenticated(!!data.authenticated)
      setCustomer(data.customer || null)
    } catch {
      setAuthenticated(false)
      setCustomer(null)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession, pathname])

  useEffect(() => {
    const handleAuthChange = () => {
      fetchSession()
    }
    window.addEventListener("cm:auth-change", handleAuthChange)
    return () => {
      window.removeEventListener("cm:auth-change", handleAuthChange)
    }
  }, [fetchSession])

  const refresh = useCallback(async () => {
    await fetchSession()
  }, [fetchSession])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/sair", { method: "POST" })
    } catch {
      // ignore network errors on logout
    }
    setAuthenticated(false)
    setCustomer(null)
    notifyAuthChange()
    startTransition(() => {
      router.push("/")
      router.refresh()
    })
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        customer,
        loaded,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
