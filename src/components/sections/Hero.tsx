import { useEffect, useRef, useState } from "react";
import { FabricBackground } from "@/components/FabricBackground";

/**
 * Hero: pink notebook floating on a circular pedestal.
 * - Notebook: gentle vertical bob + slight tilt (CSS keyframes)
 * - Mouse tilt: parallax 2-4°, shadow shifts subtly
 * - Ribbon: soft SVG path with a slow sway
 * - Entrance: staggered mask-up on the headline lines
 */
export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // clamp to ±3.5° max — physical, not gimmicky
      const x = ((e.clientY - cy) / r.height) * -3.5;
      const y = ((e.clientX - cx) / r.width) * 3.5;
      setTilt({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={wrapRef}
      className="relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden pt-24"
    >
      <FabricBackground />

      {/* Headline */}
      <div className="pointer-events-none absolute inset-x-0 top-[16%] z-10 mx-auto max-w-[1400px] px-6 text-center md:px-10">
        <p
          className="mb-4 text-[11px] uppercase tracking-[0.4em] text-blue/70"
          style={{ animation: "mask-up 900ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
        >
          Curated by MMJ · Notebooks
        </p>
        <h1 className="font-display text-balance text-[13vw] leading-[0.92] text-blue md:text-[7.5vw]">
          <span className="reveal-line">
            <span className="reveal-line-inner" style={{ animationDelay: "300ms" }}>
              Make it
            </span>
          </span>{" "}
          <span className="reveal-line">
            <span
              className="reveal-line-inner font-script italic"
              style={{ animationDelay: "550ms" }}
            >
              happen.
            </span>
          </span>
        </h1>
      </div>

      {/* Pedestal + notebook */}
      <div className="relative z-[5] mt-[6vh] flex flex-col items-center">
        <div
          className="relative"
          style={{
            perspective: "1400px",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="relative transition-transform duration-[600ms] ease-out"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Notebook */}
            <div
              className="relative"
              style={{
                animation: "notebook-float 6.5s ease-in-out infinite",
                filter: "drop-shadow(0 40px 60px rgba(11,95,165,0.28))",
              }}
            >
              <img
                src="/textures/cover_pink.jpg"
                alt="Curated by MMJ — Blush Pink hardcover notebook"
                className="h-[62vh] w-auto rounded-[6px] object-contain"
                style={{
                  animation: "mask-up 1400ms cubic-bezier(0.16,1,0.3,1) 700ms both",
                }}
                draggable={false}
              />

              {/* Ribbon accent — CSS silk */}
              <div
                className="pointer-events-none absolute -bottom-16 left-1/2 h-40 w-3 -translate-x-1/2 origin-top"
                style={{
                  background:
                    "linear-gradient(180deg, #f4d8df 0%, #efc9d4 55%, #e8b8c6 100%)",
                  borderRadius: "2px",
                  boxShadow: "inset -1px 0 0 rgba(255,255,255,0.6), 0 8px 14px rgba(11,95,165,0.15)",
                  animation: "ribbon-sway 5.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          {/* Pedestal */}
          <div className="relative -mt-6 flex justify-center">
            <div
              className="relative h-6 w-[52vh] max-w-[520px]"
              aria-hidden
            >
              <div
                className="absolute inset-0 rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(11,95,165,0.35) 0%, rgba(11,95,165,0.18) 40%, transparent 70%)",
                  animation: "shadow-float 6.5s ease-in-out infinite",
                  filter: "blur(6px)",
                }}
              />
            </div>
          </div>
          <div className="relative mx-auto -mt-2 flex justify-center">
            <div
              className="h-10 w-[54vh] max-w-[540px] rounded-[50%]"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 30%, #ffffff 0%, #f7dbe3 45%, #e8b8c6 100%)",
                boxShadow:
                  "0 30px 60px -20px rgba(11,95,165,0.35), inset 0 -6px 20px rgba(11,95,165,0.15)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-[11px] uppercase tracking-[0.35em] text-blue/60">
        <span className="inline-block animate-bounce [animation-duration:2.4s]">
          Scroll ↓
        </span>
      </div>
    </section>
  );
}
