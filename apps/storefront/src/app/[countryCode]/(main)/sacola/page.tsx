import { Metadata } from "next"

import BagTemplate from "@modules/bag/templates/bag-template"

export const metadata: Metadata = {
  title: "Sacola | Cerami Mandy",
}

export default function BagPage() {
  return <BagTemplate />
}
