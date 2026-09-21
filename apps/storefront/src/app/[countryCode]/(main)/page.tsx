import { Metadata } from "next"

import CeramiCatalogue from "@modules/home/components/cerami-catalogue"
import Hero from "@modules/home/components/hero"
import Manifesto from "@modules/home/components/manifesto"
import PromoBanners from "@modules/home/components/promo-banners"
import SectionHeader from "@modules/home/components/section-header"

export const metadata: Metadata = {
  title: "Cerami Mandy | Peças de cerâmica com cara, alma e rostinho",
  description:
    "Peças de cerâmica autênticas, criativas e únicas, feitas à mão no Brasil por @mandyellow.jpg.",
}

// ponytail: home é 100% estática/demo; não consulta o backend para não depender de catálogo real.
export default function Home() {
  return (
    <>
      <Hero />
      <SectionHeader
        title="LANÇAMENTOS DO ATELIÊ"
        subtitle="CATÁLOGO DEMO"
        counter="06 PEÇAS EXCLUSIVAS"
      />
      <CeramiCatalogue />
      <Manifesto />
      <SectionHeader
        title="COLEÇÕES EM DESTAQUE"
        subtitle="DROPS ESPECIAIS"
        counter="EDIÇÃO LIMITADA"
      />
      <PromoBanners />
    </>
  )
}
