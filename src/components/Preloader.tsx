"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scene from "@/components/three/Scene";
import LoaderGlobe from "@/components/three/LoaderGlobe";
import { ParticleField } from "@/components/three/Models";
import { hasPreloadedThisSession, markLoaderDone } from "@/lib/loaderBus";

/* useLayoutEffect on the client, useEffect on the server (avoids the SSR warning). */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const MIN_MS = 2600; // floor so the sequence always reads as an animation
const MAX_MS = 6000; // ceiling — the loader always leaves, even if `load` never fires
const EXIT_MS = 1000;

export default function Preloader() {
  const [show, setShow] = useState(true);
  const [exiting, setExiting] = useState(false);

  const progressRef = useRef(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);

  /* Skip on in-session navigation back to the home page. */
  useIsoLayoutEffect(() => {
    if (hasPreloadedThisSession()) {
      setShow(false);
      markLoaderDone();
    }
  }, []);

  /* Hold the page still while the globe assembles. */
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  useEffect(() => {
    if (!show) return;

    reducedRef.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedRef.current ? 700 : MIN_MS;

    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;
    let assetsReady = document.readyState === "complete";

    const onLoad = () => {
      assetsReady = true;
    };
    if (!assetsReady) window.addEventListener("load", onLoad);

    const start = performance.now();

    const paint = (p: number) => {
      progressRef.current = p;
      if (countRef.current) {
        countRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
    };

    const finish = () => {
      paint(1);
      // Beat of stillness at full size, then hand the globe to the hero.
      holdTimer = setTimeout(() => {
        markLoaderDone();
        setExiting(true);
        exitTimer = setTimeout(() => setShow(false), EXIT_MS);
      }, 420);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 1.5);
      // Stall just short of full until the page has finished loading — but never past the ceiling.
      const open = assetsReady || elapsed >= MAX_MS;
      const p = Math.min(eased, open ? 1 : 0.92);
      paint(p);
      if (p >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    paint(0);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(holdTimer);
      window.removeEventListener("load", onLoad);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="noise fixed inset-0 z-[200] overflow-hidden bg-[#FAFAFA] dark:bg-[#111827]"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: EXIT_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
          role="status"
          aria-label="Loading IEEE SGBIT"
        >
          {/* Same camera, same framing as the hero — so the handoff is a crossfade. */}
          <div className="absolute inset-0">
            <Scene className="h-full w-full">
              <LoaderGlobe progressRef={progressRef} reduced={reducedRef.current} />
              <ParticleField count={700} />
            </Scene>
          </div>

          {/* Chrome: fades out a beat before the globe does. */}
          <motion.div
            className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10"
            animate={{ opacity: exiting ? 0 : 1, y: exiting ? -12 : 0 }}
            transition={{ duration: 0.4, ease: "easeIn" }}
          >
            <div className="flex items-start justify-between text-[9px] font-semibold uppercase tracking-[0.4em] text-gray-500 dark:text-white/35 sm:text-[10px]">
              <span>IEEE SGBIT</span>
              <span className="text-right">Belagavi</span>
            </div>

            <div className="flex items-end justify-between gap-6">
              <p className="max-w-[14rem] text-[9px] uppercase leading-[2] tracking-[0.3em] text-gray-500 dark:text-white/30 sm:max-w-xs sm:text-[10px]">
                Advancing technology for the benefit of humanity
              </p>
              <div className="flex items-baseline gap-1.5 tabular-nums" aria-hidden="true">
                <span
                  ref={countRef}
                  className="font-display text-5xl font-black tracking-tight text-gray-900 dark:text-white sm:text-7xl"
                >
                  000
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-ieee-light">
                  %
                </span>
              </div>
            </div>
          </motion.div>

          {/* Progress hairline */}
          <div className="absolute bottom-0 left-0 h-px w-full bg-gray-400/25 dark:bg-white/10">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-gradient-to-r from-ieee-blue to-ieee-light"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
