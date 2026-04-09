"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const facultyAdvisor = {
  name: "Dr. Shankargoud Patil",
  role: "Faculty Advisor",
  image: "/images/execoms/Dr.%20Shankargoud%20Patil.JPG",
};

const execom = [
  { name: "Chairperson", role: "Chair", image: "/images/execoms/Chair.jpg" },
  { name: "Co-Chairperson", role: "Co-Chair", image: "/images/execoms/Co-Chair.jpg" },
  { name: "Secretary", role: "Secretary", image: "/images/execoms/Secretary.jpg" },
  { name: "Treasurer", role: "Treasurer", image: "/images/execoms/Treasurer.jpg" },
  { name: "MDC Chairperson", role: "MDC Chair", image: "/images/execoms/MDC%20Chair.jpg" },
  { name: "MDC Co-Chairperson", role: "MDC Co-Chair", image: "/images/execoms/MDC%20Co-Chair.jpg" },
  { name: "Publicity Head", role: "Publicity Head", image: "/images/execoms/Publicity%20Head.jpg" },
  { name: "Webmaster", role: "Webmaster", image: "/images/execoms/Webmaster.jpg" },
];

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Faculty card
      gsap.from(".faculty-card", {
        y: 60,
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".faculty-card", start: "top 85%", once: true },
      });

      // Team cards stagger
      gsap.utils.toArray<HTMLElement>(".team-member").forEach((card, i) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          scale: 0.85,
          rotateY: 10,
          duration: 0.9,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 92%", once: true },
        });
      });

      // CTA box
      gsap.from(".join-cta", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".join-cta", start: "top 90%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="team" ref={sectionRef} className="noise relative overflow-hidden px-6 py-32 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-ieee-blue/[0.03] blur-[200px] dark:bg-ieee-blue/[0.06]" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="mb-20 text-center"
        >
          <p className="section-label mb-4">People of IEEE SGBIT</p>
          <h2 className="font-display text-3xl font-bold tracking-[0.3em] text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            E X E C O M
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm text-gray-500 dark:text-white/40">
            The passionate team leading IEEE SGBIT — driving innovation, organizing events, and building a community of future engineers.
          </p>
        </motion.div>

        {/* Faculty Advisor */}
        <div className="faculty-card mx-auto mb-16 max-w-xs">
          <div className="group relative overflow-hidden rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30">
            <div className="relative aspect-[3/4]">
              <Image src={facultyAdvisor.image} alt={facultyAdvisor.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
              <p className="mb-1 text-[10px] tracking-[0.3em] text-ieee-light uppercase">{facultyAdvisor.role}</p>
              <h4 className="font-display text-xl font-bold text-white">{facultyAdvisor.name}</h4>
            </div>
          </div>
        </div>

        {/* Execom grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ perspective: "1000px" }}>
          {execom.map((member) => (
            <div key={member.role} className="team-member group relative overflow-hidden rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20">
              <div className="relative aspect-[3/4]">
                <Image src={member.image} alt={member.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
              </div>

              {/* Info overlay */}
              <div className="info absolute bottom-0 left-0 right-0 p-5">
                <p className="mb-1 text-[9px] tracking-[0.25em] text-ieee-light uppercase">{member.role}</p>
                <h4 className="font-display text-lg font-bold text-white">{member.name}</h4>
              </div>

              {/* Hover accent */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-500 group-hover:border-ieee-light/20" />
            </div>
          ))}
        </div>

        {/* Join CTA */}
        <div className="join-cta mt-20 text-center">
          <div className="glass-card mx-auto max-w-2xl rounded-2xl p-10 md:p-14">
            <h3 className="mb-4 font-display text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Want to be part of the team?
            </h3>
            <p className="mb-8 text-sm text-gray-500 dark:text-white/40 leading-relaxed">
              Recruitments open every year. Bring your passion for technology, and let&apos;s build the future together.
            </p>
            <button className="btn-primary">
              <span>Join IEEE SGBIT</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
