"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ABOUT_STATS, ABOUT_VALUES, TIMELINE, IMAGES, FACULTY_ADVISOR } from "@/constants";

const HalftoneReveal = dynamic(() => import("@/components/three/HalftoneReveal"), {
  ssr: false,
});

const valueIcons = [
  <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>,
  <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  <svg key="5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>,
];

export default function AboutPage() {
  const missionRef  = useRef<HTMLDivElement>(null);
  const valuesRef   = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const missionInView  = useInView(missionRef,  { once: true, margin: "-80px" });
  const valuesInView   = useInView(valuesRef,   { once: true, margin: "-80px" });
  const timelineInView = useInView(timelineRef, { once: true, margin: "-80px" });

  return (
    <main className="bg-[var(--bg)]">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="noise relative overflow-hidden px-5 pt-16 pb-16 md:px-8 md:pt-20 md:pb-24">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-ieee-blue/[0.05] blur-[180px] dark:bg-ieee-light/[0.06]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--ieee-blue)] dark:hover:text-[var(--ieee-light)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Home
            </Link>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
            {/* ── Copy ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <p className="section-label mb-4">About Us</p>
              <h1 className="font-display text-4xl font-bold leading-[1.02] text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                Engineering a<br />
                <span className="gradient-text">Better Tomorrow</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                The IEEE Student Branch at S.G. Balekundri Institute of Technology, Belagavi — a hub for engineers
                passionate about technology, innovation, and professional growth.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/join" className="btn-primary-sq">Join IEEE</Link>
                <Link href="/team" className="btn-outline-sq">Meet the Team</Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ABOUT_STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                    className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--ieee-blue)]/30 hover:shadow-[0_8px_24px_rgba(0,98,155,0.12)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--ieee-blue)]/4 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <p className="font-display text-2xl font-black text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">{stat.value}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Campus image ── */}
            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[var(--border)] bg-gray-900 shadow-[var(--shadow-lg)] sm:aspect-[5/6]">
                <HalftoneReveal
                  src={IMAGES.collegeTopView}
                  inkColor="#00629B"
                  paperColor="#0b1220"
                  mode="mono"
                  dotDensity={110}
                  angle={28}
                  revealRadius={0.32}
                  edge={0.75}
                  follow={0.3}
                  borderRadius="0px"
                  className="absolute inset-0"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                {/* HUD corners, echoing the home hero */}
                <span className="pointer-events-none absolute left-4 top-4 h-7 w-7 border-l border-t border-white/40" />
                <span className="pointer-events-none absolute right-4 top-4 h-7 w-7 border-r border-t border-white/40" />
                <span className="pointer-events-none absolute bottom-4 left-4 h-7 w-7 border-b border-l border-white/40" />
                <span className="pointer-events-none absolute bottom-4 right-4 h-7 w-7 border-b border-r border-white/40" />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-ieee-light">Our Campus</p>
                    <p className="mt-1 font-display text-lg font-bold text-white">S.G. Balekundri Institute of Technology</p>
                  </div>
                  <span className="hidden shrink-0 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm sm:block">
                    Est. 2014
                  </span>
                </div>
              </div>

              {/* Floating location chip */}
              <div className="absolute -bottom-5 left-6 hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 shadow-[var(--shadow-md)] sm:flex">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ieee-light opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-ieee-light" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">Belagavi, Karnataka</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────── */}
      <section ref={missionRef} className="border-t border-[var(--border)] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl grid gap-14 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={missionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label mb-3">Our Mission</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Advancing Technology<br />for the Benefit of Humanity
            </h2>
            <p className="mt-5 text-[var(--text-secondary)] leading-relaxed text-sm md:text-base">
              IEEE SGBIT connects students to a global network of engineers, researchers, and innovators. We create an
              environment where curiosity is celebrated, technical depth is rewarded, and leadership is developed.
            </p>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed text-sm md:text-base">
              From workshops and hackathons to guest lectures and paper presentations, every event bridges the gap
              between academic learning and real-world engineering.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/join" className="btn-primary-sq">Join IEEE</Link>
              <Link href="/events" className="btn-outline-sq">View Events</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={missionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            {[IMAGES.event1, IMAGES.campusAerial, IMAGES.excom, IMAGES.groupPhoto].map((src, i) => (
              <div key={i} className={`group overflow-hidden rounded-xl ${i === 2 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}>
                <Image
                  src={src}
                  alt="IEEE SGBIT"
                  width={400}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Core Values ───────────────────────────────────────── */}
      <section ref={valuesRef} className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <p className="section-label mb-3">What We Stand For</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Core Values
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ABOUT_VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.05 * i }}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--ieee-blue)]/25 hover:shadow-[var(--shadow-md)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ieee-blue)]/8 text-[var(--ieee-blue)] dark:text-[var(--ieee-light)] transition-colors duration-300 group-hover:bg-[var(--ieee-blue)]/15">
                  {valueIcons[i]}
                </div>
                <h3 className="mb-2 font-display text-base font-bold text-gray-900 dark:text-white">{val.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────── */}
      <section ref={timelineRef} className="border-t border-[var(--border)] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <p className="section-label mb-3">Our Journey</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              A Decade of Impact
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-[var(--ieee-blue)] via-[var(--border)] to-transparent" />

            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.08 * i }}
                  className="relative flex gap-6 pl-8"
                >
                  <div className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[var(--ieee-blue)] bg-[var(--bg)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--ieee-blue)] opacity-60" />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-3">
                      <span className="font-display text-xs font-black text-[var(--ieee-blue)] dark:text-[var(--ieee-light)] uppercase tracking-widest">{item.year}</span>
                      <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Faculty Advisor ───────────────────────────────────── */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="section-label mb-3">Guidance</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 md:text-3xl">
            Faculty Advisor
          </h2>
          <div className="mx-auto max-w-[200px]">
            <div className="group overflow-hidden rounded-2xl border border-[var(--border)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,98,155,0.2)]">
              <div className="relative aspect-[3/4]">
                <Image
                  src={FACULTY_ADVISOR.image}
                  alt={FACULTY_ADVISOR.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ieee-light)]">{FACULTY_ADVISOR.role}</p>
                  <p className="font-display text-sm font-bold text-white mt-0.5">{FACULTY_ADVISOR.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)] px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to be part of it?
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-md mx-auto">
            Join IEEE SGBIT and gain access to workshops, hackathons, networking events, and a community that pushes you to grow.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/join" className="btn-primary-sq px-8 py-3">Join IEEE SGBIT</Link>
            <Link href="/events" className="btn-outline-sq px-8 py-3">Explore Events</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
