import { NextRequest, NextResponse } from "next/server";
import { audit, requireAdmin } from "@/lib/admin/auth";
import { dbError, ok, parseJson } from "@/lib/admin/api";
import { idSchema, reviewSchema } from "@/lib/validation";
import { BUCKETS, getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: false });
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await getSupabase()
    .from("event_registrations")
    .select(
      "id, event_id, name, email, phone, usn, college, branch, semester, team_name, transaction_id, payment_proof_path, status, admin_note, created_at, reviewed_at, events(title, slug, fee_amount)"
    )
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) return dbError(error);

  // Never hand the raw storage path to the browser, just whether a proof exists.
  const items = (data ?? []).map(({ payment_proof_path, ...rest }) => ({
    ...rest,
    has_proof: Boolean(payment_proof_path),
  }));
  return ok({ items });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, reviewSchema);
  if (body instanceof NextResponse) return body;

  const { error } = await getSupabase()
    .from("event_registrations")
    .update({
      status: body.status,
      admin_note: body.note,
      reviewed_at: body.status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", body.id);
  if (error) return dbError(error);

  await audit(ctx, `registration.${body.status}`, body.id);
  return ok();
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, idSchema);
  if (body instanceof NextResponse) return body;

  const db = getSupabase();
  const { data: row, error: readErr } = await db
    .from("event_registrations")
    .select("payment_proof_path")
    .eq("id", body.id)
    .maybeSingle();
  if (readErr) return dbError(readErr);

  const { error } = await db.from("event_registrations").delete().eq("id", body.id);
  if (error) return dbError(error);

  if (row?.payment_proof_path) {
    await db.storage.from(BUCKETS.paymentProofs).remove([row.payment_proof_path]);
  }

  await audit(ctx, "registration.delete", body.id);
  return ok();
}
