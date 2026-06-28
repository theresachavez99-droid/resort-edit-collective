/**
 * Affiliate Feed Provider — V1 scaffold.
 *
 * Composes the network adapters under `affiliate-adapters/`. Adapters
 * report status() so the Buying Office UI can show pending vs ready
 * networks. search() iterates ready adapters; until a network is wired,
 * its search returns no candidates (never invented data).
 */

import type {
  ProductSearchInput,
  ProductSearchProvider,
  ProductSearchResult,
  NormalizedCandidate,
} from "./provider";
import {
  ALL_AFFILIATE_ADAPTERS,
  type AffiliateAdapterStatus,
} from "./affiliate-adapters";

export interface AffiliateProviderReadiness {
  ready: AffiliateAdapterStatus[];
  blocked: AffiliateAdapterStatus[];
  totalRetailersCovered: number;
}

export function affiliateNetworkStatus(): AffiliateAdapterStatus[] {
  return ALL_AFFILIATE_ADAPTERS.map((a) => a.status());
}

export function affiliateProviderReadiness(): AffiliateProviderReadiness {
  const statuses = affiliateNetworkStatus();
  const ready = statuses.filter((s) => s.providerReady);
  const blocked = statuses.filter((s) => !s.providerReady);
  const retailers = new Set<string>();
  for (const s of ready) for (const r of s.retailerPrograms) retailers.add(r);
  return { ready, blocked, totalRetailersCovered: retailers.size };
}

export const affiliateFeedProvider: ProductSearchProvider = {
  id: "affiliate_feed",
  async search(input: ProductSearchInput): Promise<ProductSearchResult> {
    const startedAt = new Date().toISOString();
    const candidates: NormalizedCandidate[] = [];
    for (const adapter of ALL_AFFILIATE_ADAPTERS) {
      const status = adapter.status();
      if (!status.providerReady) continue;
      try {
        const rows = await adapter.search(input);
        for (const r of rows) candidates.push(r);
      } catch {
        // adapter-level errors are reported via status, never invented
      }
    }
    return {
      sessionId: input.sessionId,
      providerId: "affiliate_feed",
      candidates,
      coverage: [],
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  },
};