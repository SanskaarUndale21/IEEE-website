import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  LOGIN_MAX_FAILS_GLOBAL,
  LOGIN_MAX_FAILS_PER_IP,
  LOGIN_WINDOW_MINUTES,
  SESSION_TTL_SECONDS,
  getAdminConfig,
  sessionCookieName,
} from "@/lib/admin/config";
import { clientIp, gateOk, jsonError, sameOrigin, verifyPassword } from "@/lib/admin/auth";
import { hashIp, signSession, uaFingerprint } from "@/lib/admin/session";
import { randomToken, safeEqual } from "@/lib/security/edge-crypto";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  ieeeId: z.string().min(1).max(20),
  password: z.string().min(1).max(256),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const started = Date.now();
  const cfg = getAdminConfig();
  if (!cfg || !(await gateOk(req.headers, cfg))) return new NextResponse("Not Found", { status: 404 });
  if (!sameOrigin(req.headers)) return jsonError("Forbidden", 403);
  if (!supabaseConfigured()) return jsonError("Database not configured", 503);
  if (Number(req.headers.get("content-length") ?? 0) > 2_000) return jsonError("Bad request", 400);

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid credentials", 401);

  const db = getSupabase();
  const ipHash = await hashIp(clientIp(req.headers, req));
  const since = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60_000).toISOString();

  // Lockout: per IP and global (slows a distributed brute force too).
  const [perIp, global] = await Promise.all([
    db
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("success", false)
      .gte("created_at", since),
    db
      .from("admin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("success", false)
      .gte("created_at", since),
  ]);
  if (perIp.error || global.error) return jsonError("Try again later", 503);
  if ((perIp.count ?? 0) >= LOGIN_MAX_FAILS_PER_IP || (global.count ?? 0) >= LOGIN_MAX_FAILS_GLOBAL) {
    return NextResponse.json(
      { error: `Too many failed attempts. Locked for ${LOGIN_WINDOW_MINUTES} minutes.` },
      { status: 429, headers: { "Retry-After": String(LOGIN_WINDOW_MINUTES * 60) } }
    );
  }

  // Always run the expensive hash so a wrong ID and a wrong password take the same time.
  const idOk = safeEqual(parsed.data.ieeeId.trim(), cfg.adminId);
  const pwOk = await verifyPassword(parsed.data.password, cfg.passwordHash);
  const ok = idOk && pwOk;

  await db.from("admin_login_attempts").insert({ ip_hash: ipHash, success: ok });

  if (!ok) {
    // Flatten timing and slow down guessing.
    await sleep(Math.max(0, 900 - (Date.now() - started)) + Math.floor(Math.random() * 300));
    const left = Math.max(0, LOGIN_MAX_FAILS_PER_IP - (perIp.count ?? 0) - 1);
    return jsonError(left > 0 ? `Invalid credentials. ${left} attempt(s) left.` : "Invalid credentials. Locked.", 401);
  }

  // Single active session: a new login kills every older one.
  await db.from("admin_sessions").update({ revoked: true }).eq("admin_id", cfg.adminId).eq("revoked", false);

  const now = Math.floor(Date.now() / 1000);
  const sid = randomUUID();
  const ua = await uaFingerprint(req.headers.get("user-agent"));
  const csrf = randomToken(32);

  const { error } = await db.from("admin_sessions").insert({
    id: sid,
    admin_id: cfg.adminId,
    ua_hash: ua,
    ip_hash: ipHash,
    expires_at: new Date((now + SESSION_TTL_SECONDS) * 1000).toISOString(),
  });
  if (error) return jsonError("Could not start session", 500);

  await db.from("admin_audit_log").insert({ admin_id: cfg.adminId, action: "login", ip_hash: ipHash });

  const token = await signSession(
    { sub: cfg.adminId, sid, csrf, ua, iat: now, exp: now + SESSION_TTL_SECONDS },
    cfg.sessionSecret
  );

  const res = NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  res.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: cfg.basePath,
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
