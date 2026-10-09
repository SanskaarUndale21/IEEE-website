"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useInView, type MotionValue } from "framer-motion";
import { IEEE_WEEK, WEEK_DAYS, type WeekDay } from "@/data/ieeeWeek";

/* ───────────────────────────────────────────────────────────────
   A tree of time. The trunk grows down the page as you scroll,
   forks at each day, and the events hang at the tips of branches.
   Coordinates live in a 1000 x 1700 box.
─────────────────────────────────────────────────────────────── */

type Pt = [number, number];

/** Smooth path through points (Catmull-Rom converted to cubic beziers). */
function smooth(pts: Pt[]): string {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const H = 2150;
const TRUNK: Pt[] = [[500, 0], [490, 260], [512, 520], [498, 800], [508, 1060], [496, 1330], [505, 1560], [502, 1740], [500, H]];
const FORKS: Pt[] = [TRUNK[1], TRUNK[3], TRUNK[5], TRUNK[7]]; // days 14, 15, 16, 17

type Branch = { pts: Pt[]; event?: number; dead?: boolean; width: number };
const BRANCHES: Branch[] = [
  // day 14
  { pts: [[490, 260], [405, 296], [310, 284], [225, 360]], event: 0, width: 5 },
  { pts: [[490, 260], [585, 322], [690, 384], [800, 474]], event: 1, width: 5 },
  { pts: [[690, 384], [735, 330], [820, 304]], dead: true, width: 2.5 },
  { pts: [[512, 520], [430, 556], [350, 640]], dead: true, width: 3 },
  // day 15
  { pts: [[498, 800], [600, 832], [720, 806], [830, 884]], event: 2, width: 5 },
  { pts: [[498, 800], [400, 850], [300, 930], [195, 1012]], event: 3, width: 5 },
  { pts: [[300, 930], [282, 1010], [310, 1090]], dead: true, width: 2.5 },
  { pts: [[508, 1060], [590, 1100], [660, 1180]], dead: true, width: 3 },
  // day 16
  { pts: [[496, 1330], [402, 1304], [292, 1342], [244, 1440]], event: 4, width: 5 },
  { pts: [[496, 1330], [610, 1380], [700, 1470]], dead: true, width: 3 },
  { pts: [[505, 1560], [430, 1600], [360, 1690]], dead: true, width: 3 },
  // day 17
  { pts: [[502, 1740], [604, 1770], [712, 1830], [790, 1936]], event: 5, width: 5 },
  { pts: [[712, 1830], [770, 1780], [860, 1770]], dead: true, width: 2.5 },
];

const EVENTS = WEEK_DAYS.flatMap((d) => d.events.map((e) => ({ ...e, day: d.day })));

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export default function Timeline() {
  return (
    <>
      <div className="hidden lg:block">
        <Tree />
      </div>
      <div className="lg:hidden">
        <MobileList />
      </div>
    </>
  );
}

/* ───────────── desktop tree ───────────── */

function Tree() {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 75%", "end 70%"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });

  return (
    <div ref={wrap} className="relative mx-auto w-full max-w-[1000px]" style={{ aspectRatio: `1000 / ${H}` }}>
      <svg viewBox={`0 0 1000 ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <filter id="tree-glow" x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="tree-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3be39a" />
            <stop offset="1" stopColor="#d9ac3f" />
          </linearGradient>
        </defs>

        {/* dim skeleton, always visible */}
        <path d={smooth(TRUNK)} fill="none" stroke="#3be39a" strokeOpacity="0.16" strokeWidth="9" strokeLinecap="round" />
        {BRANCHES.map((b, i) => (
          <path key={`s${i}`} d={smooth(b.pts)} fill="none" stroke="#3be39a" strokeOpacity="0.12" strokeWidth={b.width} strokeLinecap="round" />
        ))}

        {/* growing trunk */}
        <motion.path d={smooth(TRUNK)} fill="none" stroke="url(#tree-grad)" strokeWidth="9" strokeLinecap="round" filter="url(#tree-glow)" style={{ pathLength: p }} />

        {/* growing branches */}
        {BRANCHES.map((b, i) => (
          <GrowBranch key={i} branch={b} p={p} />
        ))}
      </svg>

      {/* day forks on the trunk */}
      {FORKS.map(([x, y], i) => (
        <ForkNode key={i} x={x} y={y} day={WEEK_DAYS[i].day} p={p} />
      ))}

      {/* events at the tips */}
      {BRANCHES.filter((b) => b.event !== undefined).map((b) => {
        const [x, y] = b.pts[b.pts.length - 1];
        return <EventAtTip key={b.event} x={x} y={y} ev={EVENTS[b.event as number]} p={p} />;
      })}
    </div>
  );
}

function GrowBranch({ branch, p }: { branch: Branch; p: MotionValue<number> }) {
  const [, y0] = branch.pts[0];
  const start = y0 / H - 0.01;
  const len = branch.dead ? 0.07 : 0.1;
  const grow = useTransform(p, (v) => clamp01((v - start) / len));
  return (
    <motion.path
      d={smooth(branch.pts)}
      fill="none"
      stroke={branch.dead ? "#3be39a" : "url(#tree-grad)"}
      strokeOpacity={branch.dead ? 0.45 : 1}
      strokeWidth={branch.width}
      strokeLinecap="round"
      filter="url(#tree-glow)"
      style={{ pathLength: grow }}
    />
  );
}

function ForkNode({ x, y, day, p }: { x: number; y: number; day: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => (v >= y / H - 0.005 ? 1 : 0.35));
  return (
    <motion.div
      className="dd-display absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[var(--dd-glow)] text-4xl text-[#06281b]"
      style={{
        left: `${x / 10}%`,
        top: `${(y / H) * 100}%`,
        clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
        opacity,
      }}
    >
      {day}
    </motion.div>
  );
}

function EventAtTip({ x, y, ev, p }: { x: number; y: number; ev: { title: string; line: string; day: number }; p: MotionValue<number> }) {
  const at = y / H;
  const show = useTransform(p, (v) => clamp01((v - at + 0.02) / 0.05));
  const lift = useTransform(show, (v) => (1 - v) * 18);
  return (
    <motion.article
      className="dd-slab absolute w-[min(300px,31%)] p-5"
      style={{ x: "-50%", left: `${x / 10}%`, top: `calc(${(y / H) * 100}% + 18px)`, opacity: show, y: lift }}
    >
      <span className="absolute -top-[22px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[var(--dd-gold)] shadow-[0_0_14px_3px_rgba(217,172,63,0.8)]" aria-hidden />
      <h3 className="dd-display text-3xl text-[var(--dd-glow)]">{ev.title}</h3>
      <p className="mt-1 text-base leading-relaxed">{ev.line}</p>
    </motion.article>
  );
}

/* ───────────── mobile: a single branch ───────────── */

function MobileList() {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 70%", "end 75%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <div ref={wrap} className="relative">
      <div className="pointer-events-none absolute bottom-0 left-7 top-0 w-[3px] -translate-x-1/2" aria-hidden>
        <div className="absolute inset-0 bg-[var(--dd-glow)]/30" />
        <motion.div className="absolute inset-0 origin-top bg-gradient-to-b from-[var(--dd-glow)] to-[var(--dd-gold)] shadow-[0_0_12px_2px_rgba(59,227,154,0.7)]" style={{ scaleY: fill }} />
      </div>
      <div className="space-y-16 pb-10">
        {WEEK_DAYS.map((d) => (
          <MobileDay key={d.day} data={d} />
        ))}
      </div>
    </div>
  );
}

function MobileDay({ data }: { data: WeekDay }) {
  const ref = useRef<HTMLDivElement>(null);
  const lit = useInView(ref, { margin: "-40% 0px -40% 0px" });
  return (
    <div ref={ref} className="grid grid-cols-[56px_1fr] gap-y-5">
      <div className="relative row-span-3">
        <div
          className={`dd-display absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 items-center justify-center text-2xl transition-colors duration-500 ${
            lit ? "bg-[var(--dd-glow)] text-[#06281b]" : "bg-[var(--dd-iron)]/40 text-[var(--dd-iron)]"
          }`}
          style={{ clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" }}
        >
          {data.day}
        </div>
      </div>
      <p className="text-lg text-[var(--dd-gold)]">
        {data.name}, {IEEE_WEEK.monthLabel}. {data.blurb}
      </p>
      {data.events.map((e) => (
        <article key={e.title} className="dd-slab relative p-5">
          <h3 className="dd-display text-3xl text-[var(--dd-glow)]">{e.title}</h3>
          <p className="mt-1 text-base leading-relaxed">{e.line}</p>
        </article>
      ))}
    </div>
  );
}
