import { sanityFetch } from "@/sanity/live"
import { AVAILABLE_PRODUCTS_QUERY } from "@/sanity/queries"

import ProductCard from "./product-card"

const CeramiCatalogue = async () => {
  const { data: products } = await sanityFetch({
    query: AVAILABLE_PRODUCTS_QUERY,
  })

  return (
    <section
      id="catalogo"
      className="w-full bg-white px-4 py-14 sm:px-10 sm:py-16"
      data-testid="cerami-catalogue"
    >
      <h2 className="mb-10 text-center text-lg font-bold uppercase tracking-wide text-[#13110C] sm:mb-12 sm:text-2xl">
        Peças exclusivas &amp; disponíveis
      </h2>
      {products.length ? (
        <ul className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-[#13110C]">
          Novas peças em breve.
        </p>
      )}
    </section>
  )
}

export default CeramiCatalogue
