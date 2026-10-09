"use client";

import { IEEE_WEEK, WEEK_DAYS } from "@/data/ieeeWeek";
import { selectEventLink } from "./registerLink";

const rows = (items: [string, React.ReactNode][]) =>
  items
    .filter(([, v]) => v)
    .map(([k, v]) => (
      <div key={k} className="grid gap-1 border-t border-[var(--dd-iron)]/15 py-3 sm:grid-cols-[9rem_1fr] sm:gap-6">
        <dt className="text-sm text-[var(--dd-iron)]/60">{k}</dt>
        <dd className="text-base leading-relaxed">{v}</dd>
      </div>
    ));

export default function EventDetails() {
  const days = WEEK_DAYS.map((d) => ({ ...d, events: d.events.filter((e) => e.teamCount > 0) })).filter((d) => d.events.length);

  return (
    <section id="details" className="relative scroll-mt-20 px-5 pb-24 md:px-10 md:pb-32" aria-labelledby="details-title">
      <div className="mx-auto max-w-6xl">
        <h2 id="details-title" className="dd-display mb-4 text-5xl text-[var(--dd-iron)] sm:text-7xl">
          Event details
        </h2>
        <p className="mb-14 max-w-[56ch] text-lg">{IEEE_WEEK.timing}</p>

        <div className="space-y-20">
          {days.map((d) => (
            <div key={d.day}>
              <h3 className="dd-display mb-6 text-3xl text-[var(--dd-gold)] sm:text-4xl">
                {d.name}, {d.day}-10-26
              </h3>
              <div className="grid gap-6 lg:grid-cols-2">
                {d.events.map((e) => (
                  <article key={e.slug} id={`event-${e.slug}`} className="dd-slab scroll-mt-24 p-6 sm:p-8">
                    <p className="text-sm text-[var(--dd-gold)]">
                      {e.category}
                      {e.categoryNote ? `, ${e.categoryNote}` : ""}
                    </p>
                    <h4 className="dd-display mt-1 text-4xl leading-[1.1] text-[var(--dd-glow)]">{e.title}</h4>
                    <p className="mt-1 text-lg italic">{e.tagline}</p>

                    <dl className="mt-6">
                      {rows([
                        ["When", `${d.day}-10-26, ${e.time} sharp`],
                        ["Venue", e.venue],
                        ["Team size", e.roles ? `${e.teamLabel}. Roles: ${e.roles}` : e.teamLabel],
                        [
                          "Registration fee",
                          e.fee ? (
                            <>
                              IEEE members: ₹{e.fee.ieee}
                              <br />
                              Non-IEEE: ₹{e.fee.nonIeee}
                              {e.fee.note ? ` ${e.fee.note}` : ""}
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
                        ["Rounds", e.rounds],
                        ["Bring", e.bring],
                      ])}
                    </dl>

                    <a
                      href="#register"
                      {...selectEventLink(e.slug)}
                      className="dd-btn dd-display mt-6 inline-flex min-h-12 items-center bg-[var(--dd-glow)] px-6 text-xl text-[var(--dd-void)] transition-colors hover:bg-[var(--dd-iron)]"
                    >
                      Register for {e.title.split(":")[0]}
                    </a>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
