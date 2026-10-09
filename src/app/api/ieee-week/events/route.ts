import { NextResponse } from "next/server";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Tells the IEEE Week page which events are open for registration.
 * Event rows are named `ieee-week-<slug>` and are managed from the admin panel
 * (turn on Published and Registration open to start taking registrations).
 */
export async function GET() {
  if (!supabaseConfigured()) return NextResponse.json({ events: [] });
  try {
    const { data, error } = await getSupabase()
      .from("events")
      .select("id, slug, fee_amount, payment_instructions, max_registrations")
      .like("slug", "ieee-week-%")
      .eq("published", true)
      .eq("status", "upcoming")
      .eq("registration_open", true);
    if (error) throw error;
    const events = (data ?? []).map((e) => ({
      id: e.id as string,
      slug: String(e.slug).replace(/^ieee-week-/, ""),
      feeAmount: e.fee_amount as number,
      paymentInstructions: (e.payment_instructions as string) ?? "",
    }));
    return NextResponse.json({ events }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("ieee week events failed", error);
    return NextResponse.json({ events: [] });
  }
}
