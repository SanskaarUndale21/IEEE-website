"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const facultyAdvisor = {
  name: "Dr. Shankargoud Patil",
  role: "Faculty Advisor",
  image: "/images/execoms/Dr.%20Shankargoud%20Patil.JPG",
};

const execomMembers = [
  { name: "MDC Co-Chairperson", role: "MDC Co-Chair",   x: 6,  y: 35 },
  { name: "MDC Chairperson",    role: "MDC Chair",       x: 16, y: 35 },
  { name: "Webmaster",          role: "Webmaster",       x: 27, y: 35 },
  { name: "Co-Chairperson",     role: "Co-Chair",        x: 37, y: 35 },
  { name: "Chairperson",        role: "Chair",           x: 49, y: 35 },
  { name: "Secretary",          role: "Secretary",       x: 59, y: 35 },
  { name: "Publicity Head",     role: "Publicity Head",  x: 67, y: 35 },
  { name: "Treasurer",          role: "Treasurer",       x: 77, y: 35 },
  { name: "Publicity Head",     role: "Publicity",       x: 87, y: 35 },
];

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".faculty-card", {
        y: 60, opacity: 0, scale: 0.95, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".faculty-card", start: "top 85%", once: true },
      });
      gsap.from(".excom-section-wrap", {
        y: 60, opacity: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: ".excom-section-wrap", start: "top 80%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="team" ref={sectionRef} className="noise relative overflow-hidden bg-[var(--bg)] px-4 py-24 md:px-6 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-ieee-blue/[0.03] blur-[200px] dark:bg-ieee-blue/[0.06]" />

      <div className="mx-auto max-w-7xl">

        {/* ── Header ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="mb-16 text-center"
        >
          <p className="section-label mb-3 uppercase tracking-[0.4em]">People of IEEE SGBIT</p>
          <h2 className="font-display text-4xl font-black tracking-[0.25em] text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            E X E C O M
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-white/40">
            United by passion, driven by innovation. Meet the leaders shaping the future of IEEE at SGBIT.
          </p>
        </motion.div>

        {/* ── Faculty Advisor Card ─────────────────── */}
        <div className="faculty-card mx-auto mb-20 max-w-5xl">
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] dark:border-ieee-light/10 dark:bg-black/40 dark:backdrop-blur-sm md:p-10">
            {/* Glow orb (subtle in both modes) */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-ieee-blue/[0.06] blur-[100px] dark:bg-ieee-blue/10" />

            <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:gap-12 lg:gap-16">
              {/* Photo */}
              <div className="relative aspect-[4/5] w-full max-w-[260px] flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] shadow-xl dark:border-white/10 sm:max-w-[300px]">
                <Image
                  src={facultyAdvisor.image}
                  alt={facultyAdvisor.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105 object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-5 inline-block rounded-full border border-[var(--ieee-blue)]/20 bg-[var(--ieee-blue)]/6 px-4 py-1.5 dark:border-ieee-light/20 dark:bg-ieee-light/10">
                  <span className="text-[11px] font-black tracking-[0.35em] text-[var(--ieee-blue)] dark:text-ieee-light uppercase">
                    Our Visionary {facultyAdvisor.role}
                  </span>
                </div>

                <h3 className="mb-4 font-display text-3xl font-black tracking-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
                  {facultyAdvisor.name}
                </h3>

                <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base">
                  Leading the IEEE SGBIT Student Branch with academic rigor and passion. Dr. Patil provides the mentorship and strategic direction that empowers our members to excel in global technical forums.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--ieee-blue)] dark:bg-ieee-light" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">Guiding Innovation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--ieee-blue)] dark:bg-ieee-light" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/40">SGBIT Leadership</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Group Photo & Interactive Excom ─────── */}
        <div className="excom-section-wrap relative">

          {/* CTA button */}
          <div className="mb-10 flex justify-center">
            <Link
              href="/team"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-ieee-light/30 bg-ieee-light/5 px-8 py-3.5 text-[11px] font-black tracking-[0.3em] text-ieee-light uppercase transition-all duration-700 hover:border-ieee-light hover:bg-ieee-light/15 hover:shadow-[0_0_40px_8px_rgba(14,165,233,0.15)] sm:px-10 sm:py-4"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              />
              <span className="relative">Meet the Full Team</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform duration-500 group-hover:translate-x-2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Photo + hover zones */}
          <div className="relative mx-auto w-full max-w-6xl">

            {/* Hover info panel */}
            <div className="absolute inset-x-0 top-[6%] z-50 flex justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                {hovered !== null && (
                  <motion.div
                    key={hovered}
                    initial={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden rounded-2xl border border-ieee-light/40 bg-black/90 px-8 py-4 shadow-[0_0_40px_rgba(0,163,224,0.2)] backdrop-blur-3xl"
                  >
                    <p className="mb-1 text-center text-[9px] font-bold uppercase tracking-[0.3em] text-ieee-light">
                      {execomMembers[hovered].role}
                    </p>
                    <h4 className="font-display text-xl font-black tracking-wide text-white sm:text-2xl">
                      {execomMembers[hovered].name}
                    </h4>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SVG connector lines */}
            <svg className="absolute inset-0 z-40 pointer-events-none" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(14,165,233,0.8)" />
                  <stop offset="50%" stopColor="rgba(14,165,233,1)" />
                  <stop offset="100%" stopColor="rgba(14,165,233,0.8)" />
                </linearGradient>
              </defs>
              <AnimatePresence>
                {hovered !== null && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      d={`M ${execomMembers[hovered].x} 22 L ${execomMembers[hovered].x} 18 L 50 18 L 50 15`}
                      stroke="url(#lineGradient)"
                      strokeWidth="0.15"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <motion.circle cx={execomMembers[hovered].x} cy="22" r="0.5" fill="#0EA5E9"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                    />
                    <circle cx="50" cy="15" r="0.4" fill="rgba(14,165,233,0.8)" />
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>

            {/* Photo */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-black shadow-[var(--shadow-lg)] dark:border-white/10 sm:rounded-3xl">
              <div className="relative aspect-[100/60] w-full">
                <Image
                  src="/images/execoms/excom.jpg"
                  alt="IEEE SGBIT Execom Group"
                  fill
                  className={`object-cover transition-all duration-700 ${hovered !== null ? "scale-[1.01] opacity-70" : "scale-100 opacity-100"}`}
                />
                <div className="absolute inset-0 z-50">
                  {execomMembers.map((member, i) => {
                    const left  = i === 0 ? 0 : (execomMembers[i - 1].x + member.x) / 2;
                    const right = i === execomMembers.length - 1 ? 100 : (member.x + execomMembers[i + 1].x) / 2;
                    return (
                      <div
                        key={i}
                        className="absolute inset-y-0 cursor-pointer"
                        style={{ left: `${left}%`, width: `${right - left}%` }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      />
                    );
                  })}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 bg-black/80 px-5 py-4 sm:px-8">
                <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/30">
                  IEEE SGBIT Executive Committee 2025
                </span>
                <span className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-ieee-light/40 sm:block">
                  Hover to explore
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Join CTA ─────────────────────────────── */}
        <div className="mt-24 text-center">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-10 shadow-[var(--shadow-md)] md:p-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ieee-blue/[0.04] via-transparent to-ieee-light/[0.04]" />
            <h3 className="relative z-10 mb-4 font-display text-2xl font-black text-gray-900 dark:text-white md:text-4xl">
              Become part of<br />the legacy.
            </h3>
            <p className="relative z-10 mb-8 mx-auto max-w-xl text-sm leading-loose text-gray-600 dark:text-white/35 md:text-base">
              Passionate about technology? Ready to lead? Recruitment cycles open annually. Let&apos;s build the extraordinary together.
            </p>
            <Link href="/join" className="btn-primary relative z-10 px-10 py-4 text-sm inline-flex items-center gap-2">
              <span>Join IEEE SGBIT</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
