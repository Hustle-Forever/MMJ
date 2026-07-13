import { useEffect, useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { X } from "lucide-react";

import { tokenEase, tokenSeconds } from "@/lib/motion-tokens";

export interface NavLinkItem {
  to: string;
  label: string;
}

export interface FullscreenMenuProps {
  open: boolean;
  onClose: () => void;
  links: NavLinkItem[];
}

const MotionLink = motion.create(Link);

/**
 * Fullscreen navigation overlay. Circle-reveals from the menu trigger corner,
 * then staggers the links up. All timing/easing read from tokens.css.
 */
export function FullscreenMenu({ open, onClose, links }: FullscreenMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Fallbacks mirror tokens.css — only used during SSR, where nothing animates.
  const t = useMemo(
    () => ({
      easeSoft: tokenEase("--ease-soft", [0.16, 1, 0.3, 1]),
      easeSoftIn: tokenEase("--ease-soft-in", [0.7, 0, 0.84, 0]),
      reveal: tokenSeconds("--duration-reveal", 1.1),
      stagger: tokenSeconds("--stagger", 0.04),
    }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const overlay = {
    closed: {
      clipPath: "circle(0% at 8% 5%)",
      transition: { duration: t.reveal * 0.65, ease: t.easeSoftIn },
    },
    open: {
      clipPath: "circle(150% at 8% 5%)",
      transition: {
        duration: t.reveal,
        ease: t.easeSoft,
        staggerChildren: t.stagger * 2,
        delayChildren: t.stagger * 3,
      },
    },
  };

  const item = {
    closed: { y: 40, opacity: 0, transition: { duration: t.reveal * 0.3 } },
    open: { y: 0, opacity: 1, transition: { duration: t.reveal, ease: t.easeSoft } },
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="fullscreen-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-(--z-modal) bg-blush"
            variants={overlay}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <button
              ref={closeRef}
              onClick={onClose}
              className="absolute right-6 top-6 inline-flex min-h-11 cursor-pointer items-center gap-2 text-caption uppercase tracking-caps text-ink transition-opacity ease-soft duration-(--duration-micro) hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:right-10"
              aria-label="Close menu"
            >
              Close <X className="h-4 w-4" aria-hidden />
            </button>

            <nav className="flex h-full flex-col items-start justify-center gap-6 px-6 md:px-24">
              {links.map((link) => (
                <MotionLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  variants={item}
                  className="font-display text-display block text-ink transition-transform ease-soft duration-(--duration-base) hover:translate-x-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {link.label}
                </MotionLink>
              ))}
              <motion.p
                variants={item}
                className="mt-10 text-caption uppercase tracking-caps text-muted-foreground"
              >
                Curated by MMJ · Est. 2026
              </motion.p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
