"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Scene from "@/components/three/Scene";
import { PreloaderGlobe, type LoadPhase } from "@/components/three/Models";
import { useLoader } from "@/context/LoaderProvider";
import { IMAGES } from "@/constants";

/* Minimum time the story is allowed to run, even on a warm cache. */
const MIN_DURATION = 1500;
/* Time from "reveal" trigger until the overlay is gone. */
const REVEAL_DURATION = 900;
/* Plays once per tab, not on every navigation back to the homepage. */
const SESSION_KEY = "ieee-sgbit-preloaded";

const STAGES = [
  "INITIALIZING",
  "ESTABLISHING ORBIT",
  "LINKING BRANCHES",
  "ADVANCING TECHNOLOGY",
];

/** The canvas never needs to re-render — the frame loop reads the refs. */
const GlobeStage = memo(function GlobeStage({
  progressRef,
  phaseRef,
}: {
  progressRef: React.MutableRefObject<number>;
  phaseRef: React.MutableRefObject<LoadPhase>;
}) {
  return (
    <Scene className="h-full w-full">
      <PreloaderGlobe progressRef={progressRef} phaseRef={phaseRef} />
    </Scene>
  );
});

type Mode = "pending" | "play" | "skip";

export default function Preloader() {
  const { finish } = useLoader();
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>("pending");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<LoadPhase>("loading");
  const [gone, setGone] = useState(false);

  // refs drive the r3f frame loop without re-rendering the canvas
  const progressRef = useRef(0);
  const phaseRef = useRef<LoadPhase>("loading");

  phaseRef.current = phase;

  /* ── the story belongs to the homepage hero, and only on a cold visit ── */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY) === "1";

    if (pathname !== "/" || seen || reduced) {
      setMode("skip");
      setGone(true);
      finish();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    setMode("play");
  }, [pathname, finish]);

  /* ── drive the counter: eases toward 100, gated by window load + min time ── */
  useEffect(() => {
    if (mode !== "play") return;
    const start = performance.now();
    let assetsReady = document.readyState === "complete";

    const onLoad = () => { assetsReady = true; };
    if (!assetsReady) window.addEventListener("load", onLoad);

    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const timeShare = Math.min(elapsed / MIN_DURATION, 1);
      // hold at 92 until both the clock and the assets say go
      const ceiling = assetsReady && timeShare >= 1 ? 100 : Math.min(92, timeShare * 92);

      const p = progressRef.current;
      const next = Math.min(p + (ceiling - p) * 0.08 + 0.25, 100);
      progressRef.current = next;

      // only re-render the HUD when the whole number actually changes
      setProgress((prev) => (Math.round(prev) === Math.round(next) ? prev : next));

      if (next < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, [mode]);

  /* ── at 100 the globe punches out and the overlay peels away ── */
  useEffect(() => {
    if (mode !== "play" || progress < 99.5 || phase === "reveal") return;
    setPhase("reveal");
    const t = setTimeout(() => {
      // land the visitor at the top of the hero, since the overlay hid the page
      window.scrollTo(0, 0);
      finish();
      setGone(true);
    }, REVEAL_DURATION);
    return () => clearTimeout(t);
  }, [mode, progress, phase, finish]);

  if (mode === "skip") return null;

  const pct = Math.round(progress);
  const stage = STAGES[Math.min(Math.floor(progress / 26), STAGES.length - 1)];

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#111827]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* while deciding, paint nothing but the flat backdrop — this avoids
              spinning up a WebGL context on routes that skip the story */}
          {mode === "play" && (
          <>
          {/* grid lines — same rhythm as the hero, so the transition reads continuous */}
          <div className="pointer-events-none absolute inset-0">
            {[20, 40, 60, 80].map((p) => (
              <div key={`v${p}`} className="absolute top-0 h-full w-px bg-gray-400/15 dark:bg-white/[0.03]" style={{ left: `${p}%` }} />
            ))}
            {[25, 50, 75].map((p) => (
              <div key={`h${p}`} className="absolute left-0 h-px w-full bg-gray-400/15 dark:bg-white/[0.03]" style={{ top: `${p}%` }} />
            ))}
          </div>

          {/* the globe — identical camera + scale to the hero canvas */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: phase === "reveal" ? 0.55 : 0.85 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <GlobeStage progressRef={progressRef} phaseRef={phaseRef} />
          </motion.div>

          {/* logo rises out of the globe core */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            animate={
              phase === "reveal"
                ? { opacity: 0, scale: 1.35, filter: "blur(6px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Image src={IMAGES.logo} alt="IEEE" width={56} height={56} className="drop-shadow-xl" priority />
            </motion.div>

            <p className="mt-6 font-display text-[10px] tracking-[0.45em] text-gray-500 dark:text-white/40">
              IEEE SGBIT
            </p>

            {/* progress bar */}
            <div className="mt-5 h-px w-40 overflow-hidden bg-gray-300 dark:bg-white/10 sm:w-56">
              <div
                className="h-full bg-gradient-to-r from-ieee-blue to-ieee-light"
                style={{ width: `${pct}%`, transition: "width 120ms linear" }}
              />
            </div>

            <div className="mt-3 flex w-40 items-center justify-between sm:w-56">
              <span className="text-[8px] tracking-[0.3em] text-gray-500 dark:text-white/30">{stage}</span>
              <span className="font-display text-[10px] tabular-nums tracking-widest text-gray-700 dark:text-white/60">
                {String(pct).padStart(3, "0")}
              </span>
            </div>
          </motion.div>
          </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
