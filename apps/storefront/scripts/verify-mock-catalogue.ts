// Verificação do catálogo mock: garante 6 produtos únicos com imagem, título e preço.
// Rode com: npx tsx scripts/verify-mock-catalogue.ts
import { mockProducts } from "../src/modules/home/components/cerami-catalogue/mock-products"

const assert = (cond: boolean, msg: string) => {
  if (!cond) {
    throw new Error(msg)
  }
}

assert(mockProducts.length === 6, `esperava 6 produtos, veio ${mockProducts.length}`)
const titles = new Set(mockProducts.map((p) => p.title))
assert(titles.size === 6, "títulos duplicados no catálogo mock")
for (const p of mockProducts) {
  assert(p.image.startsWith("/cerami/"), `imagem fora de /cerami/: ${p.image}`)
  assert(/^R\$ \d+/.test(p.price), `preço inválido: ${p.price}`)
  assert(p.alt.length > 10, `alt muito curto: ${p.title}`)
}
console.log("catálogo mock OK:", mockProducts.length, "produtos")
