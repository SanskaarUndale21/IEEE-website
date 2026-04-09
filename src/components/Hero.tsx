"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import Scene from "@/components/three/Scene";
import { FloatingGlobe, ParticleField } from "@/components/three/Models";

export default function Hero() {
  const textRef = useRef<HTMLDivElement>(null);
  const cursorGlow = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (cursorGlow.current) {
      gsap.to(cursorGlow.current, {
        x: e.clientX - 200,
        y: e.clientY - 200,
        duration: 1.2,
        ease: "power2.out",
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    if (!textRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.6 });
      tl.from(".hero-line", {
        y: 130,
        opacity: 0,
        rotateX: -80,
        stagger: 0.18,
        duration: 1.3,
        ease: "power4.out",
      })
        .from(".hero-divider", { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.5")
        .from(".hero-sub", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
        .from(".hero-tag", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .from(".hero-cta", { y: 25, opacity: 0, stagger: 0.12, duration: 0.6, ease: "power3.out" }, "-=0.2")
        .from(".hero-scroll", { opacity: 0, duration: 1 }, "-=0.1");
    }, textRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="home" className="noise relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* BG image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/DJI_0135.JPG" alt="SGBIT Campus" fill className="object-cover opacity-15 dark:opacity-25" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white dark:from-dark/70 dark:via-dark/40 dark:to-dark" />
      </div>

      {/* Mouse glow */}
      <div ref={cursorGlow} className="pointer-events-none fixed z-[1] h-[400px] w-[400px] rounded-full bg-ieee-light/5 blur-[120px] dark:bg-ieee-light/8" />

      {/* Grid lines */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        {[20, 40, 60, 80].map((p) => (
          <div key={`v${p}`} className="absolute top-0 h-full w-px bg-gray-300/20 dark:bg-white/[0.02]" style={{ left: `${p}%` }} />
        ))}
        {[25, 50, 75].map((p) => (
          <div key={`h${p}`} className="absolute left-0 h-px w-full bg-gray-300/20 dark:bg-white/[0.02]" style={{ top: `${p}%` }} />
        ))}
      </div>

      {/* 3D Globe + Particles */}
      <div className="absolute inset-0 z-[3] opacity-50 dark:opacity-60">
        <Scene className="h-full w-full">
          <FloatingGlobe />
          <ParticleField count={1200} />
        </Scene>
      </div>

      {/* Content */}
      <div ref={textRef} className="relative z-10 flex flex-col items-center px-4 text-center" style={{ perspective: "1000px" }}>
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }} className="mb-6">
          <Image src="/images/ieee_new_logo.png" alt="IEEE" width={72} height={72} className="mx-auto drop-shadow-xl" priority />
        </motion.div>

        <div className="overflow-hidden">
          <h1 className="hero-line font-display text-7xl font-black tracking-[0.15em] text-gray-900 dark:text-white sm:text-8xl lg:text-[10rem]">
            IEEE
          </h1>
        </div>
        <div className="overflow-hidden">
          <h2 className="hero-line font-display text-4xl font-extralight tracking-[0.5em] text-gray-600 dark:text-white/80 sm:text-5xl lg:text-7xl">
            SGBIT
          </h2>
        </div>

        <div className="hero-divider my-6 h-[2px] w-20 origin-center bg-gradient-to-r from-ieee-blue to-ieee-light" />

        <p className="hero-sub text-sm tracking-[0.35em] text-gray-500 dark:text-white/50 md:text-base">
          STUDENT BRANCH &bull; BELAGAVI
        </p>
        <p className="hero-tag mt-3 max-w-md text-xs tracking-widest text-gray-400 dark:text-white/30">
          Advancing Technology for the Benefit of Humanity
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#events" className="hero-cta btn-primary"><span>Explore Events</span></a>
          <a href="#about" className="hero-cta btn-outline">Learn More</a>
        </div>

        <div className="hero-scroll mt-16">
          <a href="#about" className="group flex flex-col items-center gap-2 text-gray-400 dark:text-white/25 transition-colors hover:text-ieee-light">
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

      {/* Corners */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-8 left-8 z-10 hidden text-[9px] tracking-[0.25em] text-gray-400 dark:text-white/15 md:block">
        S.G. BALEKUNDRI INSTITUTE<br />OF TECHNOLOGY
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-8 right-8 z-10 hidden text-right text-[9px] tracking-[0.25em] text-gray-400 dark:text-white/15 md:block">
        IEEE STUDENT<br />BRANCH
      </motion.p>
    </section>
  );
}
