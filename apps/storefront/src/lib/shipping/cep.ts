export const normalizeCep = (value: string) => value.replace(/\D/g, "")

export const isValidCep = (value: string) => /^\d{8}$/.test(normalizeCep(value))

export const maskCep = (value: string) => {
  const digits = normalizeCep(value).slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}
