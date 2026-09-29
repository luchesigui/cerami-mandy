import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions()
      .then((regions: StoreRegion[]) => regions)
      .catch(() => null),
    listLocales().catch(() => null),
    getLocale().catch(() => null),
  ])

  const linkClassName =
    "h-full flex items-center px-5 sm:px-6 text-sm uppercase text-white hover:text-[#FCAB42] transition-colors"

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-[50px] w-full bg-[#13110C]">
        <nav className="h-full flex items-stretch justify-between px-2 sm:px-4">
          <div className="flex items-stretch">
            <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
          </div>

          <div className="flex items-stretch py-[5px]">
            <LocalizedClientLink
              className={`hidden sm:flex ${linkClassName}`}
              href="/account"
              data-testid="nav-account-link"
            >
              Conta
            </LocalizedClientLink>
            <div className="flex items-stretch sm:border-l sm:border-white/30">
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className={linkClassName}
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    Carrinho (0)
                  </LocalizedClientLink>
                }
              >
                <div className="h-full flex items-stretch text-sm uppercase text-white [&_a]:uppercase [&_a]:h-full [&_a]:flex [&_a]:items-center [&_a]:px-5 sm:[&_a]:px-6 [&_a]:hover:text-[#FCAB42] [&_a]:transition-colors">
                  <CartButton />
                </div>
              </Suspense>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
