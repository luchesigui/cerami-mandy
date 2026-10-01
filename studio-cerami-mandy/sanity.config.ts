import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Cerami Mandy',

  projectId: 'ovaynp65',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Orders are only created by the storefront checkout.
    templates: (templates) => templates.filter((template) => template.schemaType !== 'order'),
  },
})
