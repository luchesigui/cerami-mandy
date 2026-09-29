import { SanityLive } from "@/sanity/live"
import { getBaseURL } from "@lib/util/env"
import { BagProvider } from "@modules/bag/bag-context"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-mode="light">
      <body className="bg-[#FFFDF9] text-[#010204] min-h-screen antialiased selection:bg-[#FFAD40] selection:text-[#010204]">
        <BagProvider>
          <main className="relative">{props.children}</main>
        </BagProvider>
        <SanityLive />
      </body>
    </html>
  )
}
