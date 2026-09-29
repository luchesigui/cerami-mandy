"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { useBag } from "../bag-context"

const BagNavLink = ({ className }: { className?: string }) => {
  const { count } = useBag()

  return (
    <LocalizedClientLink
      className={className}
      href="/sacola"
      data-testid="nav-cart-link"
    >
      Sacola ({count})
    </LocalizedClientLink>
  )
}

export default BagNavLink
