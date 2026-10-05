import { defineQuery } from "next-sanity"

// Shown in the storefront.
const LISTED = `status == "active" && inventory > 0`
// Held by a pending Pix payment (see apps/storefront/src/lib/orders).
const RESERVED = `defined(reservedUntil) && dateTime(reservedUntil) > dateTime(now())`
// Single source of truth for "can be bought right now".
const AVAILABLE = `${LISTED} && !(${RESERVED})`

export const AVAILABLE_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current) && ${LISTED}] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    price,
    badges,
    inventory,
    "reserved": ${RESERVED},
    "image": images[0],
    "hoverImage": images[1]
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
    "reserved": ${RESERVED},
    "image": images[0],
    "hoverImage": images[1]
  }
`)

export const ALL_SOLD_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && status == "active" && defined(slug.current) && inventory == 0] | order(_updatedAt desc) {
    _id,
    title,
    "slug": slug.current,
    price,
    badges,
    inventory,
    "reserved": ${RESERVED},
    "image": images[0],
    "hoverImage": images[1]
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
    inventory,
    "reserved": ${RESERVED}
  }
`)

export const RELATED_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current) && ${LISTED} && _id != $id] | score(category._ref == $categoryId) | order(_score desc, _createdAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    price,
    badges,
    inventory,
    "reserved": ${RESERVED},
    "image": images[0],
    "hoverImage": images[1]
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
    "reserved": ${LISTED} && ${RESERVED},
    shipping,
    _rev
  }
`)

const ORDER_FIELDS = `
  _id,
  _rev,
  number,
  status,
  trackingCode,
  conflictNote,
  accessToken,
  customer,
  address,
  items[] { "productId": product._ref, title, price },
  shipping,
  subtotal,
  shippingTotal,
  total,
  payment,
  processedEvents,
  createdAt
`

export const ORDER_BY_ID_QUERY = defineQuery(`
  *[_type == "order" && _id == $id][0] { ${ORDER_FIELDS} }
`)

export const ORDERS_BY_CUSTOMER_EMAIL_QUERY = defineQuery(`
  *[_type == "order" && lower(customer.email) == lower($email)] | order(createdAt desc) {
    ${ORDER_FIELDS}
  }
`)

export const CUSTOMER_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "customer" && lower(email) == lower($email)][0] {
    _id,
    name,
    email,
    phone,
    cpf,
    address,
    "hasPassword": defined(passwordHash),
    createdAt,
    updatedAt
  }
`)

export const CUSTOMER_BY_ID_QUERY = defineQuery(`
  *[_type == "customer" && _id == $id][0] {
    _id,
    name,
    email,
    phone,
    cpf,
    address,
    "hasPassword": defined(passwordHash),
    createdAt,
    updatedAt
  }
`)

export const CUSTOMER_AUTH_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "customer" && lower(email) == lower($email)][0] {
    _id,
    name,
    email,
    passwordHash
  }
`)

export const AUTH_OTP_BY_ID_QUERY = defineQuery(`
  *[_type == "authOtp" && _id == $id][0] {
    _id,
    email,
    codeHash,
    expiresAt,
    attempts
  }
`)
