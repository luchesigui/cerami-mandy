import { NextRequest, NextResponse } from "next/server"

import { isValidCep, normalizeCep } from "@lib/shipping/cep"

type ViaCepResponse = {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean | string
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cep: string }> }
) {
  const cep = normalizeCep((await params).cep)

  if (!isValidCep(cep)) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 })
  }

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    next: { revalidate: 60 * 60 * 24 },
  }).catch(() => null)

  if (!res?.ok) {
    return NextResponse.json(
      { error: "Não foi possível consultar o CEP." },
      { status: 502 }
    )
  }

  const data = (await res.json()) as ViaCepResponse

  if (data.erro) {
    return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 })
  }

  return NextResponse.json({
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  })
}
