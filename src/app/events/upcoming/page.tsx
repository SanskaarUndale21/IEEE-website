"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function UpcomingEventsPage() {
  return (
    <main className="noise relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ieee-blue/[0.06] blur-[200px]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-ieee-light/20 bg-ieee-light/5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,163,224,0.8)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>

        <p className="section-label">Coming Soon</p>

        <h1 className="font-display text-4xl font-black tracking-[0.2em] text-white md:text-6xl">
          UPCOMING<br />EVENTS
        </h1>

        <p className="max-w-md text-sm leading-relaxed text-white/40">
          We&apos;re currently planning exciting new events for the IEEE SGBIT community.
          Stay tuned — something great is on its way.
        </p>

        {/* Animated dots */}
        <div className="flex gap-2 py-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-ieee-light"
            />
          ))}
        </div>

        <Link
          href="/events"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-ieee-light/25 bg-ieee-light/5 px-6 py-2.5 text-[11px] font-bold tracking-[0.2em] text-ieee-light uppercase transition-all duration-400 hover:border-ieee-light/50 hover:bg-ieee-light/10"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          View Past Events
        </Link>
      </motion.div>
    </main>
  );
}
