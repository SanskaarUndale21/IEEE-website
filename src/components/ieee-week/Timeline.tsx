"use client";

import { useRef } from "react";
import Image from "next/image";
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

const H = 1700;
const TRUNK: Pt[] = [[500, 0], [490, 260], [512, 520], [498, 800], [508, 1060], [496, 1330], [500, H]];
const FORKS: Pt[] = [TRUNK[1], TRUNK[3], TRUNK[5]]; // days 14, 15, 16

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
  { pts: [[496, 1330], [610, 1426], [702, 1504], [776, 1590]], event: 5, width: 5 },
  { pts: [[702, 1504], [770, 1470], [850, 1486]], dead: true, width: 2.5 },
];

const EVENTS = WEEK_DAYS.flatMap((d) => d.events.map((e) => ({ ...e, day: d.day })));

/** Each branch is a cable of fibres, like the strands in the key art. */
const FIBRES = [
  { dx: 0, dy: 0, w: 1, o: 1, c: "url(#tree-grad)" },
  { dx: -3, dy: 1, w: 0.3, o: 0.75, c: "#46f0a0" },
  { dx: 3.5, dy: -1, w: 0.26, o: 0.65, c: "#12935e" },
  { dx: -6.5, dy: 2, w: 0.22, o: 0.55, c: "#3b6bff" },
  { dx: 6.5, dy: -2, w: 0.22, o: 0.5, c: "#d65bff" },
  { dx: 1.5, dy: 4, w: 0.2, o: 0.5, c: "#46f0a0" },
];

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
    <div ref={wrap} className="relative mx-auto mb-[26%] w-full max-w-[1000px]" style={{ aspectRatio: `1000 / ${H}` }}>
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
            <stop offset="0" stopColor="#46f0a0" />
            <stop offset="1" stopColor="#8a6bff" />
          </linearGradient>
        </defs>

        {/* dim skeleton, always visible */}
        <path d={smooth(TRUNK)} fill="none" stroke="#3be39a" strokeOpacity="0.16" strokeWidth="9" strokeLinecap="round" />
        {BRANCHES.map((b, i) => (
          <path key={`s${i}`} d={smooth(b.pts)} fill="none" stroke="#3be39a" strokeOpacity="0.12" strokeWidth={b.width} strokeLinecap="round" />
        ))}

        {/* growing trunk */}
        {FIBRES.map((f, i) => (
          <motion.path
            key={`t${i}`}
            d={smooth(TRUNK)}
            fill="none"
            stroke={f.c}
            strokeOpacity={f.o}
            strokeWidth={9 * f.w}
            strokeLinecap="round"
            filter={i === 0 ? "url(#tree-glow)" : undefined}
            transform={`translate(${f.dx} ${f.dy})`}
            style={{ pathLength: p }}
          />
        ))}

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
  const fibres = branch.dead ? FIBRES.slice(0, 3) : FIBRES;
  return (
    <g opacity={branch.dead ? 0.55 : 1}>
      {fibres.map((f, i) => (
        <motion.path
          key={i}
          d={smooth(branch.pts)}
          fill="none"
          stroke={f.c}
          strokeOpacity={f.o}
          strokeWidth={branch.width * f.w}
          strokeLinecap="round"
          filter={i === 0 ? "url(#tree-glow)" : undefined}
          transform={`translate(${f.dx * 0.6} ${f.dy * 0.6})`}
          style={{ pathLength: grow }}
        />
      ))}
    </g>
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

type Ev = { title: string; line: string; day: number; plate: string; plateAlt: string };

function Plate({ ev }: { ev: Ev }) {
  return (
    <div className="dd-plate relative aspect-[4/3] w-full overflow-hidden">
      <Image src={ev.plate} alt={ev.plateAlt} fill sizes="(max-width: 1024px) 80vw, 300px" className="object-cover" />
      <div className="dd-plate-tone absolute inset-0" />
    </div>
  );
}

function EventAtTip({ x, y, ev, p }: { x: number; y: number; ev: Ev; p: MotionValue<number> }) {
  const at = y / H;
  const show = useTransform(p, (v) => clamp01((v - at + 0.02) / 0.05));
  const lift = useTransform(show, (v) => (1 - v) * 18);
  return (
    <motion.article
      className="dd-slab absolute w-[min(300px,31%)]"
      style={{ x: "-50%", left: `${x / 10}%`, top: `calc(${(y / H) * 100}% + 18px)`, opacity: show, y: lift }}
    >
      <span className="absolute -top-[22px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[var(--dd-spark)] shadow-[0_0_16px_4px_rgba(214,91,255,0.85)]" aria-hidden />
      <Plate ev={ev} />
      <div className="p-5">
        <h3 className="dd-display text-3xl text-[var(--dd-glow)]">{ev.title}</h3>
        <p className="mt-1 text-base leading-relaxed">{ev.line}</p>
      </div>
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
            lit ? "bg-[var(--dd-glow)] text-[#06281b]" : "bg-[var(--dd-iron)]/40 text-[var(--dd-void)]"
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
        <article key={e.title} className="dd-slab relative">
          <Plate ev={{ ...e, day: data.day }} />
          <div className="p-5">
            <h3 className="dd-display text-3xl text-[var(--dd-glow)]">{e.title}</h3>
            <p className="mt-1 text-base leading-relaxed">{e.line}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
