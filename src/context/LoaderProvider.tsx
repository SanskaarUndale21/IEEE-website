"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

/**
 * loading  — globe is a speck, growing as assets arrive
 * reveal   — globe punches past full size, shockwaves fire, HUD blows away
 * handoff  — globe has settled at hero scale; the flat backdrop peels off
 * done     — the globe is just the hero's ambient globe again
 */
export type LoadPhase = "loading" | "reveal" | "handoff" | "done";

/** Minimum time the story runs, even on a warm cache. */
const MIN_DURATION = 1500;
const REVEAL_DURATION = 900;
const HANDOFF_DURATION = 700;
/** Hard ceiling — the site must never stay gated, whatever happens above. */
const SAFETY_TIMEOUT = 7000;
/** Plays once per tab, not on every navigation back to the homepage. */
const SESSION_KEY = "ieee-sgbit-preloaded";

type LoaderState = {
  phase: LoadPhase;
  phaseRef: React.MutableRefObject<LoadPhase>;
  progress: number;
  progressRef: React.MutableRefObject<number>;
  /** overlay chrome still on screen */
  isLoading: boolean;
  /** globe has settled — hero content may start animating in */
  isRevealing: boolean;
};

const LoaderContext = createContext<LoaderState | null>(null);

export function useLoader(): LoaderState {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used inside <LoaderProvider>");
  return ctx;
}

export default function LoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<LoadPhase>("loading");
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);

  const phaseRef = useRef<LoadPhase>("loading");
  const progressRef = useRef(0);
  phaseRef.current = phase;

  /* ── the story belongs to the homepage hero, and only on a cold visit ── */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY) === "1";

    if (pathname !== "/" || seen || reduced) {
      progressRef.current = 100;
      setProgress(100);
      setPhase("done");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    setArmed(true);
  }, [pathname]);

  /* ── counter eases toward 100, gated by window load + minimum runtime ── */
  useEffect(() => {
    if (!armed) return;
    const start = performance.now();
    let assetsReady = document.readyState === "complete";

    const onLoad = () => { assetsReady = true; };
    if (!assetsReady) window.addEventListener("load", onLoad);

    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const timeShare = Math.min(elapsed / MIN_DURATION, 1);
      // hold short of the end until both the clock and the assets say go
      const ceiling = assetsReady && timeShare >= 1 ? 100 : Math.min(92, timeShare * 92);

      const p = progressRef.current;
      const next = Math.min(p + (ceiling - p) * 0.08 + 0.25, 100);
      progressRef.current = next;

      // only re-render the HUD when the whole number actually changes
      setProgress((prev) => (Math.round(prev) === Math.round(next) ? prev : next));

      if (next >= 100) setPhase((ph) => (ph === "loading" ? "reveal" : ph));
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, [armed]);

  /* ── phase chain ── */
  useEffect(() => {
    if (phase === "reveal") {
      const t = setTimeout(() => setPhase("handoff"), REVEAL_DURATION);
      return () => clearTimeout(t);
    }
    if (phase === "handoff") {
      const t = setTimeout(() => {
        // the overlay hid the page; make sure we land at the top of the hero
        window.scrollTo(0, 0);
        setPhase("done");
      }, HANDOFF_DURATION);
      return () => clearTimeout(t);
    }
  }, [phase]);

  /* ── safety net: never leave the page gated ── */
  useEffect(() => {
    const t = setTimeout(() => {
      progressRef.current = 100;
      setPhase((ph) => (ph === "done" ? ph : "done"));
    }, SAFETY_TIMEOUT);
    return () => clearTimeout(t);
  }, []);

  const value = useMemo<LoaderState>(
    () => ({
      phase,
      phaseRef,
      progress,
      progressRef,
      isLoading: phase !== "done",
      isRevealing: phase === "handoff" || phase === "done",
    }),
    [phase, progress]
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}
