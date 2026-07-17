import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { useLenis } from "@/hooks/use-lenis";

export const Route = createFileRoute("/journal")({
  component: JournalPage,
  head: () => ({
    meta: [
      { title: "Journal · Curated by MMJ" },
      {
        name: "description",
        content:
          "Essays, rituals, and reasons to write by hand. Stories from the MMJ notebook world — coming soon.",
      },
      { property: "og:title", content: "Journal · Curated by MMJ" },
      {
        property: "og:description",
        content: "Essays, rituals, and reasons to write by hand.",
      },
      { property: "og:url", content: "https://curatedbymmj.ae/journal" },
      { property: "og:image", content: "https://curatedbymmj.ae/logo/logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://curatedbymmj.ae/journal" }],
  }),
});

function JournalPage() {
  useLenis();
  return (
    <main className="min-h-screen bg-blush text-blue">
      <Nav />
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-caption uppercase tracking-caps text-blue/35">Journal · Coming soon</p>
        <h1 className="font-display text-h1 text-blue">Stories from the page.</h1>
        <p className="mt-6 max-w-sm text-[16px] leading-[1.75] text-blue/55">
          Essays, rituals, and reasons to write by hand.
        </p>
        <Link
          to="/"
          className="mt-10 text-caption uppercase tracking-caps text-blue/40 underline-offset-4 hover:underline"
        >
          ← Back home
        </Link>
      </div>
    </main>
  );
}
