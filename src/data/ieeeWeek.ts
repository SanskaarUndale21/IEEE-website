// IEEE Week content. Edit here: dates, event names and details.
// Event names below are PLACEHOLDERS until the final names are shared.

export const IEEE_WEEK = {
  // First day of IEEE Week, in IST. Update the month/year if this changes.
  start: "2026-10-14T09:00:00+05:30",
  monthLabel: "October 2026",
  days: [14, 15, 16],
};

export type WeekEvent = { title: string; line: string; plate: string; plateAlt: string };
export type WeekDay = { day: number; name: string; blurb: string; events: WeekEvent[] };

export const WEEK_DAYS: WeekDay[] = [
  {
    day: 14,
    name: "Day one",
    blurb: "The week opens.",
    events: [
      {
        title: "Convergence",
        line: "Opening ceremony and keynote that sets the week in motion.",
        plate: "/images/ieee-week/plate-helm.webp",
        plateAlt: "A 16th century armet helmet with a mask visor",
      },
      {
        title: "Forge",
        line: "A hands-on workshop where you build something before lunch.",
        plate: "/images/ieee-week/plate-gauntlet.webp",
        plateAlt: "A 16th century locking gauntlet",
      },
    ],
  },
  {
    day: 15,
    name: "Day two",
    blurb: "The middle of the war.",
    events: [
      {
        title: "Rift",
        line: "A timed hackathon: one problem, one team, no spare hours.",
        plate: "/images/ieee-week/plate-iron.webp",
        plateAlt: "A 14th century iron war mask",
      },
      {
        title: "Sanctum",
        line: "Project and paper showcase judged by faculty and seniors.",
        plate: "/images/ieee-week/plate-visor.webp",
        plateAlt: "A 16th century visor shaped like a human face",
      },
    ],
  },
  {
    day: 16,
    name: "Day three",
    blurb: "The reckoning.",
    events: [
      {
        title: "Doomsday Quiz",
        line: "A technical quiz for teams that survived the first two days.",
        plate: "/images/ieee-week/plate-gold.webp",
        plateAlt: "A medieval gilded war mask",
      },
      {
        title: "Final Hour",
        line: "Results, awards and the closing of IEEE Week.",
        plate: "/images/ieee-week/plate-black.webp",
        plateAlt: "A 17th century lacquered menpo face armour",
      },
    ],
  },
];

export const ARCHIVE = [
  { src: "/images/ignition2025.jpeg", label: "Ignition 2025" },
  { src: "/images/nkcon2024.jfif", label: "NKCon 2024" },
  { src: "/images/wie24.jpg", label: "WiE 2024" },
  { src: "/images/hack-n-hunt.jpg", label: "Hack-n-Hunt" },
];

// Image sources. Attribution is shown on the page. Armour: The Metropolitan Museum of Art
// Open Access (CC0). Space imagery: NASA (public domain). Lightning: CC BY 4.0.
export const PHOTO_CREDITS = [
  { label: "War Mask, 14th to 16th century (hero)", by: "The Metropolitan Museum of Art, Open Access", license: "CC0", page: "https://www.metmuseum.org/art/collection/search/39433" },
  { label: "Armet with Mask Visor, ca. 1520 to 1525", by: "The Metropolitan Museum of Art, Open Access", license: "CC0", page: "https://www.metmuseum.org/art/collection/search/26504" },
  { label: "Locking Gauntlet, ca. 1540", by: "The Metropolitan Museum of Art, Open Access", license: "CC0", page: "https://www.metmuseum.org/art/collection/search/24645" },
  { label: "Mask (Somen), 14th century", by: "The Metropolitan Museum of Art, Open Access", license: "CC0", page: "https://www.metmuseum.org/art/collection/search/22512" },
  { label: "Mask Visor in Form of a Human Face, ca. 1515", by: "The Metropolitan Museum of Art, Open Access", license: "CC0", page: "https://www.metmuseum.org/art/collection/search/35825" },
  { label: "War Mask, 12th to 14th century", by: "The Metropolitan Museum of Art, Open Access", license: "CC0", page: "https://www.metmuseum.org/art/collection/search/35152" },
  { label: "Mask (Menpo), 17th century", by: "The Metropolitan Museum of Art, Open Access", license: "CC0", page: "https://www.metmuseum.org/art/collection/search/22520" },
  { label: "Helix Nebula", by: "NASA/JPL-Caltech/Univ. of Ariz.", license: "Public domain", page: "https://commons.wikimedia.org/wiki/File:Comets_Kick_up_Dust_in_Helix_Nebula_(PIA09178).jpg" },
  { label: "Cygnus Loop Nebula, ultraviolet", by: "NASA / GALEX", license: "Public domain", page: "https://commons.wikimedia.org/wiki/File:Ultraviolet_image_of_the_Cygnus_Loop_Nebula_crop.jpg" },
  { label: "A Vintage Lightning Storm at Kitt Peak", by: "Gary Ladd/KPNO/NOIRLab/NSF/AURA", license: "CC BY 4.0", page: "https://commons.wikimedia.org/wiki/File:A_Vintage_Lightning_Storm_at_Kitt_Peak.jpg" },
];
