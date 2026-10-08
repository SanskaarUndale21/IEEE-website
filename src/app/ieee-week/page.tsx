"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import Timeline from "@/components/ieee-week/Timeline";
import Countdown from "@/components/ieee-week/Countdown";
import Footer from "@/components/Footer";
import { IEEE_WEEK, ARCHIVE, PHOTO_CREDITS } from "@/data/ieeeWeek";
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
    <>
      {/* Fixed backdrop: ultraviolet filaments of the Cygnus Loop, behind everything */}
      <div className="fixed inset-0 z-0 bg-[#02070a]" aria-hidden>
        <Image src="/images/ieee-week/cygnus.webp" alt="" fill sizes="100vw" className="dd-filaments object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_20%,#02070a_85%)]" />
      </div>

      <main className="relative z-10">
        {/* Hero: a Helix Nebula eye behind a 14th century war mask */}
        <section className="relative isolate flex min-h-[min(100svh,980px)] flex-col justify-end overflow-hidden">
          <div className="absolute inset-0 -z-30" aria-hidden>
            <Image src="/images/ieee-week/helix.webp" alt="" fill priority sizes="100vw" className="dd-helix object-cover" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_46%,transparent_22%,#02070a_80%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#02070a] to-transparent" />
          </div>

          <Image
            src="/images/ieee-week/bolts.webp"
            alt=""
            width={2200}
            height={558}
            sizes="100vw"
            aria-hidden
            className="dd-bolts pointer-events-none absolute inset-x-0 top-0 -z-20 h-[62%] w-full object-cover"
          />

          <Image
            src="/images/ieee-week/mask-bronze-cut.webp"
            alt="A gilded iron war mask from the 14th to 16th century"
            width={791}
            height={1080}
            priority
            sizes="(max-width: 768px) 70vw, 40vw"
            className="dd-mask pointer-events-none absolute left-1/2 top-[9%] -z-10 h-[44%] w-auto max-w-none -translate-x-1/2 md:top-[5.5%] md:h-[56%]"
          />

          <div className="relative mx-auto w-full max-w-[1500px] px-5 md:px-10">
            <h1 className="dd-title dd-display text-center" aria-label="IEEE Week">
              <span aria-hidden>IEEE</span> <span aria-hidden>WEEK</span>
            </h1>

            <div className="mt-6 grid gap-8 pb-12 md:mt-8 md:grid-cols-[1fr_auto] md:items-end md:pb-14">
              <div>
                <p className="dd-display text-5xl text-[var(--dd-iron)] sm:text-6xl">
                  14<span className="text-[var(--dd-glow)]">/</span>15<span className="text-[var(--dd-glow)]">/</span>16{" "}
                  <span className="text-[var(--dd-glow)]">{IEEE_WEEK.monthLabel}</span>
                </p>
                <p className="mt-3 max-w-[40ch] text-lg leading-relaxed">
                  Three days and six events at IEEE SGBIT. Build, compete and present before the week closes.
                </p>
              </div>
              <Countdown target={IEEE_WEEK.start} />
            </div>
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
                Franklin Institute in Philadelphia. That society merged with the Institute of Radio Engineers in 1963 to form
                IEEE, and since 2009 the first Tuesday of October is celebrated as IEEE Day.
              </p>
              <p className="mt-4 text-lg leading-[1.75]">
                At SGBIT we stretch one day into a week. Same idea as 1884: put people who build things in one room and see what
                they make.
              </p>
            </div>
          </div>
        </section>

        {/* Schedule: the timeline tree, each event hangs off a branch with its relic */}
        <section className="relative px-5 pb-28 md:px-10" aria-labelledby="schedule">
          <div className="mx-auto max-w-6xl">
            <h2 id="schedule" className="dd-display mb-4 text-5xl text-[var(--dd-iron)] sm:text-7xl">
              Follow the branches
            </h2>
            <p className="mb-16 max-w-[56ch] text-lg">
              One timeline, three days. It forks at each day and the six events hang from its branches. Names, timings and
              venues are announced soon.
            </p>
            <Timeline />
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
                  <Image
                    src={a.src}
                    alt={a.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="dd-duo object-cover transition-all duration-500 group-hover:scale-105 group-hover:[filter:none]"
                  />
                  <div className="dd-tint absolute inset-0 transition-opacity duration-500 group-hover:opacity-0" />
                  <figcaption className="dd-display absolute bottom-3 left-4 text-2xl text-white">{a.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Close, under the storm */}
        <section className="relative isolate overflow-hidden px-5 py-28 md:px-10 md:py-44">
          <Image
            src="/images/ieee-week/bolts.webp"
            alt=""
            width={2200}
            height={558}
            sizes="100vw"
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-full w-full scale-x-[-1] object-cover opacity-45 mix-blend-screen"
          />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(18,147,94,0.5),transparent_65%)]" />
          <div className="mx-auto max-w-4xl">
            <h2 className="dd-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.85] text-[var(--dd-iron)]">Be in the room.</h2>
            <p className="mt-6 max-w-[54ch] text-lg leading-relaxed">
              Registration opens soon. Follow IEEE SGBIT for the announcement, or join the branch now so you hear first.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/join"
                className="dd-btn dd-display inline-block bg-[var(--dd-glow)] px-8 py-4 text-2xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)]"
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

        <section className="px-5 pb-12 md:px-10" aria-labelledby="credits">
          <div className="mx-auto max-w-6xl border-t border-[var(--dd-iron)]/15 pt-6 text-sm leading-relaxed text-[var(--dd-iron)]/70">
            <h2 id="credits" className="dd-display mb-2 text-xl text-[var(--dd-iron)]">
              Image credits
            </h2>
            <ul className="grid gap-x-8 gap-y-1 md:grid-cols-2">
              {PHOTO_CREDITS.map((c) => (
                <li key={c.label}>
                  {c.label}: {c.by},{" "}
                  <a href={c.page} target="_blank" rel="noopener noreferrer" className="dd-link underline underline-offset-2 hover:text-[var(--dd-glow)]">
                    {c.license}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
