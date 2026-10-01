import { getBaseURL } from "./env"

// On Vercel every deploy runs with NODE_ENV=production, so VERCEL_ENV is what tells
// the production site apart from previews. Locally, fall back to NODE_ENV.
export const isProductionDeploy = () =>
  process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production"

// Absolute URL of this deploy, for links sent to third parties (payment return,
// webhooks). Previews get a new URL per deploy, which Vercel exposes as VERCEL_URL.
export const getSiteUrl = () => {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return getBaseURL().replace(/\/$/, "")
}
