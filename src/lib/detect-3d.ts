import { getGPUTier } from "detect-gpu";

/**
 * Client-only 3D capability detection used to decide whether to mount the live
 * <Scene> or fall back to the flat cover. Runs outside the Canvas so low-tier
 * phones never even create a WebGL context.
 */

/** Cheap WebGL support probe. Loses the context immediately so it isn't consumed. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Offline fallback tier estimate from the GPU renderer string + device specs. */
function heuristicTier(): number {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return 0;
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = (dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "").toLowerCase();
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    // Software renderers and older mobile GPUs → low tier.
    const weak =
      /(swiftshader|llvmpipe|software|mali-4|mali-t[0-9]|adreno \(tm\) [234]\d\d|adreno [234]\d\d|powervr sgx|videocore)/.test(
        renderer,
      );
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
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
export async function detect3DTier(): Promise<number> {
  if (!hasWebGL()) return 0;
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const gpu = await Promise.race([getGPUTier(), timeout]);
    if (gpu && typeof gpu.tier === "number") return gpu.tier;
  } catch {
    /* fall through to heuristic */
  }
  return heuristicTier();
}
