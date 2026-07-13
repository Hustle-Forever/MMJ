import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/design-tokens-CtT0s40Z.js
var import_jsx_runtime = require_jsx_runtime();
/**
* TEMPORARY preview route — visual audit of src/styles/tokens.css.
* Renders the token system only; imports no app components.
* Delete this file once the system is approved.
*/
var typeSteps = [
	{
		cls: "font-display text-display",
		token: "text-display",
		size: "clamp(3.5rem → 9rem)",
		sample: "Make it happen"
	},
	{
		cls: "font-display text-h1",
		token: "text-h1",
		size: "clamp(2.5rem → 5rem)",
		sample: "Hand-bound hardcovers"
	},
	{
		cls: "font-display text-h2",
		token: "text-h2",
		size: "clamp(2rem → 3.5rem)",
		sample: "Cream paper, satin ribbon"
	},
	{
		cls: "font-display text-h3",
		token: "text-h3",
		size: "clamp(1.5rem → 2.25rem)",
		sample: "Made to be returned to"
	},
	{
		cls: "font-script",
		token: "font-script · --type-script",
		size: "clamp(1.5rem → 2.5rem)",
		sample: "quietly expensive",
		style: { fontSize: "var(--type-script)" }
	},
	{
		cls: "text-lead",
		token: "text-lead",
		size: "clamp(1.125rem → 1.375rem)",
		sample: "A trio of notebooks in blush, ocean and sage — editorial paper goods for people who write things down."
	},
	{
		cls: "text-base",
		token: "text-base · --type-body",
		size: "1rem / 16px · lh 1.7",
		sample: "Body text is always the brand blue, never black. Generous line-height keeps long passages calm and readable, the way a well-set page should feel.",
		style: { lineHeight: "var(--leading-body)" }
	},
	{
		cls: "text-caption uppercase tracking-widest",
		token: "text-caption",
		size: "0.8125rem / 13px",
		sample: "Labels & meta only — never body"
	}
];
var swatches = [
	{
		name: "blush",
		varName: "--blush",
		hex: "#F8E6EC",
		note: "background — dominant identity"
	},
	{
		name: "blush-2",
		varName: "--blush-2",
		hex: "#F4D8DF",
		note: "accents, stripes, muted"
	},
	{
		name: "blue / ink",
		varName: "--blue",
		hex: "#0B5FA5",
		note: "ALL text, buttons, links"
	},
	{
		name: "white",
		varName: "--white",
		hex: "#FFFFFF",
		note: "cards, button text"
	},
	{
		name: "footer-pink",
		varName: "--footer-pink",
		hex: "#EFC9D4",
		note: "footer shift — large text only"
	}
];
var tints = [
	{
		name: "ink-70",
		varName: "--ink-70",
		note: "muted foreground"
	},
	{
		name: "ink-40",
		varName: "--ink-40",
		note: "disabled, placeholders"
	},
	{
		name: "ink-12",
		varName: "--ink-12",
		note: "borders"
	},
	{
		name: "blush-veil",
		varName: "--blush-veil",
		note: "glass panels"
	}
];
var spaces = [
	{
		name: "space-0-5",
		px: "4px — half-step, fine detail only"
	},
	{
		name: "space-1",
		px: "8px — base unit"
	},
	{
		name: "space-2",
		px: "16px"
	},
	{
		name: "space-3",
		px: "24px"
	},
	{
		name: "space-4",
		px: "32px"
	},
	{
		name: "space-5",
		px: "40px"
	},
	{
		name: "space-6",
		px: "48px"
	},
	{
		name: "space-8",
		px: "64px"
	},
	{
		name: "space-10",
		px: "80px"
	},
	{
		name: "space-12",
		px: "96px"
	},
	{
		name: "space-16",
		px: "128px"
	},
	{
		name: "space-20",
		px: "160px"
	},
	{
		name: "space-24",
		px: "192px"
	},
	{
		name: "space-section-sm",
		px: "clamp(64px → 96px)"
	},
	{
		name: "space-section",
		px: "clamp(96px → 192px)"
	}
];
var shadows = [
	{
		name: "shadow-card",
		cls: "shadow-card"
	},
	{
		name: "shadow-soft",
		cls: "shadow-soft"
	},
	{
		name: "shadow-lift",
		cls: "shadow-lift"
	},
	{
		name: "shadow-contact",
		cls: "shadow-contact"
	}
];
function SectionTitle({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-h3 mt-24 mb-8 border-b border-border pb-4",
		children
	});
}
function DesignTokens() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "bg-blush min-h-screen px-6 py-16 text-ink md:px-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-caption uppercase tracking-widest",
					children: "Curated by MMJ — token preview (temporary route)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-h1 mt-2",
					children: "Design system audit"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-lead mt-4 max-w-2xl",
					children: [
						"Everything on this page is rendered from",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded-sm bg-blush-2 px-1.5 py-0.5 text-[0.9em]",
							children: "src/styles/tokens.css"
						}),
						" ",
						"via Tailwind utilities. No component styles."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Type scale" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-12",
					children: typeSteps.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-caption mb-2 uppercase tracking-widest opacity-70",
						children: [
							t.token,
							" · ",
							t.size
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: t.cls,
						style: t.style,
						children: t.sample
					})] }, t.token))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Palette — locked, no hues outside this set" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5",
					children: swatches.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-card shadow-card overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-28 border-b border-border",
							style: { backgroundColor: `var(${s.varName})` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: s.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-caption font-mono mt-1",
									children: s.hex
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-caption mt-1 opacity-70",
									children: s.note
								})
							]
						})]
					}, s.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-caption mt-8 mb-3 uppercase tracking-widest opacity-70",
					children: "Derived tints — color-mix of locked hues only"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-4 lg:grid-cols-4",
					children: tints.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-card shadow-card overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-16 border-b border-border",
							style: { backgroundColor: `var(${s.varName})` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-caption font-medium",
								children: s.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-caption opacity-70",
								children: s.note
							})]
						})]
					}, s.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-blush p-5 border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: "Ink on blush"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-caption mt-1",
								children: "5.5 : 1 — AA body text"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-white p-5 shadow-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: "Ink on white"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-caption mt-1",
								children: "7.0 : 1 — AAA"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-footer-pink p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-lg font-medium",
								children: "Ink on footer-pink"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-caption mt-1",
								children: "4.4 : 1 — large text (≥18px) only"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Spacing — locked 8px scale" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg bg-card p-6 shadow-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-3",
						children: spaces.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-caption w-36 shrink-0 font-mono",
									children: s.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-4 shrink-0 rounded-sm bg-blue",
									style: { width: `var(--${s.name})` }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-caption shrink-0 opacity-70",
									children: s.px
								})
							]
						}, s.name))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Elevation & motion" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-6 lg:grid-cols-4",
					children: shadows.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `rounded-lg bg-card p-6 ${s.cls}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-caption font-mono",
							children: s.name
						})
					}, s.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-lg bg-card p-6 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-caption mb-4 uppercase tracking-widest opacity-70",
						children: "Hover the chips — micro 200ms / base 300ms / slow 500ms, ease-soft"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-4",
						children: [
							["duration-micro", "200ms"],
							["duration-base", "300ms"],
							["duration-slow", "500ms"]
						].map(([name, ms]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg bg-blush-2 px-6 py-4 ease-soft hover:-translate-y-2 hover:bg-blue hover:text-white hover:shadow-lift",
							style: {
								transitionDuration: `var(--${name})`,
								transitionProperty: "all"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-caption font-mono",
								children: [
									name,
									" · ",
									ms
								]
							})
						}, name))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-caption mt-24 pb-8 uppercase tracking-widest opacity-70",
					children: "Delete src/routes/design-tokens.tsx after sign-off."
				})
			]
		})
	});
}
//#endregion
export { DesignTokens as component };
