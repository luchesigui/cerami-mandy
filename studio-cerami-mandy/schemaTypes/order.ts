import {defineArrayMember, defineField, defineType} from 'sanity'
import {BillIcon} from '@sanity/icons/Bill'

export const ORDER_STATUSES = [
  {title: 'Aguardando pagamento', value: 'aguardando_pagamento'},
  {title: 'Pago', value: 'pago'},
  {title: 'Pago, com conflito (reembolsar)', value: 'pago_conflito'},
  {title: 'Enviado', value: 'enviado'},
  {title: 'Entregue', value: 'entregue'},
  {title: 'Expirado', value: 'expirado'},
  {title: 'Cancelado', value: 'cancelado'},
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
      options: {list: ORDER_STATUSES, layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'trackingCode',
      title: 'Código de rastreio',
      type: 'string',
    }),
    defineField({
      name: 'shippedEmailSentAt',
      title: 'E-mail de envio disparado em',
      type: 'datetime',
      readOnly: true,
      description: 'Data e hora em que a notificação com o rastreio foi enviada ao cliente.',
    }),
    defineField({
      name: 'customer',
      title: 'Cliente',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({name: 'name', title: 'Nome', type: 'string'}),
        defineField({name: 'email', title: 'E-mail', type: 'string'}),
        defineField({name: 'phone', title: 'Telefone', type: 'string'}),
        defineField({name: 'cpf', title: 'CPF', type: 'string'}),
      ],
    }),
    defineField({
      name: 'address',
      title: 'Endereço de entrega',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({name: 'cep', title: 'CEP', type: 'string'}),
        defineField({name: 'street', title: 'Rua', type: 'string'}),
        defineField({name: 'number', title: 'Número', type: 'string'}),
        defineField({name: 'complement', title: 'Complemento', type: 'string'}),
        defineField({name: 'neighborhood', title: 'Bairro', type: 'string'}),
        defineField({name: 'city', title: 'Cidade', type: 'string'}),
        defineField({name: 'state', title: 'UF', type: 'string'}),
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
              to: [{type: 'product'}],
              weak: true,
            }),
            defineField({name: 'title', title: 'Título na compra', type: 'string'}),
            defineField({name: 'price', title: 'Preço na compra (R$)', type: 'number'}),
          ],
          preview: {
            select: {title: 'title', price: 'price'},
            prepare: ({title, price}) => ({
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
        defineField({name: 'serviceId', title: 'Id do serviço (Melhor Envio)', type: 'number'}),
        defineField({name: 'company', title: 'Transportadora', type: 'string'}),
        defineField({name: 'name', title: 'Serviço', type: 'string'}),
        defineField({name: 'price', title: 'Valor (R$)', type: 'number'}),
        defineField({name: 'deliveryDays', title: 'Prazo (dias úteis)', type: 'number'}),
        defineField({name: 'melhorEnvioOrderId', title: 'ID no Melhor Envio', type: 'string'}),
        defineField({name: 'labelUrl', title: 'Link da Etiqueta (PDF)', type: 'url'}),
      ],
    }),
    defineField({name: 'subtotal', title: 'Subtotal (R$)', type: 'number', readOnly: true}),
    defineField({name: 'shippingTotal', title: 'Frete (R$)', type: 'number', readOnly: true}),
    defineField({name: 'total', title: 'Total (R$)', type: 'number', readOnly: true}),
    defineField({
      name: 'conflictNote',
      title: 'Conflito',
      type: 'text',
      rows: 2,
      readOnly: true,
      description:
        'Pagamento recebido depois que a peça foi vendida para outra pessoa. Cancele a venda no app da InfinitePay para reembolsar.',
      hidden: ({document}) => document?.status !== 'pago_conflito',
    }),
    defineField({
      name: 'payment',
      title: 'Pagamento',
      type: 'object',
      readOnly: true,
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'provider', title: 'Provedor', type: 'string'}),
        defineField({name: 'checkoutUrl', title: 'Link de pagamento', type: 'url', hidden: true}),
        defineField({name: 'expiresAt', title: 'Reserva até', type: 'datetime'}),
        defineField({name: 'captureMethod', title: 'Forma de pagamento', type: 'string'}),
        defineField({name: 'installments', title: 'Parcelas', type: 'number'}),
        defineField({name: 'paidAmount', title: 'Valor pago pelo cliente (R$)', type: 'number'}),
        defineField({name: 'slug', title: 'Código da fatura', type: 'string'}),
        defineField({name: 'transactionNsu', title: 'Id da transação', type: 'string'}),
        defineField({name: 'receiptUrl', title: 'Comprovante', type: 'url'}),
        defineField({name: 'paidAt', title: 'Pago em', type: 'datetime'}),
      ],
    }),
    defineField({
      name: 'processedEvents',
      title: 'Eventos de webhook processados',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
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
    defineField({name: 'createdAt', title: 'Criado em', type: 'datetime', readOnly: true}),
  ],
  orderings: [
    {
      title: 'Mais recentes',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      number: 'number',
      name: 'customer.name',
      total: 'total',
      status: 'status',
    },
    prepare({number, name, total, status}) {
      const statusTitle = ORDER_STATUSES.find((s) => s.value === status)?.title ?? status
      return {
        title: `${number ?? 'Pedido'} · ${name ?? 'Sem nome'}`,
        subtitle: `${total != null ? `R$ ${total}` : ''} · ${statusTitle ?? ''}`,
      }
    },
  },
})
