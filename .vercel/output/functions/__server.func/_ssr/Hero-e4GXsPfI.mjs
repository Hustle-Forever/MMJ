import { o as __toESM } from "../_runtime.mjs";
import { t as cover_pink_front_default } from "./cover_pink_front-BbP_pvR6.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { n as hasWebGL, t as detect3DTier } from "./detect-3d-D0Cce_PE.mjs";
import { n as Container, r as Section, t as Button } from "./Section-D4Eh4h5l.mjs";
import { a as MotionConfig } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Hero-e4GXsPfI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function readVar(name) {
	if (typeof document === "undefined") return "";
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
/** Duration token in seconds (motion/react's unit). */
function tokenSeconds(name, ssrFallback) {
	const raw = readVar(name);
	if (raw.endsWith("ms")) return parseFloat(raw) / 1e3;
	if (raw.endsWith("s")) return parseFloat(raw);
	return ssrFallback;
}
/** Easing token as a cubic-bezier array (motion/react's format). */
function tokenEase(name, ssrFallback) {
	const match = readVar(name).match(/cubic-bezier\(([^)]+)\)/);
	if (!match) return ssrFallback;
	const points = match[1].split(",").map(Number);
	return points.length === 4 && points.every(Number.isFinite) ? points : ssrFallback;
}
/**
* Hero backdrop — clean straight vertical satin stripes (blush / blush-2) with
* a soft radial spotlight. On desktop (fine pointer, motion allowed) the
* spotlight eases toward the cursor; on touch / reduced-motion it stays static.
* The stripes never move — only the light does. Tokens only.
*/
function HeroBackground() {
	const glowRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = glowRef.current;
		if (!el) return;
		const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!fine || reduce) return;
		let tx = 50;
		let ty = 30;
		let cx = 50;
		let cy = 30;
		let raf = 0;
		const onMove = (e) => {
			tx = e.clientX / window.innerWidth * 100;
			ty = e.clientY / window.innerHeight * 100;
		};
		const tick = () => {
			cx += (tx - cx) * .08;
			cy += (ty - cy) * .08;
			el.style.setProperty("--mx", `${cx}%`);
			el.style.setProperty("--my", `${cy}%`);
			raf = requestAnimationFrame(tick);
		};
		window.addEventListener("mousemove", onMove, { passive: true });
		raf = requestAnimationFrame(tick);
		return () => {
			window.removeEventListener("mousemove", onMove);
			cancelAnimationFrame(raf);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": true,
		className: "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0",
			style: {
				backgroundImage: "repeating-linear-gradient(90deg, var(--blush) 0, var(--blush) 48px, var(--blush-2) 48px, var(--blush-2) 96px)",
				maskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 55%, transparent 100%)",
				WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 55%, transparent 100%)"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: glowRef,
			className: "absolute inset-0",
			style: {
				"--mx": "50%",
				"--my": "30%",
				background: "radial-gradient(42vmax 42vmax at var(--mx) var(--my), color-mix(in oklab, var(--white) 62%, transparent) 0%, transparent 62%)",
				mixBlendMode: "soft-light"
			}
		})]
	});
}
var Scene = (0, import_react.lazy)(() => import("./Scene-CUdzidQ6.mjs"));
var MOBILE_TIER_MIN = 2;
/** If the 3D canvas throws for any reason, render nothing so the flat base shows. */
var CanvasErrorBoundary = class extends import_react.Component {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	componentDidCatch() {
		this.props.onFail();
	}
	render() {
		return this.state.failed ? null : this.props.children;
	}
};
/** Flat cover — bundled asset (served from /assets, unlike public/textures which
* 404s on Vercel). This is the guaranteed-visible book. */
function FlatCover() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: cover_pink_front_default,
		alt: "Curated by MMJ — Blush Pink hardcover notebook",
		draggable: false,
		className: "h-full w-auto rounded-md object-contain [animation:notebook-float_7s_ease-in-out_infinite]",
		style: { filter: "drop-shadow(0 22px 26px color-mix(in oklab, var(--blue) 12%, transparent))" }
	});
}
/**
* The hero's notebook, floating cleanly (no pedestal).
*
* Reliability: the flat cover is ALWAYS rendered as the visible base. The live
* 3D canvas overlays it and the flat book is hidden ONLY once the 3D book is
* confirmed to be rendering (texture loaded → Scene fires onReady). Any failure
* — no WebGL, GPU gate, lazy-load error, WebGL context loss, texture error —
* leaves the flat book visible. A book is always on screen.
*
* Gate: desktop (WebGL) → 3D; capable phones (tier ≥ 2) → 3D low-power; else
* flat only. `?force3d=1` / `?force3d=0` overrides for the demo.
*/
function HeroNotebook({ color = "pink" }) {
	const [use3D, setUse3D] = (0, import_react.useState)(false);
	const [lowPower, setLowPower] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
		const desktop = window.matchMedia("(min-width: 768px)");
		let cancelled = false;
		const decide = async () => {
			const force = new URLSearchParams(window.location.search).get("force3d");
			if (force === "0" || reduce.matches) {
				if (!cancelled) setUse3D(false);
				return;
			}
			if (force === "1") {
				if (!cancelled) {
					setLowPower(!desktop.matches);
					setUse3D(hasWebGL());
				}
				return;
			}
			if (desktop.matches) {
				if (!cancelled) {
					setLowPower(false);
					setUse3D(hasWebGL());
				}
				return;
			}
			const tier = await detect3DTier();
			if (cancelled) return;
			setLowPower(true);
			setUse3D(tier >= MOBILE_TIER_MIN);
		};
		decide();
		reduce.addEventListener("change", decide);
		desktop.addEventListener("change", decide);
		return () => {
			cancelled = true;
			reduce.removeEventListener("change", decide);
			desktop.removeEventListener("change", decide);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative flex flex-col items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			style: {
				height: "clamp(220px, 54vw, 520px)",
				width: "min(72vw, clamp(200px, 46vw, 480px))"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
				style: { opacity: ready ? 0 : 1 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlatCover, {})
			}), use3D && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasErrorBoundary, {
				onFail: () => setReady(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: null,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {
							color,
							lowPower,
							onReady: () => setReady(true)
						})
					})
				})
			})]
		})
	});
}
/**
* Home hero — Curated by MMJ.
* Centered composition: oversized editorial headline, then the notebook
* standing on a circular pedestal, over the rippling satin fabric backdrop.
*
* Entrance (~2s staggered luxury timeline, all on --ease-soft / motion tokens):
*   background fades in → eyebrow fades → headline reveals line-by-line
*   (mask up) → notebook scales 90%→100%. Everything else stays calm.
*
* Flat cover_pink.jpg is a placeholder for the real 3D book (next step).
* All colors, sizes and easings come from tokens — nothing hardcoded off-palette.
*/
function Hero() {
	const t = (0, import_react.useMemo)(() => {
		return {
			ease: tokenEase("--ease-soft", [
				.16,
				1,
				.3,
				1
			]),
			reveal: tokenSeconds("--duration-reveal", 1.1)
		};
	}, []);
	const bg = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: .8,
				ease: t.ease
			}
		}
	};
	const fadeUp = (delay) => ({
		hidden: {
			opacity: 0,
			y: 16
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: t.reveal * .6,
				ease: t.ease,
				delay
			}
		}
	});
	const line = (delay) => ({
		hidden: { y: "110%" },
		visible: {
			y: 0,
			transition: {
				duration: t.reveal,
				ease: t.ease,
				delay
			}
		}
	});
	const book = {
		hidden: {
			opacity: 0,
			scale: .9
		},
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: t.reveal,
				ease: t.ease,
				delay: .9
			}
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionConfig, {
		reducedMotion: "user",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			as: "section",
			rhythm: "none",
			className: "relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-28 pb-16 text-center md:pt-32",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				variants: bg,
				initial: "hidden",
				animate: "visible",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroBackground, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, {
				width: "wide",
				className: "flex flex-col items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						variants: fadeUp(.35),
						initial: "hidden",
						animate: "visible",
						className: "text-caption uppercase tracking-caps text-muted-foreground",
						children: "Curated by MMJ · Hardcover notebooks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display mt-6 text-balance leading-[var(--leading-display)]",
						style: { fontSize: "clamp(3rem, 8.5vw, 6.5rem)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block overflow-hidden pb-[0.06em]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								className: "block",
								variants: line(.5),
								initial: "hidden",
								animate: "visible",
								style: {
									background: "linear-gradient(90deg, var(--blue) 0%, var(--blue) 35%, color-mix(in oklab, var(--white) 75%, var(--blue)) 50%, var(--blue) 65%, var(--blue) 100%)",
									backgroundSize: "200% auto",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
									animation: "text-shine 6s ease-in-out 2s infinite"
								},
								children: "Make it"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block overflow-hidden pb-[0.06em]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								className: "font-script block italic",
								style: {
									fontSize: "1.08em",
									background: "linear-gradient(90deg, var(--blue) 0%, var(--blue) 35%, color-mix(in oklab, var(--white) 75%, var(--blue)) 50%, var(--blue) 65%, var(--blue) 100%)",
									backgroundSize: "200% auto",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
									animation: "text-shine 6s ease-in-out 2.4s infinite"
								},
								variants: line(.68),
								initial: "hidden",
								animate: "visible",
								children: "happen."
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						variants: book,
						initial: "hidden",
						animate: "visible",
						className: "relative mt-10 flex flex-col items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroNotebook, { color: "pink" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						variants: fadeUp(1.2),
						initial: "hidden",
						animate: "visible",
						className: "mt-12",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							size: "pill",
							children: "Shop the collection"
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { Hero as t };
