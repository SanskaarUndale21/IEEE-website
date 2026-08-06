"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import CursorGrid from "@/components/ui/CursorGrid";
import { events } from "@/data/events";

export default function EventsPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme !== "light";

  const current = events[active];
  const total = String(events.length).padStart(2, "0");

  return (
    <section
      id="events"
      ref={sectionRef}
      className="relative border-y border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-24 md:px-8 md:py-32"
    >
      {/* clipping lives here, not on the section — the section must stay
          overflow-visible or the sticky preview column stops sticking */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {mounted && (
          <CursorGrid
            cellSize={72}
            color={isDark ? "#0EA5E9" : "#00629B"}
            radius={190}
            falloff="smooth"
            holdTime={260}
            fadeDuration={1100}
            lineWidth={1}
            maxOpacity={isDark ? 0.5 : 0.32}
            fillOpacity={isDark ? 0.05 : 0.03}
            gridOpacity={isDark ? 0.035 : 0.05}
            cellRadius={2}
            clickPulse
            pulseSpeed={520}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_70%_0%,rgba(0,98,155,0.07),rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(90%_60%_at_70%_0%,rgba(14,165,233,0.10),rgba(0,0,0,0)_70%)]" />
      </div>

      <div className="relative z-[1] mx-auto max-w-7xl">
        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10 md:mb-14"
        >
          <div className="mb-4 flex items-center gap-3">
            <p className="section-label">Our Legacy</p>
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="font-mono text-[10px] tracking-[0.25em] text-[var(--text-muted)]">
              {total} IN THE ARCHIVE
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-gray-900 dark:text-white md:text-6xl">
              Events &amp;
              <br />
              <span className="text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">Highlights</span>
            </h2>
            <Link
              href="/events"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)] transition-all duration-300 hover:border-[var(--ieee-blue)] hover:text-[var(--ieee-blue)] dark:hover:border-[var(--ieee-light)] dark:hover:text-[var(--ieee-light)]"
            >
              View all events
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* ── Preview + index ────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-14">
          {/* Sticky preview — desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hidden lg:block"
          >
            <div className="sticky top-28">
              <Link
                href={`/events/${current.slug}`}
                className="group relative block h-[clamp(26rem,56vh,34rem)] w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-gray-900"
              >
                <AnimatePresence mode="sync">
                  <motion.div
                    key={current.slug}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={current.image}
                      alt={current.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 26rem"
                      className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <span className="absolute right-5 top-4 select-none font-display text-7xl font-black leading-none text-white/10">
                  {current.number}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {current.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/75 backdrop-blur-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-3xl font-bold leading-tight text-white">
                    {current.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
                    {current.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {current.date}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                      Open
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ieee-blue)] transition-transform duration-300 group-hover:rotate-45">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Index rows */}
          <div
            className="border-b border-[var(--border)]"
            onMouseLeave={() => setActive(0)}
          >
            {events.map((event, i) => {
              const isActive = i === active;
              return (
                <motion.div
                  key={event.slug}
                  initial={{ opacity: 0, y: 18 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.05 }}
                >
                  <Link
                    href={`/events/${event.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group relative flex items-center gap-4 border-t border-[var(--border)] py-4 sm:gap-6 sm:py-6"
                  >
                    {/* sweep highlight */}
                    <span
                      className={`pointer-events-none absolute inset-y-0 -left-4 -right-4 rounded-xl bg-gradient-to-r from-[var(--ieee-blue)]/[0.07] to-transparent transition-opacity duration-500 dark:from-[var(--ieee-light)]/[0.07] ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    <span
                      className={`relative font-mono text-[10px] tabular-nums transition-colors duration-300 ${
                        isActive
                          ? "text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {event.number}
                    </span>

                    {/* thumbnail stands in for the preview panel on small screens */}
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] lg:hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>

                    <span className="relative min-w-0 flex-1">
                      <h3
                        className={`truncate font-display text-lg font-bold transition-all duration-500 group-hover:translate-x-1.5 sm:text-2xl ${
                          isActive
                            ? "text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {event.title}
                      </h3>
                      <span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)] lg:hidden">
                        {event.date}
                      </span>
                    </span>

                    <span className="relative hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] lg:block">
                      {event.date}
                    </span>

                    <span
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isActive
                          ? "border-[var(--ieee-blue)] bg-[var(--ieee-blue)] text-white dark:border-[var(--ieee-light)] dark:bg-[var(--ieee-light)]"
                          : "border-[var(--border-strong)] text-[var(--text-muted)]"
                      }`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
