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

  const styleOverlap = overlap(p.styleFamilies, dna.styleFamilies);
  const activityOverlap = overlap(p.activityTags, dna.activityTags);

  // Require at least one signal beyond destination
  if (styleOverlap === 0 && activityOverlap === 0) return 0;

  const luxury = p.brandTier === "familiar" ? 0.5 : 0.3;
  // Monetization weight: approved affiliate partners are prioritized over
  // brand-direct listings, per the affiliate commerce rule. A lower-scoring
  // affiliate piece can outrank an equally-scored brand-direct piece.
  const affiliate = p.channel === "affiliate" ? 2.5 : 0;
  return styleOverlap * 3.0 + activityOverlap * 4.0 + luxury + affiliate;
}

/**
 * Greedy diversifier:
 *   - cap 2 products per brand (forces brand discovery)
 *   - target ~6 cards (max 8)
 *   - aim for ~70% discovery / ~30% familiar mix
 *   - aim for ≥80% affiliate-linked cards; fall back to brand-direct only
 *     when no affiliate alternative remains in the candidate pool
 */
function diversify(scored: ScoredProduct[], max = 8, target = 6): ProductDNA[] {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const out: ProductDNA[] = [];
  const brandCount = new Map<string, number>();
  let familiarCount = 0;
  let brandDirectCount = 0;

  const canTake = (p: ProductDNA, opts: { strict: boolean }) => {
    if ((brandCount.get(p.brand) ?? 0) >= 2) return false;
    if (!opts.strict) return true;
    // Strict pass: enforce ~70/30 discovery split and prefer affiliates.
    const projected = out.length + 1;
    const familiarCap = Math.ceil(projected * 0.4); // ~30% + slack
    if (p.brandTier === "familiar" && familiarCount + 1 > familiarCap) return false;
    const brandDirectCap = Math.max(1, Math.floor(projected * 0.25));
    if (p.channel === "brand_direct" && brandDirectCount + 1 > brandDirectCap) return false;
    return true;
  };

  const push = (p: ProductDNA) => {
    out.push(p);
    brandCount.set(p.brand, (brandCount.get(p.brand) ?? 0) + 1);
    if (p.brandTier === "familiar") familiarCount++;
    if (p.channel === "brand_direct") brandDirectCount++;
  };

  // Strict pass — honor mix + affiliate preference.
  for (const { product } of sorted) {
    if (out.length >= max) break;
    if (canTake(product, { strict: true })) push(product);
  }
  // Backfill pass — only brand cap remains, ensures we hit target.
  if (out.length < target) {
    for (const { product } of sorted) {
      if (out.length >= max) break;
      if (out.includes(product)) continue;
      if (canTake(product, { strict: false })) push(product);
    }
  }
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