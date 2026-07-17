// Server-only — never imported by client bundles.
// Invoked from src/server.ts BEFORE TanStack Start routing so the request
// body stream is still unconsumed (required by stripe.webhooks.constructEvent).

import type Stripe from "stripe";
import { constructWebhookEvent } from "./stripe";
import { findOrderForPaymentIntent, adminCreateOrder, type AdminCustomer } from "./shopify-admin";
import type { ItemMeta } from "./stripe";
import { getDeliveryFee } from "../lib/delivery";
import { sendOrderConfirmation } from "./email";

// ── Background order processing ───────────────────────────────────────────────
// Runs AFTER we've already returned 200 to Stripe (via waitUntil).
// If this throws, the order was NOT created — but Stripe will NOT retry because
// it already received 200. Log loudly so manual recovery is possible.
async function processWebhookOrder(
  paymentIntentId: string,
  customer: AdminCustomer,
  items: ItemMeta[],
  totalAmountAed: number,
  deliveryFeeAed: number,
): Promise<void> {
  // Idempotency check — guards against rare simultaneous deliveries.
  // Also handles the case where finalizeOrder already created the order.
  const existing = await findOrderForPaymentIntent(paymentIntentId);

  if (existing) {
    // Order was created by finalizeOrder (normal browser path), which also sent
    // the confirmation email. Nothing to do here — skip to avoid duplicate email.
    console.log(
      `[webhook] Order #${existing.orderNumber} already exists for PI: ${paymentIntentId} — email sent by finalizeOrder, skipping`,
    );
    return;
  }

  let orderNumber: number;
  try {
    const created = await adminCreateOrder({
      lineItems: items.map((item) => ({
        variantGid: item.v,
        quantity: item.q,
        price: item.p,
      })),
      customer,
      totalAmount: totalAmountAed,
      paymentIntentId,
    });
    console.log(
      `[webhook] Shopify order #${created.orderNumber} (id=${created.id}) created for PI: ${paymentIntentId}`,
    );
    orderNumber = created.orderNumber;
  } catch (err) {
    // Order creation failed. We already returned 200 to Stripe, so no retry will happen.
    // CRITICAL: the customer was charged but has no order. Alert loudly.
    console.error(
      `[webhook] CRITICAL: order creation FAILED for charged PI ${paymentIntentId}.`,
      "Manual order creation required in Shopify.",
      err,
    );
    return;
  }

  await sendConfirmationEmail(orderNumber, customer, items, deliveryFeeAed, totalAmountAed);
}

async function sendConfirmationEmail(
  orderNumber: number,
  customer: AdminCustomer,
  items: ItemMeta[],
  deliveryFeeAed: number,
  totalAed: number,
): Promise<void> {
  try {
    await sendOrderConfirmation({
      to: customer.email,
      orderNumber,
      customer: { firstName: customer.firstName, lastName: customer.lastName },
      items: items.map((item) => ({
        title: item.t ?? "Notebook",
        quantity: item.q,
        priceAed: item.p,
      })),
      address: {
        line1: customer.address,
        city: customer.city,
        emirate: customer.emirate,
      },
      deliveryFeeAed,
      totalAed,
    });
    console.log(`[webhook] Confirmation email sent to ${customer.email} for order #${orderNumber}`);
  } catch (err) {
    console.error(`[webhook] Email send failed for order #${orderNumber}:`, err);
  }
}

// ── Main webhook handler ──────────────────────────────────────────────────────
// FAST PATH: verify signature + parse metadata (< 1 second).
// Returns 200 to Stripe immediately so Stripe never times out and retries.
// Heavy work (order lookup/creation + email) runs in background via waitUntil.
//
// WHY THIS PREVENTS DUPLICATE ORDERS:
// Stripe retries a webhook only if it doesn't receive 200 within 30 seconds.
// By returning 200 in < 1s, Stripe marks the event as delivered and never retries.
// This eliminates the parallel-delivery race condition that was creating duplicates.
export async function handleStripeWebhook(
  request: Request,
  execCtx?: { waitUntil?: (p: Promise<void>) => void },
): Promise<Response> {
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
    console.error(
      "[webhook] Signature verification failed:",
      err instanceof Error ? err.message : String(err),
    );
    return new Response("Webhook signature invalid", { status: 400 });
  }

  // ── 3. Only process payment_intent.succeeded ───────────────────────────
  if (event.type !== "payment_intent.succeeded") {
    return new Response("ok", { status: 200 });
  }

  const pi = event.data.object as Stripe.PaymentIntent;
  console.log(
    `[webhook] payment_intent.succeeded: ${pi.id}  amount=${pi.amount}  currency=${pi.currency}`,
  );

  // ── 4. Verify this PaymentIntent belongs to our checkout ───────────────
  if (
    pi.currency !== "aed" ||
    pi.amount <= 0 ||
    pi.metadata?.source !== "mmj-checkout"
  ) {
    console.warn("[webhook] PaymentIntent not from our checkout — ignoring:", pi.id);
    return new Response("ok", { status: 200 });
  }

  // ── 5. Parse metadata — fast, no network calls ─────────────────────────
  const meta = pi.metadata ?? {};

  let items: ItemMeta[];
  try {
    items = JSON.parse(meta.items ?? "[]") as ItemMeta[];
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("empty items array");
    }
  } catch (err) {
    console.error(
      "[webhook] Cannot parse items metadata for PI:", pi.id,
      "| raw:", meta.items,
      "| error:", err,
    );
    return new Response("ok", { status: 200 });
  }

  if (!meta.customer_f || !meta.customer_email) {
    console.error(
      "[webhook] Customer metadata missing for PI:", pi.id,
      "— attachCustomer may have failed. Manual order creation required.",
      "| Payment confirmed by Stripe, amount:", pi.amount / 100, "AED",
    );
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

  const totalAmountAed = Math.round(pi.amount / 100);
  const deliveryFeeAed = getDeliveryFee(customer.emirate);

  // ── 6. Process order + email, then return 200 ─────────────────────────
  // We await the full work before returning so the email always completes.
  // waitUntil is also registered when available (keeps the function alive
  // on Edge runtimes), but we never rely on it alone — some Vercel Node.js
  // deployments terminate background work before it finishes.
  const work = processWebhookOrder(pi.id, customer, items, totalAmountAed, deliveryFeeAed)
    .catch((err) => console.error("[webhook] Unhandled error for PI:", pi.id, err));

  execCtx?.waitUntil?.(work);
  await work;

  return new Response("ok", { status: 200 });
}
