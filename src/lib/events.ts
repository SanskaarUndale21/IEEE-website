import "server-only";
import { events as staticEvents } from "@/data/events";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/server";

export interface SiteEvent {
  id: string | null;
  slug: string;
  number: string;
  title: string;
  date: string;
  eventDate: string | null;
  venue: string;
  description: string;
  longDescription: string;
  tags: string[];
  image: string;
  gallery: string[];
  status: "upcoming" | "past";
  registrationOpen: boolean;
  feeAmount: number;
  paymentInstructions: string;
  spotsLeft: number | null;
}

const PUBLIC_COLUMNS =
  "id, slug, title, date_label, event_date, venue, description, long_description, tags, image_url, gallery, status, registration_open, fee_amount, payment_instructions, max_registrations, sort_order";

const FALLBACK_IMAGE = "/images/events_background.jpg";

function fromStatic(): SiteEvent[] {
  return staticEvents.map((e) => ({
    id: null,
    slug: e.slug,
    number: e.number,
    title: e.title,
    date: e.date,
    eventDate: null,
    venue: "",
    description: e.description,
    longDescription: e.longDescription,
    tags: e.tags,
    image: e.image,
    gallery: e.gallery ?? [],
    status: "past",
    registrationOpen: false,
    feeAmount: 0,
    paymentInstructions: "",
    spotsLeft: null,
  }));
}

function fromRow(row: any, index: number, approvedCount = 0): SiteEvent {
  return {
    id: row.id,
    slug: row.slug,
    number: String(index + 1).padStart(2, "0"),
    title: row.title,
    date: row.date_label,
    eventDate: row.event_date,
    venue: row.venue,
    description: row.description,
    longDescription: row.long_description,
    tags: row.tags ?? [],
    image: row.image_url || FALLBACK_IMAGE,
    gallery: row.gallery ?? [],
    status: row.status,
    registrationOpen: row.registration_open,
    feeAmount: row.fee_amount,
    paymentInstructions: row.payment_instructions,
    spotsLeft: row.max_registrations == null ? null : Math.max(0, row.max_registrations - approvedCount),
  };
}

/** Published events, newest sort first. Falls back to the bundled list without a database. */
export async function getEvents(status: "upcoming" | "past"): Promise<SiteEvent[]> {
  if (!supabaseConfigured()) return status === "past" ? fromStatic() : [];

  const query = getSupabase()
    .from("events")
    .select(PUBLIC_COLUMNS)
    .eq("published", true)
    .eq("status", status)
    .order("sort_order", { ascending: true })
    .order("event_date", { ascending: status === "upcoming", nullsFirst: false });

  const { data, error } = await query;
  if (error) {
    console.error("events query failed", error);
    return status === "past" ? fromStatic() : [];
  }
  return (data ?? []).map((row, i) => fromRow(row, i));
}

export async function getEventBySlug(slug: string): Promise<{ event: SiteEvent; siblings: SiteEvent[] } | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return null;

  if (!supabaseConfigured()) {
    const list = fromStatic();
    const event = list.find((e) => e.slug === slug);
    return event ? { event, siblings: list } : null;
  }

  const db = getSupabase();
  const { data, error } = await db
    .from("events")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;

  let taken = 0;
  if (data.max_registrations != null) {
    const { count } = await db
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", data.id)
      .neq("status", "rejected");
    taken = count ?? 0;
  }

  const siblings = await getEvents(data.status);
  const index = Math.max(0, siblings.findIndex((e) => e.slug === slug));
  return { event: fromRow(data, index, taken), siblings };
}
