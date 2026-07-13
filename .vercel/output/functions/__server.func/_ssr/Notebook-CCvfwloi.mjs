import { o as __toESM } from "../_runtime.mjs";
import { t as cover_pink_front_default } from "./cover_pink_front-BbP_pvR6.mjs";
import { n as cover_green_front_default, t as cover_blue_front_default } from "./cover_green_front-eFsE1mMA.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { d as require_jsx_runtime, n as useTexture, s as CanvasTexture, t as RoundedBox, u as SRGBColorSpace } from "../_libs/@react-three/drei+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Notebook-CCvfwloi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COVERS = {
	pink: {
		front: cover_pink_front_default,
		back: "/assets/cover_pink_back-BAnNNXo_.webp"
	},
	blue: {
		front: cover_blue_front_default,
		back: "/assets/cover_blue_back-IM27AFqd.webp"
	},
	green: {
		front: cover_green_front_default,
		back: "/assets/cover_green_back-Dgu-knZJ.webp"
	}
};
var COLORWAYS = {
	pink: {
		stripeA: "#F8C6D1",
		stripeB: "#FCE3E9",
		shell: "#FAD5DD",
		ribbon: "#F6BFCC"
	},
	blue: {
		stripeA: "#5181C0",
		stripeB: "#B2C5DF",
		shell: "#83A4D0",
		ribbon: "#A9C0E2"
	},
	green: {
		stripeA: "#637E38",
		stripeB: "#A0BA72",
		shell: "#819C55",
		ribbon: "#9DB56E"
	}
};
var NB = {
	W: 2.1,
	H: 2.9,
	D: .22
};
useTexture.preload(COVERS.pink.front);
useTexture.preload(COVERS.pink.back);
/** Prepare a cover texture; optionally downscale to 512px on low-power devices. */
function prepCover(cover, lowRes) {
	cover.colorSpace = SRGBColorSpace;
	cover.anisotropy = lowRes ? 1 : 8;
	const img = cover.image;
	if (lowRes && img && !cover.__downscaled) {
		const max = 512;
		const scale = Math.min(1, max / Math.max(img.width || max, img.height || max));
		if (scale < 1) {
			const cv = document.createElement("canvas");
			cv.width = Math.round((img.width || max) * scale);
			cv.height = Math.round((img.height || max) * scale);
			cv.getContext("2d")?.drawImage(img, 0, 0, cv.width, cv.height);
			cover.image = cv;
			cover.needsUpdate = true;
		}
		cover.__downscaled = true;
	}
}
/**
* Procedural spine texture: plain vertical stripes matching the cover color.
* No text — just the wrapped striped cloth.
*/
function makeSpineTexture(colA, colB) {
	const W = 64, H = 512;
	const cv = document.createElement("canvas");
	cv.width = W;
	cv.height = H;
	const ctx = cv.getContext("2d");
	const sw = 8;
	for (let x = 0; x < W; x += sw * 2) {
		ctx.fillStyle = colA;
		ctx.fillRect(x, 0, sw, H);
		ctx.fillStyle = colB;
		ctx.fillRect(x + sw, 0, sw, H);
	}
	const tex = new CanvasTexture(cv);
	tex.colorSpace = SRGBColorSpace;
	return tex;
}
var { W, H, D } = NB;
/**
* The shared book body — linen hardcover shell tinted to the colorway (a real
* hardcover wraps the cover cloth around its edges), cream page block on the
* 3 non-spine edges, satin ribbon. Used by both hero and scroll showcase.
* Does NOT include front/back cover artwork or the spine face; those are
* added by <Notebook> (hero) and ShowcaseBook (showcase) separately.
*
* `shellRef` / `ribbonRef` expose the materials so the showcase can lerp
* their colors during the colorway crossfade.
*/
function NotebookBody({ color = "pink", shellRef, ribbonRef }) {
	const cw = COLORWAYS[color];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundedBox, {
			args: [
				W,
				H,
				D
			],
			radius: .045,
			smoothness: 5,
			castShadow: true,
			receiveShadow: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
				ref: shellRef,
				color: cw.shell,
				roughness: .62,
				metalness: 0,
				sheen: .6,
				sheenRoughness: .5,
				sheenColor: "#ffffff",
				clearcoat: .05,
				clearcoatRoughness: .6
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				.04,
				0,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				W - .06,
				H - .16,
				D - .08
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#fffdf8",
				roughness: .95,
				metalness: 0
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				.72,
				-.06,
				D / 2 + .018
			],
			rotation: [
				0,
				0,
				-.025
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.09,
				3,
				.014
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
				ref: ribbonRef,
				color: cw.ribbon,
				roughness: .28,
				metalness: 0,
				sheen: 1,
				sheenRoughness: .25,
				sheenColor: "#ffffff"
			})]
		})
	] });
}
function useCoverPair(color, lowRes) {
	const [front, back] = useTexture([COVERS[color].front, COVERS[color].back]);
	(0, import_react.useMemo)(() => {
		prepCover(front, lowRes);
		prepCover(back, lowRes);
	}, [
		front,
		back,
		lowRes
	]);
	return {
		front,
		back
	};
}
/**
* Full book for the hero and product page: body shell + real photo front
* cover + real photo back cover + plain striped spine.
*/
function Notebook({ color = "pink", lowRes = false }) {
	const { front, back } = useCoverPair(color, lowRes);
	const cw = COLORWAYS[color];
	const spineTex = (0, import_react.useMemo)(() => makeSpineTexture(cw.stripeA, cw.stripeB), [cw.stripeA, cw.stripeB]);
	(0, import_react.useEffect)(() => () => spineTex.dispose(), [spineTex]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookBody, { color }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				0,
				D / 2 + .002
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [W * .97, H * .97] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: front,
				transparent: true,
				roughness: .45,
				metalness: 0
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				0,
				-(D / 2 + .002)
			],
			rotation: [
				0,
				Math.PI,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [W * .97, H * .97] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: back,
				transparent: true,
				roughness: .5,
				metalness: 0
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-(W / 2 + .001),
				0,
				0
			],
			rotation: [
				0,
				-Math.PI / 2,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [D * .88, H * .97] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: spineTex,
				roughness: .5,
				metalness: 0
			})]
		})
	] });
}
//#endregion
export { NotebookBody as a, Notebook as i, COVERS as n, makeSpineTexture as o, NB as r, prepCover as s, COLORWAYS as t };
