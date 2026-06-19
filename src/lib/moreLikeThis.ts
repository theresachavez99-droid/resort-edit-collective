/**
 * Editorial DNA-based product recommender.
 *
 * Behaves like a luxury personal shopper, not a generic recommendation engine:
 * matches by destination + activity + style family, never brand. Brand
 * diversity and activity-exclusion rules are enforced as hard constraints.
 */

import type { LookDNA } from "@/data/styleDNA";
import { dnaForLook } from "@/data/styleDNA";
import { PRODUCT_LIBRARY, resolvePurchaseUrl, type ProductDNA } from "@/data/productLibrary";
import { isBrandEligible } from "@/data/brandApprovals";

export interface ScoredProduct {
  product: ProductDNA;
  score: number;
}

function overlap<T>(a: readonly T[], b: readonly T[]): number {
  const set = new Set(a);
  let n = 0;
  for (const x of b) if (set.has(x)) n++;
  return n;
}

function scoreOne(p: ProductDNA, dna: LookDNA): number {
  // Hard prefilters
  if (!p.destinations.includes(dna.destination)) return 0;
  if (overlap(p.activityTags, dna.excludeActivities) > 0) return 0;
  if (p.soldOut) return 0;
  // Inventory health: must resolve to a valid purchase URL via the
  // Primary → Brand → Category fallback chain. No card without a destination.
  if (!p.image) return 0;
  if (!resolvePurchaseUrl(p)) return 0;
  // Affiliate commerce rule: 100% affiliate inventory required.
  // Brand-direct listings are never surfaced in More Like This, even if no
  // affiliate alternative exists — we show fewer cards instead.
  if (p.channel !== "affiliate") return 0;
  // Brand Intelligence gate: only approved / approved_selectively brands
  // may render. Brand approval is independent of retailer (a Milly piece on
  // Saks is gated by Milly's status, not Saks's). Prevents random affiliate
  // inventory from creeping into the carousel.
  if (!isBrandEligible(p.brand)) return 0;

  const styleOverlap = overlap(p.styleFamilies, dna.styleFamilies);
  const activityOverlap = overlap(p.activityTags, dna.activityTags);

  // Require at least one signal beyond destination
  if (styleOverlap === 0 && activityOverlap === 0) return 0;

  const luxury = p.brandTier === "familiar" ? 0.5 : 0.3;
  return styleOverlap * 3.0 + activityOverlap * 4.0 + luxury;
}

/**
 * Greedy diversifier:
 *   - cap 2 products per brand (forces brand discovery)
 *   - target ~6 cards (max 8); fewer is fine if the pool is thin
 *   - aim for ~70/30 discovery/familiar mix as a *target*, never a quota:
 *     a stronger familiar (e.g. luxury) piece always beats a weaker
 *     discovery piece. We only skip a familiar pick if there is a
 *     comparably-scored discovery alternative still available.
 */
function diversify(scored: ScoredProduct[], max = 8, target = 6): ProductDNA[] {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const out: ProductDNA[] = [];
  const brandCount = new Map<string, number>();
  let familiarCount = 0;

  const push = (p: ProductDNA) => {
    out.push(p);
    brandCount.set(p.brand, (brandCount.get(p.brand) ?? 0) + 1);
    if (p.brandTier === "familiar") familiarCount++;
  };

  // Quality-first pick. The ~70/30 discovery target is honored by softly
  // skipping a familiar pick *only* when (a) we're already over the
  // familiar share AND (b) there's a discovery alternative within 15% of
  // its score. Never trade meaningful quality for the quota.
  const QUALITY_BAND = 0.15;
  const taken = new Set<ProductDNA>();
  for (let i = 0; i < sorted.length; i++) {
    if (out.length >= max) break;
    const { product, score } = sorted[i];
    if (taken.has(product)) continue;
    if ((brandCount.get(product.brand) ?? 0) >= 2) continue;

    if (product.brandTier === "familiar") {
      const projected = out.length + 1;
      const familiarShare = (familiarCount + 1) / projected;
      if (familiarShare > 0.4) {
        const discoveryAlt = sorted.slice(i + 1).find((s) => {
          if (taken.has(s.product)) return false;
          if (s.product.brandTier !== "discovery") return false;
          if ((brandCount.get(s.product.brand) ?? 0) >= 2) return false;
          return s.score >= score * (1 - QUALITY_BAND);
        });
        if (discoveryAlt) {
          push(discoveryAlt.product);
          taken.add(discoveryAlt.product);
          continue;
        }
      }
    }
    push(product);
    taken.add(product);
  }
  // If we're below target, that's intentional: pool was thin. Do not
  // backfill with brand-direct or unapproved brands to hit a number.
  void target;
  return out;
}

export interface MoreLikeThisResult {
  dna: LookDNA | null;
  products: ProductDNA[];
}

export function moreLikeThisFor(daySlug: string, lookSlug: string): MoreLikeThisResult {
  const dna = dnaForLook(daySlug, lookSlug);
  if (!dna) return { dna: null, products: [] };

  const scored: ScoredProduct[] = PRODUCT_LIBRARY
    .map((p) => ({ product: p, score: scoreOne(p, dna) }))
    .filter((s) => s.score > 0);

  return { dna, products: diversify(scored) };
}