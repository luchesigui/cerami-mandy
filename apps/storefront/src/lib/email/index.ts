import "server-only"

import type { Order } from "@lib/orders"
import { formatShippingPrice } from "@/sanity/format"

type SendEmailPayload = {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: SendEmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info(`[email] RESEND_API_KEY not set. Skipped email to ${to}: "${subject}"`)
    return false
  }

  const from = process.env.EMAIL_FROM || "Cerami Mandy <pedidos@ceramimandy.com.br>"

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[email] Resend API error (${res.status}):`, errText)
      return false
    }

    console.info(`[email] Sent email to ${to}: "${subject}"`)
    return true
  } catch (err) {
    console.error("[email] Failed to send email:", err)
    return false
  }
}

export async function sendOrderConfirmationEmail(order: Order, baseUrl: string) {
  const email = order.customer?.email
  if (!email) return

  const publicId = order._id.replace(/^order\./, "")
  const orderUrl = `${baseUrl}/pedido/${publicId}?t=${order.accessToken}`
  const firstName = order.customer?.name?.split(/\s+/)[0] || "Cliente"
  const isPickup = order.shipping?.serviceId === -1

  const itemsHtml = (order.items ?? [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #ede8df; color: #13110C; font-size: 14px;">
          ${item.title}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #ede8df; text-align: right; color: #13110C; font-size: 14px; font-weight: bold;">
          ${formatShippingPrice(item.price ?? 0)}
        </td>
      </tr>
    `
    )
    .join("")

  const addressHtml = isPickup
    ? `<p style="margin: 0; color: #6b655b; font-size: 13px;"><strong>Retirada no local:</strong> Entraremos em contato por WhatsApp/e-mail para combinar.</p>`
    : order.address
    ? `
      <p style="margin: 0; color: #6b655b; font-size: 13px;">
        ${order.address.street}, ${order.address.number}${order.address.complement ? ` - ${order.address.complement}` : ""}<br>
        ${order.address.neighborhood} · ${order.address.city}/${order.address.state} · CEP ${order.address.cep}
      </p>
    `
    : ""

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 30px 15px; background-color: #F8F5EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFDF9; border-radius: 24px; border: 1px solid #010204; overflow: hidden;">
        <tr>
          <td style="background-color: #13110C; padding: 24px 32px; text-align: center;">
            <span style="color: #FCAB42; font-size: 20px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">CERAMI MANDY</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #6b655b;">
              Pedido ${order.number}
            </p>
            <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #13110C;">
              Pagamento confirmado!
            </h1>
            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #13110C;">
              Olá, <strong>${firstName}</strong>! Recebemos a confirmação do seu pagamento e sua peça exclusiva será embalada com todo o cuidado para que chegue perfeita até você.
            </p>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; border-top: 1px solid #010204;">
              ${itemsHtml}
              <tr>
                <td style="padding: 8px 0; color: #6b655b; font-size: 13px;">Frete (${order.shipping?.company || "Entrega"})</td>
                <td style="padding: 8px 0; text-align: right; color: #13110C; font-size: 13px;">${formatShippingPrice(order.shippingTotal ?? 0)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-top: 1px solid #010204; font-size: 16px; font-weight: bold; color: #13110C;">Total</td>
                <td style="padding: 12px 0; border-top: 1px solid #010204; text-align: right; font-size: 18px; font-weight: bold; color: #13110C;">${formatShippingPrice(order.total ?? 0)}</td>
              </tr>
            </table>

            <div style="background-color: #FFF6E8; border-radius: 16px; padding: 16px 20px; margin-bottom: 28px;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #13110C;">Destino da Entrega</p>
              ${addressHtml}
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${orderUrl}" target="_blank" style="display: inline-block; background-color: #FCAB42; color: #13110C; padding: 14px 32px; border-radius: 999px; font-weight: bold; font-size: 14px; text-transform: uppercase; text-decoration: none; border: 1px solid #010204;">
                Acompanhar meu pedido
              </a>
            </div>

            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8a8275; text-align: center;">
              Cada peça é única, moldada e esmaltada à mão.<br>Guarde este e-mail para acompanhar as atualizações de rastreamento.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Pedido ${order.number} confirmado! · Cerami Mandy`,
    html,
  })
}

export async function sendStoreSaleNotificationEmail(order: Order) {
  const storeEmail = process.env.STORE_NOTIFICATION_EMAIL
  if (!storeEmail) return

  const itemsList = (order.items ?? [])
    .map((item) => `• ${item.title} — ${formatShippingPrice(item.price ?? 0)}`)
    .join("<br>")

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; padding: 20px; color: #13110C;">
      <h2>✨ Nova venda realizada!</h2>
      <p><strong>Pedido:</strong> ${order.number}</p>
      <p><strong>Total:</strong> ${formatShippingPrice(order.total ?? 0)}</p>
      <hr>
      <h3>Cliente</h3>
      <p>
        <strong>Nome:</strong> ${order.customer?.name}<br>
        <strong>E-mail:</strong> ${order.customer?.email}<br>
        <strong>Telefone / WhatsApp:</strong> ${order.customer?.phone}<br>
        <strong>CPF:</strong> ${order.customer?.cpf}
      </p>
      <hr>
      <h3>Entrega</h3>
      <p>
        <strong>Opção:</strong> ${order.shipping?.company} (${order.shipping?.name})<br>
        <strong>Valor:</strong> ${formatShippingPrice(order.shippingTotal ?? 0)}<br>
        <strong>Endereço:</strong> ${order.address?.street}, ${order.address?.number} ${order.address?.complement || ""}, ${order.address?.neighborhood}, ${order.address?.city}/${order.address?.state} - CEP ${order.address?.cep}
      </p>
      <hr>
      <h3>Peças Vendidas</h3>
      <p>${itemsList}</p>
      <p style="margin-top: 24px;">
        <a href="https://ceramimandy.sanity.studio/structure/order;${order._id}" style="background-color: #13110C; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Abrir Pedido no Sanity Studio ↗
        </a>
      </p>
    </body>
    </html>
  `

  await sendEmail({
    to: storeEmail,
    subject: `✨ Nova venda! Pedido ${order.number} (${formatShippingPrice(order.total ?? 0)})`,
    html,
  })
}

export async function sendPaymentConflictAlertEmail(order: Order, note?: string) {
  const storeEmail = process.env.STORE_NOTIFICATION_EMAIL
  if (!storeEmail) return

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; padding: 20px; color: #13110C; background-color: #FFF5F5;">
      <h2 style="color: #C53030;">⚠️ AÇÃO NECESSÁRIA: Pagamento com Conflito!</h2>
      <p>Um pagamento foi concluído para o pedido <strong>${order.number}</strong>, mas a reserva havia expirado e a peça já foi vendida ou reservada para outra pessoa.</p>
      <div style="background: #fff; border-left: 4px solid #C53030; padding: 15px; margin: 15px 0;">
        <p><strong>Detalhes do Conflito:</strong> ${note || order.conflictNote || "Peça não estava mais disponível."}</p>
        <p><strong>Valor Pago:</strong> ${formatShippingPrice(order.total ?? 0)}</p>
        <p><strong>Cliente:</strong> ${order.customer?.name} (${order.customer?.email}, ${order.customer?.phone})</p>
      </div>
      <p><strong>O que fazer:</strong> Acesse imediatamente o aplicativo da <strong>InfinitePay</strong> e faça o estorno/reembolso integral para o cliente.</p>
      <p style="margin-top: 20px;">
        <a href="https://ceramimandy.sanity.studio/structure/order;${order._id}" style="background-color: #C53030; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Ver Pedido no Sanity Studio ↗
        </a>
      </p>
    </body>
    </html>
  `

  await sendEmail({
    to: storeEmail,
    subject: `⚠️ URGENTE: Pagamento com conflito no pedido ${order.number}`,
    html,
  })
}
