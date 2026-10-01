import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Trocas e Devoluções | Cerami Mandy",
  description: "Política de trocas, devoluções, direito de arrependimento (CDC) e avarias no transporte.",
}

export default function ReturnsPolicyPage() {
  return (
    <article className="mx-auto max-w-[760px] space-y-8 px-4 py-12 text-[#13110C] sm:px-6">
      <header className="space-y-2 border-b border-[#13110C]/15 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#13110C]/60">
          Satisfação e Garantia
        </p>
        <h1 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Trocas e Devoluções
        </h1>
        <p className="text-xs text-[#13110C]/60">
          Última atualização: Outubro de 2026
        </p>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-[#13110C]/85">
        <p>
          Queremos que sua experiência com a <strong>Cerami Mandy</strong> seja especial do início ao fim.
          Nossa política respeita integralmente o <strong>Código de Defesa do Consumidor (Lei nº 8.078/1990)</strong>,
          com atenção especial à natureza frágil e exclusiva das peças cerâmicas.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          1. Direito de Arrependimento (7 dias)
        </h2>
        <div className="rounded-3xl bg-[#FFF6E8] p-6 text-sm leading-relaxed text-[#13110C]/85">
          <p>
            Conforme o Artigo 49 do Código de Defesa do Consumidor, em compras realizadas pela internet,
            você tem o direito de desistir da compra em até <strong>7 (sete) dias corridos</strong> a partir
            da data de entrega do pedido no seu endereço.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            <li>A peça deve estar sem indícios de uso e sem avarias causadas após a entrega.</li>
            <li>
              A peça deve ser reenviada muito bem embalada e protegida (preferencialmente na mesma caixa
              e com as camadas de proteção originais, evitando quebras no trajeto).
            </li>
            <li>
              O frete de devolução é por nossa conta. Disponibilizaremos uma etiqueta reversa dos Correios
              ou transportadora.
            </li>
            <li>
              Após o recebimento e conferência da peça no ateliê, efetuaremos o <strong>reembolso integral</strong>
              (valor da peça + valor do frete pago na compra) pelo mesmo método de pagamento utilizado.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          2. Peça danificada ou quebrada durante o transporte
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Nossas embalagens são reforçadas com muito cuidado e carinho, usando várias camadas de proteção
          para amortecer impactos. No entanto, imprevistos podem acontecer no transporte postal.
        </p>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Se sua caixa chegar com sinais severos de dano ou se a cerâmica tiver quebrado durante a entrega:
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#13110C]/80">
          <li>
            Fotografe a caixa fechada e a peça danificada logo ao abrir, em até <strong>48 horas</strong> após o recebimento.
          </li>
          <li>
            Entre em contato conosco por e-mail ou WhatsApp informando o número do pedido (ex.: CM-1001) e anexando as fotos.
          </li>
          <li>
            <strong>Como as peças são únicas:</strong> não é possível enviar outra peça exatamente igual. Você poderá escolher entre:
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li><strong>Reembolso integral imediato</strong> do valor pago (incluindo o frete); ou</li>
              <li><strong>Crédito</strong> para escolher qualquer outra peça disponível no catálogo da loja.</li>
            </ul>
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          3. Como solicitar uma troca ou devolução?
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Basta nos enviar uma mensagem com o número do seu pedido (CM-XXXX) e o motivo da solicitação através
          dos canais oficiais informados no rodapé desta página. Responderemos com as orientações de postagem
          em até 1 dia útil.
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
