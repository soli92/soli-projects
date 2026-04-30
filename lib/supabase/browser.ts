import { createClient } from "@supabase/supabase-js";

// @supabase/ssr non e' installato: fallback a createClient.
// L'anon key e' pubblica (NEXT_PUBLIC_*).
export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL/ANON_KEY non configurate");
  }

  return createClient(url, key);
}
