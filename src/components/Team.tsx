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

// 9 members in a single horizontal row. 
// Values roughly estimated from image analysis.
const execomMembers = [
  { name: "MDC Co-Chairperson", role: "MDC Co-Chair", x: 6,   y: 35, active: true },
  { name: "MDC Chairperson",    role: "MDC Chair",    x: 16,  y: 35, active: true },
  { name: "Webmaster",          role: "Webmaster",    x: 27,  y: 35, active: true },
  { name: "Co-Chairperson",     role: "Co-Chair",     x: 37,  y: 35, active: true },
  { name: "Chairperson",        role: "Chair",        x: 48,  y: 35, active: true },
  { name: "Secretary",          role: "Secretary",    x: 59,  y: 35, active: true },
  { name: "Treasurer",          role: "Treasurer",    x: 70,  y: 35, active: true },
  { name: "Publicity Head",     role: "Publicity",    x: 82,  y: 35, active: true },
];

export default function Team() {
  const sectionRef   = useRef<HTMLElement>(null);
  const isInView     = useInView(sectionRef, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".faculty-card", {
        y: 60, opacity: 0, scale: 0.9, duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".faculty-card", start: "top 85%", once: true },
      });
      gsap.from(".excom-section-wrap", {
        y: 60, opacity: 0, duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".excom-section-wrap", start: "top 80%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="team" ref={sectionRef} className="noise relative overflow-hidden px-6 py-32 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-ieee-blue/[0.03] blur-[200px] dark:bg-ieee-blue/[0.06]" />

      <div className="mx-auto max-w-7xl">

        {/* ── Header ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="mb-20 text-center"
        >
          <p className="section-label mb-4 uppercase tracking-[0.4em] text-ieee-light">People of IEEE SGBIT</p>
          <h2 className="font-display text-4xl font-black tracking-[0.3em] text-gray-900 dark:text-white md:text-6xl lg:text-7xl">
            E X E C O M
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-gray-500 dark:text-white/40">
            United by passion, driven by innovation. Meet the leaders shaping the future of IEEE at SGBIT.
          </p>
        </motion.div>

        {/* ── Faculty Advisor ───────────────────────────────────── */}
        <div className="faculty-card mx-auto mb-24 max-w-xs">
          <div className="group relative overflow-hidden rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/40">
            <div className="relative aspect-[3/4]">
              <Image
                src={facultyAdvisor.image}
                alt={facultyAdvisor.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <p className="mb-2 text-[10px] font-bold tracking-[0.4em] text-ieee-light uppercase">
                {facultyAdvisor.role}
              </p>
              <h4 className="font-display text-2xl font-black text-white">
                {facultyAdvisor.name}
              </h4>
            </div>
            <div className="absolute inset-0 border-[1px] border-ieee-light/10 rounded-3xl group-hover:border-ieee-light/30 transition-colors duration-500" />
          </div>
        </div>

        {/* ── Group Photo & Interactive Info ─────────────────── */}
        <div className="excom-section-wrap relative">
          
          <div className="mb-12 flex justify-center">
            <Link
              href="/team"
              className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full border border-ieee-light/40 bg-ieee-light/5 px-10 py-4 text-[11px] font-black tracking-[0.3em] text-ieee-light uppercase transition-all duration-700 hover:border-ieee-light hover:bg-ieee-light/15 hover:shadow-[0_0_50px_10px_rgba(0,163,224,0.2)]"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              />
              <span className="relative">Expertise behind the name</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform duration-500 group-hover:translate-x-2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Combined Image Containter */}
          <div className="relative mx-auto w-full max-w-6xl">
            
            {/* Display Area for Hovered Info (Fixed in Center Top area of image) */}
            <div className="absolute inset-x-0 top-[6%] z-50 flex justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  {hovered !== null && (
                    <motion.div
                      key={hovered}
                      initial={{ opacity: 0, y: -15, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 15, filter: "blur(10px)" }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative overflow-hidden rounded-2xl p-0.5"
                    >
                      <div className="relative z-10 bg-black/90 backdrop-blur-3xl border border-ieee-light/40 px-10 py-5 rounded-[calc(1rem-2px)] shadow-[0_0_50px_rgba(0,163,224,0.2)] flex flex-col items-center">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[9px] font-bold text-ieee-light uppercase mb-1.5"
                        >
                          {execomMembers[hovered].role}
                        </motion.p>
                        <h4 className="font-display text-2xl font-black text-white tracking-wide">
                          {execomMembers[hovered].name}
                        </h4>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>

            {/* SVG Lines Connector Layer */}
            <svg 
              className="absolute inset-0 z-40 pointer-events-none" 
              viewBox="0 0 100 60"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(0,163,224,0.8)" />
                  <stop offset="50%" stopColor="rgba(0,163,224,1)" />
                  <stop offset="100%" stopColor="rgba(0,163,224,0.8)" />
                </linearGradient>
              </defs>
              <AnimatePresence>
                {hovered !== null && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      d={`M ${execomMembers[hovered].x} 22 L ${execomMembers[hovered].x} 18 L 50 18 L 50 15`}
                      stroke="url(#lineGradient)"
                      strokeWidth="0.15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      className="drop-shadow-[0_0_2px_rgba(0,163,224,0.5)]"
                    />
                    <motion.circle
                      cx={execomMembers[hovered].x}
                      cy="22"
                      r="0.5"
                      fill="#00A3E0"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="shadow-[0_0_10px_rgba(0,163,224,0.8)]"
                    />
                    <circle
                       cx="50"
                       cy="15"
                       r="0.4"
                       fill="rgba(0,163,224,0.8)"
                    />
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>

            {/* Photo Container */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-3xl bg-black">
              <div className="relative w-full aspect-[100/60]">
                <Image
                  src="/images/execoms/excom.jpg"
                  alt="IEEE SGBIT Execom Group"
                  fill
                  className={`object-cover transition-all duration-700 ${hovered !== null ? 'opacity-70 scale-[1.01]' : 'opacity-100 scale-100'}`}
                />
                
                {/* Horizontal Hover Zones */}
                <div className="absolute inset-0 z-50 flex">
                  {execomMembers.map((member, i) => (
                    <div
                      key={i}
                      className="h-full flex-1 cursor-pointer group"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Visual Cue for interactive Zone */}
                      <div className={`absolute inset-y-0 w-px bg-white/5 transition-opacity duration-300 ${hovered === i ? 'opacity-100' : 'opacity-0'}`} style={{ left: `${(i/9)*100}%` }} />
                    </div>
                  ))}
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>

              {/* Caption */}
              <div className="bg-black/80 px-8 py-5 flex items-center justify-between border-t border-white/5">
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase">
                  IEEE SGBIT Executive Committee 2025
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-ieee-light/40 uppercase hidden md:block">
                  Hover to explore individuals
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Join CTA ─────────────────────────────────────────── */}
        <div className="join-cta mt-32 text-center relative z-10">
          <div className="glass-card mx-auto max-w-3xl rounded-[2.5rem] p-12 md:p-20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-ieee-blue/[0.05] via-transparent to-ieee-light/[0.05]" />
            <h3 className="relative z-10 mb-6 font-display text-3xl font-black text-gray-900 dark:text-white md:text-5xl">
              Become part of <br />the legacy.
            </h3>
            <p className="relative z-10 mb-10 text-base leading-loose max-w-xl mx-auto text-gray-500 dark:text-white/30">
              Passionate about technology? Ready to lead? Recruitment cycles open annually. Let&apos;s build the extraordinary together.
            </p>
            <button className="btn-primary relative z-10 px-12 py-5 text-sm">
              <span>Join IEEE SGBIT</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
