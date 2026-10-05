// Regression check for the storefront tweaks: sold-price hiding, no zoom
// fallback on ProductCard, badge rules, and the sold queries (last 6 vs all).
// Run from repo root: tsx --tsconfig apps/storefront/tsconfig.json apps/storefront/scripts/check-product-card.ts
import assert from "node:assert"
import { readFileSync } from "node:fs"

import {
  ALL_SOLD_PRODUCTS_QUERY,
  SOLD_PRODUCTS_QUERY,
} from "../src/sanity/queries"
import { getBadges } from "../src/modules/home/components/cerami-catalogue/product-card"

// getBadges
assert.deepEqual(getBadges({ badges: null, inventory: 0 }), ["esgotada"])
assert.deepEqual(getBadges({ badges: ["esgotada"], inventory: 0 }), ["esgotada"])
assert.deepEqual(getBadges({ badges: ["destaque"], inventory: 1, reserved: true }), [
  "destaque",
  "reservada",
])
assert.deepEqual(getBadges({ badges: ["destaque", "bogus"], inventory: 2 }), ["destaque"])

// Sold queries: home shows last 6, /vendidas shows all
assert.match(SOLD_PRODUCTS_QUERY, /inventory == 0/)
assert.match(SOLD_PRODUCTS_QUERY, /\[0\.\.\.6\]/)
assert.match(ALL_SOLD_PRODUCTS_QUERY, /inventory == 0/)
assert.doesNotMatch(ALL_SOLD_PRODUCTS_QUERY, /\[\d+\.\.\.\d+\]/)

// Source-level guards on the JSX the harness can't render
const card = readFileSync(
  new URL("../src/modules/home/components/cerami-catalogue/product-card.tsx", import.meta.url),
  "utf8"
)
assert.ok(!card.includes("scale-105"), "ProductCard must not zoom (no scale-105)")
assert.ok(card.includes("opacity-0"), "hover image swap must stay")

const template = readFileSync(
  new URL("../src/modules/home/components/cerami-catalogue/product-template.tsx", import.meta.url),
  "utf8"
)
assert.ok(template.includes("!soldOut && price"), "sold product page must hide price")

const vendidas = readFileSync(
  new URL("../src/app/(main)/vendidas/page.tsx", import.meta.url),
  "utf8"
)
assert.ok(vendidas.includes("showPrice={false}"), "/vendidas cards must hide price")

console.log("ok")
