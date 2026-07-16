import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";
import { products as fallback, mapShopifyProduct, type Product } from "@/lib/products";
import { fetchProducts } from "@/lib/shopify-fns";

export const Route = createFileRoute("/shop/")({
  loader: async () => {
    try {
      const raw = await fetchProducts();
      const mapped = raw.map(mapShopifyProduct);
      if (mapped.length > 0) return mapped;
      console.error("[shop] Shopify returned 0 products");
    } catch (err) {
      console.error("[shop] Shopify fetch failed:", err);
    }
    // Design-only fallback: price: null → shows "—" instead of a hardcoded number.
    return fallback;
  },
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop · Curated by MMJ — Notebooks" },
      { name: "description", content: "Shop the Curated by MMJ notebook collection." },
    ],
  }),
});

function ProductCard({ product: p }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to="/shop/$handle"
      params={{ handle: p.handle }}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: `color-mix(in oklab, ${p.hex} 14%, var(--blush))`,
          transition: "box-shadow 400ms cubic-bezier(0.16,1,0.3,1), transform 400ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: hovered
            ? "0 32px 64px -16px rgba(11,95,165,0.20)"
            : "0 4px 20px rgba(11,95,165,0.06)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
        }}
      >
        <div className="flex aspect-[3/4] items-center justify-center px-10 pt-16 pb-16">
          <img
            src={p.image}
            alt={`${p.title} notebook`}
            className="h-full w-auto max-w-full object-contain"
            draggable={false}
            style={{
              filter: "drop-shadow(0 24px 32px rgba(11,95,165,0.16))",
              transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)",
              transform: hovered ? "scale(1.05) translateY(-4px)" : "scale(1) translateY(0)",
            }}
          />
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-14 overflow-hidden"
          style={{ background: `color-mix(in oklab, ${p.hex} 22%, var(--white))` }}
        >
          <span
            className="absolute inset-0 flex items-center justify-center text-caption uppercase tracking-caps text-blue"
            style={{
              transform: hovered ? "translateY(0)" : "translateY(100%)",
              transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Shop →
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center text-caption uppercase tracking-caps text-blue/50"
            style={{
              transform: hovered ? "translateY(-100%)" : "translateY(0)",
              transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {p.colorLabel}
          </span>
        </div>
      </div>

      <div className="mt-5 px-1">
        <p className="font-display text-h3 text-blue">{p.title}</p>
        <p className="mt-1 text-caption text-blue/50">
          {p.price !== null ? `AED ${p.price}` : "—"}
        </p>
      </div>
    </Link>
  );
}

function ShopPage() {
  useLenis();
  const displayProducts = Route.useLoaderData();

  return (
    <main className="min-h-screen bg-blush text-blue">
      <Nav />
      <div className="mx-auto max-w-[1600px] px-6 pt-40 pb-24 md:px-10">
        <header className="mb-20">
          <p className="mb-4 text-caption uppercase tracking-caps text-blue/50">Curated by MMJ</p>
          <h1 className="font-display text-h1 text-blue">The Collection</h1>
          <p className="mt-6 max-w-md text-[16px] leading-[1.75] text-blue/65">
            Hardcover notebooks. Cream pages, satin ribbon, and a quiet script
            that reminds you why you started.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayProducts.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
