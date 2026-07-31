import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Published Collection Service — DEPRECATED (Step 2 admin audit, July 2026).
 *
 * The `editorial_collections` / `editorial_collection_looks` /
 * `editorial_collection_look_slots` trio is on the deprecation path: it holds
 * 0 approved looks, has no writer left in the codebase, and no public route
 * reads it. The public site is served by `founder_looks` + `look_candidates`
 * instead. Do NOT add new readers or writers here; the tables remain only so
 * existing rows can be migrated or exported before an explicit drop.
 *
 * Read-only contract that sits between editorial_collections (DB) and the
 * public Resort Edit experience. Public routes MUST consume editorial
 * collections exclusively through this service so the DB schema can evolve
 * without touching public UI.
 *
 * Guarantees:
 *  - Never writes, approves, regenerates, or triggers discovery / Firecrawl.
 *  - Returns only the currently Featured collection that passes all gates.
 *  - Strips administrative fields, founder notes, rejected/broken products.
 *  - In-process cache with explicit invalidation hooks.
 */

// ---------- Public return model ----------

export type PublishedSlot = {
  slot: string;
  position: number;
  brand: string;
  product_name: string;
  retailer: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  url: string; // resolved commerce URL (affiliate > source)
};

export type PublishedLook = {
  id: string;
  position: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  style_dna: string[];
  palette: string[];
  slots: PublishedSlot[];
};

export type PublishedCollection = {
  destination: string;
  activity: string;
  collection_name: string;
  season: string | null;
  version: string;
  published_at: string | null;
  collection_health: "healthy" | "degraded";
  featured_look: PublishedLook | null;
  additional_looks: PublishedLook[];
  editorial_metrics: {
    editorial_score: number | null;
    completeness_score: number | null;
    look_count: number;
    slot_count: number;
    fallback_count: number;
  };
};

export type PublishedCollectionResult =
  | { ok: true; collection: PublishedCollection }
  | { ok: false; reason: "not_found" | "unavailable" };

// ---------- Selection rules ----------

const ELIGIBLE_COLLECTION_STATUSES = ["approved", "published"] as const;
const ELIGIBLE_LOOK_STATUSES = ["approved", "published", "pending"] as const;
const EXCLUDED_SLOT_HEALTH = new Set(["broken", "rejected", "archived"]);
const MIN_LOOKS_REQUIRED = 1;
const MAX_CRITICAL_FAILURES = 0; // any "broken" slot in featured look = unavailable

// ---------- In-memory cache ----------

type CacheEntry = { value: PublishedCollectionResult; expires: number };
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes; explicit invalidation otherwise

function cacheKey(destination: string, activity: string) {
  return `${destination.toLowerCase()}::${activity.toLowerCase()}`;
}

/** Invalidate one destination/activity, or all entries when args omitted. */
export function invalidatePublishedCollection(destination?: string, activity?: string) {
  if (!destination || !activity) {
    CACHE.clear();
    return;
  }
  CACHE.delete(cacheKey(destination, activity));
}

// ---------- ID-based invalidation helpers (Phase 5.6) ----------
//
// Editorial workflows (approval, featuring, look/slot mutations, health
// sweeps) work with collection / look / slot ids — they don't carry the
// destination/activity tuple directly. These helpers translate an id into
// the cache key and log the invalidation. All helpers are best-effort and
// must NOT throw — cache-invalidation failures should never break the
// underlying editorial mutation.

type InvalidationLog = {
  destination: string;
  activity: string;
  collectionId: string;
  reason: string;
  at: string;
};

function logInvalidation(entry: InvalidationLog) {
  // Keep one structured line so admin log scrapers can grep for it.
  console.info("[published-cache] invalidate", entry);
}

export async function invalidatePublishedCollectionForId(
  collectionId: string,
  reason: string,
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("editorial_collections")
      .select("destination,activity")
      .eq("id", collectionId)
      .maybeSingle();
    if (!data?.destination || !data?.activity) return;
    invalidatePublishedCollection(data.destination, data.activity);
    logInvalidation({
      destination: data.destination,
      activity: data.activity,
      collectionId,
      reason,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[published-cache] invalidate (collection) failed", {
      collectionId,
      reason,
      error: String((err as Error)?.message ?? err),
    });
  }
}

export async function invalidatePublishedCollectionForLookId(
  lookId: string,
  reason: string,
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("editorial_collection_looks")
      .select("collection_id")
      .eq("id", lookId)
      .maybeSingle();
    if (data?.collection_id) {
      await invalidatePublishedCollectionForId(data.collection_id, reason);
    }
  } catch (err) {
    console.warn("[published-cache] invalidate (look) failed", {
      lookId,
      reason,
      error: String((err as Error)?.message ?? err),
    });
  }
}

export async function invalidatePublishedCollectionForSlotId(
  slotId: string,
  reason: string,
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("editorial_collection_look_slots")
      .select("look_id")
      .eq("id", slotId)
      .maybeSingle();
    if (data?.look_id) {
      await invalidatePublishedCollectionForLookId(data.look_id, reason);
    }
  } catch (err) {
    console.warn("[published-cache] invalidate (slot) failed", {
      slotId,
      reason,
      error: String((err as Error)?.message ?? err),
    });
  }
}

// ---------- Core resolver ----------

async function resolvePublishedCollection(
  destination: string,
  activity: string,
): Promise<PublishedCollectionResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Pick the currently Featured collection. Only one should be featured per
  // (destination, activity); ties fall back to most-recently published.
  const { data: collections } = await supabaseAdmin
    .from("editorial_collections")
    .select("*")
    .ilike("destination", destination)
    .ilike("activity", activity)
    .eq("featured", true)
    .in("status", ELIGIBLE_COLLECTION_STATUSES as unknown as string[])
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1);

  const collection = collections?.[0];
  if (!collection) return { ok: false, reason: "not_found" };

  const { data: looks } = await supabaseAdmin
    .from("editorial_collection_looks")
    .select("*")
    .eq("collection_id", collection.id)
    .in("status", ELIGIBLE_LOOK_STATUSES as unknown as string[])
    .order("position", { ascending: true });

  if (!looks || looks.length < MIN_LOOKS_REQUIRED) {
    return { ok: false, reason: "unavailable" };
  }

  const lookIds = looks.map((l) => l.id);
  const { data: slots } = await supabaseAdmin
    .from("editorial_collection_look_slots")
    .select("*")
    .in("look_id", lookIds)
    .order("position", { ascending: true });

  const slotsByLook = new Map<string, typeof slots>();
  let fallbackCount = 0;
  for (const s of slots ?? []) {
    const health = (s.health_status ?? "healthy") as string;
    if (EXCLUDED_SLOT_HEALTH.has(health)) continue;
    if (!s.source_url && !s.affiliate_url) continue; // empty slot
    if (!s.brand || !s.product_name) continue;
    if (s.fallback_active) fallbackCount += 1;
    const arr = slotsByLook.get(s.look_id) ?? [];
    arr.push(s);
    slotsByLook.set(s.look_id, arr);
  }

  const toPublishedSlot = (s: NonNullable<typeof slots>[number]): PublishedSlot => ({
    slot: s.slot,
    position: s.position ?? 0,
    brand: s.brand!,
    product_name: s.product_name!,
    retailer: s.retailer ?? null,
    price: s.price != null ? Number(s.price) : null,
    currency: s.currency ?? null,
    image_url: s.image_url ?? null,
    url: (s.affiliate_url ?? s.source_url)!,
  });

  const toPublishedLook = (l: (typeof looks)[number]): PublishedLook => ({
    id: l.id,
    position: l.position ?? 0,
    title: l.title,
    subtitle: l.subtitle ?? null,
    description: l.description ?? null,
    style_dna: Array.isArray(l.style_dna) ? (l.style_dna as string[]) : [],
    palette: Array.isArray(l.palette) ? (l.palette as string[]) : [],
    slots: (slotsByLook.get(l.id) ?? []).map(toPublishedSlot),
  });

  // Featured look: explicit pointer, else first pinned, else position 0.
  const featuredId =
    collection.featured_look_id ??
    looks.find((l) => l.pinned)?.id ??
    looks[0]?.id ??
    null;

  const featuredRow = looks.find((l) => l.id === featuredId) ?? looks[0];
  const featured = featuredRow ? toPublishedLook(featuredRow) : null;

  // Publication gate: featured look must have at least one usable slot and
  // no critical breakage exceeding the threshold.
  if (!featured || featured.slots.length === 0) {
    return { ok: false, reason: "unavailable" };
  }
  const criticalFailures = (slots ?? []).filter(
    (s) => s.look_id === featuredRow!.id && s.health_status === "broken",
  ).length;
  if (criticalFailures > MAX_CRITICAL_FAILURES) {
    return { ok: false, reason: "unavailable" };
  }

  const additional = looks
    .filter((l) => l.id !== featuredRow!.id)
    .map(toPublishedLook)
    .filter((l) => l.slots.length > 0);

  const scoring = (collection.scoring ?? {}) as Record<string, unknown>;
  const editorialScore =
    typeof scoring.editorial_score === "number" ? (scoring.editorial_score as number) : null;
  const completenessScore =
    typeof scoring.completeness === "number" ? (scoring.completeness as number) : null;

  const slotCount = featured.slots.length + additional.reduce((n, l) => n + l.slots.length, 0);

  return {
    ok: true,
    collection: {
      destination: collection.destination,
      activity: collection.activity,
      collection_name: collection.title ?? `${collection.destination} — ${collection.activity}`,
      season: collection.season ?? null,
      version: `${collection.id}:${collection.updated_at ? new Date(collection.updated_at).getTime() : 0}`,
      published_at: collection.published_at ?? null,
      collection_health: fallbackCount > 0 ? "degraded" : "healthy",
      featured_look: featured,
      additional_looks: additional,
      editorial_metrics: {
        editorial_score: editorialScore,
        completeness_score: completenessScore,
        look_count: 1 + additional.length,
        slot_count: slotCount,
        fallback_count: fallbackCount,
      },
    },
  };
}

// ---------- Public server function ----------

export const getPublishedCollection = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        destination: z.string().min(1).max(120),
        activity: z.string().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<PublishedCollectionResult> => {
    const key = cacheKey(data.destination, data.activity);
    const hit = CACHE.get(key);
    const now = Date.now();
    if (hit && hit.expires > now) return hit.value;

    const value = await resolvePublishedCollection(data.destination, data.activity);
    CACHE.set(key, { value, expires: now + CACHE_TTL_MS });
    return value;
  });

/**
 * Admin-only cache invalidation hook. Call from approval / featuring /
 * inventory-health pipelines when collection state changes.
 */
export const invalidatePublishedCollectionCache = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        destination: z.string().min(1).max(120).optional(),
        activity: z.string().min(1).max(120).optional(),
        password: z.string().min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-auth.server");
    requireAdmin(data.password);
    invalidatePublishedCollection(data.destination, data.activity);
    return { ok: true as const };
  });