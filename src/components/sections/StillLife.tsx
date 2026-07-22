import { useRef } from "react";
import { motion, useInView, type Variants } from "motion/react";
import { Link } from "@tanstack/react-router";

import coverPink from "@/assets/covers/cover_pink_front.webp";
import coverBlue from "@/assets/covers/cover_blue_front.webp";
import coverGreen from "@/assets/covers/cover_green_front.webp";

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

const bookIn: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease, delay },
  }),
};

/* Two-layer shadow: a tight contact core plus a wide ambient falloff, so the
   photos read as objects sitting on the set rather than stickers. */
const SHADOW =
  "drop-shadow(0 10px 12px rgba(0,0,0,0.45)) drop-shadow(0 34px 44px rgba(0,0,0,0.38))";

/**
 * The Still Life — the page's single dark chapter. Built entirely from the
 * real product photographs (no 3D): three notebooks overlapping on the navy
 * set like a dealt hand, slight rotations, layered drop shadows, a soft
 * floor glow to ground them. On fine pointers each book lifts and
 * straightens a touch on hover.
 */
export function StillLife() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  // Position (outer, animated by motion) is separate from the rotate/offset
  // transform (inner) — motion writes style.transform on its element, which
  // would otherwise clobber the Tailwind rotation classes.
  const books = [
    {
      src: coverGreen,
      alt: "",
      delay: 0.15,
      pos: "bottom-[6%] left-1/2 z-0 w-[38%] max-w-[300px]",
      tilt: "-translate-x-[88%] rotate-[-10deg] hover:-translate-y-2 hover:rotate-[-8deg]",
    },
    {
      src: coverBlue,
      alt: "",
      delay: 0.3,
      pos: "bottom-[9%] left-1/2 z-0 w-[36%] max-w-[285px]",
      tilt: "translate-x-[2%] rotate-[11deg] hover:-translate-y-2 hover:rotate-[9deg]",
    },
    {
      src: coverPink,
      alt: "The three Curated by MMJ notebooks — blush pink, ocean blue and sage green",
      delay: 0.45,
      pos: "bottom-[7%] left-1/2 z-10 w-[40%] max-w-[315px]",
      tilt: "-translate-x-[47%] rotate-[2.5deg] hover:-translate-y-2 hover:rotate-[1deg]",
    },
  ];

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

        {/* The set — real photographs only */}
        <div className="relative mx-auto mt-6 h-[min(62vw,440px)] w-full max-w-[820px] md:mt-2 md:h-[540px]">
          {/* Floor glow — soft pool of light grounding the composition */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-[26%] w-[86%] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(50% 100% at 50% 100%, rgba(255,242,226,0.10) 0%, transparent 70%)",
            }}
          />
          {books.map((b) => (
            <motion.div
              key={b.src}
              custom={b.delay}
              variants={bookIn}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className={`absolute ${b.pos}`}
            >
              <div className={`${b.tilt} transition-transform duration-500 ease-soft`}>
                <img
                  src={b.src}
                  alt={b.alt}
                  aria-hidden={b.alt === "" || undefined}
                  draggable={false}
                  className="w-full"
                  style={{ filter: SHADOW }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary action — underline treatment, not another filled pill */}
        <motion.div
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-10 flex justify-center md:mt-8"
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
