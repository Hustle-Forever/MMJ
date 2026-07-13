import { useRef } from "react";
import { motion, useInView, type Variants } from "motion/react";

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

export function Editorial() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <section ref={ref} className="relative overflow-hidden bg-blush py-32 md:py-48">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-8 text-[11px] uppercase tracking-[0.4em] text-blue/60"
        >
          Editorial · No. 001
        </motion.p>

        <h2
          className="font-display text-balance text-[13vw] leading-[0.92] text-blue md:text-[8.5vw]"
          aria-label="Paper that listens. Ink that remembers."
        >
          {/* Line 1 */}
          <span className="block overflow-hidden pb-[0.05em]">
            <motion.span
              className="block"
              custom={0.1}
              variants={line}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              Paper that{" "}
              <span className="font-script italic">listens.</span>
            </motion.span>
          </span>
          {/* Line 2 */}
          <span className="block overflow-hidden pb-[0.05em]">
            <motion.span
              className="block"
              custom={0.28}
              variants={line}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              Ink that{" "}
              <span className="font-script italic">remembers.</span>
            </motion.span>
          </span>
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12">
          <motion.p
            custom={0.45}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-pretty text-[16px] leading-[1.75] text-blue/75 md:col-span-5 md:col-start-2"
          >
            Every notebook is bound by hand. Cream 120gsm pages take fountain
            ink without bleeding, a satin ribbon marks your place, and a
            quiet script on the cover reminds you why you started.
          </motion.p>
          <motion.p
            custom={0.58}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-pretty text-[16px] leading-[1.75] text-blue/75 md:col-span-4 md:col-start-8"
          >
            This is not a productivity tool. It's a slower object — made for
            morning pages, first drafts, and the sentence you'll return to
            three weeks from now.
          </motion.p>
        </div>
      </div>

      {/* Marquee */}
      <div className="mt-24 overflow-hidden whitespace-nowrap border-y border-blue/15 py-8">
        <div className="marquee-track inline-flex gap-16 pl-16 font-display text-[8vw] leading-none text-blue/85 md:text-[5vw]">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="inline-flex items-center gap-16">
              <span>Make it happen</span>
              <span className="font-script italic opacity-60">·</span>
              <span>Written by hand</span>
              <span className="font-script italic opacity-60">·</span>
              <span>Bound in linen</span>
              <span className="font-script italic opacity-60">·</span>
              <span>Curated by MMJ</span>
              <span className="font-script italic opacity-60">·</span>
              <img
                src="/logo/logo.png"
                alt=""
                aria-hidden
                className="inline-block h-[0.85em] w-[0.85em] flex-shrink-0 rounded-full object-cover align-middle opacity-90"
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
