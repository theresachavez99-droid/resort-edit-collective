// Product Search Provider abstraction (Founder Buying Office §6a).
// Buying Office code must depend on this interface, never on a specific
// retrieval backend (Firecrawl, scrape, affiliate feed, etc.).

export type ApprovedRetailer =
  | "revolve.com"
  | "mytheresa.com"
  | "net-a-porter.com"
  | "shopbop.com"
  | "saksfifthavenue.com"
  | "neimanmarcus.com"
  | "bloomingdales.com"
  | "nordstrom.com"
  | "fwrd.com"
  | "luisaviaroma.com";

export type SearchStrategy =
  | "editorial_first"
  | "brand_discovery"
  | "brand_focus"
  | "replacement";

export type SearchDepth = "quick" | "standard" | "deep_buy";

/**
 * Editorial Category Set — the primary search driver. Replaces single
 * "Hero Category". Generated from the locked Founder Hero Brief +
 * MOMENT_CATEGORY_SETS. Garment categories are retrieval strategies,
 * not editorial constraints.
 */
export interface EditorialCategorySetInput {
  moment: string;
  primary: string[];
  secondary: string[];
}

export interface ProductSearchInput {
  sessionId: string;
  categorySet: EditorialCategorySetInput;
  retailers: ApprovedRetailer[];
  strategy: SearchStrategy;
  depth: SearchDepth;
  priceCeiling?: number;
  brandInclude?: string[];
  brandExclude?: string[];
  exclusionTags?: string[];
}

export interface NormalizedCandidate {
  source_url: string;
  retailer: ApprovedRetailer;
  brand: string | null;
  title: string;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  category_match: string; // which editorial category surfaced it
  category_tier: "primary" | "secondary"; // tier within the Moment's set
  raw: Record<string, unknown>;
}

export interface MarketCoveragePerRetailer {
  retailer: ApprovedRetailer;
  category: string;
  category_urls_visited: string[];
  pages_paginated: number;
  raw_cards_found: number;
  normalized: number;
  errors: string[];
}

export interface ProductSearchResult {
  sessionId: string;
  providerId: ProductSearchProvider["id"];
  candidates: NormalizedCandidate[];
  coverage: MarketCoveragePerRetailer[];
  startedAt: string;
  finishedAt: string;
}

export interface ProductSearchProvider {
  id:
    | "firecrawl_search"
    | "category_scrape"
    | "affiliate_feed"
    | "retailer_api"
    | "offline_fixture";
  search(input: ProductSearchInput): Promise<ProductSearchResult>;
}
