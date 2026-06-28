/**
 * Manual Import Provider — V1.
 *
 * Accepts:
 *   - a list of product URLs (pasted by the Founder), or
 *   - structured rows (CSV / spreadsheet paste) with brand, name, price, image, etc.
 *
 * For URL-only entries we try og:image + meta extraction to enrich
 * brand / title / image / price. If extraction fails we keep the row
 * and flag image_missing so the Founder can paste an image URL in the UI.
 *
 * Hard rules:
 *   - never invent product images
 *   - never invent affiliate URLs
 *   - keep affiliate_status = "pending" when no affiliate URL is supplied
 *   - normalize all rows to NormalizedCandidate shape
 */

import { extractOgImage } from "@/lib/og-image.server";
import type {
  ApprovedRetailer,
  NormalizedCandidate,
  ProductSearchInput,
  ProductSearchProvider,
  ProductSearchResult,
} from "./provider";

const APPROVED: ApprovedRetailer[] = [
  "revolve.com",
  "mytheresa.com",
  "net-a-porter.com",
  "shopbop.com",
  "saksfifthavenue.com",
  "neimanmarcus.com",
  "bloomingdales.com",
  "nordstrom.com",
  "fwrd.com",
  "luisaviaroma.com",
];

export type ManualImportRow = {
  product_url: string;
  affiliate_url?: string | null;
  product_name?: string | null;
  brand?: string | null;
  retailer?: string | null;
  category?: string | null;
  color?: string | null;
  price?: number | null;
  currency?: string | null;
  image_url?: string | null;
  description?: string | null;
  notes?: string | null;
};

export type ManualImportRawCandidate = {
  source: "manual_import";
  source_adapter: "url_paste" | "row_import";
  product_url: string;
  canonical_url: string;
  affiliate_url: string | null;
  affiliate_status: "linked" | "pending";
  retailer: string | null;
  retailer_approved: boolean;
  brand: string | null;
  product_name: string | null;
  category: string | null;
  color: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  image_missing: boolean;
  image_diagnostic: string | null;
  description: string | null;
  notes: string | null;
  raw: Record<string, unknown>;
};

export function canonicalizeUrl(input: string): string {
  try {
    const u = new URL(input.trim());
    // Strip common tracking params; keep the rest.
    const drop = [
      "utm_source","utm_medium","utm_campaign","utm_content","utm_term",
      "gclid","fbclid","cjevent","irclickid","sscid","rmid","ranEAID","ranSiteID","ranMID",
    ];
    for (const k of drop) u.searchParams.delete(k);
    u.hash = "";
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.replace(/\/+$/, "");
    }
    return u.toString();
  } catch {
    return input.trim();
  }
}

export function retailerFromUrl(input: string): { retailer: string | null; approved: boolean } {
  try {
    const host = new URL(input).hostname.toLowerCase().replace(/^www\./, "");
    const match = APPROVED.find((r) => host === r || host.endsWith("." + r));
    if (match) return { retailer: match, approved: true };
    return { retailer: host, approved: false };
  } catch {
    return { retailer: null, approved: false };
  }
}

function brandFromTitle(title: string | null): string | null {
  if (!title) return null;
  // Common patterns: "Brand Name | Retailer", "Brand Name - Product"
  const sep = title.split(/\s[\|\-–—]\s/);
  if (sep.length >= 2) return sep[0].trim().slice(0, 80);
  return null;
}

async function enrichFromUrl(url: string, row: ManualImportRow): Promise<{
  image_url: string | null;
  image_missing: boolean;
  image_diagnostic: string | null;
  product_name: string | null;
  brand: string | null;
  price: number | null;
  currency: string | null;
}> {
  // If founder already supplied an image, skip the network call entirely.
  let image_url = row.image_url ?? null;
  let image_diagnostic: string | null = null;
  let product_name = row.product_name ?? null;
  let brand = row.brand ?? null;
  let price = row.price ?? null;
  let currency = row.currency ?? null;

  if (!image_url || !product_name) {
    try {
      const og = await extractOgImage(url);
      if (!image_url) {
        image_url = og.image_url;
        if (!og.image_url) image_diagnostic = og.reason ?? "no og:image / twitter:image";
      }
      // Best-effort title/brand from <title> tag — extractOgImage doesn't return it,
      // so do a cheap second fetch only if we still need it.
      if (!product_name) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 6000);
          const r = await fetch(url, {
            signal: ctrl.signal,
            headers: {
              "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });
          clearTimeout(t);
          if (r.ok) {
            const html = await r.text();
            const tm = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (tm) product_name = tm[1].trim().slice(0, 240);
            if (!brand) brand = brandFromTitle(product_name);
            const pm =
              html.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i) ||
              html.match(/<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i);
            if (pm && !price) {
              const n = Number(pm[1]);
              if (Number.isFinite(n)) price = n;
            }
            const cm =
              html.match(/<meta[^>]+property=["']product:price:currency["'][^>]+content=["']([^"']+)["']/i) ||
              html.match(/<meta[^>]+property=["']og:price:currency["'][^>]+content=["']([^"']+)["']/i);
            if (cm && !currency) currency = cm[1];
          }
        } catch {
          // ignore — we already have what we could extract
        }
      }
    } catch {
      image_diagnostic = "extraction failed";
    }
  }

  return {
    image_url: image_url ?? null,
    image_missing: !image_url,
    image_diagnostic,
    product_name,
    brand,
    price,
    currency,
  };
}

/**
 * Normalize one Founder-supplied row into the raw candidate shape persisted
 * in `buying_candidates`. Network enrichment is best-effort and never blocks
 * the import; missing fields are surfaced in the UI.
 */
export async function normalizeManualRow(
  row: ManualImportRow,
  adapter: "url_paste" | "row_import",
): Promise<ManualImportRawCandidate> {
  const product_url = row.product_url.trim();
  const canonical_url = canonicalizeUrl(product_url);
  const { retailer: detectedRetailer, approved } = retailerFromUrl(product_url);
  const retailer = row.retailer?.trim() || detectedRetailer;

  const enrich = await enrichFromUrl(product_url, row);
  return {
    source: "manual_import",
    source_adapter: adapter,
    product_url,
    canonical_url,
    affiliate_url: row.affiliate_url?.trim() || null,
    affiliate_status: row.affiliate_url?.trim() ? "linked" : "pending",
    retailer,
    retailer_approved: approved,
    brand: row.brand?.trim() || enrich.brand,
    product_name: row.product_name?.trim() || enrich.product_name,
    category: row.category?.trim() || null,
    color: row.color?.trim() || null,
    price: row.price ?? enrich.price,
    currency: row.currency?.trim() || enrich.currency || (enrich.price ? "USD" : null),
    image_url: row.image_url?.trim() || enrich.image_url,
    image_missing: !(row.image_url?.trim() || enrich.image_url),
    image_diagnostic: enrich.image_diagnostic,
    description: row.description?.trim() || null,
    notes: row.notes?.trim() || null,
    raw: { input: row, enrich },
  };
}

export const manualImportProvider: ProductSearchProvider = {
  id: "affiliate_feed" as never, // not surfaced through ProductSearchProvider.search — kept here so
  // future code that switches on provider.id won't break.
  async search(input: ProductSearchInput): Promise<ProductSearchResult> {
    // Manual import does not run a query; rows arrive via the admin UI.
    return {
      sessionId: input.sessionId,
      providerId: "affiliate_feed",
      candidates: [] as NormalizedCandidate[],
      coverage: [],
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    };
  },
};