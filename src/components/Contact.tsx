"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".contact-card", {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".contact-card", start: "top 88%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="noise relative overflow-hidden border-t border-gray-200/50 px-6 py-32 dark:border-white/[0.04] md:py-40">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-ieee-blue/[0.04] blur-[150px] dark:bg-ieee-blue/[0.06]" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="mb-16 text-center"
        >
          <p className="section-label mb-4">Stay Connected</p>
          <h2 className="font-display text-3xl font-bold tracking-[0.25em] text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
            FOLLOW THE INNOVATION
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500 dark:text-white/40">
            Get event updates, behind-the-scenes content, and recruitment announcements from our channels.
          </p>
        </motion.div>

        {/* Social cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="https://www.instagram.com/ieee_sgbit/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card glass-card group flex items-start gap-5 rounded-2xl p-8"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 transition-transform duration-500 group-hover:scale-110">
              <Image src="/images/instagram.svg" alt="Instagram" width={28} height={28} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="mb-1 text-[10px] tracking-[0.15em] text-gray-400 dark:text-white/35 uppercase">Instagram</p>
              <p className="mb-2 font-display text-lg font-bold text-gray-900 dark:text-white">@ieee_sgbit</p>
              <p className="text-sm text-gray-500 dark:text-white/40">Event highlights, workshop moments, and community stories.</p>
            </div>
          </a>

          <a
            href="https://www.linkedin.com/company/ieee-sgbit/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card glass-card group flex items-start gap-5 rounded-2xl p-8"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 transition-transform duration-500 group-hover:scale-110">
              <Image src="/images/linkedin.svg" alt="LinkedIn" width={28} height={28} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="mb-1 text-[10px] tracking-[0.15em] text-gray-400 dark:text-white/35 uppercase">LinkedIn</p>
              <p className="mb-2 font-display text-lg font-bold text-gray-900 dark:text-white">IEEE SGBIT</p>
              <p className="text-sm text-gray-500 dark:text-white/40">Official announcements, collaborations, and professional updates.</p>
            </div>
          </a>
        </div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-400 dark:text-white/25">For queries and collaborations, reach out at</p>
          <a href="mailto:ieee@sgbit.edu.in" className="mt-2 inline-block font-display text-xl font-bold text-ieee-light transition-colors hover:text-ieee-blue">
            ieee@sgbit.edu.in
          </a>
        </motion.div>
      </div>
    </section>
  );
}
