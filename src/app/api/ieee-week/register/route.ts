import { NextRequest, NextResponse } from "next/server";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/server";
import { ieeeRegisterSchema, firstIssue } from "@/lib/validation";
import { tooManyRecent } from "@/lib/security/rate-limit";
import { clientIp, sameOrigin } from "@/lib/admin/auth";
import { hashIp } from "@/lib/admin/session";
import { REGISTRABLE } from "@/data/ieeeWeek";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Step 1: save the team. Payment comes later, on its own page. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req.headers)) return fail("Forbidden", 403);
  if (!supabaseConfigured()) return fail("Registrations are not open yet", 503);
  if (Number(req.headers.get("content-length") ?? 0) > 20_000) return fail("Request too large", 413);
  if (!(req.headers.get("content-type") ?? "").startsWith("application/json")) return fail("Bad request", 400);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("Bad request", 400);
  }
  const parsed = ieeeRegisterSchema.safeParse(raw);
  if (!parsed.success) return fail(firstIssue(parsed.error), 400);
  const body = parsed.data;
  if (body.website) return NextResponse.json({ success: true });

  const info = REGISTRABLE.find((e) => e.slug === body.event);
  if (!info) return fail("Unknown event", 404);
  if (body.members.length !== info.teamCount) return fail(`${info.title} needs exactly ${info.teamCount} members`, 400);

  const db = getSupabase();
  try {
    const ipHash = await hashIp(clientIp(req.headers, req));
    if (await tooManyRecent("event_registrations", ipHash, 60, 10)) {
      return fail("Too many registrations from this network. Try again later.", 429);
    }

    const { data: event, error: evErr } = await db
      .from("events")
      .select("id, published, status, registration_open")
      .eq("slug", `ieee-week-${body.event}`)
      .maybeSingle();
    if (evErr) throw evErr;
    if (!event || !event.published || event.status !== "upcoming" || !event.registration_open) {
      return fail("Registrations for this event are closed", 409);
    }

    const lead = body.members[0];
    const note = [
      "[Awaiting payment]",
      ...body.members.map(
        (m, i) => `${i === 0 ? "Lead" : `Member ${i + 1}`}: ${m.name}, ${m.usn.toUpperCase()}, ${m.dept}, year ${m.year}, ${m.phone}`,
      ),
    ]
      .join("\n")
      .slice(0, 1000);

    // The table needs an email. We do not ask for one, so use a stable placeholder per lead phone.
    // That also stops the same lead registering one event twice.
    const digits = lead.phone.replace(/\D/g, "");
    const { data: row, error: insErr } = await db
      .from("event_registrations")
      .insert({
        event_id: event.id,
        name: lead.name,
        email: `${digits}@ieee-week.invalid`,
        phone: lead.phone,
        usn: lead.usn.toUpperCase(),
        college: "",
        branch: lead.dept,
        semester: "",
        team_name: body.teamName,
        transaction_id: "",
        admin_note: note,
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (insErr) {
      if (insErr.code === "23505") return fail("This phone number already has a registration for this event", 409);
      throw insErr;
    }
    return NextResponse.json({ success: true, id: row.id });
  } catch (error) {
    console.error("ieee week registration failed", error);
    return fail("Could not save your registration. Please try again.", 500);
  }
}

/** Minimal read for the next steps: which event, what team, paid or not. No personal details. */
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!UUID.test(id) || !supabaseConfigured()) return fail("Not found", 404);
  const { data, error } = await getSupabase()
    .from("event_registrations")
    .select("team_name, transaction_id, events(slug)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return fail("Not found", 404);
  const ev = data.events as unknown as { slug?: string } | null;
  const slug = String(ev?.slug ?? "").replace(/^ieee-week-/, "");
  if (!slug) return fail("Not found", 404);
  return NextResponse.json(
    { success: true, slug, teamName: data.team_name as string, paid: Boolean(data.transaction_id) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
