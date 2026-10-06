import { NextRequest, NextResponse } from "next/server";
import { appendRow, sheetsConfigured } from "@/lib/sheets";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/server";
import { membershipSchema, firstIssue } from "@/lib/validation";
import { tooManyRecent } from "@/lib/security/rate-limit";
import { clientIp, sameOrigin } from "@/lib/admin/auth";
import { hashIp } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const TAB = process.env.GOOGLE_SHEETS_MEMBERS_TAB || "Memberships";
const HEADERS = [
  "Timestamp",
  "Name",
  "Email",
  "Semester",
  "Branch",
  "Date of Birth",
  "Contact",
  "Security Question",
  "Security Answer",
];

export async function POST(req: NextRequest) {
  try {
    if (!sameOrigin(req.headers)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (Number(req.headers.get("content-length") ?? 0) > 16_000) {
      return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
    }

    const parsed = membershipSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: firstIssue(parsed.error) }, { status: 400 });
    }
    const body = parsed.data;

    // Honeypot tripped: pretend success, store nothing.
    if (body.website) return NextResponse.json({ success: true });

    const row = [
      new Date().toISOString(),
      body.name,
      body.email,
      body.semester,
      body.branch,
      body.dob,
      body.contact,
      body.securityQuestion,
      body.securityAnswer,
    ];

    if (supabaseConfigured()) {
      const ipHash = await hashIp(clientIp(req.headers, req));
      if (await tooManyRecent("memberships", ipHash, 60, 5)) {
        return NextResponse.json(
          { success: false, error: "Too many applications from this network. Try again later." },
          { status: 429 }
        );
      }

      const { error } = await getSupabase().from("memberships").insert({
        name: body.name,
        email: body.email.toLowerCase(),
        semester: body.semester,
        branch: body.branch,
        dob: body.dob,
        contact: body.contact,
        security_question: body.securityQuestion,
        security_answer: body.securityAnswer,
        ip_hash: ipHash,
      });
      if (error) throw error;

      // Keep the spreadsheet in sync when it is set up; never fail the request on it.
      if (sheetsConfigured()) {
        appendRow(TAB, HEADERS, row, "memberships.txt").catch((e) => console.error("sheet mirror failed", e));
      }
      return NextResponse.json({ success: true, target: "database" });
    }

    const result = await appendRow(TAB, HEADERS, row, "memberships.txt");
    return NextResponse.json({ success: true, target: result.target });
  } catch (error) {
    console.error("Error saving membership:", error);
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
