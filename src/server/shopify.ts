// Server-only — never imported by client bundles.
// Protected by vite importProtection ("**/server/**" → error on client import).

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";

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

// ── Storefront API fetcher ────────────────────────────────────────────────────

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

const STOREFRONT_VARIANT_FIELDS = `id title availableForSale price { amount currencyCode }`;

const STOREFRONT_PRODUCT_FIELDS = `
  id handle title description
  variants(first: 20) { edges { node { ${STOREFRONT_VARIANT_FIELDS} } } }
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

// ── Product queries (Storefront API) ─────────────────────────────────────────

export async function gqlProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{
    products: { edges: Array<{ node: ShopifyProduct }> };
  }>(
    `{ products(first: 30) { edges { node { ${STOREFRONT_PRODUCT_FIELDS} } } } }`,
  );
  return data.products.edges.map((e) => e.node);
}

export async function gqlProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    `query P($handle: String!) { product(handle: $handle) { ${STOREFRONT_PRODUCT_FIELDS} } }`,
    { handle },
  );
  return data.product ?? null;
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
