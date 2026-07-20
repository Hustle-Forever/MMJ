import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";

import type { NotebookColor } from "@/components/three/Notebook";
import { detect3DTier, hasWebGL } from "@/lib/detect-3d";
import coverPink from "@/assets/covers/cover_pink_front.webp";

// Lazy so three / R3F never ship in the initial bundle and never run on the server.
const Scene = lazy(() => import("@/components/three/Scene"));

// Capable phones (detect-gpu tier ≥ 2) get the live book; lower tiers fall back.
const MOBILE_TIER_MIN = 2;

/** If the 3D canvas throws for any reason, render nothing so the flat base shows. */
class CanvasErrorBoundary extends Component<
  { onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Flat cover — bundled asset (served from /assets, unlike public/textures which
 * 404s on Vercel). This is the guaranteed-visible book. */
function FlatCover() {
  return (
    <img
      src={coverPink}
      alt="Curated by MMJ — Blush Pink hardcover notebook"
      draggable={false}
      className="h-full w-auto rounded-md object-contain [animation:notebook-float_7s_ease-in-out_infinite]"
      style={{
        filter: "drop-shadow(0 22px 26px color-mix(in oklab, var(--blue) 12%, transparent))",
      }}
    />
  );
}

/**
 * The hero's notebook, floating cleanly (no pedestal).
 *
 * Reliability: the flat cover is ALWAYS rendered as the visible base. The live
 * 3D canvas overlays it and the flat book is hidden ONLY once the 3D book is
 * confirmed to be rendering (texture loaded → Scene fires onReady). Any failure
 * — no WebGL, GPU gate, lazy-load error, WebGL context loss, texture error —
 * leaves the flat book visible. A book is always on screen.
 *
 * Gate: desktop (WebGL) → 3D; capable phones (tier ≥ 2) → 3D low-power; else
 * flat only. `?force3d=1` / `?force3d=0` overrides for the demo.
 */
export function HeroNotebook({ color = "pink" }: { color?: NotebookColor }) {
  const [use3D, setUse3D] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [ready, setReady] = useState(false); // 3D confirmed rendering

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
      // Desktop: mount immediately when WebGL is available.
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
          // Capped by viewport height too, so headline + book + CTA all fit
          // above the fold on short desktop viewports (e.g. 1440×900).
          height: "clamp(220px, min(54vw, 44vh), 460px)",
          width: "min(72vw, clamp(200px, min(46vw, 40vh), 430px))",
        }}
      >
        {/* Always-present flat book — hidden only once the 3D book is confirmed. */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
          style={{ opacity: ready ? 0 : 1 }}
        >
          <FlatCover />
        </div>

        {/* Live 3D overlay. Any failure leaves the flat book above. */}
        {use3D && (
          <CanvasErrorBoundary onFail={() => setReady(false)}>
            <Suspense fallback={null}>
              <div className="absolute inset-0">
                <Scene color={color} lowPower={lowPower} onReady={() => setReady(true)} />
              </div>
            </Suspense>
          </CanvasErrorBoundary>
        )}
      </div>
    </div>
  );
}
