import { defineField, defineType } from 'sanity'

// Temporary OTP authentication records with `authOtp.<hash>` ids.
// Kept private by the dot notation in `_id`.
export const authOtp = defineType({
  name: 'authOtp',
  title: 'Código de Acesso (OTP)',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'codeHash',
      title: 'Hash do Código',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expira em',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'attempts',
      title: 'Tentativas incorretas',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'createdAt',
      title: 'Criado em',
      type: 'datetime',
      readOnly: true,
    }),
  ],
})
