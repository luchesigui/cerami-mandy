import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ovaynp65',
    dataset: 'production',
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  typegen: {
    enabled: true,
    path: '../apps/storefront/src/**/*.{ts,tsx,js,jsx}',
    schema: 'schema.json',
    generates: '../apps/storefront/sanity.types.ts',
    overloadClientMethods: true,
  },
  vite: (config) => ({
    ...config,
    server: {
      ...config.server,
      allowedHosts: true,
    },
  }),
})
