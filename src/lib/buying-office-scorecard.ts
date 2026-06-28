/**
 * Editorial Scorecard for Buying Candidates — pure (no I/O).
 *
 * Produces three values per candidate:
 *   editorialScore        0..100  composite
 *   benchmarkSimilarity   0..100  fit to Founder Hero Brief (palette/brand/style)
 *   editorialConfidence   0..100  data completeness (image, price, brand, retailer)
 *
 * If the session has no locked Hero Brief yet, similarity falls back to a
 * neutral baseline so manual imports still get ranked by completeness +
 * approved-retailer signals — the founder is never blocked.
 */

export type HeroBrief = {
  brands?: string[];
  paletteInclude?: string[];
  paletteExclude?: string[];
  styleFamily?: string[];
  priceCeiling?: number;
} | null;

export type ScorecardInput = {
  brand: string | null;
  retailer: string | null;
  retailerApproved: boolean;
  productName: string | null;
  category: string | null;
  color: string | null;
  price: number | null;
  imageUrl: string | null;
  affiliateUrl: string | null;
};

export type ScorecardResult = {
  editorialScore: number;
  benchmarkSimilarity: number;
  editorialConfidence: number;
  reasons: string[];
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function computeBuyingScorecard(
  c: ScorecardInput,
  brief: HeroBrief,
): ScorecardResult {
  const reasons: string[] = [];

  // Confidence: how complete is the candidate row?
  let confidence = 0;
  if (c.brand) confidence += 22; else reasons.push("missing brand");
  if (c.productName) confidence += 16; else reasons.push("missing product name");
  if (c.imageUrl) confidence += 22; else reasons.push("image missing");
  if (c.price != null) confidence += 14; else reasons.push("price missing");
  if (c.retailer) confidence += 10;
  if (c.retailerApproved) confidence += 10; else reasons.push("retailer not on approved list");
  if (c.affiliateUrl) confidence += 6; else reasons.push("affiliate link pending");

  // Similarity: against Founder Hero Brief, when present.
  let similarity = 50;
  if (brief) {
    similarity = 40;
    const name = (c.productName || "").toLowerCase();
    const color = (c.color || "").toLowerCase();
    const cat = (c.category || "").toLowerCase();
    if (brief.brands?.length && c.brand) {
      const hit = brief.brands.some((b) => c.brand!.toLowerCase().includes(b.toLowerCase()));
      if (hit) { similarity += 25; reasons.push("brand matches hero brief"); }
    }
    if (brief.paletteInclude?.length) {
      const hit = brief.paletteInclude.some((p) => color.includes(p.toLowerCase()) || name.includes(p.toLowerCase()));
      if (hit) { similarity += 15; reasons.push("palette matches"); }
    }
    if (brief.paletteExclude?.length) {
      const bad = brief.paletteExclude.some((p) => color.includes(p.toLowerCase()) || name.includes(p.toLowerCase()));
      if (bad) { similarity -= 25; reasons.push("palette conflicts with hero brief"); }
    }
    if (brief.styleFamily?.length) {
      const hit = brief.styleFamily.some((s) => cat.includes(s.toLowerCase()) || name.includes(s.toLowerCase()));
      if (hit) { similarity += 10; reasons.push("style family matches"); }
    }
    if (brief.priceCeiling != null && c.price != null && c.price > brief.priceCeiling) {
      similarity -= 15;
      reasons.push(`price above hero ceiling ($${brief.priceCeiling})`);
    }
  } else {
    reasons.push("no Hero Brief locked yet — similarity is baseline");
  }

  // Editorial Score: weighted blend (similarity dominates when brief present).
  const sim = clamp(similarity);
  const conf = clamp(confidence);
  const editorial = brief
    ? clamp(sim * 0.65 + conf * 0.35)
    : clamp(sim * 0.35 + conf * 0.65);

  return {
    editorialScore: editorial,
    benchmarkSimilarity: sim,
    editorialConfidence: conf,
    reasons,
  };
}