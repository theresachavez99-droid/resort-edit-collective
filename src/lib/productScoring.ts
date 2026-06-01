/**
 * Resort Edit product scoring system.
 *
 * Every sourced product is scored against the Look DNA on 7 categories,
 * each on a 1–5 scale. Products below the threshold are rejected and the
 * sourcer must search again. This is what separates a luxury personal
 * shopper system from a product grid.
 *
 * Used by:
 *   - Firecrawl validation pass (src/lib/firecrawl.functions.ts)
 *   - Manual sourcing in lookFallbacks.ts / lookAlternatives.ts (review)
 *   - Admin product library (future)
 */

export type ScoreCategory =
  | "printMatch"
  | "silhouetteMatch"
  | "destinationEnergy"
  | "luxuryFeel"
  | "imageQuality"
  | "availability"
  | "editorialMatch";

export type ProductScore = Record<ScoreCategory, number>;

export const SCORE_WEIGHTS: Record<ScoreCategory, number> = {
  editorialMatch: 0.22,
  printMatch: 0.18,
  silhouetteMatch: 0.16,
  destinationEnergy: 0.14,
  luxuryFeel: 0.14,
  imageQuality: 0.1,
  availability: 0.06,
};

/** Reject products with a weighted score below this. Scale: 1–5. */
export const MIN_TOTAL_SCORE = 3.6;

/** Any single category at or below this number is an automatic reject. */
export const HARD_FAIL_CATEGORY_FLOOR = 2;

/** Categories that may never score below 3 — these are non-negotiable. */
export const CRITICAL_CATEGORIES: ScoreCategory[] = [
  "editorialMatch",
  "imageQuality",
  "availability",
];

export function totalScore(score: ProductScore): number {
  return (Object.keys(SCORE_WEIGHTS) as ScoreCategory[]).reduce(
    (sum, k) => sum + score[k] * SCORE_WEIGHTS[k],
    0,
  );
}

export type ScoreVerdict = {
  total: number;
  passes: boolean;
  reasons: string[];
};

export function evaluateScore(score: ProductScore): ScoreVerdict {
  const reasons: string[] = [];
  const total = totalScore(score);

  for (const cat of Object.keys(SCORE_WEIGHTS) as ScoreCategory[]) {
    const v = score[cat];
    if (v <= HARD_FAIL_CATEGORY_FLOOR) {
      reasons.push(`${cat} below floor (${v}/5)`);
    }
    if (CRITICAL_CATEGORIES.includes(cat) && v < 3) {
      reasons.push(`critical ${cat} under 3 (${v}/5)`);
    }
  }
  if (total < MIN_TOTAL_SCORE) {
    reasons.push(`weighted total ${total.toFixed(2)} < ${MIN_TOTAL_SCORE}`);
  }
  return { total, passes: reasons.length === 0, reasons };
}

/**
 * Stub for image-asset rejection — used by validation layer to reject
 * SVG drawings, renderings, and placeholder assets before scoring.
 */
export function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url) return true;
  const u = url.toLowerCase();
  if (u.endsWith(".svg")) return true;
  if (u.includes("placeholder")) return true;
  if (u.includes("/assets/products/")) return true; // local SVG drawings
  if (u.includes("data:image/svg")) return true;
  return false;
}

/** URL must point to a product detail page, not a collection/search/homepage. */
const COLLECTION_PATH_SIGNALS = [
  "/collections",
  "/category",
  "/search",
  "/shop-all",
  "/c/",
  "/new-arrivals",
  "/sale",
];

export function isCollectionOrHomepage(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.pathname === "/" || u.pathname === "") return true;
    const lower = u.pathname.toLowerCase();
    if (COLLECTION_PATH_SIGNALS.some((s) => lower.includes(s))) return true;
    // Heuristic: a PDP usually has at least 2 path segments OR a long slug.
    const segments = lower.split("/").filter(Boolean);
    if (segments.length === 0) return true;
    return false;
  } catch {
    return true;
  }
}