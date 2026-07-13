import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCart } from "./cart-DezqsbqO.mjs";
import { a as Menu, n as ShoppingBag, t as X } from "../_libs/lucide-react.mjs";
import { t as Lenis } from "../_libs/lenis.mjs";
import { n as gsapWithCSS, t as ScrollTrigger } from "../_libs/gsap.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-lenis-C-6CjMDK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LINKS = [{
	to: "/shop",
	label: "Shop"
}, {
	to: "/journal",
	label: "Journal"
}];
function Nav() {
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [logoErr, setLogoErr] = (0, import_react.useState)(false);
	const { itemCount, openCart } = useCart();
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 40);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.style.overflow = open ? "hidden" : "";
		return () => {
			document.documentElement.style.overflow = "";
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: `fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled ? "backdrop-blur-md bg-[color-mix(in_oklab,var(--blush)_72%,transparent)] border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)]" : "bg-transparent"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setOpen(true),
						className: "group inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-blue transition hover:opacity-70",
						"aria-label": "Open menu",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {
							className: "h-4 w-4",
							"aria-hidden": true
						}), " Menu"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden gap-7 text-[13px] uppercase tracking-[0.22em] md:flex",
						children: LINKS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: l.to,
							className: "text-blue/80 hover:text-blue transition",
							children: l.label
						}, l.to))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "flex items-center justify-center",
					"aria-label": "Curated by MMJ home",
					children: logoErr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-[1.25rem] tracking-[-0.02em] text-blue",
						children: "MMJ"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo/logo.png",
						alt: "Curated by MMJ",
						className: "h-11 w-11 rounded-full object-cover ring-1 ring-[color-mix(in_oklab,var(--ink)_15%,transparent)]",
						onError: () => setLogoErr(true)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-end gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/account",
						className: "hidden text-[13px] uppercase tracking-[0.22em] text-blue/80 transition hover:text-blue md:inline",
						children: "Account"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: openCart,
						className: "group relative inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-blue transition hover:opacity-70",
						"aria-label": `Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
								className: "h-4 w-4 transition-transform group-hover:scale-110",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Cart"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1 text-[10px] font-medium text-white",
								children: itemCount
							})
						]
					})]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `fixed inset-0 z-50 transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "pointer-events-auto" : "pointer-events-none"}`,
		style: {
			clipPath: open ? "circle(150% at 8% 5%)" : "circle(0% at 8% 5%)",
			background: "var(--blush)"
		},
		"aria-hidden": !open,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-full w-full overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setOpen(false),
				className: "absolute right-8 top-7 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-blue hover:opacity-70",
				"aria-label": "Close menu",
				children: ["Close ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					className: "h-4 w-4",
					"aria-hidden": true
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full flex-col items-start justify-center gap-6 px-10 md:px-24",
				children: [[
					{
						to: "/",
						label: "Home"
					},
					...LINKS,
					{
						to: "/account",
						label: "Account"
					}
				].map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: l.to,
					onClick: () => setOpen(false),
					className: "font-display block text-[13vw] leading-[0.95] text-blue transition hover:translate-x-2 md:text-[9vw]",
					style: {
						opacity: open ? 1 : 0,
						transform: open ? "translateY(0)" : "translateY(40px)",
						transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${120 + i * 90}ms, transform 900ms cubic-bezier(0.16,1,0.3,1) ${120 + i * 90}ms`
					},
					children: l.label
				}, l.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 text-[12px] uppercase tracking-[0.3em] text-blue/60",
					children: "Curated by MMJ · Est. 2026"
				})]
			})]
		})
	})] });
}
gsapWithCSS.registerPlugin(ScrollTrigger);
/**
* Site-wide smooth scroll, bridged to GSAP ScrollTrigger so there is ONE scroll
* system: Lenis drives smoothing, gsap.ticker drives Lenis' RAF, and every Lenis
* scroll updates ScrollTrigger. Under reduced-motion, Lenis is skipped and
* ScrollTrigger falls back to native scroll (still works).
*/
function useLenis() {
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			ScrollTrigger.refresh();
			return;
		}
		const lenis = new Lenis({
			duration: 1.35,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			smoothWheel: true,
			touchMultiplier: 1.2
		});
		lenis.on("scroll", ScrollTrigger.update);
		const ticker = (time) => lenis.raf(time * 1e3);
		gsapWithCSS.ticker.add(ticker);
		gsapWithCSS.ticker.lagSmoothing(0);
		ScrollTrigger.refresh();
		return () => {
			gsapWithCSS.ticker.remove(ticker);
			lenis.off("scroll", ScrollTrigger.update);
			lenis.destroy();
		};
	}, []);
}
//#endregion
export { useLenis as n, Nav as t };
