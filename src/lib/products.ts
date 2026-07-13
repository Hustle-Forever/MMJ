import coverPink from "@/assets/covers/cover_pink_front.webp";
import coverBlue from "@/assets/covers/cover_blue_front.webp";
import coverGreen from "@/assets/covers/cover_green_front.webp";

// Shopify-ready variant shape — swap id/price from Shopify Storefront API later.
export type ProductVariant = {
  id: string;        // Shopify ProductVariant GID placeholder
  title: string;
  option: string;    // maps to NotebookColor
  price: number;     // AED
  available: boolean;
};

export type Product = {
  id: string;           // Shopify Product GID placeholder
  handle: string;       // URL slug / Shopify handle
  slug: "blush-pink" | "ocean-blue" | "sage-green"; // legacy alias for Showcase
  name: string;         // short display name (used in Showcase)
  title: string;        // full product title
  colorLabel: string;
  hex: string;
  scriptColor: string;
  image: string;
  description: string;
  mood: string;
  price: number;        // default variant price in AED
  compareAtPrice?: number;
  variants: ProductVariant[];
  specs: { label: string; value: string }[];
};

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
