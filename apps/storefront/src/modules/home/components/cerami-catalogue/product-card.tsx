import Image from "next/image"

import { formatPrice } from "@/sanity/format"
import { urlFor } from "@/sanity/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import type { AVAILABLE_PRODUCTS_QUERY_RESULT } from "../../../../../sanity.types"

export type CardProduct = AVAILABLE_PRODUCTS_QUERY_RESULT[number]

type Badge = "destaque" | "novidade" | "esgotada" | "reservada"

const badgeStyles: Record<Badge, { label: string; className: string }> = {
  destaque: { label: "Destaque", className: "bg-[#1767BD] text-white" },
  novidade: { label: "Novidade", className: "bg-[#BD5717] text-white" },
  esgotada: { label: "Vendida", className: "bg-[#BD172A] text-white" },
  reservada: { label: "Reservada", className: "bg-[#EAB308] text-[#13110C]" },
}

const isBadge = (value: string): value is Badge => value in badgeStyles

export const getBadges = (product: {
  badges: string[] | null
  inventory: number | null
  reserved?: boolean | null
}): Badge[] => {
  const badges = (product.badges ?? []).filter(isBadge)

  if (product.inventory === 0) {
    return badges.includes("esgotada") ? badges : [...badges, "esgotada"]
  }
  if (product.reserved) {
    return badges.includes("reservada") ? badges : [...badges, "reservada"]
  }
  return badges
}

type ProductCardProps = {
  product: CardProduct
  showPrice?: boolean
  linked?: boolean
  isAvailable?: boolean
}

const ProductCard = ({
  product,
  showPrice = true,
  linked = true,
  isAvailable,
}: ProductCardProps) => {
  const badges = getBadges(product)
  const isUnavailable =
    isAvailable !== undefined
      ? !isAvailable
      : product.inventory === 0 ||
        badges.includes("esgotada") ||
        (product.inventory !== null && product.inventory !== undefined && product.inventory <= 0)
  const price = formatPrice(product.price)
  const title = product.title ?? ""
  const hoverImage =
    !isUnavailable && product.hoverImage?.asset ? product.hoverImage : null

  const content = (
    <>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#D9D9D9]">
        {!!badges.length && (
          <div className="absolute top-5 right-5 z-10 flex gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[badge].className}`}
              >
                {badgeStyles[badge].label}
              </span>
            ))}
          </div>
        )}
        {product.image?.asset && (
          <Image
            src={urlFor(product.image).width(900).height(1125).fit("crop").auto("format").url()}
            alt={product.image.alt ?? title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover ease-out ${
              isUnavailable
                ? "grayscale group-hover:grayscale-0 hover:grayscale-0 transition-all duration-500"
                : ""
            }`}
          />
        )}
        {hoverImage && (
          <Image
            src={urlFor(hoverImage).width(900).height(1125).fit("crop").auto("format").url()}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            aria-hidden
            className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-active:opacity-100"
          />
        )}
      </div>

      <div className="bg-white px-5 py-4">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#FCAB42]">
          Feito a mão
        </span>
        <div className="mt-1 flex items-center justify-between gap-4 text-sm font-bold text-[#13110C]">
          <h3>{title}</h3>
          {showPrice && price && (
            <span className="shrink-0 bg-[#FCAB42] px-3 py-1">{price}</span>
          )}
        </div>
      </div>
    </>
  )

  return (
    <li className="group">
      {linked && product.slug ? (
        <LocalizedClientLink href={`/produtos/${product.slug}`} className="block">
          {content}
        </LocalizedClientLink>
      ) : (
        content
      )}
    </li>
  )
}

export default ProductCard
