import { lazy, Suspense, useEffect, useState } from "react";

import type { NotebookColor } from "@/components/three/Notebook";
import { detect3DTier, hasWebGL } from "@/lib/detect-3d";

// Lazy so three / R3F never ship in the initial bundle and never run on the server.
const Scene = lazy(() => import("@/components/three/Scene"));

// Capable phones (detect-gpu tier ≥ 2) get the live book; lower tiers fall back.
const MOBILE_TIER_MIN = 2;

function FlatCover() {
  return (
    <img
      src="/textures/cover_pink.jpg"
      alt="Curated by MMJ — Blush Pink hardcover notebook"
      draggable={false}
      className="h-full w-auto rounded-md object-contain [animation:notebook-float_7s_ease-in-out_infinite]"
      style={{
        filter: "drop-shadow(0 36px 52px color-mix(in oklab, var(--blue) 28%, transparent))",
      }}
    />
  );
}

/** The circular pedestal the book stands on — locked tokens only, stays still. */
function Pedestal() {
  return (
    <div className="relative -mt-3 flex flex-col items-center" aria-hidden>
      <div
        className="h-4 rounded-[50%] [animation:shadow-float_7s_ease-in-out_infinite]"
        style={{
          width: "clamp(220px, 40vh, 460px)",
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--blue) 32%, transparent) 0%, color-mix(in oklab, var(--blue) 16%, transparent) 42%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      <div
        className="-mt-2 h-9 rounded-[50%]"
        style={{
          width: "clamp(240px, 44vh, 500px)",
          background:
            "radial-gradient(ellipse at 50% 30%, var(--white) 0%, var(--blush) 45%, var(--footer-pink) 100%)",
          boxShadow:
            "0 28px 56px -20px color-mix(in oklab, var(--blue) 35%, transparent), inset 0 -6px 20px color-mix(in oklab, var(--blue) 14%, transparent)",
        }}
      />
    </div>
  );
}

/**
 * The hero's notebook. Live 3D when the device can sustain it:
 *   - desktop (≥768px, WebGL) → 3D, unchanged from before
 *   - capable phones (detect-gpu tier ≥ 2, WebGL) → 3D in low-power mode
 *   - low-tier GPUs, no WebGL, or reduced-motion → flat cover (no canvas)
 * `?force3d=1` / `?force3d=0` overrides the gate (testing + demo control).
 * Either way the book stands on the same still pedestal.
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
      <div
        className="relative"
        style={{ height: "clamp(210px, 36vh, 400px)", width: "clamp(240px, 42vh, 470px)" }}
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
      <Pedestal />
    </div>
  );
}
