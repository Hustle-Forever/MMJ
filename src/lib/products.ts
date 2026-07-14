import coverPink from "@/assets/covers/cover_pink_front.webp";
import coverBlue from "@/assets/covers/cover_blue_front.webp";
import coverGreen from "@/assets/covers/cover_green_front.webp";
import type { ShopifyProduct } from "@/server/shopify";

export type ProductVariant = {
  id: string;        // Shopify ProductVariant GID
  title: string;
  option: string;    // maps to NotebookColor
  price: number;     // AED
  available: boolean;
};

export type Product = {
  id: string;           // Shopify Product GID
  handle: string;       // URL slug / Shopify handle
  slug: "blush-pink" | "ocean-blue" | "sage-green";
  name: string;
  title: string;
  colorLabel: string;
  hex: string;
  scriptColor: string;
  image: string;
  description: string;
  mood: string;
  price: number;        // AED, from first variant
  compareAtPrice?: number;
  variants: ProductVariant[];
  specs: { label: string; value: string }[];
};

// MMJ editorial metadata not stored in Shopify — indexed by handle.
const META: Record<string, Pick<Product, "slug" | "name" | "colorLabel" | "hex" | "scriptColor" | "image" | "mood" | "specs">> = {
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

// Fallback option label → NotebookColor mapping (used when Shopify variant title
// doesn't match our handle directly).
const OPTION_BY_HANDLE: Record<string, string> = {
  "blush-pink": "pink",
  "ocean-blue": "blue",
  "sage-green": "green",
};

/** Merge live Shopify product data with local MMJ editorial metadata. */
export function mapShopifyProduct(sp: ShopifyProduct): Product | null {
  const meta = META[sp.handle];
  if (!meta) return null; // unknown handle — skip
  const variants: ProductVariant[] = sp.variants.edges.map((e) => ({
    id: e.node.id,
    title: e.node.title,
    option: OPTION_BY_HANDLE[sp.handle] ?? "pink",
    price: Math.round(parseFloat(e.node.price.amount)),
    available: e.node.availableForSale,
  }));
  const price = variants[0]?.price ?? 185;
  return {
    id: sp.id,
    handle: sp.handle,
    title: sp.title,
    description: sp.description || meta.name + " Notebook",
    variants,
    price,
    ...meta,
  };
}

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
    price: 185,
    variants: [
      { id: "gid://shopify/ProductVariant/1", title: "Blush Pink", option: "pink", price: 185, available: true },
    ],
    description:
      "A soft, romantic hardcover in blush pink with a royal-blue script. Made for morning pages, evening reflections, and everything worth writing down.",
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
    price: 185,
    variants: [
      { id: "gid://shopify/ProductVariant/2", title: "Ocean Blue", option: "blue", price: 185, available: true },
    ],
    description:
      "Deep ocean blue with a hand-written white script. Editorial, confident, quietly powerful — a notebook that means business.",
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
    price: 185,
    variants: [
      { id: "gid://shopify/ProductVariant/3", title: "Sage Green", option: "green", price: 185, available: true },
    ],
    description:
      "Sage green with a sun-yellow script. Warm, grounded, and lit like a slow afternoon on marble.",
    mood: "Warm marble, sheer curtain light.",
    specs: [
      { label: "Paper", value: "120gsm cream, ink-proof" },
      { label: "Cover", value: "Hardcover linen, striped" },
      { label: "Ribbon", value: "Sage satin bookmark" },
      { label: "Weight", value: "420g · A5" },
    ],
  },
];
