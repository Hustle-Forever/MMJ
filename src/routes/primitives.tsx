import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Nav } from "@/components/layout/Nav";

/**
 * TEMPORARY preview route — visual audit of the core primitives.
 * Uses only the primitives + token utilities; touches no app pages.
 * Delete this file once the primitives are approved.
 */

export const Route = createFileRoute("/primitives")({
  component: Primitives,
  head: () => ({
    meta: [
      { title: "Primitives — Curated by MMJ" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const NAV_LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About" },
];

function Caption({ children }: { children: string }) {
  return (
    <p className="text-caption mb-3 uppercase tracking-caps text-muted-foreground">
      {children}
    </p>
  );
}

function Primitives() {
  return (
    <div className="bg-blush text-ink">
      {/* 4 + 5 — Nav (sticky, softens on scroll) + FullscreenMenu (via Menu button) */}
      <Nav links={NAV_LINKS} cartCount={2} />

      <Section rhythm="compact">
        <Container>
          <Caption>Primitives preview (temporary route) — scroll to see the nav soften; the Menu button opens the FullscreenMenu</Caption>
          <h1 className="font-display text-h1">Core primitives</h1>
          <p className="text-lead mt-4 max-w-2xl">
            Button, Section, Container, Nav and FullscreenMenu — token-fed,
            typed, mobile-first. Nothing on this page uses a raw color, size
            or easing.
          </p>
        </Container>
      </Section>

      {/* 1 — Button */}
      <Section bg="white">
        <Container>
          <Caption>Button — primary + quiet, size pill (min 44px tap target), hover lift on ease-soft</Caption>
          <div className="flex flex-wrap items-center gap-6">
            <Button variant="primary" size="pill">
              Shop now
            </Button>
            <Button variant="quiet" size="pill">
              Learn more
            </Button>
            <Button variant="primary" size="pill">
              <ShoppingBag aria-hidden /> Add to cart
            </Button>
            <Button variant="primary" size="pill" disabled>
              Sold out
            </Button>
            <Button variant="quiet" size="pill" disabled>
              Unavailable
            </Button>
          </div>
        </Container>
      </Section>

      {/* 3 — Container */}
      <Section>
        <Container>
          <Caption>Container — three widths, responsive side padding (24px → 40px)</Caption>
        </Container>
        <div className="flex flex-col gap-4">
          {(["narrow", "default", "wide"] as const).map((width) => (
            <Container key={width} width={width}>
              <div className="rounded-lg border border-dashed border-ring/40 bg-white px-6 py-4">
                <p className="text-caption font-mono">
                  width="{width}"
                  {width === "narrow" && " · max-w-3xl — prose, checkout"}
                  {width === "default" && " · max-w-7xl — standard sections"}
                  {width === "wide" && " · max-w-wide (1600px) — hero, editorial"}
                </p>
              </div>
            </Container>
          ))}
        </div>
      </Section>

      {/* 2 — Section */}
      <Section bg="blush-2" className="border-y border-dashed border-ring/40">
        <Container>
          <Caption>Section — rhythm="default" (py-section: clamp 96px → 192px)</Caption>
          <p className="font-display text-h2">This band breathes the full section rhythm.</p>
        </Container>
      </Section>
      <Section bg="white" rhythm="compact" className="border-b border-dashed border-ring/40">
        <Container>
          <Caption>Section — rhythm="compact" (py-section-sm: clamp 64px → 96px)</Caption>
          <p className="font-display text-h3">Tighter band for secondary moments.</p>
        </Container>
      </Section>

      <Section as="footer" bg="footer-pink" rhythm="compact">
        <Container>
          <Caption>Section as="footer" bg="footer-pink" — large text only on this hue</Caption>
          <p className="font-display text-h2">Curated by MMJ</p>
          <p className="text-caption mt-8 uppercase tracking-caps">
            Delete src/routes/primitives.tsx after sign-off.
          </p>
        </Container>
      </Section>
    </div>
  );
}
