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

// Photos are CC licensed cosplay photographs from Wikimedia Commons. Attribution is required, so keep this list shown on the page.
export const PHOTO_CREDITS = [
  { file: "/images/ieee-week/doom-hero.jpg", label: "Doom (hero)", author: "Super Festivals from Ft. Lauderdale, USA", license: "CC BY 2.0", page: "https://commons.wikimedia.org/wiki/File:Cosplay_of_Doctor_Doom_at_GalaxyCon_Richmond_2020_(49667247426).jpg" },
  { file: "/images/ieee-week/doom-street.jpg", label: "Doom (street)", author: "LostplanetKD73", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:New_York_Comic_Con_2022_-_Doctor_Doom_cosplay.jpg" },
  { file: "/images/ieee-week/avengers-assemble.jpg", label: "Avengers group", author: "Pat Loika", license: "CC BY 2.0", page: "https://commons.wikimedia.org/wiki/File:Avengers_cosplays_Dragon_Con_2012.jpg" },
  { file: "/images/ieee-week/avengers-endgame.jpg", label: "Avengers group", author: "LostplanetKD73", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:NYCC_2019_Cosplay_of_the_Avengers_01.jpg" },
  { file: "/images/ieee-week/ironman.jpg", label: "Iron Man", author: "Gage Skidmore", license: "CC BY-SA 2.0", page: "https://commons.wikimedia.org/wiki/File:Iron_Man_Cosplay_at_2013_Phoenix_Comicon.jpg" },
];
