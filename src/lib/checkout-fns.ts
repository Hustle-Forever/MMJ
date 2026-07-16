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
  title?: string;
};

// Create a Stripe PaymentIntent for the given AED amount.
// Cart items are stored in PI metadata so the webhook can reconstruct the
// Shopify order if the browser closes before finalizeOrder completes.
export const initPaymentIntent = createServerFn()
  .validator(
    (d: unknown) =>
      d as {
        amountAed: number;
        items: CheckoutItemInput[];
      },
  )
  .handler(async ({ data }) => {
    const { createPaymentIntent } = await import("../server/stripe");
    return createPaymentIntent(data.amountAed, data.items);
  });

// Update the PaymentIntent amount to match the final emirate-specific delivery
// fee. Must be called before stripe.confirmPayment so the Stripe charge amount
// equals the expectedAmountAed passed to finalizeOrder.
export const updatePaymentIntent = createServerFn()
  .validator(
    (d: unknown) =>
      d as { paymentIntentId: string; amountAed: number },
  )
  .handler(async ({ data }) => {
    const { updatePaymentIntentAmount } = await import("../server/stripe");
    await updatePaymentIntentAmount(data.paymentIntentId, data.amountAed);
  });

// Attach customer info to an existing PaymentIntent (called just before
// stripe.confirmPayment so the webhook can build the full Shopify order).
// Non-fatal if it fails — direct flow still completes normally.
export const attachCustomer = createServerFn()
  .validator(
    (d: unknown) =>
      d as { paymentIntentId: string; customer: CustomerInfo },
  )
  .handler(async ({ data }) => {
    const { attachCustomerToPaymentIntent } = await import("../server/stripe");
    await attachCustomerToPaymentIntent(data.paymentIntentId, data.customer);
  });

// ── Server-side customer validation ──────────────────────────────────────────
const SERVER_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SERVER_PHONE_RE = /^\+?[\d\s\-(). ]{7,20}$/;
const VALID_EMIRATES = ["Abu Dhabi","Dubai","Sharjah","Ajman","Umm Al Quwain","Ras Al Khaimah","Fujairah"];

function assertCustomer(c: CustomerInfo): void {
  if (!c.firstName?.trim() || c.firstName.length > 100) throw new Error("Invalid first name");
  if (!c.lastName?.trim() || c.lastName.length > 100) throw new Error("Invalid last name");
  if (!SERVER_EMAIL_RE.test(c.email ?? "")) throw new Error("Invalid email address");
  if (!SERVER_PHONE_RE.test((c.phone ?? "").trim())) throw new Error("Invalid phone number");
  if (!c.address?.trim() || c.address.length > 200) throw new Error("Invalid address");
  if (!c.city?.trim() || c.city.length > 100) throw new Error("Invalid city");
  if (!VALID_EMIRATES.includes(c.emirate ?? "")) throw new Error("Invalid emirate");
}

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
    assertCustomer(data.customer);

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
