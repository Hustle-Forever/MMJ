import { createFileRoute, Link } from "@tanstack/react-router";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";

export const Route = createFileRoute("/order-confirmed")({
  validateSearch: (s: Record<string, unknown>) => ({
    orderNumber:
      typeof s.orderNumber === "number"
        ? s.orderNumber
        : s.orderNumber !== undefined
          ? parseInt(s.orderNumber as string, 10)
          : undefined,
  }),
  component: OrderConfirmedPage,
  head: () => ({
    meta: [{ title: "Order Confirmed · Curated by MMJ — Notebooks" }],
  }),
});

function OrderConfirmedPage() {
  useLenis();
  const { orderNumber } = Route.useSearch();

  return (
    <main className="min-h-screen bg-blush text-blue">
      <Nav />
      <div className="mx-auto max-w-xl px-6 pb-28 pt-40 text-center md:px-10">
        {/* Checkmark */}
        <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/60 ring-1 ring-blue/10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
          >
            <path
              d="M6 16L13 23L26 9"
              stroke="#0B5FA5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="font-display text-h1 text-blue">Order Confirmed</h1>

        {orderNumber !== undefined && !isNaN(orderNumber) && (
          <p className="mt-3 text-caption text-blue/50">
            Order #{orderNumber}
          </p>
        )}

        <p className="mx-auto mt-8 max-w-sm text-[16px] leading-[1.75] text-blue/65">
          Thank you for your purchase. Your notebook is being prepared with care
          and will be on its way to you soon. A confirmation email is heading
          your way.
        </p>

        <div className="mt-14 flex flex-col items-center gap-4">
          <Link
            to="/shop"
            className="rounded-full bg-blue px-10 py-4 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90"
          >
            Continue shopping
          </Link>
          <Link
            to="/"
            className="text-caption uppercase tracking-caps text-blue/40 transition hover:text-blue"
          >
            Back to home
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
