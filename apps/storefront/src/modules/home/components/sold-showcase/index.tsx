import { sanityFetch } from "@/sanity/live"
import { SOLD_PRODUCTS_QUERY } from "@/sanity/queries"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/home/components/cerami-catalogue/product-card"

const SoldShowcase = async () => {
  const { data: products } = await sanityFetch({ query: SOLD_PRODUCTS_QUERY })

  if (!products.length) {
    return null
  }

  return (
    <section className="w-full bg-[#13110C] px-4 py-14 sm:px-10 sm:py-16">
      <h2 className="mb-10 text-center text-lg font-bold uppercase tracking-wide text-white sm:mb-12 sm:text-2xl">
        Canequinhas que encontraram seu par
      </h2>
      <ul className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            showPrice={false}
          />
        ))}
      </ul>
      <div className="mt-12 flex justify-center">
        <LocalizedClientLink
          href="/vendidas"
          className="rounded-full bg-[#FCAB42] px-9 py-4 text-sm font-bold uppercase tracking-wide text-[#13110C] transition-colors hover:bg-white"
        >
          Ver todas
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default SoldShowcase
