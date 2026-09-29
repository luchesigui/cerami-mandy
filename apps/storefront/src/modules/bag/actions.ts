"use server"

import { urlFor } from "@/sanity/image"
import { BAG_PRODUCTS_QUERY } from "@/sanity/queries"
import { serverClient } from "@/sanity/server-client"

export type BagProduct = {
  id: string
  title: string
  slug: string | null
  price: number
  imageUrl: string | null
  imageAlt: string
  available: boolean
}

export async function getBagProducts(ids: string[]): Promise<BagProduct[]> {
  if (!ids.length) return []

  const products = await serverClient.fetch(BAG_PRODUCTS_QUERY, {
    ids: ids.slice(0, 20),
  })

  return products.map((product) => ({
    id: product._id,
    title: product.title ?? "",
    slug: product.slug,
    price: product.price ?? 0,
    imageUrl: product.image?.asset
      ? urlFor(product.image).width(240).height(300).fit("crop").auto("format").url()
      : null,
    imageAlt: product.image?.alt ?? product.title ?? "",
    available: !!product.available,
  }))
}
