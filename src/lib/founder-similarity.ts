/**
 * Pure (no I/O) Founder Similarity scoring.
 *
 * Given a candidate slot + product text + a HeroLook (palette, style
 * families, positive/negative accessory rules), produce a 0..1
 * similarity score plus structured diagnostics. The Stylist Engine
 * blends this score into the editorial score with a high weight
 * whenever Founder Learning is enabled.
 *
 * Hard-exclude vs soft-penalty split mirrors the founder's directive:
 *   HARD: logo-heavy bag, sporty sunglasses, black-when-excluded,
 *         silver-when-excluded, scandi-minimal when style is
 *         Mediterranean Glamour.
 *   SOFT: generic gold drops, bland jewelry, mass-luxury, influencer,
 *         trend-pieces, embellished raffia, excessive hardware.
 */

export type HeroLook = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  moment: string;
  styleFamily: string[];
  heroBrands: string[];
  heroCategories: string[];
  paletteInclude: string[];
  paletteExclude: string[];
  positiveRules: Record<string, string[]>;
  negativeRules: Record<string, string[]>;
  accessoryPhilosophy: string | null;
  luxuryLevel: "editorial" | "heritage" | "mass-luxury";
};

export type SimilarityRuleHit = {
  id: string;
  label: string;
  slot: string;
  severity: "hard" | "soft";
  delta: number; // applied multiplier when soft (e.g. 0.55) or 0 when hard
};

export type SimilarityResult = {
  /** Composite similarity 0..1 — blended with base score in the engine. */
  similarity: number;
  /** Sub-scores for diagnostics. */
  components: {
    palette: number;
    brand: number;
    style: number;
    silhouette: number;
    aesthetic: number;
  };
  /** TRUE means the candidate must be dropped before ranking. */
  hardExcluded: boolean;
  hits: SimilarityRuleHit[];
  positiveMatches: string[];
  reasons: string[];
};

// ────────────────────────────────────────────────────────────────
// Hard-exclude visual rules
// ────────────────────────────────────────────────────────────────

const HARD_RULES: Array<{
  id: string;
  label: string;
  slots: string[];
  /** Predicate runs against (text, look). */
  test: (text: string, look: HeroLook) => boolean;
}> = [
  {
    id: "logo-heavy-bag",
    label: "Visible logo-heavy bag",
    slots: ["bag"],
    test: (t) =>
      /\b(monogram|all[- ]?over[- ]?logo|gg ?canvas|gg ?supreme|lv monogram|jacquard logo|logo[- ]?print|logo[- ]?canvas|coated canvas)\b/i.test(
        t,
      ),
  },
  {
    id: "sporty-sunglasses",
    label: "Sporty / athletic sunglasses",
    slots: ["sunglasses"],
    test: (t) =>
      /\b(sport|performance|cycling|running|wrap|shield|visor|polarized sport|wraparound)\b/i.test(
        t,
      ),
  },
  {
    id: "black-accessory-excluded",
    label: "Black accessory but black is excluded by the look",
    slots: ["bag", "shoes", "hat", "sunglasses"],
    test: (t, look) =>
      look.paletteExclude.some((c) => c.toLowerCase() === "black") &&
      /\bblack\b|\bjet\b|\bonyx\b|\bnoir\b/i.test(t),
  },
  {
    id: "silver-jewelry-excluded",
    label: "Silver jewelry but silver is excluded by the look",
    slots: ["jewelry"],
    test: (t, look) =>
      look.paletteExclude.some((c) => c.toLowerCase() === "silver") &&
      /\b(silver|sterling|platinum|white gold|chrome|gunmetal)\b/i.test(t),
  },
  {
    id: "scandi-minimal-vs-mediterranean",
    label: "Scandi-minimal styling clashes with Mediterranean Glamour",
    slots: [],
    test: (t, look) =>
      look.styleFamily.some((s) => /mediterranean glamour/i.test(s)) &&
      /\b(scandi|scandinavian|nordic|brutalist|stark minimal|utilitarian|clinical)\b/i.test(
        t,
      ),
  },
];

// ────────────────────────────────────────────────────────────────
// Soft-penalty rules (strong, not exclusionary)
// ────────────────────────────────────────────────────────────────

const SOFT_RULES: Array<{
  id: string;
  label: string;
  slots: string[];
  multiplier: number; // applied to similarity score; e.g. 0.55 = strong penalty
  test: (t: string, look: HeroLook) => boolean;
}> = [
  {
    id: "generic-gold-drops",
    label: "Generic gold drop / hoop styling",
    slots: ["jewelry"],
    multiplier: 0.55,
    test: (t) =>
      /\b(basic|simple|everyday|essential|classic|dainty|delicate)\b.*\b(drop|hoop|stud|chain)\b/i.test(
        t,
      ),
  },
  {
    id: "bland-jewelry",
    label: "Bland / department-store jewelry signals",
    slots: ["jewelry"],
    multiplier: 0.6,
    test: (t) => /\b(everyday gold|department store|starter|gift box|gifting)\b/i.test(t),
  },
  {
    id: "mass-luxury",
    label: "Reads mass-luxury, not editorial luxury",
    slots: [],
    multiplier: 0.65,
    test: (t) =>
      /\b(bestseller|trending now|tiktok|viral|it[- ]bag|must[- ]have|cult favorite|sold out everywhere)\b/i.test(
        t,
      ),
  },
  {
    id: "influencer-driven",
    label: "Influencer-driven cue rather than editorial",
    slots: [],
    multiplier: 0.7,
    test: (t) => /\b(as seen on|influencer|content creator|y2k|core|aesthetic)\b/i.test(t),
  },
  {
    id: "trend-piece",
    label: "Likely to date within one season",
    slots: [],
    multiplier: 0.7,
    test: (t) =>
      /\b(seasonal trend|trend(ing)?|capsule drop|limited drop|micro[- ]trend|2024|2025|fw\d\d|ss\d\d)\b/i.test(
        t,
      ),
  },
  {
    id: "embellished-raffia",
    label: "Overly embellished raffia",
    slots: ["bag", "hat"],
    multiplier: 0.7,
    test: (t) =>
      /\b(raffia|straw|woven)\b.*\b(beaded|bedazzled|charm|tassel galore|fringed heavily|embellished)\b/i.test(
        t,
      ),
  },
  {
    id: "excessive-hardware",
    label: "Excessive hardware / chunky branding",
    slots: ["bag", "shoes"],
    multiplier: 0.7,
    test: (t) =>
      /\b(chunky hardware|oversized buckle|heavy hardware|gold[- ]plated logo|enamel logo|metal logo plate)\b/i.test(
        t,
      ),
  },
];

// ────────────────────────────────────────────────────────────────

function normBrand(b: string): string {
  return b.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const A = new Set(a.map((x) => x.toLowerCase()));
  const B = new Set(b.map((x) => x.toLowerCase()));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union > 0 ? inter / union : 0;
}

function tokenize(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((x) => x.length > 2);
}

const SLOT_WEIGHTS: Record<string, number> = {
  swim: 0.35,
  coverup: 0.4,
  shoes: 0.55,
  bag: 0.6,
  sunglasses: 0.6,
  jewelry: 0.6,
  hat: 0.55,
};

/** Default weight for any slot not listed above. */
export const DEFAULT_FOUNDER_WEIGHT = 0.5;

/** Blend founder similarity into a base 0..100 editorial score. */
export function blendScore(args: {
  slot: string;
  baseEditorial: number; // 0..100ish
  similarity: number; // 0..1
}): { blended: number; weight: number } {
  const weight = SLOT_WEIGHTS[args.slot] ?? DEFAULT_FOUNDER_WEIGHT;
  // Treat baseEditorial / 100 as a 0..1 signal so the similarity weight
  // actually moves the ranking. Output stays on a roughly 0..100 scale.
  const baseNorm = Math.max(0, Math.min(1, args.baseEditorial / 100));
  const blended = (baseNorm * (1 - weight) + args.similarity * weight) * 100;
  return { blended: Math.round(blended * 1000) / 1000, weight };
}

export function evaluateSimilarity(args: {
  slot: string;
  brand: string;
  title: string | null;
  description: string | null;
  palette: string; // engine palette token string e.g. "ivory natural"
  silhouette: string;
  look: HeroLook;
}): SimilarityResult {
  const { slot, brand, title, description, palette, silhouette, look } = args;
  const text = `${title ?? ""} ${description ?? ""} ${palette} ${silhouette}`.toLowerCase();

  // ── HARD rules
  const hits: SimilarityRuleHit[] = [];
  for (const rule of HARD_RULES) {
    if (rule.slots.length && !rule.slots.includes(slot)) continue;
    if (rule.test(text, look)) {
      hits.push({ id: rule.id, label: rule.label, slot, severity: "hard", delta: 0 });
    }
  }
  const hardExcluded = hits.some((h) => h.severity === "hard");

  // ── Component scores
  const candTokens = tokenize(`${title} ${description} ${palette} ${silhouette}`);

  const paletteScore = jaccard(candTokens, look.paletteInclude);

  const brandKey = normBrand(brand);
  const brandScore =
    look.heroBrands.some((b) => normBrand(b) === brandKey)
      ? 1.0
      : look.heroBrands.some((b) => normBrand(b).includes(brandKey) || brandKey.includes(normBrand(b)))
        ? 0.6
        : 0;

  const styleScore = jaccard(
    candTokens,
    look.styleFamily.flatMap((s) => tokenize(s)),
  );

  const heroCatKey = look.heroCategories.map((c) => c.toLowerCase());
  const silhouetteScore =
    heroCatKey.some((c) => silhouette.toLowerCase().includes(c) || c.includes(silhouette.toLowerCase()))
      ? 0.5
      : 0.2;

  // Aesthetic alignment: positive rule keyword hits across the look's
  // rules for the candidate slot (or "global").
  const positiveMatches: string[] = [];
  const collectKw = (bag: Record<string, string[]>): string[] =>
    [...(bag[slot] ?? []), ...(bag["global"] ?? [])].map((s) => s.toLowerCase());
  const positives = collectKw(look.positiveRules);
  let posHits = 0;
  for (const kw of positives) {
    if (kw.length < 3) continue;
    if (text.includes(kw)) {
      posHits++;
      positiveMatches.push(kw);
    }
  }
  const aestheticScore = positives.length > 0 ? Math.min(1, posHits / Math.max(3, positives.length / 2)) : 0.3;

  // Soft-rule keyword hits (case-insensitive token match) — also feed
  // negativeRules from the look.
  const lookNegatives = collectKw(look.negativeRules);
  let lookNegHits = 0;
  const reasons: string[] = [];
  for (const kw of lookNegatives) {
    if (kw.length < 3) continue;
    if (text.includes(kw)) lookNegHits++;
  }

  // Component weights — palette dominates, then brand+aesthetic, then style.
  const composite =
    paletteScore * 0.32 +
    brandScore * 0.22 +
    aestheticScore * 0.22 +
    styleScore * 0.14 +
    silhouetteScore * 0.1;

  let similarity = composite;

  // ── SOFT rule penalties (structured)
  for (const rule of SOFT_RULES) {
    if (rule.slots.length && !rule.slots.includes(slot)) continue;
    if (rule.test(text, look)) {
      hits.push({
        id: rule.id,
        label: rule.label,
        slot,
        severity: "soft",
        delta: rule.multiplier,
      });
      similarity *= rule.multiplier;
    }
  }
  // Founder-look-defined negative keywords act as gentler multiplicative drag.
  for (let i = 0; i < lookNegHits; i++) similarity *= 0.85;

  // Aesthetic baseline floor so a Founder-approved brand always retains
  // some lift even when text signals are sparse.
  if (brandScore > 0 && similarity < 0.35) similarity = 0.35;

  if (brandScore > 0) reasons.push("founder-hero brand");
  if (paletteScore > 0) reasons.push(`palette↑${paletteScore.toFixed(2)}`);
  if (positiveMatches.length) reasons.push(`positives:${positiveMatches.slice(0, 3).join("|")}`);

  return {
    similarity: hardExcluded ? 0 : Math.max(0, Math.min(1, similarity)),
    components: {
      palette: round(paletteScore),
      brand: round(brandScore),
      style: round(styleScore),
      silhouette: round(silhouetteScore),
      aesthetic: round(aestheticScore),
    },
    hardExcluded,
    hits,
    positiveMatches,
    reasons,
  };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
