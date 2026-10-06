"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useInView } from "framer-motion";
import Loki from "./Loki";
import { EMBLEMS } from "./Emblems";
import { IEEE_WEEK, WEEK_DAYS, type WeekDay } from "@/data/ieeeWeek";

/**
 * Loki holds the thread. It runs down the page, lights up as you scroll,
 * and forks at each day into the two events of that day.
 */
const HEX = "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)";

export default function Timeline() {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 65%", "end 75%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <div className="relative">
      <Loki className="relative z-10 mx-auto -mb-3 w-[min(440px,82vw)] drop-shadow-[0_0_30px_rgba(59,227,154,0.25)]" />

      <div ref={wrap} className="relative">
        {/* the thread */}
        <div className="pointer-events-none absolute bottom-0 left-7 top-0 w-[3px] -translate-x-1/2 md:left-1/2" aria-hidden>
          <div className="absolute inset-0 bg-[var(--dd-glow)]/30" />
          <motion.div
            className="absolute inset-0 origin-top bg-gradient-to-b from-[var(--dd-glow)] via-[var(--dd-glow)] to-[var(--dd-gold)] shadow-[0_0_12px_2px_rgba(59,227,154,0.7)]"
            style={{ scaleY: fill }}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--dd-void)] to-transparent" />
        </div>

        <div className="space-y-24 pb-32 md:space-y-32">
          {WEEK_DAYS.map((d, i) => (
            <DayFork key={d.day} data={d} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayFork({ data, index }: { data: WeekDay; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const lit = useInView(ref, { margin: "-42% 0px -42% 0px" });
  const [a, b] = data.events;
  const [IconA, IconB] = [EMBLEMS[index * 2], EMBLEMS[index * 2 + 1]];

  return (
    <div ref={ref}>
      <p className={`relative z-10 mb-8 ml-16 w-fit bg-[var(--dd-void)] px-3 py-1 text-lg text-[var(--dd-gold)] md:mx-auto md:ml-auto ${index === 0 ? "mt-16" : ""}`}>
        {data.name}, {IEEE_WEEK.monthLabel}. {data.blurb}
      </p>
      <div className="relative grid grid-cols-[56px_1fr] gap-y-6 md:grid-cols-[1fr_140px_1fr] md:gap-y-10">
      {/* branch lines and the day node */}
      <div className="relative row-span-2 row-start-1 md:col-start-2" aria-hidden>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 hidden h-full w-full overflow-visible md:block">
          <Branch d="M50 50 C 20 50, 30 25, 0 25" lit={lit} />
          <Branch d="M50 50 C 80 50, 70 75, 100 75" lit={lit} />
        </svg>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible md:hidden">
          <Branch d="M50 50 C 100 50, 60 25, 100 25" lit={lit} />
          <Branch d="M50 50 C 100 50, 60 75, 100 75" lit={lit} />
        </svg>
        <div
          className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 md:h-24 md:w-24 ${
            lit ? "bg-[var(--dd-glow)] drop-shadow-[0_0_14px_rgba(59,227,154,0.9)]" : "bg-[var(--dd-iron)]/40"
          }`}
          style={{ clipPath: HEX }}
        >
          <div
            className={`dd-display absolute inset-[3px] flex items-center justify-center text-2xl transition-colors duration-500 md:text-5xl ${
              lit ? "bg-[#06281b] text-[var(--dd-glow)]" : "bg-[var(--dd-void)] text-[var(--dd-iron)]"
            }`}
            style={{ clipPath: HEX }}
          >
            {data.day}
          </div>
        </div>
      </div>

      <EventCard className="col-start-2 row-start-1 md:col-start-1 md:text-right" icon={IconA} {...a} flip />
      <EventCard className="col-start-2 row-start-2 md:col-start-3" icon={IconB} {...b} />

      </div>
    </div>
  );
}

function Branch({ d, lit }: { d: string; lit: boolean }) {
  return (
    <>
      <path d={d} fill="none" stroke="#3be39a" strokeOpacity="0.45" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path
        d={d}
        fill="none"
        stroke="#3be39a"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
        style={{
          filter: "drop-shadow(0 0 5px #3be39a)",
          opacity: lit ? 1 : 0,
          transition: "opacity 0.6s",
        }}
      />
    </>
  );
}

function EventCard({
  title,
  line,
  icon: Icon,
  className = "",
  flip = false,
}: {
  title: string;
  line: string;
  icon: (p: { className?: string }) => React.ReactElement;
  className?: string;
  flip?: boolean;
}) {
  return (
    <article className={`dd-slab p-6 md:p-8 ${className}`}>
      <div className={`flex items-start gap-5 ${flip ? "md:flex-row-reverse" : ""}`}>
        <Icon className="h-14 w-14 shrink-0 text-[var(--dd-gold)]" />
        <div>
          <h3 className="dd-display text-4xl text-[var(--dd-glow)] md:text-5xl">{title}</h3>
          <p className={`mt-2 max-w-[40ch] text-lg leading-relaxed ${flip ? "md:ml-auto" : ""}`}>{line}</p>
        </div>
      </div>
    </article>
  );
}
