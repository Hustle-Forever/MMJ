import { FabricBackground } from "@/components/FabricBackground";

/**
 * Hero backdrop — the CSS satin stripes (SVG-displacement ripple + sheen).
 *
 * On desktop the single WebGL context is reserved for the 3D notebook (the
 * hero's focal point), so the background stays CSS here: lighter, 60fps-safe,
 * and reduced-motion aware via styles.css. The standalone WebGL fabric shader
 * (FabricBackgroundGL) is kept for a future single-canvas merge — a full-bleed
 * scene that draws the fabric plane behind the book in one context.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <FabricBackground className="absolute inset-0" />
    </div>
  );
}
