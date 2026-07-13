import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { n as ShoppingBag } from "../_libs/lucide-react.mjs";
import { n as Container, r as Section, t as Button } from "./Section-D4Eh4h5l.mjs";
import { t as Nav } from "./Nav-LUqlYVty.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/primitives-B5kMA3Rq.js
var import_jsx_runtime = require_jsx_runtime();
/**
* TEMPORARY preview route — visual audit of the core primitives.
* Uses only the primitives + token utilities; touches no app pages.
* Delete this file once the primitives are approved.
*/
var NAV_LINKS = [
	{
		to: "/shop",
		label: "Shop"
	},
	{
		to: "/journal",
		label: "Journal"
	},
	{
		to: "/about",
		label: "About"
	}
];
function Caption({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-caption mb-3 uppercase tracking-caps text-muted-foreground",
		children
	});
}
function Primitives() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-blush text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {
				links: NAV_LINKS,
				cartCount: 2
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				rhythm: "compact",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Caption, { children: "Primitives preview (temporary route) — scroll to see the nav soften; the Menu button opens the FullscreenMenu" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-h1",
						children: "Core primitives"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lead mt-4 max-w-2xl",
						children: "Button, Section, Container, Nav and FullscreenMenu — token-fed, typed, mobile-first. Nothing on this page uses a raw color, size or easing."
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				bg: "white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Caption, { children: "Button — primary + quiet, size pill (min 44px tap target), hover lift on ease-soft" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							size: "pill",
							children: "Shop now"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							size: "pill",
							children: "Learn more"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "primary",
							size: "pill",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { "aria-hidden": true }), " Add to cart"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							size: "pill",
							disabled: true,
							children: "Sold out"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							size: "pill",
							disabled: true,
							children: "Unavailable"
						})
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Container, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Caption, { children: "Container — three widths, responsive side padding (24px → 40px)" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-4",
				children: [
					"narrow",
					"default",
					"wide"
				].map((width) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Container, {
					width,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-dashed border-ring/40 bg-white px-6 py-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-caption font-mono",
							children: [
								"width=\"",
								width,
								"\"",
								width === "narrow" && " · max-w-3xl — prose, checkout",
								width === "default" && " · max-w-7xl — standard sections",
								width === "wide" && " · max-w-wide (1600px) — hero, editorial"
							]
						})
					})
				}, width))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				bg: "blush-2",
				className: "border-y border-dashed border-ring/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Caption, { children: "Section — rhythm=\"default\" (py-section: clamp 96px → 192px)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-h2",
					children: "This band breathes the full section rhythm."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				bg: "white",
				rhythm: "compact",
				className: "border-b border-dashed border-ring/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Caption, { children: "Section — rhythm=\"compact\" (py-section-sm: clamp 64px → 96px)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-h3",
					children: "Tighter band for secondary moments."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				as: "footer",
				bg: "footer-pink",
				rhythm: "compact",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Caption, { children: "Section as=\"footer\" bg=\"footer-pink\" — large text only on this hue" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-h2",
						children: "Curated by MMJ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-caption mt-8 uppercase tracking-caps",
						children: "Delete src/routes/primitives.tsx after sign-off."
					})
				] })
			})
		]
	});
}
//#endregion
export { Primitives as component };
