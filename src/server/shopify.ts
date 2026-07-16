// Server-only — never imported by client bundles.
// Protected by vite importProtection ("**/server/**" → error on client import).

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";
console.log("[shopify] Using token:", DOMAIN, STOREFRONT_TOKEN?.slice(0, 8));

// ── Types ─────────────────────────────────────────────────────────────────────

export type ShopifyVariant = {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  variants: { edges: Array<{ node: ShopifyVariant }> };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: { id: string };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  lines: { edges: Array<{ node: ShopifyCartLine }> };
};

// ── Admin API raw types ───────────────────────────────────────────────────────
// Admin GraphQL 2024-10: ProductVariant.price is a Money scalar (string "75.00"),
// unlike Storefront API where it's MoneyV2 { amount currencyCode }.

type AdminVariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: string;
};

type AdminProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  variants: { edges: Array<{ node: AdminVariantNode }> };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
};

// ── Admin API fetcher (products) ──────────────────────────────────────────────
// Uses the public Storefront API token from SHOPIFY_STOREFRONT_TOKEN env var.
// Token is the public access token from the Headless sales channel in Shopify Admin.
//
// NOTE: this is different from the OAuth client_credentials token (SHOPIFY_CLIENT_ID
// + SHOPIFY_CLIENT_SECRET) which only has write_orders scope and is used for orders.

async function adminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!DOMAIN) throw new Error("Missing SHOPIFY_STORE_DOMAIN env var");
  const token = STOREFRONT_TOKEN; // shpat_ token — works on Admin API, not Storefront API
  if (!token) throw new Error("Missing SHOPIFY_STOREFRONT_TOKEN env var");

  const res = await fetch(`https://${DOMAIN}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token, // Admin API uses this header, not X-Shopify-Storefront-Access-Token
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[shopify-admin] HTTP ${res.status}:`, text.slice(0, 300));
    throw new Error(`Shopify Admin HTTP ${res.status}: ${text}`);
  }
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    console.error("[shopify-admin] GraphQL errors:", json.errors);
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }
  if (json.data === undefined) throw new Error("No data in Shopify Admin response");
  return json.data;
}

// Normalize Admin API scalar price → { amount, currencyCode } so mapShopifyProduct
// needs no changes. Store currency is AED; Admin GraphQL doesn't return it on the scalar.
function normalizeAdminProduct(node: AdminProductNode): ShopifyProduct {
  return {
    ...node,
    variants: {
      edges: node.variants.edges.map((e) => ({
        node: {
          ...e.node,
          price: { amount: e.node.price, currencyCode: "AED" },
        },
      })),
    },
  };
}

// ── Storefront API fetcher (cart mutations only) ──────────────────────────────
// Cart sync is fire-and-forget in cart.tsx — 401 failures are caught silently.
// Products are read via Admin API above; this is only needed for cart mutations.

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_TOKEN env var");
  }
  const res = await fetch(`https://${DOMAIN}/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(", "));
  if (json.data === undefined) throw new Error("No data in Shopify response");
  return json.data;
}

// ── Field fragments ───────────────────────────────────────────────────────────

const ADMIN_VARIANT_FIELDS = `id title availableForSale price`;

const ADMIN_PRODUCT_FIELDS = `
  id handle title description
  variants(first: 20) { edges { node { ${ADMIN_VARIANT_FIELDS} } } }
  images(first: 10) { edges { node { url altText } } }
`;

const CART_LINE_FIELDS = `
  id quantity
  merchandise { ... on ProductVariant { id } }
`;

const CART_FIELDS = `
  id checkoutUrl
  lines(first: 50) { edges { node { ${CART_LINE_FIELDS} } } }
`;

// ── Product queries (Admin API) ───────────────────────────────────────────────

export async function gqlProducts(): Promise<ShopifyProduct[]> {
  const data = await adminFetch<{
    products: { edges: Array<{ node: AdminProductNode }> };
  }>(
    `{ products(first: 30, query: "status:active") { edges { node { ${ADMIN_PRODUCT_FIELDS} } } } }`,
  );
  return data.products.edges.map((e) => normalizeAdminProduct(e.node));
}

export async function gqlProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await adminFetch<{ productByHandle: AdminProductNode | null }>(
    `query P($handle: String!) { productByHandle(handle: $handle) { ${ADMIN_PRODUCT_FIELDS} } }`,
    { handle },
  );
  return data.productByHandle ? normalizeAdminProduct(data.productByHandle) : null;
}

// ── Cart mutations (Storefront API) ──────────────────────────────────────────

export async function gqlCartCreate(
  variantId: string,
  quantity: number,
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(
    `mutation CC($lines:[CartLineInput!]!){
       cartCreate(input:{lines:$lines}){ cart { ${CART_FIELDS} } }
     }`,
    { lines: [{ merchandiseId: variantId, quantity }] },
  );
  return data.cartCreate.cart;
}

export async function gqlCartLinesAdd(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(
    `mutation CLA($cartId:ID!,$lines:[CartLineInput!]!){
       cartLinesAdd(cartId:$cartId,lines:$lines){ cart { ${CART_FIELDS} } }
     }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  );
  return data.cartLinesAdd.cart;
}

export async function gqlCartLinesRemove(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(
    `mutation CLR($cartId:ID!,$lineIds:[ID!]!){
       cartLinesRemove(cartId:$cartId,lineIds:$lineIds){ cart { ${CART_FIELDS} } }
     }`,
    { cartId, lineIds },
  );
  return data.cartLinesRemove.cart;
}

export async function gqlCartLinesUpdate(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>(
    `mutation CLU($cartId:ID!,$lines:[CartLineUpdateInput!]!){
       cartLinesUpdate(cartId:$cartId,lines:$lines){ cart { ${CART_FIELDS} } }
     }`,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  return data.cartLinesUpdate.cart;
}
