// Category Scrape Provider — fetches retailer category-listing pages directly
// (rather than Google-indexed search), traverses pagination, and extracts
// product cards from JSON-LD ItemList or schema.org Product blocks.
//
// Server-only. Uses Firecrawl /scrape under the hood, but Buying Office code
// must depend on the ProductSearchProvider interface, NOT this module.

import {
  endpointsFor,
  type EditorialCategoryKey,
} from "./category-registry";
import type {
  ApprovedRetailer,
  MarketCoveragePerRetailer,
  NormalizedCandidate,
  ProductSearchInput,
  ProductSearchProvider,
  ProductSearchResult,
} from "./provider";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

interface ScrapeOk {
  html?: string;
  markdown?: string;
  metadata?: { sourceURL?: string };
}

async function firecrawlScrape(url: string): Promise<ScrapeOk | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["html"],
      onlyMainContent: false,
      waitFor: 1500,
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: ScrapeOk } & ScrapeOk;
  return (json.data ?? json) as ScrapeOk;
}

// Extract product cards from JSON-LD ItemList blocks (the format every
// approved retailer emits for category pages).
function extractJsonLdProducts(html: string): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const blocks = Array.isArray(parsed) ? parsed : [parsed];
      for (const block of blocks) {
        const type = (block as { "@type"?: string | string[] })["@type"];
        const types = Array.isArray(type) ? type : [type];
        if (types.includes("ItemList")) {
          const items = (block as { itemListElement?: unknown[] }).itemListElement ?? [];
          for (const it of items) {
            const item = (it as { item?: Record<string, unknown> }).item ?? it;
            if (item && typeof item === "object") out.push(item as Record<string, unknown>);
          }
        } else if (types.includes("Product")) {
          out.push(block as Record<string, unknown>);
        }
      }
    } catch {
      // skip malformed block
    }
  }
  return out;
}

function normalizeOne(
  raw: Record<string, unknown>,
  retailer: ApprovedRetailer,
  categoryMatch: string,
  categoryTier: "primary" | "secondary",
): NormalizedCandidate | null {
  const url = (raw.url ?? raw["@id"]) as string | undefined;
  const name = raw.name as string | undefined;
  if (!url || !name) return null;
  const brandRaw = raw.brand as { name?: string } | string | undefined;
  const brand = typeof brandRaw === "string" ? brandRaw : brandRaw?.name ?? null;
  const offers = raw.offers as
    | { price?: string | number; priceCurrency?: string }
    | Array<{ price?: string | number; priceCurrency?: string }>
    | undefined;
  const offer = Array.isArray(offers) ? offers[0] : offers;
  const priceVal = offer?.price;
  const price =
    priceVal == null ? null : typeof priceVal === "number" ? priceVal : Number(priceVal);
  const image = raw.image as string | string[] | undefined;
  const image_url = Array.isArray(image) ? image[0] ?? null : image ?? null;
  return {
    source_url: url,
    retailer,
    brand,
    title: name,
    price: Number.isFinite(price) ? (price as number) : null,
    currency: offer?.priceCurrency ?? null,
    image_url,
    category_match: categoryMatch,
    category_tier: categoryTier,
    raw,
  };
}

function dedupe(candidates: NormalizedCandidate[]): NormalizedCandidate[] {
  const seen = new Set<string>();
  const out: NormalizedCandidate[] = [];
  for (const c of candidates) {
    const key = c.source_url.split("?")[0].toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

export function makeCategoryScrapeProvider(): ProductSearchProvider {
  return {
    id: "category_scrape",
    async search(input: ProductSearchInput): Promise<ProductSearchResult> {
      const startedAt = new Date().toISOString();
      const coverage: MarketCoveragePerRetailer[] = [];
      const candidates: NormalizedCandidate[] = [];

      const primarySet = new Set(input.categorySet.primary);
      const categoryKeys = [
        ...input.categorySet.primary,
        ...input.categorySet.secondary,
      ] as EditorialCategoryKey[];

      for (const retailer of input.retailers) {
        for (const categoryKey of categoryKeys) {
          const endpoints = endpointsFor(retailer, categoryKey);
          if (endpoints.length === 0) continue;
          const tier: "primary" | "secondary" = primarySet.has(categoryKey)
            ? "primary"
            : "secondary";

          const cov: MarketCoveragePerRetailer = {
            retailer,
            category: categoryKey,
            category_urls_visited: [],
            pages_paginated: 0,
            raw_cards_found: 0,
            normalized: 0,
            errors: [],
          };

          for (const ep of endpoints) {
            const maxPages = ep.maxPages[input.depth];
            for (let page = 1; page <= maxPages; page++) {
              const url = ep.template.replace("{page}", String(page));
              cov.category_urls_visited.push(url);
              try {
                const scraped = await firecrawlScrape(url);
                if (!scraped?.html) {
                  cov.errors.push(`empty:${url}`);
                  break;
                }
                cov.pages_paginated += 1;
                const raws = extractJsonLdProducts(scraped.html);
                cov.raw_cards_found += raws.length;
                for (const raw of raws) {
                  const norm = normalizeOne(raw, retailer, categoryKey, tier);
                  if (!norm) continue;
                  if (input.priceCeiling && norm.price && norm.price > input.priceCeiling) continue;
                  candidates.push(norm);
                  cov.normalized += 1;
                }
                if (raws.length === 0) break; // no more products on this listing
              } catch (err) {
                cov.errors.push(
                  `error:${url}:${err instanceof Error ? err.message : "unknown"}`,
                );
                break;
              }
            }
          }
          coverage.push(cov);
        }
      }

      return {
        sessionId: input.sessionId,
        providerId: "category_scrape",
        candidates: dedupe(candidates),
        coverage,
        startedAt,
        finishedAt: new Date().toISOString(),
      };
    },
  };
}
