# Cerami Mandy

Loja online de peças de cerâmica únicas, feitas à mão.

- **Site:** `apps/storefront` (Next.js). Vitrine, sacola, cálculo de frete, checkout e acompanhamento do pedido.
- **Studio:** `studio-cerami-mandy` (Sanity), em [ceramimandy.sanity.studio](https://ceramimandy.sanity.studio). Cadastro de peças e acompanhamento dos pedidos.
- **Serviços:** Sanity (conteúdo e pedidos), Melhor Envio (frete), InfinitePay (pagamento por Pix e cartão).

## Rodando localmente

```bash
npm install
cp apps/storefront/.env.template apps/storefront/.env.local   # preencha as variáveis
npm run storefront:dev                                        # site em http://localhost:8000
npm run studio:dev                                            # Studio em http://localhost:3333
```

Para testar compras sem dinheiro real, use `INFINITEPAY_MOCK=true` no `.env.local`.

Detalhes de arquitetura e convenções estão em [AGENTS.md](./AGENTS.md).
