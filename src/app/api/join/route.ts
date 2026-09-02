import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/sheets";

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
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    const row = [
      new Date().toISOString(),
      body.name ?? "",
      body.email ?? "",
      body.semester ?? "",
      body.branch ?? "",
      body.dob ?? "",
      body.contact ?? "",
      body.securityQuestion ?? "",
      body.securityAnswer ?? "",
    ];

    const result = await appendRow(TAB, HEADERS, row, "memberships.txt");

    return NextResponse.json({ success: true, target: result.target });
  } catch (error) {
    console.error("Error saving membership:", error);
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
