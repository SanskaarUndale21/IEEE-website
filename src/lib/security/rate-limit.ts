import "server-only";
import { getSupabase } from "@/lib/supabase/server";

/**
 * Durable per-IP rate limit backed by the submission table itself
 * (works across serverless instances, unlike an in-memory counter).
 */
export async function tooManyRecent(
  table: "memberships" | "queries" | "event_registrations",
  ipHash: string,
  windowMinutes: number,
  max: number
): Promise<boolean> {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { count, error } = await getSupabase()
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (error) throw error;
  return (count ?? 0) >= max;
}
