"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const facultyAdvisor = {
  name: "Dr. Shankargoud Patil",
  role: "Faculty Advisor",
  image: "/images/execoms/Dr.%20Shankargoud%20Patil.JPG",
  social: {
    email: "mailto:advisor@ieee-sgbit.org",
    linkedin: "#",
    instagram: "#",
    github: "#",
    phone: "tel:+910000000000",
  },
};

const execomMembers = [
  {
    name: "Chairperson",
    role: "Chair",
    image: "/images/execoms/chair.jpg",
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Co-Chairperson",
    role: "Co-Chair",
    image: "/images/execoms/Co-Chair.jpg",
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Secretary",
    role: "Secretary",
    image: "/images/execoms/Secretary.jpg",
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Treasurer",
    role: "Treasurer",
    image: "/images/execoms/Treasurer.jpg",
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "MDC Chairperson",
    role: "MDC Chair",
    image: "/images/execoms/MDC%20Chair.jpg",
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "MDC Co-Chairperson",
    role: "MDC Co-Chair",
    image: "/images/execoms/MDC%20Co-Chair.jpg",
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Publicity Head",
    role: "Publicity Head",
    image: "/images/execoms/Publicity%20Head.jpg",
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
  {
    name: "Webmaster",
    role: "Webmaster",
    image: "/images/execoms/Webmaster.jpg",
    social: { email: "#", linkedin: "#", instagram: "#", github: "#", phone: "#" },
  },
];

type Social = { email: string; linkedin: string; instagram: string; github: string; phone: string };

export default function TeamPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-5 pb-32 pt-28 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--ieee-blue)] dark:hover:text-[var(--ieee-light)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <p className="section-label mb-4">IEEE SGBIT</p>
          <h1 className="font-display text-4xl font-bold tracking-[0.25em] text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            EXECOM 2025
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
            Meet the leaders of IEEE SGBIT — the executive committee driving innovation and excellence.
          </p>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Hover over a card (or tap on mobile) to reveal social links.
          </p>
        </motion.div>

        {/* Faculty Advisor */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mb-16"
        >
          <p className="mb-8 text-center text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--text-muted)]">
            Faculty Advisor
          </p>
          <div className="mx-auto max-w-[240px]">
            <MemberCard
              id="advisor"
              name={facultyAdvisor.name}
              role={facultyAdvisor.role}
              image={facultyAdvisor.image}
              social={facultyAdvisor.social}
              index={0}
              isActive={activeId === "advisor"}
              onToggle={toggle}
            />
          </div>
        </motion.div>

        {/* Execom grid */}
        <div>
          <p className="mb-8 text-center text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--text-muted)]">
            Executive Committee
          </p>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {execomMembers.map((member, i) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <MemberCard
                  id={member.role}
                  name={member.name}
                  role={member.role}
                  image={member.image}
                  social={member.social}
                  index={i + 1}
                  isActive={activeId === member.role}
                  onToggle={toggle}
                />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

function MemberCard({
  id,
  name,
  role,
  image,
  social,
  index,
  isActive,
  onToggle,
}: {
  id: string;
  name: string;
  role: string;
  image: string;
  social: Social;
  index: number;
  isActive: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className={`member-card group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)] ${isActive ? "active" : ""}`}
      onClick={() => onToggle(id)}
    >
      {/* Photo */}
      <div className="relative aspect-[3/4]">
        <Image
          src={image}
          alt={name}
          fill
          className="member-img object-cover object-top transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 280px"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Index badge */}
        <div className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <span className="font-display text-[10px] font-black text-white/70">
            {String(index).padStart(2, "0")}
          </span>
        </div>

        {/* Name + role — always visible */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ieee-light)]">
            {role}
          </p>
          <h4 className="font-display text-base font-bold leading-tight text-white">{name}</h4>
        </div>
      </div>

      {/* Social bar — slides up on hover/active */}
      <div className="member-social absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-white/10 bg-black/80 px-3 py-3 backdrop-blur-md">
        <SocialLink href={social.instagram} label="Instagram">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
          </svg>
        </SocialLink>
        <SocialLink href={social.github} label="GitHub">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </SocialLink>
        <SocialLink href={social.linkedin} label="LinkedIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </SocialLink>
        <SocialLink href={social.email} label="Email">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </SocialLink>
        <SocialLink href={social.phone} label="Phone">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
        </SocialLink>
      </div>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}
