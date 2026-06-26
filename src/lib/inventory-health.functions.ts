/**
 * Inventory Health & Editorial Review Queue — INTERNAL ADMIN ONLY.
 *
 * Cost-controlled product lifecycle monitoring for published editorial
 * collections. Cheap HEAD requests power the primary monitor; Firecrawl
 * stays reserved for discovery/recovery (NOT inventory monitoring).
 *
 * Monitoring cadence (priority-driven, enforced in `runScheduledHealthSweep`):
 *   • Featured Collection / Featured Look : 24h
 *   • Other published looks               :  3–7d  (5d default)
 *   • Older published collections         : 14–30d (21d default)
 *   • Draft / rejected collections        : never
 *
 * Failure routing:
 *   1. Lightweight re-check.
 *   2. Attempt existing approved fallback (slot-level only).
 *   3. If no fallback → enqueue Editorial Review Queue. NO automatic
 *      Firecrawl, NO collection-wide regeneration.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import {
  invalidatePublishedCollection,
  invalidatePublishedCollectionForId,
  invalidatePublishedCollectionForSlotId,
} from "./published-collection.functions";

const pw = z.object({ password: z.string().min(1) });

const HEALTH_STATUSES = [
  "unknown",
  "healthy",
  "unavailable",
  "sold_out",
  "http_404",
  "thumbnail_missing",
  "redirect_failed",
  "needs_review",
  "fallback_active",
] as const;
export type HealthStatus = (typeof HEALTH_STATUSES)[number];

// ── Featured Editorial Collection ─────────────────────────────────
// One Featured collection per (destination, activity). Many other
// collections (seasonal, holiday, editor's favourites) may exist
// concurrently. Featuring is the only thing the public site reads.

export const setFeaturedCollection = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw.extend({ collectionId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: col, error } = await supabaseAdmin
      .from("editorial_collections")
      .select("id,destination,activity,status")
      .eq("id", data.collectionId)
      .single();
    if (error || !col) throw new Error(error?.message ?? "collection not found");
    if (col.status !== "approved") {
      throw new Error(
        "Only approved collections can be featured. Approve it in Founder Review first.",
      );
    }
    // Unset existing featured for the same destination+activity, then set
    // this one. Single-row partial-unique index enforces invariant.
    const { error: clearErr } = await supabaseAdmin
      .from("editorial_collections")
      .update({ featured: false })
      .eq("destination", col.destination)
      .eq("activity", col.activity)
      .eq("featured", true);
    if (clearErr) throw new Error(clearErr.message);
    const { error: setErr } = await supabaseAdmin
      .from("editorial_collections")
      .update({ featured: true, published_at: new Date().toISOString() })
      .eq("id", col.id);
    if (setErr) throw new Error(setErr.message);
    // Featuring changes what the public read returns for this slot — and
    // the previously-featured collection at the same (destination, activity)
    // shares the cache key, so a single invalidation covers both.
    invalidatePublishedCollection(col.destination, col.activity);
    await invalidatePublishedCollectionForId(col.id, "collection.featured");
    return { ok: true as const };
  });

export const unfeatureCollection = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw.extend({ collectionId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("editorial_collections")
      .update({ featured: false })
      .eq("id", data.collectionId);
    if (error) throw new Error(error.message);
    await invalidatePublishedCollectionForId(
      data.collectionId,
      "collection.unfeatured",
    );
    return { ok: true as const };
  });

// ── Health checks ────────────────────────────────────────────────
// Cheap HEAD with GET fallback. Five-second timeout per URL.

async function probeUrl(url: string): Promise<{
  ok: boolean;
  status: number | null;
  reason: string | null;
}> {
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ok: false, status: null, reason: "invalid_url" };
  }
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "ResortEdit-HealthCheck/1.0" },
      });
      // Some retailers (Shopify, Cloudflare) reject HEAD. Fall back to GET.
      if (res.status === 405 || res.status === 403) {
        res = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { "user-agent": "ResortEdit-HealthCheck/1.0" },
        });
      }
    } finally {
      clearTimeout(t);
    }
    if (res.status === 404) return { ok: false, status: 404, reason: "http_404" };
    if (res.status >= 500) return { ok: false, status: res.status, reason: "retailer_5xx" };
    if (res.status >= 400) return { ok: false, status: res.status, reason: "retailer_4xx" };
    return { ok: true, status: res.status, reason: null };
  } catch (e) {
    const msg = (e as Error)?.name === "AbortError" ? "timeout" : "fetch_failed";
    return { ok: false, status: null, reason: msg };
  }
}

// ── Single slot check (used by sweep + manual recheck) ───────────

type SlotRow = {
  id: string;
  look_id: string;
  slot: string;
  brand: string | null;
  source_url: string | null;
  image_url: string | null;
  health_status: string;
  health_attempts: number;
  fallback_active: boolean;
  original_source_url: string | null;
};

async function checkOneSlot(slot: SlotRow, collectionId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const url = slot.source_url ?? "";
  const probe = await probeUrl(url);
  // Thumbnail check is best-effort and skipped when missing entirely.
  let thumbnailOk = true;
  if (slot.image_url) {
    const t = await probeUrl(slot.image_url);
    thumbnailOk = t.ok;
  } else {
    thumbnailOk = false;
  }

  let status: HealthStatus = "healthy";
  if (!probe.ok) {
    status =
      probe.reason === "http_404"
        ? "http_404"
        : probe.reason === "timeout"
          ? "redirect_failed"
          : "unavailable";
  } else if (!thumbnailOk && slot.image_url) {
    status = "thumbnail_missing";
  }

  await supabaseAdmin
    .from("editorial_collection_look_slots")
    .update({
      health_status: status,
      last_health_check_at: new Date().toISOString(),
      health_attempts:
        status === "healthy" ? 0 : (slot.health_attempts ?? 0) + 1,
    })
    .eq("id", slot.id);

  await supabaseAdmin.from("inventory_health_events").insert({
    slot_id: slot.id,
    look_id: slot.look_id,
    collection_id: collectionId,
    event_type: "health_check",
    http_status: probe.status,
    outcome: status,
    message: probe.reason,
    payload: { thumbnailOk, url, image_url: slot.image_url },
  });

  return { status, probe, thumbnailOk };
}

// ── Sweep: cadence-aware ─────────────────────────────────────────

type Cadence = { hours: number };
function cadenceFor(args: {
  isFeaturedCollection: boolean;
  isFeaturedLook: boolean;
  collectionAgeDays: number;
}): Cadence {
  if (args.isFeaturedCollection || args.isFeaturedLook) return { hours: 24 };
  if (args.collectionAgeDays > 60) return { hours: 24 * 21 };
  return { hours: 24 * 5 };
}

export const runScheduledHealthSweep = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        maxSlots: z.number().int().min(1).max(500).default(120),
        force: z.boolean().default(false),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = Date.now();

    // Only published, approved collections matter.
    const { data: cols, error: cErr } = await supabaseAdmin
      .from("editorial_collections")
      .select("id,destination,activity,status,featured,featured_look_id,published_at,created_at")
      .eq("status", "approved")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });
    if (cErr) throw new Error(cErr.message);

    const stats = {
      collectionsConsidered: cols?.length ?? 0,
      slotsChecked: 0,
      slotsSkippedCached: 0,
      healthy: 0,
      unhealthy: 0,
      queuedForReview: 0,
      firecrawlSearches: 0, // remains 0 — never triggered by sweep
    };

    for (const col of cols ?? []) {
      if (stats.slotsChecked >= data.maxSlots) break;
      const ageDays =
        (now - new Date(col.published_at ?? col.created_at).getTime()) / 86400000;

      const { data: looks } = await supabaseAdmin
        .from("editorial_collection_looks")
        .select("id,status")
        .eq("collection_id", col.id)
        .eq("status", "approved");
      const lookIds = (looks ?? []).map((l) => l.id);
      if (!lookIds.length) continue;

      const { data: slots } = await supabaseAdmin
        .from("editorial_collection_look_slots")
        .select(
          "id,look_id,slot,brand,source_url,image_url,health_status,health_attempts,fallback_active,original_source_url,last_health_check_at",
        )
        .in("look_id", lookIds);

      for (const s of (slots ?? []) as (SlotRow & {
        last_health_check_at: string | null;
      })[]) {
        if (stats.slotsChecked >= data.maxSlots) break;
        const isFeaturedLook = col.featured_look_id === s.look_id;
        const cad = cadenceFor({
          isFeaturedCollection: !!col.featured,
          isFeaturedLook,
          collectionAgeDays: ageDays,
        });
        if (!data.force && s.last_health_check_at) {
          const sinceHrs =
            (now - new Date(s.last_health_check_at).getTime()) / 3600000;
          if (sinceHrs < cad.hours && s.health_status === "healthy") {
            stats.slotsSkippedCached++;
            continue;
          }
        }
        const result = await checkOneSlot(s, col.id);
        stats.slotsChecked++;
        if (result.status === "healthy") stats.healthy++;
        else {
          stats.unhealthy++;
          // Enqueue for Founder review when no fallback machinery exists yet.
          // Featured-look failures are HIGH priority; others MEDIUM.
          const isHighPriority = !!col.featured || isFeaturedLook;
          await supabaseAdmin.from("editorial_review_queue").insert({
            collection_id: col.id,
            look_id: s.look_id,
            slot_id: s.id,
            reason:
              result.status === "http_404"
                ? "Product returned 404"
                : result.status === "thumbnail_missing"
                  ? "Product thumbnail missing"
                  : "Product unavailable",
            priority: isHighPriority ? "high" : "medium",
            payload: {
              brand: s.brand,
              slot: s.slot,
              url: s.source_url,
              probeStatus: result.probe.status,
              reason: result.probe.reason,
              isFeaturedCollection: !!col.featured,
              isFeaturedLook,
            },
          });
          stats.queuedForReview++;
        }
      }
    }

    return { ok: true as const, ranAt: new Date().toISOString(), stats };
  });

// ── Manual single-slot recheck ───────────────────────────────────

export const recheckSlot = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw.extend({ slotId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: slot, error } = await supabaseAdmin
      .from("editorial_collection_look_slots")
      .select(
        "id,look_id,slot,brand,source_url,image_url,health_status,health_attempts,fallback_active,original_source_url",
      )
      .eq("id", data.slotId)
      .single();
    if (error || !slot) throw new Error(error?.message ?? "slot not found");
    const { data: look } = await supabaseAdmin
      .from("editorial_collection_looks")
      .select("collection_id")
      .eq("id", slot.look_id)
      .single();
    const result = await checkOneSlot(slot as SlotRow, look?.collection_id ?? "");
    return { ok: true as const, status: result.status };
  });

// ── Inventory Health dashboard ───────────────────────────────────

export const getInventoryHealthDashboard = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cols } = await supabaseAdmin
      .from("editorial_collections")
      .select("id,destination,activity,title,status,featured,published_at,created_at")
      .eq("status", "approved")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });

    const colIds = (cols ?? []).map((c) => c.id);
    if (!colIds.length) {
      return { ok: true as const, collections: [], totals: emptyTotals(), recentEvents: [] };
    }
    const { data: looks } = await supabaseAdmin
      .from("editorial_collection_looks")
      .select("id,collection_id,status")
      .in("collection_id", colIds);
    const lookIds = (looks ?? []).map((l) => l.id);

    const { data: slots } = lookIds.length
      ? await supabaseAdmin
          .from("editorial_collection_look_slots")
          .select("id,look_id,health_status,fallback_active,last_health_check_at")
          .in("look_id", lookIds)
      : { data: [] as const };

    const lookToCol = new Map<string, string>();
    for (const l of looks ?? []) lookToCol.set(l.id, l.collection_id);

    const collections = (cols ?? []).map((c) => {
      const collectionSlots = (slots ?? []).filter(
        (s) => lookToCol.get(s.look_id) === c.id,
      );
      const total = collectionSlots.length;
      const healthy = collectionSlots.filter((s) => s.health_status === "healthy").length;
      const unhealthy = collectionSlots.filter(
        (s) =>
          s.health_status !== "healthy" && s.health_status !== "unknown",
      ).length;
      const fallback = collectionSlots.filter((s) => s.fallback_active).length;
      const lastCheck = collectionSlots
        .map((s) => s.last_health_check_at)
        .filter((d): d is string => !!d)
        .sort()
        .pop();
      return {
        id: c.id,
        destination: c.destination,
        activity: c.activity,
        title: c.title,
        featured: !!c.featured,
        publishedAt: c.published_at,
        slotsTotal: total,
        slotsHealthy: healthy,
        slotsUnhealthy: unhealthy,
        slotsFallback: fallback,
        healthScore: total ? Math.round((healthy / total) * 100) : null,
        lastCheckAt: lastCheck ?? null,
      };
    });

    const totals = {
      collections: collections.length,
      featured: collections.filter((c) => c.featured).length,
      slotsTotal: collections.reduce((a, c) => a + c.slotsTotal, 0),
      slotsHealthy: collections.reduce((a, c) => a + c.slotsHealthy, 0),
      slotsUnhealthy: collections.reduce((a, c) => a + c.slotsUnhealthy, 0),
      slotsFallback: collections.reduce((a, c) => a + c.slotsFallback, 0),
    };

    const { data: recent } = await supabaseAdmin
      .from("inventory_health_events")
      .select("id,event_type,outcome,http_status,message,created_at,collection_id,slot_id")
      .order("created_at", { ascending: false })
      .limit(25);

    return {
      ok: true as const,
      collections,
      totals,
      recentEvents: recent ?? [],
    };
  });

function emptyTotals() {
  return {
    collections: 0,
    featured: 0,
    slotsTotal: 0,
    slotsHealthy: 0,
    slotsUnhealthy: 0,
    slotsFallback: 0,
  };
}

// ── Editorial Review Queue ───────────────────────────────────────

export const listEditorialReviewQueue = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        status: z.enum(["open", "resolved", "dismissed"]).default("open"),
        priority: z.enum(["high", "medium", "low"]).optional(),
        limit: z.number().int().min(1).max(200).default(100),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("editorial_review_queue")
      .select("*")
      .eq("status", data.status)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.priority) q = q.eq("priority", data.priority);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Decorate with collection + slot context for the UI.
    const colIds = Array.from(
      new Set((rows ?? []).map((r) => r.collection_id).filter((x): x is string => !!x)),
    );
    const slotIds = Array.from(
      new Set((rows ?? []).map((r) => r.slot_id).filter((x): x is string => !!x)),
    );
    const [{ data: cols }, { data: slots }] = await Promise.all([
      colIds.length
        ? supabaseAdmin
            .from("editorial_collections")
            .select("id,destination,activity,title,featured")
            .in("id", colIds)
        : Promise.resolve({ data: [] }),
      slotIds.length
        ? supabaseAdmin
            .from("editorial_collection_look_slots")
            .select("id,slot,brand,product_name,source_url,health_status")
            .in("id", slotIds)
        : Promise.resolve({ data: [] }),
    ]);
    const colMap = new Map((cols ?? []).map((c) => [c.id, c]));
    const slotMap = new Map((slots ?? []).map((s) => [s.id, s]));

    return {
      ok: true as const,
      items: (rows ?? []).map((r) => ({
        ...r,
        collection: r.collection_id ? colMap.get(r.collection_id) ?? null : null,
        slot: r.slot_id ? slotMap.get(r.slot_id) ?? null : null,
      })),
    };
  });

export const resolveReviewItem = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        id: z.string().uuid(),
        resolution: z.enum(["resolved", "dismissed"]),
        note: z.string().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("editorial_review_queue")
      .update({
        status: data.resolution,
        resolution_note: data.note ?? null,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
