import { Metadata } from "next"

import { sanityFetch } from "@/sanity/live"
import { ALL_SOLD_PRODUCTS_QUERY } from "@/sanity/queries"
import ProductCard from "@modules/home/components/cerami-catalogue/product-card"

export const metadata: Metadata = {
  title: "Vendidas | Cerami Mandy",
  description: "Canequinhas que já encontraram seu par.",
}

export const dynamic = "force-dynamic"

export default async function SoldPage() {
  const { data: products } = await sanityFetch({ query: ALL_SOLD_PRODUCTS_QUERY })

  return (
    <section className="w-full bg-[#13110C] px-4 py-14 sm:px-10 sm:py-16">
      <h1 className="mb-10 text-center text-lg font-bold uppercase tracking-wide text-white sm:mb-12 sm:text-2xl">
        Canequinhas que encontraram seu par
      </h1>
      {products.length ? (
        <ul className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              showPrice={false}
            />
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-white">
          Nenhuma peça vendida ainda.
        </p>
      )}
    </section>
  )
}
