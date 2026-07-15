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

// ── Admin API raw types (before price normalization) ──────────────────────────
// Admin GraphQL 2024-10: price on ProductVariant is a Money scalar (string),
// unlike Storefront API where it's MoneyV2 { amount currencyCode }.

type AdminVariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: string; // e.g. "75.00"
};

type AdminProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  variants: { edges: Array<{ node: AdminVariantNode }> };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
};

// ── Admin API fetcher (for product reads) ─────────────────────────────────────
// Products require read_products scope. We use the existing OAuth client_credentials
// token — just ensure read_products is added to the app's scope configuration.
// See: Shopify Admin → Apps → [your app] → Configuration → Admin API scopes.

async function adminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!DOMAIN) throw new Error("Missing SHOPIFY_STORE_DOMAIN env var");
  const { getShopifyAdminToken } = await import("./shopify-admin");
  const token = await getShopifyAdminToken();

  const res = await fetch(`https://${DOMAIN}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Shopify Admin HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(", "));
  if (json.data === undefined) throw new Error("No data in Shopify Admin response");
  return json.data;
}

// Normalize Admin API scalar price into the MoneyV2 shape the rest of the app expects.
// All prices on this store are AED — currencyCode is not returned by Admin GraphQL scalar.
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

// ── Storefront API fetcher (for cart mutations only) ──────────────────────────
// Cart mutations use the Storefront API. Will fail with 401 until a Storefront
// access token is configured — failures are caught silently in cart.tsx
// and do not block the cart UI or checkout flow.

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error(
      "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_TOKEN env var",
    );
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
  // productByHandle is stable in Admin GraphQL 2024-10.
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
