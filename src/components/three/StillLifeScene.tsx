"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Environment, Lightformer, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

import {
  NotebookBody,
  NB,
  COVERS,
  COLORWAYS,
  prepCover,
  makeSpineTexture,
  type NotebookColor,
} from "./Notebook";

const { W, H, D } = NB;

/**
 * Procedural linen-weave bump map — fine warp/weft lines + speckle so the
 * hardcover cloth catches the raking light with visible grain instead of
 * reading as smooth plastic. Mid-gray base = neutral height.
 */
function makeLinenBump(): THREE.CanvasTexture {
  const S = 256;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, S, S);
  // Weft (horizontal threads)
  for (let y = 0; y < S; y += 2) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.07})`;
    ctx.fillRect(0, y, S, 1);
  }
  // Warp (vertical threads) — slightly sparser so the weave reads directional
  for (let x = 0; x < S; x += 3) {
    ctx.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
    ctx.fillRect(x, 0, 1, S);
  }
  // Slub speckle
  for (let i = 0; i < 340; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "0,0,0"},${0.05 + Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 2, 1);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 3.5);
  return tex;
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

/**
 * One notebook for the still life: shared body shell (bump-mapped via ref) +
 * real photo covers + striped spine, all with the linen grain and env-map
 * response tuned for the dark set (roughness ~0.65 per the client's brief).
 */
function StillLifeBook({ color, linen }: { color: NotebookColor; linen: THREE.CanvasTexture }) {
  const [front, back] = useTexture([COVERS[color].front, COVERS[color].back]);
  useMemo(() => {
    prepCover(front, false);
    prepCover(back, false);
  }, [front, back]);

  const cw = COLORWAYS[color];
  const spineTex = useMemo(() => makeSpineTexture(cw.stripeA, cw.stripeB), [cw.stripeA, cw.stripeB]);
  useEffect(() => () => spineTex.dispose(), [spineTex]);

  return (
    <group>
      <NotebookBody
        color={color}
        showRibbon={false}
        shellRef={(m) => {
          if (m) {
            m.bumpMap = linen;
            m.bumpScale = 0.03;
            m.roughness = 0.65;
            m.envMapIntensity = 0.7;
            m.needsUpdate = true;
          }
        }}
      />
      <mesh position={[0, 0, D / 2 + 0.002]}>
        <planeGeometry args={[W * 0.97, H * 0.97]} />
        <meshStandardMaterial
          map={front}
          transparent
          roughness={0.66}
          metalness={0}
          bumpMap={linen}
          bumpScale={0.035}
          envMapIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, 0, -(D / 2 + 0.002)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W * 0.97, H * 0.97]} />
        <meshStandardMaterial
          map={back}
          transparent
          roughness={0.68}
          metalness={0}
          bumpMap={linen}
          bumpScale={0.035}
          envMapIntensity={0.3}
        />
      </mesh>
      <mesh position={[-(W / 2 + 0.001), 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D * 0.88, H * 0.97]} />
        <meshStandardMaterial map={spineTex} roughness={0.6} metalness={0} envMapIntensity={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Hover-tilt wrapper (desktop only — the scene itself is desktop-gated).
 * frameloop is "demand": we invalidate only while the tilt is settling, so an
 * idle still life renders zero frames.
 */
function TiltGroup({
  position,
  rotation,
  hoverRot,
  hoverLift = 0.05,
  children,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  hoverRot: [number, number, number];
  hoverLift?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const target = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-5 * Math.min(delta, 0.05));
    t.current += (target.current - t.current) * k;
    g.rotation.set(
      rotation[0] + hoverRot[0] * t.current,
      rotation[1] + hoverRot[1] * t.current,
      rotation[2] + hoverRot[2] * t.current,
    );
    g.position.y = position[1] + hoverLift * t.current;
    if (Math.abs(target.current - t.current) > 0.002) invalidate();
  });

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onPointerEnter={() => {
        target.current = 1;
        invalidate();
      }}
      onPointerLeave={() => {
        target.current = 0;
        invalidate();
      }}
    >
      {children}
    </group>
  );
}

/**
 * Satin ribbon pooling on the set floor — two joined segments at an angle so
 * it folds like fabric instead of reading as a straight rod. Root sits tight
 * against the page block it "spills" from.
 */
function PooledRibbon({
  color,
  position,
  rotationY,
  bend = 0.7,
}: {
  color: string;
  position: [number, number, number];
  rotationY: number;
  bend?: number;
}) {
  const mat = (
    <meshPhysicalMaterial
      color={color}
      roughness={0.24}
      metalness={0}
      sheen={1}
      sheenRoughness={0.22}
      sheenColor="#ffffff"
      envMapIntensity={1.1}
    />
  );
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0.3, 0, 0]}>
        <boxGeometry args={[0.6, 0.012, 0.13]} />
        {mat}
      </mesh>
      <mesh position={[0.58, 0, 0.02]} rotation={[0, bend, 0]}>
        <boxGeometry args={[0.55, 0.012, 0.13]} />
        {mat}
      </mesh>
    </group>
  );
}

function Composition({ onReady }: { onReady?: () => void }) {
  const linen = useMemo(() => makeLinenBump(), []);
  useEffect(() => () => linen.dispose(), [linen]);

  return (
    <>
      {/* Sage — the base of the stack, lying flat, turned toward the light */}
      <TiltGroup
        position={[0.2, 0.11, -0.1]}
        rotation={[-Math.PI / 2, 0, 0.3]}
        hoverRot={[0.09, 0, 0]}
      >
        <StillLifeBook color="green" linen={linen} />
      </TiltGroup>

      {/* Blush — resting on the sage, counter-rotated like a dealt card */}
      <TiltGroup
        position={[-0.18, 0.34, 0.18]}
        rotation={[-Math.PI / 2, 0, -0.14]}
        hoverRot={[0.09, 0, 0]}
      >
        <StillLifeBook color="pink" linen={linen} />
      </TiltGroup>

      {/* Ocean — standing behind the stack, leaning back into the dark */}
      <TiltGroup
        position={[1.82, 1.36, -1.05]}
        rotation={[-0.3, -0.5, 0.03]}
        hoverRot={[0.05, 0.09, 0]}
        hoverLift={0.03}
      >
        <StillLifeBook color="blue" linen={linen} />
      </TiltGroup>

      {/* Ribbons spilling from the stack and pooling on the floor */}
      <PooledRibbon color={COLORWAYS.pink.ribbon} position={[-1.15, 0.02, 0.65]} rotationY={2.75} bend={-0.8} />
      <PooledRibbon color={COLORWAYS.green.ribbon} position={[0.95, 0.02, 0.95]} rotationY={-0.45} bend={0.9} />
      <PooledRibbon color={COLORWAYS.blue.ribbon} position={[2.15, 0.02, -0.35]} rotationY={1.15} bend={0.65} />

      {/* Soft contact shadow — baked once (frames=1), zero per-frame cost */}
      <ContactShadows
        position={[0.4, 0, 0]}
        opacity={0.55}
        scale={9}
        blur={2.6}
        far={3}
        resolution={512}
        color="#020c16"
        frames={1}
      />

      <Ready onReady={onReady} />
    </>
  );
}

/**
 * The Still Life — three notebooks on a dark set, lit like a product
 * photograph. Environment is procedural (Lightformers, no network HDR):
 * a soft overhead panel plus a warm thin strip from the upper left that
 * produces the readable raking specular along the covers.
 */
export default function StillLifeScene({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      flat
      frameloop="demand"
      camera={{ position: [0.4, 2.3, 8.2], fov: 28 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ camera }) => camera.lookAt(0.35, 0.85, 0)}
    >
      {/* Darker rig than the hero — this is the page's one moody chapter.
          Raking key from upper-left; readable but low-filled shadows. */}
      <ambientLight intensity={0.26 * Math.PI} />
      <directionalLight position={[-5, 3.5, 2.5]} intensity={0.42 * Math.PI} color="#fff7ee" />
      <directionalLight position={[4, 1.5, 3]} intensity={0.12 * Math.PI} />
      <directionalLight position={[0, 3, -4]} intensity={0.18 * Math.PI} />

      <Suspense fallback={null}>
        {/* Procedural env map — soft overhead + warm raking strip = the
            specular streak across the linen covers. frames=1: baked once. */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={1.1}
            position={[0, 5, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[9, 9, 1]}
          />
          <Lightformer
            form="rect"
            intensity={2.6}
            color="#fff2e2"
            position={[-5, 3.2, 2]}
            rotation={[0, Math.PI / 2.6, 0]}
            scale={[6, 0.55, 1]}
          />
        </Environment>
        <Composition onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
