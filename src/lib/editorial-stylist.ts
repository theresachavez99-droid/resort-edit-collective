/**
 * Resort Edit — Editorial Stylist v2
 *
 * Promotes the Stylist Engine from a slot-filler to a luxury editor.
 * This module is intentionally pure (no I/O, no Supabase) so the engine
 * can call it from any phase: discovery, scoring, assembly, diagnostics.
 *
 * Owns:
 *   1. Moment Slot Templates — per-moment slot tiers replacing the
 *      universal SLOT_SPECS surface area.
 *   2. Neckline detection + necklace gate.
 *   3. Visual-weight estimation (hero + per-accessory).
 *   4. Accessory keyword scoring (bag / sunglasses / jewelry / shoes).
 *   5. Founder Quality Score (0–100) + explanation strings.
 */

// ──────────────────────────────────────────────────────────────
// 1. Moment Slot Templates
// ──────────────────────────────────────────────────────────────

export type SlotTier =
  | "locked_hero"
  | "required"
  | "strongly_preferred"
  | "contextual"
  | "conditional"
  | "omit";

export type MomentSlotTemplate = {
  /** "Portofino|Pool Lounging & Shopping" */
  key: string;
  destination: string;
  moment: string;
  /** Aliases for the moment string (URL slugs, legacy names). */
  aliases?: string[];
  /** Per-slot tier. Omitted slots are never sourced. */
  tiers: Partial<Record<EditorialSlot, SlotTier>>;
  /** Editorial direction note (surfaced in diagnostics). */
  note?: string;
};

export type EditorialSlot =
  | "swim"
  | "coverup"
  | "dress"
  | "shoes"
  | "bag"
  | "sunglasses"
  | "hat"
  | "earrings"
  | "necklace"
  | "bracelet";

/** Heritage slot keys used in the engine today ("jewelry"). The engine
 *  keeps a single "jewelry" slot; earrings/bracelet/necklace are scored by
 *  jewelry role in v2 rather than separate searches.
 *  Rings are permanently excluded from Resort Edit merchandising. */
export const LEGACY_JEWELRY_SLOTS: ReadonlySet<EditorialSlot> = new Set([
  "earrings",
  "necklace",
  "bracelet",
]);

export const MOMENT_SLOT_TEMPLATES: MomentSlotTemplate[] = [
  {
    key: "Portofino|Yacht Day",
    destination: "Portofino",
    moment: "Yacht Day",
    tiers: {
      swim: "locked_hero",
      coverup: "locked_hero",
      shoes: "required",
      bag: "required",
      sunglasses: "strongly_preferred",
      hat: "strongly_preferred",
      earrings: "contextual",
      bracelet: "contextual",
      necklace: "conditional",
    },
  },
  {
    key: "Portofino|Pool Lounging & Shopping",
    destination: "Portofino",
    moment: "Pool Lounging & Shopping",
    aliases: ["Pool Lounging", "pool-lounging", "pool-lounging-shopping"],
    tiers: {
      swim: "locked_hero",
      coverup: "locked_hero",
      shoes: "required",
      bag: "required",
      sunglasses: "strongly_preferred",
      hat: "strongly_preferred",
      earrings: "contextual",
      bracelet: "contextual",
      necklace: "conditional",
    },
  },
  {
    key: "Portofino|Espresso Morning",
    destination: "Portofino",
    moment: "Espresso Morning",
    aliases: ["Market Morning", "espresso-morning"],
    note: "Town-walk styling — no hat unless the Founder Look calls for one.",
    tiers: {
      dress: "locked_hero",
      coverup: "locked_hero", // hero may be top/bottom set
      shoes: "required",
      bag: "required",
      sunglasses: "strongly_preferred",
      earrings: "contextual",
      bracelet: "contextual",
      necklace: "conditional",
      hat: "omit",
    },
  },
  {
    key: "Portofino|Harbor Aperitivo",
    destination: "Portofino",
    moment: "Harbor Aperitivo",
    note: "Golden-hour dressing — no hat, no sunglasses.",
    tiers: {
      dress: "required",
      coverup: "locked_hero",
      shoes: "required",
      bag: "required",
      earrings: "strongly_preferred",
      bracelet: "contextual",
      necklace: "conditional",
      sunglasses: "omit",
      hat: "omit",
    },
  },
  {
    key: "Portofino|Sunset Views",
    destination: "Portofino",
    moment: "Sunset Views",
    note: "Evening dressing — no sunglasses, no hat.",
    tiers: {
      dress: "required",
      coverup: "locked_hero",
      shoes: "required",
      bag: "required",
      earrings: "strongly_preferred",
      bracelet: "contextual",
      necklace: "conditional",
      sunglasses: "omit",
      hat: "omit",
    },
  },
  {
    key: "Portofino|Riviera Dinner",
    destination: "Portofino",
    moment: "Riviera Dinner",
    note: "Evening dressing — no sunglasses, no hat.",
    tiers: {
      dress: "required",
      coverup: "locked_hero",
      shoes: "required",
      bag: "required",
      earrings: "strongly_preferred",
      bracelet: "contextual",
      necklace: "conditional",
      sunglasses: "omit",
      hat: "omit",
    },
  },
];

export function resolveMomentTemplate(
  destination: string,
  moment: string,
): MomentSlotTemplate | null {
  const key = `${destination}|${moment}`;
  const exact = MOMENT_SLOT_TEMPLATES.find((t) => t.key === key);
  if (exact) return exact;
  const m = moment.toLowerCase().trim();
  return (
    MOMENT_SLOT_TEMPLATES.find(
      (t) =>
        t.destination === destination &&
        (t.moment.toLowerCase() === m ||
          (t.aliases ?? []).some((a) => a.toLowerCase() === m)),
    ) ?? null
  );
}

/** Engine-internal jewelry slot is "jewelry"; the template's
 *  earrings/bracelet/necklace tiers collapse via this mapping. */
export function tierForEngineSlot(
  template: MomentSlotTemplate,
  engineSlot: string,
): SlotTier | null {
  if (engineSlot === "jewelry") {
    // Strongest jewelry tier in the template wins.
    const rank: SlotTier[] = [
      "locked_hero",
      "required",
      "strongly_preferred",
      "contextual",
      "conditional",
      "omit",
    ];
    let best: SlotTier | null = null;
    for (const s of LEGACY_JEWELRY_SLOTS) {
      const t = template.tiers[s];
      if (!t) continue;
      if (!best || rank.indexOf(t) < rank.indexOf(best)) best = t;
    }
    return best;
  }
  return (template.tiers[engineSlot as EditorialSlot] ?? null) as SlotTier | null;
}

// ──────────────────────────────────────────────────────────────
// 2. Neckline detection — drives the necklace gate.
// ──────────────────────────────────────────────────────────────

export type NecklineDecision = {
  decision: "skip" | "consider";
  neckline:
    | "halter"
    | "high-neck"
    | "one-shoulder"
    | "asymmetric"
    | "collared"
    | "embellished"
    | "statement-print"
    | "scoop"
    | "v-neck"
    | "square"
    | "strapless"
    | "minimal"
    | "unknown";
  reason: string;
};

const SKIP_NECKLINE_PATTERNS: Array<{ neckline: NecklineDecision["neckline"]; rx: RegExp; reason: string }> = [
  { neckline: "halter", rx: /\bhalter|halterneck\b/i, reason: "Halter neckline" },
  { neckline: "high-neck", rx: /\b(high[- ]?neck|turtleneck|mock[- ]?neck|funnel[- ]?neck)\b/i, reason: "High neckline" },
  { neckline: "one-shoulder", rx: /\bone[- ]?shoulder\b/i, reason: "One-shoulder neckline" },
  { neckline: "asymmetric", rx: /\basymmetric|asymmetrical\b/i, reason: "Asymmetric neckline" },
  { neckline: "collared", rx: /\b(collared|polo[- ]?neck|shirt collar)\b/i, reason: "Collared neckline" },
  { neckline: "embellished", rx: /\b(embroider|beaded|sequin|crystal|jewel(?!ry)|embellish|hardware|chain neckline)\b/i, reason: "Embellished neckline" },
];

const STATEMENT_PRINT_HINTS = /\b(floral|paisley|capri print|riviera print|toile|botanical|tropical print|wood ?cut)\b/i;

const CONSIDER_NECKLINE_PATTERNS: Array<{ neckline: NecklineDecision["neckline"]; rx: RegExp; reason: string }> = [
  { neckline: "scoop", rx: /\bscoop[- ]?neck\b/i, reason: "Scoop neckline" },
  { neckline: "v-neck", rx: /\b(deep[- ]?v|v[- ]?neck|plunge)\b/i, reason: "V-neckline" },
  { neckline: "square", rx: /\bsquare[- ]?neck\b/i, reason: "Square neckline" },
  { neckline: "strapless", rx: /\b(strapless|bandeau|tube)\b/i, reason: "Strapless neckline" },
  { neckline: "minimal", rx: /\b(camisole|tank|column dress|slip dress|cami)\b/i, reason: "Minimal neckline" },
];

export function evaluateNeckline(
  heroes: Array<{ title?: string | null; productName?: string | null; category?: string | null }>,
): NecklineDecision {
  const haystack = heroes
    .map((h) => `${h.title ?? ""} ${h.productName ?? ""} ${h.category ?? ""}`)
    .join(" | ")
    .toLowerCase();

  for (const p of SKIP_NECKLINE_PATTERNS) {
    if (p.rx.test(haystack)) {
      return { decision: "skip", neckline: p.neckline, reason: `${p.reason} — necklace would crowd the line.` };
    }
  }
  if (STATEMENT_PRINT_HINTS.test(haystack)) {
    return {
      decision: "skip",
      neckline: "statement-print",
      reason: "Hero carries a strong statement print — let the garment lead.",
    };
  }
  for (const p of CONSIDER_NECKLINE_PATTERNS) {
    if (p.rx.test(haystack)) {
      return { decision: "consider", neckline: p.neckline, reason: p.reason };
    }
  }
  // Default: restraint wins. Skip unless we have positive evidence.
  return {
    decision: "skip",
    neckline: "unknown",
    reason: "Neckline unclear — defaulting to restraint.",
  };
}

// ──────────────────────────────────────────────────────────────
// 3. Visual weight — hero + accessory.
// ──────────────────────────────────────────────────────────────

export type VisualWeight = "low" | "medium" | "high";

const HIGH_WEIGHT_HERO = /\b(print|floral|paisley|embroider|sequin|crystal|metallic|brocade|jacquard|stripe(?!s? linen)|colorblock|color block|red|fuchsia|magenta|emerald|cobalt|orange|yellow)\b/i;
const MEDIUM_WEIGHT_HERO = /\b(stripe|gingham|polka|tie[- ]?dye|crochet|lace|ruffle|smocked|tiered)\b/i;

export function heroVisualWeight(
  heroes: Array<{ title?: string | null; productName?: string | null }>,
): VisualWeight {
  const text = heroes.map((h) => `${h.title ?? ""} ${h.productName ?? ""}`).join(" | ");
  if (HIGH_WEIGHT_HERO.test(text)) return "high";
  if (MEDIUM_WEIGHT_HERO.test(text)) return "medium";
  return "low";
}

const HIGH_WEIGHT_ACCESSORY = /\b(logo|monogram|chain|crystal|sequin|metallic|patent|hardware|charm|oversized|maxi|sculptural)\b/i;
const LOW_WEIGHT_ACCESSORY = /\b(minimal|simple|delicate|raffia|natural|cream|nude|tan|beige|leather trim|woven|handwoven|organic)\b/i;

export function accessoryVisualWeight(title: string | null | undefined): VisualWeight {
  const t = title ?? "";
  if (HIGH_WEIGHT_ACCESSORY.test(t)) return "high";
  if (LOW_WEIGHT_ACCESSORY.test(t)) return "low";
  return "medium";
}

// ──────────────────────────────────────────────────────────────
// 4. Accessory keyword scoring — bag / sunglasses / jewelry / shoes.
// ──────────────────────────────────────────────────────────────

export type AccessoryScoreAdjustment = {
  /** Multiplier applied to editorialScore (e.g., 1.15 = +15%, 0.6 = -40%). */
  multiplier: number;
  /** Human-readable reasons surfaced in diagnostics. */
  reasons: string[];
  /** True if the candidate should be hard-rejected. */
  hardReject: boolean;
};

const BAG_PENALTIES: Array<{ rx: RegExp; mult: number; reason: string }> = [
  { rx: /\b(logo|monogram|gg canvas|lv canvas|coated canvas)\b/i, mult: 0.4, reason: "Visible logo / monogram canvas" },
  { rx: /\b(plastic|pvc|vinyl|jelly bag)\b/i, mult: 0.5, reason: "Plastic / synthetic finish" },
  { rx: /\b(crystal[- ]embellished|sequin|rhinestone)\b/i, mult: 0.7, reason: "Overly embellished" },
  { rx: /\b(viral|tiktok|it[- ]?bag)\b/i, mult: 0.75, reason: "Trend-driven influencer signal" },
];
const BAG_REWARDS: Array<{ rx: RegExp; mult: number; reason: string }> = [
  { rx: /\b(handwoven|hand[- ]?woven|artisan|made in italy|positano)\b/i, mult: 1.18, reason: "Artisan / handwoven construction" },
  { rx: /\b(raffia|straw|wicker|jute|natural fibre|natural fiber)\b/i, mult: 1.12, reason: "Natural Mediterranean texture" },
  { rx: /\b(leather trim|nappa|vegetable[- ]tanned)\b/i, mult: 1.08, reason: "Refined leather trim" },
  { rx: /\b(structured|architectural|minimal|quiet)\b/i, mult: 1.05, reason: "Quiet, structured silhouette" },
];

const SUNGLASS_PENALTIES: Array<{ rx: RegExp; mult: number; reason: string }> = [
  { rx: /\b(sport|performance|cycling|running|athletic|wrap[- ]?around|shield)\b/i, mult: 0.3, reason: "Athletic / sport silhouette" },
  { rx: /\b(festival|burning man|y2k|neon)\b/i, mult: 0.5, reason: "Festival / streetwear signal" },
  { rx: /\b(mirrored|chrome|rainbow lens)\b/i, mult: 0.75, reason: "Loud lens treatment" },
];
const SUNGLASS_REWARDS: Array<{ rx: RegExp; mult: number; reason: string }> = [
  { rx: /\b(tortoise|honey acetate|amber|caramel)\b/i, mult: 1.15, reason: "Riviera acetate palette" },
  { rx: /\b(oversized|jackie|cat[- ]?eye|round|aviator)\b/i, mult: 1.08, reason: "Old-money silhouette" },
  { rx: /\b(italian|made in italy|persol|linda farrow)\b/i, mult: 1.05, reason: "Italian eyewear heritage" },
];

const JEWELRY_PENALTIES: Array<{ rx: RegExp; mult: number; reason: string }> = [
  { rx: /\b(silver tone|silver-plated|sterling silver)\b/i, mult: 0.85, reason: "Cool-tone metal — Riviera reads warm" },
  { rx: /\b(rhinestone|cubic zirconia|cz)\b/i, mult: 0.7, reason: "Synthetic stones" },
  { rx: /\b(logo|charm necklace|charm pendant)\b/i, mult: 0.6, reason: "Logo / brand charm" },
];
const JEWELRY_REWARDS: Array<{ rx: RegExp; mult: number; reason: string }> = [
  { rx: /\b(gold vermeil|18k gold|14k gold|solid gold|gold plated)\b/i, mult: 1.15, reason: "Warm gold tone" },
  { rx: /\b(coral|pearl|shell|seed pearl|baroque pearl)\b/i, mult: 1.12, reason: "Mediterranean material" },
  { rx: /\b(handmade|artisan|hammered|organic)\b/i, mult: 1.08, reason: "Artisan finish" },
];

const SHOE_PENALTIES: Array<{ rx: RegExp; mult: number; reason: string }> = [
  { rx: /\b(sneaker|trainer|athletic|running|sport sandal|teva|chaco)\b/i, mult: 0.3, reason: "Athletic footwear" },
  { rx: /\b(platform|chunky|combat|cargo)\b/i, mult: 0.7, reason: "Heavy silhouette" },
  { rx: /\b(logo|monogram strap)\b/i, mult: 0.6, reason: "Visible logo" },
];
const SHOE_REWARDS: Array<{ rx: RegExp; mult: number; reason: string }> = [
  { rx: /\b(flat sandal|leather sandal|raffia slide|espadrille|capri sandal|jelly sandal|positano sandal)\b/i, mult: 1.1, reason: "Riviera-appropriate silhouette" },
  { rx: /\b(cream|nude|tan|champagne|natural|gold)\b/i, mult: 1.05, reason: "Neutral palette" },
  { rx: /\b(handmade|made in italy|artisan)\b/i, mult: 1.05, reason: "Italian craft" },
];

export function scoreAccessoryEditorial(
  slot: string,
  title: string | null | undefined,
  heroWeight: VisualWeight,
): AccessoryScoreAdjustment {
  const reasons: string[] = [];
  let mult = 1;
  let hardReject = false;
  const text = title ?? "";

  const apply = (
    pens: typeof BAG_PENALTIES,
    rews: typeof BAG_REWARDS,
  ) => {
    for (const p of pens) {
      if (p.rx.test(text)) {
        mult *= p.mult;
        reasons.push(`− ${p.reason}`);
        if (p.mult <= 0.4) hardReject = true;
      }
    }
    for (const r of rews) {
      if (r.rx.test(text)) {
        mult *= r.mult;
        reasons.push(`+ ${r.reason}`);
      }
    }
  };

  if (slot === "bag") apply(BAG_PENALTIES, BAG_REWARDS);
  else if (slot === "sunglasses") apply(SUNGLASS_PENALTIES, SUNGLASS_REWARDS);
  else if (slot === "jewelry") apply(JEWELRY_PENALTIES, JEWELRY_REWARDS);
  else if (slot === "shoes") apply(SHOE_PENALTIES, SHOE_REWARDS);

  // Visual-weight balancing: when the hero is high-weight, penalise
  // high-weight accessories and reward low-weight ones.
  const accWeight = accessoryVisualWeight(text);
  if (heroWeight === "high" && accWeight === "high") {
    mult *= 0.75;
    reasons.push("− Stacks high visual weight against a strong hero");
  } else if (heroWeight === "high" && accWeight === "low") {
    mult *= 1.05;
    reasons.push("+ Quiet accessory supports the hero");
  } else if (heroWeight === "low" && accWeight === "high") {
    mult *= 1.08;
    reasons.push("+ Statement accessory carries the minimal hero");
  }

  return { multiplier: mult, reasons, hardReject };
}

// ──────────────────────────────────────────────────────────────
// 5. Founder Quality Score (0–100) + Explanation strings.
// ──────────────────────────────────────────────────────────────

export type LookSlotForScore = {
  slot: string;
  tier: SlotTier | null;
  brand: string | null;
  editorialScore: number | null;
  founderSimilarity?: number | null;
  visualWeight?: VisualWeight;
  isLockedHero?: boolean;
  filled: boolean;
  intentionallyOmitted?: boolean;
};

export function founderQualityScore(slots: LookSlotForScore[]): {
  score: number;
  breakdown: Record<string, number>;
} {
  // Editorial cohesion: avg editorial score on filled slots, normalised.
  const filled = slots.filter((s) => s.filled);
  const editorialAvg =
    filled.length === 0
      ? 0
      : filled.reduce((s, x) => s + (x.editorialScore ?? 0), 0) / filled.length;
  const editorialCohesion = Math.min(100, Math.round((editorialAvg / 10) * 100));

  // Founder similarity on accessories (excludes locked heroes which are 0 by design).
  const simSlots = filled.filter((s) => !s.isLockedHero && s.founderSimilarity != null);
  const founderSim =
    simSlots.length === 0
      ? 60 // neutral when no signal
      : Math.round(
          (simSlots.reduce((s, x) => s + (x.founderSimilarity ?? 0), 0) / simSlots.length) * 100,
        );

  // Coverage of required tiers — strongly_preferred adds bonus, contextual/conditional optional.
  const coreSlots = slots.filter((s) => s.tier === "required" || s.tier === "locked_hero");
  const coreFilled = coreSlots.filter((s) => s.filled).length;
  const coreCoverage = coreSlots.length === 0
    ? 100
    : Math.round((coreFilled / coreSlots.length) * 100);

  // Restraint: intentional omissions of contextual/conditional slots are rewarded.
  const restraintTargets = slots.filter(
    (s) => s.tier === "contextual" || s.tier === "conditional",
  );
  const restraintWins = restraintTargets.filter(
    (s) => s.intentionallyOmitted || (!s.filled && s.tier === "conditional"),
  ).length;
  const restraint = restraintTargets.length === 0
    ? 75
    : Math.round(50 + (restraintWins / restraintTargets.length) * 50);

  // Visual balance: penalise stacks of high-weight accessories.
  const highStack = slots.filter((s) => s.filled && s.visualWeight === "high" && !s.isLockedHero).length;
  const visualBalance = Math.max(0, 100 - highStack * 18);

  // Brand diversity within the look.
  const brandSet = new Set(filled.map((s) => s.brand).filter(Boolean));
  const brandDiversity = filled.length === 0
    ? 0
    : Math.round((brandSet.size / filled.length) * 100);

  // Weighted composite.
  const weights = {
    editorialCohesion: 0.28,
    founderSim: 0.22,
    coreCoverage: 0.18,
    restraint: 0.14,
    visualBalance: 0.10,
    brandDiversity: 0.08,
  };

  const score = Math.round(
    editorialCohesion * weights.editorialCohesion +
      founderSim * weights.founderSim +
      coreCoverage * weights.coreCoverage +
      restraint * weights.restraint +
      visualBalance * weights.visualBalance +
      brandDiversity * weights.brandDiversity,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      editorialCohesion,
      founderSim,
      coreCoverage,
      restraint,
      visualBalance,
      brandDiversity,
    },
  };
}

export function explainSelection(args: {
  slot: string;
  brand: string | null;
  title: string | null;
  founderSimilarity?: number | null;
  visualWeight?: VisualWeight;
  editorialReasons?: string[];
  isLockedHero?: boolean;
}): string {
  if (args.isLockedHero) return "Founder Hero — locked editorial foundation.";
  const parts: string[] = [];
  if (args.editorialReasons?.length) {
    parts.push(...args.editorialReasons.slice(0, 3));
  }
  if (typeof args.founderSimilarity === "number") {
    parts.push(`Founder similarity ${Math.round(args.founderSimilarity * 100)}%`);
  }
  if (args.visualWeight) {
    parts.push(`Visual weight: ${args.visualWeight}`);
  }
  if (!parts.length) return "Selected for editorial fit.";
  return parts.join(" · ");
}

export function explainOmission(slot: string, reason: string): string {
  const slotLabel = slot.charAt(0).toUpperCase() + slot.slice(1);
  return `${slotLabel} intentionally omitted — ${reason}`;
}