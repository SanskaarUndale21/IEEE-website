"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLoader } from "@/context/LoaderProvider";
import { IMAGES } from "@/constants";

const STAGES = [
  "INITIALIZING",
  "ESTABLISHING ORBIT",
  "LINKING BRANCHES",
  "ADVANCING TECHNOLOGY",
];

/**
 * Chrome only — the flat backdrop and the counter. The globe itself lives in
 * the hero and renders *above* this layer, so when the backdrop peels away
 * there is no swap: the same globe was there the whole time.
 */
export default function Preloader() {
  const { phase, progress } = useLoader();

  const pct = Math.round(progress);
  const stage = STAGES[Math.min(Math.floor(progress / 26), STAGES.length - 1)];
  const blownAway = phase !== "loading";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="preloader"
          className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#111827]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* grid lines — same rhythm as the hero, so the peel reads continuous */}
          <div className="absolute inset-0">
            {[20, 40, 60, 80].map((p) => (
              <div key={`v${p}`} className="absolute top-0 h-full w-px bg-gray-400/15 dark:bg-white/[0.03]" style={{ left: `${p}%` }} />
            ))}
            {[25, 50, 75].map((p) => (
              <div key={`h${p}`} className="absolute left-0 h-px w-full bg-gray-400/15 dark:bg-white/[0.03]" style={{ top: `${p}%` }} />
            ))}
          </div>

          {/* HUD — scales up and blurs out as the globe punches through it */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            animate={
              blownAway
                ? { opacity: 0, scale: 1.4, filter: "blur(8px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <Image src={IMAGES.logo} alt="IEEE" width={56} height={56} className="drop-shadow-xl" priority />
            </motion.div>

            <p className="mt-6 font-display text-[10px] tracking-[0.45em] text-gray-500 dark:text-white/40">
              IEEE SGBIT
            </p>

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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
