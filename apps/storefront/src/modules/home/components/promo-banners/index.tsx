import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PromoBanners() {
  return (
    <section className="w-full border-b border-[#010204] bg-[#FFFDF9]">
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
        {/* Banner 1: Coleção Carinhas */}
        <div className="border-b md:border-b-0 md:border-r border-[#010204] p-8 sm:p-12 flex flex-col justify-between group bg-[#FFCB98]/20">
          <div>
            <div className="inline-flex items-center border border-[#010204] bg-[#FFFDF9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#010204] mb-6">
              [ DROP ASSINATURA ]
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#010204] mb-4">
              Coleção Carinhas & Duos
            </h3>
            <p className="text-sm sm:text-base text-[#010204]/80 font-medium mb-8 leading-relaxed max-w-md">
              Canecas empilháveis que conversam entre si. Cada rostinho é desenhado à mão livre
              antes da queima de esmalte.
            </p>
          </div>

          <div className="relative aspect-[16/10] w-full border border-[#010204] overflow-hidden mb-6 bg-white">
            <Image
              src="/cerami/produto-1.jpg"
              alt="Caneca Duo Carinhas Cerami Mandy"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>

          <LocalizedClientLink
            href="/mock/caneca-duo-carinhas"
            className="self-start rounded-none border border-[#010204] bg-[#010204] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#010204] transition-all"
          >
            Ver Caneca Duo →
          </LocalizedClientLink>
        </div>

        {/* Banner 2: Vasilhas & Formas */}
        <div className="p-8 sm:p-12 flex flex-col justify-between group bg-[#FFAD40]/20">
          <div>
            <div className="inline-flex items-center border border-[#010204] bg-[#FFFDF9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#010204] mb-6">
              [ PEÇAS ESCULTÓRICAS ]
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#010204] mb-4">
              Vasilhas & Peças de Mesa
            </h3>
            <p className="text-sm sm:text-base text-[#010204]/80 font-medium mb-8 leading-relaxed max-w-md">
              Formatos orgânicos, texturas táteis e esmaltes vibrantes que transformam a mesa em
              uma galeria de arte autoral.
            </p>
          </div>

          <div className="relative aspect-[16/10] w-full border border-[#010204] overflow-hidden mb-6 bg-white">
            <Image
              src="/cerami/produto-5.jpg"
              alt="Vasilha Alice Cerami Mandy"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>

          <LocalizedClientLink
            href="/mock/vasilha-alice"
            className="self-start rounded-none border border-[#010204] bg-[#010204] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#010204] transition-all"
          >
            Ver Vasilha Alice →
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
