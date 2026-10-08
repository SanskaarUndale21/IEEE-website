"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; r: number; vy: number; vx: number; a: number; hue: number };

/** Slow rising embers. Pure canvas, static when reduced motion is requested. */
export default function Embers({ count = 70 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const make = (fromBottom: boolean): P => ({
      x: Math.random() * w,
      y: fromBottom ? h + Math.random() * 40 : Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.15 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      a: 0.2 + Math.random() * 0.7,
      hue: [152, 152, 152, 285, 225][Math.floor(Math.random() * 5)],
    });

    let ps: P[] = [];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = Array.from({ length: count }, () => make(false));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        const fade = Math.min(1, p.y / (h * 0.35));
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue},85%,62%,${p.a * fade})`;
        ctx.shadowColor = `hsla(${p.hue},90%,60%,0.9)`;
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduce) {
          p.y -= p.vy;
          p.x += p.vx + Math.sin(p.y * 0.01) * 0.15;
          if (p.y < -10) Object.assign(p, make(true));
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}
