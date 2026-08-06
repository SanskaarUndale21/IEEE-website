"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { FACULTY_ADVISOR, BOY_MEMBERS, GIRL_MEMBERS } from "@/constants";

const FluidCursor = dynamic(() => import("@/components/three/FluidCursor"), {
  ssr: false,
});

type Social = { email: string; linkedin: string; instagram: string; github: string; phone: string };

export default function TeamPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  /* Combine members into a single sequence for the unified 3-column grid */
  const allMembers = [...BOY_MEMBERS, ...GIRL_MEMBERS];

  return (
    <main className="noise relative min-h-screen overflow-hidden bg-gray-950 px-5 pb-12 pt-28 md:px-8 md:pt-32">
      {/* Colored fluid trail follows the cursor across the whole page */}
      <FluidCursor
        colorA="#00629B"
        colorB="#0EA5E9"
        className="fixed inset-0 z-0"
      />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <p className="section-label mb-2 !text-ieee-light">IEEE SGBIT</p>
          <h1 className="font-display text-3xl font-bold tracking-[0.2em] text-white md:text-5xl lg:text-6xl">
            EXECOM 2025
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-white/50">
            Technical leadership at IEEE SGBIT.
          </p>
        </motion.div>

        {/* ── Faculty Advisor - Horizontal Wide Layout ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[var(--shadow-lg)] backdrop-blur-sm flex flex-col md:flex-row items-center gap-8 p-6 md:p-10">
              {/* Photo - Stretched to be big */}
              <div className="relative aspect-square w-full max-w-[300px] shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                 <Image
                    src={FACULTY_ADVISOR.image}
                    alt={FACULTY_ADVISOR.name}
                    fill
                    className="object-cover object-top"
                    sizes="300px"
                 />
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-ieee-light underline underline-offset-8 decoration-ieee-light/30">
                  {FACULTY_ADVISOR.role}
                </p>
                <h2 className="font-display text-3xl font-black tracking-wider text-white md:text-5xl lg:text-5xl mb-4">
                  {FACULTY_ADVISOR.name}
                </h2>
                <p className="text-sm leading-relaxed text-white/60 mb-6 max-w-2xl">
                  Providing visionary leadership and academic guidance to the IEEE SGBIT Student Branch, steering our members towards technical excellence and professional growth.
                </p>

                {/* Socials */}
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <a href={FACULTY_ADVISOR.social.linkedin} className="flex h-10 w-10 items-center justify-center rounded-full bg-ieee-light/10 text-ieee-light transition-colors hover:bg-ieee-light hover:text-gray-950">
                    <LinkedinIcon />
                  </a>
                  <a href={FACULTY_ADVISOR.social.email} className="flex h-10 w-10 items-center justify-center rounded-full bg-ieee-light/10 text-ieee-light transition-colors hover:bg-ieee-light hover:text-gray-950">
                    <EmailIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Unified Grid (3 columns, all same size) ── */}
        <div className="mb-8">
           <p className="mb-6 text-center text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">
            Executive Committee
          </p>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {allMembers.map((member, i) => (
              <motion.div
                key={`${member.role}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
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

/* ─────────────────────────────────────────────────────────────
   MemberCard
   - Fixed size, no scale on hover.
───────────────────────────────────────────────────────────── */
function MemberCard({
  id, name, role, image, social, index, isActive, onToggle,
}: {
  id: string; name: string; role: string; image: string; social: Social;
  index: number; isActive: boolean; onToggle: (id: string) => void;
}) {
  const hasImage = Boolean(image);

  return (
    <div className="h-full">
      <div
        className={`member-card group relative h-full cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300
          ${isActive
            ? "active border-[rgba(0,163,224,0.5)] shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
            : "border-white/10 hover:border-[rgba(0,163,224,0.4)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          }`}
        onClick={() => onToggle(id)}
      >
        {/* Photo area - Fixed aspect for all */}
        <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.03]">

          {hasImage ? (
            <Image
              src={image}
              alt={name}
              fill
              className={`member-img object-cover object-top transition-all duration-500`}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
            />
          ) : (
            /* ── Placeholder for missing image ── */
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
               <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/15">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
               </div>
               <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/30">Awaiting Photo</p>
            </div>
          )}

          {/* Static Gradient (No hover scale to keep constant feel) */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent ${!hasImage ? 'opacity-0' : 'opacity-100'}`} />

          {/* Badge */}
          {index > 0 && (
            <div className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              <span className="font-display text-[9px] font-black text-white">
                {String(index).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Role & Name Overlay */}
          {hasImage && (
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.25em] text-ieee-light">
                {role}
              </p>
              <h4 className="font-display font-bold leading-tight text-white text-lg">
                {name}
              </h4>
            </div>
          )}
        </div>

        {/* Name footer for placeholder cards */}
        {!hasImage && (
          <div className="p-4 text-center">
            <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-ieee-light">{role}</p>
            <h4 className="font-display text-base font-bold text-white">{name}</h4>
          </div>
        )}

        {/* Social interactions - sliding overlay */}
        {hasImage && (
          <div className="member-social absolute bottom-0 left-0 right-0 flex items-center justify-around bg-black/95 border-t border-white/10 px-4 py-3 backdrop-blur-xl transition-all duration-500 translate-y-full group-hover:translate-y-0 active:translate-y-0">
            <SocialLink href={social.instagram}><InstagramIcon /></SocialLink>
            <SocialLink href={social.linkedin}><LinkedinIcon /></SocialLink>
            <SocialLink href={social.email}><EmailIcon /></SocialLink>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Social Icons ── */
function InstagramIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>; }
function LinkedinIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>; }
function EmailIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition-all duration-300 hover:bg-white/10 hover:text-[var(--ieee-light)]"
    >
      {children}
    </a>
  );
}
