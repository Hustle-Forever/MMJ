import { createFileRoute, Link } from "@tanstack/react-router";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";
import { products as fallback, mapShopifyProduct, type Product } from "@/lib/products";
import { fetchProducts } from "@/lib/shopify-fns";

// Back covers imported directly as assets (NOT via three/Notebook — that
// would pull three.js into this route's bundle). Hovering a card flips the
// notebook over.
import backPink from "@/assets/covers/cover_pink_back.webp";
import backBlue from "@/assets/covers/cover_blue_back.webp";
import backGreen from "@/assets/covers/cover_green_back.webp";

const BACK_COVERS: Record<string, string> = {
  "blush-pink": backPink,
  "ocean-blue": backBlue,
  "sage-green": backGreen,
};

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
 * The photo sits on a clean white surface (no tinted panel, no label bar);
 * the caption below is a hairline-ruled editorial entry: № index, display
 * name, script mood line, price. Hover flips the notebook to its back cover
 * (a real asset this page never used) and slides the underline CTA arrow.
 */
function ProductCard({ product: p, index }: { product: Product; index: number }) {
  const back = BACK_COVERS[p.handle] ?? p.shopifyImages[1]?.url;
  return (
    <Link to="/shop/$handle" params={{ handle: p.handle }} className="group block">
      {/* Clean white stage */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white shadow-card transition-shadow duration-500 ease-soft group-hover:shadow-lift">
        {/* № index — quiet editorial marker */}
        <span className="absolute left-5 top-5 z-10 text-[11px] uppercase tracking-[0.3em] text-blue/35">
          № {String(index + 1).padStart(2, "0")}
        </span>

        {/* Front cover — fades out on hover when a back exists (both photos
            have transparent backgrounds, so they must not overlap) */}
        <img
          src={p.image}
          alt={`${p.title} notebook`}
          draggable={false}
          className={`absolute inset-0 m-auto h-[78%] w-auto max-w-[80%] object-contain transition-all duration-700 ease-soft group-hover:scale-[1.02] ${back ? "group-hover:opacity-0" : ""}`}
          style={{ filter: "drop-shadow(0 20px 28px rgba(11,95,165,0.14))" }}
        />
        {/* Back cover — revealed on hover (the flip) */}
        {back && (
          <img
            src={back}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 m-auto h-[78%] w-auto max-w-[80%] object-contain opacity-0 transition-all duration-700 ease-soft group-hover:scale-[1.02] group-hover:opacity-100"
            style={{ filter: "drop-shadow(0 20px 28px rgba(11,95,165,0.14))" }}
          />
        )}
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
            hung salon wall, instead of three identical boxes on a rail */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-20">
          {displayProducts.map((p, i) => (
            <div key={p.handle} className={i % 3 === 1 ? "lg:mt-16" : i % 3 === 2 ? "lg:mt-32" : ""}>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
