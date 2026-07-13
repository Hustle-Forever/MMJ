import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Hero backdrop — clean straight vertical satin stripes (blush / blush-2) with
 * a soft radial spotlight. On desktop (fine pointer, motion allowed) the
 * spotlight eases toward the cursor; on touch / reduced-motion it stays static.
 * The stripes never move — only the light does. Tokens only.
 */
export function HeroBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return; // mobile / touch / reduced-motion → static spotlight

    let tx = 50;
    let ty = 30;
    let cx = 50;
    let cy = 30;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
    };
    const tick = () => {
      cx += (tx - cx) * 0.08; // eased follow
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--mx", `${cx}%`);
      el.style.setProperty("--my", `${cy}%`);
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
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Straight vertical stripes — 48px each, on the 8px grid. Masked so they
          dissolve softly at the top and bottom instead of ending in a hard line. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--blush) 0, var(--blush) 48px, var(--blush-2) 48px, var(--blush-2) 96px)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 12%, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 12%, #000 55%, transparent 100%)",
        }}
      />
      {/* Soft spotlight that gently brightens the stripes (tracks cursor on desktop). */}
      <div
        ref={glowRef}
        className="absolute inset-0"
        style={
          {
            "--mx": "50%",
            "--my": "30%",
            background:
              "radial-gradient(42vmax 42vmax at var(--mx) var(--my), color-mix(in oklab, var(--white) 62%, transparent) 0%, transparent 62%)",
            mixBlendMode: "soft-light",
          } as CSSProperties
        }
      />
    </div>
  );
}
