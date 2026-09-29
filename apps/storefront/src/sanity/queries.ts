import { defineQuery } from "next-sanity"

export const AVAILABLE_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && status == "active" && defined(slug.current) && inventory > 0] | order(_createdAt desc) {
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
  *[_type == "product" && status == "active" && defined(slug.current) && inventory > 0 && _id != $id] | score(category._ref == $categoryId) | order(_score desc, _createdAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    price,
    badges,
    inventory,
    "image": images[0]
  }
`)
