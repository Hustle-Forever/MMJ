import { lazy, Suspense, useEffect, useState } from "react";

import type { NotebookColor } from "@/components/three/Notebook";
import { detect3DTier, hasWebGL } from "@/lib/detect-3d";
import coverPink from "@/assets/covers/cover_pink.jpg";

// Lazy so three / R3F never ship in the initial bundle and never run on the server.
const Scene = lazy(() => import("@/components/three/Scene"));

// Capable phones (detect-gpu tier ≥ 2) get the live book; lower tiers fall back.
const MOBILE_TIER_MIN = 2;

function FlatCover() {
  return (
    <img
      src={coverPink}
      alt="Curated by MMJ — Blush Pink hardcover notebook"
      draggable={false}
      className="h-full w-auto rounded-md object-contain [animation:notebook-float_7s_ease-in-out_infinite]"
      style={{
        // Faint, soft, tight shadow so it floats cleanly (no pedestal).
        filter: "drop-shadow(0 22px 26px color-mix(in oklab, var(--blue) 12%, transparent))",
      }}
    />
  );
}

/**
 * The hero's notebook, floating cleanly (no pedestal). Live 3D when the device
 * can sustain it:
 *   - desktop (≥768px, WebGL) → 3D, unchanged from before
 *   - capable phones (detect-gpu tier ≥ 2, WebGL) → 3D in low-power mode
 *   - low-tier GPUs, no WebGL, or reduced-motion → flat cover (no canvas)
 * `?force3d=1` / `?force3d=0` overrides the gate (testing + demo control).
 */
export function HeroNotebook({ color = "pink" }: { color?: NotebookColor }) {
  const [use3D, setUse3D] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px)");
    let cancelled = false;

    const decide = async () => {
      const force = new URLSearchParams(window.location.search).get("force3d");
      if (force === "0" || reduce.matches) {
        if (!cancelled) setUse3D(false);
        return;
      }
      if (force === "1") {
        if (!cancelled) {
          setLowPower(!desktop.matches);
          setUse3D(hasWebGL());
        }
        return;
      }
      // Desktop: unchanged — mount immediately when WebGL is available.
      if (desktop.matches) {
        if (!cancelled) {
          setLowPower(false);
          setUse3D(hasWebGL());
        }
        return;
      }
      // Mobile: gate on measured GPU tier so we never drop frames.
      const tier = await detect3DTier();
      if (cancelled) return;
      setLowPower(true);
      setUse3D(tier >= MOBILE_TIER_MIN);
    };

    void decide();
    reduce.addEventListener("change", decide);
    desktop.addEventListener("change", decide);
    return () => {
      cancelled = true;
      reduce.removeEventListener("change", decide);
      desktop.removeEventListener("change", decide);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* Bigger stage so the book fills more of the hero. Width is capped at
          90vw so it never overflows on mobile. */}
      <div
        className="relative"
        style={{
          height: "clamp(320px, 54vh, 600px)",
          width: "min(90vw, clamp(300px, 48vh, 560px))",
        }}
      >
        {use3D ? (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <FlatCover />
              </div>
            }
          >
            <Scene color={color} lowPower={lowPower} />
          </Suspense>
        ) : (
          <div className="flex h-full items-center justify-center">
            <FlatCover />
          </div>
        )}
      </div>
    </div>
  );
}
