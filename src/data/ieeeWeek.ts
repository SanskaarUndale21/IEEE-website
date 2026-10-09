// IEEE Week content. Edit here: dates, event names, venues, fees and details.

export const IEEE_WEEK = {
  // First moment of IEEE Week (the start of the 14th), in IST.
  start: "2026-10-14T00:00:00+05:30",
  // The week is over from this moment (the 18th, IST).
  end: "2026-10-18T00:00:00+05:30",
  monthLabel: "October 2026",
  days: [14, 15, 16, 17],
  timing: "All events start at 2:30 PM sharp at their venue.",
};

/** Team pricing rule, shown wherever a fee is shown. */
export const FEE_RULE =
  "The IEEE price applies if even one member of your team is an IEEE member, and also if every member is. The non-IEEE price applies only when every member of the team is non-IEEE.";

export type Coordinator = { name: string; phone?: string };

export type WeekEvent = {
  /** Page anchor, and the database event row is `ieee-week-<slug>`. */
  slug: string;
  title: string;
  tagline: string;
  category: "Technical" | "Non-Technical" | "Ceremony";
  /** Short note after the category, e.g. "design". */
  categoryNote?: string;
  venue: string;
  time: string;
  /** Participants per team. 0 means no registration. */
  teamCount: number;
  teamLabel: string;
  roles?: string;
  fee?: { ieee: number; nonIeee: number; note?: string };
  coordinators: Coordinator[];
  overview: string;
  bring?: string;
  rounds?: string;
  /** WhatsApp group invite link for this event. Paste it here and it shows on the registration page. */
  whatsapp?: string;
  /** QR image for the same group. */
  whatsappQr?: string;
};

export type WeekDay = { day: number; name: string; blurb: string; events: WeekEvent[] };

const TIME = "2:30 PM";

export const WEEK_DAYS: WeekDay[] = [
  {
    day: 14,
    name: "Day one",
    blurb: "The week opens.",
    events: [
      {
        slug: "retrace",
        whatsapp: "https://chat.whatsapp.com/JlLYS36UmvvE35Q25jTUAU?s=qt&p=a&mlu=4&ilr=4",
        whatsappQr: "/images/ieee-week/wa/retrace.png",
        title: "RETR?CE",
        tagline: "A search for the forgotten",
        category: "Technical",
        venue: "AIDS Seminar Hall",
        time: TIME,
        teamCount: 2,
        teamLabel: "2 members",
        fee: { ieee: 79, nonIeee: 99, note: "per team" },
        coordinators: [{ name: "Durvank Patil", phone: "8147939767" }, { name: "Jerrym David" }],
        overview:
          "A mini Alternate Reality Game / live-action roleplay. Participants forget who they are and solve a missing-person case by solving puzzles and analysing and travelling through files until they reach the final message and learn what happened.",
        bring: "Laptop / smartphone, earphones or headphones, notepad and pen",
      },
      {
        slug: "conquer-the-canvas",
        whatsapp: "https://chat.whatsapp.com/FrPZrqqFIPN5ajdHT5qvHE?s=qt&p=a&mlu=4&ilr=4",
        whatsappQr: "/images/ieee-week/wa/conquer-the-canvas.png",
        title: "Conquer the Canvas",
        tagline: "Add. Adapt. Create.",
        category: "Non-Technical",
        categoryNote: "design",
        venue: "CSE Lab",
        time: TIME,
        teamCount: 2,
        teamLabel: "2 members",
        fee: { ieee: 79, nonIeee: 99, note: "per team" },
        coordinators: [{ name: "Vaishnavi Dabu", phone: "7276964351" }, { name: "Prithvi Hiremath", phone: "7483653556" }],
        overview:
          "A live design challenge in Canva. Teams receive a base poster and new elements and instructions are revealed progressively; each must be added creatively to the same poster without starting over, within the time limit. PCs are provided, or teams can bring laptops.",
        bring: "Laptop",
      },
    ],
  },
  {
    day: 15,
    name: "Day two",
    blurb: "The middle of the war.",
    events: [
      {
        slug: "prompt-injection",
        whatsapp: "https://chat.whatsapp.com/DLBPhxfiqcELHdUpqQYEtO?s=qt&p=a&mlu=4&ilr=4",
        whatsappQr: "/images/ieee-week/wa/prompt-injection.png",
        title: "Prompt Injection",
        tagline: "One attacker. One defender.",
        category: "Technical",
        venue: "ECE Seminar Hall",
        time: TIME,
        teamCount: 2,
        teamLabel: "2 participants",
        roles: "1 Attacker + 1 Defender",
        fee: { ieee: 79, nonIeee: 99, note: "per team" },
        coordinators: [{ name: "Sanskaar Undaale", phone: "6363066361" }, { name: "Aanchal Gur", phone: "8792914777" }],
        overview:
          "Prompt Injection War is a two-person AI security competition where one participant attacks an opponent's AI using prompt-injection techniques, while the other defends their AI from revealing protected information. Each match consists of three 5-minute rounds, with teams scored on attack success, defense, and AI utility.",
      },
      {
        slug: "pixel-perfect",
        whatsapp: "https://chat.whatsapp.com/CaR4Am1gXD4BqD9v9VR8rp?s=qt&p=a&mlu=4&ilr=4",
        whatsappQr: "/images/ieee-week/wa/pixel-perfect.png",
        title: "Pixel Perfect",
        tagline: "See it. Find it. Recreate it. Perfect it.",
        category: "Non-Technical",
        venue: "CSBS Dep-E302",
        time: TIME,
        teamCount: 2,
        teamLabel: "2 members",
        fee: { ieee: 79, nonIeee: 99, note: "per team" },
        coordinators: [{ name: "Aditi L", phone: "6361636547" }, { name: "Pooja P" }],
        overview:
          "A campus-based visual challenge. Teams get four blurred or modified photographs of the college campus, identify each location, reach the exact spot and recreate the photograph from approximately the same viewpoint. Accuracy of location, viewpoint and composition is scored by an AI image-comparison algorithm.",
      },
    ],
  },
  {
    day: 16,
    name: "Day three",
    blurb: "The reckoning.",
    events: [
      {
        slug: "code-relay",
        // TODO: Code Relay has no group yet. This is a stand-in (the Prompt Injection group). Replace link and QR.
        whatsapp: "https://chat.whatsapp.com/DLBPhxfiqcELHdUpqQYEtO?s=qt&p=a&mlu=4&ilr=4",
        whatsappQr: "/images/ieee-week/wa/prompt-injection.png",
        title: "Code Relay",
        tagline: "Blind coding relay in VS Code",
        category: "Technical",
        venue: "CSE Dep-Sankalp Lab",
        time: TIME,
        teamCount: 3,
        teamLabel: "3 members",
        fee: { ieee: 79, nonIeee: 99, note: "per team" },
        coordinators: [{ name: "Mobeen Jamadar", phone: "7892202865" }, { name: "Dhanashree Ragade", phone: "9019301902" }],
        overview:
          "Code Relay is a team coding challenge with 3 members and 2 rounds, each having 2 problems. Teams get brief discussion time before each problem, then members code one at a time for equal time with no communication or code comments.",
        rounds:
          "Round 1: 60 minutes, with a mini-task and hint for each problem. Round 2: 75 minutes, with higher difficulty and a hint for only one problem. No internet, AI tools, or mobile phones are allowed. Phones must be switched off and submitted to coordinators.",
      },
      {
        slug: "uncharted",
        whatsapp: "https://chat.whatsapp.com/GjbMuQ4hvyREb8oCdL5qU8",
        whatsappQr: "/images/ieee-week/wa/uncharted.png",
        title: "Uncharted: Unveil the Hidden",
        tagline: "A two-round story-driven mystery",
        category: "Non-Technical",
        venue: "AIDS Seminar Hall",
        time: TIME,
        teamCount: 3,
        teamLabel: "3 members",
        fee: { ieee: 79, nonIeee: 99, note: "per team" },
        coordinators: [{ name: "Rigved Desai", phone: "8867010554" }, { name: "Nisarga Rajput", phone: "6363570109" }],
        overview:
          "Combines riddles, cryptograms, deduction, observation, teamwork and exploration. Round 1: teams investigate a fictional researcher's unfinished work and uncover evidence of a Pirate Captain's mystery. Round 2: qualified teams retrace the Captain's voyage across campus \"islands\", with possible mid-round eliminations, before reaching the final treasure.",
      },
    ],
  },
  {
    day: 17,
    name: "Day four",
    blurb: "The last word.",
    events: [
      {
        slug: "valedictory",
        title: "Valedictory",
        tagline: "Awards, results and the closing of IEEE Week.",
        category: "Ceremony",
        venue: "",
        time: "",
        teamCount: 0,
        teamLabel: "",
        coordinators: [],
        overview: "Awards, results and the closing of IEEE Week.",
      },
    ],
  },
];

/** Payment details shown on the payment page. Put the QR image in public/images/ieee-week/ and set qr. */
export const PAYMENT = {
  qr: "/images/ieee-week/payment-qr.png" as string,
  qrAlt: "PhonePe QR code to pay IEEE SGBIT",
  payee: "Srushti Mutalikdesai (PhonePe)",
};

/** Events people can register for. */
export const REGISTRABLE = WEEK_DAYS.flatMap((d) => d.events.map((e) => ({ ...e, day: d.day }))).filter((e) => e.teamCount > 0);

// Artwork supplied by the branch. Swap the files in public/images/ieee-week/ to change them.
// Hero portrait. Set to null to show no portrait.
export const DOOM_IMAGE: { src: string; alt: string } | null = {
  src: "/images/ieee-week/doom-orb.webp",
  alt: "Doctor Doom in a dark hood holding a glowing Earth",
};
export const DOOM_SMOKE = {
  src: "/images/ieee-week/doom-smoke.webp",
  alt: "A hooded figure walking away into green smoke",
};
export const DOOM_MASK = {
  src: "/images/ieee-week/doom-mask.webp",
  alt: "A steel faceplate half buried in green sand under a storm sky",
};
