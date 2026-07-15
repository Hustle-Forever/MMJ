// Server-only — never imported by client bundles.
// Invoked from src/server.ts BEFORE TanStack Start routing so the request
// body stream is still unconsumed (required by stripe.webhooks.constructEvent).

import type Stripe from "stripe";
import { constructWebhookEvent } from "./stripe";
import {
  adminOrderExistsForPaymentIntent,
  adminCreateOrder,
  type AdminCustomer,
} from "./shopify-admin";
import type { ItemMeta } from "./stripe";

export async function handleStripeWebhook(request: Request): Promise<Response> {
  // ── 1. Read raw body — MUST happen before any other body access ────────
  const rawBody = await request.text();

  // ── 2. Signature verification — reject anything not signed by Stripe ───
  const sig = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!sig || !webhookSecret) {
    console.error(
      "[webhook] Missing stripe-signature header or STRIPE_WEBHOOK_SECRET env var.",
      !sig ? "No signature header." : "No webhook secret.",
    );
    return new Response("Unauthorized", { status: 401 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    // constructEvent throws if signature doesn't match — spoofed or wrong secret.
    console.error(
      "[webhook] Signature verification failed:",
      err instanceof Error ? err.message : String(err),
    );
    return new Response("Webhook signature invalid", { status: 400 });
  }

  // ── 3. Only process payment_intent.succeeded ───────────────────────────
  // Return 200 for all other event types so Stripe doesn't mark them failed.
  if (event.type !== "payment_intent.succeeded") {
    return new Response("ok", { status: 200 });
  }

  const pi = event.data.object as Stripe.PaymentIntent;
  console.log(
    `[webhook] payment_intent.succeeded: ${pi.id}  amount=${pi.amount}  currency=${pi.currency}`,
  );

  // ── 4. Verify this PaymentIntent belongs to our checkout ───────────────
  // source is set in createPaymentIntent; currency is always "aed" for us.
  if (
    pi.currency !== "aed" ||
    pi.amount <= 0 ||
    pi.metadata?.source !== "mmj-checkout"
  ) {
    console.warn(
      "[webhook] PaymentIntent not from our checkout — ignoring:",
      pi.id,
    );
    return new Response("ok", { status: 200 });
  }

  // ── 5. Idempotency check — skip if direct flow already created the order ─
  try {
    const exists = await adminOrderExistsForPaymentIntent(pi.id);
    if (exists) {
      console.log(
        "[webhook] Order already exists for PI:",
        pi.id,
        "— skipping duplicate",
      );
      return new Response("ok", { status: 200 });
    }
  } catch (err) {
    console.error("[webhook] Idempotency check failed:", err);
    // Return 500 so Stripe retries — transient Shopify API error.
    return new Response("Internal Server Error", { status: 500 });
  }

  // ── 6. Reconstruct order from PI metadata ─────────────────────────────
  const meta = pi.metadata ?? {};

  // Items were stored at PI creation time (initPaymentIntent).
  let items: ItemMeta[];
  try {
    items = JSON.parse(meta.items ?? "[]") as ItemMeta[];
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("empty items array");
    }
  } catch (err) {
    console.error(
      "[webhook] Cannot parse items metadata for PI:",
      pi.id,
      "| raw:",
      meta.items,
      "| error:",
      err,
    );
    // Items metadata is structural — retrying won't fix it; acknowledge and log.
    return new Response("ok", { status: 200 });
  }

  // Customer info was stored just before stripe.confirmPayment (attachCustomer).
  // If that call failed (rare), we have no customer info — log and acknowledge.
  if (!meta.customer_f || !meta.customer_email) {
    console.error(
      "[webhook] Customer metadata missing for PI:",
      pi.id,
      "— attachCustomer may have failed. Manual order creation required.",
      "| Payment confirmed by Stripe, amount:",
      pi.amount / 100,
      "AED",
    );
    // Returning 200 because retrying won't add missing metadata.
    // Store owner must create the order manually via the Stripe dashboard PI link.
    return new Response("ok", { status: 200 });
  }

  const customer: AdminCustomer = {
    firstName: meta.customer_f,
    lastName: meta.customer_l ?? "",
    email: meta.customer_email,
    phone: meta.customer_phone ?? "",
    address: meta.customer_addr ?? "",
    city: meta.customer_city ?? "",
    emirate: meta.customer_emirate ?? "",
  };

  // ── 7. Create Shopify order ────────────────────────────────────────────
  const totalAmountAed = pi.amount / 100; // fils → AED
  try {
    const { id, orderNumber } = await adminCreateOrder({
      lineItems: items.map((item) => ({
        variantGid: item.v,
        quantity: item.q,
        price: item.p,
      })),
      customer,
      totalAmount: totalAmountAed,
      paymentIntentId: pi.id,
    });
    console.log(
      `[webhook] Shopify order #${orderNumber} (id=${id}) created for PI: ${pi.id}`,
    );
  } catch (err) {
    console.error("[webhook] Shopify order creation failed for PI:", pi.id, err);
    // Return 500 — Stripe will retry (up to 3 days / 87 attempts).
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
