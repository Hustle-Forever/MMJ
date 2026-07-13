import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { a as useThree, d as require_jsx_runtime, i as useFrame, l as MathUtils, r as Canvas } from "../_libs/@react-three/drei+[...].mjs";
import { i as Notebook } from "./Notebook-CCvfwloi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Scene-CUdzidQ6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Fires once — mounted only after the Notebook's texture has loaded, so it
* confirms the 3D book is actually rendering (used to hide the flat fallback). */
function Ready({ onReady }) {
	(0, import_react.useEffect)(() => {
		onReady?.();
	}, [onReady]);
	return null;
}
/**
* <Scene /> — reusable studio stage for the 3D notebook.
* Transparent canvas over the DOM stripes. Bright, soft studio lighting so the
* book is the richest thing on screen and pops off the pale background. The
* book rests at a gentle near-front three-quarter angle, floats subtly, and
* tilts a few degrees toward the cursor. No pedestal, no grounding shadow — it
* floats cleanly.
*
* `lowPower` (capable phones): softer float, low-power GL hint, downscaled
* texture (via Notebook). Desktop path is unchanged. Client-only + lazy-loaded.
*/
var BASE_ROT_Y = -.24;
var BASE_ROT_X = -.04;
function Rig({ children, subtle = false }) {
	const group = (0, import_react.useRef)(null);
	const { pointer } = useThree();
	const bob = subtle ? .05 : .07;
	const driftAmp = subtle ? .02 : .03;
	useFrame((state, delta) => {
		const g = group.current;
		if (!g) return;
		const t = state.clock.elapsedTime;
		g.position.y = Math.sin(t * .8) * bob;
		const drift = Math.sin(t * .4) * driftAmp;
		const targetY = BASE_ROT_Y + pointer.x * .06 + drift;
		const targetX = BASE_ROT_X - pointer.y * .05;
		g.rotation.y = MathUtils.damp(g.rotation.y, targetY, 4, delta);
		g.rotation.x = MathUtils.damp(g.rotation.x, targetX, 4, delta);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref: group,
		children
	});
}
function Scene({ color = "pink", lowPower = false, onReady }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		flat: true,
		camera: {
			position: [
				0,
				0,
				6
			],
			fov: 34
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rig, {
					subtle: lowPower,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notebook, {
						color,
						lowRes: lowPower
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ready, { onReady })]
			})
		]
	});
}
//#endregion
export { Scene as default };
