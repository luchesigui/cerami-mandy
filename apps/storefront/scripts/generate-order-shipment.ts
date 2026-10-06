import fs from "node:fs"
import path from "node:path"

const envPath = path.resolve(process.cwd(), ".env.local")
const proc = process as unknown as { loadEnvFile?: (path?: string) => void }
if (fs.existsSync(envPath) && typeof proc.loadEnvFile === "function") {
  proc.loadEnvFile(envPath)
}

import { writeClient } from "../src/sanity/write-client"
import { ORDER_BY_ID_QUERY } from "../src/sanity/queries"
import { generateShipmentForOrder, type Order } from "../src/lib/orders"

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error("Usage: npx tsx scripts/generate-order-shipment.ts <orderNumber-or-id>")
    process.exit(1)
  }

  let order: Order | null = null
  if (arg.startsWith("order.")) {
    order = await writeClient.fetch(ORDER_BY_ID_QUERY, { id: arg })
  } else if (arg.startsWith("CM-")) {
    order = await writeClient.fetch<Order>(
      `*[_type == "order" && number == $number][0]{
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
      }`,
      { number: arg }
    )
  } else {
    order = await writeClient.fetch(ORDER_BY_ID_QUERY, { id: `order.${arg}` })
  }

  if (!order) {
    console.error(`Order not found: ${arg}`)
    process.exit(1)
  }

  console.log(`Processing shipment for order ${order.number} (${order._id})...`)
  console.log(`Customer: ${order.customer?.name} - ${order.customer?.cpf}`)
  console.log(`Address: ${order.address?.street}, ${order.address?.number} - ${order.address?.city}/${order.address?.state}`)
  console.log(`Shipping service: ${order.shipping?.company} (${order.shipping?.name}) - ID ${order.shipping?.serviceId}`)

  const result = await generateShipmentForOrder(order)
  if (!result) {
    console.error("Failed to generate shipment. Check the logs above.")
    process.exit(1)
  }

  console.log("-----------------------------------------")
  console.log(`Shipment status in Melhor Envio: ${result.status}`)
  console.log(`Melhor Envio Cart ID: ${result.cartId}`)
  if (result.labelUrl) {
    console.log(`Label Print URL: ${result.labelUrl}`)
  }
  if (result.trackingCode) {
    console.log(`Tracking Code: ${result.trackingCode}`)
  }
  if (result.status === "pending") {
    console.log("Notice: The shipment is in your Melhor Envio cart. Open https://melhorenvio.com.br/painel/carrinho to pay and print.")
  }
  console.log("-----------------------------------------")
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
