import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "@linktrend/shared-config";
import { getSupabasePublicOrThrow } from "@linktrend/shared-config";

/** Browser / server components: anon key + RLS (configure policies in Supabase). */
export function createSupabaseBrowserClient(env: Env): SupabaseClient {
  const { url, publishableKey } = getSupabasePublicOrThrow(env);
  return createClient(url, publishableKey);
}

/** Server-only: service role bypasses RLS — never expose to the browser bundle. */
export function createSupabaseServiceClient(env: Env): SupabaseClient {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type { SupabaseClient };
