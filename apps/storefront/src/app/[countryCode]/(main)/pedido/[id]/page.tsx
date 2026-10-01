import { Metadata } from "next"

import OrderTemplate from "@modules/orders/templates/order-template"

export const metadata: Metadata = {
  title: "Pedido | Cerami Mandy",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, { t }] = await Promise.all([params, searchParams])
  return <OrderTemplate orderId={id} token={t ?? ""} />
}
