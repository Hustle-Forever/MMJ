import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Video section — Curated by MMJ.
 * Autoplay, muted, looping inline video. No overlay, no controls.
 * Blush-stripe backdrop + mouse-follow spotlight from the hero, faded softly.
 *
 * Drop the film file at public/video/film.mp4 — the element is ready.
 * If the file 404s on Vercel, move it to src/assets/video/ and import it
 * as a bundled asset (same pattern as the cover images).
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
      {/* Blush stripe backdrop — very faded, radially masked so it dissolves at edges */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--blush) 0, var(--blush) 48px, var(--blush-2) 48px, var(--blush-2) 96px)",
            maskImage:
              "radial-gradient(75% 65% at 50% 50%, #000 0%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(75% 65% at 50% 50%, #000 0%, transparent 100%)",
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
                "radial-gradient(36vmax 36vmax at var(--fx) var(--fy), color-mix(in oklab, var(--white) 48%, transparent) 0%, transparent 68%)",
              mixBlendMode: "soft-light",
            } as CSSProperties
          }
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.4em] text-blue/55">
            Curated by MMJ · The Film
          </p>
          <h3 className="font-display text-[9vw] leading-[0.95] text-blue md:text-[4vw]">
            Make it happen.
          </h3>
        </div>

        {/* Video frame — glass, rounded corners, soft float shadow */}
        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-[28px] ring-1 ring-blue/8"
          style={{
            background:
              "linear-gradient(145deg, var(--blush-2) 0%, var(--blush) 50%, var(--white) 100%)",
            boxShadow:
              "0 48px 88px -28px rgba(11,95,165,0.22), 0 1px 0 rgba(255,255,255,0.65) inset",
          }}
        >
          {/* Autoplay video — muted, looping, no controls, no overlay.
              File: public/video/film.mp4
              If /video/ 404s on Vercel, move to src/assets/video/film.mp4 and import. */}
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src="/video/film.mp4"
          />

          {/* Glass sheen — floats above the video for depth, pointer-events off */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[38%]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
