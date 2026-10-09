import { z } from "zod";
import { IEEE_ID_RE, normalizeIeeeId, NAME_RE, PHONE_RE, USN_RE, normalizePhone, normalizeUsn, teamDuplicateError } from "@/lib/ieeeWeekRules";

// Strip control chars, collapse surrounding whitespace.
const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().max(max));

const required = (max: number) => clean(max).pipe(z.string().min(1, "Required"));
const optional = (max: number) => clean(max).optional().default("");

const email = clean(200).pipe(z.string().email("Invalid email"));
const phone = clean(30).pipe(z.string().regex(/^\+?[0-9 ()-]{7,20}$/, "Invalid phone number"));
const uuid = z.string().uuid();

export const membershipSchema = z.object({
  name: required(120),
  email,
  semester: clean(10).pipe(z.string().regex(/^[1-8]$/, "Invalid semester")),
  branch: required(80),
  dob: clean(10)
    .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"))
    .refine((d) => !Number.isNaN(Date.parse(d)), "Invalid date"),
  contact: phone,
  securityQuestion: optional(200),
  securityAnswer: optional(200),
  website: z.string().max(0).optional(), // honeypot, humans leave it empty
});

export const querySchema = z
  .object({
    email: clean(200).pipe(z.union([z.literal(""), z.string().email()])).optional().default(""),
    phone: clean(30)
      .pipe(z.union([z.literal(""), z.string().regex(/^\+?[0-9 ()-]{7,20}$/)]))
      .optional()
      .default(""),
    topic: optional(2000),
    website: z.string().max(0).optional(),
  })
  .refine((q) => q.email || q.phone, "Email or phone is required");

// ─── IEEE Week registration (three steps: details, WhatsApp, payment) ─────
const ieeeName = clean(80).pipe(z.string().regex(NAME_RE, "Enter the name using letters only"));
const ieeeUsn = clean(30)
  .transform((s) => normalizeUsn(s))
  .pipe(z.string().regex(USN_RE, "Enter a valid USN, for example 2BU24CS036"));
const ieeePhone = clean(30)
  .transform((s) => normalizePhone(s))
  .pipe(z.string().regex(PHONE_RE, "Enter a 10 digit mobile number"));

export const ieeeMemberSchema = z.object({
  name: ieeeName,
  usn: ieeeUsn,
  dept: required(80),
  year: clean(1).pipe(z.string().regex(/^[1-4]$/, "Select the year")),
  phone: ieeePhone,
});

export const ieeeRegisterSchema = z.object({
  event: clean(60).pipe(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Unknown event")),
  teamName: required(120),
  members: z.array(ieeeMemberSchema).min(1).max(5),
  website: z.string().max(0).optional(),
}).superRefine((v, ctx) => {
  const err = teamDuplicateError(v.members);
  if (err) ctx.addIssue({ code: "custom", message: err, path: ["members"] });
});

const txId = clean(80).pipe(z.string().regex(/^[A-Za-z0-9 _./-]{4,80}$/, "Invalid transaction id"));

export const ieeePaySchema = z
  .object({
    id: uuid,
    plan: z.enum(["ieee", "non"]),
    transactionId: txId,
    confirmId: txId,
    // One entry per team member, in order. Empty means not given.
    ieeeIds: z.array(clean(30).transform((s) => normalizeIeeeId(s)).pipe(z.union([z.literal(""), z.string().regex(IEEE_ID_RE, "Enter the IEEE number using digits only (6 to 12 digits)")]))).max(5).default([]),
    website: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    const given = v.ieeeIds.filter(Boolean);
    if (v.plan === "ieee" && given.length === 0) ctx.addIssue({ code: "custom", message: "Enter the IEEE ID of at least one team member", path: ["ieeeIds"] });
    if (new Set(given).size !== given.length) ctx.addIssue({ code: "custom", message: "Each member needs a different IEEE ID", path: ["ieeeIds"] });
  })
  .refine((v) => v.transactionId.toLowerCase() === v.confirmId.toLowerCase(), {
    message: "The two transaction ids do not match",
    path: ["confirmId"],
  });

export const registrationSchema = z.object({
  eventId: uuid,
  name: required(120),
  email,
  phone,
  usn: optional(30),
  college: optional(160),
  branch: optional(80),
  semester: clean(10).pipe(z.union([z.literal(""), z.string().regex(/^[1-8]$/)])).optional().default(""),
  teamName: optional(120),
  // Extra team members and IEEE membership, saved on the registration as a note for the admins.
  members: optional(600),
  membership: optional(120),
  transactionId: clean(80)
    .pipe(z.union([z.literal(""), z.string().regex(/^[A-Za-z0-9 _./-]{4,80}$/, "Invalid transaction id")]))
    .optional()
    .default(""),
  website: z.string().max(0).optional(),
});

// Images may be local (/images/...) or uploaded to our Supabase public bucket.
function isAllowedImageUrl(url: string) {
  if (url === "") return true;
  if (/^\/images\/[A-Za-z0-9 _().,/-]+\.(jpe?g|png|webp|jfif|gif)$/i.test(url) && !url.includes("..")) return true;
  const base = process.env.SUPABASE_URL;
  if (!base) return false;
  try {
    const u = new URL(url);
    const b = new URL(base);
    return (
      u.protocol === "https:" &&
      u.host === b.host &&
      u.pathname.startsWith("/storage/v1/object/public/event-images/") &&
      !u.search
    );
  } catch {
    return false;
  }
}

const imageUrl = clean(500).refine(isAllowedImageUrl, "Image must be a /images/ path or an uploaded image");

export const eventSchema = z.object({
  slug: clean(80).pipe(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers, dashes")),
  title: required(160),
  date_label: optional(80),
  event_date: clean(10)
    .pipe(z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]))
    .optional()
    .default("")
    .transform((d) => (d === "" ? null : d)),
  venue: optional(200),
  description: optional(600),
  long_description: optional(8000),
  tags: z.array(required(40)).max(10).default([]),
  image_url: imageUrl.optional().default(""),
  gallery: z.array(imageUrl.pipe(z.string().min(1))).max(20).default([]),
  status: z.enum(["upcoming", "past"]),
  published: z.boolean(),
  registration_open: z.boolean(),
  fee_amount: z.number().int().min(0).max(100000),
  payment_instructions: optional(1000),
  max_registrations: z.number().int().positive().max(100000).nullable().default(null),
  sort_order: z.number().int().min(-10000).max(10000).default(0),
});

export const eventUpdateSchema = eventSchema.extend({ id: uuid });

export const reviewSchema = z.object({
  id: uuid,
  status: z.enum(["pending", "approved", "rejected"]),
  note: optional(1000),
});

export const queryStatusSchema = z.object({
  id: uuid,
  status: z.enum(["open", "resolved"]),
});

export const idSchema = z.object({ id: uuid });

export function firstIssue(err: z.ZodError) {
  const i = err.issues[0];
  return i ? `${i.path.join(".") || "input"}: ${i.message}` : "Invalid input";
}
