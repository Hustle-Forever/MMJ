/**
 * Signature satin stripe background.
 * - CSS repeating stripes (blush / blush-2)
 * - SVG feDisplacementMap + Perlin turbulence for the "fabric wave"
 * - Slow keyframe drift + subtle sheen sweep
 * Zero JS, respects prefers-reduced-motion via styles.css.
 */
export function FabricBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Displacement filter — very low scale to keep it subconscious */}
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <filter id="satinDisplace" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.02"
            numOctaves="2"
            seed="7"
          >
            <animate
              attributeName="baseFrequency"
              dur="42s"
              values="0.006 0.02; 0.008 0.018; 0.006 0.02"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
      </svg>

      <div className="fabric-stripes" />
      <div className="fabric-sheen" />
      {/* Soft vignette so edges recede */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(11,95,165,0.08) 100%)",
        }}
      />
    </div>
  );
}
