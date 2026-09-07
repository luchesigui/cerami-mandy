import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { mockProducts, MockProduct } from "./mock-products"

type Props = {
  product: MockProduct
}

const MockProductTemplate = ({ product }: Props) => {
  const related = mockProducts.filter((p) => p.handle !== product.handle)

  return (
    <div className="content-container py-10 small:py-16 flex flex-col gap-y-16">
      <LocalizedClientLink
        href="/#catalogo"
        className="txt-small-plus text-[#E87978] uppercase w-fit"
      >
        Voltar ao catálogo
      </LocalizedClientLink>

      <div className="grid grid-cols-1 small:grid-cols-2 gap-8 small:gap-12">
        <div className="relative aspect-square rounded-large overflow-hidden bg-[#FFCB98]">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-2">
            <span className="txt-small-plus text-[#E87978] uppercase">
              Produto demonstrativo
            </span>
            <h1 className="text-3xl text-[#010204] font-medium">
              {product.title}
            </h1>
            <span className="text-2xl text-[#010204]">{product.price}</span>
          </div>

          <p className="text-ui-fg-subtle max-w-md">{product.description}</p>

          <div className="rounded-large border border-[#FFAD40] bg-[#FFCB98]/40 px-4 py-3 text-sm text-[#010204]">
            Este é um produto demonstrativo. A compra ainda não está disponível
            nesta loja de exemplo.
          </div>

          <div className="flex items-center gap-x-4">
            <div className="flex items-center rounded-full border border-ui-border-base">
              <span className="px-4 py-2 txt-medium-plus text-[#010204]">
                1
              </span>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Compra indisponível no produto demonstrativo"
              className="flex-1 rounded-full bg-[#FFAD40] px-6 py-3 txt-medium-plus text-[#010204] opacity-50 cursor-not-allowed"
            >
              Comprar (demo)
            </button>
          </div>
        </div>
      </div>

      <section aria-label="Peças relacionadas" className="flex flex-col gap-y-6">
        <h2 className="text-2xl text-[#010204] font-medium">
          Você também pode gostar
        </h2>
        <ul className="grid grid-cols-2 small:grid-cols-3 gap-6">
          {related.slice(0, 3).map((item) => (
            <li key={item.handle}>
              <LocalizedClientLink
                href={`/mock/${item.handle}`}
                className="flex flex-col gap-y-3 rounded-large border border-ui-border-base bg-white overflow-hidden"
              >
                <div className="relative aspect-square bg-[#FFCB98]">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-x-4 px-4 pb-4">
                  <span className="txt-medium-plus text-[#010204]">
                    {item.title}
                  </span>
                  <span className="txt-medium-plus text-[#010204] whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default MockProductTemplate
