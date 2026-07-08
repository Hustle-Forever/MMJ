import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ShoppingBag } from "lucide-react";
import logo from "@/assets/mmj-logo.asset.json";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-md bg-[color-mix(in_oklab,var(--blush)_72%,transparent)] border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)]"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5 md:px-10">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setOpen(true)}
              className="group inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-blue transition hover:opacity-70"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" /> Menu
            </button>
            <div className="hidden gap-7 text-[13px] uppercase tracking-[0.22em] md:flex">
              {LINKS.slice(1, 3).map((l) => (
                <Link key={l.to} to={l.to} className="text-blue/80 hover:text-blue transition">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/" className="flex items-center justify-center" aria-label="Curated by MMJ home">
            <img
              src={logo.url}
              alt="Curated by MMJ"
              className="h-11 w-11 rounded-full object-cover ring-1 ring-[color-mix(in_oklab,var(--ink)_15%,transparent)]"
            />
          </Link>

          <div className="flex items-center justify-end gap-6">
            <Link
              to="/"
              className="hidden text-[13px] uppercase tracking-[0.22em] text-blue/80 transition hover:text-blue md:inline"
            >
              Account
            </Link>
            <button
              className="group relative inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-blue transition hover:opacity-70"
              aria-label={`Cart (${cartCount})`}
            >
              <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Cart</span>
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen menu overlay */}
      <div
        className={`fixed inset-0 z-50 transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          clipPath: open ? "circle(150% at 8% 5%)" : "circle(0% at 8% 5%)",
          background: "var(--blush)",
        }}
        aria-hidden={!open}
      >
        <div className="relative h-full w-full overflow-hidden">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-8 top-7 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-blue hover:opacity-70"
            aria-label="Close menu"
          >
            Close <X className="h-4 w-4" />
          </button>
          <div className="flex h-full flex-col items-start justify-center gap-6 px-10 md:px-24">
            {LINKS.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display block text-[13vw] leading-[0.95] text-blue transition hover:translate-x-2 md:text-[9vw]"
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(40px)",
                  transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${120 + i * 90}ms, transform 900ms cubic-bezier(0.16,1,0.3,1) ${120 + i * 90}ms`,
                }}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-10 text-[12px] uppercase tracking-[0.3em] text-blue/60">
              Curated by MMJ · Est. 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
