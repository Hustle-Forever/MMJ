import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide smooth scroll, bridged to GSAP ScrollTrigger so there is ONE scroll
 * system: Lenis drives smoothing, gsap.ticker drives Lenis' RAF, and every Lenis
 * scroll updates ScrollTrigger. Under reduced-motion, Lenis is skipped and
 * ScrollTrigger falls back to native scroll (still works).
 */
export function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(ticker);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);
}
