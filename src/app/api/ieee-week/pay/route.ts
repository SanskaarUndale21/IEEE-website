import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { BUCKETS, getSupabase, supabaseConfigured } from "@/lib/supabase/server";
import { ieeePaySchema, firstIssue } from "@/lib/validation";
import { MAX_UPLOAD_BYTES, readImageUpload } from "@/lib/security/uploads";
import { sameOrigin } from "@/lib/admin/auth";
import { REGISTRABLE } from "@/data/ieeeWeek";
import { paymentStatusOf, type RegRow } from "@/lib/ieeeWeekState";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** Step 3: attach the payment (transaction id and screenshot) to the saved team. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req.headers)) return fail("Forbidden", 403);
  if (!supabaseConfigured()) return fail("Registrations are not open yet", 503);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 64_000) return fail("Upload too large (max 4 MB)", 413);
  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) return fail("Bad request", 400);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Bad request", 400);
  }

  const fields: Record<string, string> = {};
  for (const k of ["id", "plan", "transactionId", "confirmId", "website"]) {
    const v = form.get(k);
    if (typeof v === "string") fields[k] = v;
  }
  const ieeeIds: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const v = form.get(`ieeeId${i}`);
    ieeeIds.push(typeof v === "string" ? v : "");
  }
  const parsed = ieeePaySchema.safeParse({ ...fields, ieeeIds });
  if (!parsed.success) return fail(firstIssue(parsed.error).replace(/^[\w.]+: /, ""), 400);
  const body = parsed.data;
  if (body.website) return NextResponse.json({ success: true });

  const upload = await readImageUpload(form.get("paymentProof"));
  if (!upload) return fail("Upload your payment screenshot", 400);
  if (!upload.ok) return fail(upload.error, 400);

  const db = getSupabase();
  let proofPath: string | null = null;
  try {
    const { data: reg, error } = await db
      .from("event_registrations")
      .select("id, status, transaction_id, payment_proof_path, admin_note, events(slug)")
      .eq("id", body.id)
      .maybeSingle();
    if (error) throw error;
    if (!reg) return fail("Registration not found", 404);

    // What can this registration do right now? Read from the database, never from the browser.
    const state = paymentStatusOf({ status: reg.status as RegRow["status"], transaction_id: reg.transaction_id as string });
    if (state === "verified") return fail("Your payment is already verified. Nothing more to do.", 409);
    if (state === "submitted") return fail("Your payment is already submitted and waiting to be checked.", 409);
    // pending (first payment) and rejected (a corrected payment) may continue.

    // The same transaction id cannot pay for two registrations.
    const { data: used, error: usedErr } = await db
      .from("event_registrations")
      .select("id")
      .ilike("transaction_id", body.transactionId.split("_").join("\\_"))
      .neq("id", reg.id)
      .limit(1);
    if (usedErr) throw usedErr;
    if (used && used.length > 0) return fail("This transaction ID is already used for another registration", 409);

    const slug = String((reg.events as unknown as { slug?: string } | null)?.slug ?? "").replace(/^ieee-week-/, "");
    const info = REGISTRABLE.find((e) => e.slug === slug);
    if (!info?.fee) return fail("Registration not found", 404);
    const fee = body.plan === "ieee" ? info.fee.ieee : info.fee.nonIeee;

    proofPath = `ieee-week-${slug}/${randomUUID()}.${upload.kind.ext}`;
    const { error: upErr } = await db.storage
      .from(BUCKETS.paymentProofs)
      .upload(proofPath, upload.bytes, { contentType: upload.kind.mime, upsert: false, cacheControl: "0" });
    if (upErr) throw upErr;

    // Rebuild the note: new payment lines first, then the team lines and any admin line that were already there.
    const old = String(reg.admin_note ?? "").split("\n");
    const keep = old.filter((l) => /^(Lead|Member \d+): /.test(l) || l.startsWith("Admin: "));
    const head = [`[Payment submitted] ${body.plan === "ieee" ? "Team has an IEEE member" : "No IEEE member"}, Rs ${fee}`];
    if (body.plan === "ieee") {
      const ids = body.ieeeIds.slice(0, info.teamCount).map((id, i) => (id ? `member ${i + 1}: ${id}` : "")).filter(Boolean);
      head.push(`IEEE IDs (to verify): ${ids.join(", ")}`);
    }
    const note = [...head, ...keep].join("\n").slice(0, 1000);

    // Only one request can win: the update applies only if the registration is still in the state we read.
    // A corrected payment after a rejection goes back to pending. It is never marked verified here;
    // only an admin can do that.
    const { data: changed, error: updErr } = await db
      .from("event_registrations")
      .update({
        transaction_id: body.transactionId,
        payment_proof_path: proofPath,
        admin_note: note,
        status: "pending",
        reviewed_at: null,
      })
      .eq("id", reg.id)
      .eq("status", reg.status as string)
      .eq("transaction_id", reg.transaction_id as string)
      .select("id");
    if (updErr) throw updErr;
    if (!changed || changed.length === 0) {
      await db.storage.from(BUCKETS.paymentProofs).remove([proofPath]);
      proofPath = null;
      return fail("This registration changed while you were paying. Reload the page to see its latest status.", 409);
    }

    // The earlier, rejected screenshot is no longer needed.
    if (reg.payment_proof_path && reg.payment_proof_path !== proofPath) {
      await db.storage.from(BUCKETS.paymentProofs).remove([reg.payment_proof_path as string]);
    }

    return NextResponse.json({ success: true, fee, paymentStatus: "submitted" });
  } catch (error) {
    if (proofPath) await db.storage.from(BUCKETS.paymentProofs).remove([proofPath]);
    console.error("ieee week payment failed", error);
    return fail("Could not save your payment. Please try again.", 500);
  }
}
