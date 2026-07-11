import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { useCart } from "@/lib/cart";

const schema = z.object({
  email:     z.string().email("Enter a valid email"),
  firstName: z.string().min(1, "Required"),
  lastName:  z.string().min(1, "Required"),
  address:   z.string().min(1, "Required"),
  city:      z.string().min(1, "Required"),
  emirate:   z.string().min(1, "Select an emirate"),
  delivery:  z.enum(["standard", "express"]),
});

type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout · Curated by MMJ" }] }),
});

const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
];

const inputCls =
  "w-full rounded-2xl border border-blue/12 bg-white/55 px-4 py-3.5 text-[15px] text-blue placeholder:text-blue/25 outline-none transition focus:border-blue/35 focus:bg-white";
const errCls = "mt-1.5 text-[11px] text-red-500";

function CheckoutPage() {
  useLenis();
  const { items, subtotal, clear } = useCart();
  const [placed, setPlaced] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { delivery: "standard" },
  });

  const delivery = watch("delivery");
  const shippingCost = delivery === "express" ? 35 : 0;
  const total = subtotal + shippingCost;

  const onSubmit = () => {
    clear();
    setPlaced(true);
  };

  if (placed) {
    return (
      <main className="min-h-screen bg-blush text-blue">
        <Nav />
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue/8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-h2 text-blue">Order placed.</h1>
          <p className="mt-5 max-w-sm text-[16px] leading-[1.75] text-blue/55">
            Your notebook is on its way. A confirmation will arrive shortly.
          </p>
          <Link
            to="/"
            className="mt-10 inline-block rounded-full bg-blue px-8 py-4 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

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

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-12">
          {/* 01 Contact */}
          <section>
            <h2 className="mb-6 text-caption uppercase tracking-caps text-blue/40">01 · Contact</h2>
            <div>
              <input {...register("email")} type="email" placeholder="Email address" className={inputCls} />
              {errors.email && <p className={errCls}>{errors.email.message}</p>}
            </div>
          </section>

          {/* 02 Delivery address */}
          <section>
            <h2 className="mb-6 text-caption uppercase tracking-caps text-blue/40">02 · Delivery address</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input {...register("firstName")} placeholder="First name" className={inputCls} />
                  {errors.firstName && <p className={errCls}>{errors.firstName.message}</p>}
                </div>
                <div>
                  <input {...register("lastName")} placeholder="Last name" className={inputCls} />
                  {errors.lastName && <p className={errCls}>{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <input {...register("address")} placeholder="Street address" className={inputCls} />
                {errors.address && <p className={errCls}>{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input {...register("city")} placeholder="City" className={inputCls} />
                  {errors.city && <p className={errCls}>{errors.city.message}</p>}
                </div>
                <div>
                  <select {...register("emirate")} className={inputCls}>
                    <option value="">Emirate</option>
                    {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {errors.emirate && <p className={errCls}>{errors.emirate.message}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* 03 Delivery method */}
          <section>
            <h2 className="mb-6 text-caption uppercase tracking-caps text-blue/40">03 · Delivery method</h2>
            <div className="space-y-3">
              {[
                { value: "standard", label: "Standard delivery", sub: "3–5 business days", cost: "Free" },
                { value: "express", label: "Express delivery",  sub: "1–2 business days", cost: "AED 35" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all"
                  style={{
                    borderColor: delivery === opt.value ? "var(--blue)" : "rgba(11,95,165,0.10)",
                    background: delivery === opt.value ? "rgba(11,95,165,0.04)" : "rgba(255,255,255,0.55)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <input type="radio" value={opt.value} {...register("delivery")} className="accent-blue" />
                    <div>
                      <p className="text-caption text-blue">{opt.label}</p>
                      <p className="text-[11px] text-blue/45">{opt.sub}</p>
                    </div>
                  </div>
                  <span className="text-caption text-blue">{opt.cost}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 04 Order review */}
          <section>
            <h2 className="mb-6 text-caption uppercase tracking-caps text-blue/40">04 · Order review</h2>
            <div className="rounded-3xl bg-white/55 p-6 ring-1 ring-blue/8">
              {items.length === 0 ? (
                <p className="text-center text-caption text-blue/35">No items</p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => {
                    const v = item.product.variants.find((vv) => vv.id === item.variantId);
                    return (
                      <li key={`${item.product.handle}-${item.variantId}`} className="flex items-center gap-4">
                        <img src={item.product.image} alt={item.product.title} className="h-12 w-9 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-caption text-blue">{item.product.title} × {item.quantity}</p>
                          <p className="text-[11px] text-blue/40">{v?.title ?? item.product.colorLabel}</p>
                        </div>
                        <p className="text-caption text-blue">
                          AED {(v?.price ?? item.product.price) * item.quantity}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-6 space-y-2 border-t border-blue/10 pt-4">
                <div className="flex justify-between text-caption text-blue/50">
                  <span>Subtotal</span><span>AED {subtotal}</span>
                </div>
                <div className="flex justify-between text-caption text-blue/50">
                  <span>Delivery</span>
                  <span>{shippingCost === 0 ? "Free" : `AED ${shippingCost}`}</span>
                </div>
                <div className="flex justify-between pt-2 text-[15px] font-medium text-blue border-t border-blue/10">
                  <span>Total</span><span>AED {total}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 05 Payment placeholder */}
          <section>
            <h2 className="mb-6 text-caption uppercase tracking-caps text-blue/40">05 · Payment</h2>
            <div className="rounded-3xl border border-dashed border-blue/18 bg-white/35 px-8 py-10 text-center">
              <p className="text-caption text-blue/45">Payment via Shopify — coming soon</p>
              <p className="mt-2 text-[11px] text-blue/25">Secure checkout will be enabled at launch</p>
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-full bg-blue py-5 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90"
          >
            Place order
          </button>
        </form>
      </div>
    </main>
  );
}
