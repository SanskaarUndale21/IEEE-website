"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useTheme } from "next-themes";
import Scene from "@/components/three/Scene";
import { HeroGlobe, ParticleField } from "@/components/three/Models";
import { useLoader } from "@/context/LoaderProvider";
import { IMAGES } from "@/constants";

const SLIDES = [
  { src: IMAGES.event1,           alt: "IEEE SGBIT Event" },
  { src: IMAGES.collegeTopView,   alt: "SGBIT Campus Aerial View" },
];

const SLIDE_INTERVAL = 5000;

export default function Hero() {
  const textRef    = useRef<HTMLDivElement>(null);
  const cursorGlow = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const { isLoading, isRevealing, phase, phaseRef, progressRef } = useLoader();
  const { resolvedTheme } = useTheme();

  // while the story plays the globe sits above the preloader backdrop; once it
  // has settled it drops back to being ambient hero decoration
  const settled = phase === "done";
  const ambientOpacity = resolvedTheme === "light" ? 0.4 : 0.55;

  // slideshow only starts once the preloader is out of the way
  useEffect(() => {
    if (isLoading) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [isLoading]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (cursorGlow.current) {
      gsap.to(cursorGlow.current, { x: e.clientX - 200, y: e.clientY - 200, duration: 1.2, ease: "power2.out" });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // hero copy waits for the preloader globe to settle, then rides in behind it
  useEffect(() => {
    if (!textRef.current || !isRevealing) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from(".hero-line",    { y: 130, opacity: 0, rotateX: -80, stagger: 0.18, duration: 1.3, ease: "power4.out" })
        .from(".hero-divider", { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.5")
        .from(".hero-sub",     { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
        .from(".hero-tag",     { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .from(".hero-cta",     { y: 25, opacity: 0, stagger: 0.12, duration: 0.6, ease: "power3.out" }, "-=0.2")
        .from(".hero-scroll",  { opacity: 0, duration: 1 }, "-=0.1");
    }, textRef);
    return () => ctx.revert();
  }, [isRevealing]);

  return (
    <section id="home" className="noise relative flex h-screen w-full items-center justify-center overflow-hidden">

      {/* ── Sliding BG images ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          {SLIDES.map((slide, idx) =>
            idx === current ? (
              <motion.div key={slide.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.8, ease: "easeInOut" }}>
                <Image src={slide.src} alt={slide.alt} fill className="object-cover opacity-25 dark:opacity-30" priority={idx === 0} quality={85} />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#FAFAFA]/30 via-[#FAFAFA]/10 to-[#FAFAFA]/95 dark:from-[#111827]/60 dark:via-[#111827]/30 dark:to-[#111827]" />
      </div>

      {/* ── Mouse glow ────────────────────────────────────────── */}
      <div ref={cursorGlow} className="pointer-events-none fixed z-[1] h-[400px] w-[400px] rounded-full bg-ieee-light/5 blur-[120px] dark:bg-ieee-light/8" />

      {/* ── Grid lines ────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        {[20, 40, 60, 80].map((p) => (
          <div key={`v${p}`} className="absolute top-0 h-full w-px bg-gray-400/15 dark:bg-white/[0.02]" style={{ left: `${p}%` }} />
        ))}
        {[25, 50, 75].map((p) => (
          <div key={`h${p}`} className="absolute left-0 h-px w-full bg-gray-400/15 dark:bg-white/[0.02]" style={{ top: `${p}%` }} />
        ))}
      </div>

      {/* ── 3-D Globe + Particles ─────────────────────────────── */}
      {/* One canvas for the whole story. During the preload it is pinned above
          the backdrop (z-210) at full strength; when the backdrop peels off it
          settles back into the hero at z-3 and ambient opacity. It is never
          remounted, so the globe the visitor watched grow is the exact globe
          sitting in the hero. */}
      <motion.div
        className={
          settled
            ? "pointer-events-none absolute inset-0 z-[3]"
            : "pointer-events-none fixed inset-0 z-[210]"
        }
        animate={{ opacity: isLoading && !isRevealing ? 0.95 : ambientOpacity }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Scene className="h-full w-full">
          <HeroGlobe progressRef={progressRef} phaseRef={phaseRef} />
          <ParticleField count={1200} />
        </Scene>
      </motion.div>

      {/* ── Slide indicator dots ─────────────────────────────── */}
      <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, idx) => (
          <button key={idx} onClick={() => setCurrent(idx)} aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${idx === current ? "w-6 bg-ieee-light" : "w-1.5 bg-gray-500/40 dark:bg-white/20"}`} />
        ))}
      </div>

      {/* ── Hero content ──────────────────────────────────────── */}
      <div
        ref={textRef}
        className="relative z-10 flex flex-col items-center px-4 text-center"
        style={{ perspective: "1000px", opacity: isRevealing ? 1 : 0 }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={isRevealing ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }} transition={{ duration: 1, delay: 0.1 }} className="mb-5 sm:mb-6">
          <Image src={IMAGES.logo} alt="IEEE" width={64} height={64} className="mx-auto drop-shadow-xl sm:w-[72px] sm:h-[72px]" priority />
        </motion.div>

        <div className="overflow-hidden">
          <h1 className="hero-line font-display text-6xl font-black tracking-[0.15em] text-gray-900 dark:text-white sm:text-7xl md:text-8xl lg:text-[10rem]">
            IEEE
          </h1>
        </div>
        <div className="overflow-hidden">
          <h2 className="hero-line font-display text-3xl font-extralight tracking-[0.5em] text-gray-600 dark:text-white/80 sm:text-4xl md:text-5xl lg:text-7xl">
            SGBIT
          </h2>
        </div>

        <div className="hero-divider my-5 h-[2px] w-16 origin-center bg-gradient-to-r from-ieee-blue to-ieee-light sm:my-6 sm:w-20" />

        <p className="hero-sub text-[11px] tracking-[0.3em] text-gray-600 dark:text-white/50 sm:text-sm md:tracking-[0.35em]">
          STUDENT BRANCH &bull; BELAGAVI
        </p>
        <p className="hero-tag mt-2 max-w-xs text-[10px] tracking-widest text-gray-500 dark:text-white/30 sm:mt-3 sm:max-w-md sm:text-xs">
          Advancing Technology for the Benefit of Humanity
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10 sm:gap-6">
          <Link href="/join" className="hero-cta btn-primary group relative overflow-hidden px-8 py-3.5 sm:scale-110 sm:px-10 sm:py-4">
            <span>Join IEEE</span>
          </Link>
          <Link
            href="/events/upcoming"
            className="hero-cta flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 transition-all hover:text-ieee-light dark:text-white/50 dark:hover:text-ieee-light sm:text-[11px] sm:tracking-[0.3em]"
          >
            Upcoming Events
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="hero-scroll mt-12 sm:mt-16">
          <a href="#about" className="group flex flex-col items-center gap-2 text-gray-500 dark:text-white/25 transition-colors hover:text-ieee-light">
            <span className="text-[8px] tracking-[0.5em] uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
              <div className="h-7 w-px bg-gradient-to-b from-transparent to-current" />
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="mx-auto mt-0.5">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </motion.div>
          </a>
        </div>
      </div>

      {/* ── Corner labels ─────────────────────────────────────── */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: isRevealing ? 1 : 0 }} transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-8 z-10 hidden text-[9px] tracking-[0.25em] text-gray-500 dark:text-white/15 md:block">
        S.G. BALEKUNDRI INSTITUTE<br />OF TECHNOLOGY
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: isRevealing ? 1 : 0 }} transition={{ delay: 1.6 }}
        className="absolute bottom-8 right-8 z-10 hidden text-right text-[9px] tracking-[0.25em] text-gray-500 dark:text-white/15 md:block">
        IEEE STUDENT<br />BRANCH
      </motion.p>
    </section>
  );
}
