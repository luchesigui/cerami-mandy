import Image from "next/image"

import { formatPrice } from "@/sanity/format"
import { urlFor } from "@/sanity/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import type { AVAILABLE_PRODUCTS_QUERY_RESULT } from "../../../../../sanity.types"

export type CardProduct = AVAILABLE_PRODUCTS_QUERY_RESULT[number]

type Badge = "destaque" | "novidade" | "esgotada"

const badgeStyles: Record<Badge, { label: string; className: string }> = {
  destaque: { label: "Destaque", className: "bg-[#1767BD]" },
  novidade: { label: "Novidade", className: "bg-[#BD5717]" },
  esgotada: { label: "Esgotada", className: "bg-[#BD172A]" },
}

const isBadge = (value: string): value is Badge => value in badgeStyles

export const getBadges = (product: {
  badges: string[] | null
  inventory: number | null
}): Badge[] => {
  const badges = (product.badges ?? []).filter(isBadge)

  return product.inventory === 0 ? [...badges, "esgotada"] : badges
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

  const content = (
    <>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#D9D9D9]">
        {!!badges.length && (
          <div className="absolute top-5 right-5 z-10 flex gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${badgeStyles[badge].className}`}
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
            className={`object-cover ease-out group-hover:scale-105 ${
              isUnavailable
                ? "grayscale group-hover:grayscale-0 hover:grayscale-0 transition-all duration-500"
                : "transition-transform duration-500"
            }`}
          />
        )}
      </div>

      <div className="bg-white px-5 py-4">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#FCAB42]">
          Feito a mão
        </span>
        <div className="mt-1 flex items-center justify-between gap-4 text-sm font-bold text-[#13110C]">
          <h3>{title}</h3>
          {showPrice && price && <span className="shrink-0">{price}</span>}
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
