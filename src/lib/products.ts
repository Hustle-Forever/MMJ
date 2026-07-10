import coverPink from "@/assets/covers/cover_pink.jpg";
import coverBlue from "@/assets/covers/cover_blue.jpg";
import coverGreen from "@/assets/covers/cover_green.jpg";

export type Product = {
  slug: "blush-pink" | "ocean-blue" | "sage-green";
  name: string;
  colorLabel: string;
  hex: string;
  scriptColor: string;
  image: string;
  description: string;
  mood: string;
  specs: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "blush-pink",
    name: "Blush Pink",
    colorLabel: "Blush Pink",
    hex: "#F4D8DF",
    scriptColor: "#0B5FA5",
    image: coverPink,
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
    slug: "ocean-blue",
    name: "Ocean Blue",
    colorLabel: "Ocean Blue",
    hex: "#0B5FA5",
    scriptColor: "#FFFFFF",
    image: coverBlue,
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
    slug: "sage-green",
    name: "Sage Green",
    colorLabel: "Sage Green",
    hex: "#8FA972",
    scriptColor: "#E7DE4A",
    image: coverGreen,
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
