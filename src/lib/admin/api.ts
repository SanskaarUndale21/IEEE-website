import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { ZodSchema } from "zod";
import { firstIssue } from "@/lib/validation";
import { jsonError } from "./auth";

/** Parse a small JSON body against a schema. Returns data or an error response. */
export async function parseJson<T>(req: NextRequest, schema: ZodSchema<T>, maxBytes = 32_000): Promise<T | NextResponse> {
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes) return jsonError("Payload too large", 413);
  if (!(req.headers.get("content-type") ?? "").startsWith("application/json")) return jsonError("Bad request", 400);

  const raw = await req.text();
  if (raw.length > maxBytes) return jsonError("Payload too large", 413);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return jsonError("Bad request", 400);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return jsonError(firstIssue(parsed.error), 400);
  return parsed.data;
}

export function ok(data: unknown = { ok: true }) {
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}

export function dbError(e: unknown) {
  console.error("admin db error", e);
  return jsonError("Database error", 500);
}
