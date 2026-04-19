"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const dots = [
  { delay: 0,   cx: "15%", cy: "25%", r: 1.5 },
  { delay: 0.4, cx: "80%", cy: "15%", r: 1   },
  { delay: 0.8, cx: "70%", cy: "80%", r: 1.5 },
  { delay: 1.2, cx: "20%", cy: "70%", r: 1   },
  { delay: 0.6, cx: "50%", cy: "90%", r: 1.2 },
];

export default function UpcomingEventsPage() {
  return (
    <main className="noise relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-center">

      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ieee-blue/[0.06] blur-[200px]" />
        <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-ieee-light/[0.04] blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[250px] w-[250px] rounded-full bg-purple-500/[0.04] blur-[100px]" />

        {/* Floating accent dots */}
        {dots.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-ieee-light/30"
            style={{ left: d.cx, top: d.cy, width: d.r * 6, height: d.r * 6 }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Subtle grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-24 w-24 items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full border border-ieee-light/15 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-2 rounded-full border border-ieee-light/20" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ieee-light/25 bg-ieee-light/8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ieee-light">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </motion.div>

        <div>
          <p className="section-label mb-3">What&apos;s Next</p>
          <h1 className="font-display text-5xl font-black tracking-[0.18em] text-gray-900 dark:text-white md:text-7xl">
            UPCOMING<br />
            <span className="gradient-text">EVENTS</span>
          </h1>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
          We&apos;re busy planning exciting new events for the IEEE SGBIT community.
          Stay tuned — something great is on its way.
        </p>

        {/* Animated loading dots */}
        <div className="flex items-center gap-2 py-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-ieee-light"
            />
          ))}
          <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ieee-light/60">Planning in progress</span>
        </div>

        {/* CTA buttons */}
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/events"
            className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] transition-all duration-300 hover:border-ieee-blue/50 hover:text-[var(--ieee-blue)] dark:hover:border-ieee-light/50 dark:hover:text-ieee-light"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            View Past Events
          </Link>

          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ieee-blue)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#004F7D] hover:shadow-[0_6px_20px_rgba(0,98,155,0.35)]"
          >
            Get Notified
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
