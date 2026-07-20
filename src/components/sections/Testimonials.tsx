const notes = [
  {
    quote:
      "It feels like something my grandmother would have owned — but sharper. The paper is worth the wait.",
    who: "Amelia R.",
    where: "London",
  },
  {
    quote:
      "I bought the blue one for meetings and ended up writing poetry in it. That's the whole review.",
    who: "Noor S.",
    where: "Dubai",
  },
  {
    quote:
      "Wrapped like a gift. Reads like a promise. My third one already.",
    who: "Julia M.",
    where: "Milan",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-blush-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-blue/60">
          From the desk of
        </p>
        <h3 className="font-display max-w-3xl text-[9vw] leading-[0.95] text-blue md:text-[4vw]">
          Held, filled, returned to.
        </h3>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {notes.map((n, i) => (
            <figure
              key={n.who}
              className="group relative rounded-[18px] bg-white p-8 ring-1 ring-blue/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_rgba(11,95,165,0.35)]"
              style={{
                transform: `rotate(${i === 1 ? 0 : i === 0 ? -0.6 : 0.6}deg)`,
              }}
            >
              <div className="font-script text-4xl leading-none text-blue/40">"</div>
              <blockquote className="mt-2 text-pretty text-[15px] leading-[1.7] text-blue/85">
                {n.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-blue/60">
                <span>{n.who}</span>
                <span>{n.where}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
