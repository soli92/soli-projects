import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client (service role).
 * Lazy init: client creato al primo uso, non a top-level.
 * Pattern coerente con soli-prof per evitare crash al build.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("SUPABASE_URL non configurata");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurata");

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

/**
 * SOLO per test: resetta il client cached (per stub env vars).
 */
export function resetSupabaseAdmin(): void {
  cachedClient = null;
}
