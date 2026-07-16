import coverPink from "@/assets/covers/cover_pink_front.webp";
import coverBlue from "@/assets/covers/cover_blue_front.webp";
import coverGreen from "@/assets/covers/cover_green_front.webp";
import type { ShopifyProduct } from "../server/shopify";

export type ProductVariant = {
  id: string;
  title: string;
  option: string;           // maps to NotebookColor
  price: number | null;     // null only when Shopify is unreachable
  available: boolean;
};

export type ShopifyImage = { url: string; alt: string | null };

export type Product = {
  id: string;
  handle: string;
  slug: string;
  name: string;
  title: string;
  colorLabel: string;
  hex: string;
  scriptColor: string;
  image: string;            // bundled WebP for signature products; Shopify CDN URL for others
  shopifyImages: ShopifyImage[]; // additional CDN images from Shopify
  description: string;
  mood: string;
  price: number | null;     // null only when Shopify is unreachable — never hardcode a number
  compareAtPrice?: number;
  variants: ProductVariant[];
  specs: { label: string; value: string }[];
};

// ── MMJ editorial metadata — local only, never overridden by Shopify ──────────
// These are design/editorial values: colours, specs, mood copy.
// Prices, descriptions, availability, and extra photos all come from Shopify.

const META: Record<
  string,
  Pick<Product, "slug" | "name" | "colorLabel" | "hex" | "scriptColor" | "image" | "mood" | "specs">
> = {
  "blush-pink": {
    slug: "blush-pink",
    name: "Blush Pink",
    colorLabel: "Blush Pink",
    hex: "#F4D8DF",
    scriptColor: "#0B5FA5",
    image: coverPink,
    mood: "Desk, laptop, gold pen — quiet ambition.",
    specs: [
      { label: "Paper", value: "120gsm cream, ink-proof" },
      { label: "Cover", value: "Hardcover linen, striped" },
      { label: "Ribbon", value: "Blush satin bookmark" },
      { label: "Weight", value: "420g · A5" },
    ],
  },
  "ocean-blue": {
    slug: "ocean-blue",
    name: "Ocean Blue",
    colorLabel: "Ocean Blue",
    hex: "#0B5FA5",
    scriptColor: "#FFFFFF",
    image: coverBlue,
    mood: "Soft white linen, morning light.",
    specs: [
      { label: "Paper", value: "120gsm cream, ink-proof" },
      { label: "Cover", value: "Hardcover linen, striped" },
      { label: "Ribbon", value: "Sky-blue satin bookmark" },
      { label: "Weight", value: "420g · A5" },
    ],
  },
  "sage-green": {
    slug: "sage-green",
    name: "Sage Green",
    colorLabel: "Sage Green",
    hex: "#8FA972",
    scriptColor: "#E7DE4A",
    image: coverGreen,
    mood: "Warm marble, sheer curtain light.",
    specs: [
      { label: "Paper", value: "120gsm cream, ink-proof" },
      { label: "Cover", value: "Hardcover linen, striped" },
      { label: "Ribbon", value: "Sage satin bookmark" },
      { label: "Weight", value: "420g · A5" },
    ],
  },
};

const OPTION_BY_HANDLE: Record<string, string> = {
  "blush-pink": "pink",
  "ocean-blue": "blue",
  "sage-green": "green",
};

/**
 * Merge live Shopify product data with local MMJ editorial metadata.
 * Price, description, availability, and images always come from Shopify.
 * Colors, specs, mood, and cover WebP come from local metadata for the 3
 * signature products. Unknown products render entirely from Shopify data.
 */
export function mapShopifyProduct(sp: ShopifyProduct): Product {
  const meta = META[sp.handle];

  const variants: ProductVariant[] = sp.variants.edges.map((e) => ({
    id: e.node.id,
    title: e.node.title,
    option: OPTION_BY_HANDLE[sp.handle] ?? e.node.title.toLowerCase(),
    price: Math.round(parseFloat(e.node.price.amount)),
    available: e.node.availableForSale,
  }));

  const price = variants[0]?.price ?? null;
  const allImages = sp.images.edges.map((e) => ({ url: e.node.url, alt: e.node.altText }));

  if (!meta) {
    // Unknown product — built entirely from Shopify data, no 3D cover.
    // image = first Shopify photo (used as the main display image).
    // shopifyImages = remaining photos shown in the gallery strip.
    const [first, ...rest] = allImages;
    return {
      id: sp.id,
      handle: sp.handle,
      slug: sp.handle,
      name: sp.title,
      title: sp.title,
      colorLabel: variants[0]?.title ?? sp.title,
      hex: "#F5F0EB",
      scriptColor: "#0B5FA5",
      image: first?.url ?? "",
      shopifyImages: rest,
      description: sp.description,
      mood: "",
      price,
      variants,
      specs: [],
    };
  }

  // Signature product — editorial metadata merged with live Shopify data.
  return {
    id: sp.id,
    handle: sp.handle,
    title: sp.title,
    description: sp.description,
    variants,
    price,
    shopifyImages: allImages,
    ...meta,
  };
}

// ── Design-only fallback (used for colour swatches and layout when Shopify is
//    unreachable — never used to display prices or descriptions) ───────────────
// price: null → UI shows "—", never a hardcoded number.

export const products: Product[] = [
  {
    id: "gid://shopify/Product/1",
    handle: "blush-pink",
    slug: "blush-pink",
    name: "Blush Pink",
    title: "Blush Pink Notebook",
    colorLabel: "Blush Pink",
    hex: "#F4D8DF",
    scriptColor: "#0B5FA5",
    image: coverPink,
    shopifyImages: [],
    price: null,
    variants: [
      { id: "gid://shopify/ProductVariant/1", title: "Blush Pink", option: "pink", price: null, available: true },
    ],
    description: "",
    mood: "Desk, laptop, gold pen — quiet ambition.",
    specs: [
      { label: "Paper", value: "120gsm cream, ink-proof" },
      { label: "Cover", value: "Hardcover linen, striped" },
      { label: "Ribbon", value: "Blush satin bookmark" },
      { label: "Weight", value: "420g · A5" },
    ],
  },
  {
    id: "gid://shopify/Product/2",
    handle: "ocean-blue",
    slug: "ocean-blue",
    name: "Ocean Blue",
    title: "Ocean Blue Notebook",
    colorLabel: "Ocean Blue",
    hex: "#0B5FA5",
    scriptColor: "#FFFFFF",
    image: coverBlue,
    shopifyImages: [],
    price: null,
    variants: [
      { id: "gid://shopify/ProductVariant/2", title: "Ocean Blue", option: "blue", price: null, available: true },
    ],
    description: "",
    mood: "Soft white linen, morning light.",
    specs: [
      { label: "Paper", value: "120gsm cream, ink-proof" },
      { label: "Cover", value: "Hardcover linen, striped" },
      { label: "Ribbon", value: "Sky-blue satin bookmark" },
      { label: "Weight", value: "420g · A5" },
    ],
  },
  {
    id: "gid://shopify/Product/3",
    handle: "sage-green",
    slug: "sage-green",
    name: "Sage Green",
    title: "Sage Green Notebook",
    colorLabel: "Sage Green",
    hex: "#8FA972",
    scriptColor: "#E7DE4A",
    image: coverGreen,
    shopifyImages: [],
    price: null,
    variants: [
      { id: "gid://shopify/ProductVariant/3", title: "Sage Green", option: "green", price: null, available: true },
    ],
    description: "",
    mood: "Warm marble, sheer curtain light.",
    specs: [
      { label: "Paper", value: "120gsm cream, ink-proof" },
      { label: "Cover", value: "Hardcover linen, striped" },
      { label: "Ribbon", value: "Sage satin bookmark" },
      { label: "Weight", value: "420g · A5" },
    ],
  },
];
