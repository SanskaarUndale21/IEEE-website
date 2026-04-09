"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { events } from "@/data/events";

gsap.registerPlugin(ScrollTrigger);

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const event = events.find((e) => e.slug === slug);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".detail-reveal", {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".detail-reveal", start: "top 90%", once: true },
      });
      gsap.utils.toArray<HTMLElement>(".gallery-img").forEach((img, i) => {
        gsap.from(img, {
          y: 60,
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: img, start: "top 90%", once: true },
        });
      });
    }, contentRef);
    return () => ctx.revert();
  }, []);

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-white">Event Not Found</h1>
          <Link href="/events" className="mt-6 inline-block btn-primary"><span>Back to Events</span></Link>
        </div>
      </main>
    );
  }

  const currentIndex = events.findIndex((e) => e.slug === slug);
  const prevEvent = currentIndex > 0 ? events[currentIndex - 1] : null;
  const nextEvent = currentIndex < events.length - 1 ? events[currentIndex + 1] : null;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative flex h-[60vh] items-center justify-center overflow-hidden md:h-[70vh]">
        <div className="absolute inset-0">
          <Image src={event.image} alt={event.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-white/30 dark:from-dark dark:via-dark/50 dark:to-dark/30" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-4 flex items-center justify-center gap-3">
            <span className="text-xs font-bold tracking-[0.2em] text-ieee-light">( {event.number} )</span>
            <div className="h-px w-8 bg-gray-400/50" />
            <span className="text-[10px] tracking-[0.2em] text-gray-500 dark:text-white/40 uppercase">{event.date}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }} className="font-display text-4xl font-bold text-gray-900 dark:text-white md:text-6xl lg:text-7xl">
            {event.title}
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-gray-300 bg-white/50 px-3 py-1 text-[10px] tracking-[0.12em] text-gray-500 uppercase backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/40">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="absolute top-24 left-6 z-10 md:top-28 md:left-10">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.15em] text-gray-500 dark:text-white/30">
            <Link href="/" className="hover:text-ieee-light transition-colors">Home</Link>
            <span>/</span>
            <Link href="/events" className="hover:text-ieee-light transition-colors">Events</Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-white/60">{event.title}</span>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section ref={contentRef} className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="detail-reveal mb-6 flex items-center gap-4">
            <div className="h-[2px] w-12 bg-gradient-to-r from-ieee-blue to-ieee-light" />
            <span className="text-[10px] font-semibold tracking-[0.3em] text-gray-400 dark:text-white/40 uppercase">About this event</span>
          </div>

          <p className="detail-reveal text-lg leading-[2] text-gray-600 dark:text-white/60">
            {event.longDescription}
          </p>

          {/* Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <div className="mt-16">
              <h3 className="detail-reveal mb-8 font-display text-2xl font-bold text-gray-900 dark:text-white">
                Gallery
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {event.gallery.map((img, i) => (
                  <div key={i} className="gallery-img img-zoom rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20">
                    <div className="relative aspect-[4/3]">
                      <Image src={img} alt={`${event.title} gallery ${i + 1}`} fill className="object-cover rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-20 flex items-center justify-between border-t border-gray-200 pt-10 dark:border-white/8">
            {prevEvent ? (
              <Link href={`/events/${prevEvent.slug}`} className="group flex flex-col items-start">
                <span className="text-[9px] tracking-[0.2em] text-gray-400 dark:text-white/30 uppercase">Previous</span>
                <span className="font-display text-lg font-semibold text-gray-900 transition-colors group-hover:text-ieee-light dark:text-white">
                  {prevEvent.title}
                </span>
              </Link>
            ) : <div />}
            {nextEvent ? (
              <Link href={`/events/${nextEvent.slug}`} className="group flex flex-col items-end">
                <span className="text-[9px] tracking-[0.2em] text-gray-400 dark:text-white/30 uppercase">Next</span>
                <span className="font-display text-lg font-semibold text-gray-900 transition-colors group-hover:text-ieee-light dark:text-white">
                  {nextEvent.title}
                </span>
              </Link>
            ) : <div />}
          </div>

          {/* Back */}
          <div className="mt-12 text-center">
            <Link href="/events" className="btn-outline">
              ← Back to All Events
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
