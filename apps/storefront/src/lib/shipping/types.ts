export type ShippingOption = {
  id: number
  name: string
  company: string
  companyLogo: string | null
  price: number
  deliveryDays: number
  description?: string
}

export const LOCAL_PICKUP_OPTION: ShippingOption = {
  id: 0,
  name: "Retirada no local",
  company: "Cerami Mandy",
  companyLogo: null,
  price: 0,
  deliveryDays: 1,
  description: "A combinar após a confirmação",
}

export const isLocalPickupId = (
  id: number | null | undefined
): boolean => id === LOCAL_PICKUP_OPTION.id

export const isLocalPickup = (
  option: { id?: number | null } | null | undefined
): boolean => isLocalPickupId(option?.id)
