import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/sheets";

export const dynamic = "force-dynamic";

const TAB = process.env.GOOGLE_SHEETS_QUERIES_TAB || "Queries";
const HEADERS = ["Timestamp", "Email", "Phone", "Topic"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.email && !body.phone) {
      return NextResponse.json({ success: false, error: "Missing contact details" }, { status: 400 });
    }

    const row = [
      new Date().toISOString(),
      body.email ?? "",
      body.phone ?? "",
      body.topic ?? "",
    ];

    const result = await appendRow(TAB, HEADERS, row, "queries.txt");

    return NextResponse.json({ success: true, target: result.target });
  } catch (error) {
    console.error("Error saving query:", error);
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
