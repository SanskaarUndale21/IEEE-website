import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { dbError, ok } from "@/lib/admin/api";
import { getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: false });
  if (ctx instanceof NextResponse) return ctx;

  const db = getSupabase();
  const head = { count: "exact" as const, head: true };

  const [members, queries, regs, upcoming, auditLog] = await Promise.all([
    db.from("memberships").select("id", head).eq("status", "pending"),
    db.from("queries").select("id", head).eq("status", "open"),
    db.from("event_registrations").select("id", head).eq("status", "pending"),
    db.from("events").select("id", head).eq("status", "upcoming"),
    db.from("admin_audit_log").select("id, action, target, created_at").order("created_at", { ascending: false }).limit(25),
  ]);

  const err = members.error || queries.error || regs.error || upcoming.error || auditLog.error;
  if (err) return dbError(err);

  return ok({
    pendingMemberships: members.count ?? 0,
    openQueries: queries.count ?? 0,
    pendingRegistrations: regs.count ?? 0,
    upcomingEvents: upcoming.count ?? 0,
    audit: auditLog.data ?? [],
  });
}
