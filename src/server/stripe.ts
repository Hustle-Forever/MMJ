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

export async function createPaymentIntent(amountAed: number): Promise<{
  clientSecret: string;
  paymentIntentId: string;
}> {
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(amountAed * 100), // AED → fils (smallest unit)
    currency: "aed",
    automatic_payment_methods: { enabled: true },
  });
  return { clientSecret: pi.client_secret!, paymentIntentId: pi.id };
}

export async function verifyPaymentIntent(id: string): Promise<{
  status: string;
  amount: number;
}> {
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.retrieve(id);
  return { status: pi.status, amount: pi.amount };
}
