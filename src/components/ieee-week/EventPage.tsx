"use client";

import Image from "next/image";
import Link from "next/link";
import { FEE_RULE, REGISTRABLE } from "@/data/ieeeWeek";
import { RULEBOOK } from "@/data/ieeeWeekRulebook";
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
  "dd-btn dd-display flex min-h-14 w-full items-center justify-center bg-[var(--dd-glow)] px-6 text-xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)] sm:inline-flex sm:w-fit sm:justify-start";

/** One page per event: banner, details, rules and the register button. */
export default function EventPage({ slug }: { slug: string }) {
  useDarkTheme();
  const i = REGISTRABLE.findIndex((e) => e.slug === slug);
  const e = REGISTRABLE[i];
  if (!e) return null;
  const others = REGISTRABLE.filter((o) => o.slug !== slug);
  const banner = `/images/ieee-week/rulebook/${slug}-banner.webp`;
  const book = RULEBOOK[slug];
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
          {book && (
            <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
              {book.blocks.map((b) => (
                <div key={b.title} className={`dd-slab p-5 sm:p-7 ${b.kind === "numbered" ? "lg:col-span-2" : ""}`}>
                  {b.title !== "Rules and regulations" && <h3 className="dd-display text-3xl leading-none text-[var(--dd-gold)]">{b.title}</h3>}
                  {b.kind === "numbered" && (
                    <ol className={`${b.title === "Rules and regulations" ? "" : "mt-5"} grid gap-x-10 gap-y-3 ${b.items.length > 8 ? "lg:grid-cols-2" : ""}`}>
                      {b.items.map((x, n) => (
                        <li key={x} className="grid grid-cols-[2.25rem_1fr] items-baseline gap-2 text-base leading-relaxed">
                          <span className="dd-display text-2xl leading-none text-[var(--dd-glow)]">{n + 1}</span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {b.kind === "bullets" && (
                    <ul className="mt-4 space-y-2.5">
                      {b.items.map((x) => (
                        <li key={x} className="grid grid-cols-[1rem_1fr] items-baseline gap-2 text-base leading-normal sm:leading-relaxed">
                          <span className="mt-[0.45em] h-2 w-2 self-start bg-[var(--dd-glow)]" aria-hidden />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {b.kind === "text" && <p className="mt-4 max-w-[62ch] text-base leading-relaxed">{b.text}</p>}
                </div>
              ))}
              {book.note && (
                <p className="max-w-[70ch] border-l-2 border-[var(--dd-glow)] pl-4 text-base leading-relaxed lg:col-span-2">
                  <span className="font-semibold text-[var(--dd-gold)]">Note. </span>
                  {book.note}
                </p>
              )}
            </div>
          )}
          <a href={rules} target="_blank" rel="noopener noreferrer" className="dd-link mt-6 block text-sm text-[var(--dd-iron)]/70 underline underline-offset-2 hover:text-[var(--dd-glow)]">
            View the original rulebook page
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
