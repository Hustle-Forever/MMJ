import { createFileRoute } from "@tanstack/react-router";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Showcase } from "@/components/sections/Showcase";
import { StillLife } from "@/components/sections/StillLife";
import { Editorial } from "@/components/sections/Editorial";
import { Film } from "@/components/sections/Film";
import { Testimonials } from "@/components/sections/Testimonials";
import { Footer } from "@/components/sections/Footer";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Curated by MMJ — Notebooks" },
      {
        name: "description",
        content:
          "Hand-bound hardcover notebooks in blush pink, ocean blue and sage green. Editorial paper goods, quietly expensive. Made in the UAE. Curated by MMJ.",
      },
      { property: "og:title", content: "Curated by MMJ — Make it happen." },
      {
        property: "og:description",
        content:
          "A trio of hand-bound hardcover notebooks. Cream pages, satin ribbon, made to be returned to.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://curatedbymmj.ae/" },
      { property: "og:image", content: "https://curatedbymmj.ae/logo/logo.png" },
      { name: "twitter:title", content: "Curated by MMJ — Make it happen." },
      {
        name: "twitter:description",
        content: "Hand-bound hardcover notebooks. Curated by MMJ.",
      },
    ],
    links: [{ rel: "canonical", href: "https://curatedbymmj.ae/" }],
  }),
});

function Home() {
  useLenis();
  return (
    <main className="relative min-h-screen bg-blush text-blue">
      <Nav />
      <Hero />
      <Showcase />
      <StillLife />
      <Editorial />
      <Film />
      <Testimonials />
      <Footer />
    </main>
  );
}
