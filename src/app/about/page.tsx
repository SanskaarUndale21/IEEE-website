"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "200+", label: "Active Members" },
  { value: "50+",  label: "Events Hosted" },
  { value: "10+",  label: "Awards Won" },
  { value: "2014", label: "Established" },
];

const values = [
  {
    title: "Innovation",
    description: "We push boundaries and embrace emerging technologies to solve real-world problems.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Collaboration",
    description: "We believe the best ideas come from diverse minds working toward a shared goal.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Excellence",
    description: "We hold ourselves to high standards — in events, in membership, and in everything we build.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Leadership",
    description: "We develop leaders who communicate with clarity, act with integrity, and inspire others.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
    ),
  },
  {
    title: "Integrity",
    description: "We are honest, transparent, and committed to ethical conduct in all that we do.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Impact",
    description: "Everything we do is measured by how it positively affects our members and community.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
];

const timeline = [
  { year: "2014", title: "Founded", description: "IEEE SGBIT Student Branch officially established at S.G. Balekundri Institute of Technology." },
  { year: "2017", title: "First Hackathon", description: "Hosted Hack-n-Hunt — our flagship hackathon that now draws 500+ participants annually." },
  { year: "2019", title: "Best Branch Award", description: "Recognized as Best IEEE Student Branch in Karnataka Section for outstanding activities." },
  { year: "2021", title: "Digital Pivot", description: "Hosted 15+ virtual events during the pandemic, keeping the community connected and active." },
  { year: "2023", title: "200 Members", description: "Crossed 200 active members — the largest technical student community in SGBIT." },
  { year: "2025", title: "Today", description: "Continuing to innovate with new initiatives in AI, embedded systems, and industry partnerships." },
];

export default function AboutPage() {
  const heroRef   = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const missionInView  = useInView(missionRef,  { once: true, margin: "-80px" });
  const valuesInView   = useInView(valuesRef,   { once: true, margin: "-80px" });
  const timelineInView = useInView(timelineRef, { once: true, margin: "-80px" });

  return (
    <main className="bg-[var(--bg)]">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 pt-28 pb-20 md:px-8 md:pt-36 md:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <Image src="/images/5.JPG" alt="IEEE SGBIT" fill className="object-cover opacity-10 dark:opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/50 via-[var(--bg)]/60 to-[var(--bg)]" />
        </div>

        <div ref={heroRef} className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--ieee-blue)] dark:hover:text-[var(--ieee-light)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Home
            </Link>
            <p className="section-label mb-4 mt-8">About Us</p>
            <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
              IEEE SGBIT<br />
              <span className="text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">Student Branch</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
              The IEEE Student Branch at S.G. Balekundri Institute of Technology, Belagavi, is a hub for engineering
              students passionate about technology, innovation, and professional growth.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                <p className="font-display text-3xl font-bold text-[var(--ieee-blue)] dark:text-[var(--ieee-light)]">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────── */}
      <section ref={missionRef} className="border-t border-[var(--border)] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={missionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label mb-3">Our Mission</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Advancing Technology<br />for the Benefit of Humanity
            </h2>
            <p className="mt-5 text-[var(--text-secondary)] leading-relaxed">
              IEEE SGBIT connects students to a global network of engineers, researchers, and innovators. We create an environment where curiosity is celebrated, technical depth is rewarded, and leadership is developed.
            </p>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
              From workshops and hackathons to guest lectures and paper presentations, every event is designed to bridge the gap between academic learning and real-world engineering.
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
            {["/images/5.JPG", "/images/sgbit topview.jpg", "/images/execoms/excom.jpg", "/images/5.JPG"].map((src, i) => (
              <div key={i} className={`overflow-hidden rounded-xl ${i === 2 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}>
                <Image src={src} alt="IEEE SGBIT" width={400} height={300} className="h-full w-full object-cover" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Core Values ───────────────────────────────────────── */}
      <section ref={valuesRef} className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-20 md:px-8 md:py-28">
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
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.05 * i }}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--ieee-blue)]/20 hover:shadow-[var(--shadow-md)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ieee-blue)]/8 text-[var(--ieee-blue)] dark:text-[var(--ieee-light)] transition-colors duration-300 group-hover:bg-[var(--ieee-blue)]/12">
                  {val.icon}
                </div>
                <h3 className="mb-2 font-display text-base font-bold text-gray-900 dark:text-white">{val.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────── */}
      <section ref={timelineRef} className="border-t border-[var(--border)] px-5 py-20 md:px-8 md:py-28">
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
            {/* Vertical line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[var(--border)]" />

            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.08 * i }}
                  className="relative flex gap-6 pl-8"
                >
                  {/* Dot */}
                  <div className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[var(--ieee-blue)] bg-[var(--bg)]" />

                  <div>
                    <div className="mb-1 flex items-center gap-3">
                      <span className="font-display text-xs font-bold text-[var(--ieee-blue)] dark:text-[var(--ieee-light)] uppercase tracking-widest">{item.year}</span>
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
      <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="section-label mb-3">Guidance</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-10 md:text-3xl">
            Faculty Advisor
          </h2>
          <div className="mx-auto max-w-[220px]">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <div className="relative aspect-[3/4]">
                <Image
                  src="/images/execoms/Dr.%20Shankargoud%20Patil.JPG"
                  alt="Dr. Shankargoud Patil"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ieee-light)]">Faculty Advisor</p>
                  <p className="font-display text-sm font-bold text-white">Dr. Shankargoud Patil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)] px-5 py-20 md:px-8 md:py-24">
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
