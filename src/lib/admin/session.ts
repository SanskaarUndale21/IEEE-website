// Signed session tokens. Edge safe (middleware verifies the signature,
// route handlers additionally check the server side session row).

import { b64urlDecodeToString, b64urlEncode, hmacSha256, safeEqual, sha256 } from "@/lib/security/edge-crypto";

export interface SessionPayload {
  sub: string; // admin IEEE id
  sid: string; // admin_sessions.id
  csrf: string; // per session CSRF token
  ua: string; // user agent fingerprint
  iat: number;
  exp: number;
}

const VERSION = "v1";

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = await hmacSha256(secret, `${VERSION}.${body}`);
  return `${VERSION}.${body}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  uaFingerprint: string
): Promise<SessionPayload | null> {
  if (!token || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== VERSION) return null;

  const expected = await hmacSha256(secret, `${VERSION}.${parts[1]}`);
  if (!safeEqual(expected, parts[2])) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(b64urlDecodeToString(parts[1]));
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    typeof payload?.sub !== "string" ||
    typeof payload.sid !== "string" ||
    typeof payload.csrf !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.iat !== "number"
  ) {
    return null;
  }
  if (payload.exp <= now || payload.iat > now + 60) return null;
  if (!safeEqual(payload.ua, uaFingerprint)) return null;

  return payload;
}

export async function uaFingerprint(userAgent: string | null): Promise<string> {
  return (await sha256(`ua:${userAgent ?? ""}`)).slice(0, 24);
}

/** Value middleware puts in GATE_HEADER. Unforgeable without the secret. */
export function gateToken(secret: string): Promise<string> {
  return hmacSha256(secret, "gate:v1");
}

export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT || process.env.ADMIN_SESSION_SECRET || "ieee-sgbit";
  return (await hmacSha256(salt, `ip:${ip}`)).slice(0, 32);
}
