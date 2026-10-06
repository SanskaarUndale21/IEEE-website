// Shared admin constants and config. Edge safe (used by middleware).

/** Real filesystem routes. Never reachable directly, middleware 404s them. */
export const ADMIN_INTERNAL_PAGE = "/sb-console";
export const ADMIN_INTERNAL_API = "/api/sb-console";

/** Request header middleware stamps on rewritten admin requests. */
export const GATE_HEADER = "x-sb-gate";
export const CSRF_HEADER = "x-csrf-token";

export const SESSION_TTL_SECONDS = 4 * 60 * 60; // absolute lifetime
export const IDLE_TIMEOUT_SECONDS = 30 * 60; // inactivity logout

export const LOGIN_MAX_FAILS_PER_IP = 5;
export const LOGIN_MAX_FAILS_GLOBAL = 50;
export const LOGIN_WINDOW_MINUTES = 15;

const ROUTE_KEY_RE = /^[A-Za-z0-9_-]{40,160}$/;
const ADMIN_ID_RE = /^\d{6,12}$/;

export interface AdminConfig {
  routeKey: string;
  basePath: string;
  sessionSecret: string;
  adminId: string;
  passwordHash: string;
}

/**
 * Returns null unless every admin env var is present and well formed.
 * A half configured admin is treated as no admin at all: the secret path
 * then simply 404s like any other unknown URL.
 */
export function getAdminConfig(): AdminConfig | null {
  const routeKey = process.env.ADMIN_ROUTE_KEY ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";
  const adminId = process.env.ADMIN_IEEE_ID ?? "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";

  if (!ROUTE_KEY_RE.test(routeKey)) return null;
  if (sessionSecret.length < 48) return null;
  if (!ADMIN_ID_RE.test(adminId)) return null;
  if (!passwordHash.startsWith("scrypt:")) return null;

  return { routeKey, basePath: `/${routeKey}`, sessionSecret, adminId, passwordHash };
}

export function sessionCookieName() {
  // __Secure- prefix: browser refuses the cookie unless it came over HTTPS
  return process.env.NODE_ENV === "production" ? "__Secure-sbc" : "sbc";
}
