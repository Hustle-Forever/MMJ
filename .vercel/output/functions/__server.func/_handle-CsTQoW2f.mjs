import { o as __toESM } from "./_runtime.mjs";
import { r as require_react } from "./_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "./_libs/@react-three/drei+[...].mjs";
import { h as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as useCart } from "./_ssr/cart-DezqsbqO.mjs";
import { t as products } from "./_ssr/products-CdxBBAAx.mjs";
import { t as Route } from "./_handle-Cz_hD1nJ.mjs";
import { n as useLenis, t as Nav } from "./_ssr/use-lenis-C-6CjMDK.mjs";
import { n as hasWebGL } from "./_ssr/detect-3d-D0Cce_PE.mjs";
import { t as Footer } from "./_ssr/Footer-DMrNpM9b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_handle-CsTQoW2f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Scene = (0, import_react.lazy)(() => import("./_ssr/Scene-CUdzidQ6.mjs"));
var COLOR_MAP = {
	"blush-pink": "pink",
	"ocean-blue": "blue",
	"sage-green": "green"
};
function ProductPage() {
	useLenis();
	const { handle } = Route.useParams();
	const product = products.find((p) => p.handle === handle);
	const { addItem } = useCart();
	const [variantId, setVariantId] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)(1);
	const [added, setAdded] = (0, import_react.useState)(false);
	const [use3D, setUse3D] = (0, import_react.useState)(false);
	const [ready3D, setReady3D] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (product) setVariantId(product.variants[0]?.id ?? "");
	}, [product]);
	(0, import_react.useEffect)(() => {
		if (window.matchMedia("(min-width: 768px)").matches) setUse3D(hasWebGL());
	}, []);
	if (!product) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-blush text-blue",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-[80vh] flex-col items-center justify-center text-center px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-h2 text-blue",
				children: "Product not found"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/shop",
				className: "mt-6 text-caption uppercase tracking-caps text-blue/50 underline-offset-4 hover:underline",
				children: "← Back to shop"
			})]
		})]
	});
	const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
	const notebookColor = COLOR_MAP[product.handle] ?? "pink";
	const handleAdd = () => {
		addItem(product, variantId, qty);
		setAdded(true);
		setTimeout(() => setAdded(false), 2200);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-blush text-blue",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-[1400px] px-6 pt-32 pb-24 md:px-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/shop",
					className: "mb-12 inline-flex items-center gap-2 text-caption uppercase tracking-caps text-blue/40 transition hover:text-blue",
					children: "← The Collection"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 items-start gap-12 md:grid-cols-2 lg:gap-20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto max-w-[480px] overflow-hidden rounded-3xl",
						style: {
							background: `color-mix(in oklab, ${product.hex} 12%, var(--blush))`,
							height: "clamp(360px, 55vw, 600px)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: product.image,
							alt: product.title,
							draggable: false,
							className: "absolute inset-0 h-full w-full object-contain p-12 transition-opacity duration-500",
							style: {
								opacity: ready3D ? 0 : 1,
								filter: "drop-shadow(0 32px 40px rgba(11,95,165,0.14))"
							}
						}), use3D && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: null,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 p-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {
									color: notebookColor,
									onReady: () => setReady3D(true)
								})
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 flex items-center justify-center gap-4",
						children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop/$handle",
							params: { handle: p.handle },
							className: "h-8 w-8 rounded-full transition-transform hover:scale-110",
							style: {
								background: p.hex,
								boxShadow: p.handle === handle ? `0 0 0 2px var(--white), 0 0 0 4px var(--blue)` : "0 0 0 1px rgba(11,95,165,0.2)"
							},
							"aria-label": `View ${p.colorLabel}`
						}, p.handle))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-caption uppercase tracking-caps text-blue/40",
							children: "Curated by MMJ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-h1 text-blue",
							children: product.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 font-display text-h3 text-blue",
							children: ["AED ", variant?.price ?? product.price]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 text-[16px] leading-[1.75] text-blue/65",
							children: product.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-blue/10 pt-8",
							children: product.specs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[10px] uppercase tracking-[0.25em] text-blue/35",
								children: s.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-caption text-blue",
								children: s.value
							})] }, s.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex items-center gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-caption uppercase tracking-caps text-blue/40",
								children: "Qty"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 rounded-full bg-white/60 px-1 py-1 ring-1 ring-blue/10",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setQty((q) => Math.max(1, q - 1)),
										className: "flex h-8 w-8 items-center justify-center rounded-full text-blue/50 transition hover:text-blue",
										"aria-label": "Decrease quantity",
										children: "–"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-8 text-center text-caption text-blue",
										children: qty
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setQty((q) => q + 1),
										className: "flex h-8 w-8 items-center justify-center rounded-full text-blue/50 transition hover:text-blue",
										"aria-label": "Increase quantity",
										children: "+"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleAdd,
							className: "mt-6 w-full rounded-full py-4 text-caption uppercase tracking-caps text-white transition-all duration-(--duration-base)",
							style: { background: added ? "color-mix(in oklab, var(--blue) 65%, var(--white))" : "var(--blue)" },
							children: added ? "Added ✓" : "Add to Cart"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-center text-[11px] text-blue/30",
							children: "Free shipping · Handcrafted in the UAE"
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { ProductPage as component };
