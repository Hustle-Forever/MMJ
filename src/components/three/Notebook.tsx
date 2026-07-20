import { useEffect, useMemo } from "react";
import { useTexture, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

import coverPinkFront from "@/assets/covers/cover_pink_front.webp";
import coverPinkBack from "@/assets/covers/cover_pink_back.webp";
import coverBlueFront from "@/assets/covers/cover_blue_front.webp";
import coverBlueBack from "@/assets/covers/cover_blue_back.webp";
import coverGreenFront from "@/assets/covers/cover_green_front.webp";
import coverGreenBack from "@/assets/covers/cover_green_back.webp";

export type NotebookColor = "pink" | "blue" | "green";

// Real product photos (background removed, pre-cropped to the exact face
// aspect NB.W : NB.H by scripts/process-covers.ps1) — front and back per color.
export const COVERS: Record<NotebookColor, { front: string; back: string }> = {
  pink: { front: coverPinkFront, back: coverPinkBack },
  blue: { front: coverBlueFront, back: coverBlueBack },
  green: { front: coverGreenFront, back: coverGreenBack },
};

// Per-colorway material colors, sampled from the real cover photos
// (scripts/sample-stripes.mjs): spine stripe pair, linen shell tint for the
// wrapped hardcover edges, and satin ribbon.
export const COLORWAYS: Record<
  NotebookColor,
  { stripeA: string; stripeB: string; shell: string; ribbon: string }
> = {
  pink:  { stripeA: "#F8C6D1", stripeB: "#FCE3E9", shell: "#FAD5DD", ribbon: "#F6BFCC" },
  blue:  { stripeA: "#5181C0", stripeB: "#B2C5DF", shell: "#83A4D0", ribbon: "#A9C0E2" },
  green: { stripeA: "#637E38", stripeB: "#A0BA72", shell: "#819C55", ribbon: "#9DB56E" },
};

// Slim hardcover proportions — ~A5, ~1/13 depth-to-height so it reads as a
// real notebook, not a box.
export const NB = { W: 2.1, H: 2.9, D: 0.22 };

useTexture.preload(COVERS.pink.front);
useTexture.preload(COVERS.pink.back);

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
 * Procedural spine texture: plain vertical stripes matching the cover color.
 * No text — just the wrapped striped cloth.
 */
export function makeSpineTexture(colA: string, colB: string): THREE.CanvasTexture {
  const W = 64, H = 512;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;
  const sw = 8;
  for (let x = 0; x < W; x += sw * 2) {
    ctx.fillStyle = colA; ctx.fillRect(x, 0, sw, H);
    ctx.fillStyle = colB; ctx.fillRect(x + sw, 0, sw, H);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const { W, H, D } = NB;

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
export function NotebookBody({
  color = "pink",
  shellRef,
  ribbonRef,
  showRibbon = true,
}: {
  color?: NotebookColor;
  shellRef?: (m: THREE.MeshPhysicalMaterial | null) => void;
  ribbonRef?: (m: THREE.MeshPhysicalMaterial | null) => void;
  /** The still life lays books flat — its hanging tail would float sideways,
      so pooled floor ribbons replace it there. */
  showRibbon?: boolean;
}) {
  const cw = COLORWAYS[color];
  return (
    <>
      {/* Hardcover linen shell — soft rounded edges, subtle cloth sheen */}
      <RoundedBox args={[W, H, D]} radius={0.045} smoothness={5} castShadow receiveShadow>
        <meshPhysicalMaterial
          ref={shellRef}
          color={cw.shell}
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

      {/* Satin ribbon bookmark — tail emerging from the pages at the bottom,
          like the product photos (top of the strip is hidden inside the body) */}
      <mesh visible={showRibbon} position={[0.55, -H / 2 - 0.14, 0]} rotation={[0, 0, -0.055]}>
        <boxGeometry args={[0.09, 0.85, 0.014]} />
        <meshPhysicalMaterial
          ref={ribbonRef}
          color={cw.ribbon}
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

function useCoverPair(color: NotebookColor, lowRes: boolean) {
  const [front, back] = useTexture([COVERS[color].front, COVERS[color].back]);
  useMemo(() => {
    prepCover(front, lowRes);
    prepCover(back, lowRes);
  }, [front, back, lowRes]);
  return { front, back };
}

/**
 * Full book for the hero and product page: body shell + real photo front
 * cover + real photo back cover + plain striped spine.
 */
export function Notebook({
  color = "pink",
  lowRes = false,
}: {
  color?: NotebookColor;
  lowRes?: boolean;
}) {
  const { front, back } = useCoverPair(color, lowRes);
  const cw = COLORWAYS[color];

  const spineTex = useMemo(
    () => makeSpineTexture(cw.stripeA, cw.stripeB),
    [cw.stripeA, cw.stripeB],
  );
  useEffect(() => () => spineTex.dispose(), [spineTex]);

  return (
    <group>
      <NotebookBody color={color} />

      {/* Front cover — real product photo */}
      <mesh position={[0, 0, D / 2 + 0.002]}>
        <planeGeometry args={[W * 0.97, H * 0.97]} />
        <meshStandardMaterial map={front} transparent roughness={0.45} metalness={0} />
      </mesh>

      {/* Back cover — real product photo */}
      <mesh position={[0, 0, -(D / 2 + 0.002)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W * 0.97, H * 0.97]} />
        <meshStandardMaterial map={back} transparent roughness={0.5} metalness={0} />
      </mesh>

      {/* Spine — plain stripes matching the cover, no text */}
      <mesh position={[-(W / 2 + 0.001), 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D * 0.88, H * 0.97]} />
        <meshStandardMaterial map={spineTex} roughness={0.5} metalness={0} />
      </mesh>
    </group>
  );
}
