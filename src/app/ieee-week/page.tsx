"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import Embers from "@/components/ieee-week/Embers";
import Sigil from "@/components/ieee-week/Sigil";
import Timeline from "@/components/ieee-week/Timeline";
import Countdown from "@/components/ieee-week/Countdown";
import Footer from "@/components/Footer";
import { IEEE_WEEK, DOOM_IMAGE } from "@/data/ieeeWeek";
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

  return (
    <main>
      {/* Hero */}
      <section className="relative isolate flex min-h-[min(100svh,960px)] flex-col justify-end overflow-hidden px-5 pb-14 pt-32 md:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(13,74,51,0.55),transparent_62%)]" />
        <Sigil className="absolute left-1/2 top-[44%] -z-10 w-[150vmin] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-60" />
        {DOOM_IMAGE && (
          <div className="dd-photo absolute inset-y-0 right-0 -z-10 w-full md:w-[52%]">
            <Image src={DOOM_IMAGE.src} alt={DOOM_IMAGE.alt} fill priority sizes="(max-width: 768px) 100vw, 52vw" className="object-cover object-[50%_18%]" />
            <div className="dd-tone absolute inset-0" />
          </div>
        )}
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
              {IEEE_WEEK.days.join(" - ")} {IEEE_WEEK.monthLabel}
            </p>
            <p className="mt-3 text-lg leading-relaxed sm:text-xl">
              Four days, six events, one campus. Build, compete and present with IEEE SGBIT before the week closes.
            </p>
          </div>
          <Countdown target={IEEE_WEEK.start} />
        </div>
      </section>

      {/* Schedule: the timeline tree */}
      <section className="relative px-5 pb-28 md:px-10" aria-labelledby="schedule">
        <div className="mx-auto max-w-6xl">
          <h2 id="schedule" className="dd-display mb-4 text-5xl text-[var(--dd-iron)] sm:text-7xl">
            Follow the branches
          </h2>
          <p className="mb-16 max-w-[56ch] text-lg">
            One timeline, four days. It forks at each day and the six events hang from its branches. Names, timings and
            venues are announced soon.
          </p>
          <Timeline />
        </div>
      </section>

      {/* Close */}
      <section className="relative isolate overflow-hidden px-5 py-28 md:px-10 md:py-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(13,74,51,0.6),transparent_65%)]" />
        <div className="mx-auto max-w-4xl">
          <h2 className="dd-display relative z-10 text-[clamp(3.5rem,11vw,9rem)] leading-[0.85] text-[var(--dd-iron)]">Be in the room.</h2>
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
