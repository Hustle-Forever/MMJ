"use client";

import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { Notebook, type NotebookColor } from "./Notebook";

/** Fires once — mounted only after the Notebook's texture has loaded, so it
 * confirms the 3D book is actually rendering (used to hide the flat fallback). */
function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

/**
 * <Scene /> — reusable studio stage for the 3D notebook.
 * Transparent canvas over the DOM stripes. Bright, soft studio lighting so the
 * book is the richest thing on screen and pops off the pale background. The
 * book rests at a gentle near-front three-quarter angle, floats subtly, and
 * tilts a few degrees toward the cursor. No pedestal, no grounding shadow — it
 * floats cleanly.
 *
 * `lowPower` (capable phones): softer float, low-power GL hint, downscaled
 * texture (via Notebook). Desktop path is unchanged. Client-only + lazy-loaded.
 */

// Resting orientation — three-quarter, cover clearly facing the viewer.
const BASE_ROT_Y = -0.24; // ~14°
const BASE_ROT_X = -0.04;

function Rig({ children, subtle = false }: { children: ReactNode; subtle?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const bob = subtle ? 0.05 : 0.07;
  const driftAmp = subtle ? 0.02 : 0.03;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    // Subtle float: vertical bob + tiny rotation drift around the resting angle.
    g.position.y = Math.sin(t * 0.8) * bob;
    const drift = Math.sin(t * 0.4) * driftAmp;

    // Mouse tilt eased around the resting three-quarter angle (~3–4°).
    // On touch there is no pointer, so it settles to base + drift.
    const targetY = BASE_ROT_Y + pointer.x * 0.06 + drift;
    const targetX = BASE_ROT_X - pointer.y * 0.05;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 4, delta);
  });

  return <group ref={group}>{children}</group>;
}

export default function Scene({
  color = "pink" as NotebookColor,
  lowPower = false,
  onReady,
}: {
  color?: NotebookColor;
  lowPower?: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      // flat = no ACES tone mapping, so the pastel cover keeps its true color
      // instead of going muddy/dark. Light sums are kept near 1 so the pale
      // cover reads crisp rather than blowing out to white.
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
      {/* Soft studio: key + fill so no face is muddy, gentle bottom + rim
          fill (rim dropped on mobile). Tuned to stay just under clipping. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 6]} intensity={0.85} />
      <directionalLight position={[-4, 1, 3]} intensity={0.5} />
      <directionalLight position={[0, -3, 4]} intensity={0.22} />
      {!lowPower && <directionalLight position={[0, 4, -5]} intensity={0.35} color="#ffffff" />}

      <Suspense fallback={null}>
        <Rig subtle={lowPower}>
          <Notebook color={color} lowRes={lowPower} />
        </Rig>
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
