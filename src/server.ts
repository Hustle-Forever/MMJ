import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleStripeWebhook } from "./server/stripe-webhook";

async function handleShopifyDebug(): Promise<Response> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";

  const tokenInfo = token
    ? `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`
    : "MISSING";

  let apiResult: unknown = null;
  try {
    const res = await fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({
        query: `{
          shop { name }
          products(first: 10) {
            edges { node { handle title variants(first:1){ edges{ node{ price{ amount } } } } } }
          }
        }`,
      }),
    });
    const body = await res.json();
    apiResult = { httpStatus: res.status, body };
  } catch (err) {
    apiResult = { fetchError: String(err) };
  }

  return new Response(
    JSON.stringify({ domain, token: tokenInfo, apiResult }, null, 2),
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
