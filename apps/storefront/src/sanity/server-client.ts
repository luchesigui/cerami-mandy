import "server-only"

import { client } from "./client"

// Stock and prices must be fresh when the BFF makes decisions.
export const serverClient = client.withConfig({ useCdn: false })
