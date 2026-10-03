import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons/User'

// Customer accounts are created by the storefront with `customer.<uuid>` ids,
// which keeps them out of public queries.
export const customer = defineType({
  name: 'customer',
  title: 'Cliente',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nome completo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Telefone',
      type: 'string',
    }),
    defineField({
      name: 'cpf',
      title: 'CPF',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Endereço padrão',
      type: 'object',
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
      name: 'createdAt',
      title: 'Cadastrado em',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'updatedAt',
      title: 'Atualizado em',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'passwordHash',
      title: 'Hash da Senha',
      type: 'string',
      hidden: true,
      readOnly: true,
    }),
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
      name: 'name',
      email: 'email',
      city: 'address.city',
      state: 'address.state',
    },
    prepare({ name, email, city, state }) {
      const location = city && state ? ` · ${city}/${state}` : ''
      return {
        title: name ?? 'Sem nome',
        subtitle: `${email ?? ''}${location}`,
      }
    },
  },
})
