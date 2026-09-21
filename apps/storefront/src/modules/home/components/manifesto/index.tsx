import React from "react"

export default function Manifesto() {
  return (
    <section className="w-full border-b border-[#010204] bg-[#FFCB98]/30 py-20 px-6 sm:px-12 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 border border-[#010204] bg-[#FFFDF9] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#010204] mb-6 shadow-[2px_2px_0px_0px_#010204]">
          [ MANIFESTO DO ATELIÊ ]
        </div>

        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#010204] mb-6">
          THE ANTI-BORING CERAMICS ATELIER
        </h2>

        <p className="text-base sm:text-lg text-[#010204]/90 font-medium leading-relaxed mb-10 max-w-2xl">
          Sim, cada caneca e vasilha aqui tem carinha, sardas, sentimentos e personalidade. Nada de
          peças genéricas saídas de fábrica ou louça sem alma. Tudo é moldado, ilustrado e queimado
          em alta temperatura por @mandyellow.jpg no Brasil. Feito para quem gosta de café com arte e
          sorriso no rosto.
        </p>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          <a
            href="https://www.instagram.com/cerami.mandy/"
            target="_blank"
            rel="noreferrer"
            className="rounded-none border border-[#010204] bg-[#010204] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#010204] transition-all"
          >
            Acompanhar no Instagram ↗
          </a>
          <a
            href="#catalogo"
            className="rounded-none border border-[#010204] bg-white text-[#010204] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#010204] hover:text-white transition-all"
          >
            Ver Peças Disponíveis ↓
          </a>
        </div>
      </div>
    </section>
  )
}
