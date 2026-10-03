import { SanityLive } from "@/sanity/live"
import { getBaseURL } from "@lib/util/env"
import { AuthProvider } from "@modules/auth/auth-context"
import { BagProvider } from "@modules/bag/bag-context"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  description:
    "Canecas únicas, cheias de personalidade e feitas 100% à mão por Amanda Yoshiizumi. Arte em cerâmica para quem quer transformar a hora do café e já não tem paciência para louça básica e sem graça.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-mode="light">
      <body className="bg-[#FFFDF9] text-[#010204] min-h-screen antialiased selection:bg-[#FFAD40] selection:text-[#010204]">
        <BagProvider>
          <AuthProvider>{props.children}</AuthProvider>
        </BagProvider>
        <SanityLive />
      </body>
    </html>
  )
}
