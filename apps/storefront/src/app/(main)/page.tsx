import { Metadata } from "next"

import CeramiCatalogue from "@modules/home/components/cerami-catalogue"
import Hero from "@modules/home/components/hero"
import SoldShowcase from "@modules/home/components/sold-showcase"

export const metadata: Metadata = {
  title: "Cerami Mandy | Peças de cerâmica com cara, alma e rostinho",
  description:
    "Peças de cerâmica autênticas, criativas e únicas, feitas à mão no Brasil por @mandyellow.jpg.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function Home() {
  return (
    <>
      <Hero />
      <CeramiCatalogue />
      <SoldShowcase />
    </>
  )
}
