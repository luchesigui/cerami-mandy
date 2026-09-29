import { createImageUrlBuilder } from "@sanity/image-url"
import type { SanityImageSource } from "@sanity/image-url"

const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ovaynp65",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
})

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}
