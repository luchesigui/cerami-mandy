import "server-only"

import crypto from "node:crypto"

import {
  CUSTOMER_BY_EMAIL_QUERY,
  CUSTOMER_BY_ID_QUERY,
  ORDERS_BY_CUSTOMER_EMAIL_QUERY,
} from "@/sanity/queries"
import { writeClient } from "@/sanity/write-client"

import type {
  CUSTOMER_BY_EMAIL_QUERY_RESULT,
  CUSTOMER_BY_ID_QUERY_RESULT,
  ORDERS_BY_CUSTOMER_EMAIL_QUERY_RESULT,
} from "../../../sanity.types"

export type CustomerProfile = NonNullable<CUSTOMER_BY_EMAIL_QUERY_RESULT>
export type CustomerOrder = NonNullable<ORDERS_BY_CUSTOMER_EMAIL_QUERY_RESULT>[number]

export type CustomerAddress = {
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
}

export type CustomerInput = {
  name: string
  email: string
  phone?: string
  cpf?: string
  address?: CustomerAddress
}

export async function getCustomerByEmail(email: string): Promise<CUSTOMER_BY_EMAIL_QUERY_RESULT> {
  const cleanEmail = email.toLowerCase().trim()
  return writeClient.fetch(CUSTOMER_BY_EMAIL_QUERY, { email: cleanEmail })
}

export async function getCustomerById(id: string): Promise<CUSTOMER_BY_ID_QUERY_RESULT> {
  return writeClient.fetch(CUSTOMER_BY_ID_QUERY, { id })
}

export async function getOrCreateCustomer(input: CustomerInput): Promise<CustomerProfile> {
  const cleanEmail = input.email.toLowerCase().trim()
  const existing = await getCustomerByEmail(cleanEmail)

  if (existing) {
    // If some fields were provided but are missing on existing record, update them.
    const updates: Record<string, unknown> = {}
    if (input.name && !existing.name) updates.name = input.name
    if (input.phone && !existing.phone) updates.phone = input.phone
    if (input.cpf && !existing.cpf) updates.cpf = input.cpf
    if (input.address && !existing.address) updates.address = input.address

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString()
      await writeClient.patch(existing._id).set(updates).commit()
      return (await getCustomerById(existing._id)) ?? existing
    }
    return existing
  }

  const customerId = `customer.${crypto.randomUUID()}`
  const now = new Date().toISOString()

  const doc = {
    _id: customerId,
    _type: "customer",
    name: input.name,
    email: cleanEmail,
    phone: input.phone,
    cpf: input.cpf,
    address: input.address,
    createdAt: now,
    updatedAt: now,
  }

  await writeClient.create(doc)
  const created = await getCustomerById(customerId)
  if (created) return created

  return {
    _id: customerId,
    name: input.name ?? null,
    email: cleanEmail,
    phone: input.phone ?? null,
    cpf: input.cpf ?? null,
    address: input.address ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateCustomerProfile(
  id: string,
  data: {
    name?: string
    phone?: string
    cpf?: string
    address?: CustomerAddress
  }
): Promise<CustomerProfile | null> {
  const now = new Date().toISOString()
  const patchData: Record<string, unknown> = {
    ...data,
    updatedAt: now,
  }

  await writeClient.patch(id).set(patchData).commit()
  return getCustomerById(id)
}

export async function getCustomerOrders(email: string): Promise<ORDERS_BY_CUSTOMER_EMAIL_QUERY_RESULT> {
  const cleanEmail = email.toLowerCase().trim()
  return writeClient.fetch(ORDERS_BY_CUSTOMER_EMAIL_QUERY, { email: cleanEmail })
}
