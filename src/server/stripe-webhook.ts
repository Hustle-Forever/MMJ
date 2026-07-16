// Server-only — never imported by client bundles.
// Invoked from src/server.ts BEFORE TanStack Start routing so the request
// body stream is still unconsumed (required by stripe.webhooks.constructEvent).

import type Stripe from "stripe";
import { constructWebhookEvent } from "./stripe";
import { findOrderForPaymentIntent, adminCreateOrder, type AdminCustomer } from "./shopify-admin";
import type { ItemMeta } from "./stripe";
import { getDeliveryFee } from "../lib/delivery";
import { sendOrderConfirmation } from "./email";

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

  // ── 5. Parse items and customer metadata ──────────────────────────────
  // Parsing happens before the idempotency check so we always have the data
  // needed to send a confirmation email even when the order already exists
  // (e.g., finalizeOrder completed before the webhook fired).
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

  // ── 6. Idempotency + order creation ────────────────────────────────────
  let orderNumber: number;
  try {
    const existing = await findOrderForPaymentIntent(pi.id);
    if (existing) {
      console.log(
        `[webhook] Order #${existing.orderNumber} already exists for PI: ${pi.id}`,
      );
      orderNumber = existing.orderNumber;
    } else {
      const created = await adminCreateOrder({
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
        `[webhook] Shopify order #${created.orderNumber} (id=${created.id}) created for PI: ${pi.id}`,
      );
      orderNumber = created.orderNumber;
    }
  } catch (err) {
    console.error("[webhook] Order lookup/creation failed for PI:", pi.id, err);
    return new Response("Internal Server Error", { status: 500 });
  }

  // ── 7. Send confirmation email (non-fatal) ─────────────────────────────
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
      totalAed: totalAmountAed,
    });
    console.log(
      `[webhook] Confirmation email sent to ${customer.email} for order #${orderNumber}`,
    );
  } catch (err) {
    // Email failure must not fail the webhook response — order is already confirmed.
    console.error(`[webhook] Email send failed for order #${orderNumber}:`, err);
  }

  return new Response("ok", { status: 200 });
}
