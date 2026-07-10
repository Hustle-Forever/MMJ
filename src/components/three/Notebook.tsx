import { useEffect, useMemo } from "react";
import { useTexture, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

import coverPink from "@/assets/covers/cover_pink.jpg";
import coverBlue from "@/assets/covers/cover_blue.jpg";
import coverGreen from "@/assets/covers/cover_green.jpg";

export type NotebookColor = "pink" | "blue" | "green";

export const COVERS: Record<NotebookColor, string> = {
  pink: coverPink,
  blue: coverBlue,
  green: coverGreen,
};

// Stripe pair + ink color for back cover and spine, per colorway.
export const COLORWAYS: Record<NotebookColor, { stripeA: string; stripeB: string; ink: string }> = {
  pink:  { stripeA: "#F8E6EC", stripeB: "#F4D8DF", ink: "#0B5FA5" },
  blue:  { stripeA: "#0B5FA5", stripeB: "#0A4D8C", ink: "#FFFFFF" },
  green: { stripeA: "#C8D8B0", stripeB: "#B5C89A", ink: "#3D5C1A" },
};

// Linen tint for the hardcover body.
const LINEN = "#efc9d4";

// Slim hardcover proportions — ~A5, 1/10 depth-to-height (not a slab).
export const NB = { W: 2.1, H: 2.9, D: 0.24 };

useTexture.preload(COVERS.pink);

/** Prepare a cover texture; optionally downscale to 512px on low-power devices. */
export function prepCover(cover: THREE.Texture, lowRes: boolean) {
  cover.colorSpace = THREE.SRGBColorSpace;
  cover.anisotropy = lowRes ? 1 : 8;
  const img = cover.image as (HTMLImageElement & { __downscaled?: boolean }) | undefined;
  if (lowRes && img && !(cover as unknown as { __downscaled?: boolean }).__downscaled) {
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
    (cover as unknown as { __downscaled?: boolean }).__downscaled = true;
  }
}

/**
 * Procedural striped texture for back cover.
 * Matches the real product: same vertical stripe pattern as the front,
 * small brand text bottom-right, minimal barcode area.
 */
export function makeBackTexture(colA: string, colB: string, ink: string): THREE.CanvasTexture {
  const W = 512, H = 768;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;
  // Vertical stripes — 48px each, matching front cover
  const sw = 48;
  for (let x = 0; x < W; x += sw * 2) {
    ctx.fillStyle = colA; ctx.fillRect(x, 0, sw, H);
    ctx.fillStyle = colB; ctx.fillRect(x + sw, 0, sw, H);
  }
  // Small brand text (bottom-right quadrant)
  ctx.fillStyle = ink;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.font = "500 20px Inter, sans-serif";
  ctx.fillText("Curated by MMJ", W - 28, H - 72);
  ctx.font = "400 15px Inter, sans-serif";
  ctx.fillText("© MMJ Design", W - 28, H - 52);
  // Decorative barcode block
  ctx.fillStyle = ink;
  const bcX = W - 88, bcY = H - 36, bcH = 24;
  for (let bx = 0; bx < 60; bx += 3) {
    if ((bx % 6) < 4) ctx.fillRect(bcX + bx, bcY - bcH, bx % 9 < 7 ? 1 : 2, bcH);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural spine texture: vertical stripes + "MAKE IT HAPPEN / MMJ" text.
 * Canvas is portrait (narrow × tall); text is rotated 90° CW so it reads
 * top-to-bottom on the spine.
 */
export function makeSpineTexture(colA: string, colB: string, ink: string): THREE.CanvasTexture {
  const W = 64, H = 512;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;
  // Stripes (narrow, matching cover scale)
  const sw = 8;
  for (let x = 0; x < W; x += sw * 2) {
    ctx.fillStyle = colA; ctx.fillRect(x, 0, sw, H);
    ctx.fillStyle = colB; ctx.fillRect(x + sw, 0, sw, H);
  }
  // Text rotated CW — reads top-to-bottom on the physical spine
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 13px Inter, sans-serif";
  ctx.fillText("MAKE IT HAPPEN", 0, -8);
  ctx.font = "400 10px Inter, sans-serif";
  ctx.fillText("MMJ", 0, 8);
  ctx.restore();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function useCover(color: NotebookColor, lowRes: boolean) {
  const cover = useTexture(COVERS[color]);
  useMemo(() => prepCover(cover, lowRes), [cover, lowRes]);
  return cover;
}

const { W, H, D } = NB;

/**
 * The shared book body — linen hardcover shell, cream page block, spine
 * crease accent, satin ribbon. Used by both hero and scroll showcase.
 * Does NOT include front/back cover artwork or spine texture; those are
 * added by <Notebook> (hero) and ShowcaseBook (showcase) separately.
 */
export function NotebookBody() {
  return (
    <>
      {/* Hardcover linen shell */}
      <RoundedBox args={[W, H, D]} radius={0.045} smoothness={5} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={LINEN}
          roughness={0.62}
          metalness={0}
          sheen={0.6}
          sheenRoughness={0.5}
          sheenColor="#ffffff"
          clearcoat={0.05}
          clearcoatRoughness={0.6}
        />
      </RoundedBox>

      {/* Cream page block — slightly inset, peeking on the fore-edge (+x side) */}
      <mesh position={[0.04, 0, 0]} castShadow>
        <boxGeometry args={[W - 0.06, H - 0.16, D - 0.08]} />
        <meshStandardMaterial color="#fffdf8" roughness={0.95} metalness={0} />
      </mesh>

      {/* Spine binding crease — subtle blue hairline near the spine edge */}
      <mesh position={[-W / 2 + 0.11, 0, D / 2 + 0.001]}>
        <planeGeometry args={[0.01, H * 0.9]} />
        <meshStandardMaterial color="#0b5fa5" transparent opacity={0.1} roughness={1} />
      </mesh>

      {/* Satin ribbon bookmark */}
      <mesh position={[0.72, -0.06, D / 2 + 0.018]} rotation={[0, 0, -0.025]}>
        <boxGeometry args={[0.09, 3.0, 0.014]} />
        <meshPhysicalMaterial
          color="#efc9d4"
          roughness={0.28}
          metalness={0}
          sheen={1}
          sheenRoughness={0.25}
          sheenColor="#ffffff"
        />
      </mesh>
    </>
  );
}

/**
 * Full book for the hero: body shell + printed front cover + striped back
 * cover + spine texture. All three faces match the real product.
 */
export function Notebook({
  color = "pink",
  lowRes = false,
}: {
  color?: NotebookColor;
  lowRes?: boolean;
}) {
  const frontTex = useCover(color, lowRes);
  const cw = COLORWAYS[color];

  const backTex = useMemo(
    () => makeBackTexture(cw.stripeA, cw.stripeB, cw.ink),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color],
  );
  const spineTex = useMemo(
    () => makeSpineTexture(cw.stripeA, cw.stripeB, cw.ink),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color],
  );
  useEffect(
    () => () => { backTex.dispose(); spineTex.dispose(); },
    [backTex, spineTex],
  );

  return (
    <group>
      <NotebookBody />

      {/* Printed front cover — product artwork */}
      <mesh position={[0, 0, D / 2 + 0.002]}>
        <planeGeometry args={[W * 0.97, H * 0.97]} />
        <meshStandardMaterial map={frontTex} roughness={0.45} metalness={0} />
      </mesh>

      {/* Striped back cover — same stripe pattern, small brand text */}
      <mesh position={[0, 0, -(D / 2 + 0.002)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W * 0.97, H * 0.97]} />
        <meshStandardMaterial map={backTex} roughness={0.5} metalness={0} />
      </mesh>

      {/* Spine — striped + "MAKE IT HAPPEN / MMJ" text */}
      <mesh position={[-(W / 2 + 0.001), 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D * 0.88, H * 0.97]} />
        <meshStandardMaterial map={spineTex} roughness={0.5} metalness={0} />
      </mesh>
    </group>
  );
}
