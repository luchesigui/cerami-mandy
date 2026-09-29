import { defineQuery } from "next-sanity"

// Single source of truth for "can be bought right now".
const AVAILABLE = `status == "active" && inventory > 0`

export const AVAILABLE_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current) && ${AVAILABLE}] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    price,
    badges,
    inventory,
    "image": images[0]
  }
`)

export const SOLD_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && status == "active" && defined(slug.current) && inventory == 0] | order(_updatedAt desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    price,
    badges,
    inventory,
    "image": images[0]
  }
`)

export const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && status == "active" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    price,
    compareAtPrice,
    badges,
    images,
    "categoryId": category._ref,
    description,
    "plainDescription": pt::text(description),
    details,
    inventory
  }
`)

export const RELATED_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current) && ${AVAILABLE} && _id != $id] | score(category._ref == $categoryId) | order(_score desc, _createdAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    price,
    badges,
    inventory,
    "image": images[0]
  }
`)

export const BAG_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && _id in $ids] {
    _id,
    title,
    "slug": slug.current,
    price,
    "image": images[0],
    "available": ${AVAILABLE},
    shipping
  }
`)
