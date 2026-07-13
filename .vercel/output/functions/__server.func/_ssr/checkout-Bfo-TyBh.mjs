import { o as __toESM } from "../_runtime.mjs";
import { n as useForm, r as require_react, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCart } from "./cart-DezqsbqO.mjs";
import { n as useLenis, t as Nav } from "./use-lenis-C-6CjMDK.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-Bfo-TyBh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var schema = objectType({
	email: stringType().email("Enter a valid email"),
	firstName: stringType().min(1, "Required"),
	lastName: stringType().min(1, "Required"),
	address: stringType().min(1, "Required"),
	city: stringType().min(1, "Required"),
	emirate: stringType().min(1, "Select an emirate"),
	delivery: enumType(["standard", "express"])
});
var EMIRATES = [
	"Abu Dhabi",
	"Dubai",
	"Sharjah",
	"Ajman",
	"Umm Al Quwain",
	"Ras Al Khaimah",
	"Fujairah"
];
var inputCls = "w-full rounded-2xl border border-blue/12 bg-white/55 px-4 py-3.5 text-[15px] text-blue placeholder:text-blue/25 outline-none transition focus:border-blue/35 focus:bg-white";
var errCls = "mt-1.5 text-[11px] text-red-500";
function CheckoutPage() {
	useLenis();
	const { items, subtotal, clear } = useCart();
	const [placed, setPlaced] = (0, import_react.useState)(false);
	const { register, handleSubmit, watch, formState: { errors } } = useForm({
		resolver: u(schema),
		defaultValues: { delivery: "standard" }
	});
	const delivery = watch("delivery");
	const shippingCost = delivery === "express" ? 35 : 0;
	const total = subtotal + shippingCost;
	const onSubmit = () => {
		clear();
		setPlaced(true);
	};
	if (placed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-blush text-blue",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-[80vh] flex-col items-center justify-center px-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue/8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						width: "28",
						height: "28",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2",
						className: "text-blue",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M20 6L9 17l-5-5",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-h2 text-blue",
					children: "Order placed."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 max-w-sm text-[16px] leading-[1.75] text-blue/55",
					children: "Your notebook is on its way. A confirmation will arrive shortly."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-10 inline-block rounded-full bg-blue px-8 py-4 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90",
					children: "Back to home"
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-blush text-blue",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-xl px-6 pt-32 pb-28 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/shop",
					className: "mb-10 inline-flex items-center gap-2 text-caption uppercase tracking-caps text-blue/40 transition hover:text-blue",
					children: "← Back to shop"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-h1 text-blue mb-14",
					children: "Checkout"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit(onSubmit),
					noValidate: true,
					className: "space-y-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-6 text-caption uppercase tracking-caps text-blue/40",
							children: "01 · Contact"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							...register("email"),
							type: "email",
							placeholder: "Email address",
							className: inputCls
						}), errors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: errCls,
							children: errors.email.message
						})] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-6 text-caption uppercase tracking-caps text-blue/40",
							children: "02 · Delivery address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										...register("firstName"),
										placeholder: "First name",
										className: inputCls
									}), errors.firstName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: errCls,
										children: errors.firstName.message
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										...register("lastName"),
										placeholder: "Last name",
										className: inputCls
									}), errors.lastName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: errCls,
										children: errors.lastName.message
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									...register("address"),
									placeholder: "Street address",
									className: inputCls
								}), errors.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: errCls,
									children: errors.address.message
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										...register("city"),
										placeholder: "City",
										className: inputCls
									}), errors.city && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: errCls,
										children: errors.city.message
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										...register("emirate"),
										className: inputCls,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Emirate"
										}), EMIRATES.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: e,
											children: e
										}, e))]
									}), errors.emirate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: errCls,
										children: errors.emirate.message
									})] })]
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-6 text-caption uppercase tracking-caps text-blue/40",
							children: "03 · Delivery method"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: [{
								value: "standard",
								label: "Standard delivery",
								sub: "3–5 business days",
								cost: "Free"
							}, {
								value: "express",
								label: "Express delivery",
								sub: "1–2 business days",
								cost: "AED 35"
							}].map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all",
								style: {
									borderColor: delivery === opt.value ? "var(--blue)" : "rgba(11,95,165,0.10)",
									background: delivery === opt.value ? "rgba(11,95,165,0.04)" : "rgba(255,255,255,0.55)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "radio",
										value: opt.value,
										...register("delivery"),
										className: "accent-blue"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-caption text-blue",
										children: opt.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-blue/45",
										children: opt.sub
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-caption text-blue",
									children: opt.cost
								})]
							}, opt.value))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-6 text-caption uppercase tracking-caps text-blue/40",
							children: "04 · Order review"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-3xl bg-white/55 p-6 ring-1 ring-blue/8",
							children: [items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-caption text-blue/35",
								children: "No items"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-4",
								children: items.map((item) => {
									const v = item.product.variants.find((vv) => vv.id === item.variantId);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: item.product.image,
												alt: item.product.title,
												className: "h-12 w-9 rounded-lg object-cover"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-caption text-blue",
													children: [
														item.product.title,
														" × ",
														item.quantity
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] text-blue/40",
													children: v?.title ?? item.product.colorLabel
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-caption text-blue",
												children: ["AED ", (v?.price ?? item.product.price) * item.quantity]
											})
										]
									}, `${item.product.handle}-${item.variantId}`);
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 space-y-2 border-t border-blue/10 pt-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-caption text-blue/50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["AED ", subtotal] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-caption text-blue/50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delivery" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: shippingCost === 0 ? "Free" : `AED ${shippingCost}` })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between pt-2 text-[15px] font-medium text-blue border-t border-blue/10",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["AED ", total] })]
									})
								]
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-6 text-caption uppercase tracking-caps text-blue/40",
							children: "05 · Payment"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-3xl border border-dashed border-blue/18 bg-white/35 px-8 py-10 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-caption text-blue/45",
								children: "Payment via Shopify — coming soon"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[11px] text-blue/25",
								children: "Secure checkout will be enabled at launch"
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "w-full rounded-full bg-blue py-5 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90",
							children: "Place order"
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { CheckoutPage as component };
