/**
 * Resort Edit Existing Asset Intelligence Backfill.
 *
 * Walks every existing data source already in the project — sourced_products,
 * brands, editorial_reference_library, look_candidates, and the in-code
 * PRODUCT_LIBRARY — and populates the founder learning tables. Idempotent:
 * each run truncates the three derived tables (founder_reference_products,
 * brand_intelligence, brand_review_queue) and rebuilds them from primary
 * sources. Founder-uploaded URLs are preserved.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

const pw = z.string().min(1).max(200);

export const runAssetBackfill = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        wipe_derived: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { slugifyBrand } = await import("./founder-learning.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;

    /* ─────────── Phase 1: Asset audit ─────────── */
    const audit = await auditExisting(sb);

    /* ─────────── Phase 2–7: Backfill ─────────── */
    if (data.wipe_derived) {
      await sb.from("brand_review_queue").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await sb.from("founder_reference_products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await sb.from("brand_intelligence").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    type BrandAgg = {
      brand: string;
      slug: string;
      sources: Set<string>;
      destinations: Set<string>;
      activities: Set<string>;
      styles: Set<string>;
      retailers: Set<string>;
      times_seen: number;
      founder_reference_count: number;
      times_selected_for_looks: number;
      tier: "hero" | "discovery" | null;
      status_from_brands: string | null;
      categories: Set<string>;
    };
    const brandMap = new Map<string, BrandAgg>();
    const bump = (rawBrand: string | null | undefined): BrandAgg | null => {
      if (!rawBrand) return null;
      const brand = String(rawBrand).trim();
      if (!brand) return null;
      const slug = slugifyBrand(brand);
      if (!slug) return null;
      let agg = brandMap.get(slug);
      if (!agg) {
        agg = {
          brand,
          slug,
          sources: new Set(),
          destinations: new Set(),
          activities: new Set(),
          styles: new Set(),
          retailers: new Set(),
          times_seen: 0,
          founder_reference_count: 0,
          times_selected_for_looks: 0,
          tier: null,
          status_from_brands: null,
          categories: new Set(),
        };
        brandMap.set(slug, agg);
      }
      agg.times_seen += 1;
      return agg;
    };

    /* — Source A: brands table (authoritative for status) */
    const { data: brandRows } = await sb
      .from("brands")
      .select("name, slug, status, tier, categories, activities, destinations, is_hero, retailer_hints");
    for (const b of brandRows ?? []) {
      const agg = bump(b.name);
      if (!agg) continue;
      agg.sources.add("brands");
      agg.status_from_brands = b.status ?? null;
      agg.tier = b.is_hero ? "hero" : (b.tier ?? null);
      for (const d of b.destinations ?? []) agg.destinations.add(d);
      for (const a of b.activities ?? []) agg.activities.add(a);
      for (const c of b.categories ?? []) agg.categories.add(c);
      if (b.retailer_hints && typeof b.retailer_hints === "object") {
        for (const r of Object.keys(b.retailer_hints)) agg.retailers.add(r);
      }
    }

    /* — Source B: sourced_products — every founder-touched product */
    type SourcedRow = {
      id: string;
      brand: string | null;
      product_name: string | null;
      retailer_domain: string | null;
      source_url: string | null;
      affiliate_url: string | null;
      image_url: string | null;
      category: string | null;
      subcategory: string | null;
      silhouette: string | null;
      texture: string | null;
      print_family: string | null;
      color_family: string | null;
      destination_tags: string[] | null;
      activity_tags: string[] | null;
      status: string | null;
      auto_approved: boolean | null;
    };
    const { data: sourcedRows } = (await sb
      .from("sourced_products")
      .select(
        "id, brand, product_name, retailer_domain, source_url, affiliate_url, image_url, category, subcategory, silhouette, texture, print_family, color_family, destination_tags, activity_tags, status, auto_approved",
      )
      .neq("status", "rejected")) as { data: SourcedRow[] | null };

    const refRows: Array<Record<string, unknown>> = [];
    for (const p of sourcedRows ?? []) {
      const agg = bump(p.brand);
      if (!agg) continue;
      agg.sources.add("sourced_products");
      if (p.retailer_domain) agg.retailers.add(p.retailer_domain);
      for (const d of p.destination_tags ?? []) agg.destinations.add(d);
      for (const a of p.activity_tags ?? []) agg.activities.add(a);
      if (p.category) agg.categories.add(p.category);
      // Treat scraped + image-bearing rows as founder reference candidates.
      // auto_approved or promoted = strong signal; scraped = weak signal.
      const approved = Boolean(p.auto_approved) || p.status === "promoted" || p.status === "scraped";
      if (approved && p.image_url) {
        agg.founder_reference_count += 1;
        refRows.push({
          brand: agg.brand,
          retailer: p.retailer_domain,
          product_name: p.product_name,
          product_category: p.subcategory ?? p.category,
          image_url: p.image_url,
          source_url: p.affiliate_url ?? p.source_url,
          destination_tags: p.destination_tags ?? [],
          activity_tags: p.activity_tags ?? [],
          style_tags: [p.print_family, p.color_family].filter(Boolean) as string[],
          silhouette: p.silhouette,
          print_language: p.print_family,
          color_story: p.color_family ? [p.color_family] : [],
          texture: p.texture,
          founder_approved: true,
          founder_notes: `Backfilled from sourced_products (${p.status})`,
        });
      }
    }

    /* — Source C: in-code PRODUCT_LIBRARY (founder-curated) */
    const { PRODUCT_LIBRARY } = await import("@/data/productLibrary");
    for (const p of PRODUCT_LIBRARY) {
      const agg = bump(p.brand);
      if (!agg) continue;
      agg.sources.add("product_library");
      agg.retailers.add(p.retailer);
      for (const d of p.destinations) agg.destinations.add(d);
      for (const a of p.activityTags) agg.activities.add(a);
      for (const s of p.styleFamilies) agg.styles.add(s);
      agg.founder_reference_count += 1;
      if (p.brandTier === "discovery") agg.tier = "discovery";
      refRows.push({
        brand: p.brand,
        retailer: p.retailer,
        product_name: p.name,
        product_category: null,
        image_url: p.image,
        source_url: p.href,
        destination_tags: p.destinations,
        activity_tags: p.activityTags,
        style_tags: p.styleFamilies,
        color_story: [],
        founder_approved: true,
        founder_notes: `Backfilled from in-code product library (${p.editorialLabel ?? "curated"})`,
      });
    }

    /* — Source D: look_candidates (selected/published brands count extra) */
    const { data: lookRows } = await sb
      .from("look_candidates")
      .select("status, destination, brief, scoring");
    const lookBrands: Record<string, number> = {};
    for (const l of lookRows ?? []) {
      if (l.status !== "approved" && l.status !== "published") continue;
      // The brief JSON sometimes carries chosen brands; surface any string brand keys.
      const brief = (l.brief ?? {}) as Record<string, unknown>;
      const collect = (v: unknown) => {
        if (typeof v === "string" && v.length > 1 && v.length < 80) lookBrands[v] = (lookBrands[v] ?? 0) + 1;
        else if (Array.isArray(v)) v.forEach(collect);
        else if (v && typeof v === "object") Object.values(v).forEach(collect);
      };
      collect(brief.brand ?? brief.brands ?? brief.hero_brand);
      if (l.destination) {
        // Tag every brand we touched in this candidate with the destination
      }
    }
    for (const [b, n] of Object.entries(lookBrands)) {
      const agg = bump(b);
      if (!agg) continue;
      agg.sources.add("look_candidates");
      agg.times_selected_for_looks += n;
    }

    /* — Source E: editorial_reference_library (image intelligence) */
    type EditRow = {
      destination: string | null;
      activity: string | null;
      mood: string | null;
      color_story: string | null;
      silhouette_strategy: string | null;
      texture_strategy: string | null;
    };
    const { data: editRows } = (await sb
      .from("editorial_reference_library")
      .select(
        "destination, activity, mood, color_story, silhouette_strategy, texture_strategy",
      )) as { data: EditRow[] | null };
    // Aggregate into pattern stats (no brand attribution at this layer).
    const editorialPatterns = {
      destinations: countBy((editRows ?? []).map((e) => e.destination)),
      activities: countBy((editRows ?? []).map((e) => e.activity)),
      moods: countBy((editRows ?? []).map((e) => e.mood)),
      color_stories: countBy((editRows ?? []).map((e) => e.color_story)),
      silhouettes: countBy((editRows ?? []).map((e) => e.silhouette_strategy)),
      textures: countBy((editRows ?? []).map((e) => e.texture_strategy)),
    };

    /* ─────────── Write founder_reference_products ─────────── */
    let refInserted = 0;
    if (refRows.length > 0) {
      // Chunk inserts to stay under PostgREST limits.
      for (let i = 0; i < refRows.length; i += 200) {
        const chunk = refRows.slice(i, i + 200);
        const { error } = await sb.from("founder_reference_products").insert(chunk);
        if (!error) refInserted += chunk.length;
      }
    }

    /* ─────────── Write brand_intelligence ─────────── */
    let brandsInserted = 0;
    const brandIntelRows = Array.from(brandMap.values()).map((agg) => ({
      brand: agg.brand,
      slug: agg.slug,
      status: mapBrandStatus(agg.status_from_brands),
      source: "backfill:" + Array.from(agg.sources).join(","),
      suggested_tier: agg.tier,
      suggested_activities: Array.from(agg.activities),
      suggested_destinations: Array.from(agg.destinations),
      associated_destinations: Array.from(agg.destinations),
      times_seen: agg.times_seen,
      times_uploaded_by_founder: 0,
      times_selected_for_looks: agg.times_selected_for_looks,
      times_saved_to_library: 0,
      founder_reference_count: agg.founder_reference_count,
    }));
    if (brandIntelRows.length > 0) {
      for (let i = 0; i < brandIntelRows.length; i += 200) {
        const chunk = brandIntelRows.slice(i, i + 200);
        const { error } = await sb.from("brand_intelligence").insert(chunk);
        if (!error) brandsInserted += chunk.length;
      }
    }

    /* ─────────── Write brand_review_queue for pending brands ─────────── */
    let queueInserted = 0;
    const pendingBrands = Array.from(brandMap.values()).filter(
      (b) => mapBrandStatus(b.status_from_brands) === "pending_review",
    );
    const queueRows = pendingBrands.map((agg) => ({
      brand: agg.brand,
      brand_slug: agg.slug,
      times_seen: agg.times_seen,
      source_urls: [],
      products_found: [],
      suggested_tier: agg.tier,
      suggested_activities: Array.from(agg.activities),
      suggested_destinations: Array.from(agg.destinations),
      review_status: "pending",
    }));
    if (queueRows.length > 0) {
      for (let i = 0; i < queueRows.length; i += 200) {
        const chunk = queueRows.slice(i, i + 200);
        const { error } = await sb.from("brand_review_queue").insert(chunk);
        if (!error) queueInserted += chunk.length;
      }
    }

    /* ─────────── Phase 5 + 8: Pattern stats + report ─────────── */
    const approvedRefBrands = Array.from(brandMap.values()).filter((b) => b.founder_reference_count > 0);
    const topBrandsByReferences = approvedRefBrands
      .sort((a, b) => b.founder_reference_count - a.founder_reference_count)
      .slice(0, 15)
      .map((b) => ({ brand: b.brand, count: b.founder_reference_count }));
    const topBrandsBySelections = Array.from(brandMap.values())
      .filter((b) => b.times_selected_for_looks > 0)
      .sort((a, b) => b.times_selected_for_looks - a.times_selected_for_looks)
      .slice(0, 15)
      .map((b) => ({ brand: b.brand, count: b.times_selected_for_looks }));

    const allDestinations = refRows.flatMap((r) => (r.destination_tags as string[]) ?? []);
    const allActivities = refRows.flatMap((r) => (r.activity_tags as string[]) ?? []);
    const allStyles = refRows.flatMap((r) => (r.style_tags as string[]) ?? []);
    const allCategories = refRows.map((r) => r.product_category as string | null);

    const statusBreakdown = {
      approved: 0,
      approved_selectively: 0,
      pending_review: 0,
      rejected: 0,
      archived: 0,
    };
    for (const agg of brandMap.values()) {
      const s = mapBrandStatus(agg.status_from_brands);
      statusBreakdown[s as keyof typeof statusBreakdown] =
        (statusBreakdown[s as keyof typeof statusBreakdown] ?? 0) + 1;
    }

    const gaps: string[] = [];
    if (approvedRefBrands.length < 10)
      gaps.push("Fewer than 10 brands have founder references — sourcing signal is thin.");
    if (statusBreakdown.pending_review > statusBreakdown.approved)
      gaps.push(
        `${statusBreakdown.pending_review} brands awaiting review vs ${statusBreakdown.approved} approved — work the queue.`,
      );
    if (Object.keys(topByCount(allDestinations)).length < 3)
      gaps.push("Founder references cover fewer than 3 destinations — expand reference coverage.");
    if (Object.keys(topByCount(allActivities)).length < 4)
      gaps.push("Activity coverage is narrow — add references for under-represented activities.");

    return {
      ok: true as const,
      audit,
      backfill: {
        founder_references_written: refInserted,
        brand_intelligence_written: brandsInserted,
        brand_review_queue_written: queueInserted,
      },
      patterns: {
        top_destinations: topByCount(allDestinations),
        top_activities: topByCount(allActivities),
        top_style_families: topByCount(allStyles),
        top_categories: topByCount(allCategories),
        top_brands_by_references: topBrandsByReferences,
        top_brands_by_selections: topBrandsBySelections,
        editorial_patterns: editorialPatterns,
      },
      status_breakdown: statusBreakdown,
      gaps,
    };
  });

/* ─────────── helpers ─────────── */

function mapBrandStatus(s: string | null): "approved" | "pending_review" | "rejected" | "archived" {
  if (s === "approved") return "approved";
  if (s === "archived") return "archived";
  if (s === "rejected") return "rejected";
  return "pending_review";
}

function countBy(arr: Array<string | null | undefined>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const v of arr) {
    if (!v) continue;
    out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}

function topByCount(arr: Array<string | null | undefined>, n = 10): Array<{ key: string; count: number }> {
  return Object.entries(countBy(arr))
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function auditExisting(sb: any) {
  const tables = [
    "sourced_products",
    "vault_products",
    "products",
    "look_candidates",
    "brands",
    "editorial_reference_library",
    "founder_uploaded_urls",
    "founder_reference_products",
    "brand_intelligence",
    "brand_review_queue",
  ];
  const counts: Record<string, number> = {};
  for (const t of tables) {
    const { count } = await sb.from(t).select("*", { count: "exact", head: true });
    counts[t] = count ?? 0;
  }
  const { data: brandsByStatus } = await sb.from("brands").select("status");
  const brandStatuses = countBy((brandsByStatus ?? []).map((r: { status: string | null }) => r.status));
  const { data: srcByStatus } = await sb.from("sourced_products").select("status, image_url");
  const sourcedStatuses = countBy((srcByStatus ?? []).map((r: { status: string | null }) => r.status));
  const sourcedWithImages = (srcByStatus ?? []).filter(
    (r: { image_url: string | null }) => Boolean(r.image_url),
  ).length;
  return {
    counts,
    brand_statuses: brandStatuses,
    sourced_product_statuses: sourcedStatuses,
    sourced_products_with_images: sourcedWithImages,
  };
}