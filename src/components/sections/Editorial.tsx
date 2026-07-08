export function Editorial() {
  return (
    <section className="relative overflow-hidden bg-blush py-32 md:py-48">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <p className="mb-8 text-[11px] uppercase tracking-[0.4em] text-blue/60">
          Editorial · No. 001
        </p>
        <h2 className="font-display text-balance text-[13vw] leading-[0.92] text-blue md:text-[8.5vw]">
          Paper that <span className="font-script italic">listens.</span>
          <br />
          Ink that <span className="font-script italic">remembers.</span>
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12">
          <p className="text-pretty text-[16px] leading-[1.75] text-blue/75 md:col-span-5 md:col-start-2">
            Every notebook is bound by hand. Cream 120gsm pages take fountain
            ink without bleeding, a satin ribbon marks your place, and a
            quiet script on the cover reminds you why you started.
          </p>
          <p className="text-pretty text-[16px] leading-[1.75] text-blue/75 md:col-span-4 md:col-start-8">
            This is not a productivity tool. It's a slower object — made for
            morning pages, first drafts, and the sentence you'll return to
            three weeks from now.
          </p>
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
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
