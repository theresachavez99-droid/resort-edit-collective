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

/**
 * Yacht Day wardrobe category — drives the quota composition on Day 1 so
 * the rail reads like a luxury yacht wardrobe (swim + coverups + linen +
 * raffia + shoes + accessories) rather than an assortment of resort
 * dresses. Returns "dress" for midi/maxi/dress silhouettes (which Yacht
 * Day intentionally under-weights), and "other" for pieces that don't map
 * to the yacht-day vocabulary.
 */
export type YachtCategory =
  | "swim"
  | "coverup"
  | "linen_layer"
  | "bag"
  | "shoe"
  | "accessory"
  | "dress"
  | "other";

const SWIM_RE = /\b(bikini|swimsuit|one[- ]piece|maillot|tankini|swim\b|trunks)/i;
const COVERUP_RE = /\b(pareo|sarong|kaftan|caftan|cover[- ]?up|cover\sup|tunic)\b/i;
const LINEN_RE = /\b(linen|poplin|shirt|button[- ]down|blouse|camp shirt|shorts|trouser|pant)\b/i;
const BAG_RE = /\b(tote|basket|bag|clutch|pouch|crossbody|shopper)\b/i;
const SHOE_RE = /\b(sandal|espadrille|slide|mule|loafer|flat|sneaker)\b/i;
const ACCESSORY_RE = /\b(sunglass|sunnies|hat|fedora|visor|earring|necklace|pendant|bracelet|cuff|scarf|belt)\b/i;
const DRESS_RE = /\b(dress|midi|maxi|mini\sdress|gown|frock)\b/i;

export function classifyYachtCategory(p: ProductDNA): YachtCategory {
  const name = `${p.brand} ${p.name}`;
  const families = new Set(p.styleFamilies);

  if (SWIM_RE.test(name) || families.has("yacht_swim")) return "swim";
  if (COVERUP_RE.test(name)) return "coverup";
  if (BAG_RE.test(name) || families.has("raffia_luxury")) return "bag";
  if (SHOE_RE.test(name)) return "shoe";
  if (ACCESSORY_RE.test(name)) return "accessory";
  if (DRESS_RE.test(name)) return "dress";
  if (LINEN_RE.test(name)) return "linen_layer";
  return "other";
}

/**
 * Target composition for an 8-tile Yacht Day rail. Mirrors the founder's
 * brief: 30% swim, 20% coverups, 15% linen, 15% bags, 10% shoes, 10%
 * accessories. Dresses are intentionally NOT in the quota — they only
 * fill leftover slots if higher-priority buckets are empty.
 */
export const YACHT_DAY_QUOTAS: Readonly<Record<Exclude<YachtCategory, "dress" | "other">, number>> = {
  swim: 2,
  coverup: 2,
  linen_layer: 1,
  bag: 1,
  shoe: 1,
  accessory: 1,
};