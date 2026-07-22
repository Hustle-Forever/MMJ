import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { products } from "@/lib/products";
import { detect3DTier, hasWebGL } from "@/lib/detect-3d";

const ShowcaseScene = lazy(() => import("@/components/three/ShowcaseScene"));
const MOBILE_TIER_MIN = 2;

// Per-colourway heading/CTA ink — the section text morphs through these as the
// cover crossfades (rose for blush pink, brand blue for ocean, sage for green).
// Order matches the cover order pink→blue→green→pink (see coverOpacities).
// All three, and every interpolation midpoint between them, clear WCAG AA on
// the white surface (measured ≥5.9:1) — verified so the small CTA text stays
// readable at every scroll position. Body copy stays brand blue.
const MORPH: [number, number, number][] = [
  [158, 61, 94], // rose  #9E3D5E — blush pink colourway
  [11, 95, 165], // blue  #0B5FA5 — ocean blue colourway
  [85, 107, 52], // sage  #556B34 — sage green colourway
];
function morphColor(p: number) {
  const seg = Math.min(2, Math.floor(p * 3));
  const t = p * 3 - seg;
  const a = MORPH[seg];
  const b = MORPH[(seg + 1) % 3];
  const mix = (i: number) => Math.round(a[i] + (b[i] - a[i]) * t);
  return `rgb(${mix(0)} ${mix(1)} ${mix(2)})`;
}

function tri(p: number, c: number, w: number) {
  const d = Math.abs(p - c);
  return d >= w ? 0 : 1 - d / w;
}
function coverOpacities(p: number) {
  return [Math.max(tri(p, 0, 1 / 3), tri(p, 1, 1 / 3)), tri(p, 1 / 3, 1 / 3), tri(p, 2 / 3, 1 / 3)];
}

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Signature 360° scroll story. One scroll system (Lenis → ScrollTrigger): a
 * scrubbed timeline spins the 3D book 3×360° while the cover crossfades
 * Pink → Blue → Green → Pink and the side heading morphs color to match.
 * The flat crossfade is the always-visible base; the 3D book overlays it and
 * hides it only once confirmed rendering (reliability).
 */
export function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const progress = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [use3D, setUse3D] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [ready, setReady] = useState(false);

  // 3D capability gate (mirrors the hero).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px)");
    let cancelled = false;
    (async () => {
      const force = new URLSearchParams(window.location.search).get("force3d");
      if (force === "0" || reduce.matches) return;
      if (force === "1" || desktop.matches) {
        if (!cancelled) {
          setLowPower(force === "1" ? !desktop.matches : false);
          setUse3D(hasWebGL());
        }
        return;
      }
      const tier = await detect3DTier();
      if (cancelled) return;
      setLowPower(true);
      setUse3D(tier >= MOBILE_TIER_MIN);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Scrubbed ScrollTrigger drives everything (imperatively — no per-frame re-render).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // Respect reduced-motion: snap the text ink to the active colourway's solid
    // colour (a discrete change per slug, eased by the existing mask-up remount)
    // instead of a continuous scroll-driven colour animation.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const apply = (p: number) => {
      progress.current = p;
      const o = coverOpacities(p);
      imgRefs.current.forEach((im, i) => {
        if (im) im.style.opacity = String(o[i]);
      });
      const idx = p < 0.28 ? 0 : p < 0.55 ? 1 : p < 0.86 ? 2 : 0;
      const ink = reduce ? `rgb(${MORPH[idx][0]} ${MORPH[idx][1]} ${MORPH[idx][2]})` : morphColor(p);
      copyRef.current?.style.setProperty("--morph", ink);
      setActiveIndex((cur) => (cur === idx ? cur : idx));
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => apply(self.progress),
    });
    apply(0);
    return () => st.kill();
  }, []);

  const active = products[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "340vh" }}
      aria-label="Signature showcase"
    >
      {/* White chapter surface — separates the collection from the blush hero */}
      <div className="sticky top-0 flex h-[100dvh] w-full items-center overflow-hidden bg-white">
        <div className="relative z-10 grid h-full w-full grid-cols-1 content-center items-center gap-4 px-6 md:grid-cols-12 md:gap-8 md:px-16">
          {/* Left copy — heading + CTA morph color with the book.
              Mobile: text stacks above the book and everything must fit one
              viewport, so type tightens and the specs move to md+ only. */}
          <div ref={copyRef} className="md:col-span-4" style={{ ["--morph" as string]: "rgb(11 95 165)" }}>
            <p className="mb-2 flex items-baseline gap-3 text-caption uppercase tracking-caps text-blue/60 md:mb-4">
              The Collection
              <span className="text-[11px] tracking-[0.18em] text-blue/40" style={{ fontVariantNumeric: "tabular-nums lining-nums" }}>
                {String(activeIndex + 1).padStart(2, "0")} — 03
              </span>
            </p>
            <h2
              key={active.slug}
              className="font-display leading-[0.9]"
              style={{
                fontSize: "clamp(2.25rem, 5vw + 1rem, 4.5rem)",
                color: "var(--morph)",
                animation: "mask-up 900ms cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              {active.name}
            </h2>
            <p
              key={`${active.slug}-d`}
              className="mt-3 max-w-md text-pretty text-sm leading-[1.6] text-blue/75 md:mt-6 md:text-[17px] md:leading-[1.7]"
              style={{ animation: "mask-up 1100ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
            >
              {active.description}
            </p>
            {/* Mood line — the editorial one-liner each colourway carries */}
            <p
              key={`${active.slug}-m`}
              className="font-script mt-3 hidden text-[1.35rem] italic leading-snug text-blue/55 md:block"
              style={{ animation: "mask-up 1100ms cubic-bezier(0.16,1,0.3,1) 180ms both" }}
            >
              {active.mood}
            </p>
            <dl
              key={`${active.slug}-s`}
              className="mt-8 hidden grid-cols-2 gap-x-6 gap-y-3 text-caption text-blue/70 md:grid"
            >
              {active.specs.map((s) => (
                <div key={s.label} className="border-t border-blue/15 pt-2">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-blue/50">{s.label}</dt>
                  <dd className="mt-1 text-blue">{s.value}</dd>
                </div>
              ))}
            </dl>
            {/* Secondary action — underline treatment. The filled pill belongs
                to the hero's single primary CTA only. */}
            <button
              className="group mt-4 inline-flex min-h-11 items-center gap-3 text-caption uppercase tracking-caps transition-opacity ease-soft duration-(--duration-micro) hover:opacity-80 md:mt-6"
              style={{ color: "var(--morph)" }}
            >
              <span className="border-b border-current/40 pb-1 transition-colors group-hover:border-current">
                Shop {active.name}
              </span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>

          {/* Stage — flat crossfade base + 3D overlay. */}
          <div className="relative md:col-span-8">
            <div className="relative mx-auto h-[min(36svh,340px)] w-[min(70vw,300px)] md:h-[clamp(240px,52svh,560px)] md:w-[min(85vw,560px)]">
              {/* Flat crossfade base (always present; hidden once 3D confirmed). */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                style={{ opacity: ready ? 0 : 1 }}
              >
                <div
                  className="relative h-[80%] w-[62%]"
                  style={{
                    filter: "drop-shadow(0 40px 52px color-mix(in oklab, var(--blue) 14%, transparent))",
                  }}
                >
                  {products.map((p, i) => (
                    <img
                      key={p.slug}
                      ref={(el) => {
                        imgRefs.current[i] = el;
                      }}
                      src={p.image}
                      alt={`${p.name} notebook`}
                      draggable={false}
                      className="absolute inset-0 h-full w-full rounded-md object-contain"
                      style={{ opacity: i === 0 ? 1 : 0 }}
                    />
                  ))}
                </div>
              </div>

              {/* Live 3D book (reuses hero book + lighting). */}
              {use3D && (
                <CanvasErrorBoundary>
                  <Suspense fallback={null}>
                    <div className="absolute inset-0">
                      <ShowcaseScene
                        progress={progress}
                        lowPower={lowPower}
                        onReady={() => setReady(true)}
                      />
                    </div>
                  </Suspense>
                </CanvasErrorBoundary>
              )}
            </div>

            {/* Progress dots */}
            <div className="mt-3 flex items-center justify-center gap-3 md:mt-6">
              {products.map((p, i) => (
                <span
                  key={p.slug}
                  className="h-[2px] w-10 rounded-full transition-all"
                  style={{ background: i === activeIndex ? "var(--blue)" : "rgba(11,95,165,0.2)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
