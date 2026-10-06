import { NextRequest, NextResponse } from "next/server";
import { audit, requireAdmin } from "@/lib/admin/auth";
import { dbError, ok, parseJson } from "@/lib/admin/api";
import { idSchema, reviewSchema } from "@/lib/validation";
import { getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COLUMNS =
  "id, name, email, semester, branch, dob, contact, security_question, security_answer, status, admin_note, created_at, reviewed_at";

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: false });
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await getSupabase()
    .from("memberships")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) return dbError(error);
  return ok({ items: data });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, reviewSchema);
  if (body instanceof NextResponse) return body;

  const { error } = await getSupabase()
    .from("memberships")
    .update({
      status: body.status,
      admin_note: body.note,
      reviewed_at: body.status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", body.id);
  if (error) return dbError(error);

  await audit(ctx, `membership.${body.status}`, body.id);
  return ok();
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, idSchema);
  if (body instanceof NextResponse) return body;

  const { error } = await getSupabase().from("memberships").delete().eq("id", body.id);
  if (error) return dbError(error);

  await audit(ctx, "membership.delete", body.id);
  return ok();
}
