import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "@/components/layout/Nav";
import { Hero } from "@/components/sections/Hero";

/**
 * TEMPORARY preview route — shows the rebuilt Hero in isolation with the Nav
 * overlaid, exactly as it will sit on the home page. Delete after sign-off.
 */
export const Route = createFileRoute("/hero-preview")({
  component: HeroPreview,
  head: () => ({
    meta: [
      { title: "Hero preview — Curated by MMJ" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const NAV_LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/journal", label: "Journal" },
];

function HeroPreview() {
  return (
    <div className="relative">
      {/* Nav overlays the hero — absolute so the fabric bleeds behind it. */}
      <div className="absolute inset-x-0 top-0 z-(--z-nav)">
        <Nav links={NAV_LINKS} cartCount={2} />
      </div>
      <Hero />
    </div>
  );
}
