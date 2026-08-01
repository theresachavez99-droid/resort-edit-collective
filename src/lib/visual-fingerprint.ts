/**
 * Stylist Engine v4.5 — Visual fingerprint + collection-level diagnostics.
 *
 * Measures repetition by visual appearance, not just brand. Pure functions.
 * No I/O, no side effects.
 */

export type VisualFingerprint = {
  swimNeckline: string | null;
  hardware: string | null;
  texture: string | null;
  construction: string | null;
  coverupSilhouette: string | null;
  shoeSilhouette: string | null;
  bagSilhouette: string | null;
  jewelryPersonality: string | null;
  sunglassesShape: string | null;
  colorImpression: string | null;
};

type Candidate = {
  slot: string;
  brand: string;
  title: string | null;
  description: string | null;
  silhouette: string;
  palette: string;
};

const NECKLINES = [
  "bandeau",
  "halter",
  "high neck",
  "high-neck",
  "square neck",
  "square-neck",
  "balconette",
  "plunge",
  "one shoulder",
  "one-shoulder",
  "asymmetric",
  "scoop",
];
const HARDWARE = ["gold ring", "chain", "buckle", "hardware", "ring detail", "logo"];
const TEXTURE = ["crochet", "knit", "ribbed", "woven", "lace", "macramé", "macrame", "terry", "smocked"];
const CONSTRUCTION = ["sculptural", "draped", "ruched", "cut-out", "cut out", "cutout", "twisted", "wrap"];
const COVERUP_SHAPES = ["kaftan", "pareo", "shirt", "linen pant", "tunic", "robe", "dress"];
const SHOE_SHAPES = ["espadrille", "raffia sandal", "slide", "flat sandal", "wedge", "thong", "mule"];
const BAG_SHAPES = ["raffia tote", "straw bag", "basket", "shoulder bag", "clutch", "structured tote"];
// Rings are excluded from Resort Edit merchandising, so no ring kinds here.
const JEWELRY_KINDS = ["hoop", "cuff", "pendant", "shell", "stud", "chain necklace"];
const SUNGLASSES_SHAPES = ["cat eye", "cat-eye", "oversized", "aviator", "rectangular", "oval", "round", "wrap"];
const COLORS = [
  "ivory",
  "cream",
  "white",
  "black",
  "navy",
  "blue",
  "majolica",
  "coral",
  "terracotta",
  "sand",
  "natural",
  "gold",
  "tortoise",
  "stone",
  "bone",
  "emerald",
];

function firstMatch(hay: string, tokens: string[]): string | null {
  for (const t of tokens) if (hay.includes(t)) return t;
  return null;
}

export function fingerprintCandidate(c: Candidate): Partial<VisualFingerprint> {
  const hay = `${c.title ?? ""} ${c.description ?? ""}`.toLowerCase();
  const out: Partial<VisualFingerprint> = {};
  if (c.slot === "swim") {
    out.swimNeckline = firstMatch(hay, NECKLINES);
    out.construction = firstMatch(hay, CONSTRUCTION);
    out.hardware = firstMatch(hay, HARDWARE);
    out.texture = firstMatch(hay, TEXTURE);
  } else if (c.slot === "coverup") {
    out.coverupSilhouette = firstMatch(hay, COVERUP_SHAPES);
    out.texture = firstMatch(hay, TEXTURE);
  } else if (c.slot === "shoes") {
    out.shoeSilhouette = firstMatch(hay, SHOE_SHAPES);
  } else if (c.slot === "bag") {
    out.bagSilhouette = firstMatch(hay, BAG_SHAPES);
  } else if (c.slot === "jewelry") {
    out.jewelryPersonality = firstMatch(hay, JEWELRY_KINDS);
  } else if (c.slot === "sunglasses") {
    out.sunglassesShape = firstMatch(hay, SUNGLASSES_SHAPES);
  }
  out.colorImpression = firstMatch(hay, COLORS) ?? c.palette ?? null;
  return out;
}

export function fingerprintLook(slots: Candidate[]): VisualFingerprint {
  const fp: VisualFingerprint = {
    swimNeckline: null,
    hardware: null,
    texture: null,
    construction: null,
    coverupSilhouette: null,
    shoeSilhouette: null,
    bagSilhouette: null,
    jewelryPersonality: null,
    sunglassesShape: null,
    colorImpression: null,
  };
  const colorTally = new Map<string, number>();
  for (const c of slots) {
    const partial = fingerprintCandidate(c);
    for (const [k, v] of Object.entries(partial)) {
      if (!v) continue;
      if (k === "colorImpression") {
        colorTally.set(v as string, (colorTally.get(v as string) ?? 0) + 1);
        continue;
      }
      if (!(fp as Record<string, string | null>)[k]) {
        (fp as Record<string, string | null>)[k] = v as string;
      }
    }
  }
  if (colorTally.size > 0) {
    fp.colorImpression = [...colorTally.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
  return fp;
}

/** Count overlapping non-null fingerprint fields between two looks. */
export function fingerprintOverlap(a: VisualFingerprint, b: VisualFingerprint): number {
  let n = 0;
  for (const k of Object.keys(a) as (keyof VisualFingerprint)[]) {
    if (a[k] && b[k] && a[k] === b[k]) n++;
  }
  return n;
}

/** 0–100. 100 = every look visually distinct. ≤4 shared tokens = pair flagged. */
export function computeVisualRepetitionScore(fps: VisualFingerprint[]): {
  score: number;
  pairs: Array<{ a: number; b: number; overlap: number }>;
} {
  if (fps.length < 2) return { score: 100, pairs: [] };
  const pairs: Array<{ a: number; b: number; overlap: number }> = [];
  let totalOverlap = 0;
  let pairCount = 0;
  for (let i = 0; i < fps.length; i++) {
    for (let j = i + 1; j < fps.length; j++) {
      const o = fingerprintOverlap(fps[i], fps[j]);
      pairs.push({ a: i, b: j, overlap: o });
      totalOverlap += o;
      pairCount++;
    }
  }
  // 10 fingerprint fields × pairs = max theoretical overlap.
  const max = pairCount * 10;
  const score = Math.round(100 * (1 - totalOverlap / Math.max(max, 1)));
  return { score, pairs: pairs.filter((p) => p.overlap >= 4) };
}

/** 0–100. 100 = every accessory brand unique across slot. */
export function computeAccessoryRotationScore(
  looks: { slots: Array<{ slot: string; brand: string | null }> }[],
): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  const accessorySlots = ["shoes", "bag", "jewelry", "sunglasses", "hat"];
  let totalSlots = 0;
  let uniqueBrandPicks = 0;
  for (const slotName of accessorySlots) {
    const brandsBySlot: string[] = [];
    for (const l of looks) {
      const s = l.slots.find((x) => x.slot === slotName);
      if (s?.brand) brandsBySlot.push(s.brand);
    }
    if (brandsBySlot.length === 0) continue;
    const counts = new Map<string, number>();
    for (const b of brandsBySlot) counts.set(b, (counts.get(b) ?? 0) + 1);
    totalSlots += brandsBySlot.length;
    uniqueBrandPicks += counts.size;
    for (const [brand, n] of counts) {
      if (n >= 3) {
        warnings.push(`${brand} ${slotName} appears in ${n} looks — accessory rotation flat.`);
      }
    }
  }
  const score = totalSlots === 0 ? 100 : Math.round((uniqueBrandPicks / totalSlots) * 100);
  return { score, warnings };
}

/** 0–100. Lower = single brand dominates. */
export function computeBrandDominanceScore(
  looks: { slots: Array<{ slot: string; brand: string | null }> }[],
): { score: number; warnings: string[]; brandCounts: Record<string, number>; topBrand: string | null } {
  const counts = new Map<string, number>();
  const swimCounts = new Map<string, number>();
  let total = 0;
  for (const l of looks) {
    for (const s of l.slots) {
      if (!s.brand) continue;
      counts.set(s.brand, (counts.get(s.brand) ?? 0) + 1);
      total++;
      if (s.slot === "swim") swimCounts.set(s.brand, (swimCounts.get(s.brand) ?? 0) + 1);
    }
  }
  if (total === 0) return { score: 100, warnings: [], brandCounts: {}, topBrand: null };
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const topShare = sorted[0][1] / total;
  const score = Math.round((1 - Math.max(0, topShare - 1 / sorted.length)) * 100);
  const warnings: string[] = [];
  for (const [brand, n] of swimCounts) {
    if (n >= 4) warnings.push(`${brand} appears in ${n} swim looks — visual dominance.`);
  }
  for (const [brand, n] of counts) {
    if (n >= 5) warnings.push(`${brand} appears ${n} times across the collection.`);
  }
  return {
    score,
    warnings,
    brandCounts: Object.fromEntries(counts),
    topBrand: sorted[0]?.[0] ?? null,
  };
}

/** 0–100 per look — composite of editorial signal + brand affinity + cohesion. */
export function computeHeroStrength(
  look: {
    slots: Array<{
      slot: string;
      brand: string | null;
      editorialScore?: number | null;
      brandAffinity?: number | null;
    }>;
  },
  cohesionScore: number,
): number {
  const scores = look.slots
    .map((s) => s.editorialScore ?? null)
    .filter((n): n is number => n != null);
  const avgEd = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const aff = look.slots
    .map((s) => s.brandAffinity ?? null)
    .filter((n): n is number => n != null);
  const avgAff = aff.length ? aff.reduce((a, b) => a + b, 0) / aff.length : 50;
  // editorial ranges loosely 0–4 → normalize to 0–100.
  const edNorm = Math.min(100, Math.max(0, avgEd * 25));
  return Math.round(edNorm * 0.5 + avgAff * 0.3 + cohesionScore * 100 * 0.2);
}

/** Rhythm = distinct roles covered + adjacent-look contrast. */
export function computeEditorialRhythmScore(roles: string[]): number {
  if (roles.length === 0) return 0;
  const unique = new Set(roles).size;
  const distinctness = (unique / roles.length) * 70;
  // contrast: alternation between "loud" (statement/print/glamour) and
  // "quiet" (sophistication/architectural/quiet) roles.
  const loud = new Set(["statement_arrival", "print_moment", "classic_riviera_glamour"]);
  let contrast = 0;
  for (let i = 1; i < roles.length; i++) {
    if (loud.has(roles[i]) !== loud.has(roles[i - 1])) contrast++;
  }
  const contrastNorm = roles.length > 1 ? (contrast / (roles.length - 1)) * 30 : 30;
  return Math.round(distinctness + contrastNorm);
}

/** Luxury perception — proxy on brand affinity average + commerce mix. */
export function computeLuxuryPerceptionScore(
  looks: { slots: Array<{ brandAffinity?: number | null }> }[],
): number {
  const all = looks.flatMap((l) => l.slots.map((s) => s.brandAffinity ?? null)).filter(
    (n): n is number => n != null,
  );
  if (!all.length) return 0;
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
}

/** Memorability — high when editorial spread is wide and visual repetition low. */
export function computeMemorabilityScore(
  visualRepetition: number,
  luxuryPerception: number,
  heroStrength: number,
): number {
  return Math.round(visualRepetition * 0.4 + luxuryPerception * 0.3 + heroStrength * 0.3);
}
