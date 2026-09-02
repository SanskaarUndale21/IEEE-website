import { google } from "googleapis";
import { appendFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g, "\n");

  if (!spreadsheetId || !clientEmail || !privateKey) return null;
  return { spreadsheetId, clientEmail, privateKey };
}

export function sheetsConfigured() {
  return getConfig() !== null;
}

async function getClient(clientEmail: string, privateKey: string) {
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });
  return google.sheets({ version: "v4", auth });
}

// Creates the tab and writes the header row if the tab does not exist yet.
async function ensureSheet(
  sheets: any,
  spreadsheetId: string,
  tab: string,
  headers: string[]
) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s: any) => s.properties?.title === tab);
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [headers] },
  });
}

/**
 * Appends one row to a tab of the configured spreadsheet.
 * Falls back to a local text file when the Google credentials are missing
 * (local dev), so submissions are never silently dropped.
 */
export async function appendRow(
  tab: string,
  headers: string[],
  row: (string | number)[],
  fallbackFile: string
) {
  const config = getConfig();

  if (!config) {
    await writeFallback(fallbackFile, headers, row);
    return { ok: true, target: "file" as const };
  }

  const sheets = await getClient(config.clientEmail, config.privateKey);
  await ensureSheet(sheets, config.spreadsheetId, tab, headers);

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });

  return { ok: true, target: "sheet" as const };
}

async function writeFallback(fallbackFile: string, headers: string[], row: (string | number)[]) {
  const dataDir = path.join(process.cwd(), "data");
  if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });

  const entry =
    "\n" +
    headers.map((h, i) => `${h.padEnd(16)}: ${row[i] ?? ""}`).join("\n") +
    "\n" +
    "-".repeat(40) +
    "\n";

  await appendFile(path.join(process.cwd(), "data", fallbackFile), entry, "utf8");
}
