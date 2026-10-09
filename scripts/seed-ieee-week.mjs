// Creates the IEEE Week events as DRAFT rows (not published, registration closed).
// Run once:  node scripts/seed-ieee-week.mjs
// Then open the admin panel, edit each event (fee, payment instructions) and switch on
// "Published" and "Registration open" when you are ready to take registrations.
// Existing rows are left alone.
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);
const base = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are needed in .env.local");

const PAY = "Pay by PhonePe to Srushti Mutalikdesai. Scan the QR code on the payment page. Fee per team: Rs 79 if at least one member is an IEEE member (also if all are), Rs 99 only if no member is IEEE. After paying, enter the transaction ID twice and upload the payment screenshot.";
const rows = [
  { slug: "retrace", title: "RETR?CE", day: 14, venue: "AIDS Seminar Hall", fee: 79, tag: "Technical", blurb: "A search for the forgotten" },
  { slug: "conquer-the-canvas", title: "Conquer the Canvas", day: 14, venue: "CSE Lab", fee: 79, tag: "Non-Technical", blurb: "Add. Adapt. Create." },
  { slug: "prompt-injection", title: "Prompt Injection", day: 15, venue: "EC Dept, Classroom 133", fee: 79, tag: "Technical", blurb: "One attacker. One defender." },
  { slug: "pixel-perfect", title: "Pixel Perfect", day: 15, venue: "CSBS Dep-E302", fee: 79, tag: "Non-Technical", blurb: "See it. Find it. Recreate it. Perfect it." },
  { slug: "code-relay", title: "Code Relay", day: 16, venue: "CSE Dep-Sankalp Lab", fee: 79, tag: "Technical", blurb: "Blind coding relay in VS Code" },
  { slug: "uncharted", title: "Uncharted: Unveil the Hidden", day: 16, venue: "AIDS Seminar Hall", fee: 79, tag: "Non-Technical", blurb: "A two-round story-driven mystery" },
].map((r, i) => ({
  slug: `ieee-week-${r.slug}`,
  title: r.title,
  date_label: `${r.day} October 2026, 2:30 PM`,
  event_date: `2026-10-${r.day}`,
  venue: r.venue,
  description: r.blurb,
  long_description: "",
  tags: ["IEEE Week", r.tag],
  image_url: "",
  gallery: [],
  status: "upcoming",
  published: false,
  registration_open: false,
  fee_amount: r.fee, // IEEE member fee. Non-IEEE fee is shown on the page.
  payment_instructions: PAY,
  max_registrations: null,
  sort_order: 100 + i,
}));

const res = await fetch(`${base}/rest/v1/events?on_conflict=slug`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "resolution=ignore-duplicates,return=representation",
  },
  body: JSON.stringify(rows),
});
const text = await res.text();
if (!res.ok) throw new Error(`Seed failed (${res.status}): ${text}`);
const created = JSON.parse(text);
console.log(`Created ${created.length} draft event(s). ${rows.length - created.length} already existed.`);
