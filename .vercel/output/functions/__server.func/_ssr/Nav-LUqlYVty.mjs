import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as ShoppingBag } from "../_libs/lucide-react.mjs";
import { i as cn } from "./Section-D4Eh4h5l.mjs";
import { n as useScroll, r as useMotionValueEvent } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Nav-LUqlYVty.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var linkClass = "text-caption uppercase tracking-caps text-ink/80 transition-colors ease-soft duration-(--duration-micro) hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
/**
* Sticky site nav — transparent at the top, softens to a blurred blush glass
* once scrolled. Links left, logo centered, cart right. (Menu + Account are
* intentionally omitted for the demo.)
* Logo: /brand/mmj-logo.png (falls back to a serif wordmark if missing).
*/
function Nav({ links, cartCount = 0, onCartClick, className }) {
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	const [logoFailed, setLogoFailed] = (0, import_react.useState)(false);
	const logoRef = (0, import_react.useRef)(null);
	const { scrollY } = useScroll();
	useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 48));
	(0, import_react.useEffect)(() => {
		const img = logoRef.current;
		if (img?.complete && img.naturalWidth === 0) setLogoFailed(true);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: cn("sticky inset-x-0 top-0 z-(--z-nav) border-b transition-[background-color,border-color,box-shadow,backdrop-filter] ease-soft duration-(--duration-slow)", scrolled ? "border-border bg-blush-glass shadow-card backdrop-blur-md" : "border-transparent bg-transparent", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "mx-auto grid max-w-wide grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-2 md:px-10",
			"aria-label": "Primary",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden items-center gap-7 md:flex",
					children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: link.to,
						className: linkClass,
						children: link.label
					}, link.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "col-start-2 flex min-h-11 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
					"aria-label": "Curated by MMJ home",
					children: logoFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-h3 text-ink",
						children: "MMJ"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						ref: logoRef,
						src: "/logo/logo.png",
						alt: "Curated by MMJ",
						className: "h-11 w-11 rounded-full object-cover ring-1 ring-border",
						onError: () => setLogoFailed(true)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onCartClick,
						className: cn(linkClass, "inline-flex min-h-11 cursor-pointer items-center gap-2"),
						"aria-label": `Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
								className: "h-4 w-4",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Cart"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1 text-caption text-white",
								children: cartCount
							})
						]
					})
				})
			]
		})
	});
}
//#endregion
export { Nav as t };
