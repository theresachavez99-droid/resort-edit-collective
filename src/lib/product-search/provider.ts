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

export interface HeroCategoryGroup {
  /** Primary anchor category, e.g. "tailored_coordinated_short_set". */
  primary: string;
  /** Adjacent editorially-equivalent categories searched in parallel. */
  adjacent: string[];
}

export interface ProductSearchInput {
  sessionId: string;
  heroCategory: HeroCategoryGroup;
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
  category_match: string; // which group entry surfaced it
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
