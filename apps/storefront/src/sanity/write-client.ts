import "server-only"

import { client } from "./client"

// Reads private documents (orders, drafts) and writes. Never import from client code.
export const writeClient = client.withConfig({
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
})
