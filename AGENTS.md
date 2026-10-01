# AGENTS.md

Cerami Mandy: online shop for one-of-a-kind ceramic pieces, Brazil only, UI in pt-BR.

- `apps/storefront` — Next.js 15 (App Router). Shop, bag, checkout, order pages and the BFF in `src/app/api`.
- `studio-cerami-mandy` — Sanity Studio, deployed to ceramimandy.sanity.studio. Not an npm workspace; run its commands inside the folder.
- Services: Sanity (catalogue and orders), Melhor Envio (shipping quotes), InfinitePay (hosted checkout, Pix and card), ViaCEP (address lookup).

npm is the package manager. Scripts live in each `package.json`.

## How the shop works

- **Every piece is unique** (`inventory` 0 or 1). "Can be bought" is one GROQ fragment, `AVAILABLE` in `apps/storefront/src/sanity/queries.ts`; change availability there and nowhere else.
- **The server is the source of truth.** Routes in `src/app/api` read prices, availability and packaging measurements from Sanity and re-quote shipping; values sent by the browser are hints. Business rules live in `src/lib/orders`, `src/lib/payments` and `src/lib/shipping`; route handlers stay thin.
- **Orders are private documents** with `_id` `order.<uuid>`. Ids containing a dot are hidden from the public Sanity API, which is what keeps customer data (CPF, address) private. Read and write orders only through `src/sanity/write-client.ts` (server-only token). The order number counter is the document `order.counter`.
- **Checkout flow:** `createOrder` reserves the pieces for 30 min (transaction with `ifRevisionId`) and creates an InfinitePay link. Customers reach the link only through `/api/pedidos/[id]/pagar`, which refuses once the reservation is over, because InfinitePay links never expire.
- **Payment confirmation** always goes through `payment_check` (`confirmPayment`), whether triggered by the return page or the webhook. The webhook is unsigned and authenticated by `?secret=` in its URL. A payment that arrives after the piece was sold to someone else becomes status `pago_conflito`, refunded by hand in the InfinitePay app.
- **Studio drafts:** checkout writes (reservation, sale) patch `drafts.<id>` too when it exists; otherwise publishing a draft would undo them.
- **Money:** prices are numbers in reais everywhere; InfinitePay takes cents (`toCents`).

## Testing

There is no test suite. Verify with `npx tsc --noEmit`, `npm run lint` and `npm run build` in `apps/storefront`.

InfinitePay has no sandbox. With `INFINITEPAY_MOCK=true` the checkout link points to `/api/dev/infinitepay-checkout`, which pays instantly; the mock is ignored on the production deploy (`VERCEL_ENV=production`). Melhor Envio uses its sandbox while `MELHOR_ENVIO_ENV=sandbox`.

## After changing a Sanity schema or GROQ query

Run `npm run typegen` in `studio-cerami-mandy`: it regenerates `schema.json` and `apps/storefront/sanity.types.ts` (generated; edit the schema or query instead). Run `npm run deploy` there for schema changes to reach the hosted Studio.

## Deploy

Vercel project `cerami-mandy-storefront`. The branch `feat/sanity-catalogue-shipping` is its production branch, so every push there deploys to production. Environment variables are documented in `apps/storefront/.env.template`; manage them with `vercel env`.

## Code style

- Storefront: no semicolons, double quotes, 2-space indent. Studio: single quotes (its Prettier config).
- Files kebab-case, components PascalCase, functions camelCase.
- User-facing text in pt-BR; code, comments and commit messages in English, without emojis.

## Off-limits

- `.env.local` and other env files: never commit, print or copy their values. Document new variables in `.env.template`.
- `package-lock.json`: changes only through npm commands.
- `.next/`, `.turbo/`, `studio-cerami-mandy/dist/`: build output.
