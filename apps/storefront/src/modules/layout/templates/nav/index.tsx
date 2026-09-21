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

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Barra de anúncios superior / Ticker tape */}
      <div className="border-b border-[#010204] bg-[#010204] text-white py-2 px-4 text-[11px] font-bold uppercase tracking-widest text-center">
        <span>FRETE GRÁTIS ACIMA DE R$ 250 • CERÂMICA 100% FEITA À MÃO NO BRASIL • PEÇAS ÚNICAS & LIMITADAS • ATELIÊ @MANDYELLOW.JPG</span>
      </div>

      {/* Header compartimentado wireframe */}
      <header className="relative h-16 w-full border-b border-[#010204] bg-[#FFFDF9]">
        <div className="w-full h-full flex items-stretch justify-between">
          {/* Célula Esquerda: Menu */}
          <div className="flex items-stretch border-r border-[#010204]">
            <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
          </div>

          {/* Célula Central: Logo */}
          <div className="flex items-center justify-center flex-1 px-4">
            <LocalizedClientLink
              href="/"
              className="text-base sm:text-xl font-extrabold uppercase tracking-widest text-[#010204] hover:opacity-80 transition-opacity"
              data-testid="nav-store-link"
            >
              Cerami Mandy
            </LocalizedClientLink>
          </div>

          {/* Célula Direita: Conta & Carrinho */}
          <div className="flex items-stretch">
            <div className="hidden sm:flex items-stretch border-l border-[#010204]">
              <LocalizedClientLink
                className="h-full flex items-center px-6 text-xs font-bold uppercase tracking-wider text-[#010204] hover:bg-[#FFCB98]/30 transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                Conta
              </LocalizedClientLink>
            </div>
            <div className="flex items-stretch border-l border-[#010204]">
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="h-full flex items-center px-6 text-xs font-bold uppercase tracking-wider text-[#010204] hover:bg-[#FFCB98]/30 transition-colors"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    Carrinho (0)
                  </LocalizedClientLink>
                }
              >
                <div className="h-full flex items-stretch text-xs font-bold uppercase tracking-wider text-[#010204] [&_a]:h-full [&_a]:flex [&_a]:items-center [&_a]:px-6 [&_a]:hover:bg-[#FFCB98]/30 [&_a]:transition-colors">
                  <CartButton />
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
