"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });
const LoaderGlobe = dynamic(() => import("@/components/three/LoaderGlobe"), { ssr: false });

const SESSION_KEY = "ieee-sgbit-preloaded";
const OVERLAY_ID = "ieee-preloader";
const MIN_MS = 2400;
const MAX_MS = 5000;
const EXIT_MS = 800;

/** runs before paint on the client, falls back to useEffect during SSR */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Hides the overlay synchronously on repeat visits, before the browser paints.
 * Without this the server-rendered overlay flashes once on every navigation
 * back to the home page within a session.
 */
const NO_FLASH = `try{if(sessionStorage.getItem('${SESSION_KEY}')){var e=document.getElementById('${OVERLAY_ID}');if(e){e.style.display='none'}}}catch(_){}`;

export default function Preloader() {
  // starts true so the very first server-rendered paint is the loader, never the page
  const [show, setShow] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const progressRef = useRef(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const globeReady = useRef(false);

  const handleGlobeReady = useCallback(() => {
    globeReady.current = true;
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // already played this session: drop it before the first paint
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SESSION_KEY);
    } catch {
      seen = false;
    }
    if (seen) {
      setShow(false);
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(prefersReduced);

    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

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

    const finish = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode: loader simply replays next visit */
      }
      // the hero holds its intro back until the overlay starts clearing
      window.dispatchEvent(new Event("ieee:preloader-done"));
      setExiting(true);
    };

    if (prefersReduced) {
      const t = window.setTimeout(finish, 400);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("load", onLoad);
      };
    }

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / MIN_MS, 1);
      const eased = 1 - Math.pow(1 - t, 1.5);

      // never finish before the globe has actually rendered, or the whole
      // point of the loader is a blank screen followed by a fade
      const canFinish = (assetsReady && globeReady.current) || elapsed >= MAX_MS;
      const p = Math.min(eased, canFinish ? 1 : 0.94);

      progressRef.current = p;
      const pct = Math.round(p * 100);
      if (countRef.current) countRef.current.textContent = String(pct).padStart(2, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      if (p >= 1) {
        finish();
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

  // always give scrolling back, whichever path removed the overlay
  useEffect(() => {
    if (show) return;
    document.body.style.overflow = "";
  }, [show]);

  return (
    <>
      <AnimatePresence onExitComplete={() => setShow(false)}>
        {show && !exiting && (
          <motion.div
            key="preloader"
            id={OVERLAY_ID}
            className="fixed inset-0 z-[9999] flex flex-col bg-[var(--bg)]"
            exit={{ opacity: 0 }}
            transition={{ duration: EXIT_MS / 1000, ease: "easeInOut" }}
          >
            <div className="absolute inset-0">
              <Scene className="h-full w-full">
                <LoaderGlobe
                  progressRef={progressRef}
                  onReady={handleGlobeReady}
                  reducedMotion={reducedMotion}
                />
              </Scene>
            </div>

            {/* copy is pinned to the edges so it never sits on top of the globe */}
            <header className="pointer-events-none relative z-10 flex items-start justify-between p-6 sm:p-10">
              <p className="text-[10px] font-bold tracking-[0.4em] text-[var(--text-primary)] sm:text-xs">
                IEEE SGBIT
              </p>
              <p className="text-[9px] tracking-[0.3em] text-[var(--text-muted)] sm:text-[10px]">
                BELAGAVI
              </p>
            </header>

            <div className="flex-1" />

            <footer className="pointer-events-none relative z-10 p-6 sm:p-10">
              <div className="mb-4 flex items-end justify-between">
                <p className="max-w-[14rem] text-[9px] leading-relaxed tracking-[0.25em] text-[var(--text-muted)] sm:text-[10px]">
                  ADVANCING TECHNOLOGY
                  <br />
                  FOR HUMANITY
                </p>
                <p className="flex items-baseline gap-1 font-display text-4xl font-light leading-none text-[var(--text-primary)] sm:text-6xl">
                  <span ref={countRef}>00</span>
                  <span className="text-xs text-[var(--text-muted)] sm:text-sm">%</span>
                </p>
              </div>
              <div className="h-px w-full bg-[var(--border)]">
                <div
                  ref={barRef}
                  className="h-full origin-left bg-[var(--ieee-light)]"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      {/* without JS the overlay can never animate away, so never show it */}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: `#${OVERLAY_ID}{display:none!important}` }} />
      </noscript>
    </>
  );
}
