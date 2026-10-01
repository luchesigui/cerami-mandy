import { defineArrayMember, defineField, defineType } from 'sanity'
import { BasketIcon } from '@sanity/icons/Basket'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              validation: (rule) =>
                rule.required().warning('Alt text is important for accessibility and SEO'),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1).warning('Products should have at least one image'),
    }),
    defineField({
      name: 'price',
      title: 'Preço (R$)',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Preço original (R$)',
      type: 'number',
      description: 'Original price if the product is on sale',
      validation: (rule) =>
        rule.custom((compareAtPrice, context) => {
          const doc = context.document as { price?: number } | undefined
          if (compareAtPrice && doc?.price && compareAtPrice <= doc.price) {
            return 'Compare at price should be higher than the current price'
          }
          return true
        }),
    }),
    defineField({
      name: 'badges',
      title: 'Selos',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Destaque', value: 'destaque' },
          { title: 'Novidade', value: 'novidade' },
        ],
        layout: 'grid',
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'details',
      title: 'Ceramic Details',
      type: 'object',
      fields: [
        defineField({
          name: 'material',
          title: 'Material / Clay Body',
          type: 'string',
          placeholder: 'e.g., Stoneware, Porcelain, Terracotta',
        }),
        defineField({
          name: 'dimensions',
          title: 'Dimensions',
          type: 'string',
          placeholder: 'e.g., 10cm x 12cm',
        }),
        defineField({
          name: 'weight',
          title: 'Weight',
          type: 'string',
          placeholder: 'e.g., 350g',
        }),
        defineField({
          name: 'glaze',
          title: 'Glaze & Finish',
          type: 'string',
          placeholder: 'e.g., Matte speckled white glaze',
        }),
        defineField({
          name: 'careInstructions',
          title: 'Care Instructions',
          type: 'string',
          placeholder: 'e.g., Dishwasher and microwave safe; hand wash recommended',
        }),
      ],
    }),
    defineField({
      name: 'shipping',
      title: 'Embalagem para frete',
      type: 'object',
      description:
        'Peso e medidas da caixa já embalada, usados para calcular o frete. Obrigatório para peças ativas.',
      options: { columns: 2 },
      validation: (rule) =>
        rule.custom((value, context) => {
          const status = (context.document as { status?: string } | undefined)?.status
          if (status !== 'active') return true
          const shipping = value as Record<string, number | undefined> | undefined
          const missing = ['weightGrams', 'heightCm', 'widthCm', 'lengthCm'].some(
            (key) => !shipping?.[key],
          )
          return missing ? 'Preencha peso e medidas da embalagem para calcular o frete' : true
        }),
      fields: [
        defineField({
          name: 'weightGrams',
          title: 'Peso (g)',
          type: 'number',
          validation: (rule) => rule.min(1).integer(),
        }),
        defineField({
          name: 'heightCm',
          title: 'Altura (cm)',
          type: 'number',
          validation: (rule) => rule.min(1),
        }),
        defineField({
          name: 'widthCm',
          title: 'Largura (cm)',
          type: 'number',
          validation: (rule) => rule.min(1),
        }),
        defineField({
          name: 'lengthCm',
          title: 'Comprimento (cm)',
          type: 'number',
          validation: (rule) => rule.min(1),
        }),
      ],
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Gerado automaticamente ao criar a peça (CM-003, CM-004...).',
      initialValue: async (_params, { getClient }) => {
        const skus = await getClient({ apiVersion: '2026-09-28' }).fetch<string[]>(
          `*[_type == "product" && defined(sku)].sku`,
        )
        const highest = skus.reduce((max, sku) => {
          // Also counts legacy SKUs such as CM-VASE-002.
          const match = /^CM-(?:[A-Z]+-)?(\d+)$/.exec(sku)
          return match ? Math.max(max, Number(match[1])) : max
        }, 0)
        return `CM-${String(highest + 1).padStart(3, '0')}`
      },
      validation: (rule) =>
        rule.custom(async (value, { document, getClient }) => {
          if (!value || !document) return true
          const id = document._id.replace(/^drafts\./, '')
          const duplicates = await getClient({ apiVersion: '2026-09-28' }).fetch<number>(
            `count(*[_type == "product" && sku == $sku && !(_id in [$id, $draftId])])`,
            { sku: value, id, draftId: `drafts.${id}` },
          )
          return duplicates > 0 ? 'Já existe outra peça com este SKU' : true
        }),
    }),
    defineField({
      name: 'inventory',
      title: 'Inventory Count',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Active', value: 'active' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
    }),
    // Managed by the storefront checkout; hidden from editors.
    defineField({ name: 'reservedUntil', type: 'datetime', hidden: true, readOnly: true }),
    defineField({ name: 'reservedBy', type: 'string', hidden: true, readOnly: true }),
    defineField({ name: 'soldAt', title: 'Vendida em', type: 'datetime', readOnly: true }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      media: 'images.0',
      status: 'status',
    },
    prepare({ title, price, media, status }) {
      return {
        title,
        subtitle: `${price != null ? `R$ ${price}` : 'No price'} • ${status || 'draft'}`,
        media,
      }
    },
  },
})
