/**
 * v4.7 — Discovery Pipeline primitives (pure, server-safe, no DB).
 *
 * Owns the per-slot constants the engine consults to decide:
 *   - how much external discovery is allowed per slot
 *   - which approved retailers to prefer per slot
 *   - how to scope a query to a single retailer
 *   - how to classify a slot's coverage strength (4-tier)
 *
 * No Firecrawl calls live here; this module is imported by the engine
 * AND by the admin UI's "estimated search budget" preview card.
 */

export type DiscoveryMode = "fast" | "balanced" | "deep";

/**
 * Per-slot maximum Firecrawl /search requests during a single run.
 * The engine's BudgetMeter increments each /search call against the
 * slot's budget and stops issuing requests when it hits zero.
 */
export const SLOT_FIRECRAWL_BUDGET_DEFAULTS: Record<string, number> = {
  swim: 20,
  coverup: 20,
  shoes: 15,
  bag: 15,
  jewelry: 15,
  sunglasses: 15,
  hat: 10,
};

/**
 * Discovery-mode budget multipliers. Fast Review (the post-cache
 * long-term default) trims hard; Deep Discovery doubles + unlocks
 * broad fallback queries.
 */
export const DISCOVERY_MODE_BUDGET_MULTIPLIER: Record<DiscoveryMode, number> = {
  fast: 0.25,
  balanced: 1,
  deep: 2,
};

export const DISCOVERY_MODE_LABEL: Record<DiscoveryMode, string> = {
  fast: "Fast Review",
  balanced: "Balanced",
  deep: "Deep Discovery",
};

export const DISCOVERY_MODE_DESCRIPTION: Record<DiscoveryMode, string> = {
  fast:
    "Registry + product cache first. Minimal Firecrawl. Early stopping. " +
    "Recommended for daily founder review once the cache is warm.",
  balanced:
    "Registry + cache + approved-retailer search. Limited Firecrawl. " +
    "Use for normal collection generation.",
  deep:
    "Full affiliate search + Tier-2 expansion + broader Firecrawl queries. " +
    "Use to discover new inventory. Consumes significantly more credits.",
};

/**
 * Per-slot ordered retailer preference. The engine walks this list
 * and stops as soon as the slot quota is met — it does NOT finish the
 * retailer rotation for symmetry.
 *
 * Slots not listed fall back to the project-wide APPROVED_RETAILERS
 * order (see yacht-day-pilot.functions.ts).
 */
export const SLOT_RETAILER_PRIORITY: Record<string, string[]> = {
  swim: [
    "mytheresa.com",
    "net-a-porter.com",
    "modaoperandi.com",
    "saksfifthavenue.com",
    "shopbop.com",
  ],
  coverup: [
    "mytheresa.com",
    "net-a-porter.com",
    "modaoperandi.com",
    "saksfifthavenue.com",
    "matchesfashion.com",
  ],
  shoes: [
    "mytheresa.com",
    "net-a-porter.com",
    "saksfifthavenue.com",
    "neimanmarcus.com",
    "farfetch.com",
    "bergdorfgoodman.com",
  ],
  bag: [
    "mytheresa.com",
    "net-a-porter.com",
    "saksfifthavenue.com",
    "neimanmarcus.com",
    "farfetch.com",
    "bergdorfgoodman.com",
  ],
  sunglasses: [
    "mytheresa.com",
    "net-a-porter.com",
    "saksfifthavenue.com",
    "neimanmarcus.com",
    "bergdorfgoodman.com",
    "farfetch.com",
  ],
  jewelry: [
    "net-a-porter.com",
    "mytheresa.com",
    "saksfifthavenue.com",
    "neimanmarcus.com",
    "modaoperandi.com",
  ],
  hat: [
    "mytheresa.com",
    "net-a-porter.com",
    "saksfifthavenue.com",
    "neimanmarcus.com",
    "shopbop.com",
  ],
};

/** Approved retailer set (lowercase host) for cache-write gating. */
export const APPROVED_RETAILER_HOSTS: ReadonlySet<string> = new Set([
  "mytheresa.com",
  "net-a-porter.com",
  "modaoperandi.com",
  "saksfifthavenue.com",
  "neimanmarcus.com",
  "bergdorfgoodman.com",
  "farfetch.com",
  "matchesfashion.com",
  "shopbop.com",
  "fwrd.com",
]);

export function isApprovedRetailerHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return APPROVED_RETAILER_HOSTS.has(host.toLowerCase().replace(/^www\./, ""));
}

/**
 * Minimum editorial score for a freshly discovered candidate to be
 * persisted to the cache. Below threshold = quality_source "discovered"
 * is suppressed; founder_approved and published cache entries are
 * written elsewhere with explicit quality_source overrides.
 */
export const CACHE_MIN_EDITORIAL_SCORE = 0.6;

export type CoverageStatus = "strong" | "adequate" | "expansion_supported" | "weak";

export function coverageStatusFor(args: {
  required: boolean;
  shortfall: number;
  coreFinal: number;
  expansionFinal: number;
  cacheCandidates: number;
  uniqueBrandsInPool: number;
}): CoverageStatus {
  const { required, shortfall, coreFinal, expansionFinal, uniqueBrandsInPool } = args;
  if (shortfall > 0) return "weak";
  if (required && coreFinal + expansionFinal === 0) return "weak";
  if (uniqueBrandsInPool >= 4 && coreFinal >= expansionFinal && coreFinal >= 1) {
    return "strong";
  }
  if (coreFinal === 0 && expansionFinal > 0) return "expansion_supported";
  if (coreFinal >= 1 && uniqueBrandsInPool >= 2) return "adequate";
  if (expansionFinal > 0) return "expansion_supported";
  return "weak";
}

/**
 * Per-slot Firecrawl budget meter. Lives for one engine run.
 * `take(slot)` returns false when the slot is out of credit — the
 * caller should stop issuing /search requests for that slot.
 */
export class BudgetMeter {
  private remaining: Record<string, number>;
  private spent: Record<string, number> = {};
  private exhausted = new Set<string>();

  constructor(mode: DiscoveryMode, overrides?: Partial<Record<string, number>>) {
    const mult = DISCOVERY_MODE_BUDGET_MULTIPLIER[mode];
    this.remaining = {};
    for (const [slot, base] of Object.entries(SLOT_FIRECRAWL_BUDGET_DEFAULTS)) {
      const override = overrides?.[slot];
      this.remaining[slot] = Math.max(0, Math.round((override ?? base) * mult));
      this.spent[slot] = 0;
    }
  }

  take(slot: string): boolean {
    if ((this.remaining[slot] ?? 0) <= 0) {
      this.exhausted.add(slot);
      return false;
    }
    this.remaining[slot] -= 1;
    this.spent[slot] = (this.spent[slot] ?? 0) + 1;
    return true;
  }

  hasBudget(slot: string): boolean {
    return (this.remaining[slot] ?? 0) > 0;
  }

  report() {
    return {
      spent: { ...this.spent },
      remaining: { ...this.remaining },
      exhausted: Array.from(this.exhausted),
      totalSpent: Object.values(this.spent).reduce((a, b) => a + b, 0),
      totalBudget: Object.values(this.remaining).reduce((a, b) => a + b, 0)
        + Object.values(this.spent).reduce((a, b) => a + b, 0),
    };
  }
}

/**
 * Build a single site:-scoped Firecrawl /search query for a brand,
 * product template and approved retailer host. The engine prefers
 * these over broad brand queries to maximise precision per credit.
 */
export function buildSiteScopedQuery(
  template: string,
  brand: string,
  retailerHost: string,
  exclusions: string,
): string {
  return `${template.replace("{brand}", brand)} site:${retailerHost}${exclusions}`;
}

/**
 * Per-slot retailer rotation, capped to `count`. Falls back to the
 * supplied global APPROVED_RETAILERS list for slots without a
 * priority entry. Preserves order.
 */
export function retailersForSlot(
  slot: string,
  globalApproved: readonly string[],
  count: number,
): string[] {
  const priority = SLOT_RETAILER_PRIORITY[slot];
  const merged = priority
    ? [...priority, ...globalApproved.filter((r) => !priority.includes(r))]
    : [...globalApproved];
  return merged.slice(0, Math.max(1, count));
}