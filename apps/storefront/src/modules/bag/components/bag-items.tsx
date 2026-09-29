"use client"

import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatShippingPrice } from "@/sanity/format"

import type { BagProduct } from "../actions"
import { useBag } from "../bag-context"

type Props = {
  items: BagProduct[]
  missing: string[]
  editable?: boolean
}

const BagItems = ({ items, missing, editable = true }: Props) => {
  const { remove } = useBag()

  return (
    <ul className="divide-y divide-[#13110C]/10">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 py-4">
          <div className="relative h-[100px] w-[80px] shrink-0 overflow-hidden rounded-xl bg-[#F4EFE6]">
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                fill
                sizes="80px"
                className={`object-cover ${item.available ? "" : "opacity-40 grayscale"}`}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {item.slug ? (
              <LocalizedClientLink
                href={`/produtos/${item.slug}`}
                className="font-bold hover:underline"
              >
                {item.title}
              </LocalizedClientLink>
            ) : (
              <span className="font-bold">{item.title}</span>
            )}
            {item.available ? (
              <p className="mt-1 text-sm">{formatShippingPrice(item.price)}</p>
            ) : (
              <p className="mt-1 text-sm font-bold text-red-700">
                Esta peça já foi vendida
              </p>
            )}
          </div>
          {(editable || !item.available) && (
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="text-xs uppercase underline underline-offset-2 text-[#13110C]/70 hover:text-[#13110C]"
            >
              Remover
            </button>
          )}
        </li>
      ))}
      {missing.map((id) => (
        <li key={id} className="flex items-center justify-between gap-4 py-4 text-sm">
          <span className="font-bold text-red-700">
            Uma peça da sacola não está mais disponível
          </span>
          <button
            type="button"
            onClick={() => remove(id)}
            className="text-xs uppercase underline underline-offset-2"
          >
            Remover
          </button>
        </li>
      ))}
    </ul>
  )
}

export default BagItems
