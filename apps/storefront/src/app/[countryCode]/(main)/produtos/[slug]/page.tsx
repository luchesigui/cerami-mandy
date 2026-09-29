import { Metadata } from "next"
import { notFound } from "next/navigation"

import { urlFor } from "@/sanity/image"
import { sanityFetch } from "@/sanity/live"
import {
  PRODUCT_BY_SLUG_QUERY,
  RELATED_PRODUCTS_QUERY,
} from "@/sanity/queries"
import ProductTemplate from "@modules/home/components/cerami-catalogue/product-template"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
    stega: false,
  })

  if (!product) {
    notFound()
  }

  const image = product.images?.find((img) => img.asset)

  return {
    title: `${product.title} | Cerami Mandy`,
    description: product.plainDescription || undefined,
    openGraph: image
      ? {
          images: [
            urlFor(image).width(1200).height(630).fit("crop").url(),
          ],
        }
      : undefined,
  }
}

export default async function ProductPage(props: Props) {
  const { slug } = await props.params
  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  })

  if (!product) {
    notFound()
  }

  const { data: related } = await sanityFetch({
    query: RELATED_PRODUCTS_QUERY,
    params: { id: product._id, categoryId: product.categoryId ?? "" },
  })

  return <ProductTemplate product={product} related={related} />
}
