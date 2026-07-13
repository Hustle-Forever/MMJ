"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import {
  NotebookBody,
  NB,
  COVERS,
  COLORWAYS,
  prepCover,
  makeSpineTexture,
} from "./Notebook";

const { W, H, D } = NB;
const COLORS = ["pink", "blue", "green"] as const;

/** Triangle function: 1 at center c, 0 at ±width w. */
function tri(p: number, c: number, w: number) {
  const d = Math.abs(p - c);
  return d >= w ? 0 : 1 - d / w;
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => { onReady?.(); }, [onReady]);
  return null;
}

function ShowcaseBook({
  progress,
  lowRes,
}: {
  progress: RefObject<number>;
  lowRes: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  // Real photo textures — 3 fronts + 3 backs
  const photoTextures = useTexture([
    COVERS.pink.front, COVERS.blue.front, COVERS.green.front,
    COVERS.pink.back, COVERS.blue.back, COVERS.green.back,
  ]) as THREE.Texture[];
  photoTextures.forEach((t) => prepCover(t, lowRes));
  const frontTextures = photoTextures.slice(0, 3);
  const backTextures = photoTextures.slice(3, 6);

  // Procedural plain-striped spine textures, one per colorway (no text)
  const spineTextures = useMemo(
    () => COLORS.map((c) => makeSpineTexture(COLORWAYS[c].stripeA, COLORWAYS[c].stripeB)),
    [],
  );
  useEffect(() => () => {
    spineTextures.forEach((t) => t.dispose());
  }, [spineTextures]);

  // Material refs — 3 front + 3 back + 3 spine, plus body shell + ribbon
  const frontMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const backMats  = useRef<THREE.MeshStandardMaterial[]>([]);
  const spineMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const shellMat  = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const ribbonMat = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // Colorway body colors for the crossfade lerp
  const shellColors  = useMemo(() => COLORS.map((c) => new THREE.Color(COLORWAYS[c].shell)), []);
  const ribbonColors = useMemo(() => COLORS.map((c) => new THREE.Color(COLORWAYS[c].ribbon)), []);

  useFrame(() => {
    const p = progress.current ?? 0;
    if (group.current) group.current.rotation.y = p * Math.PI * 2 * 3; // 3 × 360°

    // Triangle crossfade: Pink → Blue → Green → Pink (weights sum to 1)
    const o = [
      Math.max(tri(p, 0, 1 / 3), tri(p, 1, 1 / 3)),
      tri(p, 1 / 3, 1 / 3),
      tri(p, 2 / 3, 1 / 3),
    ];

    // Face crossfade
    [frontMats, backMats, spineMats].forEach((refs) => {
      refs.current.forEach((m, i) => { if (m) m.opacity = o[i]; });
    });

    // Body shell + ribbon blend toward the active colorway
    if (shellMat.current) {
      shellMat.current.color.setRGB(
        o[0] * shellColors[0].r + o[1] * shellColors[1].r + o[2] * shellColors[2].r,
        o[0] * shellColors[0].g + o[1] * shellColors[1].g + o[2] * shellColors[2].g,
        o[0] * shellColors[0].b + o[1] * shellColors[1].b + o[2] * shellColors[2].b,
      );
    }
    if (ribbonMat.current) {
      ribbonMat.current.color.setRGB(
        o[0] * ribbonColors[0].r + o[1] * ribbonColors[1].r + o[2] * ribbonColors[2].r,
        o[0] * ribbonColors[0].g + o[1] * ribbonColors[1].g + o[2] * ribbonColors[2].g,
        o[0] * ribbonColors[0].b + o[1] * ribbonColors[1].b + o[2] * ribbonColors[2].b,
      );
    }
  });

  return (
    <group ref={group}>
      <NotebookBody
        shellRef={(m) => { shellMat.current = m; }}
        ribbonRef={(m) => { ribbonMat.current = m; }}
      />

      {/* Front covers — real photos, stacked transparent planes (one per colorway) */}
      {frontTextures.map((tex, i) => (
        <mesh
          key={`front-${i}`}
          position={[0, 0, D / 2 + 0.002 + i * 0.001]}
          renderOrder={i + 1}
        >
          <planeGeometry args={[W * 0.97, H * 0.97]} />
          <meshStandardMaterial
            ref={(m) => { if (m) frontMats.current[i] = m as THREE.MeshStandardMaterial; }}
            map={tex}
            roughness={0.45}
            metalness={0}
            transparent
            depthWrite={false}
            opacity={i === 0 ? 1 : 0}
          />
        </mesh>
      ))}

      {/* Back covers — real photos, same crossfade, facing -Z */}
      {backTextures.map((tex, i) => (
        <mesh
          key={`back-${i}`}
          position={[0, 0, -(D / 2 + 0.002 + i * 0.001)]}
          rotation={[0, Math.PI, 0]}
          renderOrder={i + 1}
        >
          <planeGeometry args={[W * 0.97, H * 0.97]} />
          <meshStandardMaterial
            ref={(m) => { if (m) backMats.current[i] = m as THREE.MeshStandardMaterial; }}
            map={tex}
            roughness={0.5}
            metalness={0}
            transparent
            depthWrite={false}
            opacity={i === 0 ? 1 : 0}
          />
        </mesh>
      ))}

      {/* Spine faces — plain stripes, facing -X, same crossfade */}
      {spineTextures.map((tex, i) => (
        <mesh
          key={`spine-${i}`}
          position={[-(W / 2 + 0.001 + i * 0.0005), 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          renderOrder={i + 1}
        >
          <planeGeometry args={[D * 0.88, H * 0.97]} />
          <meshStandardMaterial
            ref={(m) => { if (m) spineMats.current[i] = m as THREE.MeshStandardMaterial; }}
            map={tex}
            roughness={0.5}
            metalness={0}
            transparent
            depthWrite={false}
            opacity={i === 0 ? 1 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Scroll-driven 3D notebook. Reuses hero lights. FOV 36 = wider frame so
 *  the spinning book never clips at any rotation angle on mobile. */
export default function ShowcaseScene({
  progress,
  lowPower = false,
  onReady,
}: {
  progress: RefObject<number>;
  lowPower?: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 6], fov: 36 }}
      dpr={[1, 2]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: lowPower ? "low-power" : "high-performance",
      }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Exposure-true studio rig (same as hero). three.js divides light
          irradiance by π for Lambert materials (measured: ambient 1.0 →
          0.32× albedo), so intensities are written as effective × π.
          Front-face effective sum ≈ 1.0 → the photo covers render at their
          true colors; side faces sit at ~0.77–0.85 for gentle form shading.
          Rim stays on even on low power because the book spins 360°. */}
      <ambientLight intensity={0.66 * Math.PI} />
      <directionalLight position={[3, 5, 6]} intensity={0.3 * Math.PI} />
      <directionalLight position={[-4, 1, 3]} intensity={0.14 * Math.PI} />
      <directionalLight position={[0, -3, 4]} intensity={0.06 * Math.PI} />
      <directionalLight position={[0, 4, -5]} intensity={0.24 * Math.PI} color="#ffffff" />

      <Suspense fallback={null}>
        <ShowcaseBook progress={progress} lowRes={lowPower} />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
