import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Página não encontrada | Cerami Mandy",
}

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 px-6 text-center text-[#13110C]">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-sm text-[#13110C]/70">
        O endereço que você tentou acessar não existe ou a peça não está mais aqui.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-[#FCAB42] px-10 py-3.5 text-base font-bold uppercase"
      >
        Ver peças
      </Link>
    </div>
  )
}
