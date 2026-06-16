import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./admin-auth.server";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

/**
 * Approved retailer allowlist for Yacht Day pilot.
 * MUST match the gate in firecrawl.functions.ts.
 */
const APPROVED_RETAILERS = [
  "mytheresa.com",
  "net-a-porter.com",
  "shopbop.com",
  "saksfifthavenue.com",
  "modaoperandi.com",
  "luisaviaroma.com",
  "neimanmarcus.com",
  "everythingbutwater.com",
] as const;

const COLLECTION_PATTERNS = [
  /\/collections?\//i,
  /\/category\//i,
  /\/c\//i,
  /\/search/i,
  /\/shop\/?$/i,
  /\/women\/?$/i,
  /\/sale\/?/i,
  /\/new-in\/?/i,
];

const DEFAULT_QUERY_TEMPLATES = [
  "{brand} swimwear",
  "{brand} bikini",
  "{brand} swimsuit",
  "{brand} pareo",
  "{brand} kaftan",
  "{brand} coverup",
];

function looksLikePdp(url: string): boolean {
  try {
    const u = new URL(url);
    if (COLLECTION_PATTERNS.some((re) => re.test(u.pathname))) return false;
    // PDPs usually have a slug segment + a numeric or alphanum SKU
    return u.pathname.split("/").filter(Boolean).length >= 2;
  } catch {
    return false;
  }
}

function retailerOf(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return APPROVED_RETAILERS.find((d) => host === d || host.endsWith(`.${d}`)) ?? null;
  } catch {
    return null;
  }
}

type Candidate = {
  url: string;
  title: string | null;
  description: string | null;
  brand: string;
  brand_slug: string;
  retailer: string;
  matchedQuery: string;
  alreadyCached: boolean;
};

export const runYachtDayDryRun = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        maxBrands: z.number().int().min(1).max(30).default(12),
        retailersPerBrand: z.number().int().min(1).max(8).default(3),
        resultsPerSearch: z.number().int().min(1).max(10).default(4),
        maxCandidates: z.number().int().min(5).max(60).default(30),
        queryTemplates: z.array(z.string().min(3).max(120)).min(1).max(10).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "FIRECRAWL_API_KEY missing" };
    }

    const queryTemplates = data.queryTemplates ?? DEFAULT_QUERY_TEMPLATES;

    // 1. Pull approved brands tagged Yacht Day with at least one resortwear category.
    //    Yacht Day eligibility = swimwear OR coverups (kaftans, pareos, resort sets live here).
    const { data: brands, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("id,name,slug,tier,categories,activities")
      .eq("status", "approved")
      .contains("activities", ["Yacht Day"])
      .overlaps("categories", ["swimwear", "coverups"])
      .order("name", { ascending: true })
      .limit(data.maxBrands);

    if (brandErr) return { ok: false as const, error: brandErr.message };
    if (!brands?.length) {
      return {
        ok: false as const,
        error:
          "No approved brands tagged Yacht Day with swimwear or coverups category. Tag brands first.",
      };
    }

    // 2. Pre-load existing URLs so we can flag cached candidates
    const { data: vaultUrls } = await supabaseAdmin
      .from("vault_products")
      .select("affiliate_url,direct_product_url");
    const { data: sourcedUrls } = await supabaseAdmin
      .from("sourced_products")
      .select("source_url");

    const cachedSet = new Set<string>();
    vaultUrls?.forEach((r) => {
      if (r.affiliate_url) cachedSet.add(r.affiliate_url);
      if (r.direct_product_url) cachedSet.add(r.direct_product_url);
    });
    sourcedUrls?.forEach((r) => r.source_url && cachedSet.add(r.source_url));

    // 3. For each brand × first N retailers, Firecrawl /search (NO /scrape)
    const candidates: Candidate[] = [];
    const seenUrls = new Set<string>();
    let searchesIssued = 0;
    let searchesFailed = 0;
    let rawResultsSeen = 0;
    const errors: string[] = [];

    const retailers = APPROVED_RETAILERS.slice(0, data.retailersPerBrand);

    outer: for (const brand of brands) {
      for (const retailer of retailers) {
        for (const template of queryTemplates) {
          if (candidates.length >= data.maxCandidates) break outer;

          const brandPart = template.replace("{brand}", brand.name);
          const query = `${brandPart} site:${retailer}`;
          searchesIssued++;
          try {
            const res = await fetch(`${FIRECRAWL_BASE}/search`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query, limit: data.resultsPerSearch }),
            });
            if (!res.ok) {
              searchesFailed++;
              errors.push(`${brand.name} / "${template}" @ ${retailer}: HTTP ${res.status}`);
              continue;
            }
            const payload = await res.json();
            const root = payload?.data ?? payload;
            const items: any[] =
              (Array.isArray(root) && root) ||
              root?.web ||
              root?.results ||
              root?.data?.web ||
              [];

            for (const item of items) {
              rawResultsSeen++;
              const url: string | undefined = item.url || item.link;
              if (!url) continue;
              if (seenUrls.has(url)) continue;
              const matchedRetailer = retailerOf(url);
              if (!matchedRetailer) continue;
              if (!looksLikePdp(url)) continue;
              seenUrls.add(url);
              candidates.push({
                url,
                title: item.title ?? item.metadata?.title ?? null,
                description:
                  item.description ?? item.snippet ?? item.metadata?.description ?? null,
                brand: brand.name,
                brand_slug: brand.slug,
                retailer: matchedRetailer,
                matchedQuery: template,
                alreadyCached: cachedSet.has(url),
              });
              if (candidates.length >= data.maxCandidates) break outer;
            }
          } catch (e: any) {
            searchesFailed++;
            errors.push(
              `${brand.name} / "${template}" @ ${retailer}: ${String(e?.message ?? e).slice(0, 120)}`,
            );
          }
        }
      }
    }

    // 4. Build distribution report
    const brandHistogram: Record<string, number> = {};
    const retailerHistogram: Record<string, number> = {};
    const queryHistogram: Record<string, number> = {};
    let cachedCount = 0;
    for (const c of candidates) {
      brandHistogram[c.brand] = (brandHistogram[c.brand] ?? 0) + 1;
      retailerHistogram[c.retailer] = (retailerHistogram[c.retailer] ?? 0) + 1;
      queryHistogram[c.matchedQuery] = (queryHistogram[c.matchedQuery] ?? 0) + 1;
      if (c.alreadyCached) cachedCount++;
    }

    const brandsConsidered = brands.map((b) => ({
      name: b.name,
      slug: b.slug,
      tier: b.tier,
      foundCount: brandHistogram[b.name] ?? 0,
    }));

    return {
      ok: true as const,
      ranAt: new Date().toISOString(),
      pilot: {
        categories: ["swimwear", "coverups"],
        activity: "Yacht Day",
        queryTemplates,
      },
      telemetry: {
        searchesIssued,
        searchesFailed,
        rawResultsSeen,
        candidatesAfterFilters: candidates.length,
        cachedCandidates: cachedCount,
        approxFirecrawlCreditsUsed: searchesIssued, // /search ≈ 1 credit
        scrapesPerformed: 0, // DRY RUN
        dbWrites: 0,
      },
      brandsConsidered,
      brandHistogram,
      retailerHistogram,
      queryHistogram,
      candidates,
      errors,
    };
  });
