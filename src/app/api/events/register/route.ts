import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { BUCKETS, getSupabase, supabaseConfigured } from "@/lib/supabase/server";
import { registrationSchema, firstIssue } from "@/lib/validation";
import { tooManyRecent } from "@/lib/security/rate-limit";
import { MAX_UPLOAD_BYTES, readImageUpload } from "@/lib/security/uploads";
import { clientIp, sameOrigin } from "@/lib/admin/auth";
import { hashIp } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req.headers)) return fail("Forbidden", 403);
  if (!supabaseConfigured()) return fail("Registrations are not open yet", 503);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 64_000) {
    return fail("Upload too large (max 4 MB)", 413);
  }
  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
    return fail("Bad request", 400);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Bad request", 400);
  }

  const fields: Record<string, string> = {};
  for (const key of ["eventId", "name", "email", "phone", "usn", "college", "branch", "semester", "teamName", "transactionId", "members", "membership", "website"]) {
    const v = form.get(key);
    if (typeof v === "string") fields[key] = v;
  }

  const parsed = registrationSchema.safeParse(fields);
  if (!parsed.success) return fail(firstIssue(parsed.error), 400);
  const body = parsed.data;
  if (body.website) return NextResponse.json({ success: true });

  const db = getSupabase();
  const ipHash = await hashIp(clientIp(req.headers, req));

  try {
    if (await tooManyRecent("event_registrations", ipHash, 60, 8)) {
      return fail("Too many registrations from this network. Try again later.", 429);
    }

    const { data: event, error: evErr } = await db
      .from("events")
      .select("id, published, status, registration_open, fee_amount, max_registrations")
      .eq("id", body.eventId)
      .maybeSingle();
    if (evErr) throw evErr;
    if (!event || !event.published || event.status !== "upcoming" || !event.registration_open) {
      return fail("Registrations for this event are closed", 409);
    }

    if (event.max_registrations != null) {
      const { count } = await db
        .from("event_registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id)
        .neq("status", "rejected");
      if ((count ?? 0) >= event.max_registrations) return fail("This event is full", 409);
    }

    const upload = await readImageUpload(form.get("paymentProof"));
    if (upload && !upload.ok) return fail(upload.error, 400);

    const paid = event.fee_amount > 0;
    if (paid && !upload) return fail("Payment screenshot is required", 400);
    if (paid && !body.transactionId) return fail("Transaction / UTR id is required", 400);

    const email = body.email.toLowerCase();
    const { data: existing } = await db
      .from("event_registrations")
      .select("id")
      .eq("event_id", event.id)
      .eq("email", email)
      .maybeSingle();
    if (existing) return fail("This email is already registered for the event", 409);

    let proofPath: string | null = null;
    if (upload && upload.ok) {
      // Random, unguessable name. Bucket is private; only the admin API signs URLs for it.
      proofPath = `${event.id}/${randomUUID()}.${upload.kind.ext}`;
      const { error: upErr } = await db.storage
        .from(BUCKETS.paymentProofs)
        .upload(proofPath, upload.bytes, { contentType: upload.kind.mime, upsert: false, cacheControl: "0" });
      if (upErr) throw upErr;
    }

    const { error: insErr } = await db.from("event_registrations").insert({
      event_id: event.id,
      name: body.name,
      email,
      phone: body.phone,
      usn: body.usn.toUpperCase(),
      college: body.college,
      branch: body.branch,
      semester: body.semester,
      team_name: body.teamName,
      admin_note: [body.membership && `Membership: ${body.membership}`, body.members && `Team members: ${body.members}`]
        .filter(Boolean)
        .join("\n")
        .slice(0, 1000),
      transaction_id: body.transactionId,
      payment_proof_path: proofPath,
      ip_hash: ipHash,
    });

    if (insErr) {
      if (proofPath) await db.storage.from(BUCKETS.paymentProofs).remove([proofPath]);
      if (insErr.code === "23505") return fail("This email is already registered for the event", 409);
      throw insErr;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("registration failed", error);
    return fail("Could not save your registration. Please try again.", 500);
  }
}
