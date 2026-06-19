/**
 * Founder Approval Learning Layer — server functions.
 *
 * Surface area:
 *   - addFounderReference       — manually save a founder-approved product
 *   - listFounderReferences     — list approved references for browsing/scoring
 *   - ingestUploadedUrl         — harvest a collection URL, fan out to brands
 *   - listUploadedUrls          — admin: every URL the founder has submitted
 *   - listBrandReviewQueue      — admin: pending brands from harvested URLs
 *   - reviewBrand               — approve / approve_selectively / reject
 *   - bumpBrandSignal           — increment founder signal counters
 *   - similarityForCandidate    — score a candidate vs founder references
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

const pw = z.string().min(1).max(200);

const tagArray = z.array(z.string().min(1).max(80)).max(40).default([]);

/* ─────────────────────────────────────────────────────────────────────── */
/* 1. Founder Reference Products                                           */
/* ─────────────────────────────────────────────────────────────────────── */

export const addFounderReference = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        brand: z.string().min(1).max(120),
        image_url: z.string().url().optional(),
        source_url: z.string().url().optional(),
        retailer: z.string().max(120).optional(),
        product_name: z.string().max(240).optional(),
        product_category: z.string().max(80).optional(),
        destination_tags: tagArray,
        activity_tags: tagArray,
        style_tags: tagArray,
        silhouette: z.string().max(80).optional(),
        print_language: z.string().max(80).optional(),
        color_story: tagArray,
        texture: z.string().max(80).optional(),
        founder_notes: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { slugifyBrand } = await import("./founder-learning.server");
    const { password: _pw, ...row } = data;
    void _pw;

    const { data: inserted, error } = await supabaseAdmin
      .from("founder_reference_products")
      .insert({ ...row, founder_approved: true })
      .select("id")
      .single();
    if (error || !inserted) return { ok: false as const, error: error?.message ?? "insert failed" };

    // Bump brand signal: founder uploaded this product directly.
    await bumpBrandRow(supabaseAdmin, data.brand, slugifyBrand(data.brand), {
      times_uploaded_by_founder: 1,
      founder_reference_count: 1,
      times_seen: 1,
      associated_destinations: data.destination_tags,
    });

    return { ok: true as const, id: inserted.id };
  });

export const listFounderReferences = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw.optional(),
        destination: z.string().max(80).optional(),
        brand: z.string().max(120).optional(),
        limit: z.number().int().min(1).max(500).default(100),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Public read (RLS allows authenticated read; admin-key read here for SSR).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("founder_reference_products")
      .select("*")
      .eq("founder_approved", true)
      .order("approval_date", { ascending: false })
      .limit(data.limit);
    if (data.brand) q = q.ilike("brand", data.brand);
    if (data.destination) q = q.contains("destination_tags", [data.destination]);
    const { data: rows, error } = await q;
    if (error) return { ok: false as const, error: error.message, items: [] };
    return { ok: true as const, items: rows ?? [] };
  });

/* ─────────────────────────────────────────────────────────────────────── */
/* 2. URL Harvesting                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

export const ingestUploadedUrl = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        url: z.string().url(),
        source_type: z.string().max(60).optional(),
        destination_hint: z.string().max(80).optional(),
        activity_hint: z.string().max(80).optional(),
        notes: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { harvestUploadedUrl, slugifyBrand } = await import("./founder-learning.server");

    // 1. Record the upload immediately (status=pending).
    const { data: urlRow, error: urlErr } = await supabaseAdmin
      .from("founder_uploaded_urls")
      .insert({
        url: data.url,
        source_type: data.source_type ?? null,
        destination_hint: data.destination_hint ?? null,
        activity_hint: data.activity_hint ?? null,
        notes: data.notes ?? null,
        harvest_status: "running",
      })
      .select("id")
      .single();
    if (urlErr || !urlRow) return { ok: false as const, error: urlErr?.message ?? "insert failed" };

    // 2. Harvest via Firecrawl.
    let harvested;
    try {
      harvested = await harvestUploadedUrl(data.url);
    } catch (e) {
      const msg = String((e as Error).message ?? e).slice(0, 480);
      await supabaseAdmin
        .from("founder_uploaded_urls")
        .update({ harvest_status: "failed", harvest_error: msg, harvested_at: new Date().toISOString() })
        .eq("id", urlRow.id);
      return { ok: false as const, error: msg };
    }

    // 3. For every brand: upsert brand_intelligence + maybe queue for review.
    let newBrands = 0;
    const reviewQueueAdds: string[] = [];

    for (const brandName of harvested.brands) {
      const slug = slugifyBrand(brandName);
      if (!slug) continue;
      const brandProducts = harvested.products.filter((p) => p.brand === brandName);

      const { data: existing } = await supabaseAdmin
        .from("brand_intelligence")
        .select("id, status, times_seen, times_uploaded_by_founder, associated_destinations")
        .eq("slug", slug)
        .maybeSingle();

      const destBump = data.destination_hint ? [data.destination_hint] : [];

      if (existing) {
        const mergedDestinations = Array.from(
          new Set([...(existing.associated_destinations ?? []), ...destBump]),
        );
        await supabaseAdmin
          .from("brand_intelligence")
          .update({
            times_seen: (existing.times_seen ?? 0) + 1,
            times_uploaded_by_founder: (existing.times_uploaded_by_founder ?? 0) + 1,
            associated_destinations: mergedDestinations,
          })
          .eq("id", existing.id);
      } else {
        newBrands++;
        await supabaseAdmin.from("brand_intelligence").insert({
          brand: brandName,
          slug,
          status: "pending_review",
          source: "founder_uploaded_url",
          suggested_destinations: destBump,
          suggested_activities: data.activity_hint ? [data.activity_hint] : [],
          associated_destinations: destBump,
          times_seen: 1,
          times_uploaded_by_founder: 1,
        });
        reviewQueueAdds.push(brandName);
      }

      // brand_review_queue upsert (only for non-approved brands).
      const status = existing?.status ?? "pending_review";
      if (status !== "approved" && status !== "approved_selectively") {
        const { data: queueExisting } = await supabaseAdmin
          .from("brand_review_queue")
          .select("id, times_seen, source_urls, products_found")
          .eq("brand_slug", slug)
          .maybeSingle();
        const productsJson = brandProducts.map((p) => ({
          product_name: p.product_name,
          image_url: p.image_url,
          product_url: p.product_url,
          category: p.category,
        }));
        if (queueExisting) {
          const srcUrls = Array.from(new Set([...(queueExisting.source_urls ?? []), data.url]));
          const merged = [
            ...(Array.isArray(queueExisting.products_found) ? queueExisting.products_found : []),
            ...productsJson,
          ].slice(0, 60);
          await supabaseAdmin
            .from("brand_review_queue")
            .update({
              times_seen: (queueExisting.times_seen ?? 0) + 1,
              source_urls: srcUrls,
              products_found: merged,
              suggested_destinations: destBump,
            })
            .eq("id", queueExisting.id);
        } else {
          await supabaseAdmin.from("brand_review_queue").insert({
            brand: brandName,
            brand_slug: slug,
            times_seen: 1,
            source_urls: [data.url],
            products_found: productsJson,
            suggested_destinations: destBump,
            suggested_activities: data.activity_hint ? [data.activity_hint] : [],
            review_status: "pending",
          });
        }
      }
    }

    // 4. Finalize the URL row.
    await supabaseAdmin
      .from("founder_uploaded_urls")
      .update({
        harvest_status: "completed",
        products_found: harvested.products.length,
        brands_found: harvested.brands.length,
        new_brands_count: newBrands,
        harvest_payload: JSON.parse(
          JSON.stringify({ retailer: harvested.retailer, products: harvested.products }),
        ),
        harvested_at: new Date().toISOString(),
      })
      .eq("id", urlRow.id);

    return {
      ok: true as const,
      retailer: harvested.retailer,
      products_found: harvested.products.length,
      brands_found: harvested.brands.length,
      new_brands: newBrands,
      queued_brands: reviewQueueAdds,
    };
  });

export const listUploadedUrls = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, limit: z.number().int().min(1).max(500).default(100) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("founder_uploaded_urls")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) return { ok: false as const, error: error.message, items: [] };
    return { ok: true as const, items: rows ?? [] };
  });

/* ─────────────────────────────────────────────────────────────────────── */
/* 3. Brand Review Queue                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

export const listBrandReviewQueue = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        status: z.enum(["pending", "approved", "approved_selectively", "rejected", "all"]).default("pending"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("brand_review_queue")
      .select("*")
      .order("times_seen", { ascending: false })
      .limit(200);
    if (data.status !== "all") q = q.eq("review_status", data.status);
    const { data: rows, error } = await q;
    if (error) return { ok: false as const, error: error.message, items: [] };
    return { ok: true as const, items: rows ?? [] };
  });

export const reviewBrand = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        queue_id: z.string().uuid(),
        decision: z.enum(["approve", "approve_selectively", "reject"]),
        suggested_tier: z.enum(["hero", "discovery"]).optional(),
        notes: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: q, error: qErr } = await supabaseAdmin
      .from("brand_review_queue")
      .select("*")
      .eq("id", data.queue_id)
      .maybeSingle();
    if (qErr || !q) return { ok: false as const, error: qErr?.message ?? "Not found" };

    const reviewStatus =
      data.decision === "approve"
        ? "approved"
        : data.decision === "approve_selectively"
          ? "approved_selectively"
          : "rejected";
    const brandStatus = reviewStatus; // mirror onto brand_intelligence

    await supabaseAdmin
      .from("brand_review_queue")
      .update({
        review_status: reviewStatus,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: data.notes ?? null,
        suggested_tier: data.suggested_tier ?? q.suggested_tier ?? null,
      })
      .eq("id", q.id);

    await supabaseAdmin
      .from("brand_intelligence")
      .update({
        status: brandStatus,
        suggested_tier: data.suggested_tier ?? null,
        notes: data.notes ?? null,
      })
      .eq("slug", q.brand_slug);

    return { ok: true as const, brand: q.brand, status: brandStatus };
  });

/* ─────────────────────────────────────────────────────────────────────── */
/* 4. Founder signal bumps + similarity                                    */
/* ─────────────────────────────────────────────────────────────────────── */

export const bumpBrandSignal = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        brand: z.string().min(1).max(120),
        kind: z.enum(["selected_for_look", "saved_to_library"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { slugifyBrand } = await import("./founder-learning.server");
    const slug = slugifyBrand(data.brand);
    const delta =
      data.kind === "selected_for_look"
        ? { times_selected_for_looks: 1 }
        : { times_saved_to_library: 1 };
    await bumpBrandRow(supabaseAdmin, data.brand, slug, delta);
    return { ok: true as const };
  });

/**
 * Score a candidate product against founder-approved references.
 * Used by the sourcing pipeline to weight new candidates by founder taste.
 * Signals are weighted, in priority order:
 *   destination DNA (4) > activity (3) > style family (3) >
 *   print language (2) > silhouette (2) > texture (1) > color story (1)
 */
export const similarityForCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        candidate: z.object({
          brand: z.string().optional(),
          destination_tags: tagArray,
          activity_tags: tagArray,
          style_tags: tagArray,
          silhouette: z.string().optional(),
          print_language: z.string().optional(),
          texture: z.string().optional(),
          color_story: tagArray,
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: refs } = await supabaseAdmin
      .from("founder_reference_products")
      .select(
        "id, brand, destination_tags, activity_tags, style_tags, silhouette, print_language, texture, color_story",
      )
      .eq("founder_approved", true);
    const c = data.candidate;
    let best = { ref_id: null as string | null, score: 0 };
    for (const r of refs ?? []) {
      const s = scorePair(c, r);
      if (s > best.score) best = { ref_id: r.id, score: s };
    }
    return { ok: true as const, score: best.score, best_match_id: best.ref_id, ref_count: refs?.length ?? 0 };
  });

/* ─────────────────────────────────────────────────────────────────────── */
/* helpers                                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

// Helper uses `any` for the supabase client; the inferred Database type
// graph is too deep here and trips TS2589 when constrained.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function bumpBrandRow(
  supabase: any,
  brand: string,
  slug: string,
  delta: {
    times_seen?: number;
    times_uploaded_by_founder?: number;
    times_selected_for_looks?: number;
    times_saved_to_library?: number;
    founder_reference_count?: number;
    associated_destinations?: string[];
  },
) {
  const { data: existing } = await (supabase
    .from("brand_intelligence")
    .select(
      "id, times_seen, times_uploaded_by_founder, times_selected_for_looks, times_saved_to_library, founder_reference_count, associated_destinations",
    )
    .eq("slug", slug)
    .maybeSingle() as Promise<{ data: Record<string, unknown> | null }>);

  if (existing) {
    const e = existing as Record<string, unknown>;
    const mergedDestinations = Array.from(
      new Set([
        ...((e.associated_destinations as string[]) ?? []),
        ...(delta.associated_destinations ?? []),
      ]),
    );
    await supabase
      .from("brand_intelligence")
      .update({
        times_seen: ((e.times_seen as number) ?? 0) + (delta.times_seen ?? 0),
        times_uploaded_by_founder:
          ((e.times_uploaded_by_founder as number) ?? 0) + (delta.times_uploaded_by_founder ?? 0),
        times_selected_for_looks:
          ((e.times_selected_for_looks as number) ?? 0) + (delta.times_selected_for_looks ?? 0),
        times_saved_to_library:
          ((e.times_saved_to_library as number) ?? 0) + (delta.times_saved_to_library ?? 0),
        founder_reference_count:
          ((e.founder_reference_count as number) ?? 0) + (delta.founder_reference_count ?? 0),
        associated_destinations: mergedDestinations,
      })
      .eq("id", e.id);
  } else {
    await supabase.from("brand_intelligence").insert({
      brand,
      slug,
      status: "pending_review",
      source: "founder_signal",
      times_seen: delta.times_seen ?? 0,
      times_uploaded_by_founder: delta.times_uploaded_by_founder ?? 0,
      times_selected_for_looks: delta.times_selected_for_looks ?? 0,
      times_saved_to_library: delta.times_saved_to_library ?? 0,
      founder_reference_count: delta.founder_reference_count ?? 0,
      associated_destinations: delta.associated_destinations ?? [],
    });
  }
}

interface CandidateLike {
  destination_tags: string[];
  activity_tags: string[];
  style_tags: string[];
  silhouette?: string;
  print_language?: string;
  texture?: string;
  color_story: string[];
}

function arrOverlap(a: string[] | null | undefined, b: string[] | null | undefined): number {
  if (!a || !b) return 0;
  const set = new Set(a.map((x) => x.toLowerCase()));
  let n = 0;
  for (const x of b) if (set.has(x.toLowerCase())) n++;
  return n;
}

function scorePair(c: CandidateLike, r: Record<string, unknown>): number {
  const destOverlap = arrOverlap(c.destination_tags, r.destination_tags as string[]);
  if (destOverlap === 0) return 0; // destination is a hard prerequisite
  let s = destOverlap * 4.0;
  s += arrOverlap(c.activity_tags, r.activity_tags as string[]) * 3.0;
  s += arrOverlap(c.style_tags, r.style_tags as string[]) * 3.0;
  s += arrOverlap(c.color_story, r.color_story as string[]) * 1.0;
  if (c.silhouette && r.silhouette && c.silhouette.toLowerCase() === (r.silhouette as string).toLowerCase()) s += 2.0;
  if (c.print_language && r.print_language && c.print_language.toLowerCase() === (r.print_language as string).toLowerCase()) s += 2.0;
  if (c.texture && r.texture && c.texture.toLowerCase() === (r.texture as string).toLowerCase()) s += 1.0;
  return s;
}