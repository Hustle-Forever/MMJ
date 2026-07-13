//#region node_modules/.nitro/vite/services/ssr/assets/detect-3d-D0Cce_PE.js
/**
* Client-only 3D capability detection used to decide whether to mount the live
* <Scene> or fall back to the flat cover. Runs outside the Canvas so low-tier
* phones never even create a WebGL context.
*
* detect-gpu is CommonJS — importing it as a named ESM export breaks SSR.
* We use a dynamic import inside detect3DTier() so the module only loads on
* the client (this function is always called from a useEffect).
*/
/** Cheap WebGL support probe. Loses the context immediately so it isn't consumed. */
function hasWebGL() {
	try {
		const c = document.createElement("canvas");
		const gl = c.getContext("webgl2") || c.getContext("webgl");
		if (!gl) return false;
		gl.getExtension("WEBGL_lose_context")?.loseContext();
		return true;
	} catch {
		return false;
	}
}
/** Offline fallback tier estimate from the GPU renderer string + device specs. */
function heuristicTier() {
	try {
		const c = document.createElement("canvas");
		const gl = c.getContext("webgl2") || c.getContext("webgl");
		if (!gl) return 0;
		const dbg = gl.getExtension("WEBGL_debug_renderer_info");
		const renderer = (dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "").toLowerCase();
		gl.getExtension("WEBGL_lose_context")?.loseContext();
		const weak = /(swiftshader|llvmpipe|software|mali-4|mali-t[0-9]|adreno \(tm\) [234]\d\d|adreno [234]\d\d|powervr sgx|videocore)/.test(renderer);
		const cores = navigator.hardwareConcurrency ?? 4;
		const mem = navigator.deviceMemory ?? 4;
		if (weak || cores <= 2 || mem <= 2) return 1;
		return 3;
	} catch {
		return 0;
	}
}
/**
* Returns a GPU tier 0–3. Prefers detect-gpu's benchmarked database; falls back
* to a self-contained heuristic if it errors or stalls (offline pitch safety).
*/
async function detect3DTier() {
	if (!hasWebGL()) return 0;
	try {
		const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 2e3));
		const mod = await import("../_libs/detect-gpu.mjs").then((n) => n.t);
		const fn = mod.getGPUTier ?? mod.default?.getGPUTier;
		if (!fn) throw new Error("detect-gpu unavailable");
		const gpu = await Promise.race([fn(), timeout]);
		if (gpu && typeof gpu.tier === "number") return gpu.tier;
	} catch {}
	return heuristicTier();
}
//#endregion
export { hasWebGL as n, detect3DTier as t };
