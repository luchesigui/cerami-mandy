import Image from "next/image"
import { PortableText, type PortableTextComponents } from "next-sanity"

import { formatPrice } from "@/sanity/format"
import { urlFor } from "@/sanity/image"
import AddToBagButton from "@modules/bag/components/add-to-bag-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import type {
  PRODUCT_BY_SLUG_QUERY_RESULT,
  RELATED_PRODUCTS_QUERY_RESULT,
} from "../../../../../sanity.types"
import ProductCard from "./product-card"
import ProductGallery from "./product-gallery"

type Props = {
  product: NonNullable<PRODUCT_BY_SLUG_QUERY_RESULT>
  related: RELATED_PRODUCTS_QUERY_RESULT
}

const descriptionComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 text-base font-bold first:mt-0">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mb-4 border-l-2 border-[#FCAB42] pl-4 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc pl-5">{children}</ul>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
}

const fallbackRelated: RELATED_PRODUCTS_QUERY_RESULT = [
  {
    _id: "demo-sim-1",
    title: "Nome da Caneca",
    slug: "nome-da-caneca",
    price: 390,
    badges: ["destaque", "novidade"],
    inventory: 5,
    reserved: false,
    image: null,
  },
  {
    _id: "demo-sim-2",
    title: "Nome da Caneca",
    slug: "nome-da-caneca-2",
    price: 390,
    badges: ["novidade"],
    inventory: 5,
    reserved: false,
    image: null,
  },
  {
    _id: "demo-sim-3",
    title: "Nome da Caneca",
    slug: "nome-da-caneca-3",
    price: 390,
    badges: ["novidade"],
    inventory: 5,
    reserved: false,
    image: null,
  },
]

const ProductTemplate = ({ product, related }: Props) => {
  const title = product.title ?? "Nome da Caneca"
  const soldOut = product.inventory === 0
  const price = formatPrice(product.price)
  const compareAtPrice = formatPrice(product.compareAtPrice)

  const gallery = (product.images ?? [])
    .filter((image) => image.asset)
    .map((image) => ({
      src: urlFor(image).width(1200).height(1500).fit("crop").auto("format").url(),
      alt: image.alt ?? title,
    }))

  const displayRelated = related && related.length ? related : fallbackRelated

  return (
    <div className="w-full bg-white">
      {/* Top Banner with Logo */}
      <div className="flex justify-center bg-[#FCAB42] px-6 py-4 sm:py-5">
        <LocalizedClientLink href="/" aria-label="Cerami Mandy - início">
          <Image
            src="/cerami/logo-horizontal.png"
            alt="Cerami Mandy"
            width={734}
            height={242}
            priority
            className="h-auto w-[160px] sm:w-[200px]"
          />
        </LocalizedClientLink>
      </div>

      {/* Main PDP Grid: Gallery (Left) & Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_384px] xl:grid-cols-[minmax(0,1fr)_440px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <ProductGallery images={gallery} isUnavailable={soldOut} />

        <div className="flex flex-col justify-between px-8 py-10 lg:px-12 lg:py-14 bg-white min-h-[440px]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FCAB42]">
              Feito a mão
            </span>
            <h1 className="mt-2 text-2xl font-bold text-[#13110C] 2xl:text-3xl">
              {title}
            </h1>
            {product.description?.length ? (
              <div className="mt-4 max-w-[380px] text-sm leading-relaxed text-[#13110C]">
                <PortableText
                  value={product.description}
                  components={descriptionComponents}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-[#13110C]">
                Descrição da caneca
              </p>
            )}
          </div>

          <div className="mt-12 lg:mt-24">
            {price && (
              <div className="mb-2">
                <span className="text-2xl font-bold text-[#13110C] sm:text-3xl">
                  {price}
                </span>
                {compareAtPrice && (
                  <span className="ml-3 text-base text-[#13110C]/50 line-through">
                    {compareAtPrice}
                  </span>
                )}
              </div>
            )}
            <AddToBagButton
            productId={product._id}
            soldOut={soldOut}
            reserved={!!product.reserved}
          />
          </div>
        </div>
      </div>

      {/* Informações Adicionais (textos fixos no template) */}
      <section className="border-t border-[#13110C]/10 bg-white px-6 py-12 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-[#13110C]">
            INFORMAÇÕES ADICIONAIS
          </h2>
          <div className="max-w-4xl space-y-4 text-sm leading-relaxed text-[#13110C]">
            <p>
              <strong className="font-bold">✨ 100% Modelada e Pintada à Mão:</strong>{" "}
              Da modelagem inicial de cada curva aos detalhes minuciosos da pintura, tudo foi feito manualmente. É uma escultura utilitária criada sem moldes industriais — o que significa formas orgânicas, personalidade viva e a certeza de que é uma peça absolutamente única no mundo, assim como você!
            </p>
            <p>
              <strong className="font-bold">Material:</strong> Cerâmica de alta temperatura.
            </p>
            <p>
              <strong className="font-bold">Cuidados:</strong> Para conservar a peça, lave com água, sabão neutro e esponja macia, evitando o uso de produtos abrasivos. Pode ir na máquina de lavar e no microondas.
            </p>
          </div>
        </div>
      </section>

      {/* Produtos Similares */}
      <section className="bg-[#FFFDF9] px-6 py-16 sm:py-20 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="mb-10 text-center text-xl font-bold uppercase tracking-widest text-[#13110C] sm:mb-14 sm:text-2xl">
            PRODUTOS SIMILARES
          </h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayRelated.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

export default ProductTemplate
