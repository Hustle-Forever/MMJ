import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as products } from "./products-CdxBBAAx.mjs";
import { n as useLenis, t as Nav } from "./use-lenis-C-6CjMDK.mjs";
import { t as Footer } from "./Footer-DMrNpM9b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-B_aRV1of.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductCard({ product: p }) {
	const [hovered, setHovered] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/shop/$handle",
		params: { handle: p.handle },
		className: "group block",
		onMouseEnter: () => setHovered(true),
		onMouseLeave: () => setHovered(false),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative overflow-hidden rounded-3xl",
			style: {
				background: `color-mix(in oklab, ${p.hex} 14%, var(--blush))`,
				transition: "box-shadow 400ms cubic-bezier(0.16,1,0.3,1), transform 400ms cubic-bezier(0.16,1,0.3,1)",
				boxShadow: hovered ? "0 32px 64px -16px rgba(11,95,165,0.20)" : "0 4px 20px rgba(11,95,165,0.06)",
				transform: hovered ? "translateY(-6px)" : "translateY(0)"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex aspect-[3/4] items-center justify-center px-10 pt-16 pb-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: p.image,
					alt: `${p.title} notebook`,
					className: "h-full w-auto max-w-full object-contain",
					draggable: false,
					style: {
						filter: "drop-shadow(0 24px 32px rgba(11,95,165,0.16))",
						transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)",
						transform: hovered ? "scale(1.05) translateY(-4px)" : "scale(1) translateY(0)"
					}
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 h-14 overflow-hidden",
				style: { background: `color-mix(in oklab, ${p.hex} 22%, var(--white))` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute inset-0 flex items-center justify-center text-caption uppercase tracking-caps text-blue",
					style: {
						transform: hovered ? "translateY(0)" : "translateY(100%)",
						transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)"
					},
					children: "Shop →"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute inset-0 flex items-center justify-center text-caption uppercase tracking-caps text-blue/50",
					style: {
						transform: hovered ? "translateY(-100%)" : "translateY(0)",
						transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)"
					},
					children: p.colorLabel
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 px-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-h3 text-blue",
				children: p.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-caption text-blue/50",
				children: ["AED ", p.price]
			})]
		})]
	});
}
function ShopPage() {
	useLenis();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-blush text-blue",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-[1600px] px-6 pt-40 pb-24 md:px-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-caption uppercase tracking-caps text-blue/50",
							children: "Curated by MMJ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-h1 text-blue",
							children: "The Collection"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-md text-[16px] leading-[1.75] text-blue/65",
							children: "Three hardcover notebooks. Cream pages, satin ribbon, and a quiet script that reminds you why you started."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3",
					children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.handle))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { ShopPage as component };
