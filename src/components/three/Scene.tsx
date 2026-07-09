"use client";

import { Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";

import { Notebook, type NotebookColor } from "./Notebook";

/**
 * <Scene /> — reusable studio stage for the 3D notebook.
 * Transparent canvas overlaying the DOM fabric + pedestal. Soft 3-point
 * lighting, a grounding contact shadow, gentle float, and a 2–4° mouse tilt.
 * Client-only and lazy-loaded — three never touches the initial bundle or SSR.
 * Reduced-motion / mobile never mount this (the flat cover is shown instead).
 */

function Rig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    // Gentle float: vertical bob + tiny rotation drift.
    g.position.y = Math.sin(t * 0.8) * 0.06;
    const drift = Math.sin(t * 0.4) * 0.04;

    // Mouse tilt, clamped to ~3–4° and eased toward the pointer.
    const targetY = pointer.x * 0.07 + drift;
    const targetX = -pointer.y * 0.05;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 4, delta);
  });

  return <group ref={group}>{children}</group>;
}

export default function Scene({ color = "pink" as NotebookColor }: { color?: NotebookColor }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 30 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Soft studio lighting: key + soft fill + gentle rim. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} />
      <directionalLight position={[-5, 2, 3]} intensity={0.5} />
      <directionalLight position={[0, 4, -6]} intensity={1.1} color="#ffffff" />

      <Suspense fallback={null}>
        <Rig>
          <Notebook color={color} />
        </Rig>
        {/* Soft contact shadow grounds the book on the still pedestal. */}
        <ContactShadows
          position={[0, -1.72, 0]}
          opacity={0.32}
          scale={6}
          blur={2.6}
          far={3}
          resolution={512}
          color="#0b5fa5"
        />
      </Suspense>
    </Canvas>
  );
}
