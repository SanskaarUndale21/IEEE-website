import { NextRequest, NextResponse } from "next/server";
import { audit, requireAdmin } from "@/lib/admin/auth";
import { dbError, ok, parseJson } from "@/lib/admin/api";
import { eventSchema, eventUpdateSchema, idSchema } from "@/lib/validation";
import { getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: false });
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await getSupabase()
    .from("events")
    .select("*")
    .order("status", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) return dbError(error);
  return ok({ items: data });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, eventSchema, 64_000);
  if (body instanceof NextResponse) return body;

  const { data, error } = await getSupabase().from("events").insert(body).select("id").single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return dbError(error);
  }
  await audit(ctx, "event.create", data.id, { slug: body.slug });
  return ok({ id: data.id });
}

export async function PUT(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, eventUpdateSchema, 64_000);
  if (body instanceof NextResponse) return body;

  const { id, ...fields } = body;
  const { error } = await getSupabase().from("events").update(fields).eq("id", id);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return dbError(error);
  }
  await audit(ctx, "event.update", id, { slug: fields.slug });
  return ok();
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;
  const body = await parseJson(req, idSchema);
  if (body instanceof NextResponse) return body;

  const db = getSupabase();
  // Remove payment proofs of the cascaded registrations too.
  const { data: regs } = await db
    .from("event_registrations")
    .select("payment_proof_path")
    .eq("event_id", body.id)
    .not("payment_proof_path", "is", null);

  const { error } = await db.from("events").delete().eq("id", body.id);
  if (error) return dbError(error);

  const paths = (regs ?? []).map((r) => r.payment_proof_path as string);
  if (paths.length) await db.storage.from("payment-proofs").remove(paths);

  await audit(ctx, "event.delete", body.id);
  return ok();
}
