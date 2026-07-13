import { d as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useLenis, t as Nav } from "./use-lenis-C-6CjMDK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-BAToKCuh.js
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	useLenis();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-blush text-blue",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-[80vh] flex-col items-center justify-center px-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-6 text-caption uppercase tracking-caps text-blue/35",
					children: "Account · Coming soon"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-h1 text-blue",
					children: "Your account."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-sm text-[16px] leading-[1.75] text-blue/55",
					children: "Order history and account management coming soon."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-10 text-caption uppercase tracking-caps text-blue/40 underline-offset-4 hover:underline",
					children: "← Back home"
				})
			]
		})]
	});
}
//#endregion
export { AccountPage as component };
