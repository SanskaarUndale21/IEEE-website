import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service role client. Bypasses RLS, so it must only ever run on the server.
// The `server-only` import makes the build fail if a client component pulls it in.

let client: SupabaseClient | null = null;

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      headers: { "x-application-name": "ieee-sgbit-website" },
      // Never let the Next.js data cache hold on to database rows.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return client;
}

export const BUCKETS = {
  paymentProofs: "payment-proofs",
  eventImages: "event-images",
} as const;
