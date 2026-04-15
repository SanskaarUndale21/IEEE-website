"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const parallaxRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax on images
      gsap.utils.toArray<HTMLElement>(".about-img").forEach((img) => {
        gsap.fromTo(
          img,
          { y: 60 },
          {
            y: -60,
            ease: "none",
            scrollTrigger: {
              trigger: img,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          }
        );
      });

      // Counter animation
      if (statsRef.current) {
        gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
          const target = parseInt(el.getAttribute("data-target") || "0", 10);
          gsap.fromTo(
            el,
            { innerText: 0 },
            {
              innerText: target,
              duration: 2,
              ease: "power2.out",
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
              },
            }
          );
        });
      }

      // Text reveal
      gsap.from(".about-text-reveal", {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-text-reveal",
          start: "top 85%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="noise relative overflow-hidden px-6 py-32 md:py-40">
      {/* Glow */}
      <div className="pointer-events-none absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-ieee-blue/5 blur-[180px] dark:bg-ieee-blue/8" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9 }} className="mb-20 text-center">
          <p className="section-label mb-4">Who We Are</p>
          <h2 className="font-display text-3xl font-bold tracking-[0.3em] text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            A B O U T
          </h2>
        </motion.div>

        {/* Two column */}
        <div ref={parallaxRef} className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — Text */}
          <div>
            <div className="about-text-reveal mb-6 flex items-center gap-4">
              <div className="h-[2px] w-12 bg-gradient-to-r from-ieee-blue to-ieee-light" />
              <span className="text-[10px] font-semibold tracking-[0.25em] text-gray-400 dark:text-white/40 uppercase">Est. IEEE Student Branch</span>
            </div>

            <h3 className="about-text-reveal mb-6 font-display text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">
              Advancing Technology
              <br />
              <span className="gradient-text-blue">for Humanity</span>
            </h3>

            <p className="about-text-reveal mb-5 text-base leading-[1.8] text-gray-600 dark:text-white/55">
              IEEE Student Branch at S.G. Balekundri Institute of Technology, Belagavi, is a vibrant community of engineers, innovators, and technology enthusiasts. We bridge academic learning and real-world engineering through hands-on workshops, hackathons, conferences, and industry collaborations.
            </p>

            <p className="about-text-reveal mb-10 text-base leading-[1.8] text-gray-600 dark:text-white/55">
              As part of the world&apos;s largest technical professional organization, our branch empowers students with cutting-edge knowledge, professional networking, and opportunities to lead meaningful technological advancement.
            </p>

            {/* Stats */}
            <div ref={statsRef} className="about-text-reveal grid grid-cols-3 gap-6">
              {[
                { target: 100, suffix: "+", label: "Members" },
                { target: 30, suffix: "+", label: "Events" },
                { target: 10, suffix: "+", label: "Awards" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-4xl font-bold gradient-text-blue">
                    <span className="stat-number" data-target={stat.target}>0</span>
                    {stat.suffix}
                  </p>
                  <p className="mt-1 text-[10px] tracking-[0.25em] text-gray-400 dark:text-white/35 uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Image grid */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1, delay: 0.3 }} className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Large */}
              <div className="about-img img-zoom col-span-2 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30">
                <div className="relative aspect-[16/9]">
                  <Image src="/images/groupimage2.jpg" alt="IEEE Team" fill className="object-cover rounded-2xl" />
                </div>
              </div>
              {/* Small 1 */}
              <div className="about-img img-zoom rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20">
                <div className="relative aspect-square">
                  <Image src="/images/ig_25.jpeg" alt="Activities" fill className="object-cover rounded-2xl" />
                </div>
              </div>
              {/* Small 2 */}
              <div className="about-img img-zoom rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20">
                <div className="relative aspect-square">
                  <Image src="/images/sgbit topview.jpg" alt="Campus" fill className="object-cover rounded-2xl" />
                </div>
              </div>
            </div>

            {/* Floating SGBIT logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="absolute -left-6 -top-6 z-10 hidden lg:block"
            >
              <div className="glass flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg animate-float">
                <Image src="/images/sgbit_logo-removebg-preview.png" alt="SGBIT" width={50} height={50} className="object-contain" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
