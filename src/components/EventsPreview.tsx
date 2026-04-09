"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { events } from "@/data/events";

gsap.registerPlugin(ScrollTrigger);

export default function EventsPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".event-preview-card").forEach((card, i) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          scale: 0.95,
          duration: 0.9,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true,
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const previewEvents = events.slice(0, 4);

  return (
    <section id="events" ref={sectionRef} className="noise relative overflow-hidden px-6 py-32 md:py-40">
      <div className="pointer-events-none absolute left-0 top-1/4 h-[700px] w-[700px] rounded-full bg-ieee-blue/[0.03] blur-[200px] dark:bg-ieee-blue/[0.05]" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="mb-20 text-center"
        >
          <p className="section-label mb-4">What We&apos;ve Built</p>
          <h2 className="font-display text-3xl font-bold tracking-[0.3em] text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            E V E N T S
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-white/40">
            From national conferences to hands-on hackathons, our events inspire, educate, and connect the next generation of engineers.
          </p>
        </motion.div>

        {/* Preview Grid — 4 events */}
        <div className="grid gap-8 sm:grid-cols-2">
          {previewEvents.map((event) => (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className="event-preview-card event-card-glow group glass-card overflow-hidden rounded-2xl"
            >
              {/* Image */}
              <div className="img-zoom relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                <Image src={event.image} alt={event.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="font-display text-5xl font-black text-white/10">
                    {event.number}
                  </span>
                </div>
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </div>
              {/* Info */}
              <div className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-ieee-light uppercase">
                    {event.date}
                  </span>
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-gray-900 transition-colors group-hover:text-ieee-light dark:text-white">
                  {event.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-white/45">
                  {event.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[9px] tracking-[0.12em] text-gray-400 uppercase dark:border-white/8 dark:text-white/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Link href="/events" className="btn-primary">
            <span>View All Events</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
