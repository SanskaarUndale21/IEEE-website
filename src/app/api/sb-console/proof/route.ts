import { NextRequest, NextResponse } from "next/server";
import { audit, jsonError, requireAdmin } from "@/lib/admin/auth";
import { dbError, ok } from "@/lib/admin/api";
import { idSchema } from "@/lib/validation";
import { BUCKETS, getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SIGNED_URL_SECONDS = 120;

/** Short lived signed URL for one payment screenshot. */
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: false });
  if (ctx instanceof NextResponse) return ctx;

  const parsed = idSchema.safeParse({ id: req.nextUrl.searchParams.get("id") });
  if (!parsed.success) return jsonError("Bad request", 400);

  const db = getSupabase();
  const { data: row, error } = await db
    .from("event_registrations")
    .select("payment_proof_path")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (error) return dbError(error);
  if (!row?.payment_proof_path) return jsonError("No payment proof uploaded", 404);

  const { data, error: signErr } = await db.storage
    .from(BUCKETS.paymentProofs)
    .createSignedUrl(row.payment_proof_path, SIGNED_URL_SECONDS);
  if (signErr || !data) return dbError(signErr);

  await audit(ctx, "registration.view_proof", parsed.data.id);
  return ok({ url: data.signedUrl, expiresIn: SIGNED_URL_SECONDS });
}
