import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { t as Nav } from "./Nav-LUqlYVty.mjs";
import { t as Hero } from "./Hero-e4GXsPfI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hero-preview-C29xy9Q1.js
var import_jsx_runtime = require_jsx_runtime();
/**
* TEMPORARY preview route — shows the rebuilt Hero in isolation with the Nav
* overlaid, exactly as it will sit on the home page. Delete after sign-off.
*/
var NAV_LINKS = [{
	to: "/shop",
	label: "Shop"
}, {
	to: "/journal",
	label: "Journal"
}];
function HeroPreview() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-0 top-0 z-(--z-nav)",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {
				links: NAV_LINKS,
				cartCount: 2
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {})]
	});
}
//#endregion
export { HeroPreview as component };
