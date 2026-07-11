import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Video section — rebranded for Curated by MMJ.
 * The same blush-stripe + mouse-follow spotlight from the hero sits behind the
 * video frame (lower opacity). Rounded glass box, soft shadow, no hard edges.
 */
export function Film() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let tx = 50, ty = 50, cx = 50, cy = 50, raf = 0;
    const onMove = (e: MouseEvent) => {
      const section = el.closest("section")!;
      const r = section.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.setProperty("--fx", `${cx}%`);
      el.style.setProperty("--fy", `${cy}%`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      {/* Blush stripe backdrop — same as hero but very faded behind the video */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--blush) 0, var(--blush) 48px, var(--blush-2) 48px, var(--blush-2) 96px)",
            maskImage:
              "radial-gradient(80% 70% at 50% 50%, #000 0%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(80% 70% at 50% 50%, #000 0%, transparent 100%)",
          }}
        />
        {/* Mouse-follow spotlight */}
        <div
          ref={glowRef}
          className="absolute inset-0"
          style={
            {
              "--fx": "50%",
              "--fy": "50%",
              background:
                "radial-gradient(38vmax 38vmax at var(--fx) var(--fy), color-mix(in oklab, var(--white) 52%, transparent) 0%, transparent 65%)",
              mixBlendMode: "soft-light",
            } as CSSProperties
          }
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.4em] text-blue/60">
            Curated by MMJ · The Film
          </p>
          <h3 className="font-display text-[9vw] leading-[0.95] text-blue md:text-[4vw]">
            Make it happen.
          </h3>
        </div>

        {/* Video frame — glass, rounded, soft float */}
        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-[28px] ring-1 ring-blue/10"
          style={{
            background:
              "linear-gradient(135deg, var(--blush-2) 0%, var(--blush) 55%, var(--white) 100%)",
            boxShadow:
              "0 50px 90px -30px rgba(11,95,165,0.25), 0 2px 0 rgba(255,255,255,0.7) inset",
          }}
        >
          {/* Glass sheen */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-2/5"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.45), transparent)",
            }}
          />

          {/* Placeholder: client supplies the video file */}
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            playsInline
            muted
            loop
            aria-hidden
          />

          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-4 text-blue/60">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white/80 ring-1 ring-blue/15 backdrop-blur-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-[11px] uppercase tracking-[0.35em]">Film coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
