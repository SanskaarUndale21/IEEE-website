import { REGISTRABLE } from "@/data/ieeeWeek";

/** Shared by the registration form (fast feedback) and the server (the real check). */

export const USN_RE = /^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2,3}[0-9]{3}$/;
/** First years without a USN yet use division + roll number, for example A26. */
export const DIV_ROLL_RE = /^[A-Z][0-9]{1,3}$/;
export const isValidMemberId = (s: string) => USN_RE.test(s) || DIV_ROLL_RE.test(s);
export const PHONE_RE = /^[6-9][0-9]{9}$/;
export const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,79}$/;

/** IEEE membership numbers are digits only. */
export const IEEE_ID_RE = /^[0-9]{6,12}$/;
export const normalizeIeeeId = (s: string) => s.replace(/[\s-]+/g, "");

export const normalizeUsn = (s: string) => {
  const t = s.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]-[0-9]{1,3}$/.test(t) ? t.replace("-", "") : t; // "A-26" is the same as "A26"
};

export const normalizePhone = (s: string) => {
  const d = s.replace(/\D/g, "");
  return d.length > 10 ? d.slice(-10) : d;
};

export type TeamMember = { name: string; usn: string; dept: string; year: string; phone: string };

/** Events on the same day run in parallel, so a person can join only one of them. */
export function eventsOnSameDay(slug: string) {
  const day = REGISTRABLE.find((e) => e.slug === slug)?.day;
  return REGISTRABLE.filter((e) => e.day === day);
}

/** Looks for the same person (by USN or phone) twice inside one team. Returns an error or "". */
export function teamDuplicateError(members: TeamMember[]): string {
  const usns = new Map<string, number>();
  const phones = new Map<string, number>();
  for (let i = 0; i < members.length; i++) {
    const u = normalizeUsn(members[i].usn);
    const p = normalizePhone(members[i].phone);
    const label = (n: number) => (n === 0 ? "the team lead" : `member ${n + 1}`);
    if (u && usns.has(u)) return `${label(usns.get(u) as number)} and ${label(i)} have the same USN or roll number. Each member needs their own.`;
    if (p && phones.has(p)) return `${label(phones.get(p) as number)} and ${label(i)} have the same phone number. Each member needs their own.`;
    if (u) usns.set(u, i);
    if (p) phones.set(p, i);
  }
  return "";
}

/** Format checks the form runs before sending. The server runs the same rules again. */
export function memberFormatError(m: TeamMember, index: number): string {
  const who = index === 0 ? "Team lead" : `Member ${index + 1}`;
  if (!NAME_RE.test(m.name.trim())) return `${who}: enter the name using letters only.`;
  if (!isValidMemberId(normalizeUsn(m.usn))) return `${who}: enter a valid USN (2BU24CS036), or division and roll number (A26) if you have no USN yet.`;
  if (!m.dept.trim()) return `${who}: enter the department.`;
  if (!/^[1-4]$/.test(m.year)) return `${who}: select the year.`;
  if (!PHONE_RE.test(normalizePhone(m.phone))) return `${who}: enter a 10 digit mobile number.`;
  return "";
}

/** People saved on a registration: the lead (columns) plus members written in the admin note. */
export function peopleOnRegistration(reg: { name?: string | null; usn?: string | null; phone?: string | null; admin_note?: string | null }) {
  const people: { name: string; usn: string; phone: string }[] = [];
  if (reg.usn || reg.phone) people.push({ name: reg.name ?? "", usn: normalizeUsn(reg.usn ?? ""), phone: normalizePhone(reg.phone ?? "") });
  for (const line of String(reg.admin_note ?? "").split("\n")) {
    const m = /^(Lead|Member \d+): (.+)$/.exec(line.trim());
    if (!m) continue;
    const parts = m[2].split(", ");
    if (parts.length < 3) continue;
    people.push({ name: parts[0], usn: normalizeUsn(parts[1]), phone: normalizePhone(parts[parts.length - 1]) });
  }
  return people;
}
