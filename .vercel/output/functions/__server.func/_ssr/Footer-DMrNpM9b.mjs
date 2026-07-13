import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { o as Instagram } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Footer-DMrNpM9b.js
var import_jsx_runtime = require_jsx_runtime();
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "relative overflow-hidden pt-24",
		style: { background: "var(--footer-pink)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-x-0 top-1/2 h-24",
				style: {
					background: "linear-gradient(180deg, transparent, rgba(11,95,165,0.08), transparent)",
					animation: "sheen-drift 28s ease-in-out infinite alternate"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply",
				style: { backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-[1600px] px-6 md:px-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-3xl rounded-[22px] bg-white/60 p-8 shadow-[0_30px_60px_-30px_rgba(11,95,165,0.4)] ring-1 ring-white/60 backdrop-blur-lg md:p-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.35em] text-blue/70",
								children: "Letters from MMJ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-display mt-3 text-3xl leading-tight text-blue md:text-4xl",
								children: "A short note, once a month."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-6 flex flex-col gap-3 sm:flex-row",
								onSubmit: (e) => e.preventDefault(),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "nl-email",
										className: "sr-only",
										children: "Email address"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "nl-email",
										type: "email",
										placeholder: "your@email.com",
										className: "flex-1 rounded-full border border-blue/20 bg-white/80 px-5 py-3 text-[14px] text-blue outline-none placeholder:text-blue/40 focus:border-blue"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										className: "rounded-full bg-blue px-7 py-3 text-[12px] uppercase tracking-[0.25em] text-white transition hover:opacity-90",
										children: "Subscribe"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-24 select-none text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-script text-[22vw] leading-[0.85] text-blue md:text-[16vw]",
							children: "Curated"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display -mt-2 text-[9vw] uppercase tracking-[0.2em] text-blue md:text-[6vw]",
							children: "BY MMJ"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-16 flex flex-col items-center justify-between gap-6 border-t border-blue/15 py-8 text-[11px] uppercase tracking-[0.3em] text-blue/70 md:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" Curated by MMJ. All rights reserved."
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									"aria-label": "Instagram",
									className: "transition hover:text-blue",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									className: "hover:text-blue transition",
									children: "Shipping"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									className: "hover:text-blue transition",
									children: "Contact"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									className: "hover:text-blue transition",
									children: "Privacy"
								})
							]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { Footer as t };
