"use client"

import { useEffect, useState } from "react"

import { getBagProducts, type BagProduct } from "./actions"
import { useBag } from "./bag-context"

// Resolves the stored ids against Sanity so prices and availability are current.
export function useBagProducts() {
  const { ids, hydrated } = useBag()
  const [products, setProducts] = useState<BagProduct[]>([])
  const [loading, setLoading] = useState(true)
  const key = ids.join(",")

  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    setLoading(true)
    getBagProducts(key ? key.split(",") : [])
      .then((result) => {
        if (!cancelled) setProducts(result)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [key, hydrated])

  // Ids that no longer exist in Sanity (deleted pieces) count as unavailable.
  const missing = ids.filter((id) => !products.some((p) => p.id === id))
  const items = ids.flatMap((id) => products.filter((p) => p.id === id))
  const subtotal = items
    .filter((item) => item.available)
    .reduce((sum, item) => sum + item.price, 0)
  const hasUnavailable =
    !loading && (items.some((item) => !item.available) || missing.length > 0)

  return { items, missing, subtotal, hasUnavailable, loading }
}
