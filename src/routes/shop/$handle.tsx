import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";
import { products as fallback, mapShopifyProduct, type Product } from "@/lib/products";
import { fetchProduct } from "@/lib/shopify-fns";
import { useCart } from "@/lib/cart";
import { hasWebGL } from "@/lib/detect-3d";
import type { NotebookColor } from "@/components/three/Notebook";

const Scene = lazy(() => import("@/components/three/Scene"));

export const Route = createFileRoute("/shop/$handle")({
  loader: async ({ params }) => {
    try {
      const raw = await fetchProduct({ data: params.handle });
      if (raw) {
        const mapped = mapShopifyProduct(raw);
        if (mapped) return mapped;
      }
    } catch { /* fall through */ }
    return fallback.find((p) => p.handle === params.handle) ?? null;
  },
  component: ProductPage,
  head: ({ loaderData }) => {
    const p = loaderData as Product | null;
    return {
      meta: [
        { title: `${p?.title ?? "Product"} · Curated by MMJ — Notebooks` },
        { name: "description", content: p?.description },
      ],
    };
  },
});

const COLOR_MAP: Record<string, NotebookColor> = {
  "blush-pink": "pink",
  "ocean-blue": "blue",
  "sage-green": "green",
};

function ProductPage() {
  useLenis();
  const product = Route.useLoaderData() as Product | null;
  const { handle } = Route.useParams();
  const { addItem } = useCart();

  // All products for color swatch row — use loader data from shop or static fallback.
  const allProducts = fallback;

  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const [ready3D, setReady3D] = useState(false);

  useEffect(() => {
    if (product) setVariantId(product.variants[0]?.id ?? "");
  }, [product]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    if (desktop.matches) setUse3D(hasWebGL());
  }, []);

  if (!product) {
    return (
      <main className="min-h-screen bg-blush text-blue">
        <Nav />
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-6">
          <p className="font-display text-h2 text-blue">Product not found</p>
          <Link
            to="/shop"
            className="mt-6 text-caption uppercase tracking-caps text-blue/50 underline-offset-4 hover:underline"
          >
            ← Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const notebookColor: NotebookColor = COLOR_MAP[product.handle] ?? "pink";

  const handleAdd = () => {
    addItem(product, variantId || (variant?.id ?? ""), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <main className="min-h-screen bg-blush text-blue">
      <Nav />
      <div className="mx-auto max-w-[1400px] px-6 pt-32 pb-24 md:px-10">
        <Link
          to="/shop"
          className="mb-12 inline-flex items-center gap-2 text-caption uppercase tracking-caps text-blue/40 transition hover:text-blue"
        >
          ← The Collection
        </Link>

        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 lg:gap-20">
          {/* Viewer */}
          <div>
            <div
              className="relative mx-auto max-w-[480px] overflow-hidden rounded-3xl"
              style={{
                background: `color-mix(in oklab, ${product.hex} 12%, var(--blush))`,
                height: "clamp(360px, 55vw, 600px)",
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain p-12 transition-opacity duration-500"
                style={{
                  opacity: ready3D ? 0 : 1,
                  filter: "drop-shadow(0 32px 40px rgba(11,95,165,0.14))",
                }}
              />

              {use3D && (
                <Suspense fallback={null}>
                  <div className="absolute inset-0 p-10">
                    <Scene color={notebookColor} onReady={() => setReady3D(true)} />
                  </div>
                </Suspense>
              )}
            </div>

            {/* Color swatch row */}
            <div className="mt-8 flex items-center justify-center gap-4">
              {allProducts.map((p) => (
                <Link
                  key={p.handle}
                  to="/shop/$handle"
                  params={{ handle: p.handle }}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: p.hex,
                    boxShadow:
                      p.handle === handle
                        ? `0 0 0 2px var(--white), 0 0 0 4px var(--blue)`
                        : "0 0 0 1px rgba(11,95,165,0.2)",
                  }}
                  aria-label={`View ${p.colorLabel}`}
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="mb-3 text-caption uppercase tracking-caps text-blue/40">Curated by MMJ</p>
            <h1 className="font-display text-h1 text-blue">{product.title}</h1>
            <p className="mt-3 font-display text-h3 text-blue">AED {variant?.price ?? product.price}</p>

            <p className="mt-6 text-[16px] leading-[1.75] text-blue/65">{product.description}</p>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-blue/10 pt-8">
              {product.specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-blue/35">{s.label}</dt>
                  <dd className="mt-1 text-caption text-blue">{s.value}</dd>
                </div>
              ))}
            </dl>

            {/* Quantity */}
            <div className="mt-8 flex items-center gap-4">
              <p className="text-caption uppercase tracking-caps text-blue/40">Qty</p>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-1 py-1 ring-1 ring-blue/10">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-blue/50 transition hover:text-blue"
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <span className="min-w-8 text-center text-caption text-blue">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-blue/50 transition hover:text-blue"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              disabled={variant && !variant.available}
              className="mt-6 w-full rounded-full py-4 text-caption uppercase tracking-caps text-white transition-all duration-(--duration-base) disabled:opacity-40"
              style={{ background: added ? "color-mix(in oklab, var(--blue) 65%, var(--white))" : "var(--blue)" }}
            >
              {variant && !variant.available
                ? "Sold out"
                : added
                  ? "Added ✓"
                  : "Add to Cart"}
            </button>

            <p className="mt-4 text-center text-[11px] text-blue/30">
              Free shipping · Handcrafted in the UAE
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
