"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uFade;
uniform vec2 uMouse;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  p += uMouse * 0.035;
  float t = uTime * 0.045;

  vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 2.2 + q * 2.0 + vec2(1.7, 9.2) + t * 1.5), fbm(p * 2.2 + q * 2.0 + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.8 + r * 2.2);

  float side = smoothstep(-0.32, 0.32, p.x + (f - 0.5) * 0.55);
  vec3 teal  = vec3(0.02, 0.33, 0.36);
  vec3 green = vec3(0.12, 0.88, 0.42);
  vec3 blue  = vec3(0.10, 0.22, 1.00);
  vec3 vio   = vec3(0.60, 0.18, 0.95);
  vec3 left  = mix(teal, green, smoothstep(0.35, 0.85, f));
  vec3 right = mix(blue, vio, smoothstep(0.4, 0.9, r.x));
  vec3 col = mix(left, right, side);

  col *= smoothstep(0.12, 0.8, f) * 2.3;

  // dark smoke clots
  float clot = smoothstep(0.45, 0.78, fbm(p * 3.0 + q * 3.0 + t * 2.0));
  col *= 1.0 - clot * 0.6;

  // hot core where the two sides collide
  float core = exp(-length(p * vec2(1.0, 0.85)) * 3.4);
  col += vec3(0.62, 0.95, 0.22) * core * 0.75 * (f + 0.3);

  // lightning between the sides
  float arcs = 0.0;
  for (int i = 0; i < 3; i++){
    float fi = float(i);
    float y = p.y * (3.0 + fi) + uTime * 0.9 + fi * 7.0;
    float x = (noise(vec2(y, fi * 3.1)) - 0.5) * 0.38 + (noise(vec2(y * 3.0, fi)) - 0.5) * 0.09;
    float d = abs(p.x - x);
    float strike = step(0.78, noise(vec2(floor(uTime * 5.0 + fi * 9.0), fi * 1.7)));
    arcs += (0.0032 / (d + 0.0022)) * (0.18 + 0.82 * strike);
  }
  col += vec3(0.92, 0.45, 1.0) * arcs * 0.2 * smoothstep(0.75, 0.0, abs(p.y));

  float vig = smoothstep(1.5, 0.3, length(p * vec2(0.8, 1.0)));
  col *= vig;
  gl_FragColor = vec4(col * uFade, 1.0);
}
`;

/** Fixed, generated nebula. Brightest at the top of the page, dims as you scroll. */
export default function Nebula() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uFade = gl.getUniformLocation(prog, "uFade");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const scale = 0.5;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.floor(window.innerWidth * dpr * scale));
      canvas.height = Math.max(2, Math.floor(window.innerHeight * dpr * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    let mx = 0, my = 0, tx = 0, ty = 0, raf = 0, last = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const draw = (now: number) => {
      if (now - last > 33 || reduce) {
        last = now;
        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;
        const k = Math.min(1, window.scrollY / (window.innerHeight * 1.1));
        const fade = 1 - 0.7 * (k * k * (3 - 2 * k));
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, reduce ? 12 : now / 1000);
        gl.uniform1f(uFade, fade);
        gl.uniform2f(uMouse, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    if (reduce) window.addEventListener("scroll", () => draw(performance.now()), { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-[#02070a]"
    />
  );
}
