import { NextRequest, NextResponse } from "next/server";
import { audit, requireAdmin } from "@/lib/admin/auth";
import { sessionCookieName } from "@/lib/admin/config";
import { getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;

  await getSupabase().from("admin_sessions").update({ revoked: true }).eq("id", ctx.session.sid);
  await audit(ctx, "logout");

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: ctx.cfg.basePath,
    maxAge: 0,
  });
  return res;
}
