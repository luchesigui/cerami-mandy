import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  }).catch(() => ({ collections: [] }))
  const productCategories = await listCategories().catch(() => [])

  return (
    <footer className="w-full border-t border-[#010204] bg-[#FFFDF9] text-[#010204]" data-store="footer">
      {/* 1. Faixa de Redes Sociais Wireframe */}
      <div className="w-full border-b border-[#010204] grid grid-cols-1 md:grid-cols-12 items-stretch">
        <div className="md:col-span-4 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-[#010204] flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-[#010204]">
            SIGA O ATELIÊ NO
          </span>
          <span className="text-xs font-bold text-[#E87978]">✦</span>
        </div>
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 divide-x divide-[#010204]">
          <a
            href="https://www.instagram.com/cerami.mandy/"
            target="_blank"
            rel="noreferrer"
            className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#010204] hover:bg-[#FFCB98]/30 transition-colors flex items-center justify-between"
          >
            <span>Instagram</span>
            <span>↗</span>
          </a>
          <a
            href="https://www.instagram.com/mandyellow.jpg/"
            target="_blank"
            rel="noreferrer"
            className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#010204] hover:bg-[#FFCB98]/30 transition-colors flex items-center justify-between"
          >
            <span>@mandyellow</span>
            <span>↗</span>
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#010204] hover:bg-[#FFCB98]/30 transition-colors flex items-center justify-between col-span-2 sm:col-span-1"
          >
            <span>TikTok</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {/* 2. Grid Principal do Rodapé */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 items-stretch border-b border-[#010204]">
        {/* Coluna 1: Newsletter */}
        <div className="md:col-span-6 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-[#010204] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#E87978] uppercase tracking-widest block mb-2">
              [ CLUBE DO FORNO ]
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#010204] mb-4">
              Receba avisos de novas queimas
            </h3>
            <p className="text-sm text-[#010204]/80 font-medium mb-6 leading-relaxed max-w-md">
              Nossas peças são feitas em pequenos lotes e esgotam rápido. Cadastre seu e-mail para
              saber primeiro dos novos drops e reposições.
            </p>
          </div>

          <form
            onSubmit={undefined}
            className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 max-w-md"
          >
            <input
              type="email"
              placeholder="Seu melhor e-mail..."
              className="flex-1 rounded-none border border-[#010204] bg-white px-4 py-3 text-xs text-[#010204] placeholder:text-[#010204]/40 focus:outline-none focus:ring-1 focus:ring-[#010204]"
              required
            />
            <button
              type="submit"
              className="rounded-none border border-[#010204] sm:border-l-0 bg-[#010204] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#010204] transition-colors"
            >
              Assinar
            </button>
          </form>
        </div>

        {/* Coluna 2: Categorias & Coleções */}
        <div className="md:col-span-3 p-8 border-b md:border-b-0 md:border-r border-[#010204] flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-[#010204] mb-6 pb-2 border-b border-[#010204]/20">
            Navegação
          </span>
          <ul className="flex flex-col gap-y-3 text-xs font-bold uppercase tracking-wider text-[#010204]">
            <li>
              <LocalizedClientLink href="/#catalogo" className="hover:text-[#E87978] transition-colors">
                Lançamentos da Queima
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink href="/mock/caneca-duo-carinhas" className="hover:text-[#E87978] transition-colors">
                Coleção Carinhas
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink href="/mock/vasilha-alice" className="hover:text-[#E87978] transition-colors">
                Vasilhas & Pratos
              </LocalizedClientLink>
            </li>
            {collections && collections.slice(0, 3).map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/collections/${c.handle}`}
                  className="hover:text-[#E87978] transition-colors"
                >
                  {c.title}
                </LocalizedClientLink>
              </li>
            ))}
            {productCategories && productCategories.slice(0, 3).map((cat) => (
              <li key={cat.id}>
                <LocalizedClientLink
                  href={`/categories/${cat.handle}`}
                  className="hover:text-[#E87978] transition-colors"
                >
                  {cat.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 3: Ateliê & Ajuda */}
        <div className="md:col-span-3 p-8 flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-[#010204] mb-6 pb-2 border-b border-[#010204]/20">
            Ateliê
          </span>
          <ul className="flex flex-col gap-y-3 text-xs font-bold uppercase tracking-wider text-[#010204]">
            <li>
              <a
                href="https://www.instagram.com/cerami.mandy/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E87978] transition-colors"
              >
                Sobre @mandyellow.jpg
              </a>
            </li>
            <li>
              <LocalizedClientLink href="/store" className="hover:text-[#E87978] transition-colors">
                Loja Completa
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink href="/account" className="hover:text-[#E87978] transition-colors">
                Minha Conta
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink href="/cart" className="hover:text-[#E87978] transition-colors">
                Carrinho
              </LocalizedClientLink>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Barra de Copyright & Informações Legais */}
      <div className="w-full py-6 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between text-xs font-bold uppercase tracking-wider text-[#010204]/70 gap-y-2">
        <span>© {new Date().getFullYear()} CERAMI MANDY. TODOS OS DIREITOS RESERVADOS.</span>
        <span className="text-[11px] font-semibold text-[#010204]/50">
          DESIGN WIREFRAME AUTORAL • FEITO COM AMOR NO BRASIL
        </span>
      </div>
    </footer>
  )
}
