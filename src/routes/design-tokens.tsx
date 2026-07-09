import { createFileRoute } from "@tanstack/react-router";

/**
 * TEMPORARY preview route — visual audit of src/styles/tokens.css.
 * Renders the token system only; imports no app components.
 * Delete this file once the system is approved.
 */

export const Route = createFileRoute("/design-tokens")({
  component: DesignTokens,
  head: () => ({
    meta: [
      { title: "Design Tokens — Curated by MMJ" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const typeSteps = [
  { cls: "font-display text-display", token: "text-display", size: "clamp(3.5rem → 9rem)", sample: "Make it happen" },
  { cls: "font-display text-h1", token: "text-h1", size: "clamp(2.5rem → 5rem)", sample: "Hand-bound hardcovers" },
  { cls: "font-display text-h2", token: "text-h2", size: "clamp(2rem → 3.5rem)", sample: "Cream paper, satin ribbon" },
  { cls: "font-display text-h3", token: "text-h3", size: "clamp(1.5rem → 2.25rem)", sample: "Made to be returned to" },
  { cls: "font-script", token: "font-script · --type-script", size: "clamp(1.5rem → 2.5rem)", sample: "quietly expensive", style: { fontSize: "var(--type-script)" } },
  { cls: "text-lead", token: "text-lead", size: "clamp(1.125rem → 1.375rem)", sample: "A trio of notebooks in blush, ocean and sage — editorial paper goods for people who write things down." },
  { cls: "text-base", token: "text-base · --type-body", size: "1rem / 16px · lh 1.7", sample: "Body text is always the brand blue, never black. Generous line-height keeps long passages calm and readable, the way a well-set page should feel.", style: { lineHeight: "var(--leading-body)" } },
  { cls: "text-caption uppercase tracking-widest", token: "text-caption", size: "0.8125rem / 13px", sample: "Labels & meta only — never body" },
];

const swatches = [
  { name: "blush", varName: "--blush", hex: "#F8E6EC", note: "background — dominant identity" },
  { name: "blush-2", varName: "--blush-2", hex: "#F4D8DF", note: "accents, stripes, muted" },
  { name: "blue / ink", varName: "--blue", hex: "#0B5FA5", note: "ALL text, buttons, links" },
  { name: "white", varName: "--white", hex: "#FFFFFF", note: "cards, button text" },
  { name: "footer-pink", varName: "--footer-pink", hex: "#EFC9D4", note: "footer shift — large text only" },
];

const tints = [
  { name: "ink-70", varName: "--ink-70", note: "muted foreground" },
  { name: "ink-40", varName: "--ink-40", note: "disabled, placeholders" },
  { name: "ink-12", varName: "--ink-12", note: "borders" },
  { name: "blush-veil", varName: "--blush-veil", note: "glass panels" },
];

const spaces = [
  { name: "space-0-5", px: "4px — half-step, fine detail only" },
  { name: "space-1", px: "8px — base unit" },
  { name: "space-2", px: "16px" },
  { name: "space-3", px: "24px" },
  { name: "space-4", px: "32px" },
  { name: "space-5", px: "40px" },
  { name: "space-6", px: "48px" },
  { name: "space-8", px: "64px" },
  { name: "space-10", px: "80px" },
  { name: "space-12", px: "96px" },
  { name: "space-16", px: "128px" },
  { name: "space-20", px: "160px" },
  { name: "space-24", px: "192px" },
  { name: "space-section-sm", px: "clamp(64px → 96px)" },
  { name: "space-section", px: "clamp(96px → 192px)" },
];

const shadows = [
  { name: "shadow-card", cls: "shadow-card" },
  { name: "shadow-soft", cls: "shadow-soft" },
  { name: "shadow-lift", cls: "shadow-lift" },
  { name: "shadow-contact", cls: "shadow-contact" },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="font-display text-h3 mt-24 mb-8 border-b border-border pb-4">
      {children}
    </h2>
  );
}

function DesignTokens() {
  return (
    <main className="bg-blush min-h-screen px-6 py-16 text-ink md:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-caption uppercase tracking-widest">
          Curated by MMJ — token preview (temporary route)
        </p>
        <h1 className="font-display text-h1 mt-2">Design system audit</h1>
        <p className="text-lead mt-4 max-w-2xl">
          Everything on this page is rendered from{" "}
          <code className="rounded-sm bg-blush-2 px-1.5 py-0.5 text-[0.9em]">
            src/styles/tokens.css
          </code>{" "}
          via Tailwind utilities. No component styles.
        </p>

        {/* ============ TYPE SCALE ============ */}
        <SectionTitle>Type scale</SectionTitle>
        <div className="flex flex-col gap-12">
          {typeSteps.map((t) => (
            <div key={t.token}>
              <p className="text-caption mb-2 uppercase tracking-widest opacity-70">
                {t.token} · {t.size}
              </p>
              <p className={t.cls} style={t.style}>
                {t.sample}
              </p>
            </div>
          ))}
        </div>

        {/* ============ PALETTE ============ */}
        <SectionTitle>Palette — locked, no hues outside this set</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {swatches.map((s) => (
            <div key={s.name} className="rounded-lg bg-card shadow-card overflow-hidden">
              <div
                className="h-28 border-b border-border"
                style={{ backgroundColor: `var(${s.varName})` }}
              />
              <div className="p-4">
                <p className="font-medium">{s.name}</p>
                <p className="text-caption font-mono mt-1">{s.hex}</p>
                <p className="text-caption mt-1 opacity-70">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-caption mt-8 mb-3 uppercase tracking-widest opacity-70">
          Derived tints — color-mix of locked hues only
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tints.map((s) => (
            <div key={s.name} className="rounded-lg bg-card shadow-card overflow-hidden">
              <div
                className="h-16 border-b border-border"
                style={{ backgroundColor: `var(${s.varName})` }}
              />
              <div className="p-3">
                <p className="text-caption font-medium">{s.name}</p>
                <p className="text-caption opacity-70">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-blush p-5 border border-border">
            <p className="font-medium">Ink on blush</p>
            <p className="text-caption mt-1">5.5 : 1 — AA body text</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-card">
            <p className="font-medium">Ink on white</p>
            <p className="text-caption mt-1">7.0 : 1 — AAA</p>
          </div>
          <div className="rounded-lg bg-footer-pink p-5">
            <p className="text-lg font-medium">Ink on footer-pink</p>
            <p className="text-caption mt-1">4.4 : 1 — large text (≥18px) only</p>
          </div>
        </div>

        {/* ============ SPACING ============ */}
        <SectionTitle>Spacing — locked 8px scale</SectionTitle>
        <div className="rounded-lg bg-card p-6 shadow-card">
          <div className="flex flex-col gap-3">
            {spaces.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <p className="text-caption w-36 shrink-0 font-mono">{s.name}</p>
                <div
                  className="h-4 shrink-0 rounded-sm bg-blue"
                  style={{ width: `var(--${s.name})` }}
                />
                <p className="text-caption shrink-0 opacity-70">{s.px}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============ ELEVATION + MOTION ============ */}
        <SectionTitle>Elevation & motion</SectionTitle>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {shadows.map((s) => (
            <div
              key={s.name}
              className={`rounded-lg bg-card p-6 ${s.cls}`}
            >
              <p className="text-caption font-mono">{s.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-lg bg-card p-6 shadow-card">
          <p className="text-caption mb-4 uppercase tracking-widest opacity-70">
            Hover the chips — micro 200ms / base 300ms / slow 500ms, ease-soft
          </p>
          <div className="flex flex-wrap gap-4">
            {(
              [
                ["duration-micro", "200ms"],
                ["duration-base", "300ms"],
                ["duration-slow", "500ms"],
              ] as const
            ).map(([name, ms]) => (
              <div
                key={name}
                className="rounded-lg bg-blush-2 px-6 py-4 ease-soft hover:-translate-y-2 hover:bg-blue hover:text-white hover:shadow-lift"
                style={{ transitionDuration: `var(--${name})`, transitionProperty: "all" }}
              >
                <p className="text-caption font-mono">
                  {name} · {ms}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-caption mt-24 pb-8 uppercase tracking-widest opacity-70">
          Delete src/routes/design-tokens.tsx after sign-off.
        </p>
      </div>
    </main>
  );
}
