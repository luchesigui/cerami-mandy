import { Metadata } from "next"

import CheckoutTemplate from "@modules/bag/templates/checkout-template"

export const metadata: Metadata = {
  title: "Finalizar compra | Cerami Mandy",
}

export default function CheckoutPage() {
  return <CheckoutTemplate />
}
