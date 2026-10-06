"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import Embers from "@/components/ieee-week/Embers";
import Sigil from "@/components/ieee-week/Sigil";
import Countdown from "@/components/ieee-week/Countdown";
import Footer from "@/components/Footer";
import { IEEE_WEEK, WEEK_DAYS, ARCHIVE } from "@/data/ieeeWeek";
import { SOCIAL } from "@/constants";

export default function IeeeWeekPage() {
  const { theme, setTheme } = useTheme();

  // This page is dark only. Restore the visitor's own theme on the way out.
  useEffect(() => {
    const previous = theme;
    setTheme("dark");
    return () => {
      if (previous && previous !== "dark") setTheme(previous);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackPointer = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-14 pt-32 md:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(13,74,51,0.55),transparent_62%)]" />
        <Sigil className="absolute left-1/2 top-[44%] -z-10 w-[150vmin] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="absolute inset-0 -z-10">
          <Embers />
        </div>

        <h1 className="dd-title dd-display self-start" aria-label="IEEE Week">
          <span className="dd-half dd-half-a dd-metal" aria-hidden>
            IEEE<br />WEEK
          </span>
          <span className="dd-half dd-half-b dd-metal" aria-hidden>
            IEEE<br />WEEK
          </span>
          <span className="dd-crack" aria-hidden>
            <i />
          </span>
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-xl">
            <p className="dd-display text-3xl text-[var(--dd-gold)] sm:text-4xl">
              {IEEE_WEEK.days.join(" · ")} {IEEE_WEEK.monthLabel}
            </p>
            <p className="mt-3 text-lg leading-relaxed sm:text-xl">
              Three days, six events, one campus. Build, compete and present with IEEE SGBIT before the week closes.
            </p>
          </div>
          <Countdown target={IEEE_WEEK.start} />
        </div>
      </section>

      {/* Why the week exists */}
      <section className="relative px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[auto_1fr] md:gap-20">
          <p className="dd-display dd-outline text-[clamp(6rem,20vw,15rem)] leading-[0.8]">1884</p>
          <div className="max-w-[62ch] self-center">
            <h2 className="dd-display text-4xl text-[var(--dd-iron)] sm:text-6xl">Engineers have always gathered like this.</h2>
            <p className="mt-6 text-lg leading-[1.75]">
              On 7 October 1884, the American Institute of Electrical Engineers held its first technical meeting at the
              Franklin Institute in Philadelphia. That society merged with the Institute of Radio Engineers in 1963 to form IEEE, and since 2009 the first Tuesday of
              October is celebrated as IEEE Day.
            </p>
            <p className="mt-4 text-lg leading-[1.75]">
              At SGBIT we stretch one day into a week. Same idea as 1884: put people who build things in one room and see what
              they make.
            </p>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="relative px-5 pb-28 md:px-10 md:pb-40" aria-labelledby="schedule">
        <div className="mx-auto max-w-6xl">
          <h2 id="schedule" className="dd-display mb-4 text-5xl text-[var(--dd-iron)] sm:text-7xl">
            The schedule
          </h2>
          <p className="mb-12 max-w-[56ch] text-lg">
            Six events across three days. Event names, timings and venues are announced soon.
          </p>

          <div className="grid gap-6 lg:grid-cols-3">
            {WEEK_DAYS.map((d, i) => (
              <article
                key={d.day}
                onPointerMove={trackPointer}
                className="dd-slab flex flex-col p-7 sm:p-9"
                style={{ marginTop: `${i * 28}px` }}
              >
                <p className="dd-display dd-outline text-[9rem] leading-[0.75]">{d.day}</p>
                <p className="mt-6 text-sm text-[var(--dd-gold)]">
                  {d.name}, {IEEE_WEEK.monthLabel}
                </p>
                <p className="mt-1 font-serif text-xl italic">{d.blurb}</p>

                <ul className="mt-8 space-y-7 border-t border-[var(--dd-iron)]/15 pt-7">
                  {d.events.map((e) => (
                    <li key={e.title}>
                      <h3 className="dd-display text-3xl text-[var(--dd-glow)]">{e.title}</h3>
                      <p className="mt-1 max-w-[40ch] leading-relaxed">{e.line}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Archive */}
      <section className="relative px-5 pb-28 md:px-10 md:pb-40" aria-labelledby="archive">
        <div className="mx-auto max-w-6xl">
          <h2 id="archive" className="dd-display mb-10 text-4xl text-[var(--dd-iron)] sm:text-6xl">
            What we have already built
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ARCHIVE.map((a, i) => (
              <figure key={a.src} className="group relative aspect-[3/4] overflow-hidden" style={{ marginTop: i % 2 ? "2.5rem" : 0 }}>
                <Image src={a.src} alt={a.label} fill sizes="(max-width: 768px) 50vw, 25vw" className="dd-duo object-cover transition-all duration-500 group-hover:scale-105 group-hover:[filter:none]" />
                <div className="dd-tint absolute inset-0 transition-opacity duration-500 group-hover:opacity-0" />
                <figcaption className="dd-display absolute bottom-3 left-4 text-2xl text-white">{a.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="relative isolate overflow-hidden px-5 py-28 md:px-10 md:py-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(13,74,51,0.6),transparent_65%)]" />
        <div className="mx-auto max-w-4xl">
          <h2 className="dd-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.85] text-[var(--dd-iron)]">Be in the room.</h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed">
            Registration opens soon. Follow IEEE SGBIT for the announcement, or join the branch now so you hear first.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/join"
              className="dd-btn dd-display inline-block bg-[var(--dd-glow)] px-8 py-4 text-2xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-gold)]"
            >
              Join IEEE SGBIT
            </Link>
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="dd-btn dd-display inline-block border border-[var(--dd-iron)]/40 px-8 py-4 text-2xl text-[var(--dd-iron)] transition-colors hover:border-[var(--dd-glow)] hover:text-[var(--dd-glow)]"
            >
              Follow {SOCIAL.instagramHandle}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
