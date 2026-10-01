import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Política de Privacidade | Cerami Mandy",
  description: "Como tratamos e protegemos seus dados pessoais de acordo com a LGPD.",
}

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-[760px] space-y-8 px-4 py-12 text-[#13110C] sm:px-6">
      <header className="space-y-2 border-b border-[#13110C]/15 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#13110C]/60">
          Transparência e Segurança
        </p>
        <h1 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="text-xs text-[#13110C]/60">
          Última atualização: Outubro de 2026
        </p>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-[#13110C]/85">
        <p>
          A <strong>Cerami Mandy</strong> valoriza a privacidade e a segurança dos dados pessoais
          de seus clientes. Esta política explica de forma clara como coletamos, usamos e protegemos
          suas informações, em total conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          1. Quais dados coletamos e para quê?
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Para que você possa concluir uma compra de cerâmica artesanal em nossa loja, coletamos
          apenas as informações estritamente necessárias:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#13110C]/80">
          <li>
            <strong>Nome completo e CPF:</strong> Exigidos para emissão de nota fiscal ou declaração
            de conteúdo obrigatória para envio postal/transportadora e conferência fiscal.
          </li>
          <li>
            <strong>E-mail e Telefone (WhatsApp):</strong> Utilizados para enviar a confirmação do pedido,
            link de acompanhamento, avisos de envio/rastreamento e contato direto caso haja qualquer dúvida sobre a entrega.
          </li>
          <li>
            <strong>Endereço de entrega completo e CEP:</strong> Necessários para o cálculo preciso do frete
            e para a entrega física da sua encomenda pelas transportadoras parceiras (Correios, Jadlog, etc.).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          2. Pagamentos e dados bancários
        </h2>
        <div className="rounded-3xl bg-[#FFF6E8] p-6 text-sm leading-relaxed text-[#13110C]/85">
          <p>
            <strong>A Cerami Mandy não armazena nem tem acesso aos dados do seu cartão de crédito.</strong>
          </p>
          <p className="mt-2">
            Todo o processamento financeiro (Pix ou cartão) é realizado diretamente no ambiente seguro e
            criptografado da <strong>InfinitePay (CloudWalk)</strong>, instituição de pagamento devidamente
            autorizada pelo Banco Central do Brasil. A loja recebe apenas a confirmação de aprovação do pagamento.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          3. Compartilhamento de dados com terceiros
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Seus dados são confidenciais e nunca serão vendidos, alugados ou comercializados com terceiros.
          O compartilhamento ocorre exclusivamente com os parceiros necessários para a execução da compra:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#13110C]/80">
          <li>
            <strong>InfinitePay:</strong> Para viabilizar a transação de pagamento segura.
          </li>
          <li>
            <strong>Melhor Envio e Transportadoras:</strong> Apenas os dados de entrega (nome, CPF, telefone
            e endereço) para cotação, geração da etiqueta de envio e transporte seguro até sua residência.
          </li>
          <li>
            <strong>Sanity CMS:</strong> Nossa base de dados segura e privada onde os pedidos são registrados
            sob identificadores protegidos e sem acesso público.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#13110C]">
          4. Seus direitos como titular (LGPD)
        </h2>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Você tem o direito de confirmar a existência de tratamento, acessar seus dados, solicitar a correção
          de informações incompletas ou inexatas e solicitar a eliminação dos seus dados após o cumprimento das
          obrigações legais e prazos fiscais de guarda.
        </p>
        <p className="text-sm leading-relaxed text-[#13110C]/80">
          Para exercer qualquer direito ou tirar dúvidas sobre sua privacidade, entre em contato conosco
          pelo e-mail disponibilizado no rodapé do site.
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
