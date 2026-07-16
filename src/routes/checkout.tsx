import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { useCart, type CartItem } from "@/lib/cart";
import {
  initPaymentIntent,
  finalizeOrder,
  attachCustomer,
  updatePaymentIntent,
  type CustomerInfo,
  type CheckoutItemInput,
} from "@/lib/checkout-fns";
import { getDeliveryFee, FLAT_DELIVERY_FEE, DELIVERY_ESTIMATE } from "@/lib/delivery";

// Publishable key is intentionally client-visible — Stripe designed it that way.
// VITE_ prefix makes it available in the client bundle via import.meta.env.
const stripePromise =
  typeof window !== "undefined"
    ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "")
    : Promise.resolve(null);

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({
    payment_intent:
      typeof s.payment_intent === "string" ? s.payment_intent : undefined,
    redirect_status:
      typeof s.redirect_status === "string" ? s.redirect_status : undefined,
  }),
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout · Curated by MMJ — Notebooks" }] }),
});

// ── Types ─────────────────────────────────────────────────────────────────────
type FormData = CustomerInfo;

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  emirate: "",
};

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

// ── Validation ────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s\-(). ]{7,20}$/;

const FIELD_MAX: Record<keyof FormData, number> = {
  firstName: 100, lastName: 100, email: 254,
  phone: 20, address: 200, city: 100, emirate: 50,
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

function validateForm(form: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const req = (v: string) => !v.trim();

  if (req(form.firstName)) errors.firstName = "Required";
  else if (form.firstName.length > FIELD_MAX.firstName) errors.firstName = "Too long (max 100 chars)";

  if (req(form.lastName)) errors.lastName = "Required";
  else if (form.lastName.length > FIELD_MAX.lastName) errors.lastName = "Too long (max 100 chars)";

  if (req(form.email)) errors.email = "Required";
  else if (!EMAIL_RE.test(form.email)) errors.email = "Enter a valid email address";
  else if (form.email.length > FIELD_MAX.email) errors.email = "Too long";

  if (req(form.phone)) errors.phone = "Required";
  else if (!PHONE_RE.test(form.phone.trim())) errors.phone = "Enter a valid phone number (e.g. +971 50 000 0000)";

  if (req(form.address)) errors.address = "Required";
  else if (form.address.length > FIELD_MAX.address) errors.address = "Too long (max 200 chars)";

  if (req(form.city)) errors.city = "Required";
  else if (form.city.length > FIELD_MAX.city) errors.city = "Too long (max 100 chars)";

  if (!form.emirate) errors.emirate = "Please select an emirate";

  return errors;
}

// ── Session helpers — preserve form data across Stripe 3DS redirects ──────────
const SK_FORM = "mmj_cf";
const SK_ITEMS = "mmj_ci";

function saveCheckoutSession(form: FormData, items: CheckoutItemInput[]) {
  try {
    sessionStorage.setItem(SK_FORM, JSON.stringify(form));
    sessionStorage.setItem(SK_ITEMS, JSON.stringify(items));
  } catch { /* ignore */ }
}

function loadCheckoutSession(): {
  form: FormData | null;
  items: CheckoutItemInput[] | null;
} {
  try {
    return {
      form: JSON.parse(
        sessionStorage.getItem(SK_FORM) ?? "null",
      ) as FormData | null,
      items: JSON.parse(
        sessionStorage.getItem(SK_ITEMS) ?? "null",
      ) as CheckoutItemInput[] | null,
    };
  } catch {
    return { form: null, items: null };
  }
}

function clearCheckoutSession() {
  try {
    sessionStorage.removeItem(SK_FORM);
    sessionStorage.removeItem(SK_ITEMS);
  } catch { /* ignore */ }
}

// ── Stripe appearance — matches site palette ──────────────────────────────────
const STRIPE_APPEARANCE = {
  theme: "flat" as const,
  variables: {
    colorPrimary: "#0B5FA5",
    colorBackground: "rgba(255,255,255,0.6)",
    colorText: "#0B5FA5",
    colorTextSecondary: "rgba(11,95,165,0.5)",
    colorDanger: "#c0392b",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "12px",
    fontSizeBase: "16px",
    spacingUnit: "4px",
  },
};

// ── Main page ─────────────────────────────────────────────────────────────────
function CheckoutPage() {
  useLenis();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { payment_intent, redirect_status } = Route.useSearch();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [initiating, setInitiating] = useState(false);
  const [completingReturn, setCompletingReturn] = useState(false);

  // Effect A: handle Stripe 3DS redirect return (payment_intent in URL)
  useEffect(() => {
    if (!payment_intent) return;

    setCompletingReturn(true);

    if (redirect_status !== "succeeded") {
      setPageError("Payment was not completed. Please try again.");
      setCompletingReturn(false);
      return;
    }

    const { form, items: savedItems } = loadCheckoutSession();
    if (!form || !savedItems) {
      setPageError("Session expired. Please start checkout again.");
      setCompletingReturn(false);
      return;
    }

    const itemsTotal = savedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = itemsTotal + getDeliveryFee(form.emirate);

    void finalizeOrder({
      data: {
        paymentIntentId: payment_intent,
        expectedAmountAed: total,
        items: savedItems,
        customer: form,
      },
    })
      .then(({ orderNumber }) => {
        clearCheckoutSession();
        clear();
        void navigate({ to: "/order-confirmed", search: { orderNumber } });
      })
      .catch((err: unknown) => {
        console.error("[checkout] 3DS order creation failed:", err);
        setPageError(
          `Payment received but order creation failed. Contact support with ref: ${payment_intent}`,
        );
        setCompletingReturn(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect B: create PaymentIntent on mount (normal checkout flow)
  useEffect(() => {
    if (payment_intent) return; // 3DS return handled in Effect A
    if (items.length === 0 || subtotal === 0) return;

    // Snapshot cart items NOW — stored in PI metadata for webhook recovery.
    const piItems: CheckoutItemInput[] = items.map((item) => {
      const v = item.product.variants.find((vv) => vv.id === item.variantId);
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        price: v?.price ?? item.product.price ?? 0,
      };
    });

    setInitiating(true);
    void initPaymentIntent({ data: { amountAed: subtotal + FLAT_DELIVERY_FEE, items: piItems } })
      .then(({ clientSecret, paymentIntentId }) => {
        setClientSecret(clientSecret);
        setPaymentIntentId(paymentIntentId);
      })
      .catch((err: unknown) => {
        console.error("[checkout] PaymentIntent creation failed:", err);
        setPageError(
          "Could not initialise payment. Please refresh and try again.",
        );
      })
      .finally(() => setInitiating(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Empty cart
  if (items.length === 0 && !payment_intent) {
    return (
      <main className="min-h-screen bg-blush text-blue">
        <Nav />
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <p className="font-display text-h2 text-blue">Your cart is empty.</p>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-blue px-8 py-4 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90"
          >
            Shop the collection
          </Link>
        </div>
      </main>
    );
  }

  // 3DS return: completing order in background
  if (completingReturn) {
    return (
      <main className="min-h-screen bg-blush text-blue">
        <Nav />
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue/25 border-t-blue" />
          <p className="text-caption uppercase tracking-caps text-blue/50">
            Confirming your order…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blush text-blue">
      <Nav />
      <div className="mx-auto max-w-xl px-6 pb-28 pt-32 md:px-10">
        <Link
          to="/shop"
          className="mb-10 inline-flex items-center gap-2 text-caption uppercase tracking-caps text-blue/40 transition hover:text-blue"
        >
          ← Back to shop
        </Link>
        <h1 className="mb-14 font-display text-h1 text-blue">Checkout</h1>

        {/* Order summary */}
        <section className="mb-10">
          <h2 className="mb-5 text-caption uppercase tracking-caps text-blue/40">
            Your order
          </h2>
          <div className="rounded-3xl bg-white/55 p-6 ring-1 ring-blue/8">
            <ul className="space-y-4">
              {items.map((item) => {
                const v = item.product.variants.find(
                  (vv) => vv.id === item.variantId,
                );
                const unitPrice = v?.price ?? item.product.price;
                return (
                  <li
                    key={`${item.product.handle}-${item.variantId}`}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="h-12 w-9 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-caption text-blue">
                        {item.product.title} × {item.quantity}
                      </p>
                      <p className="text-[11px] text-blue/40">
                        {v?.title ?? item.product.colorLabel}
                      </p>
                    </div>
                    <p className="text-caption text-blue">
                      {unitPrice !== null
                        ? `AED ${unitPrice * item.quantity}`
                        : "—"}
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 space-y-2 border-t border-blue/10 pt-4">
              <div className="flex justify-between">
                <span className="text-caption text-blue/50">Subtotal</span>
                <span className="text-caption text-blue">
                  {subtotal > 0 ? `AED ${subtotal}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-caption text-blue/50">Delivery</span>
                  <span className="ml-2 text-[11px] text-blue/30">{DELIVERY_ESTIMATE}</span>
                </div>
                <span className="text-caption text-blue">AED {FLAT_DELIVERY_FEE}</span>
              </div>
              <div className="flex justify-between border-t border-blue/10 pt-2">
                <span className="text-caption font-medium text-blue">Total</span>
                <span className="text-caption font-medium text-blue">
                  {subtotal > 0 ? `AED ${subtotal + FLAT_DELIVERY_FEE}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {pageError && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-[13px] text-red-600 ring-1 ring-red-200">
            {pageError}
          </div>
        )}

        {initiating && (
          <div className="mb-6 flex items-center justify-center gap-3 py-4 text-[13px] text-blue/40">
            <div className="h-4 w-4 animate-spin rounded-full border border-blue/20 border-t-blue/70" />
            Initialising secure payment…
          </div>
        )}

        {clientSecret && paymentIntentId && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
          >
            <CheckoutForm
              itemsSubtotal={subtotal}
              items={items}
              paymentIntentId={paymentIntentId}
              clear={clear}
            />
          </Elements>
        )}
      </div>
    </main>
  );
}

// ── Stripe-embedded checkout form ─────────────────────────────────────────────
function CheckoutForm({
  itemsSubtotal,
  items,
  paymentIntentId,
  clear,
}: {
  itemsSubtotal: number;
  items: CartItem[];
  paymentIntentId: string;
  clear: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const deliveryFee = getDeliveryFee(form.emirate);
  const total = itemsSubtotal + deliveryFee;

  const update =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please correct the errors above.");
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    setFormError(null);

    const checkoutItems: CheckoutItemInput[] = items.map((item) => {
      const v = item.product.variants.find((vv) => vv.id === item.variantId);
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        price: v?.price ?? item.product.price ?? 0,
      };
    });

    // Persist BEFORE stripe.confirmPayment — Stripe may redirect for 3DS.
    saveCheckoutSession(form, checkoutItems);

    // Update PI amount to the exact emirate-specific delivery fee so that the
    // Stripe charge matches finalizeOrder.expectedAmountAed exactly.
    try {
      await updatePaymentIntent({ data: { paymentIntentId, amountAed: total } });
    } catch (err) {
      console.error("[checkout] updatePaymentIntent failed:", err);
      setFormError("Could not prepare payment. Please try again.");
      setSubmitting(false);
      return;
    }

    // Attach customer to PI so the webhook can create the Shopify order if
    // the browser closes after Stripe charges but before finalizeOrder runs.
    // Non-fatal: if this fails the direct flow still completes normally.
    try {
      await attachCustomer({ data: { paymentIntentId, customer: form } });
    } catch (err) {
      console.warn("[checkout] attachCustomer failed — webhook recovery will lack customer info:", err);
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout`,
        payment_method_data: {
          billing_details: {
            name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email,
            phone: form.phone,
            address: {
              line1: form.address,
              city: form.city,
              state: form.emirate,
              postal_code: "",   // UAE does not use postal codes
              country: "AE",
            },
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      setFormError(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const { orderNumber } = await finalizeOrder({
          data: {
            paymentIntentId: paymentIntent.id,
            expectedAmountAed: total,
            items: checkoutItems,
            customer: form,
          },
        });
        clearCheckoutSession();
        clear();
        void navigate({ to: "/order-confirmed", search: { orderNumber } });
      } catch (err) {
        console.error("[checkout] Order creation failed:", err);
        setFormError(
          `Payment received but order creation failed. Contact support with ref: ${paymentIntentId}`,
        );
        setSubmitting(false);
      }
      return;
    }

    setFormError("Payment was not completed. Please try again.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate>
      {/* Customer details */}
      <section className="mb-8">
        <h2 className="mb-5 text-caption uppercase tracking-caps text-blue/40">
          Customer details
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First name"
              value={form.firstName}
              onChange={update("firstName")}
              placeholder="Maryam"
              maxLength={FIELD_MAX.firstName}
              error={fieldErrors.firstName}
            />
            <FormField
              label="Last name"
              value={form.lastName}
              onChange={update("lastName")}
              placeholder="Al Jaber"
              maxLength={FIELD_MAX.lastName}
              error={fieldErrors.lastName}
            />
          </div>
          <FormField
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="hello@example.com"
            maxLength={FIELD_MAX.email}
            error={fieldErrors.email}
          />
          <FormField
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="+971 50 000 0000"
            maxLength={FIELD_MAX.phone}
            error={fieldErrors.phone}
          />
        </div>
      </section>

      {/* Delivery address */}
      <section className="mb-8">
        <h2 className="mb-5 text-caption uppercase tracking-caps text-blue/40">
          Delivery address
        </h2>
        <div className="space-y-4">
          <FormField
            label="Street address"
            value={form.address}
            onChange={update("address")}
            placeholder="Villa 12, Street 5, Al Bateen"
            maxLength={FIELD_MAX.address}
            error={fieldErrors.address}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="City"
              value={form.city}
              onChange={update("city")}
              placeholder="Abu Dhabi"
              maxLength={FIELD_MAX.city}
              error={fieldErrors.city}
            />
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-blue/50">
                Emirate
              </label>
              <select
                value={form.emirate}
                onChange={update("emirate")}
                className={`w-full appearance-none rounded-2xl bg-white/55 px-4 py-3 text-[16px] text-blue outline-none ring-1 transition focus:bg-white focus:ring-blue/40 ${fieldErrors.emirate ? "ring-red-400" : "ring-blue/15"}`}
              >
                <option value="" disabled>
                  Select
                </option>
                {UAE_EMIRATES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              {fieldErrors.emirate && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.emirate}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Order total — updates live as emirate is selected */}
      <section className="mb-8">
        <h2 className="mb-5 text-caption uppercase tracking-caps text-blue/40">
          Order total
        </h2>
        <div className="rounded-3xl bg-white/55 p-5 ring-1 ring-blue/8 space-y-2">
          <div className="flex justify-between">
            <span className="text-caption text-blue/50">Items</span>
            <span className="text-caption text-blue">AED {itemsSubtotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-caption text-blue/50">Delivery</span>
              {form.emirate && (
                <span className="ml-2 text-[11px] text-blue/30">{DELIVERY_ESTIMATE}</span>
              )}
            </div>
            <span className="text-caption text-blue">
              {form.emirate ? `AED ${deliveryFee}` : "—"}
            </span>
          </div>
          {form.emirate && (
            <div className="flex justify-between border-t border-blue/10 pt-2">
              <span className="text-caption font-medium text-blue">Total</span>
              <span className="text-caption font-medium text-blue">AED {total}</span>
            </div>
          )}
        </div>
      </section>

      {/* Payment */}
      <section className="mb-8">
        <h2 className="mb-5 text-caption uppercase tracking-caps text-blue/40">
          Payment
        </h2>
        <div className="rounded-3xl bg-white/55 p-6 ring-1 ring-blue/8">
          <PaymentElement
            options={{
              layout: "tabs",
              fields: { billingDetails: "never" },
            }}
          />
        </div>
        <p className="mt-3 text-center text-[11px] text-blue/30">
          Secured by Stripe · Card data never touches our servers
        </p>
      </section>

      {formError && (
        <div className="mb-5 rounded-2xl bg-red-50 px-5 py-4 text-[13px] text-red-600 ring-1 ring-red-200">
          {formError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full rounded-full bg-blue py-5 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Processing…" : `Pay AED ${total} →`}
      </button>
    </form>
  );
}

// ── Reusable text input ───────────────────────────────────────────────────────
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  error,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-blue/50">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-2xl bg-white/55 px-4 py-3 text-[16px] text-blue outline-none ring-1 placeholder:text-blue/25 transition focus:bg-white focus:ring-blue/40 ${error ? "ring-red-400" : "ring-blue/15"}`}
      />
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
