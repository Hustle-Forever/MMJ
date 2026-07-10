import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavLinkItem } from "./FullscreenMenu";

export interface NavProps {
  links: NavLinkItem[];
  cartCount?: number;
  onCartClick?: () => void;
  className?: string;
}

const linkClass =
  "text-caption uppercase tracking-caps text-ink/80 transition-colors ease-soft duration-(--duration-micro) hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Sticky site nav — transparent at the top, softens to a blurred blush glass
 * once scrolled. Links left, logo centered, cart right. (Menu + Account are
 * intentionally omitted for the demo.)
 * Logo: /brand/mmj-logo.png (falls back to a serif wordmark if missing).
 */
export function Nav({ links, cartCount = 0, onCartClick, className }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 48));

  // The image may 404 before hydration attaches onError — recheck on mount.
  useEffect(() => {
    const img = logoRef.current;
    if (img?.complete && img.naturalWidth === 0) setLogoFailed(true);
  }, []);

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-(--z-nav) border-b transition-[background-color,border-color,box-shadow,backdrop-filter] ease-soft duration-(--duration-slow)",
        scrolled
          ? "border-border bg-blush-glass shadow-card backdrop-blur-md"
          : "border-transparent bg-transparent",
        className,
      )}
    >
      <nav
        className="mx-auto grid max-w-wide grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-2 md:px-10"
        aria-label="Primary"
      >
        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="col-start-2 flex min-h-11 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Curated by MMJ home"
        >
          {logoFailed ? (
            <span className="font-display text-h3 text-ink">MMJ</span>
          ) : (
            <img
              ref={logoRef}
              src="/brand/mmj-logo.png"
              alt="Curated by MMJ"
              className="h-11 w-11 rounded-full object-cover ring-1 ring-border"
              onError={() => setLogoFailed(true)}
            />
          )}
        </Link>

        <div className="flex items-center justify-end">
          <button
            onClick={onCartClick}
            className={cn(linkClass, "inline-flex min-h-11 cursor-pointer items-center gap-2")}
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Cart</span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1 text-caption text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
