import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, type Variants } from "motion/react";
import { Link } from "@tanstack/react-router";

import { hasWebGL } from "@/lib/detect-3d";
import coverPink from "@/assets/covers/cover_pink_front.webp";
import coverBlue from "@/assets/covers/cover_blue_front.webp";
import coverGreen from "@/assets/covers/cover_green_front.webp";

// Lazy so three/R3F never ship in the initial bundle.
const StillLifeScene = lazy(() => import("@/components/three/StillLifeScene"));

const ease = [0.16, 1, 0.3, 1] as const;

const line: Variants = {
  hidden: { y: "108%", opacity: 0 },
  visible: (delay: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 1.1, ease, delay },
  }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease, delay },
  }),
};

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
 * Flat still life — the guaranteed-visible base and the entire mobile
 * experience: three covers overlapped like a dealt hand on the dark set.
 * Reads at 390px without any 3D.
 */
function FlatStillLife() {
  const drop = "drop-shadow(0 30px 34px rgba(0,0,0,0.45))";
  return (
    <div className="relative mx-auto h-full w-full max-w-[720px]">
      {/* Ocean — behind, leaning right */}
      <img
        src={coverBlue}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute bottom-[16%] left-1/2 w-[38%] -translate-x-[8%] rotate-[11deg]"
        style={{ filter: drop }}
      />
      {/* Sage — base of the stack */}
      <img
        src={coverGreen}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute bottom-[8%] left-1/2 w-[42%] -translate-x-[78%] rotate-[-9deg]"
        style={{ filter: drop }}
      />
      {/* Blush — on top, front and center */}
      <img
        src={coverPink}
        alt="The three Curated by MMJ notebooks together"
        draggable={false}
        className="absolute bottom-[10%] left-1/2 w-[44%] -translate-x-[46%] rotate-[3deg]"
        style={{ filter: drop }}
      />
    </div>
  );
}

/**
 * The Still Life — the page's single dark chapter. Three notebooks lit like a
 * luxury product photograph on a deep shade of the brand blue. Desktop gets
 * the live 3D set (raking light, linen grain, hover tilt); mobile gets a
 * static composition that still reads at 390px.
 */
export function StillLife() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px)");
    const force = new URLSearchParams(window.location.search).get("force3d");
    if (force === "0" || reduce.matches) return;
    // Desktop only — mobile always gets the static composition (frame budget).
    if (force === "1" || desktop.matches) setUse3D(hasWebGL());
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-navy py-24 md:py-32"
      aria-label="The still life — all three colourways"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="mb-4 text-[11px] uppercase tracking-[0.4em] text-blush/50"
            >
              The Still Life · Three colourways
            </motion.p>
            <h2
              className="font-display text-balance text-[11vw] leading-[0.95] text-blush md:text-[5.5vw]"
              aria-label="One for every mood."
            >
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  custom={0.12}
                  variants={line}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                >
                  One for every <span className="font-script italic">mood.</span>
                </motion.span>
              </span>
            </h2>
          </div>
          <motion.p
            custom={0.35}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="max-w-xs text-pretty text-[15px] leading-[1.7] text-blush/60"
          >
            Blush for beginnings, ocean for focus, sage for slow mornings.
          </motion.p>
        </div>

        {/* The set — flat base always present; 3D overlays once confirmed */}
        <div className="relative mt-6 h-[min(58vw,420px)] w-full md:mt-2 md:h-[560px]">
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: ready ? 0 : 1 }}
          >
            <FlatStillLife />
          </div>
          {use3D && (
            <CanvasErrorBoundary>
              <Suspense fallback={null}>
                <div className="absolute inset-0">
                  <StillLifeScene onReady={() => setReady(true)} />
                </div>
              </Suspense>
            </CanvasErrorBoundary>
          )}
        </div>

        {/* Secondary action — underline treatment, not another filled pill */}
        <motion.div
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-10 flex justify-center md:mt-6"
        >
          <Link
            to="/shop"
            className="group inline-flex min-h-11 items-center gap-3 text-[13px] uppercase tracking-[0.22em] text-blush transition-opacity hover:opacity-80"
          >
            <span className="border-b border-blush/40 pb-1 transition-colors group-hover:border-blush">
              Shop all three
            </span>
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
