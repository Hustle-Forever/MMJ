/**
 * Runtime access to the motion tokens in src/styles/tokens.css, so
 * motion/react animations pull from the same single source of truth as CSS.
 * Fallbacks mirror tokens.css and only apply during SSR, where animations
 * never run.
 */

export type DurationToken =
  | "--duration-micro"
  | "--duration-base"
  | "--duration-slow"
  | "--duration-reveal"
  | "--duration-exit"
  | "--stagger";

export type EaseToken = "--ease-soft" | "--ease-soft-in" | "--ease-soft-in-out";

export type Bezier = [number, number, number, number];

function readVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Duration token in seconds (motion/react's unit). */
export function tokenSeconds(name: DurationToken, ssrFallback: number): number {
  const raw = readVar(name);
  if (raw.endsWith("ms")) return parseFloat(raw) / 1000;
  if (raw.endsWith("s")) return parseFloat(raw);
  return ssrFallback;
}

/** Easing token as a cubic-bezier array (motion/react's format). */
export function tokenEase(name: EaseToken, ssrFallback: Bezier): Bezier {
  const match = readVar(name).match(/cubic-bezier\(([^)]+)\)/);
  if (!match) return ssrFallback;
  const points = match[1].split(",").map(Number);
  return points.length === 4 && points.every(Number.isFinite)
    ? (points as Bezier)
    : ssrFallback;
}
