import { Metadata } from "next"

import CeramiCatalogue from "@modules/home/components/cerami-catalogue"
import Hero from "@modules/home/components/hero"
import SoldShowcase from "@modules/home/components/sold-showcase"

export const metadata: Metadata = {
  title: "Cerami Mandy | Peças de cerâmica com cara, alma e rostinho",
  description:
    "Canecas únicas, cheias de personalidade e feitas 100% à mão por Amanda Yoshiizumi. Arte em cerâmica para quem quer transformar a hora do café e já não tem paciência para louça básica e sem graça.",
}

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <>
      <Hero />
      <CeramiCatalogue />
      <SoldShowcase />
    </>
  )
}
