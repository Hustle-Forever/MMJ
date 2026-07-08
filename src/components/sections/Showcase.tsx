import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { products } from "@/lib/products";

/**
 * Signature 360° scroll story.
 * The pedestal stays put. The notebook rotates, and the cover
 * cross-fades Pink → Blue → Green → Pink across the scroll range.
 *
 * Progress 0..1 is mapped to 3 segments (one per color transition).
 * Rotation is scroll-linked: 3 * 360° = 1080° total across the section.
 */
export function Showcase() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();

  // total rotation across section (rad-free, in degrees)
  const rotation = progress * 1080; // 3 full turns

  // 4 phases: 0=pink, 0.33=blue, 0.66=green, 1=pink
  // Per-slide opacity via smoothstep triangles.
  const stops = [0, 1 / 3, 2 / 3, 1];
  const opacities = products.map((_, i) => triangleOpacity(progress, stops[i], 1 / 3));
  // Loop back to pink at end
  const pinkLoop = triangleOpacity(progress, 1, 1 / 3);
  opacities[0] = Math.max(opacities[0], pinkLoop);

  const activeIndex =
    progress < 0.33 ? 0 : progress < 0.66 ? 1 : progress < 0.95 ? 2 : 0;
  const active = products[activeIndex];

  return (
    <section
      ref={ref}
      className="relative w-full"
      style={{ height: "320vh" }}
      aria-label="Signature showcase"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center overflow-hidden bg-[color-mix(in_oklab,var(--blush)_60%,white_40%)]">
        {/* Left copy */}
        <div className="relative z-10 grid h-full w-full grid-cols-1 items-center gap-10 px-6 md:grid-cols-12 md:px-16">
          <div className="md:col-span-4">
            <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-blue/60">
              The Collection · 03
            </p>
            <h2
              key={active.slug}
              className="font-display text-[10vw] leading-[0.9] text-blue md:text-[4.2vw]"
              style={{
                animation: "mask-up 900ms cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              {active.name}
            </h2>
            <p
              key={`${active.slug}-desc`}
              className="mt-6 max-w-md text-pretty text-[15px] leading-[1.7] text-blue/75"
              style={{
                animation: "mask-up 1100ms cubic-bezier(0.16,1,0.3,1) 100ms both",
              }}
            >
              {active.description}
            </p>
            <dl
              key={`${active.slug}-specs`}
              className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] text-blue/70"
            >
              {active.specs.map((s) => (
                <div key={s.label} className="border-t border-blue/15 pt-2">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-blue/50">
                    {s.label}
                  </dt>
                  <dd className="mt-1 text-blue">{s.value}</dd>
                </div>
              ))}
            </dl>
            <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-blue px-7 py-3 text-[12px] uppercase tracking-[0.28em] text-white transition hover:opacity-90">
              Shop {active.name}
              <span aria-hidden>→</span>
            </button>
          </div>

          {/* Stage */}
          <div className="relative md:col-span-8">
            <div
              className="relative mx-auto flex aspect-square w-full max-w-[720px] items-center justify-center"
              style={{ perspective: "1600px" }}
            >
              {/* subtle radial spotlight */}
              <div
                className="absolute inset-0"
                aria-hidden
                style={{
                  background:
                    "radial-gradient(60% 55% at 50% 45%, rgba(255,255,255,0.9), transparent 70%)",
                }}
              />

              {/* rotating stack */}
              <div
                className="relative h-[70%] w-[52%]"
                style={{
                  transform: `rotateY(${rotation}deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 120ms linear",
                  filter: "drop-shadow(0 50px 60px rgba(11,95,165,0.28))",
                }}
              >
                {products.map((p, i) => (
                  <img
                    key={p.slug}
                    src={p.image}
                    alt={`${p.name} notebook`}
                    className="absolute inset-0 h-full w-full rounded-md object-contain"
                    style={{
                      opacity: opacities[i],
                      transition: "opacity 400ms cubic-bezier(0.16,1,0.3,1)",
                      backfaceVisibility: "hidden",
                    }}
                    draggable={false}
                  />
                ))}
              </div>

              {/* pedestal */}
              <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2">
                <div
                  className="h-3 w-[46%] min-w-[280px] rounded-[50%]"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(11,95,165,0.28), transparent 70%)",
                    filter: "blur(4px)",
                  }}
                />
              </div>
            </div>

            {/* progress dots */}
            <div className="mt-6 flex items-center justify-center gap-3">
              {products.map((p, i) => (
                <span
                  key={p.slug}
                  className="h-[2px] w-10 rounded-full transition-all"
                  style={{
                    background: i === activeIndex ? "var(--blue)" : "rgba(11,95,165,0.2)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Piecewise linear triangle: 1 at center, 0 at ±width.
function triangleOpacity(p: number, center: number, width: number) {
  const d = Math.abs(p - center);
  if (d >= width) return 0;
  return 1 - d / width;
}
