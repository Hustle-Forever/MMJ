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
  makeBackTexture,
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

  // Photo-cover textures (front faces)
  const frontTextures = useTexture([COVERS.pink, COVERS.blue, COVERS.green]) as THREE.Texture[];
  frontTextures.forEach((t) => prepCover(t, lowRes));

  // Procedural back + spine textures, one set per colorway
  const backTextures = useMemo(
    () => COLORS.map((c) => makeBackTexture(COLORWAYS[c].stripeA, COLORWAYS[c].stripeB, COLORWAYS[c].ink)),
    [],
  );
  const spineTextures = useMemo(
    () => COLORS.map((c) => makeSpineTexture(COLORWAYS[c].stripeA, COLORWAYS[c].stripeB, COLORWAYS[c].ink)),
    [],
  );
  useEffect(() => () => {
    backTextures.forEach((t) => t.dispose());
    spineTextures.forEach((t) => t.dispose());
  }, [backTextures, spineTextures]);

  // Material refs — 3 front + 3 back + 3 spine
  const frontMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const backMats  = useRef<THREE.MeshStandardMaterial[]>([]);
  const spineMats = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame(() => {
    const p = progress.current ?? 0;
    if (group.current) group.current.rotation.y = p * Math.PI * 2 * 3; // 3 × 360°

    // Triangle crossfade: Pink → Blue → Green → Pink
    const o = [
      Math.max(tri(p, 0, 1 / 3), tri(p, 1, 1 / 3)),
      tri(p, 1 / 3, 1 / 3),
      tri(p, 2 / 3, 1 / 3),
    ];

    // Apply opacity to all face sets simultaneously
    [frontMats, backMats, spineMats].forEach((refs) => {
      refs.current.forEach((m, i) => { if (m) m.opacity = o[i]; });
    });
  });

  return (
    <group ref={group}>
      <NotebookBody />

      {/* Front covers — stacked transparent planes (one per colorway) */}
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

      {/* Back covers — same crossfade, facing -Z */}
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

      {/* Spine faces — facing -X, same crossfade */}
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
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 6]} intensity={0.85} />
      <directionalLight position={[-4, 1, 3]} intensity={0.5} />
      <directionalLight position={[0, -3, 4]} intensity={0.22} />
      {!lowPower && <directionalLight position={[0, 4, -5]} intensity={0.35} color="#ffffff" />}

      <Suspense fallback={null}>
        <ShowcaseBook progress={progress} lowRes={lowPower} />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
