/**
 * v4.7 — Product Cache (server-only).
 *
 * The Stylist Engine consults this cache BEFORE issuing any external
 * Firecrawl request. Hits are returned as pre-filled slot candidates;
 * misses fall through to the existing affiliate / firecrawl stages.
 *
 * Write policy (per Founder direction):
 *   - Only products from APPROVED retailers may enter the cache.
 *   - Quality gate: founder_approved OR published OR editorial_score ≥
 *     CACHE_MIN_EDITORIAL_SCORE. Everything below is dropped — we do not
 *     archive every Firecrawl discovery.
 *
 * Lifecycle:
 *   - healthy  → verified within 30 days
 *   - stale    → verified 30–60 days ago
 *   - cold     → never reused AND discovered > 60 days ago
 *   - broken   → set by external verifier when a URL returns 404/410
 *
 * Server-only by filename; never import from a route or component.
 */

import {
  APPROVED_RETAILER_HOSTS,
  CACHE_MIN_EDITORIAL_SCORE,
  isApprovedRetailerHost,
} from "./discovery-pipeline";

export type CacheQualitySource =
  | "founder_approved"
  | "published"
  | "quality_threshold"
  | "discovered"; // never written for "discovered" alone — gate rejects

export type CachedCandidate = {
  canonical_url: string;
  retailer: string | null;
  brand: string;
  brand_id: string | null;
  slot_category: string;
  product_name: string | null;
  image_url: string | null;
  price: number | null;
  currency: string | null;
  destination_tags: string[];
  activity_tags: string[];
  editorial_score: number;
  inventory_health: "healthy" | "stale" | "cold" | "broken";
  last_verified_at: string;
};

export type CacheUpsertInput = {
  canonical_url: string;
  retailer: string | null;
  brand: string;
  brand_id?: string | null;
  slot_category: string;
  product_name?: string | null;
  image_url?: string | null;
  price?: number | null;
  currency?: string | null;
  destination_tags?: string[];
  activity_tags?: string[];
  editorial_score: number;
  /**
   * Hint to the gate. Most engine candidates are "discovered" — the
   * gate then promotes them to "quality_threshold" if score ≥ floor.
   * Pass "founder_approved" or "published" to bypass the score floor.
   */
  quality_source?: CacheQualitySource;
};

/**
 * Look up cached candidates for a slot. Returns healthy + stale rows
 * matching the slot category and at least one destination/activity tag.
 * Cold and broken rows are NEVER returned.
 */
export async function lookupCache(args: {
  slot: string;
  destination: string;
  activity: string;
  brands?: string[];
  limit?: number;
}): Promise<CachedCandidate[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const destKey = args.destination.toLowerCase();
  const actKey = args.activity.toLowerCase();

  let query = supabaseAdmin
    .from("product_cache" as never)
    .select(
      "canonical_url,retailer,brand,brand_id,slot_category,product_name,image_url,price,currency,destination_tags,activity_tags,editorial_score,inventory_health,last_verified_at",
    )
    .eq("slot_category", args.slot)
    .in("inventory_health", ["healthy", "stale"])
    .order("editorial_score", { ascending: false })
    .limit(args.limit ?? 60);

  if (args.brands && args.brands.length) {
    query = query.in("brand", args.brands);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await query) as any;
  if (error) {
    console.warn("[product-cache] lookup failed:", error.message);
    return [];
  }

  // Final filter: destination OR activity must match (string contains, case-insensitive).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[])
    .filter((row) => {
      const dests = (row.destination_tags ?? []).map((t: string) => t.toLowerCase());
      const acts = (row.activity_tags ?? []).map((t: string) => t.toLowerCase());
      return dests.includes(destKey) || acts.includes(actKey);
    })
    .map(
      (row): CachedCandidate => ({
        canonical_url: row.canonical_url,
        retailer: row.retailer ?? null,
        brand: row.brand,
        brand_id: row.brand_id ?? null,
        slot_category: row.slot_category,
        product_name: row.product_name ?? null,
        image_url: row.image_url ?? null,
        price: row.price ?? null,
        currency: row.currency ?? null,
        destination_tags: row.destination_tags ?? [],
        activity_tags: row.activity_tags ?? [],
        editorial_score: Number(row.editorial_score ?? 0),
        inventory_health: row.inventory_health ?? "healthy",
        last_verified_at: row.last_verified_at,
      }),
    );
}

/**
 * Write quality-gated rows to the cache.
 *
 * Drops silently:
 *   - any row from a non-approved retailer (regardless of score)
 *   - any "discovered" row below CACHE_MIN_EDITORIAL_SCORE
 *
 * Returns counts so the engine can report write rate.
 */
export async function upsertCache(
  rows: CacheUpsertInput[],
): Promise<{ written: number; rejected: number; rejectedReasons: Record<string, number> }> {
  const rejectedReasons: Record<string, number> = {};
  const bump = (k: string) => (rejectedReasons[k] = (rejectedReasons[k] ?? 0) + 1);

  const eligible: Array<Record<string, unknown>> = [];
  for (const r of rows) {
    if (!isApprovedRetailerHost(r.retailer ?? "")) {
      bump("retailer_not_approved");
      continue;
    }
    const source: CacheQualitySource = r.quality_source ?? "discovered";
    const passesQuality =
      source === "founder_approved" ||
      source === "published" ||
      r.editorial_score >= CACHE_MIN_EDITORIAL_SCORE;
    if (!passesQuality) {
      bump("below_quality_threshold");
      continue;
    }
    const resolvedSource: CacheQualitySource =
      source === "discovered" ? "quality_threshold" : source;
    eligible.push({
      canonical_url: r.canonical_url,
      retailer: r.retailer ?? null,
      brand: r.brand,
      brand_id: r.brand_id ?? null,
      slot_category: r.slot_category,
      product_name: r.product_name ?? null,
      image_url: r.image_url ?? null,
      price: r.price ?? null,
      currency: r.currency ?? null,
      destination_tags: r.destination_tags ?? [],
      activity_tags: r.activity_tags ?? [],
      editorial_score: r.editorial_score,
      quality_source: resolvedSource,
      inventory_health: "healthy",
      last_verified_at: new Date().toISOString(),
    });
  }

  if (!eligible.length) {
    return { written: 0, rejected: rows.length, rejectedReasons };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = (await (supabaseAdmin as any)
    .from("product_cache")
    .upsert(eligible, { onConflict: "canonical_url" })) as { error: { message: string } | null };
  if (error) {
    console.warn("[product-cache] upsert failed:", error.message);
    return { written: 0, rejected: rows.length, rejectedReasons: { ...rejectedReasons, db_error: eligible.length } };
  }
  return { written: eligible.length, rejected: rows.length - eligible.length, rejectedReasons };
}

/**
 * Mark a set of cached URLs as just-used. Bumps `times_used`,
 * `last_used_at`, and refreshes `last_verified_at` to "now" (the URL
 * resolved at least to a Firecrawl search result in this run).
 */
export async function bumpUsage(canonicalUrls: string[]): Promise<void> {
  if (!canonicalUrls.length) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabaseAdmin as any;
  // Fetch current times_used to increment (PostgREST has no inline +1).
  const { data: rows } = await sb
    .from("product_cache")
    .select("canonical_url,times_used")
    .in("canonical_url", canonicalUrls);
  if (!rows?.length) return;
  for (const row of rows as Array<{ canonical_url: string; times_used: number }>) {
    await sb
      .from("product_cache")
      .update({
        times_used: (row.times_used ?? 0) + 1,
        last_used_at: now,
        last_verified_at: now,
        inventory_health: "healthy",
      })
      .eq("canonical_url", row.canonical_url);
  }
}

/**
 * Lifecycle sweep — call from a maintenance trigger (admin button or
 * scheduled job, not per-run).
 *
 * Rules:
 *   - healthy → stale when last_verified_at > 30 days
 *   - stale   → cold when last_verified_at > 60 days AND times_used = 0
 *   - cold    → purged when discovered_at > 90 days AND times_used = 0
 *
 * Broken rows are managed separately by URL verifiers; this sweep
 * does NOT touch them.
 */
export async function runCacheLifecycleSweep(): Promise<{
  promotedToStale: number;
  promotedToCold: number;
  purgedCold: number;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabaseAdmin as any;
  const now = Date.now();
  const cutoff = (days: number) => new Date(now - days * 86400_000).toISOString();

  const { count: staleCount } = await sb
    .from("product_cache")
    .update({ inventory_health: "stale" })
    .eq("inventory_health", "healthy")
    .lt("last_verified_at", cutoff(30))
    .select("canonical_url", { count: "exact", head: true });

  const { count: coldCount } = await sb
    .from("product_cache")
    .update({ inventory_health: "cold" })
    .eq("inventory_health", "stale")
    .eq("times_used", 0)
    .lt("last_verified_at", cutoff(60))
    .select("canonical_url", { count: "exact", head: true });

  const { count: purgedCount } = await sb
    .from("product_cache")
    .delete()
    .eq("inventory_health", "cold")
    .eq("times_used", 0)
    .lt("discovered_at", cutoff(90))
    .select("canonical_url", { count: "exact", head: true });

  return {
    promotedToStale: staleCount ?? 0,
    promotedToCold: coldCount ?? 0,
    purgedCold: purgedCount ?? 0,
  };
}

/** Surface to the admin UI which retailer hosts are eligible to cache. */
export function getApprovedCacheRetailers(): string[] {
  return Array.from(APPROVED_RETAILER_HOSTS).sort();
}