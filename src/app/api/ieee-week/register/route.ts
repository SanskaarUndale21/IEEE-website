import { NextRequest, NextResponse } from "next/server";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/server";
import { ieeeRegisterSchema, firstIssue } from "@/lib/validation";
import { tooManyRecent } from "@/lib/security/rate-limit";
import { clientIp, sameOrigin } from "@/lib/admin/auth";
import { hashIp } from "@/lib/admin/session";
import { REGISTRABLE } from "@/data/ieeeWeek";
import { eventsOnSameDay, normalizePhone, normalizeUsn, peopleOnRegistration } from "@/lib/ieeeWeekRules";
import { publicState, type RegRow } from "@/lib/ieeeWeekState";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REG_COLUMNS = "id, status, transaction_id, admin_note, team_name, created_at, reviewed_at, usn";

/**
 * Step 1: save the team, or pick up the one already saved.
 *
 * The lead's phone number identifies a registration for an event (the table has a unique
 * key on event + that identity). If the same lead comes back, for example after paying in
 * another app and reloading, we return their existing registration so the pages can resume
 * at the right step. Nothing is created twice.
 */
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
  if (!parsed.success) return fail(firstIssue(parsed.error).replace(/^[\w.]+: /, ""), 400);
  const body = parsed.data;
  if (body.website) return NextResponse.json({ success: true });

  const info = REGISTRABLE.find((e) => e.slug === body.event);
  if (!info) return fail("Unknown event", 404);
  if (body.members.length !== info.teamCount) return fail(`${info.title} needs exactly ${info.teamCount} members`, 400);

  const db = getSupabase();
  const lead = body.members[0];
  const leadEmail = `${lead.phone.replace(/\D/g, "")}@ieee-week.invalid`;

  /** The lead's own registration for this event, if any. */
  const findOwn = async (eventId: string) => {
    const { data, error } = await db
      .from("event_registrations")
      .select(REG_COLUMNS)
      .eq("event_id", eventId)
      .eq("email", leadEmail)
      .maybeSingle();
    if (error) throw error;
    return data as (RegRow & { usn: string }) | null;
  };

  /** Resume only when the USN matches too, so a phone number alone cannot open someone else's registration. */
  const resume = (row: RegRow & { usn: string }) => {
    if (normalizeUsn(row.usn) !== lead.usn) {
      return fail("This phone number is already used for a registration for this event under a different USN. Use the same USN and phone you registered with.", 409);
    }
    return NextResponse.json({ success: true, resumed: true, ...publicState(row, body.event) }, { headers: { "Cache-Control": "no-store" } });
  };

  try {
    const { data: event, error: evErr } = await db
      .from("events")
      .select("id, published, status, registration_open")
      .eq("slug", `ieee-week-${body.event}`)
      .maybeSingle();
    if (evErr) throw evErr;
    if (!event) return fail("Registrations for this event are closed", 409);

    // Already registered? Resume, even if registration has closed since: they only need to finish paying.
    const existing = await findOwn(event.id as string);
    if (existing) return resume(existing);

    const ipHash = await hashIp(clientIp(req.headers, req));
    if (await tooManyRecent("event_registrations", ipHash, 60, 10)) {
      return fail("Too many registrations from this network. Try again later.", 429);
    }

    if (!event.published || event.status !== "upcoming" || !event.registration_open) {
      return fail("Registrations for this event are closed", 409);
    }

    // One person, one event per day: events on the same day run in parallel.
    const sameDay = eventsOnSameDay(body.event);
    const { data: dayEvents, error: dayErr } = await db
      .from("events")
      .select("id, slug")
      .in("slug", sameDay.map((e) => `ieee-week-${e.slug}`));
    if (dayErr) throw dayErr;
    const slugById = new Map((dayEvents ?? []).map((e) => [e.id as string, String(e.slug).replace(/^ieee-week-/, "")]));
    if (slugById.size > 0) {
      const { data: regs, error: regErr } = await db
        .from("event_registrations")
        .select("event_id, name, usn, phone, admin_note")
        .in("event_id", Array.from(slugById.keys()))
        .neq("status", "rejected");
      if (regErr) throw regErr;
      for (const reg of regs ?? []) {
        const people = peopleOnRegistration(reg);
        for (const m of body.members) {
          const hit = people.find((p) => (p.usn && p.usn === m.usn) || (p.phone && p.phone === m.phone));
          if (!hit) continue;
          const other = REGISTRABLE.find((e) => e.slug === slugById.get(reg.event_id as string));
          // Our own registration, created a moment ago by a parallel request: resume it, it is not a clash.
          if (other?.slug === body.event && normalizeUsn(String(reg.usn ?? "")) === lead.usn && normalizePhone(String(reg.phone ?? "")) === lead.phone) {
            const own = await findOwn(event.id as string);
            if (own) return resume(own);
          }
          if (other?.slug === body.event) {
            return fail(`${m.name} (${m.usn}) is already in a team registered for ${other.title}. The team lead can continue that registration with the same phone number and USN.`, 409);
          }
          return fail(
            `${m.name} (${m.usn}) is already registered for ${other?.title ?? "another event"} on ${info.day}-10-26. Events on the same day run at the same time, so a person can join only one of them.`,
            409,
          );
        }
      }
    }

    const note = [
      "[Awaiting payment]",
      ...body.members.map(
        (m, i) => `${i === 0 ? "Lead" : `Member ${i + 1}`}: ${m.name}, ${m.usn.toUpperCase()}, ${m.dept}, year ${m.year}, ${m.phone}`,
      ),
    ]
      .join("\n")
      .slice(0, 1000);

    const { data: row, error: insErr } = await db
      .from("event_registrations")
      .insert({
        event_id: event.id,
        name: lead.name,
        email: leadEmail,
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
      .select(REG_COLUMNS)
      .single();

    if (insErr) {
      // Two requests raced and the other won. The database key guarantees only one row exists, so pick it up.
      if (insErr.code === "23505") {
        const winner = await findOwn(event.id as string);
        if (winner) return resume(winner);
        return fail("This phone number already has a registration for this event", 409);
      }
      throw insErr;
    }
    return NextResponse.json({ success: true, resumed: false, ...publicState(row as RegRow, body.event) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("ieee week registration failed", error);
    return fail("Could not save your registration. Please try again.", 500);
  }
}

/**
 * Current state of one registration, read from the database every time.
 * The registration id is an unguessable UUID, so holding it is the authorisation.
 * Only the team name and payment state come back, never members or phone numbers.
 */
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!UUID.test(id) || !supabaseConfigured()) return fail("Not found", 404);
  const { data, error } = await getSupabase()
    .from("event_registrations")
    .select(`${REG_COLUMNS}, events(slug)`)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return fail("Not found", 404);
  const ev = data.events as unknown as { slug?: string } | null;
  const slug = String(ev?.slug ?? "").replace(/^ieee-week-/, "");
  if (!slug) return fail("Not found", 404);
  return NextResponse.json({ success: true, ...publicState(data as unknown as RegRow, slug) }, { headers: { "Cache-Control": "no-store" } });
}
