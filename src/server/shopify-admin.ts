type LineItem = { variantGid: string; quantity: number; price: number };

export type AdminCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  emirate: string;
};

// ── OAuth token cache ─────────────────────────────────────────────────────────
// Tokens expire every 24 h; we re-fetch 5 min before expiry.
// Serverless cold starts clear this cache — one extra token call per cold boot,
// which is acceptable for a low-frequency checkout endpoint.
type TokenCache = { token: string; expiresAt: number } | null;
let _tokenCache: TokenCache = null;

export async function getShopifyAdminToken(): Promise<string> {
  const BUFFER_MS = 5 * 60 * 1000; // re-fetch 5 min before actual expiry
  const now = Date.now();

  if (_tokenCache && _tokenCache.expiresAt - now > BUFFER_MS) {
    return _tokenCache.token;
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const domain = process.env.SHOPIFY_STORE_DOMAIN;

  if (!clientId || !clientSecret || !domain) {
    throw new Error(
      "Missing SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, or SHOPIFY_STORE_DOMAIN",
    );
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify token request failed ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in?: number; // seconds; present when token is time-limited
  };

  if (!json.access_token) {
    throw new Error("Shopify OAuth response missing access_token");
  }

  // Default to 23 h if expires_in is absent, so we always refresh well before
  // any platform-side expiry rather than holding a potentially stale token forever.
  const expiresInMs = (json.expires_in ?? 23 * 60 * 60) * 1000;
  _tokenCache = { token: json.access_token, expiresAt: now + expiresInMs };

  return json.access_token;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function gidToNumericId(gid: string): number {
  return parseInt(gid.split("/").pop() ?? "0", 10);
}

// Search Shopify customers by an arbitrary query string (email:x or phone:x).
// Returns the numeric customer ID if found, null otherwise.
// Non-throwing: search failures fall through so order creation can still proceed.
async function searchCustomer(
  query: string,
  domain: string,
  token: string,
): Promise<number | null> {
  const url = `https://${domain}/admin/api/2024-10/customers/search.json?query=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetch(url, { headers: { "X-Shopify-Access-Token": token } });
    if (!res.ok) {
      console.warn(`[shopify] Customer search (${query}) returned ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { customers: Array<{ id: number }> };
    return json.customers[0]?.id ?? null;
  } catch (err) {
    console.warn("[shopify] Customer search threw:", err);
    return null;
  }
}

// Look up an existing Shopify customer by email first, then phone.
// Returns the numeric customer ID if an existing record is found, else null.
async function findExistingCustomer(
  customer: AdminCustomer,
  domain: string,
  token: string,
): Promise<number | null> {
  // Email is the primary identifier — most reliable and always unique.
  const byEmail = await searchCustomer(`email:${customer.email}`, domain, token);
  if (byEmail !== null) {
    console.log(`[shopify] Found existing customer by email (id=${byEmail})`);
    return byEmail;
  }
  // Phone fallback: catches "phone already taken" 422s when the same customer
  // re-orders with a slightly different email or Shopify deduped differently.
  if (customer.phone) {
    const byPhone = await searchCustomer(`phone:${customer.phone}`, domain, token);
    if (byPhone !== null) {
      console.log(`[shopify] Found existing customer by phone (id=${byPhone})`);
      return byPhone;
    }
  }
  return null;
}

export async function adminCreateOrder(params: {
  lineItems: LineItem[];
  customer: AdminCustomer;
  totalAmount: number;
  paymentIntentId: string;
}): Promise<{ id: number; orderNumber: number }> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error("Missing SHOPIFY_STORE_DOMAIN");

  // Token comes from OAuth client_credentials grant — never a static env var.
  const token = await getShopifyAdminToken();

  const { lineItems, customer, totalAmount, paymentIntentId } = params;

  // Look up existing customer BEFORE creating the order.
  // Attaching by ID avoids the "phone_number already taken" 422 that Shopify
  // throws when the customer object includes a phone that belongs to an
  // existing record. Repeat customers (same phone/email) are the normal case.
  const existingCustomerId = await findExistingCustomer(customer, domain, token);

  const body = {
    order: {
      line_items: lineItems.map((item) => ({
        variant_id: gidToNumericId(item.variantGid),
        quantity: item.quantity,
        price: item.price.toFixed(2),
      })),
      // Existing customer: attach by ID only (no create attempt → no 422).
      // New customer: include full details so Shopify creates the record.
      customer: existingCustomerId !== null
        ? { id: existingCustomerId }
        : {
            first_name: customer.firstName,
            last_name: customer.lastName,
            email: customer.email,
            phone: customer.phone,
          },
      shipping_address: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address1: customer.address,
        city: customer.city,
        province: customer.emirate,
        country: "AE",
        phone: customer.phone,
      },
      billing_address: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address1: customer.address,
        city: customer.city,
        province: customer.emirate,
        country: "AE",
      },
      email: customer.email,
      financial_status: "paid",
      send_receipt: true,
      transactions: [
        {
          kind: "sale",
          status: "success",
          amount: totalAmount.toFixed(2),
          gateway: "stripe",
          authorization: paymentIntentId,
        },
      ],
      note: `Stripe PaymentIntent: ${paymentIntentId}`,
      // Tag with the PI ID so adminOrderExistsForPaymentIntent can find it.
      tags: `stripe-payment,${paymentIntentId}`,
    },
  };

  const res = await fetch(
    `https://${domain}/admin/api/2024-10/orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin API ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    order: { id: number; order_number: number };
  };
  return { id: json.order.id, orderNumber: json.order.order_number };
}

// ── Idempotency ───────────────────────────────────────────────────────────────
// Returns the existing Shopify order for this PaymentIntent ID, or null if none
// exists. Called by the webhook handler before every adminCreateOrder call.
// Returns the order number so the webhook can send a confirmation email
// regardless of whether the order was just created or already existed.
export async function findOrderForPaymentIntent(
  paymentIntentId: string,
): Promise<{ shopifyOrderId: string; orderNumber: number } | null> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error("Missing SHOPIFY_STORE_DOMAIN");
  const token = await getShopifyAdminToken();

  // adminCreateOrder tags every order with the PI ID — query that tag.
  const gql = `query($q:String!){ orders(first:1,query:$q){ edges{ node{ id orderNumber } } } }`;
  const res = await fetch(`https://${domain}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query: gql, variables: { q: `tag:${paymentIntentId}` } }),
  });

  if (!res.ok) {
    throw new Error(`Shopify idempotency check ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    data?: { orders?: { edges: Array<{ node: { id: string; orderNumber: number } }> } };
  };
  const node = json.data?.orders?.edges?.[0]?.node;
  return node ? { shopifyOrderId: node.id, orderNumber: node.orderNumber } : null;
}
