import { Metadata } from "next"
import { notFound } from "next/navigation"

import MockProductTemplate from "@modules/home/components/cerami-catalogue/mock-pdp"
import { getMockProduct } from "@modules/home/components/cerami-catalogue/mock-products"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// ponytail: sem generateStaticParams; PDPs mock renderizam sob demanda, sem backend.

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  const product = getMockProduct(handle)

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Cerami Mandy`,
    description: product.description,
  }
}

export default async function MockProductPage(props: Props) {
  const { handle } = await props.params
  const product = getMockProduct(handle)

  if (!product) {
    notFound()
  }

  return <MockProductTemplate product={product} />
}
