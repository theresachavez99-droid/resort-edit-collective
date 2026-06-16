/**
 * Resort Edit Luxury Personal Shopper scoring system.
 *
 * Doctrine: .lovable/mem/features/luxury-shopper-doctrine.md
 *
 * Every sourced product is scored 1–5 across the categories below.
 * Weights reward destination fantasy, editorial uniqueness, saveability,
 * activity fidelity and story alignment — NOT brand recognition or price.
 *
 * After raw scoring, `applyBrandModifier` adjusts the total for brand
 * tier, discovery-brand bonuses, hero-brand overrepresentation, and
 * "selective approval" brands that must clear a higher bar.
 *
 * Penalty signals (generic-anywhere, influencer aesthetic, silhouette/
 * print/color repetition) are supplied by the caller and subtracted via
 * `applyPenalties`.
 *
 * Used by:
 *   - Firecrawl validation pass (src/lib/productValidation.functions.ts)
 *   - Sourcing runners (src/lib/yacht-day-pilot.functions.ts, scripts/*)
 *   - Admin review queue
 */

export type ScoreCategory =
  // Core fit — would a luxury stylist book this for THIS destination + activity?
  | "destinationSpecificity"
  | "activityFidelity"
  | "lookDnaFit"
  // Story alignment — does it slot into the look's color/print/texture story?
  | "colorStory"
  | "printStory"
  | "textureStory"
  | "silhouetteMatch"
  // Editorial + emotional — why a wealthy woman saves it
  | "editorialUniqueness"
  | "saveability"
  | "emotionalImpact"
  | "luxuryTravelerAppeal"
  | "discoveryValue"
  // Operational floor
  | "luxuryFeel"
  | "imageQuality"
  | "availability";

export type ProductScore = Partial<Record<ScoreCategory, number>>;

/** Weights sum to 1.00. */
export const SCORE_WEIGHTS: Record<ScoreCategory, number> = {
  destinationSpecificity: 0.12,
  activityFidelity: 0.1,
  lookDnaFit: 0.1,
  editorialUniqueness: 0.1,
  saveability: 0.08,
  luxuryTravelerAppeal: 0.07,
  emotionalImpact: 0.06,
  colorStory: 0.06,
  printStory: 0.06,
  discoveryValue: 0.05,
  textureStory: 0.05,
  luxuryFeel: 0.05,
  silhouetteMatch: 0.04,
  imageQuality: 0.04,
  availability: 0.02,
};

/** Legacy field names accepted by callers / DB rows pre-reweight. */
const LEGACY_ALIASES: Record<string, ScoreCategory> = {
  printMatch: "printStory",
  destinationEnergy: "destinationSpecificity",
  editorialMatch: "editorialUniqueness",
};

/** Default value used when a category is missing from the input. */
const DEFAULT_CATEGORY_SCORE = 3;

/** Reject products with an adjusted score below this. Scale: 1–5. */
export const MIN_TOTAL_SCORE = 3.8;

/** Selective-approval brands must clear this higher bar. */
export const SELECTIVE_MIN_TOTAL_SCORE = 4.1;

/** Any single category at or below this number is an automatic reject. */
export const HARD_FAIL_CATEGORY_FLOOR = 2;

/** Categories that may never score below 3 — non-negotiable for a Look. */
export const CRITICAL_CATEGORIES: ScoreCategory[] = [
  "destinationSpecificity",
  "activityFidelity",
  "lookDnaFit",
  "editorialUniqueness",
  "imageQuality",
];

/** Discovery brands that earn an explicit bonus when destination + editorial are strong. */
export const DISCOVERY_BONUS_BRAND_SLUGS = new Set<string>([
  "aya-muse",
  "cala-de-la-cruz",
  "posse",
  "faithfull-the-brand",
  "alemais",
  "marfa",
  "significant-other",
  "callas-milano",
]);

function normalize(score: ProductScore): Record<ScoreCategory, number> {
  const out = {} as Record<ScoreCategory, number>;
  for (const cat of Object.keys(SCORE_WEIGHTS) as ScoreCategory[]) {
    out[cat] = typeof score[cat] === "number" ? (score[cat] as number) : DEFAULT_CATEGORY_SCORE;
  }
  // Apply legacy aliases when the new field is missing.
  for (const [legacy, canonical] of Object.entries(LEGACY_ALIASES)) {
    const v = (score as Record<string, number | undefined>)[legacy];
    if (typeof v === "number" && typeof score[canonical] !== "number") {
      out[canonical] = v;
    }
  }
  return out;
}

export function totalScore(score: ProductScore): number {
  const norm = normalize(score);
  return (Object.keys(SCORE_WEIGHTS) as ScoreCategory[]).reduce(
    (sum, k) => sum + norm[k] * SCORE_WEIGHTS[k],
    0,
  );
}

// ---------------------------------------------------------------------------
// Brand modifier — discovery bonuses, hero overrepresentation, selective
// ---------------------------------------------------------------------------

export type BrandTier = "hero" | "discovery";
export type BrandStatus = "approved" | "selective" | "pending" | "rejected";

export type BrandModifierInput = {
  brandSlug?: string | null;
  tier?: BrandTier | null;
  status?: BrandStatus | null;
  /** Share of already-approved products in this run that are hero-tier (0–1). */
  heroShareSoFar?: number;
  /** Target hero share (default 0.30 per Resort Edit doctrine). */
  heroShareTarget?: number;
};

export type ModifierResult = {
  adjustedTotal: number;
  modifiers: { label: string; delta: number }[];
};

export function applyBrandModifier(
  baseTotal: number,
  norm: Record<ScoreCategory, number>,
  input: BrandModifierInput,
): ModifierResult {
  const mods: { label: string; delta: number }[] = [];
  const slug = (input.brandSlug ?? "").toLowerCase();
  const tier = input.tier ?? null;
  const status = input.status ?? null;
  const heroTarget = input.heroShareTarget ?? 0.3;
  const heroShare = input.heroShareSoFar ?? 0;

  // Discovery bonus list — only when destination + editorial are genuinely strong.
  if (
    DISCOVERY_BONUS_BRAND_SLUGS.has(slug) &&
    norm.destinationSpecificity >= 4 &&
    norm.editorialUniqueness >= 4
  ) {
    mods.push({ label: `discovery-brand bonus (${slug})`, delta: 0.2 });
  }
  // Generic discovery-tier nudge (smaller, requires solid destination fit).
  else if (tier === "discovery" && norm.destinationSpecificity >= 4) {
    mods.push({ label: "discovery tier nudge", delta: 0.07 });
  }

  // Hero overrepresentation — penalize hero brands once 30% is exceeded.
  if (tier === "hero" && heroShare > heroTarget) {
    const overshoot = heroShare - heroTarget; // 0..0.7
    const delta = -Math.min(0.3, overshoot * 1.0 + 0.1);
    mods.push({ label: `hero overrepresentation (${(heroShare * 100).toFixed(0)}%)`, delta });
  }

  // Selective-approval brands must clear a higher bar.
  if (status === "selective") {
    const passesSelective =
      norm.editorialUniqueness >= 4 && norm.saveability >= 4 && norm.destinationSpecificity >= 4;
    if (!passesSelective) {
      mods.push({ label: "selective brand under bar", delta: -0.35 });
    }
  }

  const adjustedTotal = mods.reduce((s, m) => s + m.delta, baseTotal);
  return { adjustedTotal, modifiers: mods };
}

// ---------------------------------------------------------------------------
// Penalty signals — supplied by caller (caller computes repetition / aesthetic)
// ---------------------------------------------------------------------------

export type PenaltyFlag =
  | "genericAnywhere"
  | "influencerAesthetic"
  | "fastFashionEnergy"
  | "trendDriven"
  | "repetitiveSilhouette"
  | "repetitivePrint"
  | "repetitiveColor";

export const PENALTY_VALUES: Record<PenaltyFlag, number> = {
  genericAnywhere: -0.4,
  influencerAesthetic: -0.35,
  fastFashionEnergy: -0.5,
  trendDriven: -0.25,
  repetitiveSilhouette: -0.15,
  repetitivePrint: -0.15,
  repetitiveColor: -0.1,
};

export function applyPenalties(
  total: number,
  flags: PenaltyFlag[],
): { adjustedTotal: number; modifiers: { label: string; delta: number }[] } {
  const mods = flags.map((f) => ({ label: `penalty:${f}`, delta: PENALTY_VALUES[f] }));
  return { adjustedTotal: mods.reduce((s, m) => s + m.delta, total), modifiers: mods };
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

export type ScoreVerdict = {
  rawTotal: number;
  total: number;
  passes: boolean;
  reasons: string[];
  modifiers: { label: string; delta: number }[];
};

export type EvaluateOptions = {
  brand?: BrandModifierInput;
  penalties?: PenaltyFlag[];
};

export function evaluateScore(
  score: ProductScore,
  opts: EvaluateOptions = {},
): ScoreVerdict {
  const reasons: string[] = [];
  const norm = normalize(score);
  const rawTotal = totalScore(score);

  for (const cat of Object.keys(SCORE_WEIGHTS) as ScoreCategory[]) {
    const v = norm[cat];
    if (v <= HARD_FAIL_CATEGORY_FLOOR) {
      reasons.push(`${cat} below floor (${v}/5)`);
    }
    if (CRITICAL_CATEGORIES.includes(cat) && v < 3) {
      reasons.push(`critical ${cat} under 3 (${v}/5)`);
    }
  }

  const allMods: { label: string; delta: number }[] = [];
  let working = rawTotal;

  if (opts.brand) {
    const r = applyBrandModifier(working, norm, opts.brand);
    working = r.adjustedTotal;
    allMods.push(...r.modifiers);
  }
  if (opts.penalties && opts.penalties.length) {
    const r = applyPenalties(working, opts.penalties);
    working = r.adjustedTotal;
    allMods.push(...r.modifiers);
  }

  const threshold =
    opts.brand?.status === "selective" ? SELECTIVE_MIN_TOTAL_SCORE : MIN_TOTAL_SCORE;
  if (working < threshold) {
    reasons.push(`adjusted total ${working.toFixed(2)} < ${threshold}`);
  }

  return {
    rawTotal,
    total: working,
    passes: reasons.length === 0,
    reasons,
    modifiers: allMods,
  };
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