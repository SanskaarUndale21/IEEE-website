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

    const filePath = path.join(dataDir, "memberships.txt");
    const timestamp = new Date().toISOString();

    const entry = [
      "",
      "=== MEMBERSHIP APPLICATION ===",
      `Timestamp      : ${timestamp}`,
      `Name           : ${body.name ?? ""}`,
      `Email          : ${body.email ?? ""}`,
      `Semester       : ${body.semester ?? ""}`,
      `Branch         : ${body.branch ?? ""}`,
      `Date of Birth  : ${body.dob ?? ""}`,
      `Contact        : ${body.contact ?? ""}`,
      `Sec. Question  : ${body.securityQuestion ?? ""}`,
      `Sec. Answer    : ${body.securityAnswer ?? ""}`,
      "==============================",
      "",
    ].join("\n");

    await appendFile(filePath, entry, "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving membership:", error);
    return NextResponse.json({ success: false, error: "Failed to save" }, { status: 500 });
  }
}
