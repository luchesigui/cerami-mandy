// ponytail: checagem mínima dos PDPs mock; roda com `npx tsx scripts/check-mock-pdps.ts`.
import assert from "node:assert"

import { mockProducts } from "../src/modules/home/components/cerami-catalogue/mock-products"

const handles = mockProducts.map((p) => p.handle)

assert.strictEqual(mockProducts.length, 6, "esperado 6 produtos mock")
assert.strictEqual(
  new Set(handles).size,
  handles.length,
  "handles duplicados nos produtos mock"
)

for (const p of mockProducts) {
  assert.ok(p.handle, `produto sem handle: ${p.title}`)
  assert.ok(p.title && p.price && p.image && p.description, `dados incompletos: ${p.handle}`)
  assert.ok(
    p.image.startsWith("/cerami/"),
    `imagem deve ser local em /cerami/: ${p.handle}`
  )
}

console.log(`ok: ${handles.length} PDPs mock resolvíveis`)
console.log(handles.map((h) => `/mock/${h}`).join("\n"))
