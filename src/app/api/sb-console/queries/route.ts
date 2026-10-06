import { NextRequest, NextResponse } from "next/server";
import { audit, requireAdmin } from "@/lib/admin/auth";
import { dbError, ok, parseJson } from "@/lib/admin/api";
import { idSchema, queryStatusSchema } from "@/lib/validation";
import { getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: false });
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await getSupabase()
    .from("queries")
    .select("id, email, phone, topic, status, created_at, resolved_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) return dbError(error);
  return ok({ items: data });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, queryStatusSchema);
  if (body instanceof NextResponse) return body;

  const { error } = await getSupabase()
    .from("queries")
    .update({ status: body.status, resolved_at: body.status === "resolved" ? new Date().toISOString() : null })
    .eq("id", body.id);
  if (error) return dbError(error);

  await audit(ctx, `query.${body.status}`, body.id);
  return ok();
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, idSchema);
  if (body instanceof NextResponse) return body;

  const { error } = await getSupabase().from("queries").delete().eq("id", body.id);
  if (error) return dbError(error);

  await audit(ctx, "query.delete", body.id);
  return ok();
}
