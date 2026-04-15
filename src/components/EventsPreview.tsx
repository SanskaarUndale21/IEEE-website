"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { events, EventData } from "@/data/events";

gsap.registerPlugin(ScrollTrigger);

/* ─── Canvas ────────────────────────────────────────────────── */
const TL_W   = 1820;
const TL_H   = 560;   // tall enough for tall popup cards above/below wave
const CARD_W = 360;   // wider card
const CARD_H = 340;   // height for positioning math (actual may vary)
const DOT_R  = 7;
const HIT_R  = 24;

/* ─── Organic / asymmetric node positions ───────────────────── */
//  8 events — deliberately irregular x-spacing + non-uniform y
const NODES = [
  { x: 90,   y: 225 },   // 0  – left edge, mid height
  { x: 310,  y: 105 },   // 1  – close first peak  (narrow gap)
  { x: 600,  y: 390 },   // 2  – wide first valley (wide gap)
  { x: 810,  y: 130 },   // 3  – medium peak       (moderate gap)
  { x: 1090, y: 375 },   // 4  – deep valley       (wide gap)
  { x: 1310, y: 105 },   // 5  – tallest peak      (moderate gap)
  { x: 1540, y: 360 },   // 6  – valley            (narrow gap)
  { x: 1720, y: 160 },   // 7  – end peak          (narrow gap)
];

/* One extra "button" node the wave leads into */
const BTN_NODE = { x: 1790, y: 270 };

/* ─── Build smooth S-wave (cubic bezier, midpoint control) ──── */
function buildPath(pts: { x: number; y: number }[]) {
  return pts.reduce((d, n, i, arr) => {
    if (i === 0) return `M ${n.x} ${n.y}`;
    const p  = arr[i - 1];
    const mx = (p.x + n.x) / 2;
    return `${d} C ${mx} ${p.y} ${mx} ${n.y} ${n.x} ${n.y}`;
  }, "");
}

const PATH_ALL  = buildPath([...NODES, BTN_NODE]);  // full path incl. button node
const PATH_MAIN = buildPath(NODES);                   // events-only path

/* ─── Popup position (above or below node) ──────────────────── */
function popupPos(node: { x: number; y: number }) {
  const isTop = node.y < 260;
  const left  = Math.max(4, Math.min(node.x - CARD_W / 2, TL_W - CARD_W - 4));
  const top   = isTop
    ? node.y + HIT_R + 18           // below top-peak node
    : node.y - HIT_R - 18 - CARD_H; // above valley node
  return { left, top, isTop };
}

/* ─── Popup Card ────────────────────────────────────────────── */
function EventPopup({
  event,
  node,
  onEnter,
  onLeave,
}: {
  event: EventData;
  node: { x: number; y: number };
  onEnter: () => void;
  onLeave: () => void;
}) {
  const { left, top, isTop } = popupPos(node);

  return (
    <motion.div
      initial={{ opacity: 0, y: isTop ? -18 : 18, scale: 0.86 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isTop ? -18 : 18, scale: 0.86 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute z-50 overflow-hidden rounded-2xl"
      style={{
        left,
        top,
        width: CARD_W,
        background: "rgba(4, 8, 14, 0.97)",
        border: "1px solid rgba(0,163,224,0.2)",
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,163,224,0.06), 0 0 60px rgba(0,163,224,0.1)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* ── hero image ── */}
      <div className="relative w-full overflow-hidden" style={{ height: 200 }}>
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes={`${CARD_W}px`}
          className="object-cover object-center"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,98,155,0.25) 0%, transparent 55%)",
          }}
        />
        {/* event number (watermark) */}
        <span className="absolute bottom-3 left-4 select-none font-display text-5xl font-black leading-none text-white/8">
          {event.number}
        </span>
        {/* link arrow */}
        <Link
          href={`/events/${event.slug}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all duration-300 hover:bg-ieee-light/40"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </Link>
      </div>

      {/* ── gallery strip ── */}
      {event.gallery && event.gallery.length > 0 && (
        <div className="flex gap-2 px-4 pt-3">
          {event.gallery.slice(0, 3).map((src, gi) => (
            <div
              key={gi}
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/8"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="48px"
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>
      )}

      {/* ── text ── */}
      <div className="px-4 pb-4 pt-3">
        <p className="text-[8px] font-bold tracking-[0.25em] text-ieee-light uppercase">
          {event.date}
        </p>
        <h4 className="mt-1 font-display text-base font-bold leading-snug text-white">
          {event.title}
        </h4>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-white/45">
          {event.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ieee-light/15 px-2.5 py-0.5 text-[8px] tracking-[0.1em] text-ieee-light/50 uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Always-visible label ──────────────────────────────────── */
function EventLabel({
  event,
  node,
  active,
}: {
  event: EventData;
  node: { x: number; y: number };
  active: boolean;
}) {
  const isTop  = node.y < 260;
  const W_LBL  = 165;
  const left   = Math.max(0, Math.min(node.x - W_LBL / 2, TL_W - W_LBL));

  return (
    <div
      className="pointer-events-none absolute z-10 select-none text-center transition-all duration-300"
      style={{
        left,
        width: W_LBL,
        ...(isTop
          ? { top: node.y - HIT_R - 60 }
          : { top: node.y + HIT_R + 14 }),
      }}
    >
      <p
        className={`text-[8px] font-bold tracking-[0.22em] uppercase transition-colors duration-300 ${
          active ? "text-ieee-light" : "text-ieee-light/30"
        }`}
      >
        {event.date}
      </p>
      <h3
        className={`mt-0.5 font-display text-[12px] font-bold leading-tight transition-colors duration-300 ${
          active ? "text-white" : "text-white/30"
        }`}
      >
        {event.title}
      </h3>
    </div>
  );
}

/* ─── Pulsing SVG ring ──────────────────────────────────────── */
function PulseRing({ cx, cy }: { cx: number; cy: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={HIT_R}
      fill="none"
      stroke="rgba(0,163,224,0.6)"
      strokeWidth={1.2}
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: "evtPulse 1.8s ease-out infinite",
      }}
    />
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function EventsPreview() {
  const sectionRef  = useRef<HTMLElement>(null);
  const pathRef     = useRef<SVGPathElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const leaveTimer  = useRef<ReturnType<typeof setTimeout>>();
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleEnter = (i: number) => {
    clearTimeout(leaveTimer.current);
    setHoveredIdx(i);
  };
  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setHoveredIdx(null), 160);
  };

  /* Animate path stroke-dashoffset on scroll */
  useEffect(() => {
    if (!pathRef.current || !sectionRef.current) return;
    const path = pathRef.current;
    const len  = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          end:   "bottom 30%",
          scrub: 1.4,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="events"
      ref={sectionRef}
      className="noise relative overflow-hidden py-32 md:py-40"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute left-0 top-1/4 h-[700px] w-[700px] rounded-full bg-ieee-blue/[0.04] blur-[200px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-ieee-light/[0.03] blur-[180px]" />

      {/* ── Header ───────────────────────────────────────────── */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 40 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9 }}
        className="mb-14 px-6 text-center"
      >
        <p className="section-label mb-4">What We&apos;ve Built</p>
        <h2 className="font-display text-3xl font-bold tracking-[0.3em] text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          E V E N T S
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-gray-500 dark:text-white/40">
          Our journey through innovation — hover any marker to preview an event.
        </p>
      </motion.div>

      {/* ── Horizontal wave timeline (no scroll) ─────────────── */}
      <div className="relative overflow-hidden">
        {/* edge fade-outs */}
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-16 bg-gradient-to-r from-[var(--bg)] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-[var(--bg)] to-transparent" />

        {/* Canvas — centered, no overflow-x */}
        <div
          className="relative mx-auto"
          style={{ width: TL_W, height: TL_H }}
        >
          {/* ── SVG: wave + nodes ─────────────────────────────── */}
          <svg
            width={TL_W}
            height={TL_H}
            className="absolute inset-0"
            style={{ overflow: "visible" }}
          >
            <defs>
              <style>{`
                @keyframes evtPulse {
                  0%   { transform: scale(1);   opacity: 0.7; }
                  100% { transform: scale(2.8); opacity: 0;   }
                }
              `}</style>
            </defs>

            {/* faint ghost guide – always visible */}
            <path
              d={PATH_ALL}
              fill="none"
              stroke="rgba(0,163,224,0.055)"
              strokeWidth={2}
            />

            {/* thick glow blur layer */}
            <path
              d={PATH_ALL}
              fill="none"
              stroke="rgba(0,163,224,0.075)"
              strokeWidth={20}
              strokeLinecap="round"
              style={{ filter: "blur(12px)" }}
            />

            {/* scroll-drawn animated stroke */}
            <path
              ref={pathRef}
              d={PATH_ALL}
              fill="none"
              stroke="rgba(0,163,224,0.7)"
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* ── event node circles ── */}
            {NODES.map((node, i) => {
              const active = hoveredIdx === i;
              return (
                <g key={i}>
                  {/* ambient glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={36}
                    fill={`rgba(0,163,224,${active ? 0.08 : 0.025})`}
                    style={{ transition: "fill 0.35s" }}
                  />
                  {/* ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={HIT_R}
                    fill="none"
                    stroke={
                      active ? "rgba(0,163,224,1)" : "rgba(0,163,224,0.28)"
                    }
                    strokeWidth={1.5}
                    style={{ transition: "stroke 0.35s" }}
                  />
                  {/* dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={DOT_R}
                    fill={active ? "#00A3E0" : "rgba(0,163,224,0.55)"}
                    style={{ transition: "fill 0.35s" }}
                  />
                  {/* bright core on hover */}
                  {active && (
                    <circle cx={node.x} cy={node.y} r={3} fill="white" opacity={0.95} />
                  )}
                  {/* pulse ring */}
                  {active && <PulseRing cx={node.x} cy={node.y} />}

                  {/* number badge */}
                  <text
                    x={node.x}
                    y={
                      node.y < 260
                        ? node.y - HIT_R - 14
                        : node.y + HIT_R + 22
                    }
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="800"
                    letterSpacing="3"
                    fill={
                      active
                        ? "rgba(0,163,224,1)"
                        : "rgba(0,163,224,0.22)"
                    }
                    style={{ transition: "fill 0.35s", fontFamily: "inherit" }}
                  >
                    {events[i].number}
                  </text>
                </g>
              );
            })}

            {/* ── End-of-wave button node ── */}
            <circle
              cx={BTN_NODE.x}
              cy={BTN_NODE.y}
              r={40}
              fill="rgba(0,98,155,0.08)"
            />
            <circle
              cx={BTN_NODE.x}
              cy={BTN_NODE.y}
              r={18}
              fill="none"
              stroke="rgba(0,163,224,0.5)"
              strokeWidth={1.5}
              strokeDasharray="4 2.5"
            />
            <circle cx={BTN_NODE.x} cy={BTN_NODE.y} r={7} fill="#00629B" />
            <circle cx={BTN_NODE.x} cy={BTN_NODE.y} r={3} fill="rgba(0,163,224,0.9)" />
          </svg>

          {/* ── Always-visible event labels ─────────────────── */}
          {events.map((ev, i) => (
            <EventLabel
              key={ev.slug}
              event={ev}
              node={NODES[i]}
              active={hoveredIdx === i}
            />
          ))}

          {/* ── Invisible hit areas for hover ───────────────── */}
          {events.map((_, i) => (
            <div
              key={i}
              className="absolute z-40 cursor-pointer rounded-full"
              style={{
                left:   NODES[i].x - HIT_R - 8,
                top:    NODES[i].y - HIT_R - 8,
                width:  (HIT_R + 8) * 2,
                height: (HIT_R + 8) * 2,
              }}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
            />
          ))}

          {/* ── Upcoming Events button pinned to BTN_NODE ────── */}
          <div
            className="absolute z-30"
            style={{
              left:      BTN_NODE.x,
              top:       BTN_NODE.y + 32,
              transform: "translateX(-50%)",
            }}
          >
            <Link
              href="/events/upcoming"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-ieee-light/50 bg-ieee-blue/20 px-5 py-2 text-[10px] font-bold tracking-[0.18em] text-ieee-light uppercase backdrop-blur-md transition-all duration-400 hover:border-ieee-light hover:bg-ieee-blue/40 hover:shadow-[0_0_28px_8px_rgba(0,163,224,0.3)]"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "220%" }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
              />
              <span className="relative h-1.5 w-1.5 animate-pulse rounded-full bg-ieee-light" />
              <span className="relative">Upcoming Events</span>
            </Link>
          </div>

          {/* ── Hover popup card ─────────────────────────────── */}
          <AnimatePresence mode="wait">
            {hoveredIdx !== null && (
              <EventPopup
                key={events[hoveredIdx].slug}
                event={events[hoveredIdx]}
                node={NODES[hoveredIdx]}
                onEnter={() => handleEnter(hoveredIdx)}
                onLeave={handleLeave}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom CTA row ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="mt-20 flex flex-col items-center gap-5"
      >
        {/* divider text */}
        <div className="flex items-center gap-4">
          <div className="h-px w-14 bg-gradient-to-r from-transparent to-ieee-light/20" />
          <p className="text-[8px] tracking-[0.45em] text-white/18 uppercase">
            explore more
          </p>
          <div className="h-px w-14 bg-gradient-to-l from-transparent to-ieee-light/20" />
        </div>

        {/* two CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">

          {/* View all past events */}
          <Link
            href="/events"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-ieee-light/25 bg-ieee-light/5 px-8 py-3.5 text-[11px] font-bold tracking-[0.25em] text-ieee-light uppercase transition-all duration-500 hover:border-ieee-light/55 hover:bg-ieee-light/10 hover:shadow-[0_0_36px_8px_rgba(0,163,224,0.12)]"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/7 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "250%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="relative">View All Past Events</span>
          </Link>

          {/* Upcoming events (solid blue) */}
          <Link
            href="/events/upcoming"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-ieee-blue to-ieee-light px-8 py-3.5 text-[11px] font-bold tracking-[0.25em] text-white uppercase transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_40px_12px_rgba(0,163,224,0.28)]"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/14 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "250%" }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear", repeatDelay: 0.4 }}
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="relative">Upcoming Events</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
