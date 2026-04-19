"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const activities = [
  {
    num: "01",
    title: "Technical Workshops",
    description: "Hands-on sessions on emerging tech — IoT, AI, embedded systems, cloud computing, and more. Learn by building, not just watching.",
    stat: "20+ per year",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Hackathons",
    description: "Intense competitions solving real-world problems with engineering ingenuity. Build, iterate, present — under 36 hours.",
    stat: "500+ participants",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Guest Lectures",
    description: "Insights from IEEE Distinguished Speakers, industry leaders, and research pioneers shaping modern technology.",
    stat: "30+ speakers",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Paper Presentations",
    description: "A platform for students to present original research, fostering academic rigour and a culture of scientific inquiry.",
    stat: "150+ papers",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Project Showcases",
    description: "Annual exhibitions where teams demo hardware, software, and interdisciplinary builds to judges and industry visitors.",
    stat: "80+ projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    num: "06",
    title: "Industry Connect",
    description: "Networking events, industrial visits, and mentorship programs that bridge the gap between campus and career.",
    stat: "40+ companies",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
];

export default function Activities() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="relative border-y border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 grid gap-8 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div>
            <p className="section-label mb-3">What We Do</p>
            <h2 className="font-display text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
              Building the Future,<br className="hidden sm:block" />
              <span className="text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]"> One Event at a Time</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--text-secondary)] md:text-right">
            From workshops to hackathons, we create experiences that shape tomorrow&apos;s engineers.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid gap-px bg-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)]">

          {/* Top row: 2 large + 1 stat */}
          <div className="grid gap-px bg-[var(--border)] md:grid-cols-3">
            {activities.slice(0, 2).map((act, i) => (
              <motion.div
                key={act.num}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                className="group relative flex flex-col justify-between bg-[var(--bg-card)] p-7 transition-colors duration-300 hover:bg-[var(--bg-secondary)]"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="font-display text-5xl font-black text-[var(--border-strong)] transition-colors duration-300 group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)] select-none">
                      {act.num}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all duration-300 group-hover:bg-[var(--ieee-blue)]/10 group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)]">
                      {act.icon}
                    </div>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-gray-900 dark:text-white">
                    {act.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {act.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 border-t border-[var(--border)] pt-4">
                  <div className="h-1 w-1 rounded-full bg-[var(--ieee-blue)] dark:bg-[var(--ieee-light)]" />
                  <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)]">{act.stat}</span>
                </div>
              </motion.div>
            ))}

            {/* Stat highlight cell */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.26 }}
              className="relative flex flex-col items-center justify-center bg-[var(--ieee-blue)] p-7 text-center"
            >
              <p className="font-display text-6xl font-black text-white">10+</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-white/70">Years Active</p>
              <div className="mt-6 h-px w-12 bg-white/20" />
              <p className="mt-4 text-xs leading-relaxed text-white/60 max-w-[160px]">
                Continuously delivering high-impact technical events since 2014.
              </p>
            </motion.div>
          </div>

          {/* Middle row: 1 tall stat + 2 cards */}
          <div className="grid gap-px bg-[var(--border)] md:grid-cols-3">
            {/* Tall quote/stat */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col justify-between bg-[var(--bg-card)] p-7"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--ieee-blue)] dark:text-[var(--ieee-light)] opacity-60">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" opacity="0.3"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor" opacity="0.3"/>
              </svg>
              <div>
                <p className="font-display text-xl font-bold leading-snug text-gray-900 dark:text-white">
                  &ldquo;Engineering is not just about building things — it&apos;s about building the future.&rdquo;
                </p>
                <p className="mt-3 text-xs text-[var(--text-muted)]">— IEEE SGBIT Mission</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="rounded-lg bg-[var(--bg-secondary)] p-3 text-center">
                  <p className="font-display text-2xl font-black text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">200+</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Members</p>
                </div>
                <div className="rounded-lg bg-[var(--bg-secondary)] p-3 text-center">
                  <p className="font-display text-2xl font-black text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">50+</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Events</p>
                </div>
              </div>
            </motion.div>

            {activities.slice(2, 4).map((act, i) => (
              <motion.div
                key={act.num}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.34 + i * 0.08 }}
                className="group relative flex flex-col justify-between bg-[var(--bg-card)] p-7 transition-colors duration-300 hover:bg-[var(--bg-secondary)]"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="font-display text-5xl font-black text-[var(--border-strong)] transition-colors duration-300 group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)] select-none">
                      {act.num}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all duration-300 group-hover:bg-[var(--ieee-blue)]/10 group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)]">
                      {act.icon}
                    </div>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-gray-900 dark:text-white">
                    {act.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {act.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 border-t border-[var(--border)] pt-4">
                  <div className="h-1 w-1 rounded-full bg-[var(--ieee-blue)] dark:bg-[var(--ieee-light)]" />
                  <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)]">{act.stat}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom row: 2 cards + CTA */}
          <div className="grid gap-px bg-[var(--border)] md:grid-cols-3">
            {activities.slice(4, 6).map((act, i) => (
              <motion.div
                key={act.num}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.08 }}
                className="group relative flex flex-col justify-between bg-[var(--bg-card)] p-7 transition-colors duration-300 hover:bg-[var(--bg-secondary)]"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="font-display text-5xl font-black text-[var(--border-strong)] transition-colors duration-300 group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)] select-none">
                      {act.num}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all duration-300 group-hover:bg-[var(--ieee-blue)]/10 group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)]">
                      {act.icon}
                    </div>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-gray-900 dark:text-white">
                    {act.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {act.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 border-t border-[var(--border)] pt-4">
                  <div className="h-1 w-1 rounded-full bg-[var(--ieee-blue)] dark:bg-[var(--ieee-light)]" />
                  <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)]">{act.stat}</span>
                </div>
              </motion.div>
            ))}

            {/* CTA cell */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col items-start justify-between bg-[var(--bg-card)] p-7"
            >
              <div>
                <p className="section-label mb-3">Ready to grow?</p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Join IEEE SGBIT and be part of a community that builds, learns, and leads together.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/join"
                  className="btn-primary-sq text-xs"
                >
                  Join Now
                </a>
                <a
                  href="/events"
                  className="btn-outline-sq text-xs"
                >
                  See Events
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
