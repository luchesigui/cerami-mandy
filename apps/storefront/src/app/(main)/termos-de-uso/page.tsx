import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Termos de Uso | Cerami Mandy",
  description: "Termos e condições de uso, compra e características das cerâmicas artesanais.",
}

export default function TermsOfUsePage() {
  return (
    <article className="mx-auto max-w-[760px] space-y-8 px-4 py-12 text-[#13110C] sm:px-6">
      <header className="space-y-2 border-b border-[#13110C]/15 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#13110C]/60">
          Condições Gerais
        </p>
        <h1 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Termos de Uso
        </h1>
        <p className="text-xs text-[#13110C]/60">
          Última atualização: Outubro de 2026
        </p>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-[#13110C]/85">
        <p>
          Bem-vinda(o) à <strong>Cerami Mandy</strong>. Ao navegar por este site ou realizar uma compra,
          você concorda com os termos e condições descritos a seguir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          1. A natureza das peças (Peças Únicas e Feitas à Mão)
        </h2>
        <div className="rounded-3xl bg-[#FFF6E8] p-6 text-sm leading-relaxed text-[#13110C]/85">
          <p>
            <strong>Cada peça da Cerami Mandy é única no mundo (one-of-a-kind).</strong>
          </p>
          <p className="mt-2">
            Todas as cerâmicas são modeladas, esmaltadas e queimadas à mão em ateliê. Por esse motivo,
            pequenas nuances de cor, textura, escorrimento do esmalte, assimetrias naturais e dimensões
            são características intrínsecas ao processo artístico e artesanal, celebrando a singularidade
            de cada objeto e não configurando defeito de fabricação.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          2. Disponibilidade e Reserva Temporária
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Por se tratarem de peças exclusivas, nosso estoque de cada peça é unitário (1 unidade).
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#13110C]/80">
          <li>
            Colocar uma peça na sacola <strong>não</strong> garante sua reserva até que você avance para
            a etapa de finalização e gere o link de pagamento.
          </li>
          <li>
            Ao clicar em finalizar e iniciar o pagamento, a peça fica reservada exclusivamente para você
            pelo prazo de <strong>30 minutos</strong>. Se o pagamento não for confirmado nesse período,
            a reserva expira automaticamente e a peça retorna à vitrine para outros compradores.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          3. Pagamentos e Preços
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Os preços indicados no site estão em Reais (R$) e não incluem o frete, que é calculado à parte
          com base no CEP de destino. Aceitamos pagamentos via Pix e Cartão de Crédito (com parcelamento em até 12x,
          conforme condições da InfinitePay no checkout).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          4. Cuidados com a sua Cerâmica
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Para garantir a longevidade da sua peça:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#13110C]/80">
          <li>
            As peças de cerâmica de alta temperatura são atóxicas e adequadas para alimentos e bebidas.
          </li>
          <li>
            Recomendamos lavar delicadamente à mão com o lado macio da esponja.
          </li>
          <li>
            Evite submeter a cerâmica a choques térmicos bruscos (ex.: transferir direto do forno/geladeira
            para água fria).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          5. Propriedade Intelectual
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Todas as fotografias, logotipos, ilustrações, textos e criações visuais presentes neste site são
          de autoria e propriedade intelectual exclusiva da Cerami Mandy, sendo expressamente proibida sua
          reprodução total ou parcial sem autorização prévia por escrito.
        </p>
      </section>

      <div className="border-t border-[#13110C]/15 pt-6">
        <LocalizedClientLink
          href="/"
          className="inline-block rounded-full bg-[#FCAB42] px-8 py-3 text-sm font-bold uppercase text-[#13110C]"
        >
          Voltar para a vitrine
        </LocalizedClientLink>
      </div>
    </article>
  )
}
