import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { c as Color, d as require_jsx_runtime, i as useFrame, n as useTexture, r as Canvas } from "../_libs/@react-three/drei+[...].mjs";
import { a as NotebookBody, n as COVERS, o as makeSpineTexture, r as NB, s as prepCover, t as COLORWAYS } from "./Notebook-CCvfwloi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ShowcaseScene-CqUmCJR_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var { W, H, D } = NB;
var COLORS = [
	"pink",
	"blue",
	"green"
];
/** Triangle function: 1 at center c, 0 at ±width w. */
function tri(p, c, w) {
	const d = Math.abs(p - c);
	return d >= w ? 0 : 1 - d / w;
}
function Ready({ onReady }) {
	(0, import_react.useEffect)(() => {
		onReady?.();
	}, [onReady]);
	return null;
}
function ShowcaseBook({ progress, lowRes }) {
	const group = (0, import_react.useRef)(null);
	const photoTextures = useTexture([
		COVERS.pink.front,
		COVERS.blue.front,
		COVERS.green.front,
		COVERS.pink.back,
		COVERS.blue.back,
		COVERS.green.back
	]);
	photoTextures.forEach((t) => prepCover(t, lowRes));
	const frontTextures = photoTextures.slice(0, 3);
	const backTextures = photoTextures.slice(3, 6);
	const spineTextures = (0, import_react.useMemo)(() => COLORS.map((c) => makeSpineTexture(COLORWAYS[c].stripeA, COLORWAYS[c].stripeB)), []);
	(0, import_react.useEffect)(() => () => {
		spineTextures.forEach((t) => t.dispose());
	}, [spineTextures]);
	const frontMats = (0, import_react.useRef)([]);
	const backMats = (0, import_react.useRef)([]);
	const spineMats = (0, import_react.useRef)([]);
	const shellMat = (0, import_react.useRef)(null);
	const ribbonMat = (0, import_react.useRef)(null);
	const shellColors = (0, import_react.useMemo)(() => COLORS.map((c) => new Color(COLORWAYS[c].shell)), []);
	const ribbonColors = (0, import_react.useMemo)(() => COLORS.map((c) => new Color(COLORWAYS[c].ribbon)), []);
	useFrame(() => {
		const p = progress.current ?? 0;
		if (group.current) group.current.rotation.y = p * Math.PI * 2 * 3;
		const o = [
			Math.max(tri(p, 0, 1 / 3), tri(p, 1, 1 / 3)),
			tri(p, 1 / 3, 1 / 3),
			tri(p, 2 / 3, 1 / 3)
		];
		[
			frontMats,
			backMats,
			spineMats
		].forEach((refs) => {
			refs.current.forEach((m, i) => {
				if (m) m.opacity = o[i];
			});
		});
		if (shellMat.current) shellMat.current.color.setRGB(o[0] * shellColors[0].r + o[1] * shellColors[1].r + o[2] * shellColors[2].r, o[0] * shellColors[0].g + o[1] * shellColors[1].g + o[2] * shellColors[2].g, o[0] * shellColors[0].b + o[1] * shellColors[1].b + o[2] * shellColors[2].b);
		if (ribbonMat.current) ribbonMat.current.color.setRGB(o[0] * ribbonColors[0].r + o[1] * ribbonColors[1].r + o[2] * ribbonColors[2].r, o[0] * ribbonColors[0].g + o[1] * ribbonColors[1].g + o[2] * ribbonColors[2].g, o[0] * ribbonColors[0].b + o[1] * ribbonColors[1].b + o[2] * ribbonColors[2].b);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: group,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookBody, {
				shellRef: (m) => {
					shellMat.current = m;
				},
				ribbonRef: (m) => {
					ribbonMat.current = m;
				}
			}),
			frontTextures.map((tex, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					0,
					D / 2 + .002 + i * .001
				],
				renderOrder: i + 1,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [W * .97, H * .97] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					ref: (m) => {
						if (m) frontMats.current[i] = m;
					},
					map: tex,
					roughness: .45,
					metalness: 0,
					transparent: true,
					depthWrite: false,
					opacity: i === 0 ? 1 : 0
				})]
			}, `front-${i}`)),
			backTextures.map((tex, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					0,
					-(D / 2 + .002 + i * .001)
				],
				rotation: [
					0,
					Math.PI,
					0
				],
				renderOrder: i + 1,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [W * .97, H * .97] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					ref: (m) => {
						if (m) backMats.current[i] = m;
					},
					map: tex,
					roughness: .5,
					metalness: 0,
					transparent: true,
					depthWrite: false,
					opacity: i === 0 ? 1 : 0
				})]
			}, `back-${i}`)),
			spineTextures.map((tex, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					-(W / 2 + .001 + i * 5e-4),
					0,
					0
				],
				rotation: [
					0,
					-Math.PI / 2,
					0
				],
				renderOrder: i + 1,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [D * .88, H * .97] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					ref: (m) => {
						if (m) spineMats.current[i] = m;
					},
					map: tex,
					roughness: .5,
					metalness: 0,
					transparent: true,
					depthWrite: false,
					opacity: i === 0 ? 1 : 0
				})]
			}, `spine-${i}`))
		]
	});
}
/** Scroll-driven 3D notebook. Reuses hero lights. FOV 36 = wider frame so
*  the spinning book never clips at any rotation angle on mobile. */
function ShowcaseScene({ progress, lowPower = false, onReady }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		flat: true,
		camera: {
			position: [
				0,
				0,
				6
			],
			fov: 36
		},
		dpr: [1, 2],
		gl: {
			alpha: true,
			antialias: true,
			powerPreference: lowPower ? "low-power" : "high-performance"
		},
		style: {
			width: "100%",
			height: "100%"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .55 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					3,
					5,
					6
				],
				intensity: .85
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					-4,
					1,
					3
				],
				intensity: .5
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					0,
					-3,
					4
				],
				intensity: .22
			}),
			!lowPower && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					0,
					4,
					-5
				],
				intensity: .35,
				color: "#ffffff"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
				fallback: null,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShowcaseBook, {
					progress,
					lowRes: lowPower
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ready, { onReady })]
			})
		]
	});
}
//#endregion
export { ShowcaseScene as default };
