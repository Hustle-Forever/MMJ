import { createFileRoute, Link } from "@tanstack/react-router";
import { MotionConfig, motion } from "motion/react";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";
import { products as fallback, mapShopifyProduct, type Product } from "@/lib/products";
import { fetchProducts } from "@/lib/shopify-fns";

const ease = [0.16, 1, 0.3, 1] as const;

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
      { title: "Shop The Collection · Curated by MMJ" },
      {
        name: "description",
        content:
          "Shop the Curated by MMJ notebook collection — blush pink, ocean blue and sage green hardcover notebooks with cream pages and satin ribbon. Free shipping in the UAE.",
      },
      { property: "og:title", content: "The Collection · Curated by MMJ" },
      {
        property: "og:description",
        content:
          "Hardcover notebooks made to be returned to. Cream pages, satin ribbon, three colours. Shop the full MMJ collection.",
      },
      { property: "og:url", content: "https://curatedbymmj.ae/shop" },
      { property: "og:image", content: "https://curatedbymmj.ae/logo/logo.png" },
      { name: "twitter:title", content: "The Collection · Curated by MMJ" },
      {
        name: "twitter:description",
        content: "Hardcover notebooks in three colours. Shop Curated by MMJ.",
      },
    ],
    links: [{ rel: "canonical", href: "https://curatedbymmj.ae/shop" }],
  }),
});

/**
 * Editorial product card — matches the Still Life direction.
 * A clean framed image slot (fixed 3:4, object-cover so any future photo
 * fills it with no distortion and no code change), then a hairline-ruled
 * caption: № index, display name, script mood line, price. Hovering lifts the
 * card and gently zooms the image inside its frame.
 */
function ProductCard({ product: p, index }: { product: Product; index: number }) {
  return (
    <Link to="/shop/$handle" params={{ handle: p.handle }} className="group block">
      {/* Framed image slot — fixed aspect, overflow-hidden so the hover zoom
          stays inside the frame. bg + hairline ring read as a mat even before
          a photo loads or if a future photo has transparency. The whole card
          lifts on hover (translate on this wrapper). */}
      <div className="transition-transform duration-500 ease-soft group-hover:-translate-y-1.5 motion-reduce:transform-none">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--blush)_28%,white)] shadow-card ring-1 ring-blue/8 transition-shadow duration-500 ease-soft group-hover:shadow-lift">
          {/* № index — quiet editorial marker */}
          <span className="absolute left-5 top-5 z-10 text-[11px] uppercase tracking-[0.3em] text-blue/35">
            № {String(index + 1).padStart(2, "0")}
          </span>

          {/* The product photo — fills the frame, gently zooms on hover.
              Slow 900ms ease-soft = considered, not bouncy. */}
          <img
            src={p.image}
            alt={`${p.title} notebook`}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.05] motion-reduce:transform-none motion-reduce:transition-none"
          />
        </div>
      </div>

      {/* Editorial caption — hairline rule, like the Showcase spec list */}
      <div className="mt-5 border-t border-blue/15 pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-display text-[1.4rem] leading-tight text-blue">{p.name}</p>
          <p
            className="shrink-0 text-caption text-blue/60"
            style={{ fontVariantNumeric: "tabular-nums lining-nums" }}
          >
            {p.price !== null ? `AED ${p.price}` : "—"}
          </p>
        </div>
        {p.mood && (
          <p className="font-script mt-1 text-[1.1rem] italic leading-snug text-blue/45">{p.mood}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-blue/50 transition-colors duration-300 group-hover:text-blue">
          <span className="border-b border-transparent pb-px transition-colors duration-300 group-hover:border-blue/40">
            Shop
          </span>
          <span aria-hidden className="transition-transform duration-300 ease-soft group-hover:translate-x-1">
            →
          </span>
        </span>
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

        {/* Staggered gallery rhythm — cards step down across the row like a
            hung salon wall, instead of three identical boxes on a rail.
            Each card fades and rises in as it enters, staggered across the row
            (reset per row via i % 3). reducedMotion="user" drops the rise for
            users who ask for less motion — they still get a gentle fade. */}
        <MotionConfig reducedMotion="user">
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-20">
            {displayProducts.map((p, i) => (
              <motion.div
                key={p.handle}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease, delay: (i % 3) * 0.1 }}
                className={i % 3 === 1 ? "lg:mt-16" : i % 3 === 2 ? "lg:mt-32" : ""}
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </div>
        </MotionConfig>
      </div>
      <Footer />
    </main>
  );
}
