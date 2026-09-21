import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeader from "@modules/home/components/section-header"

import { mockProducts, MockProduct } from "./mock-products"

type Props = {
  product: MockProduct
}

const formatInstallments = (priceStr: string) => {
  const num = parseInt(priceStr.replace(/\D/g, ""), 10)
  if (!num) return "3x sem juros"
  const installment = Math.round(num / 3)
  return `3x de R$ ${installment} s/ juros no cartão ou 5% no PIX`
}

const MockProductTemplate = ({ product }: Props) => {
  const related = mockProducts.filter((p) => p.handle !== product.handle)

  return (
    <div className="w-full bg-[#FFFDF9]">
      {/* 1. Barra de Navegação Wireframe */}
      <div className="w-full border-b border-[#010204] bg-[#FFFDF9] py-3 px-6 sm:px-10 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#010204]">
        <LocalizedClientLink
          href="/#catalogo"
          className="hover:text-[#E87978] transition-colors"
        >
          ← Voltar ao catálogo
        </LocalizedClientLink>
        <span className="hidden sm:inline-block text-[#010204]/60">
          CERAMI MANDY / {product.title}
        </span>
        <span className="border border-[#010204] bg-[#FFAD40] px-2 py-0.5 text-[10px] font-extrabold text-[#010204]">
          PEÇA DEMO
        </span>
      </div>

      {/* 2. Grid Split-Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch border-b border-[#010204]">
        {/* Lado Esquerdo: Imagem com moldura wireframe */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#010204] bg-[#FFCB98]/20 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="relative aspect-square w-full max-w-[540px] border border-[#010204] bg-white overflow-hidden shadow-[8px_8px_0px_0px_#010204] group">
            <div className="absolute top-4 left-4 z-10 border border-[#010204] bg-[#FFFDF9] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#010204]">
              [ 100% FEITO À MÃO ]
            </div>

            <Image
              src={product.image}
              alt={product.alt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
        </div>

        {/* Lado Direito: Coluna de Compra Compartimentada */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#FFFDF9]">
          <div className="flex flex-col">
            {/* Célula: Categoria e Título */}
            <div className="p-6 sm:p-8 border-b border-[#010204]">
              <span className="text-xs font-bold text-[#E87978] uppercase tracking-widest block mb-2">
                PEÇA EXCLUSIVA DE DEMO
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#010204]">
                {product.title}
              </h1>
            </div>

            {/* Célula: Preço e Parcelamento */}
            <div className="p-6 sm:p-8 border-b border-[#010204] bg-[#FFCB98]/10">
              <span className="text-3xl font-black text-[#010204] tracking-tight block">
                {product.price}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#010204]/80 mt-1 block">
                {formatInstallments(product.price)}
              </span>
            </div>

            {/* Célula: Descrição */}
            <div className="p-6 sm:p-8 border-b border-[#010204]">
              <p className="text-sm sm:text-base text-[#010204]/90 leading-relaxed mb-6 font-medium">
                {product.description}
              </p>

              <div className="border border-[#010204] bg-[#FFAD40]/25 p-4 text-xs font-bold text-[#010204] uppercase tracking-wide">
                ✦ Este é um produto demonstrativo da Cerami Mandy para visualização do catálogo e layout.
              </div>
            </div>

            {/* Célula: Ações de Compra e Quantidade */}
            <div className="p-6 sm:p-8 border-b border-[#010204] flex flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#010204]">
                  Qtd:
                </span>
                <div className="flex items-center border border-[#010204] bg-white">
                  <span className="w-10 h-10 flex items-center justify-center border-r border-[#010204] text-xs font-bold text-[#010204] select-none">
                    -
                  </span>
                  <span className="w-12 h-10 flex items-center justify-center text-xs font-black text-[#010204] select-none">
                    1
                  </span>
                  <span className="w-10 h-10 flex items-center justify-center border-l border-[#010204] text-xs font-bold text-[#010204] select-none">
                    +
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full rounded-none border border-[#010204] bg-[#010204] text-white py-4 px-6 text-xs font-bold uppercase tracking-widest opacity-60 cursor-not-allowed hover:opacity-70 transition-opacity"
              >
                Comprar (Demonstração)
              </button>
            </div>

            {/* Célula: Acordeão Wireframe de Especificações */}
            <div className="divide-y divide-[#010204]">
              <details className="group p-6 cursor-pointer">
                <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#010204] list-none">
                  <span>Cuidados & Manuseio</span>
                  <span className="group-open:rotate-45 transition-transform text-base">+</span>
                </summary>
                <p className="mt-4 text-xs text-[#010204]/80 leading-relaxed font-medium">
                  Peça em argila de alta queima. Pode ir ao micro-ondas. Lavar com esponja macia para
                  preservar o brilho do esmalte. Evitar choques térmicos extremos.
                </p>
              </details>

              <details className="group p-6 cursor-pointer">
                <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#010204] list-none">
                  <span>Produção 100% Feita à Mão</span>
                  <span className="group-open:rotate-45 transition-transform text-base">+</span>
                </summary>
                <p className="mt-4 text-xs text-[#010204]/80 leading-relaxed font-medium">
                  Cada peça passa por modelagem manual, secagem lenta, queima de biscoito a 900°C,
                  pintura dos rostinhos e queima de esmalte a 1240°C.
                </p>
              </details>

              <details className="group p-6 cursor-pointer">
                <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#010204] list-none">
                  <span>Envio & Proteção Anti-Impacto</span>
                  <span className="group-open:rotate-45 transition-transform text-base">+</span>
                </summary>
                <p className="mt-4 text-xs text-[#010204]/80 leading-relaxed font-medium">
                  Embalamos com camadas generosas de proteção contra impactos para que sua cerâmica
                  chegue perfeita e segura em qualquer lugar do Brasil.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Produtos Relacionados Wireframe */}
      <SectionHeader
        title="VOCÊ TAMBÉM PODE GOSTAR"
        subtitle="PEÇAS COMPLEMENTARES"
        counter="DROP DO ATELIÊ"
      />

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-[#010204]">
        {related.slice(0, 3).map((item, idx) => {
          const isRightEdgeSm = (idx + 1) % 2 === 0
          const isRightEdgeLg = (idx + 1) % 3 === 0

          return (
            <li
              key={item.handle}
              className={`group flex flex-col justify-between border-b border-[#010204] ${
                !isRightEdgeLg ? "lg:border-r" : "lg:border-r-0"
              } ${!isRightEdgeSm ? "sm:border-r" : "sm:border-r-0"}`}
            >
              <LocalizedClientLink
                href={`/mock/${item.handle}`}
                className="flex flex-col h-full bg-[#FFFDF9] transition-colors"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#FFCB98]/30 border-b border-[#010204]">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                <div className="p-4 sm:p-5 border-b border-[#010204] flex items-center justify-between group-hover:bg-[#FFCB98]/20 transition-colors">
                  <h3 className="text-sm font-extrabold text-[#010204] uppercase tracking-wider">
                    {item.title}
                  </h3>
                  <span className="text-xs font-bold text-[#010204]">VER →</span>
                </div>

                <div className="p-4 sm:p-5 flex items-center justify-between bg-[#FFFDF9] group-hover:bg-[#FFCB98]/20 transition-colors mt-auto">
                  <span className="text-base font-black text-[#010204] tracking-tight">
                    {item.price}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#010204]/70">
                    {formatInstallments(item.price)}
                  </span>
                </div>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default MockProductTemplate
