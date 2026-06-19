import type { ProductDNA } from "@/data/productLibrary";

/**
 * Portofino Visual DNA score.
 *
 * Heavily rewards products that visually express Portofino — Mediterranean
 * embroidery, blue-and-white porcelain motifs, Italian Riviera prints and
 * tailoring, raffia luxury, destination-specific color stories. Products
 * that are merely activity- and affiliate-eligible but visually generic
 * (solid swim, plain knit dresses, non-destination apparel) score low or
 * negative and sort to the bottom of the rail.
 *
 * Pure scoring; no filtering. Hard filters (affiliate, activity, brand
 * approval, dedup, hidden hosts) are applied by the caller.
 */

const STYLE_WEIGHTS: Record<string, number> = {
  mediterranean_embroidery: 5,
  blue_white_porcelain: 5,
  riviera_floral: 4,
  italian_riviera: 4,
  destination_print: 3,
  riviera_glamour: 3,
  riviera_luxe: 3,
  destination_glamour: 2,
  sunset_glamour: 2,
  raffia_luxury: 2,
  mediterranean_footwear: 2,
  yacht_swim: 2,
  coastal_neutral: 1,
};

const PRINT_WEIGHTS: Record<string, number> = {
  mediterranean_embroidery: 5,
  blue_white_porcelain: 5,
  riviera_floral: 4,
  destination_print: 3,
};

const COLOR_WEIGHTS: Record<string, number> = {
  blue: 1.5,
  navy: 1,
  white: 1,
  ivory: 0.5,
  floral: 1.5,
};

const GENERIC_SWIM_CATEGORIES = new Set([
  "swimsuit",
  "one_piece",
  "one-piece",
  "bikini",
]);

export function portofinoVisualDnaScore(p: ProductDNA): number {
  let s = 0;
  for (const st of p.styleFamilies) s += STYLE_WEIGHTS[st] ?? 0;
  if (p.printLanguage) s += PRINT_WEIGHTS[p.printLanguage] ?? 0;
  for (const c of p.colorStory ?? []) s += COLOR_WEIGHTS[c] ?? 0;

  if (s === 0) s -= 2; // no DNA signal at all

  // Solid swim with no print → extra penalty (a plain white one-piece
  // shouldn't outrank an embroidered kaftan on a Portofino rail).
  const cat = (p as { productCategory?: string }).productCategory;
  if (cat && GENERIC_SWIM_CATEGORIES.has(cat) && !p.printLanguage) s -= 1;

  return s;
}