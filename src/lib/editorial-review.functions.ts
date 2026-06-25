/**
 * Phase 4 — Founder Review controls for draft editorial collections.
 *
 * INTERNAL ADMIN ONLY. None of these functions are reachable from a
 * public route or loader. Approving a collection sets an internal
 * `status = 'approved'` flag; it does NOT publish anything to the
 * public surface. Phase 5 will introduce the published-surface read
 * contract separately.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import {
  discoverForSlot,
  getSlotSpecs,
  loadEngineBrands,
  type SlotSpec,
} from "./stylist-engine.functions";

// ── Status model (internal only) ──────────────────────────────────
// Collection: draft → in_review → approved | rejected
// Look:        draft → approved | rejected   (pinned = featured)
// Slot:        locked boolean prevents regeneration.
const COLLECTION_STATUS = ["draft", "in_review", "approved", "rejected"] as const;
const LOOK_STATUS = ["draft", "approved", "rejected"] as const;

const pw = z.object({ password: z.string().min(1) });

// ──────────────────────────────────────────────────────────────────
// List + read
// ──────────────────────────────────────────────────────────────────

export const listEditorialCollections = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw
      .extend({
        status: z.enum(COLLECTION_STATUS).optional(),
        destination: z.string().optional(),
        activity: z.string().optional(),
        limit: z.number().int().min(1).max(200).default(50),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("editorial_collections")
      .select("id,destination,activity,title,status,notes,scoring,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    if (data.destination) q = q.eq("destination", data.destination);
    if (data.activity) q = q.eq("activity", data.activity);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.id);
    let lookCounts: Record<string, { total: number; approved: number; rejected: number }> = {};
    if (ids.length) {
      const { data: looks } = await supabaseAdmin
        .from("editorial_collection_looks")
        .select("collection_id,status")
        .in("collection_id", ids);
      for (const l of looks ?? []) {
        const c = (lookCounts[l.collection_id] ??= { total: 0, approved: 0, rejected: 0 });
        c.total++;
        if (l.status === "approved") c.approved++;
        if (l.status === "rejected") c.rejected++;
      }
    }
    return {
      ok: true as const,
      collections: (rows ?? []).map((r) => ({
        ...r,
        lookCounts: lookCounts[r.id] ?? { total: 0, approved: 0, rejected: 0 },
      })),
    };
  });

export const getEditorialCollection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pw.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: col, error: colErr } = await supabaseAdmin
      .from("editorial_collections")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (colErr) throw new Error(colErr.message);
    if (!col) throw new Error("Collection not found");
    const { data: looks, error: lkErr } = await supabaseAdmin
      .from("editorial_collection_looks")
      .select("*")
      .eq("collection_id", data.id)
      .order("position", { ascending: true });
    if (lkErr) throw new Error(lkErr.message);
    const lookIds = (looks ?? []).map((l) => l.id);
    let slots: Array<Record<string, unknown> & { id: string; look_id: string }> = [];
    if (lookIds.length) {
      const { data: slotRows, error: slErr } = await supabaseAdmin
        .from("editorial_collection_look_slots")
        .select("*")
        .in("look_id", lookIds)
        .order("position", { ascending: true });
      if (slErr) throw new Error(slErr.message);
      slots = (slotRows ?? []) as typeof slots;
    }
    const slotsByLook: Record<string, typeof slots> = {};
    for (const s of slots) (slotsByLook[s.look_id] ??= []).push(s);
    return {
      ok: true as const,
      collection: col,
      looks: (looks ?? []).map((l) => ({ ...l, slots: slotsByLook[l.id] ?? [] })),
    };
  });

// ──────────────────────────────────────────────────────────────────
// Collection-level mutations
// ──────────────────────────────────────────────────────────────────

export const updateCollectionStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw
      .extend({
        id: z.string().uuid(),
        status: z.enum(COLLECTION_STATUS),
        notes: z.string().max(4000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = { status: data.status, updated_at: new Date().toISOString() };
    if (data.notes !== undefined) patch.notes = data.notes;
    const { error } = await supabaseAdmin
      .from("editorial_collections")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateCollectionNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw.extend({ id: z.string().uuid(), notes: z.string().max(4000) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("editorial_collections")
      .update({ notes: data.notes, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ──────────────────────────────────────────────────────────────────
// Look-level mutations
// ──────────────────────────────────────────────────────────────────

export const updateLookStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw
      .extend({
        lookId: z.string().uuid(),
        status: z.enum(LOOK_STATUS),
        rejectedReason: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status: data.status, updated_at: now };
    if (data.status === "approved") {
      patch.approved_at = now;
      patch.rejected_at = null;
    } else if (data.status === "rejected") {
      patch.rejected_at = now;
      patch.approved_at = null;
      if (data.rejectedReason) {
        const existing = (await supabaseAdmin
          .from("editorial_collection_looks")
          .select("reasoning")
          .eq("id", data.lookId)
          .maybeSingle()).data?.reasoning as Record<string, unknown> | null;
        patch.reasoning = { ...(existing ?? {}), rejectedReason: data.rejectedReason };
      }
    } else {
      patch.approved_at = null;
      patch.rejected_at = null;
    }
    const { error } = await supabaseAdmin
      .from("editorial_collection_looks")
      .update(patch as never)
      .eq("id", data.lookId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Feature exactly one look in the collection (pinned = true). */
export const setFeaturedLook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw
      .extend({ collectionId: z.string().uuid(), lookId: z.string().uuid().nullable() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: clearErr } = await supabaseAdmin
      .from("editorial_collection_looks")
      .update({ pinned: false } as never)
      .eq("collection_id", data.collectionId);
    if (clearErr) throw new Error(clearErr.message);
    if (data.lookId) {
      const { error } = await supabaseAdmin
        .from("editorial_collection_looks")
        .update({ pinned: true } as never)
        .eq("id", data.lookId)
        .eq("collection_id", data.collectionId);
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const reorderLooks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw
      .extend({
        collectionId: z.string().uuid(),
        orderedLookIds: z.array(z.string().uuid()).min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < data.orderedLookIds.length; i++) {
      const { error } = await supabaseAdmin
        .from("editorial_collection_looks")
        .update({ position: i, updated_at: new Date().toISOString() } as never)
        .eq("id", data.orderedLookIds[i])
        .eq("collection_id", data.collectionId);
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

// ──────────────────────────────────────────────────────────────────
// Slot-level mutations
// ──────────────────────────────────────────────────────────────────

export const setSlotLocked = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw.extend({ slotId: z.string().uuid(), locked: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("editorial_collection_look_slots")
      .update({ locked: data.locked, updated_at: new Date().toISOString() } as never)
      .eq("id", data.slotId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const replaceSlotProduct = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw
      .extend({
        slotId: z.string().uuid(),
        brand: z.string().min(1),
        productName: z.string().min(1),
        retailer: z.string().min(1),
        sourceUrl: z.string().url(),
        affiliateUrl: z.string().url().optional(),
        imageUrl: z.string().url().nullable().optional(),
        price: z.number().positive().nullable().optional(),
        currency: z.string().length(3).optional(),
        reasoning: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {
      brand: data.brand,
      product_name: data.productName,
      retailer: data.retailer,
      source_url: data.sourceUrl,
      affiliate_url: data.affiliateUrl ?? data.sourceUrl,
      image_url: data.imageUrl ?? null,
      price: data.price ?? null,
      currency: data.currency ?? "USD",
      reasoning: data.reasoning ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin
      .from("editorial_collection_look_slots")
      .update(patch as never)
      .eq("id", data.slotId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ──────────────────────────────────────────────────────────────────
// Regeneration helpers
// ──────────────────────────────────────────────────────────────────

async function regenerateSingleSlot(args: {
  apiKey: string;
  slotId: string;
  resultsPerSearch: number;
  maxBrandsPerSlot: number;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: slot, error: slErr } = await supabaseAdmin
    .from("editorial_collection_look_slots")
    .select("id,slot,look_id,locked,source_url")
    .eq("id", args.slotId)
    .maybeSingle();
  if (slErr || !slot) throw new Error(slErr?.message ?? "slot not found");
  if (slot.locked) return { ok: false as const, reason: "slot_locked" };

  const { data: look } = await supabaseAdmin
    .from("editorial_collection_looks")
    .select("id,collection_id")
    .eq("id", slot.look_id)
    .maybeSingle();
  if (!look) throw new Error("look not found");
  const { data: col } = await supabaseAdmin
    .from("editorial_collections")
    .select("destination,activity")
    .eq("id", look.collection_id)
    .maybeSingle();
  if (!col) throw new Error("collection not found");

  const specs = getSlotSpecs(col.destination, col.activity);
  const spec = specs.find((s) => s.slot === slot.slot) as SlotSpec | undefined;
  if (!spec) return { ok: false as const, reason: "no_spec_for_slot" };

  const brands = await loadEngineBrands(col.activity);
  if (!brands.length) return { ok: false as const, reason: "no_brands" };

  // Exclude URLs already used in this look to avoid duplicates.
  const { data: siblingSlots } = await supabaseAdmin
    .from("editorial_collection_look_slots")
    .select("source_url")
    .eq("look_id", look.id);
  const seenUrls = new Set<string>(
    (siblingSlots ?? []).map((s) => (s.source_url ?? "").toLowerCase()).filter(Boolean),
  );

  const result = await discoverForSlot({
    apiKey: args.apiKey,
    spec,
    brands: brands.slice(0, args.maxBrandsPerSlot),
    resultsPerSearch: args.resultsPerSearch,
    retailersPerBrand: spec.retailersPerBrand,
    brandOffset: Math.floor(Math.random() * 7),
    idCounter: { n: 0 },
    canonicalSeen: new Map(),
    seenUrls,
    source: "core",
  });
  const candidate = result.candidates.sort((a, b) => b.editorialScore - a.editorialScore)[0];
  if (!candidate) return { ok: false as const, reason: "no_candidates" };

  const patch = {
    brand: candidate.brand,
    product_name: candidate.title,
    retailer: candidate.retailer,
    source_url: candidate.url,
    affiliate_url: candidate.url,
    image_url: null,
    price: null,
    reasoning: `Regenerated via discoverForSlot (score ${candidate.editorialScore.toFixed(2)})`,
    metadata: {
      silhouette: candidate.silhouette,
      palette: candidate.palette,
      editorialScore: candidate.editorialScore,
      source: candidate.source,
      brandTier: candidate.brandTier,
      commerceSource: candidate.commerceSource,
      regeneratedAt: new Date().toISOString(),
    } as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };
  const { error: upErr } = await supabaseAdmin
    .from("editorial_collection_look_slots")
    .update(patch as never)
    .eq("id", slot.id);
  if (upErr) throw new Error(upErr.message);
  return {
    ok: true as const,
    candidate: {
      brand: candidate.brand,
      title: candidate.title,
      retailer: candidate.retailer,
      url: candidate.url,
      editorialScore: candidate.editorialScore,
    },
  };
}

export const regenerateSlot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw
      .extend({
        slotId: z.string().uuid(),
        resultsPerSearch: z.number().int().min(1).max(20).default(6),
        maxBrandsPerSlot: z.number().int().min(1).max(40).default(12),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) return { ok: false as const, reason: "config_missing_firecrawl" };
    return regenerateSingleSlot({
      apiKey,
      slotId: data.slotId,
      resultsPerSearch: data.resultsPerSearch,
      maxBrandsPerSlot: data.maxBrandsPerSlot,
    });
  });

export const regenerateLook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    pw
      .extend({
        lookId: z.string().uuid(),
        resultsPerSearch: z.number().int().min(1).max(20).default(6),
        maxBrandsPerSlot: z.number().int().min(1).max(40).default(12),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) return { ok: false as const, reason: "config_missing_firecrawl" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: slots, error } = await supabaseAdmin
      .from("editorial_collection_look_slots")
      .select("id,locked")
      .eq("look_id", data.lookId);
    if (error) throw new Error(error.message);
    const results: Array<{ slotId: string; ok: boolean; reason?: string }> = [];
    for (const s of slots ?? []) {
      if (s.locked) {
        results.push({ slotId: s.id, ok: false, reason: "slot_locked" });
        continue;
      }
      try {
        const r = await regenerateSingleSlot({
          apiKey,
          slotId: s.id,
          resultsPerSearch: data.resultsPerSearch,
          maxBrandsPerSlot: data.maxBrandsPerSlot,
        });
        results.push({ slotId: s.id, ok: r.ok, reason: r.ok ? undefined : r.reason });
      } catch (e) {
        results.push({ slotId: s.id, ok: false, reason: String((e as Error)?.message ?? e) });
      }
    }
    return { ok: true as const, results };
  });