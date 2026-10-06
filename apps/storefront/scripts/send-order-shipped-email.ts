import fs from "node:fs"
import path from "node:path"

const envPath = path.resolve(process.cwd(), ".env.local")
const proc = process as unknown as { loadEnvFile?: (path?: string) => void }
if (fs.existsSync(envPath) && typeof proc.loadEnvFile === "function") {
  proc.loadEnvFile(envPath)
}

import { notifyOrderShipped } from "../src/lib/orders"

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes("--force")
  const toIndex = args.indexOf("--to")
  const toEmail = toIndex !== -1 ? args[toIndex + 1] : undefined
  const orderIdentifier = args.find(
    (a, idx) => a !== "--force" && a !== "--to" && idx !== toIndex + 1
  )

  if (!orderIdentifier) {
    console.error(
      "Usage: npx tsx scripts/send-order-shipped-email.ts <orderNumber-or-id> [--force] [--to <email>]"
    )
    process.exit(1)
  }

  console.log(
    `Processing shipping notification for ${orderIdentifier}${
      force ? " (forced)" : ""
    }${toEmail ? ` (sending to: ${toEmail})` : ""}...`
  )

  const result = await notifyOrderShipped(orderIdentifier, { force, toEmail })

  if (!result.success) {
    console.error(`Error: ${result.message}`)
    process.exit(1)
  }

  console.log(`Success! ${result.message}`)
  if (result.order) {
    console.log("-----------------------------------------")
    console.log(`Order: ${result.order.number} (${result.order._id})`)
    console.log(
      `Customer: ${result.order.customer?.name} <${result.order.customer?.email}>`
    )
    console.log(`Tracking Code: ${result.order.trackingCode}`)
    console.log(`Sent At: ${result.order.shippedEmailSentAt}`)
    console.log("-----------------------------------------")
  }
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
