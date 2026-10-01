export const digits = (value: string) => value.replace(/\D/g, "")

export const maskCpf = (value: string) =>
  digits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")

export const maskPhone = (value: string) => {
  const d = digits(value).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const isValidCpf = (value: string) => {
  const cpf = digits(value)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  const check = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split("")
      .reduce((acc, n, i) => acc + Number(n) * (length + 1 - i), 0)
    return ((sum * 10) % 11) % 10
  }
  return check(9) === Number(cpf[9]) && check(10) === Number(cpf[10])
}

export const isValidPhone = (value: string) => /^\d{10,11}$/.test(digits(value))

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

export const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]
