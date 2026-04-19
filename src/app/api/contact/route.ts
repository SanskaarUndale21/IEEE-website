import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dataDir = path.join(process.cwd(), "data");

    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "queries.txt");
    const timestamp = new Date().toISOString();

    const entry = [
      "",
      "=== QUERY SUBMISSION ===",
      `Timestamp : ${timestamp}`,
      `Email     : ${body.email ?? ""}`,
      `Phone     : ${body.phone ?? ""}`,
      `Topic     : ${body.topic ?? ""}`,
      "========================",
      "",
    ].join("\n");

    await appendFile(filePath, entry, "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving query:", error);
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
