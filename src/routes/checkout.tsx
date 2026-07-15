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
  type CustomerInfo,
  type CheckoutItemInput,
} from "@/lib/checkout-fns";

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
    fontSizeBase: "14px",
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

    const total = savedItems.reduce((s, i) => s + i.price * i.quantity, 0);

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
    void initPaymentIntent({ data: { amountAed: subtotal, items: piItems } })
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
            <div className="mt-5 flex justify-between border-t border-blue/10 pt-4">
              <span className="text-caption text-blue/50">Total</span>
              <span className="text-caption font-medium text-blue">
                {subtotal > 0 ? `AED ${subtotal}` : "—"}
              </span>
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
              subtotal={subtotal}
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
  subtotal,
  items,
  paymentIntentId,
  clear,
}: {
  subtotal: number;
  items: CartItem[];
  paymentIntentId: string;
  clear: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const update =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "emirate",
    ] as const;
    if (required.some((k) => !form[k].trim())) {
      setFormError("Please fill in all required fields.");
      return;
    }

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
            expectedAmountAed: subtotal,
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
            />
            <FormField
              label="Last name"
              value={form.lastName}
              onChange={update("lastName")}
              placeholder="Al Jaber"
            />
          </div>
          <FormField
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="hello@example.com"
          />
          <FormField
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="+971 50 000 0000"
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
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="City"
              value={form.city}
              onChange={update("city")}
              placeholder="Abu Dhabi"
            />
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-blue/50">
                Emirate
              </label>
              <select
                value={form.emirate}
                onChange={update("emirate")}
                className="w-full appearance-none rounded-2xl bg-white/55 px-4 py-3 text-[14px] text-blue outline-none ring-1 ring-blue/15 transition focus:bg-white focus:ring-blue/40"
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
            </div>
          </div>
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
        {submitting ? "Processing…" : `Pay AED ${subtotal} →`}
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
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
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
        className="w-full rounded-2xl bg-white/55 px-4 py-3 text-[14px] text-blue outline-none ring-1 ring-blue/15 placeholder:text-blue/25 transition focus:bg-white focus:ring-blue/40"
      />
    </div>
  );
}
