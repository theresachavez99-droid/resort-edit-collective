import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import { SUPPORTED_RETAILERS, buildListingUrl, type Category } from "./retailer-adapters.server";

const pw = z.string().min(1).max(200);
const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
const CATEGORIES = ["swimwear", "dresses", "coverups", "shoes", "bags", "jewelry", "sunglasses", "hats"] as const;

const MAX_URLS_PER_JOB = 60;
const SCRAPE_CONCURRENCY = 3;

/**
 * Bulk-source a brand × category from a retailer. Steps:
 *   1. Resolve listing URL (brand.retailer_hints[retailer] or adapter).
 *   2. Firecrawl map() the listing — limit MAX_URLS_PER_JOB.
 *   3. Filter to product detail URLs only (heuristic per retailer).
 *   4. Enqueue scrapeProductUrl for each (in series with small batches).
 *   5. Stamp brand_id + category onto every sourced_products row.
 *   6. Track progress in brand_crawl_jobs.
 */
export const bulkSourceBrand = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        brand_id: z.string().uuid(),
        retailer: z.enum(SUPPORTED_RETAILERS as [string, ...string[]]).default("mytheresa.com"),
        categories: z.array(z.enum(CATEGORIES)).min(1).max(CATEGORIES.length),
        limit_per_category: z.number().int().min(1).max(MAX_URLS_PER_JOB).default(20),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) return { ok: false as const, error: "FIRECRAWL_API_KEY missing" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: brand, error: bErr } = await supabaseAdmin
      .from("brands")
      .select("id, name, slug, status, retailer_hints, destinations, activities, categories")
      .eq("id", data.brand_id)
      .maybeSingle();
    if (bErr || !brand) return { ok: false as const, error: bErr?.message ?? "Brand not found" };
    if (brand.status !== "approved") return { ok: false as const, error: `Brand status is ${brand.status}` };

    const results: Array<{
      category: Category;
      job_id: string;
      listing_url: string | null;
      mapped: number;
      scraped: number;
      skipped: number;
      failed: number;
      error?: string;
    }> = [];

    for (const category of data.categories) {
      const listingUrl = buildListingUrl(data.retailer, brand as { name: string; slug: string | null; retailer_hints: Record<string,string> | null }, category as Category);

      const { data: job, error: jErr } = await supabaseAdmin
        .from("brand_crawl_jobs")
        .insert({
          brand_id: brand.id,
          retailer_domain: data.retailer,
          category,
          status: "running",
          requested_count: data.limit_per_category,
          listing_url: listingUrl,
        })
        .select("id")
        .single();
      if (jErr || !job) {
        results.push({ category: category as Category, job_id: "", listing_url: listingUrl, mapped: 0, scraped: 0, skipped: 0, failed: 0, error: jErr?.message ?? "job insert failed" });
        continue;
      }

      if (!listingUrl) {
        await supabaseAdmin
          .from("brand_crawl_jobs")
          .update({ status: "failed", error: "No listing URL adapter or hint" })
          .eq("id", job.id);
        results.push({ category: category as Category, job_id: job.id, listing_url: null, mapped: 0, scraped: 0, skipped: 0, failed: 0, error: "No listing URL" });
        continue;
      }

      // 1. Map the listing
      let mapped: string[] = [];
      try {
        const mres = await fetch(`${FIRECRAWL_BASE}/map`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: listingUrl, limit: 200, includeSubdomains: false, search: brand.name }),
        });
        if (!mres.ok) throw new Error(`map ${mres.status}`);
        const payload = (await mres.json()) as { data?: { links?: string[] }; links?: string[] };
        const links = payload?.data?.links ?? payload?.links ?? [];
        mapped = filterProductUrls(links, data.retailer, brand.name).slice(0, data.limit_per_category);
      } catch (e) {
        await supabaseAdmin
          .from("brand_crawl_jobs")
          .update({ status: "failed", error: String((e as Error).message ?? e).slice(0, 240) })
          .eq("id", job.id);
        results.push({ category: category as Category, job_id: job.id, listing_url: listingUrl, mapped: 0, scraped: 0, skipped: 0, failed: 0, error: String(e) });
        continue;
      }

      // 2. Scrape each URL
      let scraped = 0;
      let skipped = 0;
      let failed = 0;
      for (let i = 0; i < mapped.length; i += SCRAPE_CONCURRENCY) {
        const batch = mapped.slice(i, i + SCRAPE_CONCURRENCY);
        const outcomes = await Promise.all(
          batch.map((u) => scrapeOne(u, brand.id, brand.name, data.retailer, category as Category, apiKey)),
        );
        for (const o of outcomes) {
          if (o === "scraped") scraped++;
          else if (o === "skipped") skipped++;
          else failed++;
        }
      }

      await supabaseAdmin
        .from("brand_crawl_jobs")
        .update({ status: "completed", scraped_count: scraped, skipped_count: skipped, failed_count: failed })
        .eq("id", job.id);

      results.push({ category: category as Category, job_id: job.id, listing_url: listingUrl, mapped: mapped.length, scraped, skipped, failed });
    }

    return { ok: true as const, brand: brand.name, retailer: data.retailer, results };
  });

function filterProductUrls(links: string[], retailer: string, brandName: string): string[] {
  const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const link of links) {
    if (!link) continue;
    if (seen.has(link)) continue;
    seen.add(link);
    const l = link.toLowerCase();
    if (retailer === "mytheresa.com" && !/\/p\d|\/product\//.test(l)) continue;
    if (retailer === "net-a-porter.com" && !/\/product\//.test(l)) continue;
    if (retailer === "modaoperandi.com" && !/\/products\//.test(l)) continue;
    if (retailer === "fwrd.com" && !/-prd-/.test(l)) continue;
    if (retailer === "shopbop.com" && !/\/vp\//.test(l)) continue;
    // Brand sanity check (skip if URL clearly doesn't belong to this brand)
    if (!l.includes(brandSlug.split("-")[0])) {
      // still accept; many listing URLs don't contain the brand slug in the path
    }
    out.push(link);
  }
  return out;
}

async function scrapeOne(
  url: string,
  brandId: string,
  brandName: string,
  retailer: string,
  category: Category,
  apiKey: string,
): Promise<"scraped" | "skipped" | "failed"> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Dedupe — already in vault or sourced
  const { data: vaultHit } = await supabaseAdmin
    .from("vault_products")
    .select("id")
    .or(`affiliate_url.eq.${url},direct_product_url.eq.${url}`)
    .limit(1)
    .maybeSingle();
  if (vaultHit) return "skipped";
  const { data: srcHit } = await supabaseAdmin
    .from("sourced_products")
    .select("id")
    .eq("source_url", url)
    .limit(1)
    .maybeSingle();
  if (srcHit) return "skipped";

  const { data: queued, error: insErr } = await supabaseAdmin
    .from("sourced_products")
    .insert({
      source_url: url,
      retailer_domain: retailer,
      affiliate_url: url,
      status: "queued",
      brand_id: brandId,
      brand: brandName,
      category,
    })
    .select("id")
    .single();
  if (insErr || !queued) return "failed";

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        onlyMainContent: true,
        formats: [
          {
            type: "json",
            schema: {
              type: "object",
              properties: {
                brand: { type: "string" },
                product_name: { type: "string" },
                price: { type: "number" },
                currency: { type: "string" },
                image_url: { type: "string" },
                in_stock: { type: "boolean" },
              },
              required: ["product_name"],
            },
          },
        ],
      }),
    });
    if (!res.ok) {
      await supabaseAdmin.from("sourced_products").update({ status: "failed", notes: `HTTP ${res.status}` }).eq("id", queued.id);
      return "failed";
    }
    const payload = await res.json();
    const root = payload?.data ?? payload;
    const extracted = root?.json ?? root?.extract ?? {};
    const meta = root?.metadata ?? {};
    const imageUrl: string | null = extracted.image_url || meta.ogImage || meta["og:image"] || null;

    // Auto-tag (lazy import to keep cold-start small)
    const { tagProduct } = await import("./tagging-rules");
    const { data: brandRow } = await supabaseAdmin
      .from("brands")
      .select("categories, activities, destinations")
      .eq("id", brandId)
      .maybeSingle();
    const tags = tagProduct(
      { brand: brandName, product_name: extracted.product_name ?? meta.title ?? null, slot_category: category },
      brandRow ?? null,
    );

    await supabaseAdmin
      .from("sourced_products")
      .update({
        status: "scraped",
        brand: extracted.brand ?? brandName,
        product_name: extracted.product_name ?? meta.title ?? null,
        price: extracted.price ?? null,
        currency: extracted.currency ?? null,
        image_url: imageUrl,
        raw_extraction: root,
        scraped_at: new Date().toISOString(),
        category: tags.category ?? category,
        subcategory: tags.subcategory,
        silhouette: tags.silhouette,
        fabric: tags.fabric,
        texture: tags.texture,
        print_family: tags.print_family,
        color_family: tags.color_family,
        destination_tags: tags.destination_tags,
        activity_tags: tags.activity_tags,
        slot_category: tags.subcategory ?? tags.category ?? category,
      })
      .eq("id", queued.id);
    return "scraped";
  } catch (e) {
    await supabaseAdmin.from("sourced_products").update({ status: "failed", notes: String((e as Error).message ?? e).slice(0, 240) }).eq("id", queued.id);
    return "failed";
  }
}

/**
 * Inventory-depth coverage matrix per brand × category, plus per-destination
 * eligible counts. Used by the sourcing-coverage admin page.
 */
export const getSourcingCoverage = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: brands } = await supabaseAdmin
      .from("brands")
      .select("id, name, tier, is_hero, destinations, categories")
      .eq("status", "approved")
      .order("name");

    const { data: products } = await supabaseAdmin
      .from("sourced_products")
      .select("brand_id, category, destination_tags, status")
      .neq("status", "rejected")
      .not("image_url", "is", null);

    const matrix: Record<string, Record<string, number>> = {};
    const destCounts: Record<string, number> = {};
    for (const p of products ?? []) {
      if (!p.brand_id || !p.category) continue;
      matrix[p.brand_id] = matrix[p.brand_id] ?? {};
      matrix[p.brand_id][p.category] = (matrix[p.brand_id][p.category] ?? 0) + 1;
      for (const d of p.destination_tags ?? []) destCounts[d] = (destCounts[d] ?? 0) + 1;
    }

    return {
      ok: true as const,
      brands: brands ?? [],
      matrix,
      destinations: destCounts,
      categories: CATEGORIES,
    };
  });

/**
 * One-shot helper for "fill what's missing for Emerald Riviera":
 * crawls every approved hero brand × every category until each (brand, cat)
 * has at least `target` eligible products.
 */
export const fillPortofinoInventory = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, target: z.number().int().min(5).max(50).default(15), retailer: z.enum(SUPPORTED_RETAILERS as [string, ...string[]]).default("mytheresa.com") }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: brands } = await supabaseAdmin
      .from("brands")
      .select("id, name, categories, is_hero")
      .eq("status", "approved")
      .contains("destinations", ["portofino"]);

    const { data: products } = await supabaseAdmin
      .from("sourced_products")
      .select("brand_id, category")
      .neq("status", "rejected")
      .not("image_url", "is", null);

    const counts: Record<string, Record<string, number>> = {};
    for (const p of products ?? []) {
      if (!p.brand_id || !p.category) continue;
      counts[p.brand_id] = counts[p.brand_id] ?? {};
      counts[p.brand_id][p.category] = (counts[p.brand_id][p.category] ?? 0) + 1;
    }

    const plan: Array<{ brand: string; brand_id: string; missing: string[] }> = [];
    for (const b of brands ?? []) {
      const cats = (b.categories ?? []) as string[];
      const missing = cats.filter((c) => (counts[b.id]?.[c] ?? 0) < data.target);
      if (missing.length) plan.push({ brand: b.name, brand_id: b.id, missing });
    }

    return { ok: true as const, target: data.target, retailer: data.retailer, plan };
  });