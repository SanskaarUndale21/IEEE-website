"use client";

/**
 * FluidCursor — a colored dye trail that follows the pointer like liquid,
 * built on OGL's Flowmap (a pointer-driven velocity field with its own
 * dissipation) plus a second ping-ponged "dye" buffer that advects along
 * that velocity field and fades over time. This is a lighter approximation
 * of a full pressure-projected fluid solver — no incompressibility pass —
 * but reads as convincing liquid motion for a cursor-trail background.
 */

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, RenderTarget, Flowmap, Vec2 } from "ogl";

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(v.slice(0, 6), 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
};

const passVertex = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const dyeFragment = `
  precision highp float;

  uniform sampler2D tDye;
  uniform sampler2D tFlow;
  uniform float uDissipation;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uSplatRadius;
  uniform float uSplatIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying vec2 vUv;

  void main() {
    vec2 flow = texture2D(tFlow, vUv).rg;
    vec2 warpedUv = vUv - flow * 0.035;
    vec4 dye = texture2D(tDye, warpedUv) * uDissipation;

    vec2 cursor = vUv - uMouse;
    cursor.x *= uAspect;
    float dist = length(cursor);
    float falloff = smoothstep(uSplatRadius, 0.0, dist);

    float speed = clamp(length(uVelocity) * 12.0, 0.0, 1.0);
    vec3 splatColor = mix(uColorA, uColorB, speed) * uSplatIntensity;

    dye.rgb += splatColor * falloff * max(speed, 0.22);
    dye.a = clamp(dye.a + falloff * speed, 0.0, 1.0);

    gl_FragColor = dye;
  }
`;

const displayFragment = `
  precision highp float;
  uniform sampler2D tDye;
  varying vec2 vUv;
  void main() {
    vec3 col = texture2D(tDye, vUv).rgb;
    col = col / (1.0 + col);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface FluidCursorProps {
  colorA?: string;
  colorB?: string;
  falloff?: number;
  flowDissipation?: number;
  dyeDissipation?: number;
  splatRadius?: number;
  intensity?: number;
  className?: string;
}

export default function FluidCursor({
  colorA = "#00629B",
  colorB = "#0EA5E9",
  falloff = 0.28,
  flowDissipation = 0.92,
  dyeDissipation = 0.965,
  splatRadius = 0.14,
  intensity = 1,
  className = "",
}: FluidCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: false,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    container.appendChild(gl.canvas);

    const flowmap = new Flowmap(gl, { size: 128, falloff, dissipation: flowDissipation });

    let dyeRead: RenderTarget;
    let dyeWrite: RenderTarget;
    const makeDyeTargets = (w: number, h: number) => {
      const opts = { width: w, height: h, depth: false, minFilter: gl.LINEAR };
      dyeRead = new RenderTarget(gl, opts);
      dyeWrite = new RenderTarget(gl, opts);
    };

    const dyeUniforms = {
      tDye: { value: null as unknown },
      tFlow: { value: flowmap.uniform.value as unknown },
      uDissipation: { value: dyeDissipation },
      uAspect: { value: 1 },
      uMouse: { value: new Vec2(-1, -1) },
      uVelocity: { value: new Vec2() },
      uSplatRadius: { value: splatRadius },
      uSplatIntensity: { value: intensity },
      uColorA: { value: hexToRgb(colorA) },
      uColorB: { value: hexToRgb(colorB) },
    };

    const dyeProgram = new Program(gl, {
      vertex: passVertex,
      fragment: dyeFragment,
      uniforms: dyeUniforms,
      depthTest: false,
    });
    const dyeMesh = new Mesh(gl, { geometry: new Triangle(gl), program: dyeProgram });

    const displayUniforms = { tDye: { value: null as unknown } };
    const displayProgram = new Program(gl, {
      vertex: passVertex,
      fragment: displayFragment,
      uniforms: displayUniforms,
      depthTest: false,
    });
    const displayMesh = new Mesh(gl, { geometry: new Triangle(gl), program: displayProgram });

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      const simW = Math.max(64, Math.min(900, Math.round(w * 0.75)));
      const simH = Math.max(64, Math.round(simW * (h / w)));
      makeDyeTargets(simW, simH);
      dyeUniforms.uAspect.value = w / h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const mouse = new Vec2(-1, -1);
    const velocity = new Vec2();
    let lastMouse: Vec2 | null = null;
    let lastTime = 0;
    let needsUpdate = false;

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      if (!lastMouse) {
        lastMouse = new Vec2(x, y);
        lastTime = performance.now();
      }
      const deltaX = x - lastMouse.x;
      const deltaY = y - lastMouse.y;
      lastMouse.set(x, y);
      const time = performance.now();
      const delta = Math.max(10.4, time - lastTime);
      lastTime = time;
      mouse.set(x, y);
      velocity.set(deltaX / delta, deltaY / delta);
      needsUpdate = true;
    };

    // listens on window (not the container) so the trail tracks the cursor
    // everywhere on the page — the container itself stays pointer-events-none
    // and never intercepts clicks on the content stacked above it
    const onMove = (e: PointerEvent) => updateMouse(e.clientX, e.clientY);
    const onLeave = () => {
      lastMouse = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });

    let rafId: number;
    const loop = () => {
      rafId = requestAnimationFrame(loop);

      if (!needsUpdate) velocity.set(0, 0);
      needsUpdate = false;

      flowmap.aspect = dyeUniforms.uAspect.value;
      flowmap.mouse.copy(mouse);
      flowmap.velocity.lerp(velocity, velocity.len() ? 0.5 : 0.1);
      flowmap.update();

      dyeUniforms.tFlow.value = flowmap.uniform.value;
      dyeUniforms.tDye.value = dyeRead.texture;
      (dyeUniforms.uMouse.value as Vec2).copy(mouse);
      (dyeUniforms.uVelocity.value as Vec2).copy(flowmap.velocity);

      renderer.render({ scene: dyeMesh, target: dyeWrite, clear: false });
      const temp = dyeRead;
      dyeRead = dyeWrite;
      dyeWrite = temp;

      displayUniforms.tDye.value = dyeRead.texture;
      renderer.render({ scene: displayMesh });
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("mouseleave", onLeave);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, [colorA, colorB, falloff, flowDissipation, dyeDissipation, splatRadius, intensity]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none relative h-full w-full overflow-hidden ${className}`.trim()}
    />
  );
}
