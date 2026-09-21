import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { mockProducts } from "./mock-products"

const formatInstallments = (priceStr: string) => {
  const num = parseInt(priceStr.replace(/\D/g, ""), 10)
  if (!num) return "3x sem juros"
  const installment = Math.round(num / 3)
  return `3x de R$ ${installment} s/ juros`
}

const CeramiCatalogue = () => {
  return (
    <section
      id="catalogo"
      className="w-full border-b border-[#010204] bg-[#FFFDF9]"
      data-testid="cerami-catalogue"
    >
      {/* Grid Wireframe de Produtos */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-0 border-t-0">
        {mockProducts.map((product, idx) => {
          // Borda direita apenas se não for a última coluna no breakpoint respectivo
          const isRightEdgeSm = (idx + 1) % 2 === 0
          const isRightEdgeLg = (idx + 1) % 3 === 0

          return (
            <li
              key={product.handle}
              className={`group flex flex-col justify-between border-b border-[#010204] ${
                !isRightEdgeLg ? "lg:border-r" : "lg:border-r-0"
              } ${!isRightEdgeSm ? "sm:border-r" : "sm:border-r-0"}`}
            >
              <LocalizedClientLink
                href={`/mock/${product.handle}`}
                className="flex flex-col h-full bg-[#FFFDF9] transition-colors"
              >
                {/* 1. Imagem com moldura, proporção quadrada e efeito zoom */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#FFCB98]/30 border-b border-[#010204]">
                  {/* Badge de canto */}
                  <div className="absolute top-3 left-3 z-10 border border-[#010204] bg-[#FFFDF9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#010204] shadow-[2px_2px_0px_0px_#010204]">
                    [ PEÇA ÚNICA ]
                  </div>

                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* 2. Compartimento do Título */}
                <div className="p-4 sm:p-5 border-b border-[#010204] flex items-center justify-between group-hover:bg-[#FFCB98]/20 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold text-[#E87978] uppercase tracking-widest block mb-0.5">
                      FEITO À MÃO
                    </span>
                    <h3 className="text-sm font-extrabold text-[#010204] uppercase tracking-wider">
                      {product.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#010204] opacity-0 group-hover:opacity-100 transition-opacity">
                    VER →
                  </span>
                </div>

                {/* 3. Compartimento de Preço e Parcelamento */}
                <div className="p-4 sm:p-5 flex items-center justify-between bg-[#FFFDF9] group-hover:bg-[#FFCB98]/20 transition-colors mt-auto">
                  <span className="text-base font-black text-[#010204] tracking-tight">
                    {product.price}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#010204]/70">
                    {formatInstallments(product.price)}
                  </span>
                </div>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default CeramiCatalogue
