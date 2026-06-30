// Datafeedr adapter — Step 3 / Gate B.
//
// Scaffolded behind the ProductSearchProvider interface with NO API key
// wired. The adapter is deliberately DORMANT: every search returns zero
// candidates and a `feed_not_connected` status. This is the CORRECT
// behavior until the founder signals Step 4. Do NOT add a fallback that
// fabricates candidates when the feed is empty — that fallback IS the
// fabrication path Gate C exists to prevent.
//
// To wake in Step 4: set DATAFEEDR_API_KEY (via add_secret) and replace
// `search()` with the live fetch. status() must then return "connected".

import type {
  ProductSearchProvider,
  ProductSearchInput,
  ProductSearchResult,
} from "./provider";

export type FeedStatus =
  | { connected: false; reason: "not-connected"; detail: string }
  | { connected: true; reason: "ok"; detail: string };

export class DatafeedrAdapter implements ProductSearchProvider {
  readonly id = "affiliate_feed" as const;

  status(): FeedStatus {
    const key = process.env.DATAFEEDR_API_KEY;
    if (!key) {
      return {
        connected: false,
        reason: "not-connected",
        detail:
          "DATAFEEDR_API_KEY is not set. Adapter is dormant by design — Gate B keeps the feed offline until Step 4.",
      };
    }
    return { connected: true, reason: "ok", detail: "Datafeedr key present." };
  }

  async search(input: ProductSearchInput): Promise<ProductSearchResult> {
    const startedAt = new Date().toISOString();
    // Dormant: regardless of input, return zero candidates. No fallback.
    return {
      sessionId: input.sessionId,
      providerId: this.id,
      candidates: [],
      coverage: input.retailers.map((retailer) => ({
        retailer,
        category: input.categorySet.primary[0] ?? "",
        category_urls_visited: [],
        pages_paginated: 0,
        raw_cards_found: 0,
        normalized: 0,
        errors: ["feed_not_connected"],
      })),
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }
}

export const datafeedrAdapter = new DatafeedrAdapter();