"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });
const LoaderGlobe = dynamic(() => import("@/components/three/LoaderGlobe"), { ssr: false });

const SESSION_KEY = "ieee-sgbit-preloaded";
const MIN_MS = 2200;
const MAX_MS = 5000;

export default function Preloader() {
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const progressRef = useRef(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setShow(true);

    const start = performance.now();
    let assetsReady = false;
    let raf = 0;

    const onLoad = () => {
      assetsReady = true;
    };
    if (document.readyState === "complete") {
      assetsReady = true;
    } else {
      window.addEventListener("load", onLoad);
    }

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / MIN_MS, 1);
      const eased = 1 - Math.pow(1 - t, 1.5);
      const canFinish = assetsReady || elapsed >= MAX_MS;
      const p = Math.min(eased, canFinish ? 1 : 0.94);

      progressRef.current = p;
      const pct = Math.round(p * 100);
      if (countRef.current) countRef.current.textContent = String(pct);
      if (barRef.current) barRef.current.style.width = `${pct}%`;

      if (p >= 1) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setExiting(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  return (
    <AnimatePresence onExitComplete={() => setShow(false)}>
      {show && !exiting && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg)]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="absolute inset-0">
            <Scene className="h-full w-full">
              <LoaderGlobe progressRef={progressRef} />
            </Scene>
          </div>

          <div className="pointer-events-none relative z-10 flex w-full max-w-xs flex-col items-center px-6">
            <p className="mb-1 text-xs font-bold tracking-[0.5em] text-[var(--text-primary)]">
              IEEE SGBIT
            </p>
            <p className="mb-8 text-[9px] tracking-[0.3em] text-[var(--text-muted)]">
              STUDENT BRANCH
            </p>

            <div className="flex items-baseline gap-1 font-display text-2xl font-light text-[var(--text-primary)]">
              <span ref={countRef}>0</span>
              <span className="text-xs text-[var(--text-muted)]">%</span>
            </div>

            <div className="mt-4 h-px w-full overflow-hidden bg-[var(--border)]">
              <div ref={barRef} className="h-full bg-[var(--ieee-light)]" style={{ width: "0%" }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
