// IEEE Week content. Edit here: dates, event names and details.
// Event names below are PLACEHOLDERS until the final names are shared.

export const IEEE_WEEK = {
  // First day of IEEE Week, in IST. Update the month/year if this changes.
  start: "2026-10-14T09:00:00+05:30",
  monthLabel: "October 2026",
  days: [14, 15, 16],
};

export type WeekEvent = { title: string; line: string };
export type WeekDay = { day: number; name: string; blurb: string; events: WeekEvent[] };

export const WEEK_DAYS: WeekDay[] = [
  {
    day: 14,
    name: "Day one",
    blurb: "The week opens.",
    events: [
      { title: "Convergence", line: "Opening ceremony and keynote that sets the week in motion." },
      { title: "Forge", line: "A hands-on workshop where you build something before lunch." },
    ],
  },
  {
    day: 15,
    name: "Day two",
    blurb: "The middle of the war.",
    events: [
      { title: "Rift", line: "A timed hackathon: one problem, one team, no spare hours." },
      { title: "Sanctum", line: "Project and paper showcase judged by faculty and seniors." },
    ],
  },
  {
    day: 16,
    name: "Day three",
    blurb: "The reckoning.",
    events: [
      { title: "Doomsday Quiz", line: "A technical quiz for teams that survived the first two days." },
      { title: "Final Hour", line: "Results, awards and the closing of IEEE Week." },
    ],
  },
];

export const ARCHIVE = [
  { src: "/images/ignition2025.jpeg", label: "Ignition 2025" },
  { src: "/images/nkcon2024.jfif", label: "NKCon 2024" },
  { src: "/images/wie24.jpg", label: "WiE 2024" },
  { src: "/images/hack-n-hunt.jpg", label: "Hack-n-Hunt" },
];
