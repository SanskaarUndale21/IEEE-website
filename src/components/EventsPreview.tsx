"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { events } from "@/data/events";

export default function EventsPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const [featured, ...rest] = events;
  const grid = rest.slice(0, 3);

  return (
    <section id="events" ref={sectionRef} className="relative px-5 py-24 md:px-8 md:py-32 bg-[var(--bg)]">
      {/* Section header */}
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="section-label mb-2">Our Legacy</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Events & Highlights
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--ieee-blue)] dark:text-[var(--ieee-light)] transition-all hover:gap-3"
          >
            View all events
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Editorial grid */}
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          {/* Featured — large left card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <Link
              href={`/events/${featured.slug}`}
              className="group relative block overflow-hidden rounded-2xl bg-gray-900"
              style={{ minHeight: 480 }}
            >
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover opacity-70 transition-all duration-700 group-hover:opacity-80 group-hover:scale-105"
                priority
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Top bar */}
              <div className="absolute left-5 top-5 right-5 flex items-center justify-between">
                <span className="rounded-full bg-[var(--ieee-blue)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Featured
                </span>
                <span className="font-display text-5xl font-black text-white/10 select-none">
                  {featured.number}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {featured.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-sm">
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="mb-1.5 font-display text-2xl font-bold leading-snug text-white md:text-3xl">
                  {featured.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/60">
                  {featured.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide text-white/50">{featured.date}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-[var(--ieee-blue)] group-hover:border-[var(--ieee-blue)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right column — 3 stacked cards */}
          <div className="flex flex-col gap-4">
            {grid.map((event, i) => (
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
                className="flex-1"
              >
                <Link
                  href={`/events/${event.slug}`}
                  className="group flex h-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--ieee-blue)]/20 hover:shadow-[var(--shadow-md)]"
                >
                  {/* Image thumbnail */}
                  <div className="relative w-28 flex-shrink-0 overflow-hidden sm:w-32">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col justify-center p-4">
                    <span className="mb-1 text-[10px] font-bold tracking-[0.15em] text-[var(--ieee-blue)] uppercase dark:text-[var(--ieee-light)]">
                      {event.date}
                    </span>
                    <h3 className="mb-1 font-display text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-[var(--ieee-blue)] dark:text-white dark:group-hover:text-[var(--ieee-light)]">
                      {event.title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {event.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-shrink-0 items-center pr-4">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[var(--text-muted)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)]"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* More events CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Link
                href="/events"
                className="group flex h-full min-h-[72px] items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border-strong)] bg-transparent transition-all duration-300 hover:border-[var(--ieee-blue)] hover:bg-[var(--ieee-blue)]/5"
              >
                <span className="text-sm font-semibold text-[var(--text-muted)] transition-colors group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)]">
                  +{events.length - 4} more events
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)] transition-all group-hover:translate-x-1 group-hover:text-[var(--ieee-blue)] dark:group-hover:text-[var(--ieee-light)]">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
