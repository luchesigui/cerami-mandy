import { defineArrayMember, defineField, defineType } from 'sanity'
import { BillIcon } from '@sanity/icons/Bill'

export const ORDER_STATUSES = [
  { title: 'Aguardando pagamento', value: 'aguardando_pagamento' },
  { title: 'Pago', value: 'pago' },
  { title: 'Enviado', value: 'enviado' },
  { title: 'Entregue', value: 'entregue' },
  { title: 'Expirado', value: 'expirado' },
  { title: 'Cancelado', value: 'cancelado' },
]

// Orders are created by the storefront BFF with `order.<uuid>` ids, which keeps
// them out of public queries. Only status and tracking are edited by hand.
export const order = defineType({
  name: 'order',
  title: 'Pedido',
  type: 'document',
  icon: BillIcon,
  fields: [
    defineField({
      name: 'number',
      title: 'Número',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ORDER_STATUSES, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'trackingCode',
      title: 'Código de rastreio',
      type: 'string',
    }),
    defineField({
      name: 'customer',
      title: 'Cliente',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({ name: 'name', title: 'Nome', type: 'string' }),
        defineField({ name: 'email', title: 'E-mail', type: 'string' }),
        defineField({ name: 'phone', title: 'Telefone', type: 'string' }),
        defineField({ name: 'cpf', title: 'CPF', type: 'string' }),
      ],
    }),
    defineField({
      name: 'address',
      title: 'Endereço de entrega',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({ name: 'cep', title: 'CEP', type: 'string' }),
        defineField({ name: 'street', title: 'Rua', type: 'string' }),
        defineField({ name: 'number', title: 'Número', type: 'string' }),
        defineField({ name: 'complement', title: 'Complemento', type: 'string' }),
        defineField({ name: 'neighborhood', title: 'Bairro', type: 'string' }),
        defineField({ name: 'city', title: 'Cidade', type: 'string' }),
        defineField({ name: 'state', title: 'UF', type: 'string' }),
      ],
    }),
    defineField({
      name: 'items',
      title: 'Peças',
      type: 'array',
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'orderItem',
          fields: [
            defineField({
              name: 'product',
              title: 'Peça',
              type: 'reference',
              to: [{ type: 'product' }],
              weak: true,
            }),
            defineField({ name: 'title', title: 'Título na compra', type: 'string' }),
            defineField({ name: 'price', title: 'Preço na compra (R$)', type: 'number' }),
          ],
          preview: {
            select: { title: 'title', price: 'price' },
            prepare: ({ title, price }) => ({
              title,
              subtitle: price != null ? `R$ ${price}` : undefined,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'shipping',
      title: 'Frete',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({ name: 'serviceId', title: 'Id do serviço (Melhor Envio)', type: 'number' }),
        defineField({ name: 'company', title: 'Transportadora', type: 'string' }),
        defineField({ name: 'name', title: 'Serviço', type: 'string' }),
        defineField({ name: 'price', title: 'Valor (R$)', type: 'number' }),
        defineField({ name: 'deliveryDays', title: 'Prazo (dias úteis)', type: 'number' }),
      ],
    }),
    defineField({ name: 'subtotal', title: 'Subtotal (R$)', type: 'number', readOnly: true }),
    defineField({ name: 'shippingTotal', title: 'Frete (R$)', type: 'number', readOnly: true }),
    defineField({ name: 'total', title: 'Total (R$)', type: 'number', readOnly: true }),
    defineField({
      name: 'payment',
      title: 'Pagamento',
      type: 'object',
      readOnly: true,
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'provider', title: 'Provedor', type: 'string' }),
        defineField({ name: 'chargeId', title: 'Id da cobrança', type: 'string' }),
        defineField({ name: 'brCode', title: 'Pix copia e cola', type: 'text', rows: 2 }),
        defineField({ name: 'brCodeBase64', title: 'QR Code', type: 'text', hidden: true }),
        defineField({ name: 'expiresAt', title: 'Expira em', type: 'datetime' }),
        defineField({ name: 'paidAt', title: 'Pago em', type: 'datetime' }),
        defineField({ name: 'devMode', title: 'Ambiente de teste', type: 'boolean' }),
      ],
    }),
    defineField({
      name: 'processedEvents',
      title: 'Eventos de webhook processados',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'accessToken',
      title: 'Token de acesso do cliente',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({ name: 'createdAt', title: 'Criado em', type: 'datetime', readOnly: true }),
  ],
  orderings: [
    {
      title: 'Mais recentes',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      number: 'number',
      name: 'customer.name',
      total: 'total',
      status: 'status',
    },
    prepare({ number, name, total, status }) {
      const statusTitle = ORDER_STATUSES.find((s) => s.value === status)?.title ?? status
      return {
        title: `${number ?? 'Pedido'} · ${name ?? 'Sem nome'}`,
        subtitle: `${total != null ? `R$ ${total}` : ''} · ${statusTitle ?? ''}`,
      }
    },
  },
})
