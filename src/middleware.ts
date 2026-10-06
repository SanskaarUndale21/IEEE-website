import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_INTERNAL_API,
  ADMIN_INTERNAL_PAGE,
  GATE_HEADER,
  getAdminConfig,
  sessionCookieName,
} from "@/lib/admin/config";
import { gateToken, uaFingerprint, verifySessionToken } from "@/lib/admin/session";
import { randomToken } from "@/lib/security/edge-crypto";

const isDev = process.env.NODE_ENV !== "production";

function notFound() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

function supabaseOrigin() {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "";
  } catch {
    return "";
  }
}

function adminPageCsp(nonce: string) {
  const supa = supabaseOrigin();
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supa}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

function hardenAdminResponse(res: NextResponse, csp: string) {
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never trust a gate header coming from the outside world.
  const headers = new Headers(req.headers);
  headers.delete(GATE_HEADER);

  // The real admin routes are only reachable through the secret path below.
  const lower = pathname.toLowerCase();
  if (
    lower === ADMIN_INTERNAL_PAGE ||
    lower.startsWith(`${ADMIN_INTERNAL_PAGE}/`) ||
    lower === ADMIN_INTERNAL_API ||
    lower.startsWith(`${ADMIN_INTERNAL_API}/`)
  ) {
    return notFound();
  }

  const cfg = getAdminConfig();
  if (cfg && (pathname === cfg.basePath || pathname.startsWith(`${cfg.basePath}/`))) {
    const rest = pathname.slice(cfg.basePath.length);
    headers.set(GATE_HEADER, await gateToken(cfg.sessionSecret));

    // Admin page
    if (rest === "") {
      const nonce = randomToken(16);
      const csp = adminPageCsp(nonce);
      headers.set("x-nonce", nonce);
      // Next reads the nonce from this request header and stamps its scripts.
      headers.set("Content-Security-Policy", csp);

      const url = req.nextUrl.clone();
      url.pathname = ADMIN_INTERNAL_PAGE;
      return hardenAdminResponse(NextResponse.rewrite(url, { request: { headers } }), csp);
    }

    // Admin API
    if (rest.startsWith("/api/") && /^\/api\/[a-z-]+(\/[a-z-]+)?$/.test(rest)) {
      const apiCsp = "default-src 'none'; frame-ancestors 'none'";

      // Everything except login needs a validly signed session before it
      // even reaches the handler (handlers re-check against the database).
      if (rest !== "/api/login") {
        const token = req.cookies.get(sessionCookieName())?.value;
        const session = await verifySessionToken(
          token,
          cfg.sessionSecret,
          await uaFingerprint(req.headers.get("user-agent"))
        );
        if (!session) {
          return hardenAdminResponse(
            NextResponse.json({ error: "Session expired" }, { status: 401 }),
            apiCsp
          );
        }
      }

      const url = req.nextUrl.clone();
      url.pathname = ADMIN_INTERNAL_API + rest.slice("/api".length);
      return hardenAdminResponse(NextResponse.rewrite(url, { request: { headers } }), apiCsp);
    }

    return notFound();
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|favicon.ico|icon.png).*)"],
};
