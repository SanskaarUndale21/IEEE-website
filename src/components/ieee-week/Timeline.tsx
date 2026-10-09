"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useInView, type MotionValue } from "framer-motion";
import { IEEE_WEEK, WEEK_DAYS, type WeekDay, type WeekEvent } from "@/data/ieeeWeek";

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

const H = 2450;
// The trunk ends at the Valedictory card, centred below the last fork.
const TRUNK_END = 2020;
const FINALE_TOP = 2060;
const TRUNK: Pt[] = [[500, 0], [490, 260], [512, 520], [498, 800], [508, 1060], [496, 1330], [505, 1560], [502, 1790], [500, TRUNK_END]];
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
  { pts: [[496, 1330], [610, 1380], [710, 1440], [800, 1500]], event: 5, width: 5 },
  // day 17
  { pts: [[502, 1790], [420, 1830], [330, 1880], [250, 1930]], dead: true, width: 3 },
  { pts: [[502, 1790], [590, 1840], [690, 1880], [770, 1930]], dead: true, width: 3 },
];

type Ev = WeekEvent & { day: number };
const EVENTS: Ev[] = WEEK_DAYS.flatMap((d) => d.events.map((e) => ({ ...e, day: d.day })));

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
    <div ref={wrap} className="relative mx-auto mb-[10%] w-full max-w-[1000px]" style={{ aspectRatio: `1000 / ${H}` }}>
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

      {/* the end of the timeline */}
      <Finale ev={EVENTS[EVENTS.length - 1]} p={p} />

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

function EventCardBody({ ev }: { ev: Ev }) {
  const isEvent = ev.teamCount > 0;
  return (
    <>
      <p className="text-sm text-[var(--dd-gold)]">
        {ev.category}
        {ev.categoryNote ? `, ${ev.categoryNote}` : ""}
      </p>
      <h3 className="dd-display mt-1 text-3xl leading-[1.1] text-[var(--dd-glow)]">{ev.title}</h3>
      <p className="mt-1 text-base leading-relaxed">{ev.tagline}</p>
      {isEvent && (
        <>
          <p className="mt-3 text-sm text-[var(--dd-iron)]/80">
            {ev.venue}, {ev.time}
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href={`#event-${ev.slug}`}
              className="dd-btn dd-display inline-flex min-h-11 items-center border border-[var(--dd-iron)]/40 px-4 text-lg text-[var(--dd-iron)] transition-colors hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)]"
            >
              Details
            </a>
            <a
              href={`/ieee-week/register?e=${ev.slug}`}
              className="dd-btn dd-display inline-flex min-h-11 items-center bg-[var(--dd-glow)] px-4 text-lg text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)]"
            >
              Register
            </a>
          </div>
        </>
      )}
    </>
  );
}

function EventAtTip({ x, y, ev, p }: { x: number; y: number; ev: Ev; p: MotionValue<number> }) {
  const at = y / H;
  const show = useTransform(p, (v) => clamp01((v - at + 0.02) / 0.05));
  const lift = useTransform(show, (v) => (1 - v) * 18);
  return (
    <motion.article
      className="dd-slab absolute w-[min(300px,31%)] p-5"
      style={{ x: "-50%", left: `${x / 10}%`, top: `calc(${(y / H) * 100}% + 18px)`, opacity: show, y: lift }}
    >
      <span className="absolute -top-[22px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[var(--dd-gold)] shadow-[0_0_14px_3px_rgba(217,172,63,0.8)]" aria-hidden />
      <EventCardBody ev={ev} />
    </motion.article>
  );
}

/** The end of the tree: the Valedictory card, centred, with a glow behind it. */
function Finale({ ev, p }: { ev: Ev; p: MotionValue<number> }) {
  const show = useTransform(p, (v) => clamp01((v - (TRUNK_END - 160) / H) / 0.05));
  const rise = useTransform(show, (v) => (1 - v) * 30);
  return (
    <>
      <div
        className="pointer-events-none absolute -z-10 bg-[radial-gradient(closest-side,rgba(59,227,154,0.22),transparent)]"
        style={{ left: "50%", top: `${((FINALE_TOP - 140) / H) * 100}%`, width: "90%", height: "16%", transform: "translateX(-50%)" }}
        aria-hidden
      />
      <motion.article
        className="dd-slab absolute w-[min(620px,64%)] border-[var(--dd-glow)]/60 p-8 text-center shadow-[0_0_60px_rgba(59,227,154,0.18)]"
        style={{ left: "50%", x: "-50%", top: `${(FINALE_TOP / H) * 100}%`, opacity: show, y: rise }}
      >
        <p className="text-base text-[var(--dd-gold)]">Day four, {ev.day}-10-26</p>
        <h3 className="dd-display mt-2 text-6xl leading-none text-[var(--dd-glow)]">{ev.title}</h3>
        <p className="mx-auto mt-3 max-w-[34ch] text-xl leading-relaxed">{ev.tagline}</p>
      </motion.article>
    </>
  );
}

/* ───────────── mobile: the same tree, measured from the page ───────────── */

type MGeo = {
  w: number;
  h: number;
  forks: { y: number; day: number }[];
  cards: { y: number; left: number }[];
  twigs: { y: number }[];
  finTop: number | null;
};

const TX = (y: number) => 26 + 7 * Math.sin(y / 150);

function MobileList() {
  const wrap = useRef<HTMLDivElement>(null);
  const caps = useRef<(HTMLElement | null)[]>([]);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const fin = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<MGeo | null>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 80%", "end 65%"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  const days = WEEK_DAYS.filter((d) => d.events.some((e) => e.teamCount > 0));

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const root = el.getBoundingClientRect();
      if (root.width === 0 || root.height === 0) return; // hidden on desktop
      const rel = (n: HTMLElement) => {
        const r = n.getBoundingClientRect();
        return { top: r.top - root.top, mid: r.top - root.top + r.height / 2, bottom: r.top - root.top + r.height, left: r.left - root.left };
      };
      const forks = days.map((d, i) => ({ y: caps.current[i] ? rel(caps.current[i] as HTMLElement).mid : 0, day: d.day }));
      const cs = cards.current.filter(Boolean).map((n) => rel(n as HTMLElement));
      const twigs: { y: number }[] = [];
      for (let i = 0; i < cs.length - 1; i++) {
        const gap = cs[i + 1].top - cs[i].bottom;
        if (gap > 30) twigs.push({ y: cs[i].bottom + gap / 2 });
      }
      const f = fin.current ? rel(fin.current).top : null;
      if (f) forks.push({ y: f + 20, day: 17 });
      setGeo({ w: root.width, h: root.height, forks, cards: cs.map((c) => ({ y: c.mid, left: c.left })), twigs, finTop: f });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let ci = -1;
  return (
    <div ref={wrap} className="relative">
      {geo && <MobileBranches geo={geo} p={p} />}
      <div className="relative z-10 pl-[4.5rem]">
        {days.map((d, i) => (
          <div key={d.day} className={i === 0 ? "" : "mt-14"}>
            <p
              ref={(n) => {
                caps.current[i] = n;
              }}
              className="mb-5 text-lg text-[var(--dd-gold)]"
            >
              {d.name}, {IEEE_WEEK.monthLabel}. {d.blurb}
            </p>
            <div className="space-y-8">
              {d.events.map((e) => {
                ci += 1;
                const idx = ci;
                return (
                  <article
                    key={e.slug}
                    ref={(n) => {
                      cards.current[idx] = n;
                    }}
                    className="dd-slab relative p-5"
                  >
                    <EventCardBody ev={{ ...e, day: d.day }} />
                  </article>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={fin} className="-ml-[4.5rem] mt-20">
          <MobileFinale ev={EVENTS[EVENTS.length - 1]} />
        </div>
      </div>
    </div>
  );
}

function MobileBranches({ geo, p }: { geo: MGeo; p: MotionValue<number> }) {
  const end = geo.finTop ?? geo.h;
  const pts: Pt[] = [];
  for (let y = 0; y <= end - 40; y += 40) pts.push([TX(y), y]);
  if (pts.length < 2) return null;
  const lastY = pts[pts.length - 1][1];
  const cx = geo.w / 2;
  const trunk = smooth(pts) + ` C${TX(lastY)} ${lastY + 70} ${cx} ${end - 40} ${cx} ${end + 70}`;
  return (
    <>
      <svg className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden>
        <defs>
          <linearGradient id="mt-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geo.h}>
            <stop offset="0" stopColor="#3be39a" />
            <stop offset="1" stopColor="#d9ac3f" />
          </linearGradient>
          <filter id="mt-glow" x="-50%" y="-5%" width="200%" height="110%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={trunk} fill="none" stroke="#3be39a" strokeOpacity="0.16" strokeWidth="6" strokeLinecap="round" />
        <motion.path d={trunk} fill="none" stroke="url(#mt-grad)" strokeWidth="6" strokeLinecap="round" filter="url(#mt-glow)" style={{ pathLength: p }} />
        {geo.cards.map((c, i) => {
          const y0 = Math.max(10, c.y - 78);
          const x0 = TX(y0);
          const d = `M${x0} ${y0} C${x0 + 26} ${y0 + 6} ${c.left - 34} ${c.y - 24} ${c.left - 3} ${c.y}`;
          return <MBranch key={i} d={d} y={y0} h={geo.h} p={p} dot={[c.left - 3, c.y]} />;
        })}
        {geo.twigs.map((t, i) => {
          const x0 = TX(t.y);
          const len = 34 + (i % 3) * 14;
          const d = `M${x0} ${t.y} C${x0 + 14} ${t.y - 6} ${x0 + len - 12} ${t.y - 14} ${x0 + len} ${t.y - 22}`;
          return <MBranch key={`t${i}`} d={d} y={t.y} h={geo.h} p={p} dead />;
        })}
      </svg>
      {geo.forks.map((f) => (
        <MFork key={f.day} y={f.y} h={geo.h} day={f.day} p={p} />
      ))}
    </>
  );
}

function MBranch({ d, y, h, p, dead, dot }: { d: string; y: number; h: number; p: MotionValue<number>; dead?: boolean; dot?: [number, number] }) {
  const grow = useTransform(p, (v) => clamp01((v - (y / h - 0.012)) / (dead ? 0.06 : 0.08)));
  const dotOn = useTransform(grow, (g) => (g > 0.98 ? 1 : 0));
  return (
    <>
      <path d={d} fill="none" stroke="#3be39a" strokeOpacity="0.14" strokeWidth={dead ? 2 : 3} strokeLinecap="round" />
      <motion.path
        d={d}
        fill="none"
        stroke={dead ? "#3be39a" : "url(#mt-grad)"}
        strokeOpacity={dead ? 0.5 : 1}
        strokeWidth={dead ? 2 : 3.5}
        strokeLinecap="round"
        filter="url(#mt-glow)"
        style={{ pathLength: grow }}
      />
      {dot && <motion.circle cx={dot[0]} cy={dot[1]} r="5" fill="#d9ac3f" style={{ opacity: dotOn, filter: "drop-shadow(0 0 6px #d9ac3f)" }} />}
    </>
  );
}

function MFork({ y, h, day, p }: { y: number; h: number; day: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => (v >= y / h - 0.01 ? 1 : 0.4));
  return (
    <motion.div
      className="dd-display absolute z-10 flex h-10 w-10 items-center justify-center bg-[var(--dd-glow)] text-xl text-[#06281b]"
      style={{
        left: TX(y) - 20,
        top: y - 20,
        clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
        opacity,
      }}
    >
      {day}
    </motion.div>
  );
}

function MobileFinale({ ev }: { ev: Ev }) {
  return (
    <div className="relative px-5 pt-16">
      <article className="dd-slab relative border-[var(--dd-glow)]/60 p-6 text-center shadow-[0_0_50px_rgba(59,227,154,0.18)]">
        <p className="text-sm text-[var(--dd-gold)]">Day four, {ev.day}-10-26</p>
        <h3 className="dd-display mt-1 text-5xl leading-none text-[var(--dd-glow)]">{ev.title}</h3>
        <p className="mt-2 text-lg leading-relaxed">{ev.tagline}</p>
      </article>
    </div>
  );
}
