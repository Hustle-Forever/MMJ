import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { useCart } from "@/lib/cart";
import { cartCreate } from "@/lib/shopify-fns";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout · Curated by MMJ — Notebooks" }] }),
});

function CheckoutPage() {
  useLenis();
  const { items, subtotal, checkoutUrl, cartId, clear } = useCart();
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
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

  const handleCheckout = async () => {
    setError(null);

    // If we already have a checkoutUrl from a previous sync, go directly.
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }

    // No cart synced yet (e.g., Shopify sync failed earlier) — create one now
    // using the first item, then redirect. Subsequent items are already in local
    // state; the Shopify cart will at minimum contain the first variant.
    setPreparing(true);
    try {
      const firstItem = items[0];
      const variantId = firstItem.variantId || firstItem.product.variants[0]?.id;
      if (!variantId) throw new Error("No variant ID");
      const res = await cartCreate({ data: { variantId, quantity: firstItem.quantity } });
      window.location.href = res.checkoutUrl;
    } catch (err) {
      console.error("[checkout]", err);
      setError("Could not reach Shopify checkout. Please try again.");
      setPreparing(false);
    }
  };

  return (
    <main className="min-h-screen bg-blush text-blue">
      <Nav />
      <div className="mx-auto max-w-xl px-6 pt-32 pb-28 md:px-10">
        <Link
          to="/shop"
          className="mb-10 inline-flex items-center gap-2 text-caption uppercase tracking-caps text-blue/40 transition hover:text-blue"
        >
          ← Back to shop
        </Link>
        <h1 className="font-display text-h1 text-blue mb-14">Checkout</h1>

        {/* Order summary */}
        <section>
          <h2 className="mb-6 text-caption uppercase tracking-caps text-blue/40">Your order</h2>
          <div className="rounded-3xl bg-white/55 p-6 ring-1 ring-blue/8">
            <ul className="space-y-4">
              {items.map((item) => {
                const v = item.product.variants.find((vv) => vv.id === item.variantId);
                return (
                  <li key={`${item.product.handle}-${item.variantId}`} className="flex items-center gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="h-12 w-9 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-caption text-blue">{item.product.title} × {item.quantity}</p>
                      <p className="text-[11px] text-blue/40">{v?.title ?? item.product.colorLabel}</p>
                    </div>
                    <p className="text-caption text-blue">
                      {(v?.price ?? item.product.price) !== null
                        ? `AED ${(v?.price ?? item.product.price)! * item.quantity}`
                        : "—"}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 space-y-2 border-t border-blue/10 pt-4">
              <div className="flex justify-between text-caption text-blue/50">
                <span>Subtotal</span>
                <span>{subtotal > 0 ? `AED ${subtotal}` : "—"}</span>
              </div>
              <div className="flex justify-between text-caption text-blue/50">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
          </div>
        </section>

        {/* Shopify checkout CTA */}
        <div className="mt-10 space-y-4">
          {error && (
            <p className="text-center text-[13px] text-red-500">{error}</p>
          )}

          <button
            onClick={() => void handleCheckout()}
            disabled={preparing}
            className="w-full rounded-full bg-blue py-5 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {preparing ? "Preparing…" : "Proceed to Shopify Checkout →"}
          </button>

          <p className="text-center text-[11px] text-blue/30">
            Secure payment · Powered by Shopify
          </p>
        </div>
      </div>
    </main>
  );
}
