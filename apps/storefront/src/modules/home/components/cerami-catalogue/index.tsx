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
        <div className="mx-auto max-w-md whitespace-pre-line text-center text-sm text-[#13110C]">
          {
            "Prateleiras limpas! 💛\n\nQuem pegou, pegou. Quem não pegou vai ter que esperar o forno abrir de novo!\n\nPara ver o que vem por aí e não ficar sem a sua na próxima, me segue lá no Instagram:\n\n"
          }
          <a
            href="https://www.instagram.com/cerami.mandy/"
            target="_blank"
            rel="noreferrer"
            className="font-bold underline underline-offset-2"
          >
            👉 @cerami.mandy
          </a>
        </div>
      )}
    </section>
  )
}

export default CeramiCatalogue
