// createServerFn wrappers — callable from client; handlers run server-side.
// IMPORTANT: all src/server/* imports use RELATIVE paths (../server/...).
// The @/ alias doesn't exist in the compiled Nitro bundle.
import { createServerFn } from "@tanstack/react-start";

export type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  emirate: string;
};

export type CheckoutItemInput = {
  variantId: string;
  quantity: number;
  price: number;
};

// Create a Stripe PaymentIntent for the given AED amount.
// Returns clientSecret (for Stripe.js) and paymentIntentId (for server verification).
export const initPaymentIntent = createServerFn()
  .validator((d: unknown) => d as { amountAed: number })
  .handler(async ({ data }) => {
    const { createPaymentIntent } = await import("../server/stripe");
    return createPaymentIntent(data.amountAed);
  });

// Verify a completed PaymentIntent with Stripe's servers, then create the
// Shopify order via Admin API. Never trust the client on payment status —
// we re-fetch the PaymentIntent from Stripe to confirm it actually succeeded.
export const finalizeOrder = createServerFn()
  .validator(
    (d: unknown) =>
      d as {
        paymentIntentId: string;
        expectedAmountAed: number;
        items: CheckoutItemInput[];
        customer: CustomerInfo;
      },
  )
  .handler(async ({ data }) => {
    const { verifyPaymentIntent } = await import("../server/stripe");
    const { adminCreateOrder } = await import("../server/shopify-admin");

    // Stripe is the authority — verify status and amount server-side.
    const pi = await verifyPaymentIntent(data.paymentIntentId);

    if (pi.status !== "succeeded") {
      throw new Error(`Payment not confirmed (status: ${pi.status})`);
    }

    // Guard against stolen PaymentIntent IDs (e.g., a real pi_ for AED 1
    // submitted against an AED 185 order).
    const expectedFils = Math.round(data.expectedAmountAed * 100);
    if (pi.amount !== expectedFils) {
      throw new Error(
        `Amount mismatch: charged ${pi.amount} fils, expected ${expectedFils}`,
      );
    }

    return adminCreateOrder({
      lineItems: data.items.map((item) => ({
        variantGid: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      customer: data.customer,
      totalAmount: data.expectedAmountAed,
      paymentIntentId: data.paymentIntentId,
    });
  });
