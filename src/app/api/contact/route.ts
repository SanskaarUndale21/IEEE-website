import { NextRequest, NextResponse } from "next/server";
import { appendRow, sheetsConfigured } from "@/lib/sheets";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/server";
import { querySchema, firstIssue } from "@/lib/validation";
import { tooManyRecent } from "@/lib/security/rate-limit";
import { clientIp, sameOrigin } from "@/lib/admin/auth";
import { hashIp } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const TAB = process.env.GOOGLE_SHEETS_QUERIES_TAB || "Queries";
const HEADERS = ["Timestamp", "Email", "Phone", "Topic"];

export async function POST(req: NextRequest) {
  try {
    if (!sameOrigin(req.headers)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (Number(req.headers.get("content-length") ?? 0) > 16_000) {
      return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
    }

    const parsed = querySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: firstIssue(parsed.error) }, { status: 400 });
    }
    const body = parsed.data;
    if (body.website) return NextResponse.json({ success: true });

    const row = [new Date().toISOString(), body.email, body.phone, body.topic];

    if (supabaseConfigured()) {
      const ipHash = await hashIp(clientIp(req.headers, req));
      if (await tooManyRecent("queries", ipHash, 60, 10)) {
        return NextResponse.json(
          { success: false, error: "Too many messages from this network. Try again later." },
          { status: 429 }
        );
      }

      const { error } = await getSupabase().from("queries").insert({
        email: body.email.toLowerCase(),
        phone: body.phone,
        topic: body.topic,
        ip_hash: ipHash,
      });
      if (error) throw error;

      if (sheetsConfigured()) {
        appendRow(TAB, HEADERS, row, "queries.txt").catch((e) => console.error("sheet mirror failed", e));
      }
      return NextResponse.json({ success: true, target: "database" });
    }

    const result = await appendRow(TAB, HEADERS, row, "queries.txt");
    return NextResponse.json({ success: true, target: result.target });
  } catch (error) {
    console.error("Error saving query:", error);
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
