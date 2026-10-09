import { REGISTRABLE } from "@/data/ieeeWeek";

export type Status = "pending" | "approved" | "rejected";

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  date_label: string;
  event_date: string | null;
  venue: string;
  description: string;
  long_description: string;
  tags: string[];
  image_url: string;
  gallery: string[];
  status: "upcoming" | "past";
  published: boolean;
  registration_open: boolean;
  fee_amount: number;
  payment_instructions: string;
  max_registrations: number | null;
  sort_order: number;
}

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  usn: string;
  college: string;
  branch: string;
  semester: string;
  team_name: string;
  transaction_id: string;
  has_proof: boolean;
  status: Status;
  admin_note: string;
  created_at: string;
  reviewed_at: string | null;
  events: { title: string; slug: string; fee_amount: number } | null;
}

export interface Membership {
  id: string;
  name: string;
  email: string;
  semester: string;
  branch: string;
  dob: string | null;
  contact: string;
  security_question: string;
  security_answer: string;
  status: Status;
  admin_note: string;
  created_at: string;
}

export interface QueryRow {
  id: string;
  email: string;
  phone: string;
  topic: string;
  status: "open" | "resolved";
  created_at: string;
}

export interface Person {
  role: string;
  name: string;
  usn: string;
  dept: string;
  year: string;
  phone: string;
}

/** Everything the console needs from one registration, read out of the raw columns and note. */
export interface ParsedReg {
  /** awaiting = team saved, no payment yet. paid = payment submitted. old = from the old single form. */
  stage: "awaiting" | "paid" | "old";
  plan: "ieee" | "non" | null;
  amount: number | null;
  people: Person[];
  ieeeIds: { member: number; id: string }[];
  adminNote: string;
  extra: string[];
  /** The slug without the ieee-week- prefix, when this is an IEEE Week event. */
  weekSlug: string | null;
  day: number | null;
  eventTitle: string;
}

export function parseRegistration(r: Registration): ParsedReg {
  const lines = String(r.admin_note ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  let stage: ParsedReg["stage"] = r.transaction_id ? "old" : "awaiting";
  let plan: ParsedReg["plan"] = null;
  let amount: number | null = null;
  const people: Person[] = [];
  const ieeeIds: ParsedReg["ieeeIds"] = [];
  let adminNote = "";
  const extra: string[] = [];

  for (const line of lines) {
    if (line.startsWith("[Awaiting payment]")) {
      stage = "awaiting";
    } else if (line.startsWith("[Payment submitted]")) {
      stage = "paid";
      plan = /No IEEE member/i.test(line) ? "non" : "ieee";
      const m = /Rs\s*(\d+)/i.exec(line);
      amount = m ? Number(m[1]) : null;
    } else if (line.startsWith("IEEE IDs")) {
      for (const part of line.split(":").slice(1).join(":").split(",")) {
        const m = /member\s*(\d+)\s*:\s*(\d+)/i.exec(part.includes(":") ? part : part);
        if (m) ieeeIds.push({ member: Number(m[1]), id: m[2] });
      }
    } else if (/^(Lead|Member \d+): /.test(line)) {
      const role = line.slice(0, line.indexOf(":"));
      const parts = line.slice(line.indexOf(":") + 2).split(", ");
      if (parts.length >= 5) {
        people.push({ role, name: parts[0], usn: parts[1], dept: parts[2], year: parts[3].replace(/^year\s*/i, ""), phone: parts[parts.length - 1] });
      } else extra.push(line);
    } else if (line.startsWith("Admin: ")) {
      adminNote = line.slice(7);
    } else {
      extra.push(line);
    }
  }

  // The "IEEE IDs" line is written as "IEEE IDs (to verify): member 1: 123, member 2: 456".
  if (ieeeIds.length === 0) {
    const raw = lines.find((l) => l.startsWith("IEEE IDs"));
    const re = /member\s*(\d+):\s*(\d+)/gi;
    let hit: RegExpExecArray | null;
    while (raw && (hit = re.exec(raw))) ieeeIds.push({ member: Number(hit[1]), id: hit[2] });
  }

  // Old single-form registrations keep their lead details in the columns.
  if (people.length === 0 && r.name) {
    people.push({ role: "Lead", name: r.name, usn: r.usn, dept: r.branch, year: r.semester ? `sem ${r.semester}` : "", phone: r.phone });
  }

  const slug = r.events?.slug ?? "";
  const weekSlug = slug.startsWith("ieee-week-") ? slug.slice(10) : null;
  const day = weekSlug ? REGISTRABLE.find((e) => e.slug === weekSlug)?.day ?? null : null;
  return { stage, plan, amount, people, ieeeIds, adminNote, extra, weekSlug, day, eventTitle: r.events?.title ?? "Event" };
}

export type ReviewState = "awaiting" | "review" | "approved" | "rejected";

/** The one status an admin cares about. */
export function reviewState(r: Registration, p: ParsedReg): ReviewState {
  if (r.status === "approved") return "approved";
  if (r.status === "rejected") return "rejected";
  return p.stage === "awaiting" ? "awaiting" : "review";
}

export const STATE_LABEL: Record<ReviewState, string> = {
  awaiting: "Awaiting payment",
  review: "To review",
  approved: "Approved",
  rejected: "Rejected",
};

export const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
export const fmtLong = (iso: string) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function csvCell(v: unknown) {
  const s = String(v ?? "");
  // Stop spreadsheet formula injection from user supplied text.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function downloadCsv(name: string, rows: unknown[][]) {
  const body = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export const ACTION_LABELS: Record<string, string> = {
  login: "Signed in",
  logout: "Signed out",
  "registration.approved": "Approved a registration",
  "registration.rejected": "Rejected a registration",
  "registration.pending": "Reset a registration to pending",
  "registration.delete": "Deleted a registration",
  "registration.view_proof": "Viewed a payment screenshot",
  "membership.approved": "Approved a membership",
  "membership.rejected": "Rejected a membership",
  "membership.delete": "Deleted a membership",
  "event.create": "Created an event",
  "event.update": "Updated an event",
  "event.delete": "Deleted an event",
  "query.resolved": "Resolved a query",
  "query.open": "Reopened a query",
  "query.delete": "Deleted a query",
};
