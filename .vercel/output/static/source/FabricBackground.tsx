"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * FabricBackground — Curated by MMJ
 * Animated blush satin stripe background that ripples like fabric in a
 * light breeze, with an almost-imperceptible horizontal drift and a very
 * subtle mouse response.
 *
 * Palette is locked to the brand tokens:
 *   blush  #F8E6EC
 *   blush2 #F4D8DF
 *
 * Usage:
 *   <FabricBackground className="fixed inset-0 -z-10" />
 *
 * Notes:
 * - Respects prefers-reduced-motion: freezes the ripple to a static gradient.
 * - Disposes GL resources on unmount.
 * - Cheap fragment shader; targets 60fps. On very small screens it lowers
 *   the pixel ratio automatically.
 */
export default function FabricBackground({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_blush: { value: new THREE.Color(0xf8e6ec) },
      u_blush2: { value: new THREE.Color(0xf4d8df) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `void main(){ gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_res;
        uniform vec2 u_mouse;
        uniform vec3 u_blush;
        uniform vec3 u_blush2;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p){
          vec2 i=floor(p); vec2 f=fract(p);
          float a=hash(i), b=hash(i+vec2(1.,0.));
          float c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
          vec2 u=f*f*(3.-2.*f);
          return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
        }

        void main(){
          vec2 uv = gl_FragCoord.xy / u_res.xy;
          float aspect = u_res.x / u_res.y;
          vec2 p = uv; p.x *= aspect;

          float drift = u_time * 0.012;

          float n  = noise(vec2(p.x*2.2 + drift, p.y*1.4 + u_time*0.05));
          float n2 = noise(vec2(p.x*4.5 - drift*0.6, p.y*2.0 - u_time*0.03));
          float ripple = (n-0.5)*0.06 + (n2-0.5)*0.03;

          float md = distance(uv, u_mouse);
          ripple += (0.5 - smoothstep(0.0, 0.5, md)) * 0.02;

          float stripes = 10.0;
          float sx = (uv.x + ripple + drift*0.3) * stripes;
          float t = 0.5 - 0.5*cos(6.2831853 * fract(sx));
          t = smoothstep(0.15, 0.85, t);

          vec3 col = mix(u_blush, u_blush2, t);

          float sheen = 0.04 * sin((p.x*3.0 + p.y*5.0) + u_time*0.15 + ripple*8.0);
          col += sheen;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      uniforms.u_res.value.set(w, h);
    };
    window.addEventListener("resize", resize);
    resize();

    const target = { x: 0.5, y: 0.5 };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const start = performance.now();

    const render = () => {
      uniforms.u_time.value = prefersReduced
        ? 0
        : (performance.now() - start) / 1000;
      uniforms.u_mouse.value.x += (target.x - uniforms.u_mouse.value.x) * 0.05;
      uniforms.u_mouse.value.y += (target.y - uniforms.u_mouse.value.y) * 0.05;
      renderer.render(scene, cam);
      if (!prefersReduced) raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
