import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleStripeWebhook } from "./server/stripe-webhook";

async function handleShopifyDebug(): Promise<Response> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
  const clientId = process.env.SHOPIFY_CLIENT_ID ?? "";
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET ?? "";

  // Step 1: get Admin OAuth token
  let adminToken = "";
  let oauthScope = "";
  let oauthResult: unknown = null;
  try {
    const r = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
    });
    const j = await r.json() as { access_token?: string; scope?: string; error?: string };
    adminToken = j.access_token ?? "";
    oauthScope = j.scope ?? "";
    oauthResult = { httpStatus: r.status, scope: oauthScope, hasToken: !!adminToken };
  } catch (err) {
    oauthResult = { fetchError: String(err) };
  }

  // Step 2: query products via Admin API
  let productsResult: unknown = null;
  if (adminToken) {
    try {
      const r = await fetch(`https://${domain}/admin/api/2024-10/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
        body: JSON.stringify({
          query: `{ products(first: 20, query: "status:active") { edges { node {
            handle title
            variants(first:1){ edges{ node{ price availableForSale } } }
          } } } }`,
        }),
      });
      const j = await r.json();
      productsResult = { httpStatus: r.status, body: j };
    } catch (err) {
      productsResult = { fetchError: String(err) };
    }
  }

  return new Response(
    JSON.stringify({ domain, oauth: oauthResult, products: productsResult }, null, 2),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Stripe webhook — must intercept before TanStack Start consumes the body.
    if (url.pathname === "/api/webhooks/stripe" && request.method === "POST") {
      return handleStripeWebhook(request);
    }

    // Shopify connectivity debug — shows token validity + product count.
    // Remove once prices are confirmed working.
    if (url.pathname === "/api/debug-shopify" && request.method === "GET") {
      return handleShopifyDebug();
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
