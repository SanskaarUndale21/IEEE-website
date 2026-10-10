"use client";

import Image from "next/image";
import Link from "next/link";
import { FEE_RULE, REGISTRABLE } from "@/data/ieeeWeek";
import { useDarkTheme } from "./useDarkTheme";
import Footer from "@/components/Footer";

const rows = (items: [string, React.ReactNode][]) =>
  items
    .filter(([, v]) => v)
    .map(([k, v]) => (
      <div key={k} className="grid gap-1 border-t border-[var(--dd-iron)]/15 py-3 sm:grid-cols-[9rem_1fr] sm:gap-6">
        <dt className="text-sm text-[var(--dd-iron)]/60">{k}</dt>
        <dd className="text-base leading-relaxed">{v}</dd>
      </div>
    ));

const REGISTER_BTN =
  "dd-btn dd-display inline-flex min-h-12 items-center bg-[var(--dd-glow)] px-6 text-xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)]";

/** One page per event: banner, details, rules and the register button. */
export default function EventPage({ slug }: { slug: string }) {
  useDarkTheme();
  const i = REGISTRABLE.findIndex((e) => e.slug === slug);
  const e = REGISTRABLE[i];
  if (!e) return null;
  const others = REGISTRABLE.filter((o) => o.slug !== slug);
  const banner = `/images/ieee-week/rulebook/${slug}-banner.webp`;
  const rules = `/images/ieee-week/rulebook/${slug}-rules.webp`;

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-24 md:px-10 md:pt-32">
        <Link href="/ieee-week#schedule" className="dd-link text-sm text-[var(--dd-iron)]/75 underline underline-offset-2 hover:text-[var(--dd-glow)]">
          Back to IEEE Week
        </Link>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-14">
          <a href={banner} target="_blank" rel="noopener noreferrer" className="block self-start" aria-label={`Open the ${e.title} banner full size`}>
            <Image
              src={banner}
              alt={`${e.title} event banner`}
              width={1241}
              height={1755}
              priority
              sizes="(max-width: 1024px) 100vw, 416px"
              className="h-auto w-full max-w-md border border-[var(--dd-iron)]/20"
            />
          </a>

          <div>
            <p className="text-sm text-[var(--dd-gold)]">
              {e.category}
              {e.categoryNote ? `, ${e.categoryNote}` : ""}
            </p>
            <h1 className="dd-display mt-1 text-5xl leading-[1.05] text-[var(--dd-glow)] sm:text-7xl">{e.title}</h1>
            <p className="mt-2 text-xl italic">{e.tagline}</p>

            <a href={`/ieee-week/register?e=${e.slug}`} className={`${REGISTER_BTN} mt-6`}>
              Register for {e.title.split(":")[0]}
            </a>

            <dl className="mt-8">
              {rows([
                ["When", `${e.day}-10-26, ${e.time} sharp`],
                ["Venue", e.venue],
                ["Team size", e.roles ? `${e.teamLabel}. Roles: ${e.roles}` : e.teamLabel],
                [
                  "Registration fee",
                  e.fee ? (
                    <>
                      <span className="block">
                        ₹{e.fee.ieee} if at least one team member is an IEEE member{e.fee.note ? ` (${e.fee.note})` : ""}
                      </span>
                      <span className="block">
                        ₹{e.fee.nonIeee} only if every member is non-IEEE{e.fee.note ? ` (${e.fee.note})` : ""}
                      </span>
                      <span className="mt-1 block text-sm text-[var(--dd-iron)]/70">Even if all members are IEEE, the price stays ₹{e.fee.ieee}.</span>
                    </>
                  ) : null,
                ],
                [
                  "Coordinators",
                  <ul key="c" className="space-y-1">
                    {e.coordinators.map((c) => (
                      <li key={c.name}>
                        {c.name}
                        {c.phone && (
                          <>
                            {" "}
                            <a href={`tel:+91${c.phone}`} className="dd-link inline-block min-h-6 underline underline-offset-2 hover:text-[var(--dd-glow)]">
                              {c.phone}
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>,
                ],
                ["Overview", e.overview],
                ["Format", e.format],
                ["Rounds", e.rounds],
                ["Bring", e.bring],
              ])}
            </dl>
            <p className="mt-6 max-w-[62ch] border-l-2 border-[var(--dd-glow)] pl-4 text-base">{FEE_RULE}</p>
          </div>
        </div>

        <section className="mt-16" aria-labelledby="rules-title">
          <h2 id="rules-title" className="dd-display text-4xl text-[var(--dd-iron)] sm:text-6xl">
            Rules and regulations
          </h2>
          <p className="mt-2 text-base text-[var(--dd-iron)]/70">Tap the page to open it full size and zoom in.</p>
          <a href={rules} target="_blank" rel="noopener noreferrer" className="mt-6 block max-w-3xl" aria-label={`Open the ${e.title} rules full size`}>
            <Image
              src={rules}
              alt={`${e.title} rules and regulations`}
              width={1241}
              height={1755}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto w-full border border-[var(--dd-iron)]/20"
            />
          </a>
          <a href={`/ieee-week/register?e=${e.slug}`} className={`${REGISTER_BTN} mt-8`}>
            Register for {e.title.split(":")[0]}
          </a>
        </section>

        <section className="mt-20" aria-labelledby="more-title">
          <h2 id="more-title" className="dd-display text-3xl text-[var(--dd-gold)] sm:text-4xl">
            Other events
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/ieee-week/${o.slug}`} className="dd-slab block p-4 transition-colors hover:border-[var(--dd-glow)]">
                  <span className="text-sm text-[var(--dd-gold)]">{o.day}-10-26</span>
                  <span className="dd-display mt-1 block text-2xl leading-tight text-[var(--dd-glow)]">{o.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <Footer />
    </main>
  );
}
