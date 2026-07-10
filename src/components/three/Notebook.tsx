import { useMemo } from "react";
import { useTexture, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

import coverPink from "@/assets/covers/cover_pink.jpg";
import coverBlue from "@/assets/covers/cover_blue.jpg";
import coverGreen from "@/assets/covers/cover_green.jpg";

/**
 * <Notebook /> — hardcover book model for the MMJ hero / product viewer.
 * Rounded linen cover, printed front texture, cream page block on the opening
 * side, and a satin ribbon bookmark. Soft PBR (low metalness, medium roughness,
 * subtle sheen) so it reads as premium linen, not plastic.
 *
 * The body (everything but the printed front cover) is exported as
 * <NotebookBody /> so the scroll showcase reuses the exact same model + look
 * with a crossfading cover.
 */

export type NotebookColor = "pink" | "blue" | "green";

export const COVERS: Record<NotebookColor, string> = {
  pink: coverPink,
  blue: coverBlue,
  green: coverGreen,
};

// Locked-token linen tint — deeper footer-pink frames the pale cover.
const LINEN = "#efc9d4";

// Book proportions (standing upright, portrait).
export const NB = { W: 2.1, H: 2.9, D: 0.52 };

useTexture.preload(COVERS.pink);

/** Prepare a cover texture; on low-power devices downscale it to 512px. */
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

function useCover(color: NotebookColor, lowRes: boolean) {
  const cover = useTexture(COVERS[color]);
  useMemo(() => prepCover(cover, lowRes), [cover, lowRes]);
  return cover;
}

const { W, H, D } = NB;

/** The book model minus the printed front cover — reused by hero + showcase. */
export function NotebookBody() {
  return (
    <>
      {/* Cover body — soft linen hardcover */}
      <RoundedBox args={[W, H, D]} radius={0.05} smoothness={5} castShadow receiveShadow>
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

      {/* Page block — cream, peeking out on the opening (+x) side */}
      <mesh position={[0.05, 0, 0]} castShadow>
        <boxGeometry args={[W - 0.04, H - 0.16, D - 0.14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0} />
      </mesh>

      {/* Spine crease — a subtle recessed line near the binding edge */}
      <mesh position={[-W / 2 + 0.12, 0, D / 2 + 0.001]}>
        <planeGeometry args={[0.012, H * 0.9]} />
        <meshStandardMaterial color="#0b5fa5" transparent opacity={0.12} roughness={1} />
      </mesh>

      {/* Satin ribbon bookmark — hangs from the top over the fore-edge */}
      <mesh position={[0.78, -0.08, D / 2 + 0.02]} rotation={[0, 0, -0.03]}>
        <boxGeometry args={[0.1, 3.05, 0.018]} />
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

export function Notebook({
  color = "pink",
  lowRes = false,
}: {
  color?: NotebookColor;
  lowRes?: boolean;
}) {
  const cover = useCover(color, lowRes);

  return (
    <group>
      <NotebookBody />
      {/* Printed front cover — the product color moment. */}
      <mesh position={[0, 0, D / 2 + 0.002]}>
        <planeGeometry args={[W * 0.97, H * 0.97]} />
        <meshStandardMaterial map={cover} roughness={0.5} metalness={0} />
      </mesh>
    </group>
  );
}
