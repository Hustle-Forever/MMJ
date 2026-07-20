# MMJ Notebook Studio

Custom e-commerce storefront for MMJ — a UAE notebook brand. Built with TanStack Start (SSR), Stripe PaymentElement, and Shopify as a headless backend. Deployed on Vercel.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | TanStack Start (React 19, file-based SSR routing via Nitro) |
| Styling | Tailwind CSS v4 |
| 3D viewer | React Three Fiber + Drei |
| Animations | GSAP + Lenis smooth scroll + Framer Motion |
| Payments | Stripe (PaymentElement — Apple Pay / Google Pay included automatically) |
| Product data | Shopify Storefront API (public token, read-only) |
| Order creation | Shopify Admin API (OAuth client_credentials, write_orders scope) |
| Deployment | Vercel (Nitro `vercel` preset, Node.js 24.x runtime) |
| Package manager | Bun |

---

## Architecture Overview

```
Browser
  │
  ├── Static assets → Vercel CDN (.vercel/output/static/)
  │
  └── SSR + API → Vercel Serverless Function (__server.func/)
        │
        ├── src/server.ts          ← single entry; intercepts webhook + rate limiting
        ├── src/server/shopify.ts  ← Storefront API (products, cart mutations)
        ├── src/server/shopify-admin.ts  ← Admin API (order creation only)
        ├── src/server/stripe.ts   ← PaymentIntent creation + verification
        └── src/server/stripe-webhook.ts ← Stripe event handler
```

The app is **fully SSR'd** — routes use `loader` functions that run server-side via `createServerFn`. Client JS hydrates after first paint.

---

## Folder Structure

```
src/
├── assets/covers/          ← Bundled WebP cover images (vite imports, not public/)
├── components/
│   ├── Nav.tsx
│   ├── shop/CartDrawer.tsx
│   └── three/              ← React Three Fiber scene + Notebook mesh
├── hooks/
├── lib/
│   ├── cart.tsx            ← Cart context + Shopify cart sync (fire-and-forget)
│   ├── checkout-fns.ts     ← createServerFn wrappers (client-callable server fns)
│   ├── delivery.ts         ← Per-emirate delivery fee lookup (AED 15 flat)
│   ├── products.ts         ← Editorial metadata + mapShopifyProduct()
│   └── shopify-fns.ts      ← createServerFn wrappers for Shopify queries
├── routes/
│   ├── __root.tsx
│   ├── index.tsx           ← Homepage
│   ├── shop/
│   │   ├── index.tsx       ← /shop — product grid
│   │   └── $handle.tsx     ← /shop/[handle] — product detail + 3D viewer
│   ├── checkout.tsx        ← /checkout — Stripe PaymentElement form
│   └── order-confirmed.tsx ← /order-confirmed
└── server/
    ├── rate-limit.ts       ← Per-IP sliding-window limiter
    ├── shopify.ts          ← Storefront API fetcher + cart/product GQL
    ├── shopify-admin.ts    ← Admin API OAuth + adminCreateOrder
    ├── stripe.ts           ← Stripe SDK wrapper
    └── stripe-webhook.ts   ← Webhook handler (signature verify → create order)
```

---

## Environment Variables

Never commit real values. Set these in Vercel → Project Settings → Environment Variables.

```env
# Shopify Storefront API — public token from Headless sales channel
# Shopify Admin → Sales channels → Headless → Storefront API → Public access token
SHOPIFY_STOREFRONT_TOKEN=your_public_storefront_token

# Shopify store domain (no https://, no trailing slash)
SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com

# Shopify Admin API — OAuth app credentials (write_orders + read_orders scopes)
# Shopify Admin → Settings → Apps → Develop apps → create app → API credentials
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret

# Stripe secret key (server-only, never VITE_ prefix)
STRIPE_SECRET_KEY=sk_live_...

# Stripe publishable key (VITE_ prefix makes it available in client bundle)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe webhook signing secret
# Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Two separate Shopify tokens are in use:**

| Var | API | Scope | Used for |
|---|---|---|---|
| `SHOPIFY_STOREFRONT_TOKEN` | Storefront API | Public read | Fetching products, prices, cart mutations |
| `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` | Admin API (OAuth) | `write_orders`, `read_orders` | Creating Shopify orders after payment |

These are different APIs with different endpoints, different auth headers, and different tokens. See Lessons Learned.

---

## Product Catalogue

The `/shop` page is **not fully dynamic**. It shows exactly the products defined in `src/lib/products.ts`. Shopify is used to hydrate prices, descriptions, variants, and extra images onto those known handles — it does not drive the product listing.

**To add a new product:**

1. Add editorial metadata to the `META` object in `src/lib/products.ts` (colour hex, specs, mood copy, cover image)
2. Add a fallback entry to the `products` array in the same file
3. Add a `COLOR_MAP` entry in `src/routes/shop/$handle.tsx`
4. Add a bundled cover WebP to `src/assets/covers/` and import it

The Shopify product's **handle must match** the key used in `META`. Visiting `/shop/[handle]` directly will call `gqlProduct(handle)` live from Shopify, but if the handle isn't in `META`, `mapShopifyProduct` returns `null` and the page shows "Product not found".

---

## Full Checkout Flow

```
1. User adds item to cart
      └── CartProvider dispatches ADD
      └── Fire-and-forget Shopify cart mutation (cartCreate / cartLinesAdd)
          — tracks Shopify cart for potential native checkout fallback

2. User opens /checkout
      └── initPaymentIntent (createServerFn)
            └── stripe.paymentIntents.create(amount, currency: "aed")
            └── Stores cart items in PI metadata (webhook recovery)
            └── Returns { clientSecret, paymentIntentId }

3. Stripe PaymentElement mounts with clientSecret
      └── Shows card, Apple Pay, Google Pay, Link — browser/device dependent
      └── User fills shipping form (validated client + server)

4. User taps Pay
      └── attachCustomer (createServerFn) — stores customer in PI metadata
            — non-fatal: direct flow still works if this fails
      └── stripe.confirmPayment() — Stripe handles 3DS if required

5a. Direct return (no 3DS redirect):
      └── paymentIntent.status === "succeeded"
      └── finalizeOrder (createServerFn)
            └── verifyPaymentIntent — re-fetches PI from Stripe server-side
            └── Checks pi.status === "succeeded" AND pi.amount === expectedFils
            └── adminCreateOrder → Shopify Admin API → creates draft order
            └── Navigates to /order-confirmed?orderNumber=...

5b. 3DS redirect return:
      └── payment_intent param in URL
      └── Loads form + items from sessionStorage
      └── Calls finalizeOrder (same path as 5a)

6. Webhook (parallel safety net):
      └── POST /api/webhooks/stripe
      └── Verifies stripe-signature header (rejects 400 if invalid)
      └── Handles payment_intent.succeeded only
      └── Checks order doesn't already exist (idempotency)
      └── Reconstructs order from PI metadata (handles browser-close edge case)
      └── adminCreateOrder
```

**Why both finalizeOrder AND the webhook?**
- `finalizeOrder` handles the happy path (browser stays open, no 3DS)
- The webhook is the safety net for: browser closed after charge, 3DS redirect where the browser crashes, or any network failure between Stripe confirmation and `finalizeOrder` completing
- The idempotency check in the webhook (`adminOrderExistsForPaymentIntent`) prevents duplicate orders

---

## Deployment — Fresh Vercel Setup

### 1. Shopify Setup

1. Create a **Headless** sales channel in Shopify Admin → Sales channels → Add → Headless
2. Under Storefront API, enable the scopes you need (products, collections, cart) → copy the **Public access token** → set as `SHOPIFY_STOREFRONT_TOKEN`
3. Go to Settings → Apps → Develop apps → Create app
4. Under Configuration, enable `write_orders` and `read_orders` scopes → Install → copy Client ID and Client Secret → set as `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET`

### 2. Stripe Setup

1. Get secret + publishable keys from Stripe Dashboard → Developers → API keys
2. Create a webhook endpoint: Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Event: `payment_intent.succeeded`
   - Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET`

### 3. Vercel Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# From mmj-notebook-studio/
vercel

# Set all env vars (or use Vercel dashboard)
vercel env add SHOPIFY_STOREFRONT_TOKEN
vercel env add SHOPIFY_STORE_DOMAIN
vercel env add SHOPIFY_CLIENT_ID
vercel env add SHOPIFY_CLIENT_SECRET
vercel env add STRIPE_SECRET_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET

# Deploy to production
vercel --prod
```

The `vite.config.ts` already has `preset: "vercel"` configured in the Nitro options. A `vercel.json` is present to set headers for `/.well-known/` (required for Apple Pay domain verification).

### 4. Apple Pay domain verification (Stripe)

Apple Pay requires `/.well-known/apple-developer-merchantid-domain-association` to be served as a plain-text file from your domain.

1. In Stripe Dashboard → Settings → Payment methods → Apple Pay → Domains → Add domain
2. Stripe will show you the file contents — paste them into `public/.well-known/apple-developer-merchantid-domain-association`
3. Deploy, then verify:

```bash
# Must return 200 with Content-Type: text/plain and the file body (not an HTML 404)
curl -I https://curatedbymmj.ae/.well-known/apple-developer-merchantid-domain-association
# Expected: HTTP/2 200  /  content-type: text/plain

curl https://curatedbymmj.ae/.well-known/apple-developer-merchantid-domain-association
# Expected: the raw domain association file content (starts with {"sslcertificate":...)
```

**Why this works:** Nitro's Vercel preset generates `.vercel/output/config.json` with a `handle: filesystem` rule before the SSR catch-all. Files in `public/` are copied to `.vercel/output/static/` at build time and served as static assets. The `vercel.json` `headers` rule forces `Content-Type: text/plain` on all `/.well-known/` paths.

### 5. Verify after deploy

```bash
# Confirm Storefront token works:
curl -X POST https://yourstore.myshopify.com/api/2024-10/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: YOUR_TOKEN" \
  -d '{"query":"{ shop { name } }"}'
# Expected: {"data":{"shop":{"name":"My Store"}}}

# Confirm webhook is reachable — send a test event from Stripe Dashboard
```

---

## Homepage Redesign — The Still Life (2026-07-20)

Design pass on the homepage only (no checkout/Shopify/Stripe changes).

**New: The Still Life section** (`src/components/sections/StillLife.tsx` + `src/components/three/StillLifeScene.tsx`)
- The page's single dark chapter — `--navy` (#092c49), a deep shade of the locked brand blue, between Showcase and Editorial.
- Three notebooks composed like a luxury product photograph: blush + sage lying stacked, ocean leaning behind, satin ribbons pooling on the set floor.
- Material realism: procedural env map (drei Lightformers — no network HDR), linen-weave bump map (procedural canvas), roughness 0.65, warm raking strip light producing a readable specular along the covers, baked `ContactShadows` (frames=1).
- `frameloop="demand"` — the idle scene renders zero frames; hover tilt (desktop only) invalidates frames only while settling.
- Mobile (and no-WebGL/reduced-motion) gets a static fanned-covers composition — no canvas, no cost. Desktop ≥768px with WebGL gets the live set.

**Fixes from the design audit**
- Section surface contrast: Showcase now sits on white, Still Life on navy, Testimonials on blush-2 — the page reads as chapters instead of wall-to-wall blush.
- Hero completes at 1440×900: tighter rhythm, headline capped at 5.75rem, stage capped at 44vh — eyebrow, headline, book and CTA all above the fold. Mobile headline floor raised to 3.5rem.
- Showcase hierarchy: collection counter (01—03), the previously unused per-colourway `mood` line in script, larger description, less dead space.
- Button hierarchy: the filled pill is now reserved for the hero's single primary CTA; Showcase and Still Life actions use an underline treatment.
- Copy: "Make it happen." now appears only in the hero. Film header became "The first page is yours."; the marquee slot became "Made to be returned to".

**3D API change**: `NotebookBody` accepts `showRibbon?: boolean` (default `true`) — the still life hides the hanging tail (it would float sideways on lying books) and uses pooled floor ribbons instead.

**Hero pop-in fix (2026-07-20)**: the flat fallback cover rendered at 100% of the stage height while the 3D book fills only ~80.5% (`NB.H / (2·(6−D/2)·tan(fov/2))` at camera z=6, fov=34), so the crossfade visibly snapped the book smaller on first load. The flat cover now renders at 80.5% so the first painted frame matches the 3D book's final size.

**Shop grid redesign (2026-07-20)** — `src/routes/shop/index.tsx`, matching the Still Life editorial direction:
- Killed the per-product tinted panel and the colored label bar (it duplicated the title).
- Product photos now sit on a clean white surface with a quiet `№ 01` index marker.
- Editorial caption under a hairline rule: display name, tabular price, the per-colourway script mood line, and an underline "Shop →" (the filled pill stays hero-only).
- Hover flips the notebook to its **back cover** (bundled `cover_*_back.webp`, imported directly — not via `three/Notebook`, which would pull three.js into the route bundle). Unknown Shopify products fall back to their second CDN image, or a plain scale if none.
- Cards step down across the row (`lg:mt-16` / `lg:mt-32` by column) — a salon-wall rhythm instead of three identical boxes.

---

## Lessons Learned

### 1. Shopify has two completely different APIs — wrong token = silent 401

The Storefront API and Admin API are separate systems with different endpoints, different auth headers, and different token formats.

| | Storefront API | Admin API |
|---|---|---|
| Endpoint | `/api/2024-10/graphql.json` | `/admin/api/2024-10/graphql.json` |
| Auth header | `X-Shopify-Storefront-Access-Token` | `X-Shopify-Access-Token` |
| Token source | Headless channel → Public access token | Develop apps → API credentials |
| Token prefix | None (32-char hex) | `shpat_` (personal) or OAuth token |

**What went wrong:** The original build used a `shpat_` Admin personal access token in the wrong field and pointed it at the Admin endpoint. Then the code was rewritten to hit the Admin endpoint with the public Storefront token (a completely different credential type). Both fail with a bare `401` that gives no hint which mismatch occurred.

**Fix:** Use the Storefront API (public token + Storefront endpoint) for everything product/cart related. Use Admin API (OAuth `client_credentials`) only for order creation after payment is confirmed. Test the Storefront token directly with curl before touching any app code — this isolates credential problems from code problems instantly.

### 2. Static files in `public/textures/` 404 on Vercel — bundle via `src/assets/` instead

Three.js texture loading via `useTexture('/textures/cover_pink.webp')` worked locally but 404'd on Vercel. The Nitro/Vercel preset does not automatically copy subfolders of `public/` into `.vercel/output/static/` in all cases, and the path resolution differs between Vite dev server and the compiled Nitro bundle.

**Fix:** Import images directly through Vite:
```ts
import coverPink from "@/assets/covers/cover_pink_front.webp";
```
Vite hashes and copies these into the build output, and the imported value is a URL string that works identically in dev and production. The 3D scene receives the URL as a prop.

### 3. `localhost` vs `127.0.0.1` — IPv6 relay quirk on Windows dev

During development, the Vite dev server binds to `localhost` which on Windows resolves to `::1` (IPv6) first. Stripe webhook forwarding via `stripe listen --forward-to localhost:3000/api/webhooks/stripe` may fail silently or relay to the wrong address.

**Fix:** Use `127.0.0.1` explicitly:
```bash
stripe listen --forward-to 127.0.0.1:3000/api/webhooks/stripe
```
Or bind Vite to `0.0.0.0` in `vite.config.ts`:
```ts
server: { host: "0.0.0.0" }
```

---

## Local Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
# → http://localhost:3000

# Build for production
bun run build

# Preview production build locally
bun run preview

# Forward Stripe webhooks to local server (separate terminal)
stripe listen --forward-to 127.0.0.1:3000/api/webhooks/stripe
```

Copy `.env.example` to `.env` and fill in all values before running.

---

## Security Notes

- `STRIPE_SECRET_KEY` and all Shopify secrets are server-only — never prefixed with `VITE_`
- Only `VITE_STRIPE_PUBLISHABLE_KEY` appears in the client bundle (by design — Stripe requires it)
- Webhook endpoint verifies `stripe-signature` on every request; unverified requests return 400
- `finalizeOrder` re-fetches and verifies the PaymentIntent server-side before creating any order — the browser result is never trusted
- Checkout API endpoint rate-limited to 5 requests/minute/IP (per serverless instance)
- Input validated client-side (immediate feedback) and server-side (before Shopify order creation)
- `.env` is gitignored and has never been committed
