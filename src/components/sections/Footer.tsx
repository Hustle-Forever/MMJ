import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden pt-24"
      style={{ background: "var(--footer-pink)" }}
    >
      {/* Slow ribbon drift */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-24"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(11,95,165,0.08), transparent)",
          animation: "sheen-drift 28s ease-in-out infinite alternate",
        }}
      />
      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10">
        {/* Newsletter glass panel */}
        <div className="mx-auto max-w-3xl rounded-[22px] bg-white/60 p-8 shadow-[0_30px_60px_-30px_rgba(11,95,165,0.4)] ring-1 ring-white/60 backdrop-blur-lg md:p-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-blue/70">
            Letters from MMJ
          </p>
          <h4 className="font-display mt-3 text-3xl leading-tight text-blue md:text-4xl">
            A short note, once a month.
          </h4>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="nl-email" className="sr-only">
              Email address
            </label>
            <input
              id="nl-email"
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-full border border-blue/20 bg-white/80 px-5 py-3 text-[14px] text-blue outline-none placeholder:text-blue/40 focus:border-blue"
            />
            <button
              type="submit"
              className="rounded-full bg-blue px-7 py-3 text-[12px] uppercase tracking-[0.25em] text-white transition hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Huge wordmark */}
        <div className="mt-24 select-none text-center">
          <div className="font-script text-[22vw] leading-[0.85] text-blue md:text-[16vw]">
            Curated
          </div>
          <div className="font-display -mt-2 text-[9vw] uppercase tracking-[0.2em] text-blue md:text-[6vw]">
            BY MMJ
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-blue/15 py-8 text-[11px] uppercase tracking-[0.3em] text-blue/70 md:flex-row">
          <span>© {new Date().getFullYear()} Curated by MMJ. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Instagram" className="transition hover:text-blue">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-blue transition">Shipping</a>
            <a href="#" className="hover:text-blue transition">Contact</a>
            <a href="#" className="hover:text-blue transition">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
