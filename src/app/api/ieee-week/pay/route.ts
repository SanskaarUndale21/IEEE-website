import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { BUCKETS, getSupabase, supabaseConfigured } from "@/lib/supabase/server";
import { ieeePaySchema, firstIssue } from "@/lib/validation";
import { MAX_UPLOAD_BYTES, readImageUpload } from "@/lib/security/uploads";
import { sameOrigin } from "@/lib/admin/auth";
import { REGISTRABLE } from "@/data/ieeeWeek";

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
  const parsed = ieeePaySchema.safeParse(fields);
  if (!parsed.success) return fail(firstIssue(parsed.error), 400);
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
      .select("id, transaction_id, admin_note, events(slug)")
      .eq("id", body.id)
      .maybeSingle();
    if (error) throw error;
    if (!reg) return fail("Registration not found", 404);
    if (reg.transaction_id) return fail("Payment for this registration is already submitted", 409);

    const slug = String((reg.events as unknown as { slug?: string } | null)?.slug ?? "").replace(/^ieee-week-/, "");
    const info = REGISTRABLE.find((e) => e.slug === slug);
    if (!info?.fee) return fail("Registration not found", 404);
    const fee = body.plan === "ieee" ? info.fee.ieee : info.fee.nonIeee;

    proofPath = `ieee-week-${slug}/${randomUUID()}.${upload.kind.ext}`;
    const { error: upErr } = await db.storage
      .from(BUCKETS.paymentProofs)
      .upload(proofPath, upload.bytes, { contentType: upload.kind.mime, upsert: false, cacheControl: "0" });
    if (upErr) throw upErr;

    const lines = String(reg.admin_note ?? "").split("\n");
    lines[0] = `[Payment submitted] ${body.plan === "ieee" ? "Team has an IEEE member" : "No IEEE member"}, Rs ${fee}`;

    const { error: updErr } = await db
      .from("event_registrations")
      .update({
        transaction_id: body.transactionId,
        payment_proof_path: proofPath,
        admin_note: lines.join("\n").slice(0, 1000),
      })
      .eq("id", reg.id)
      .eq("transaction_id", "");
    if (updErr) throw updErr;

    return NextResponse.json({ success: true, fee });
  } catch (error) {
    if (proofPath) await db.storage.from(BUCKETS.paymentProofs).remove([proofPath]);
    console.error("ieee week payment failed", error);
    return fail("Could not save your payment. Please try again.", 500);
  }
}
