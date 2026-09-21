import Image from "next/image"

const Hero = () => {
  return (
    <section className="w-full border-b border-[#010204] bg-[#FFAD40]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Coluna de Texto e Ação */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#010204]">
          <div>
            <div className="inline-flex items-center gap-2 self-start border border-[#010204] bg-[#FFFDF9] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#010204] mb-8">
              [ CERÂMICA AUTORAL BRASILEIRA ]
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase leading-[1.05] tracking-tight text-[#010204] mb-6">
              Peças de cerâmica com cara, alma e rostinho.
            </h1>

            <p className="text-base sm:text-lg text-[#010204]/90 max-w-xl font-medium leading-relaxed mb-10">
              Cerami Mandy cria peças autênticas, criativas e únicas, moldadas e pintadas à mão
              por @mandyellow.jpg. Cada caneca e vasilha sai do ateliê com personalidade própria para
              quem cansou de louça sem graça.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-center pt-4">
            <a
              href="#catalogo"
              className="rounded-none border border-[#010204] bg-[#010204] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#010204] transition-all"
            >
              Explorar Catálogo ↓
            </a>
            <a
              href="https://www.instagram.com/cerami.mandy/"
              target="_blank"
              rel="noreferrer"
              className="rounded-none border border-[#010204] bg-transparent text-[#010204] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#010204] hover:text-white transition-all"
            >
              Instagram @cerami.mandy ↗
            </a>
          </div>
        </div>

        {/* Coluna da Imagem / Logo Ícone */}
        <div className="lg:col-span-5 relative bg-[#FFCB98]/50 flex items-center justify-center p-8 sm:p-12 overflow-hidden group">
          <div className="relative w-full max-w-[340px] aspect-square border border-[#010204] bg-white overflow-hidden shadow-[8px_8px_0px_0px_#010204]">
            <Image
              src="/cerami/logo.jpg"
              alt="Logotipo da Cerami Mandy: rosto ilustrado sobre fundo laranja com lettering retrô"
              fill
              priority
              sizes="(min-width: 1024px) 35vw, 90vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
