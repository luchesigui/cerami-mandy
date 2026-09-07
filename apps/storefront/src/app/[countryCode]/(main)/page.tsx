import { Metadata } from "next"

import CeramiCatalogue from "@modules/home/components/cerami-catalogue"
import Hero from "@modules/home/components/hero"

export const metadata: Metadata = {
  title: "Cerami Mandy | Cerâmica artesanal",
  description:
    "Peças de cerâmica autênticas, criativas e únicas, feitas à mão no Brasil.",
}

// ponytail: home é 100% estática/demo; não consulta o backend para não depender de catálogo real.
export default function Home() {
  return (
    <>
      <Hero />
      <CeramiCatalogue />
    </>
  )
}
