import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { t as products } from "./products-CdxBBAAx.mjs";
import { t as ScrollTrigger } from "../_libs/gsap.mjs";
import { n as useLenis, t as Nav } from "./use-lenis-C-6CjMDK.mjs";
import { n as hasWebGL, t as detect3DTier } from "./detect-3d-D0Cce_PE.mjs";
import { t as Footer } from "./Footer-DMrNpM9b.mjs";
import { t as useInView } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as Hero } from "./Hero-e4GXsPfI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C7NoFEfJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ShowcaseScene = (0, import_react.lazy)(() => import("./ShowcaseScene-CqUmCJR_.mjs"));
var MOBILE_TIER_MIN = 2;
var MORPH = [
	[
		11,
		95,
		165
	],
	[
		11,
		95,
		165
	],
	[
		11,
		95,
		165
	]
];
function morphColor(p) {
	const seg = Math.min(2, Math.floor(p * 3));
	const t = p * 3 - seg;
	const a = MORPH[seg];
	const b = MORPH[(seg + 1) % 3];
	const mix = (i) => Math.round(a[i] + (b[i] - a[i]) * t);
	return `rgb(${mix(0)} ${mix(1)} ${mix(2)})`;
}
function tri(p, c, w) {
	const d = Math.abs(p - c);
	return d >= w ? 0 : 1 - d / w;
}
function coverOpacities(p) {
	return [
		Math.max(tri(p, 0, 1 / 3), tri(p, 1, 1 / 3)),
		tri(p, 1 / 3, 1 / 3),
		tri(p, 2 / 3, 1 / 3)
	];
}
var CanvasErrorBoundary = class extends import_react.Component {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	render() {
		return this.state.failed ? null : this.props.children;
	}
};
/**
* Signature 360° scroll story. One scroll system (Lenis → ScrollTrigger): a
* scrubbed timeline spins the 3D book 3×360° while the cover crossfades
* Pink → Blue → Green → Pink and the side heading morphs color to match.
* The flat crossfade is the always-visible base; the 3D book overlays it and
* hides it only once confirmed rendering (reliability).
*/
function Showcase() {
	const sectionRef = (0, import_react.useRef)(null);
	const copyRef = (0, import_react.useRef)(null);
	const imgRefs = (0, import_react.useRef)([]);
	const progress = (0, import_react.useRef)(0);
	const [activeIndex, setActiveIndex] = (0, import_react.useState)(0);
	const [use3D, setUse3D] = (0, import_react.useState)(false);
	const [lowPower, setLowPower] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
		const desktop = window.matchMedia("(min-width: 768px)");
		let cancelled = false;
		(async () => {
			const force = new URLSearchParams(window.location.search).get("force3d");
			if (force === "0" || reduce.matches) return;
			if (force === "1" || desktop.matches) {
				if (!cancelled) {
					setLowPower(force === "1" ? !desktop.matches : false);
					setUse3D(hasWebGL());
				}
				return;
			}
			const tier = await detect3DTier();
			if (cancelled) return;
			setLowPower(true);
			setUse3D(tier >= MOBILE_TIER_MIN);
		})();
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const el = sectionRef.current;
		if (!el) return;
		const apply = (p) => {
			progress.current = p;
			copyRef.current?.style.setProperty("--morph", morphColor(p));
			const o = coverOpacities(p);
			imgRefs.current.forEach((im, i) => {
				if (im) im.style.opacity = String(o[i]);
			});
			const idx = p < .28 ? 0 : p < .55 ? 1 : p < .86 ? 2 : 0;
			setActiveIndex((cur) => cur === idx ? cur : idx);
		};
		const st = ScrollTrigger.create({
			trigger: el,
			start: "top top",
			end: "bottom bottom",
			scrub: true,
			onUpdate: (self) => apply(self.progress)
		});
		apply(0);
		return () => st.kill();
	}, []);
	const active = products[activeIndex];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		ref: sectionRef,
		className: "relative w-full",
		style: { height: "340vh" },
		"aria-label": "Signature showcase",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sticky top-0 flex h-[100dvh] w-full items-center overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 grid h-full w-full grid-cols-1 items-center gap-8 px-6 md:grid-cols-12 md:px-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: copyRef,
					className: "md:col-span-4",
					style: { ["--morph"]: "rgb(11 95 165)" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-caption uppercase tracking-caps text-blue/60",
							children: "The Collection"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display leading-[0.9]",
							style: {
								fontSize: "clamp(2.75rem, 8vw, 4.5rem)",
								color: "var(--morph)",
								animation: "mask-up 900ms cubic-bezier(0.16,1,0.3,1) both"
							},
							children: active.name
						}, active.slug),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-md text-pretty leading-[1.7] text-blue/75",
							style: { animation: "mask-up 1100ms cubic-bezier(0.16,1,0.3,1) 100ms both" },
							children: active.description
						}, `${active.slug}-d`),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-caption text-blue/70",
							children: active.specs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-blue/15 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[10px] uppercase tracking-[0.25em] text-blue/50",
									children: s.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 text-blue",
									children: s.value
								})]
							}, s.label))
						}, `${active.slug}-s`),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "mt-8 inline-flex min-h-11 items-center gap-3 rounded-full px-7 text-caption uppercase tracking-caps text-white transition-opacity ease-soft duration-(--duration-micro) hover:opacity-90",
							style: { background: "var(--morph)" },
							children: [
								"Shop ",
								active.name,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "→"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative md:col-span-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto",
						style: {
							height: "clamp(240px, 52svh, 560px)",
							width: "min(85vw, 560px)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
							style: { opacity: ready ? 0 : 1 },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative h-[80%] w-[62%]",
								style: { filter: "drop-shadow(0 40px 52px color-mix(in oklab, var(--blue) 14%, transparent))" },
								children: products.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									ref: (el) => {
										imgRefs.current[i] = el;
									},
									src: p.image,
									alt: `${p.name} notebook`,
									draggable: false,
									className: "absolute inset-0 h-full w-full rounded-md object-contain",
									style: { opacity: i === 0 ? 1 : 0 }
								}, p.slug))
							})
						}), use3D && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: null,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShowcaseScene, {
									progress,
									lowPower,
									onReady: () => setReady(true)
								})
							})
						}) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex items-center justify-center gap-3",
						children: products.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-[2px] w-10 rounded-full transition-all",
							style: { background: i === activeIndex ? "var(--blue)" : "rgba(11,95,165,0.2)" }
						}, p.slug))
					})]
				})]
			})
		})
	});
}
var ease = [
	.16,
	1,
	.3,
	1
];
var line = {
	hidden: {
		y: "108%",
		opacity: 0
	},
	visible: (delay) => ({
		y: 0,
		opacity: 1,
		transition: {
			duration: 1.1,
			ease,
			delay
		}
	})
};
var fadeUp = {
	hidden: {
		opacity: 0,
		y: 20
	},
	visible: (delay) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: .8,
			ease,
			delay
		}
	})
};
function Editorial() {
	const ref = (0, import_react.useRef)(null);
	const inView = useInView(ref, {
		once: true,
		amount: .25
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref,
		className: "relative overflow-hidden bg-blush py-32 md:py-48",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1600px] px-6 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
					custom: 0,
					variants: fadeUp,
					initial: "hidden",
					animate: inView ? "visible" : "hidden",
					className: "mb-8 text-[11px] uppercase tracking-[0.4em] text-blue/60",
					children: "Editorial · No. 001"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-balance text-[13vw] leading-[0.92] text-blue md:text-[8.5vw]",
					"aria-label": "Paper that listens. Ink that remembers.",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block overflow-hidden pb-[0.05em]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.span, {
							className: "block",
							custom: .1,
							variants: line,
							initial: "hidden",
							animate: inView ? "visible" : "hidden",
							children: [
								"Paper that",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-script italic",
									children: "listens."
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block overflow-hidden pb-[0.05em]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.span, {
							className: "block",
							custom: .28,
							variants: line,
							initial: "hidden",
							animate: inView ? "visible" : "hidden",
							children: [
								"Ink that",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-script italic",
									children: "remembers."
								})
							]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-16 grid grid-cols-1 gap-10 md:grid-cols-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						custom: .45,
						variants: fadeUp,
						initial: "hidden",
						animate: inView ? "visible" : "hidden",
						className: "text-pretty text-[16px] leading-[1.75] text-blue/75 md:col-span-5 md:col-start-2",
						children: "Every notebook is bound by hand. Cream 120gsm pages take fountain ink without bleeding, a satin ribbon marks your place, and a quiet script on the cover reminds you why you started."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						custom: .58,
						variants: fadeUp,
						initial: "hidden",
						animate: inView ? "visible" : "hidden",
						className: "text-pretty text-[16px] leading-[1.75] text-blue/75 md:col-span-4 md:col-start-8",
						children: "This is not a productivity tool. It's a slower object — made for morning pages, first drafts, and the sentence you'll return to three weeks from now."
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-24 overflow-hidden whitespace-nowrap border-y border-blue/15 py-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "marquee-track inline-flex gap-16 pl-16 font-display text-[8vw] leading-none text-blue/85 md:text-[5vw]",
				children: Array.from({ length: 2 }).map((_, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Make it happen" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-script italic opacity-60",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Written by hand" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-script italic opacity-60",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bound in linen" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-script italic opacity-60",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Curated by MMJ" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-script italic opacity-60",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo/logo.png",
							alt: "",
							"aria-hidden": true,
							className: "inline-block h-[0.85em] w-[0.85em] flex-shrink-0 rounded-full object-cover align-middle opacity-90"
						})
					]
				}, k))
			})
		})]
	});
}
/**
* Video section — Curated by MMJ.
* Autoplay, muted, looping inline video. No overlay, no controls.
* Blush-stripe backdrop + mouse-follow spotlight from the hero, faded softly.
*
* Drop the film file at public/video/film.mp4 — the element is ready.
* If the file 404s on Vercel, move it to src/assets/video/ and import it
* as a bundled asset (same pattern as the cover images).
*/
function Film() {
	const glowRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = glowRef.current;
		if (!el) return;
		const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!fine || reduce) return;
		let tx = 50, ty = 50, cx = 50, cy = 50, raf = 0;
		const onMove = (e) => {
			const r = el.closest("section").getBoundingClientRect();
			tx = (e.clientX - r.left) / r.width * 100;
			ty = (e.clientY - r.top) / r.height * 100;
		};
		const tick = () => {
			cx += (tx - cx) * .06;
			cy += (ty - cy) * .06;
			el.style.setProperty("--fx", `${cx}%`);
			el.style.setProperty("--fy", `${cy}%`);
			raf = requestAnimationFrame(tick);
		};
		window.addEventListener("mousemove", onMove, { passive: true });
		raf = requestAnimationFrame(tick);
		return () => {
			window.removeEventListener("mousemove", onMove);
			cancelAnimationFrame(raf);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative overflow-hidden py-24 md:py-40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"aria-hidden": true,
			className: "pointer-events-none absolute inset-0 -z-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-55",
				style: {
					backgroundImage: "repeating-linear-gradient(90deg, var(--blush) 0, var(--blush) 48px, var(--blush-2) 48px, var(--blush-2) 96px)",
					maskImage: "radial-gradient(75% 65% at 50% 50%, #000 0%, transparent 100%)",
					WebkitMaskImage: "radial-gradient(75% 65% at 50% 50%, #000 0%, transparent 100%)"
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: glowRef,
				className: "absolute inset-0",
				style: {
					"--fx": "50%",
					"--fy": "50%",
					background: "radial-gradient(36vmax 36vmax at var(--fx) var(--fy), color-mix(in oklab, var(--white) 48%, transparent) 0%, transparent 68%)",
					mixBlendMode: "soft-light"
				}
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1400px] px-6 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[11px] uppercase tracking-[0.4em] text-blue/55",
					children: "Curated by MMJ · The Film"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-[9vw] leading-[0.95] text-blue md:text-[4vw]",
					children: "Make it happen."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[16/9] w-full overflow-hidden rounded-[28px] ring-1 ring-blue/8",
				style: {
					background: "linear-gradient(145deg, var(--blush-2) 0%, var(--blush) 50%, var(--white) 100%)",
					boxShadow: "0 48px 88px -28px rgba(11,95,165,0.22), 0 1px 0 rgba(255,255,255,0.65) inset"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					className: "absolute inset-0 h-full w-full object-cover",
					autoPlay: true,
					muted: true,
					loop: true,
					playsInline: true,
					src: "/video/vid.mp4"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": true,
					className: "pointer-events-none absolute inset-x-0 top-0 h-[38%]",
					style: { background: "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)" }
				})]
			})]
		})]
	});
}
var notes = [
	{
		quote: "It feels like something my grandmother would have owned — but sharper. The paper is worth the wait.",
		who: "Amelia R.",
		where: "London"
	},
	{
		quote: "I bought the blue one for meetings and ended up writing poetry in it. That's the whole review.",
		who: "Noor S.",
		where: "Dubai"
	},
	{
		quote: "Wrapped like a gift. Reads like a promise. My third one already.",
		who: "Julia M.",
		where: "Milan"
	}
];
function Testimonials() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative overflow-hidden py-24 md:py-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1400px] px-6 md:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-[11px] uppercase tracking-[0.4em] text-blue/60",
					children: "From the desk of"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display max-w-3xl text-[9vw] leading-[0.95] text-blue md:text-[4vw]",
					children: "Held, filled, returned to."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-14 grid grid-cols-1 gap-6 md:grid-cols-3",
					children: notes.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
						className: "group relative rounded-[18px] bg-white p-8 ring-1 ring-blue/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_rgba(11,95,165,0.35)]",
						style: { transform: `rotate(${i === 1 ? 0 : i === 0 ? -.6 : .6}deg)` },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-script text-4xl leading-none text-blue/40",
								children: "\""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
								className: "mt-2 text-pretty text-[15px] leading-[1.7] text-blue/85",
								children: n.quote
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
								className: "mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-blue/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n.who }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n.where })]
							})
						]
					}, n.who))
				})
			]
		})
	});
}
function Home() {
	useLenis();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-screen bg-blush text-blue",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Showcase, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editorial, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Testimonials, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { Home as component };
