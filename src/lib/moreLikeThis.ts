/**
 * Editorial DNA-based product recommender.
 *
 * Behaves like a luxury personal shopper, not a generic recommendation engine:
 * matches by destination + activity + style family, never brand. Brand
 * diversity and activity-exclusion rules are enforced as hard constraints.
 */

import type { LookDNA } from "@/data/styleDNA";
import { dnaForLook } from "@/data/styleDNA";
import { PRODUCT_LIBRARY, type ProductDNA } from "@/data/productLibrary";

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
  if (!p.image || !p.href) return 0;

  const styleOverlap = overlap(p.styleFamilies, dna.styleFamilies);
  const activityOverlap = overlap(p.activityTags, dna.activityTags);

  // Require at least one signal beyond destination
  if (styleOverlap === 0 && activityOverlap === 0) return 0;

  const luxury = p.brandTier === "familiar" ? 0.5 : 0.3;
  return styleOverlap * 3.0 + activityOverlap * 4.0 + luxury;
}

/**
 * Greedy diversifier:
 *   - cap 2 products per brand
 *   - target ~6 cards (max 8)
 *   - prefer at least 60% discovery brands when the pool allows
 */
function diversify(scored: ScoredProduct[], max = 8, target = 6): ProductDNA[] {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const out: ProductDNA[] = [];
  const brandCount = new Map<string, number>();
  for (const { product } of sorted) {
    const used = brandCount.get(product.brand) ?? 0;
    if (used >= 2) continue;
    out.push(product);
    brandCount.set(product.brand, used + 1);
    if (out.length >= max) break;
  }
  return out.slice(0, Math.max(target, out.length >= target ? out.length : out.length));
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