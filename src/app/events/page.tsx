"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { events } from "@/data/events";

gsap.registerPlugin(ScrollTrigger);

export default function EventsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".event-row").forEach((row, i) => {
        gsap.from(row, {
          y: 100,
          opacity: 0,
          duration: 1,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 90%", once: true },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero banner */}
      <section className="noise relative flex h-[50vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/events_background01.jpg" alt="Events" fill className="object-cover opacity-20 dark:opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white dark:from-dark/60 dark:to-dark" />
        </div>
        <div className="relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="section-label mb-4">Our Legacy</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="font-display text-5xl font-bold tracking-[0.3em] text-gray-900 dark:text-white md:text-7xl">
            ALL EVENTS
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-sm text-gray-500 dark:text-white/40">
            <Link href="/" className="hover:text-ieee-light transition-colors">Home</Link>
            <span className="mx-2">/</span>
            Events
          </motion.p>
        </div>
      </section>

      {/* Events grid */}
      <section ref={containerRef} className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-20">
            {events.map((event, index) => {
              const isEven = index % 2 === 0;
              return (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className={`event-row group grid items-center gap-10 lg:grid-cols-2 ${!isEven ? "lg:[direction:rtl]" : ""}`}
                >
                  {/* Image */}
                  <div className={`img-zoom relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 ${!isEven ? "lg:[direction:ltr]" : ""}`}>
                    <Image src={event.image} alt={event.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-5">
                      <span className="font-display text-6xl font-black text-white/[0.08]">{event.number}</span>
                    </div>
                    {/* Arrow icon */}
                    <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="lg:[direction:ltr]">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-xs font-bold tracking-[0.2em] text-ieee-light">( {event.number} )</span>
                      <div className="h-px w-8 bg-gray-300 dark:bg-white/15" />
                      <span className="text-[10px] tracking-[0.15em] text-gray-400 dark:text-white/30 uppercase">{event.date}</span>
                    </div>
                    <h2 className="mb-4 font-display text-3xl font-bold text-gray-900 transition-colors group-hover:text-ieee-light dark:text-white md:text-4xl">
                      {event.title}
                    </h2>
                    <p className="mb-6 text-sm leading-[1.8] text-gray-500 dark:text-white/45 md:text-base">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-gray-200 px-3 py-1 text-[9px] tracking-[0.15em] text-gray-400 uppercase dark:border-white/8 dark:text-white/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
