const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export const formatPrice = (value?: number | null) =>
  value == null ? null : priceFormatter.format(value)

const shippingFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export const formatShippingPrice = (value: number) =>
  shippingFormatter.format(value)
