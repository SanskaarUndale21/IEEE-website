// Rules and regulations for each IEEE Week event, transcribed from the official rulebook.
// Edit here to change what the event pages show.

export type RuleBlock =
  /** A numbered list, for rules that are read in order. */
  | { kind: "numbered"; title: string; items: string[] }
  /** A bulleted list. */
  | { kind: "bullets"; title: string; items: string[] }
  /** A short paragraph. */
  | { kind: "text"; title: string; text: string };

export type Rulebook = {
  blocks: RuleBlock[];
  /** Shown as a highlighted note under the rules. */
  note?: string;
};

const PRESENT_NOTE =
  "Registered teams must be present at the venue on or before the event time, so they do not miss any instructions or details explained by the coordinators.";

export const RULEBOOK: Record<string, Rulebook> = {
  retrace: {
    blocks: [
      {
        kind: "numbered",
        title: "Rules and regulations",
        items: [
          "Each team must consist of exactly 2 members.",
          "Participants must solve the ARG in the intended manner.",
          "Each team must carry their own laptop or smartphone.",
          "Do not modify, delete or interfere with event files or accounts.",
          "Sharing clues or answers with other teams is prohibited.",
          "The use of AI models and AI tools is permitted.",
          "The coordinators may change the event rules based on the situation.",
        ],
      },
      { kind: "text", title: "Recommended resources", text: "Laptops, earphones or headphones, a notepad and a pen." },
    ],
    note: PRESENT_NOTE,
  },

  "conquer-the-canvas": {
    blocks: [
      {
        kind: "numbered",
        title: "Rules and regulations",
        items: [
          "Each team must consist of exactly 2 members.",
          "Participants are given a base poster or design at the start of the event.",
          "All poster designing must be done exclusively in Canva.",
          "Participants may bring their own laptops. PCs are also provided at the venue.",
          "New elements, instructions or requirements are introduced progressively during the event.",
          "Participants must add the given elements to their existing poster without starting over.",
          "Every element must be added creatively and appropriately, following the given instructions.",
          "The use of AI tools or AI-generated content is strictly prohibited.",
          "Copied designs, templates from external sources and plagiarised content are strictly prohibited.",
          "Participants must complete and submit their final poster within the time limit.",
          "Participants must follow all instructions given by the event coordinators.",
          "The decision of the judges is final and binding.",
        ],
      },
    ],
  },

  "prompt-injection": {
    blocks: [
      {
        kind: "bullets",
        title: "Format",
        items: [
          "Teams have 2 members: 1 attacker and 1 defender.",
          "A match lasts 15 minutes, played as 3 rounds of 5 minutes. Both teams attack and defend at the same time.",
          "Each team plays 3 matches and the scores are added up. The top 3 teams on the final leaderboard win.",
        ],
      },
      {
        kind: "bullets",
        title: "Attacker",
        items: [
          "Make the opponent's AI reveal its secret using prompt-based techniques only: prompt injection, role-play, social engineering, multi-turn, encoding and so on.",
          "Use only the official competition interface. No access to anyone's device, account, network, backend or platform.",
        ],
      },
      {
        kind: "bullets",
        title: "Defender",
        items: [
          "Write and improve a defense prompt that keeps your team's secret safe. You can update it between rounds.",
          "Your AI must still answer normal, legitimate requests. Blocking everything costs utility points.",
        ],
      },
      {
        kind: "bullets",
        title: "Scoring, 100 points per match",
        items: [
          "Attack, 40 points: how much of the opponent's secret you extract. Partial leaks earn partial points.",
          "Defense, 40 points: how much of your own secret stays protected.",
          "Utility, 20 points: how well your AI handles legitimate requests.",
          "Tie-breaker: total score, then attack score, then defense score, then utility score, then a 5-minute sudden-death match.",
        ],
      },
      {
        kind: "bullets",
        title: "Code of conduct",
        items: [
          "Be respectful. No harassment, cheating, impersonation or disruption.",
          "Do not interfere with another team's workstation, session or network.",
          "Do not submit real personal data, real credentials, malware or harmful payloads.",
          "Do not share another team's secret or help another team during a match.",
          "Follow the organizers' policy on using external AI tools.",
        ],
      },
      {
        kind: "bullets",
        title: "Disqualification",
        items: [
          "Hacking or accessing the platform, backend or infrastructure, or getting secrets by any means other than the AI challenge.",
          "Stealing credentials, hijacking sessions, or causing disruption or denial of service.",
          "Using prohibited tools, or tampering with scores, logs or timers.",
        ],
      },
      {
        kind: "bullets",
        title: "Judging",
        items: ["Platform logs (prompts, responses, timestamps, scores) are the official record.", "The organizers' decision is final."],
      },
    ],
  },

  "pixel-perfect": {
    blocks: [
      {
        kind: "numbered",
        title: "Rules and regulations",
        items: [
          "Each team consists of 2 members.",
          "Editing, filters, AI-generated images and manipulated photographs are not allowed.",
          "Participants must use one designated device per team.",
          "Each team gets 45 minutes for round 1 and 30 minutes for round 2 to complete the challenge.",
          "The decision of the judging panel and organizers is final and binding.",
          "The team is held responsible for any damage caused to campus property.",
          "Do not disturb ongoing classes, laboratories, offices or other campus activities.",
          "Teams that do not follow these rules are disqualified.",
        ],
      },
      {
        kind: "bullets",
        title: "Gameplay",
        items: [
          "The event has 2 rounds.",
          "Each team receives a set of modified or blurred campus photographs.",
          "Teams must identify the location shown in each photograph.",
          "After identifying a location, the team must physically reach the spot and capture a photograph.",
          "The new photograph must show the same location from approximately the same viewpoint as the given image.",
          "Teams must complete the task within the allotted time.",
          "Teams are judged on the accuracy of the captured photographs, with the help of an AI algorithm.",
        ],
      },
      {
        kind: "text",
        title: "Judging criteria",
        text: "The recreated photographs are compared with the original reference images using an AI-based image comparison algorithm. Accuracy of location, viewpoint, composition and overall visual similarity contribute to the final evaluation.",
      },
    ],
  },

  "code-relay": {
    blocks: [
      {
        kind: "numbered",
        title: "Rules and regulations",
        items: [
          "Each team must consist of 3 members.",
          "AI tools, internet access and external assistance are strictly prohibited.",
          "Participants must switch off their mobile phones and hand them to the coordinators before the event.",
          "Teams must use only the resources provided by the organizers.",
          "Team members may discuss only during the designated discussion period before coding.",
          "Only one member can code at a time.",
          "No communication, discussion or explanation is allowed between team members once coding begins.",
          "Team members cannot write comments in their code.",
          "Copying code or solutions from other teams is strictly prohibited.",
          "Participants must maintain fair and ethical conduct throughout the event.",
          "Participants must follow the instructions of organizers and volunteers.",
          "Coding must stop immediately when the allocated time ends.",
          "Participants must not disturb or interfere with other teams.",
          "The decision of the organizing committee is final.",
        ],
      },
      {
        kind: "text",
        title: "Competition format",
        text: "Each team of three receives a problem statement and a designated discussion time to understand it and plan their approach. Coding then follows in a relay: one member codes at a time and the next member takes over when the allocated turn ends. Communication between team members is not allowed during active coding.",
      },
      {
        kind: "bullets",
        title: "Round 1",
        items: [
          "Two easy-level problem statements are given.",
          "Problem 1: 5 minutes discussion and planning, then 15 minutes relay coding.",
          "Problem 2: 5 minutes discussion and planning, then 15 minutes relay coding.",
          "During coding, members take turns and receive equal coding time.",
          "Only one problem includes a mini-task and a hint.",
        ],
      },
      {
        kind: "bullets",
        title: "Round 2",
        items: [
          "One medium-level and one easy-level problem are given.",
          "Medium problem: 8 minutes discussion and planning, then 30 minutes relay coding.",
          "Easy problem: the team chooses one member to code for the final 15 minutes.",
          "The other two team members cannot communicate with the person coding at that time.",
          "Only one problem includes a mini-task and a hint. The other must be solved without a hint.",
          "During relay coding, members take turns and receive equal coding time.",
        ],
      },
    ],
  },

  uncharted: {
    blocks: [
      {
        kind: "numbered",
        title: "Rules and regulations",
        items: [
          "Each team consists of 3 members.",
          "Teams must cooperate and compete fairly.",
          "No participant may intentionally damage, remove, hide or alter college property or event materials.",
          "Participants must not interfere with classes, staff, other students or other events.",
          "Participants must not steal, copy or tamper with another team's clues or materials.",
          "Outside assistance from non-participants is prohibited.",
          "Phones, smartwatches and other electronic devices are prohibited during the event.",
          "Participants must follow the coordinators' and volunteers' instructions at all times.",
          "Participants must respect campus property and keep it clean.",
        ],
      },
    ],
    note: PRESENT_NOTE,
  },
};
