import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { mockProducts } from "./mock-products"

const CeramiCatalogue = () => {
  return (
    <section
      id="catalogo"
      className="content-container py-16 small:py-24"
      data-testid="cerami-catalogue"
    >
      <div className="flex flex-col gap-y-2 mb-10">
        <span className="txt-small-plus text-[#E87978] uppercase">
          Catálogo demo
        </span>
        <h2 className="text-3xl text-[#010204] font-medium">
          Peças únicas de demonstração
        </h2>
        <p className="text-ui-fg-subtle max-w-xl">
          Seis peças de exemplo para apresentar a loja. Fotos retiradas do perfil
          da marca; fotografias oficiais de produto ainda serão adicionadas.
        </p>
      </div>
      <ul className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6">
        {mockProducts.map((product) => (
          <li key={product.handle}>
            <LocalizedClientLink
              href={`/mock/${product.handle}`}
              className="flex flex-col gap-y-3 rounded-large border border-ui-border-base bg-white overflow-hidden"
            >
              <div className="relative aspect-square bg-[#FFCB98]">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 512px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-start justify-between gap-x-4 px-4 pb-4">
                <div className="flex flex-col">
                  <span className="txt-medium-plus text-[#010204]">
                    {product.title}
                  </span>
                  <span className="txt-small text-ui-fg-subtle">
                    Peça demo
                  </span>
                </div>
                <span className="txt-medium-plus text-[#010204] whitespace-nowrap">
                  {product.price}
                </span>
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default CeramiCatalogue
