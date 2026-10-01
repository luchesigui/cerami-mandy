import type { StructureResolver } from 'sanity/structure'
import { BillIcon } from '@sanity/icons/Bill'

const orderList = (S: Parameters<StructureResolver>[0], title: string, filter: string) =>
  S.documentList()
    .title(title)
    .schemaType('order')
    .filter(`_type == "order" && ${filter}`)
    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
    .initialValueTemplates([])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Conteúdo')
    .items([
      S.documentTypeListItem('product').title('Peças'),
      S.documentTypeListItem('category').title('Categorias'),
      S.divider(),
      S.listItem()
        .title('Pedidos')
        .icon(BillIcon)
        .child(
          S.list()
            .title('Pedidos')
            .items([
              S.listItem()
                .title('Pagos, a enviar')
                .child(orderList(S, 'Pagos, a enviar', 'status == "pago"')),
              S.listItem()
                .title('Aguardando pagamento')
                .child(orderList(S, 'Aguardando pagamento', 'status == "aguardando_pagamento"')),
              S.listItem()
                .title('Enviados')
                .child(orderList(S, 'Enviados', 'status == "enviado"')),
              S.divider(),
              S.listItem().title('Todos').child(orderList(S, 'Todos os pedidos', 'true')),
            ]),
        ),
    ])
