"use client";

import { Suspense, useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { NotebookBody, NB, COVERS, prepCover } from "./Notebook";

const { W, H, D } = NB;

/** Triangle: 1 at center, 0 at ±width. */
function tri(p: number, c: number, w: number) {
  const d = Math.abs(p - c);
  return d >= w ? 0 : 1 - d / w;
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
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
  const textures = useTexture([COVERS.pink, COVERS.blue, COVERS.green]) as THREE.Texture[];
  textures.forEach((t) => prepCover(t, lowRes));
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame(() => {
    const p = progress.current ?? 0;
    if (group.current) group.current.rotation.y = p * Math.PI * 2 * 3; // 3 × 360°
    // Continuous crossfade Pink → Blue → Green → Pink.
    const o = [
      Math.max(tri(p, 0, 1 / 3), tri(p, 1, 1 / 3)),
      tri(p, 1 / 3, 1 / 3),
      tri(p, 2 / 3, 1 / 3),
    ];
    mats.current.forEach((m, i) => {
      if (m) m.opacity = o[i];
    });
  });

  return (
    <group ref={group}>
      <NotebookBody />
      {textures.map((tex, i) => (
        <mesh key={i} position={[0, 0, D / 2 + 0.002 + i * 0.001]} renderOrder={i + 1}>
          <planeGeometry args={[W * 0.97, H * 0.97]} />
          <meshStandardMaterial
            ref={(m) => {
              if (m) mats.current[i] = m as THREE.MeshStandardMaterial;
            }}
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

/** Scroll-driven 3D notebook: reuses the hero book + lighting exactly. */
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
      camera={{ position: [0, 0, 6], fov: 30 }}
      dpr={[1, 2]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: lowPower ? "low-power" : "high-performance",
      }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Same soft studio rig as the hero. */}
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
