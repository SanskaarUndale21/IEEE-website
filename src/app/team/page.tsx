"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const facultyAdvisor = {
  name: "Dr. Shankargoud Patil",
  role: "Faculty Advisor",
  image: "/images/execoms/Dr.%20Shankargoud%20Patil.JPG",
};

const execomMembers = [
  { name: "Chairperson",        role: "Chair",              image: "/images/execoms/chair.jpg" },
  { name: "Co-Chairperson",     role: "Co-Chair",           image: "/images/execoms/Co-Chair.jpg" },
  { name: "Secretary",          role: "Secretary",          image: "/images/execoms/Secretary.jpg" },
  { name: "Treasurer",          role: "Treasurer",          image: "/images/execoms/Treasurer.jpg" },
  { name: "MDC Chairperson",    role: "MDC Chair",          image: "/images/execoms/MDC%20Chair.jpg" },
  { name: "MDC Co-Chairperson", role: "MDC Co-Chair",       image: "/images/execoms/MDC%20Co-Chair.jpg" },
  { name: "Publicity Head",     role: "Publicity Head",     image: "/images/execoms/Publicity%20Head.jpg" },
  { name: "Webmaster",          role: "Webmaster",          image: "/images/execoms/Webmaster.jpg" },
];

export default function TeamPage() {
  return (
    <main className="noise relative min-h-screen overflow-hidden px-6 pb-32 pt-28">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-ieee-blue/[0.04] blur-[200px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-ieee-light/[0.03] blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ── Back button ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Link
            href="/#team"
            className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase transition-colors duration-300 hover:text-ieee-light"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="mb-20 text-center"
        >
          <p className="section-label mb-4">IEEE SGBIT</p>
          <h1 className="font-display text-3xl font-bold tracking-[0.3em] text-white md:text-5xl lg:text-6xl">
            E X E C O M 2025
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/40">
            Meet the passionate leaders of IEEE SGBIT — the executive committee driving innovation and excellence.
          </p>
        </motion.div>

        {/* ── Faculty Advisor ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mb-16"
        >
          <p className="mb-8 text-center text-[9px] font-bold tracking-[0.35em] text-ieee-light/60 uppercase">
            Faculty Advisor
          </p>
          <div className="mx-auto max-w-[260px]">
            <MemberCard name={facultyAdvisor.name} role={facultyAdvisor.role} image={facultyAdvisor.image} index={0} />
          </div>
        </motion.div>

        {/* ── Execom Grid ─────────────────────────────────────── */}
        <div>
          <p className="mb-8 text-center text-[9px] font-bold tracking-[0.35em] text-ieee-light/60 uppercase">
            Executive Committee
          </p>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
            {execomMembers.map((member, i) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 40, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <MemberCard {...member} index={i + 1} />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

/* ── Individual member card ────────────────────────────────── */
function MemberCard({
  name,
  role,
  image,
  index,
}: {
  name: string;
  role: string;
  image: string;
  index: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-lg shadow-black/20 dark:shadow-black/40">
      {/* photo */}
      <div className="relative aspect-[3/4]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 280px"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" />

        {/* number badge */}
        <div className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <span className="font-display text-[10px] font-black text-ieee-light">
            {String(index).padStart(2, "0")}
          </span>
        </div>

        {/* hover accent border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-500 group-hover:border-ieee-light/20" />
      </div>

      {/* info overlay — slides up on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 translate-y-1 p-5 transition-transform duration-400 group-hover:translate-y-0"
      >
        <p className="mb-1 text-[8px] font-bold tracking-[0.25em] text-ieee-light uppercase">
          {role}
        </p>
        <h4 className="font-display text-lg font-bold leading-tight text-white">{name}</h4>
      </div>
    </div>
  );
}
