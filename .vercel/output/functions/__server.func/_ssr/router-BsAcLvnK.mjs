import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { c as HeadContent, d as Outlet, f as lazyRouteComponent, g as useRouter, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCart, t as CartProvider } from "./cart-DezqsbqO.mjs";
import { t as Route$9 } from "../_handle-Cz_hD1nJ.mjs";
import { i as Minus, n as ShoppingBag, r as Plus, t as X } from "../_libs/lucide-react.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BsAcLvnK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CartDrawer() {
	const { items, isOpen, closeCart, removeItem, updateQty, subtotal, itemCount } = useCart();
	(0, import_react.useEffect)(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: "fixed inset-0 bg-blue/8 backdrop-blur-sm transition-opacity ease-soft duration-(--duration-slow)",
		style: {
			opacity: isOpen ? 1 : 0,
			pointerEvents: isOpen ? "auto" : "none",
			zIndex: "var(--z-drawer)"
		},
		onClick: closeCart
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		"aria-label": "Shopping cart",
		"aria-hidden": !isOpen,
		className: "fixed inset-y-0 right-0 flex w-full max-w-md flex-col",
		style: {
			zIndex: "var(--z-drawer)",
			background: "color-mix(in oklab, var(--blush) 94%, var(--white))",
			backdropFilter: "blur(24px)",
			boxShadow: isOpen ? "-8px 0 64px -16px rgba(11,95,165,0.14)" : "none",
			transform: isOpen ? "translateX(0)" : "translateX(100%)",
			transition: "transform var(--duration-slow) var(--ease-soft)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-blue/10 px-6 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
						className: "h-4 w-4 text-blue",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-caption uppercase tracking-caps text-blue",
						children: [
							"Cart · ",
							itemCount,
							" ",
							itemCount === 1 ? "item" : "items"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: closeCart,
					className: "inline-flex h-8 w-8 items-center justify-center rounded-full text-blue/40 transition hover:text-blue",
					"aria-label": "Close cart",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "h-4 w-4",
						"aria-hidden": true
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto px-6 py-4",
				children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-full flex-col items-center justify-center gap-4 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
							className: "h-10 w-10 text-blue/15",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-caption text-blue/40",
							children: "Your cart is empty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: closeCart,
							className: "text-caption uppercase tracking-caps text-blue/50 underline-offset-4 hover:underline",
							children: "Continue shopping"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: items.map((item) => {
						const variant = item.product.variants.find((v) => v.id === item.variantId);
						const linePrice = (variant?.price ?? item.product.price) * item.quantity;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-4 rounded-2xl bg-white/60 p-4 ring-1 ring-blue/8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: item.product.image,
								alt: item.product.title,
								className: "h-16 w-12 rounded-lg object-cover",
								draggable: false
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-1 flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-caption font-medium text-blue",
										children: item.product.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-blue/40",
										children: variant?.title ?? item.product.colorLabel
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => removeItem(item.product.handle, item.variantId),
										className: "mt-0.5 text-blue/25 transition hover:text-blue",
										"aria-label": `Remove ${item.product.title}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
											className: "h-3 w-3",
											"aria-hidden": true
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex items-center gap-1 rounded-full bg-white/80 px-1 py-0.5 ring-1 ring-blue/10",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => updateQty(item.product.handle, item.variantId, item.quantity - 1),
												className: "flex h-6 w-6 items-center justify-center rounded-full text-blue/50 transition hover:text-blue",
												"aria-label": "Decrease quantity",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
													className: "h-3 w-3",
													"aria-hidden": true
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-[1.5rem] text-center text-caption text-blue",
												children: item.quantity
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => updateQty(item.product.handle, item.variantId, item.quantity + 1),
												className: "flex h-6 w-6 items-center justify-center rounded-full text-blue/50 transition hover:text-blue",
												"aria-label": "Increase quantity",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
													className: "h-3 w-3",
													"aria-hidden": true
												})
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-caption text-blue",
										children: ["AED ", linePrice]
									})]
								})]
							})]
						}, `${item.product.handle}-${item.variantId}`);
					})
				})
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 border-t border-blue/10 px-6 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-caption uppercase tracking-caps text-blue/50",
							children: "Subtotal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-h3 text-blue",
							children: ["AED ", subtotal]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/checkout",
						onClick: closeCart,
						className: "block w-full rounded-full bg-blue py-4 text-center text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90",
						children: "Checkout"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-[11px] text-blue/35",
						children: "Taxes and shipping calculated at checkout"
					})
				]
			})
		]
	})] });
}
var styles_default = "/assets/styles-B9NKn9JX.css";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		console.error("root error boundary:", error);
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$8 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Curated by MMJ — Notebooks" },
			{
				name: "author",
				content: "Curated by MMJ"
			},
			{
				name: "theme-color",
				content: "#f8e6ec"
			},
			{
				property: "og:site_name",
				content: "Curated by MMJ"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/logo/logo.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/logo/logo.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600&family=Dancing+Script:wght@500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$8.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CartProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartDrawer, {})] })
	});
}
var $$splitComponentImporter$7 = () => import("./primitives-B5kMA3Rq.mjs");
/**
* TEMPORARY preview route — visual audit of the core primitives.
* Uses only the primitives + token utilities; touches no app pages.
* Delete this file once the primitives are approved.
*/
var Route$7 = createFileRoute("/primitives")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	head: () => ({ meta: [{ title: "Primitives — Curated by MMJ" }, {
		name: "robots",
		content: "noindex"
	}] })
});
var $$splitComponentImporter$6 = () => import("./journal-CwevWIzR.mjs");
var Route$6 = createFileRoute("/journal")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	head: () => ({ meta: [{ title: "Journal · Curated by MMJ — Notebooks" }] })
});
var $$splitComponentImporter$5 = () => import("./hero-preview-C29xy9Q1.mjs");
/**
* TEMPORARY preview route — shows the rebuilt Hero in isolation with the Nav
* overlaid, exactly as it will sit on the home page. Delete after sign-off.
*/
var Route$5 = createFileRoute("/hero-preview")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	head: () => ({ meta: [{ title: "Hero preview — Curated by MMJ" }, {
		name: "robots",
		content: "noindex"
	}] })
});
var $$splitComponentImporter$4 = () => import("./design-tokens-CtT0s40Z.mjs");
/**
* TEMPORARY preview route — visual audit of src/styles/tokens.css.
* Renders the token system only; imports no app components.
* Delete this file once the system is approved.
*/
var Route$4 = createFileRoute("/design-tokens")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: () => ({ meta: [{ title: "Design Tokens — Curated by MMJ" }, {
		name: "robots",
		content: "noindex"
	}] })
});
var $$splitComponentImporter$3 = () => import("./checkout-Bfo-TyBh.mjs");
objectType({
	email: stringType().email("Enter a valid email"),
	firstName: stringType().min(1, "Required"),
	lastName: stringType().min(1, "Required"),
	address: stringType().min(1, "Required"),
	city: stringType().min(1, "Required"),
	emirate: stringType().min(1, "Select an emirate"),
	delivery: enumType(["standard", "express"])
});
var Route$3 = createFileRoute("/checkout")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [{ title: "Checkout · Curated by MMJ — Notebooks" }] })
});
var $$splitComponentImporter$2 = () => import("./account-BAToKCuh.mjs");
var Route$2 = createFileRoute("/account")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: () => ({ meta: [{ title: "Account · Curated by MMJ — Notebooks" }] })
});
var $$splitComponentImporter$1 = () => import("./routes-C7NoFEfJ.mjs");
var Route$1 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({
		meta: [
			{ title: "Curated by MMJ — Notebooks" },
			{
				name: "description",
				content: "Hand-bound hardcover notebooks in blush pink, ocean blue and sage green. Editorial paper goods, quietly expensive. Curated by MMJ."
			},
			{
				property: "og:title",
				content: "Curated by MMJ — Make it happen"
			},
			{
				property: "og:description",
				content: "A trio of hand-bound hardcover notebooks. Cream paper, satin ribbon, made to be returned to."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:url",
				content: "/"
			}
		],
		links: [{
			rel: "canonical",
			href: "/"
		}]
	})
});
var $$splitComponentImporter = () => import("./shop-B_aRV1of.mjs");
var Route = createFileRoute("/shop/")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [{ title: "Shop · Curated by MMJ — Notebooks" }, {
		name: "description",
		content: "Shop the Curated by MMJ notebook collection."
	}] })
});
var PrimitivesRoute = Route$7.update({
	id: "/primitives",
	path: "/primitives",
	getParentRoute: () => Route$8
});
var JournalRoute = Route$6.update({
	id: "/journal",
	path: "/journal",
	getParentRoute: () => Route$8
});
var HeroPreviewRoute = Route$5.update({
	id: "/hero-preview",
	path: "/hero-preview",
	getParentRoute: () => Route$8
});
var DesignTokensRoute = Route$4.update({
	id: "/design-tokens",
	path: "/design-tokens",
	getParentRoute: () => Route$8
});
var CheckoutRoute = Route$3.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => Route$8
});
var AccountRoute = Route$2.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => Route$8
});
var IndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var ShopIndexRoute = Route.update({
	id: "/shop/",
	path: "/shop/",
	getParentRoute: () => Route$8
});
var rootRouteChildren = {
	IndexRoute,
	AccountRoute,
	CheckoutRoute,
	DesignTokensRoute,
	HeroPreviewRoute,
	JournalRoute,
	PrimitivesRoute,
	ShopHandleRoute: Route$9.update({
		id: "/shop/$handle",
		path: "/shop/$handle",
		getParentRoute: () => Route$8
	}),
	ShopIndexRoute
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
