import { createFileRoute } from "@tanstack/react-router";
import { useLenis } from "@/hooks/use-lenis";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Showcase } from "@/components/sections/Showcase";
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
          "Hand-bound hardcover notebooks in blush pink, ocean blue and sage green. Editorial paper goods, quietly expensive. Curated by MMJ.",
      },
      { property: "og:title", content: "Curated by MMJ — Make it happen" },
      {
        property: "og:description",
        content:
          "A trio of hand-bound hardcover notebooks. Cream paper, satin ribbon, made to be returned to.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Home() {
  useLenis();
  return (
    <main className="relative min-h-screen bg-blush text-blue">
      <Nav />
      <Hero />
      <Showcase />
      <Editorial />
      <Film />
      <Testimonials />
      <Footer />
    </main>
  );
}
