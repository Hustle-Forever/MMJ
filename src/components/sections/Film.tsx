/**
 * Video frame. Placeholder — client supplies the file.
 * Uses a soft-glass frame with subtle float; on scroll it gains a
 * tiny scale via CSS scroll-linked animations (fallback: static).
 */
export function Film() {
  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.4em] text-blue/60">
              Film · A short
            </p>
            <h3 className="font-display text-[9vw] leading-[0.95] text-blue md:text-[4vw]">
              A quiet minute.
            </h3>
          </div>
          <span className="hidden text-[12px] uppercase tracking-[0.3em] text-blue/60 md:inline">
            00:60 · Loop
          </span>
        </div>

        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-[28px] ring-1 ring-blue/10"
          style={{
            background:
              "linear-gradient(135deg, #f4d8df 0%, #f8e6ec 55%, #ffffff 100%)",
            boxShadow:
              "0 50px 90px -30px rgba(11,95,165,0.35), inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          {/* Reflection band */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.5), transparent)",
            }}
          />
          {/* Placeholder play state */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-4 text-blue/70">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white/80 ring-1 ring-blue/20 backdrop-blur">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-[11px] uppercase tracking-[0.35em]">
                Film loads here
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
