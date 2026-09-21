import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-mode="light">
      <body className="bg-[#FFFDF9] text-[#010204] min-h-screen antialiased selection:bg-[#FFAD40] selection:text-[#010204]">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
