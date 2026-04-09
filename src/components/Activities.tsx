"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "@/components/three/Scene";
import { FloatingTorus } from "@/components/three/Models";

gsap.registerPlugin(ScrollTrigger);

const activities = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Technical Workshops",
    description: "Hands-on sessions on emerging tech — IoT, AI, embedded systems, cloud computing, and more.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Hackathons",
    description: "Intense coding competitions solving real-world problems with innovative engineering solutions.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Guest Lectures",
    description: "Insights from industry leaders and IEEE distinguished speakers on cutting-edge research.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Paper Presentations",
    description: "Platform for students to present technical papers, fostering research culture and academic excellence.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Project Showcases",
    description: "Annual exhibitions showcasing innovative projects spanning hardware, software, and beyond.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: "Industry Connect",
    description: "Networking events, industrial visits, and mentorship programs connecting students with professionals.",
  },
];

export default function Activities() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".activity-card").forEach((card, i) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          rotateY: 15,
          scale: 0.92,
          duration: 0.8,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="noise relative overflow-hidden border-y border-gray-200/50 px-6 py-32 dark:border-white/[0.04] md:py-40">
      {/* 3D background */}
      <div className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-30">
        <Scene className="h-full w-full">
          <FloatingTorus />
        </Scene>
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="mb-16 text-center"
        >
          <p className="section-label mb-4">What We Do</p>
          <h2 className="font-display text-3xl font-bold tracking-[0.25em] text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
            BUILDING THE FUTURE
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500 dark:text-white/40">
            From workshops to hackathons, we create experiences that shape tomorrow&apos;s engineers.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: "1200px" }}>
          {activities.map((act) => (
            <div key={act.title} className="activity-card glass-card group rounded-2xl p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-ieee-blue/10 text-ieee-light transition-all duration-500 group-hover:bg-ieee-blue/20 group-hover:scale-110">
                {act.icon}
              </div>
              <h3 className="mb-3 font-display text-lg font-bold text-gray-900 dark:text-white">
                {act.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-white/40">
                {act.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
