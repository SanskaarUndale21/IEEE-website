"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useTheme } from "next-themes";
import LightTunnel from "@/components/three/LightTunnel";
import { IMAGES, STATS } from "@/constants";

const SLIDES = [
  { src: IMAGES.collegeTopView, alt: "SGBIT Campus Aerial View" },
  { src: IMAGES.event1, alt: "IEEE SGBIT Event" },
];
const SLIDE_INTERVAL = 6000;

const TAGLINES = [
  "Advancing Technology for the Benefit of Humanity",
  "Where curiosity turns into engineering",
  "Workshops · Hackathons · Research · Community",
];
const TAGLINE_INTERVAL = 5000;

const HERO_STATS = [
  { value: STATS.members, label: "Members" },
  { value: STATS.events, label: "Events" },
  { value: STATS.yearsActive, label: "Years" },
];

const WORDMARK = ["I", "E", "E", "E"];

/* ─── Number that counts up once the intro has landed ────────── */
function CountUp({ value, run, delay = 0 }: { value: string; run: boolean; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const digits = value.replace(/\D/g, "");
    const suffix = value.replace(/[\d]/g, "");
    const target = parseInt(digits, 10);
    if (!run || !Number.isFinite(target)) {
      el.textContent = value;
      return;
    }
    const counter = { n: 0 };
    const tween = gsap.to(counter, {
      n: target,
      duration: 1.6,
      delay,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = `${Math.round(counter.n)}${suffix}`;
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, run, delay]);

  return <span ref={ref}>0</span>;
}

/* ─── Cursor-magnetic wrapper (pointer devices only) ─────────── */
function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cursorGlow = useRef<HTMLDivElement>(null);

  const [slide, setSlide] = useState(0);
  const [tagline, setTagline] = useState(0);
  const [introReady, setIntroReady] = useState(false);
  const [lowPower, setLowPower] = useState(true);
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  const { resolvedTheme } = useTheme();

  /* ── device tier: mobiles and weak CPUs get a lighter scene ── */
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 900px)");
    const evaluate = () =>
      setLowPower(mq.matches || (navigator.hardwareConcurrency ?? 8) <= 4);
    evaluate();
    mq.addEventListener("change", evaluate);
    return () => mq.removeEventListener("change", evaluate);
  }, []);

  /* ── hold the intro until the preloader hands the page over ── */
  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("ieee-sgbit-preloaded");
    } catch {
      seen = false;
    }
    if (seen) {
      setIntroReady(true);
      return;
    }
    const release = () => setIntroReady(true);
    window.addEventListener("ieee:preloader-done", release, { once: true });
    const fallback = window.setTimeout(release, 5400); // preloader's own hard cap
    return () => {
      window.removeEventListener("ieee:preloader-done", release);
      window.clearTimeout(fallback);
    };
  }, []);

  /* ── background stills + rotating tagline ── */
  useEffect(() => {
    const id = setInterval(() => setSlide((p) => (p + 1) % SLIDES.length), SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTagline((p) => (p + 1) % TAGLINES.length), TAGLINE_INTERVAL);
    return () => clearInterval(id);
  }, [reduced]);

  /* ── scroll: the whole scene warps away as you leave ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const tunnelScale = useTransform(scrollYProgress, [0, 1], [1, 1.45]);
  const tunnelOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.6], ["blur(0px)", "blur(9px)"]);
  const railOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  /* ── pointer: content tilt + cursor bloom ── */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springed = { stiffness: 80, damping: 18, mass: 0.7 };
  const smoothX = useSpring(pointerX, springed);
  const smoothY = useSpring(pointerY, springed);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const driftX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const driftY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      pointerX.set(e.clientX / window.innerWidth - 0.5);
      pointerY.set(e.clientY / window.innerHeight - 0.5);
      if (cursorGlow.current) {
        gsap.to(cursorGlow.current, {
          x: e.clientX - 260,
          y: e.clientY - 260,
          duration: 1.1,
          ease: "power2.out",
        });
      }
    },
    [pointerX, pointerY]
  );

  useEffect(() => {
    if (reduced) return;
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove, reduced]);

  /* ── intro timeline ── */
  useEffect(() => {
    if (!introReady || !contentRef.current) return;
    const root = contentRef.current;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(root, { opacity: 1 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.set(root, { opacity: 1 })
        .from(".hero-badge", { y: -18, opacity: 0, duration: 0.8 })
        .from(
          ".hero-word",
          { scale: 1.22, filter: "blur(14px)", duration: 1.5, ease: "expo.out" },
          "-=0.5"
        )
        .from(
          ".hero-char",
          { yPercent: 115, rotateX: -70, opacity: 0, stagger: 0.085, duration: 1.15 },
          "<0.05"
        )
        .from(
          ".hero-sub",
          { letterSpacing: "1.1em", opacity: 0, filter: "blur(10px)", duration: 1.2 },
          "-=0.85"
        )
        .from(".hero-rule", { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.7")
        .from(".hero-tagline", { y: 22, opacity: 0, duration: 0.7 }, "-=0.45")
        .from(".hero-cta", { y: 26, opacity: 0, stagger: 0.1, duration: 0.7 }, "-=0.35")
        .from(".hero-meta", { y: 16, opacity: 0, stagger: 0.08, duration: 0.6 }, "-=0.4");
      // the HUD rails sit outside this scope — their opacity is driven by scroll
    }, contentRef);

    return () => ctx.revert();
  }, [introReady, reduced]);

  const isDark = resolvedTheme !== "light";
  const showTunnel = mounted && !reduced;

  return (
    <section
      ref={sectionRef}
      id="home"
      className="noise relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[var(--bg)] pb-16 pt-16 sm:pb-32 sm:pt-20"
    >
      {/* ── Ambient wash ─────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_85%_at_50%_44%,rgba(0,98,155,0.10),rgba(0,0,0,0)_62%)] dark:bg-[radial-gradient(120%_85%_at_50%_44%,rgba(14,165,233,0.18),rgba(0,0,0,0)_64%)]" />

      {/* ── Campus horizon (crossfading stills, masked to the floor) ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[55%]">
        <AnimatePresence mode="sync">
          {SLIDES.map((s, i) =>
            i === slide ? (
              <motion.div
                key={s.src}
                className="hero-photo-mask absolute inset-0"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 2 }, scale: { duration: 8, ease: "linear" } }}
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  className="object-cover opacity-[0.08] dark:opacity-[0.12]"
                  priority={i === 0}
                  quality={80}
                  sizes="100vw"
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* ── Fibre-optic light tunnel ─────────────────────────── */}
      {showTunnel && (
        <motion.div
          style={{ scale: tunnelScale, opacity: tunnelOpacity }}
          className="pointer-events-none absolute inset-0 z-[1]"
        >
          <LightTunnel
            cableColor={isDark ? "#0EA5E9" : "#00629B"}
            pulseColor={isDark ? "#7DD3FC" : "#0EA5E9"}
            tunnelColor="#00629B"
            tunnelOpacity={isDark ? 0.04 : 0.03}
            speed={0.075}
            flowDirection="outward"
            pulseSpeed={1.6}
            pulseLength={0.18}
            pulseBlend={0.9}
            pulseWidth={0.85}
            cableCount={lowPower ? 20 : 38}
            thickness={0.2}
            rimWidth={0.07}
            waviness={0.16}
            sway={0.22}
            size={1.2}
            glow={isDark ? 1.2 : 0.9}
            fadeNear={0.8}
            fadeFar={2.6}
            brightness={isDark ? 1.2 : 1}
            grain={!lowPower}
            grainIntensity={0.02}
            opacity={isDark ? 0.85 : 0.32}
            mouseInteraction
            mouseStrength={0.12}
            dprCap={lowPower ? 1.25 : 2}
          />
        </motion.div>
      )}

      {/* ── Contrast scrim so the wordmark always reads ───────── */}
      <div className="hero-scrim pointer-events-none absolute inset-0 z-[3]" />

      {/* ── Focus vignette ───────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_38%,rgba(17,24,39,0.07)_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_38%,rgba(0,0,0,0.45)_100%)]" />

      {/* ── Cursor bloom ─────────────────────────────────────── */}
      <div
        ref={cursorGlow}
        className="pointer-events-none fixed left-0 top-0 z-[3] hidden h-[520px] w-[520px] rounded-full bg-ieee-light/[0.07] blur-[140px] dark:bg-ieee-light/[0.12] md:block"
      />

      {/* ── HUD frame ────────────────────────────────────────── */}
      <div className="hero-rail pointer-events-none absolute inset-4 z-[4] hidden sm:block md:inset-6">
        <span className="absolute left-0 top-0 h-8 w-8 border-l border-t border-gray-900/15 dark:border-white/15" />
        <span className="absolute right-0 top-0 h-8 w-8 border-r border-t border-gray-900/15 dark:border-white/15" />
        <span className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-gray-900/15 dark:border-white/15" />
        <span className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-gray-900/15 dark:border-white/15" />
      </div>

      <motion.div
        style={{ opacity: railOpacity }}
        className="hero-rail pointer-events-none absolute left-6 top-1/2 z-[4] hidden -translate-y-1/2 lg:block"
      >
        <p className="[writing-mode:vertical-rl] text-[9px] tracking-[0.45em] text-gray-500 dark:text-white/25">
          EST. 2014
        </p>
      </motion.div>
      <motion.div
        style={{ opacity: railOpacity }}
        className="hero-rail pointer-events-none absolute right-6 top-1/2 z-[4] hidden -translate-y-1/2 lg:block"
      >
        <p className="rotate-180 [writing-mode:vertical-rl] text-[9px] tracking-[0.45em] text-gray-500 dark:text-white/25">
          15.85°N / 74.50°E
        </p>
      </motion.div>

      {/* ── Content ──────────────────────────────────────────── */}
      <motion.div
        style={{ y: contentY, scale: contentScale, opacity: contentOpacity, filter: contentBlur }}
        className="relative z-10 w-full px-5"
      >
        <div
          ref={contentRef}
          style={{ opacity: 0, perspective: 1400 }}
          className="flex w-full flex-col items-center text-center"
        >
          <motion.div
            style={reduced ? undefined : { rotateX, rotateY, x: driftX, y: driftY }}
            className="flex w-full flex-col items-center [transform-style:preserve-3d]"
          >
            {/* Badge */}
            <div className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/60 py-1.5 pl-1.5 pr-3.5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] sm:mb-9 sm:gap-2.5 sm:pr-4">
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm dark:bg-white/90">
                <Image src={IMAGES.logo} alt="IEEE" width={18} height={18} className="object-contain" priority />
              </span>
              <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-gray-600 dark:text-white/60 sm:gap-2 sm:text-[10px] sm:tracking-[0.28em]">
                Student Branch
                <span className="h-2.5 w-px bg-gray-900/15 dark:bg-white/15" />
                Belagavi
              </span>
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ieee-light opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ieee-light" />
              </span>
            </div>

            {/* Wordmark */}
            <h1 className="hero-word flex items-center justify-center font-display text-[clamp(4.5rem,17vw,13rem)] font-black leading-[0.82] tracking-[0.02em] drop-shadow-[0_0_60px_rgba(14,165,233,0.10)] dark:drop-shadow-[0_0_70px_rgba(14,165,233,0.22)]">
              {WORDMARK.map((char, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.06em]">
                  <span
                    className="hero-char hero-shine inline-block"
                    style={{ animationDelay: `${i * -0.2}s` }}
                  >
                    {char}
                  </span>
                </span>
              ))}
            </h1>

            {/* Sub-wordmark */}
            <h2
              className="hero-sub mt-2 font-display text-[clamp(1.15rem,4.4vw,3.1rem)] font-light leading-none tracking-[0.42em] sm:mt-4 sm:tracking-[0.5em]"
              style={{ paddingLeft: "0.5em" }}
            >
              <span className="hero-outline">SGBIT</span>
            </h2>

            {/* Rule */}
            <div className="hero-rule relative my-5 h-px w-24 origin-center bg-gradient-to-r from-transparent via-ieee-blue to-transparent dark:via-ieee-light sm:my-8 sm:w-40">
              <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ieee-light" />
            </div>

            {/* Rotating tagline */}
            <div className="hero-tagline flex min-h-[2.5rem] items-center justify-center px-2 sm:min-h-0 sm:h-7 sm:overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tagline}
                  initial={{ y: 16, opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -16, opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                  className="max-w-[22rem] text-[10px] uppercase tracking-[0.26em] text-gray-600 dark:text-white/45 sm:max-w-none sm:text-xs sm:tracking-[0.32em]"
                >
                  {TAGLINES[tagline]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTAs */}
            <div className="mt-7 flex w-full max-w-xs flex-col items-stretch gap-3 sm:mt-11 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-6">
              <Magnetic className="hero-cta">
                <Link
                  href="/join"
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[var(--ieee-blue)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_10px_40px_-12px_rgba(0,98,155,0.8)] transition-shadow duration-300 hover:shadow-[0_16px_50px_-10px_rgba(0,98,155,0.9)] sm:px-9 sm:py-4"
                >
                  <span className="relative z-10">Join IEEE</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                </Link>
              </Magnetic>

              <Magnetic className="hero-cta" strength={0.22}>
                <Link
                  href="/events/upcoming"
                  className="group flex items-center justify-center gap-2.5 rounded-full border border-gray-900/15 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-700 transition-colors duration-300 hover:border-ieee-light hover:text-ieee-light dark:border-white/15 dark:text-white/70 dark:hover:border-ieee-light dark:hover:text-ieee-light sm:py-3.5"
                >
                  Upcoming Events
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </Magnetic>
            </div>

            {/* Compact stats — phones only, the rail carries them on desktop */}
            <div className="hero-meta mt-7 flex items-center gap-6 md:hidden">
              {HERO_STATS.map((s, i) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="font-display text-lg font-bold text-gray-900 dark:text-white">
                    <CountUp value={s.value} run={introReady && !reduced} delay={0.2 + i * 0.12} />
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.24em] text-gray-500 dark:text-white/35">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Bottom bar: identity · scroll cue · live counters ── */}
      <motion.div
        style={{ opacity: railOpacity }}
        className="hero-rail absolute inset-x-0 bottom-0 z-10 hidden items-end justify-between px-10 pb-7 md:flex"
      >
        <p className="text-[9px] leading-relaxed tracking-[0.25em] text-gray-500 dark:text-white/25">
          S.G. BALEKUNDRI INSTITUTE
          <br />
          OF TECHNOLOGY
        </p>

        <a
          href="#about"
          className="group pointer-events-auto flex flex-col items-center gap-2 text-gray-500 transition-colors hover:text-ieee-light dark:text-white/30"
        >
          <span className="text-[8px] uppercase tracking-[0.5em]">Scroll</span>
          <span className="relative block h-10 w-px overflow-hidden bg-gray-900/10 dark:bg-white/10">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-transparent via-ieee-light to-transparent"
              animate={{ y: ["-100%", "300%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </a>

        <div className="flex items-end gap-7">
          {HERO_STATS.map((s, i) => (
            <div key={s.label} className="flex flex-col items-end">
              <span className="font-display text-xl font-bold leading-none text-gray-900 dark:text-white">
                <CountUp value={s.value} run={introReady && !reduced} delay={0.2 + i * 0.12} />
              </span>
              <span className="mt-1 text-[8px] uppercase tracking-[0.26em] text-gray-500 dark:text-white/30">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* mobile scroll cue */}
      <div className="hero-rail absolute bottom-6 left-1/2 z-10 -translate-x-1/2 md:hidden">
        <a href="#about" className="flex flex-col items-center gap-1.5 text-gray-500 dark:text-white/30">
          <span className="text-[7px] uppercase tracking-[0.45em]">Scroll</span>
          <motion.svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" />
          </motion.svg>
        </a>
      </div>

      {/* ── Fade into the next section ───────────────────────── */}
      <div className="hero-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40" />
    </section>
  );
}
