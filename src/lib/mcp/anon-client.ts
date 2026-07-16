import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-role Supabase client for the public MCP server.
 * Uses the publishable key, no session persistence, and honours RLS as `anon`.
 * NEVER swap this for the service-role client — MCP tools must inherit the
 * anon boundary so drafts, review queue rows, and ungranted columns stay
 * unreachable.
 */
export function anonSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    // sb_publishable_* keys are opaque — send only apikey, not a Bearer token.
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}