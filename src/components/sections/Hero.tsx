import { useMemo } from "react";
import { MotionConfig, motion, type Variants } from "motion/react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { tokenEase, tokenSeconds } from "@/lib/motion-tokens";
import { HeroBackground } from "./HeroBackground";
import { HeroNotebook } from "./HeroNotebook";

/**
 * Home hero — Curated by MMJ.
 * Centered composition: oversized editorial headline, then the notebook
 * standing on a circular pedestal, over the rippling satin fabric backdrop.
 *
 * Entrance (~2s staggered luxury timeline, all on --ease-soft / motion tokens):
 *   background fades in → eyebrow fades → headline reveals line-by-line
 *   (mask up) → notebook scales 90%→100%. Everything else stays calm.
 *
 * Flat cover_pink.jpg is a placeholder for the real 3D book (next step).
 * All colors, sizes and easings come from tokens — nothing hardcoded off-palette.
 */
export function Hero() {
  // Read timing from tokens.css; fallbacks mirror it for SSR (no animation there).
  const t = useMemo(() => {
    const ease = tokenEase("--ease-soft", [0.16, 1, 0.3, 1]);
    const reveal = tokenSeconds("--duration-reveal", 1.1);
    return { ease, reveal };
  }, []);

  const bg: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: t.ease } },
  };

  const fadeUp = (delay: number): Variants => ({
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: t.reveal * 0.6, ease: t.ease, delay } },
  });

  const line = (delay: number): Variants => ({
    hidden: { y: "110%" },
    visible: { y: 0, transition: { duration: t.reveal, ease: t.ease, delay } },
  });

  const book: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: t.reveal, ease: t.ease, delay: 0.9 } },
  };

  return (
    <MotionConfig reducedMotion="user">
      <Section
        as="section"
        rhythm="none"
        className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-28 pb-16 text-center md:pt-32"
      >
        <motion.div variants={bg} initial="hidden" animate="visible">
          <HeroBackground />
        </motion.div>

        <Container width="wide" className="flex flex-col items-center">
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp(0.35)}
            initial="hidden"
            animate="visible"
            className="text-caption uppercase tracking-caps text-muted-foreground"
          >
            Curated by MMJ · Hardcover notebooks
          </motion.p>

          {/* Headline — the bold moment, revealed line by line */}
          <h1
            className="font-display mt-6 text-balance leading-[var(--leading-display)] text-ink"
            style={{ fontSize: "clamp(3rem, 8.5vw, 6.5rem)" }}
          >
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                variants={line(0.5)}
                initial="hidden"
                animate="visible"
              >
                Make it
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="font-script block italic"
                style={{ fontSize: "1.08em" }}
                variants={line(0.68)}
                initial="hidden"
                animate="visible"
              >
                happen.
              </motion.span>
            </span>
          </h1>

          {/* Notebook standing on the circular pedestal (3D on desktop, flat on mobile) */}
          <motion.div
            variants={book}
            initial="hidden"
            animate="visible"
            className="relative mt-10 flex flex-col items-center"
          >
            <HeroNotebook color="pink" />
          </motion.div>

          {/* Single calm CTA */}
          <motion.div variants={fadeUp(1.2)} initial="hidden" animate="visible" className="mt-12">
            <Button variant="primary" size="pill">
              Shop the collection
            </Button>
          </motion.div>
        </Container>

        {/* Scroll cue */}
        <motion.div
          variants={fadeUp(1.6)}
          initial="hidden"
          animate="visible"
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.span
            className="text-caption uppercase tracking-caps text-muted-foreground"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            Scroll
          </motion.span>
        </motion.div>
      </Section>
    </MotionConfig>
  );
}
