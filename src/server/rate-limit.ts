// Server-only — never imported by client bundles.
//
// Sliding-window rate limiter scoped per IP address.
// Works within a single serverless function instance. Because Vercel may
// spin up multiple instances under load, this does not provide a global
// hard cap — for that, wire in Upstash Redis / Vercel KV. What this DOES
// prevent: burst spam from a single IP hitting one instance repeatedly.

type Window = { count: number; windowStart: number };

const store = new Map<string, Window>();

// Prune entries older than 2× the window to keep memory bounded.
function prune(nowMs: number, windowMs: number) {
  for (const [key, val] of store) {
    if (nowMs - val.windowStart > windowMs * 2) store.delete(key);
  }
}

/**
 * Returns true if the request from `ip` should be blocked.
 * @param ip        Client IP string
 * @param limit     Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 */
export function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now, windowMs);

  const entry = store.get(ip);
  if (!entry || now - entry.windowStart > windowMs) {
    store.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

export function rateLimitedResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    },
  );
}
