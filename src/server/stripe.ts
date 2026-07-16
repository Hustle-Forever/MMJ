// Server-only — never imported by client bundles.
import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Missing STRIPE_SECRET_KEY env var");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// Compact shape stored in PI metadata (values must stay < 500 chars each).
export type ItemMeta = { v: string; q: number; p: number };

export async function createPaymentIntent(
  amountAed: number,
  items: Array<{ variantId: string; quantity: number; price: number }>,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(amountAed * 100), // AED → fils
    currency: "aed",
    automatic_payment_methods: { enabled: true },
    // source + items stored now; customer attached just before confirmation
    // so the webhook can reconstruct the order if the browser dies.
    metadata: {
      source: "mmj-checkout",
      items: JSON.stringify(
        items.map((i) => ({ v: i.variantId, q: i.quantity, p: i.price })),
      ),
    },
  });
  return { clientSecret: pi.client_secret!, paymentIntentId: pi.id };
}

// Called by checkout just before stripe.confirmPayment so that webhook
// recovery has the customer info even if the browser tab closes mid-redirect.
// Stripe MERGES metadata — existing "source" and "items" keys are preserved.
export async function attachCustomerToPaymentIntent(
  paymentIntentId: string,
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    emirate: string;
  },
): Promise<void> {
  const stripe = getStripe();
  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: {
      customer_f: customer.firstName,
      customer_l: customer.lastName,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_addr: customer.address,
      customer_city: customer.city,
      customer_emirate: customer.emirate,
    },
  });
}

export async function updatePaymentIntentAmount(piId: string, amountAed: number): Promise<void> {
  await getStripe().paymentIntents.update(piId, {
    amount: Math.round(amountAed * 100),
  });
}

export async function verifyPaymentIntent(id: string): Promise<{
  status: string;
  amount: number;
}> {
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.retrieve(id);
  return { status: pi.status, amount: pi.amount };
}

// Synchronous in Node.js (nodejs24.x runtime on Vercel).
// Throws if the signature is invalid — caller must catch and return 400.
export function constructWebhookEvent(
  rawBody: string,
  sig: string,
  webhookSecret: string,
): Stripe.Event {
  return getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
}
