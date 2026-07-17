import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { useLenis } from "@/hooks/use-lenis";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "Account · Curated by MMJ" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AccountPage() {
  useLenis();
  return (
    <main className="min-h-screen bg-blush text-blue">
      <Nav />
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-caption uppercase tracking-caps text-blue/35">Account · Coming soon</p>
        <h1 className="font-display text-h1 text-blue">Your account.</h1>
        <p className="mt-6 max-w-sm text-[16px] leading-[1.75] text-blue/55">
          Order history and account management coming soon.
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
