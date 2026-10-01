"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import type { ShippingOption } from "@lib/shipping/types"

const STORAGE_KEY = "cerami-bag"

type BagState = {
  ids: string[]
  cep: string
  shipping: ShippingOption | null
}

type BagContextValue = BagState & {
  hydrated: boolean
  count: number
  has: (id: string) => boolean
  add: (id: string) => void
  remove: (id: string) => void
  setCep: (cep: string) => void
  setShipping: (option: ShippingOption | null) => void
  clear: () => void
}

const EMPTY: BagState = { ids: [], cep: "", shipping: null }

const BagContext = createContext<BagContextValue | null>(null)

const readStorage = (): BagState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<BagState>
    return {
      ids: Array.isArray(parsed.ids) ? parsed.ids : [],
      cep: typeof parsed.cep === "string" ? parsed.cep : "",
      shipping: parsed.shipping ?? null,
    }
  } catch {
    return EMPTY
  }
}

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BagState>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(readStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage unavailable (private mode); the bag lives for this visit only.
    }
  }, [state, hydrated])

  const has = useCallback((id: string) => state.ids.includes(id), [state.ids])

  // Any change to the items invalidates the quote, since it depends on the packages.
  const add = useCallback((id: string) => {
    setState((prev) =>
      prev.ids.includes(id)
        ? prev
        : { ...prev, ids: [...prev.ids, id], shipping: null }
    )
  }, [])

  const remove = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      ids: prev.ids.filter((item) => item !== id),
      shipping: null,
    }))
  }, [])

  const setCep = useCallback((cep: string) => {
    setState((prev) =>
      prev.cep === cep ? prev : { ...prev, cep, shipping: null }
    )
  }, [])

  const setShipping = useCallback((shipping: ShippingOption | null) => {
    setState((prev) => ({ ...prev, shipping }))
  }, [])

  const clear = useCallback(() => {
    setState((prev) => ({ ...EMPTY, cep: prev.cep }))
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      count: state.ids.length,
      has,
      add,
      remove,
      setCep,
      setShipping,
      clear,
    }),
    [state, hydrated, has, add, remove, setCep, setShipping, clear]
  )

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>
}

export function useBag() {
  const context = useContext(BagContext)
  if (!context) {
    throw new Error("useBag must be used within a BagProvider")
  }
  return context
}
