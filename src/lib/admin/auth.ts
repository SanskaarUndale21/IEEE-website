import "server-only";
import { scrypt as scryptCb, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { cookies, headers } from "next/headers";
import {
  CSRF_HEADER,
  GATE_HEADER,
  IDLE_TIMEOUT_SECONDS,
  getAdminConfig,
  sessionCookieName,
  type AdminConfig,
} from "./config";
import { gateToken, hashIp, uaFingerprint, verifySessionToken, type SessionPayload } from "./session";
import { safeEqual } from "@/lib/security/edge-crypto";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/server";

// ─── Password hashing ─────────────────────────────────────────────────────
// Format: scrypt:<N>:<r>:<p>:<salt b64url>:<hash b64url>
// (colons, not $, because .env loaders expand $VAR)

function scrypt(password: string, salt: Buffer, keylen: number, opts: { N: number; r: number; p: number }) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCb(password, salt, keylen, { ...opts, maxmem: 256 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const N = Number(n);
  const R = Number(r);
  const P = Number(p);
  if (![N, R, P].every(Number.isInteger) || N < 16384) return false;

  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length, { N, r: R, p: P });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// ─── Request helpers ──────────────────────────────────────────────────────

export function clientIp(h: Headers, req?: NextRequest): string {
  return (
    req?.ip ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0"
  );
}

/** Mutations must come from this exact origin. */
export function sameOrigin(h: Headers): boolean {
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!origin || !host) return false;
  try {
    const o = new URL(origin);
    if (o.host !== host) return false;
  } catch {
    return false;
  }
  const site = h.get("sec-fetch-site");
  return !site || site === "same-origin";
}

export async function gateOk(h: Headers, cfg: AdminConfig): Promise<boolean> {
  const got = h.get(GATE_HEADER);
  return Boolean(got) && safeEqual(got as string, await gateToken(cfg.sessionSecret));
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "cache-control": "no-store" } });
}

// ─── Sessions ─────────────────────────────────────────────────────────────

async function validateServerSession(payload: SessionPayload, cfg: AdminConfig): Promise<boolean> {
  if (!safeEqual(payload.sub, cfg.adminId)) return false;

  const db = getSupabase();
  const { data, error } = await db
    .from("admin_sessions")
    .select("id, admin_id, revoked, expires_at, last_seen, ua_hash")
    .eq("id", payload.sid)
    .maybeSingle();

  if (error || !data) return false;
  if (data.revoked || data.admin_id !== cfg.adminId || data.ua_hash !== payload.ua) return false;

  const now = Date.now();
  if (new Date(data.expires_at).getTime() <= now) return false;
  if (now - new Date(data.last_seen).getTime() > IDLE_TIMEOUT_SECONDS * 1000) {
    await db.from("admin_sessions").update({ revoked: true }).eq("id", payload.sid);
    return false;
  }

  await db.from("admin_sessions").update({ last_seen: new Date(now).toISOString() }).eq("id", payload.sid);
  return true;
}

export interface AdminContext {
  cfg: AdminConfig;
  session: SessionPayload;
  ipHash: string;
}

/**
 * Guard for every admin API handler. Returns the context or a ready to send
 * error response. Checks, in order: middleware gate, origin (mutations),
 * signed cookie, database session (revocation + idle timeout), CSRF token.
 */
export async function requireAdmin(
  req: NextRequest,
  opts: { mutation: boolean }
): Promise<AdminContext | NextResponse> {
  const cfg = getAdminConfig();
  if (!cfg || !(await gateOk(req.headers, cfg))) return new NextResponse("Not Found", { status: 404 });
  if (!supabaseConfigured()) return jsonError("Database not configured", 503);

  if (opts.mutation && !sameOrigin(req.headers)) return jsonError("Forbidden", 403);

  const session = await verifySessionToken(
    req.cookies.get(sessionCookieName())?.value,
    cfg.sessionSecret,
    await uaFingerprint(req.headers.get("user-agent"))
  );
  if (!session || !(await validateServerSession(session, cfg))) return jsonError("Session expired", 401);

  if (opts.mutation) {
    const csrf = req.headers.get(CSRF_HEADER);
    if (!csrf || !safeEqual(csrf, session.csrf)) return jsonError("Forbidden", 403);
  }

  return { cfg, session, ipHash: await hashIp(clientIp(req.headers, req)) };
}

/** For the admin page server component. */
export async function getPageSession(): Promise<
  { cfg: AdminConfig; session: SessionPayload | null } | null
> {
  const cfg = getAdminConfig();
  const h = headers();
  if (!cfg || !(await gateOk(h, cfg))) return null;
  if (!supabaseConfigured()) return { cfg, session: null };

  const session = await verifySessionToken(
    cookies().get(sessionCookieName())?.value,
    cfg.sessionSecret,
    await uaFingerprint(h.get("user-agent"))
  );
  if (!session || !(await validateServerSession(session, cfg))) return { cfg, session: null };
  return { cfg, session };
}

export async function audit(ctx: AdminContext, action: string, target = "", meta: Record<string, unknown> = {}) {
  try {
    await getSupabase().from("admin_audit_log").insert({
      admin_id: ctx.session.sub,
      action,
      target,
      meta,
      ip_hash: ctx.ipHash,
    });
  } catch (e) {
    console.error("audit log failed", e);
  }
}
