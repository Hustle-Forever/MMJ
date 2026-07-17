import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleStripeWebhook } from "./server/stripe-webhook";
import { isRateLimited, rateLimitedResponse } from "./server/rate-limit";

// Checkout server-fn calls all POST to /api/_server. Rate limit aggressively:
// 5 requests per minute per IP covers normal checkout flow with headroom.
const CHECKOUT_LIMIT = 5;
const CHECKOUT_WINDOW_MS = 60_000;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
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

const SITE_ORIGIN = "https://curatedbymmj.ae";

async function generateSitemap(): Promise<Response> {
  // Try to fetch live product handles from Shopify; fall back to known handles.
  let productHandles = ["blush-pink", "ocean-blue", "sage-green"];
  try {
    const { shopifyFetch } = await import("./server/shopify");
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: { handle: string } }> };
    }>("{ products(first: 50) { edges { node { handle } } } }");
    const live = data.products.edges.map((e) => e.node.handle);
    if (live.length > 0) productHandles = live;
  } catch (err) {
    console.error("[sitemap] Shopify fetch failed — using fallback handles:", err);
  }

  const today = new Date().toISOString().split("T")[0];

  const pages = [
    { path: "/",        priority: "1.0", changefreq: "weekly" },
    { path: "/shop",    priority: "0.9", changefreq: "weekly" },
    { path: "/journal", priority: "0.5", changefreq: "monthly" },
    ...productHandles.map((h) => ({
      path: `/shop/${h}`,
      priority: "0.8",
      changefreq: "monthly",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE_ORIGIN}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Sitemap — dynamic, includes live Shopify product handles.
    if (url.pathname === "/sitemap.xml") {
      return generateSitemap();
    }

    // Stripe webhook — must intercept before TanStack Start consumes the body.
    // ctx is the execution context (Vercel Edge / Cloudflare Workers).
    // waitUntil keeps the function alive after we return 200, so Stripe never
    // times out and retries (the primary cause of duplicate orders).
    if (url.pathname === "/api/webhooks/stripe" && request.method === "POST") {
      const execCtx = ctx as { waitUntil?: (p: Promise<void>) => void } | null;
      return handleStripeWebhook(request, execCtx ?? undefined);
    }

    // Rate-limit checkout server-fn POSTs (initPaymentIntent, finalizeOrder, etc.)
    if (url.pathname === "/api/_server" && request.method === "POST") {
      const ip = clientIp(request);
      if (isRateLimited(ip, CHECKOUT_LIMIT, CHECKOUT_WINDOW_MS)) {
        console.warn("[rate-limit] 429 for IP:", ip);
        return rateLimitedResponse();
      }
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
