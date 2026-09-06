/**
 * RESORT EDIT — LONG LUNCH AUTO-EDIT v1  (client-safe layer)
 *
 * Scope: the Portofino "Long Lunch" moment ONLY. This is a deliberately narrow
 * proof of concept for the AI Styling Director: the system, not the founder,
 * decides how a look is repaired.
 *
 * Division of labour (cost control is structural, not incidental):
 *   1. DETERMINISTIC RULES (this file) — hard constraints, slot mapping,
 *      candidate shortlisting, and a full heuristic coherence score. Free.
 *   2. AI FASHION JUDGMENT (long-lunch-auto-edit.server.ts) — one small call
 *      over a pre-filtered shortlist, only when something actually changed.
 *
 * The catalogue is NEVER sent to a model. Nothing partial ever renders.
 */
import { isPublishableProductUrl } from "./shop-url-policy";
import { canonicalVisibleSlot, type VisibleProductSlot } from "./look-atomic-completeness";

export const LONG_LUNCH_LOOK_KEY = "portofino/long-lunch";
export const AUTO_EDIT_PROMPT_VERSION = "long-lunch-auto-edit-v1";

/** Slots the Long Lunch look must fill before it may render publicly. */
export const LONG_LUNCH_REQUIRED_SLOTS = [
  "outfit",
  "shoes",
  "bag",
  "sunglasses",
  "earrings",
  "necklace",
  "bracelet",
] as const satisfies readonly VisibleProductSlot[];

/** Welcome, never required. Hair detail / light layer read as optional. */
export const LONG_LUNCH_OPTIONAL_SLOTS = ["layer", "hat", "scarf", "belt"] as const;

/**
 * The styling brief. Injected verbatim into the AI request and mirrored by the
 * heuristic scorer so the two never drift.
 */
export const LONG_LUNCH_BRIEF = {
  lookKey: LONG_LUNCH_LOOK_KEY,
  destination: "Portofino",
  moment: "The Long Lunch",
  scene:
    "A two-hour lunch on a terrace above the harbour. Linen tablecloths, sunlight off the water, a walk along the quay afterwards.",
  direction: [
    "Sophisticated Mediterranean resort editorial — feminine, polished, considered.",
    "Colourful and interesting rather than conservative or safe; the outfit must look intentional, not assembled.",
    "Elevated contemporary with selective luxury. No cheap or fast-fashion feel, no loud trend-driven styling.",
    "Age-appropriate for a stylish woman in her late thirties or forties.",
    "Daytime footwear an elegant woman can actually walk Portofino's stone in — refined flat or low-to-mid heel sandal, mule or slingback.",
    "Jewellery coordinated: one metal family, ideally one designer. Sculptural over stacked.",
    "One coherent colour story. Never mix brown and black leathers in the same look.",
    "Sunglasses are mandatory for this daytime moment.",
    "Rings are never merchandised on Resort Edit.",
    "No pearls unless explicitly approved in the styling policy.",
  ],
  forbidden: [
    "rings",
    "pearls (unapproved)",
    "sneakers, boots, chunky platforms, pool slides",
    "evening or black-tie dressing",
    "fast-fashion or influencer-trend styling",
  ],
} as const;

// ── Candidate model ───────────────────────────────────────────────

export type AutoEditCandidate = {
  source: "shop_slot_products" | "product_replacement_candidates";
  sourceId: string;
  slot: VisibleProductSlot;
  rawSlot: string;
  slotLabel: string | null;
  brand: string;
  productName: string;
  retailer: string | null;
  url: string;
  price: string | null;
  styleDna: Record<string, unknown> | null;
  /** Provenance — which registry/feed this record actually came from. */
  provenance?: string | null;
  /** Local or remote image reference, when the record carries one. */
  imageUrl?: string | null;
  /** Raw availability status on the source record. */
  availability?: string | null;
  /** Last time the PDP was actually checked, if ever. */
  lastCheckedAt?: string | null;
  /** Live-verification confidence. Never assume shoppable. */
  verification?: VerificationState;
};

export type AutoEditSlotPick = AutoEditCandidate & {
  heuristicScore: number;
  rationale?: string | null;
};

export type AutoEditLookDraft = {
  slots: AutoEditSlotPick[];
  complete: boolean;
  missingSlots: VisibleProductSlot[];
};

/** A slot pick is only "shoppable" when a real check confirmed it recently. */
export type VerificationState = "verified" | "needs_verification" | "failed";

/** A verification older than this is no longer trusted. */
export const VERIFICATION_MAX_AGE_DAYS = 14;

const VERDICT_OK = new Set(["ok", "available", "in_stock", "verified", "healthy", "pass"]);
const VERDICT_BAD = new Set(["404", "gone", "sold_out", "unavailable", "fail", "error"]);

/**
 * Derives verification state from whatever provenance the record carries.
 * Absent or stale evidence is NEVER treated as shoppable — it is surfaced to
 * the founder as NEEDS VERIFICATION.
 */
export function deriveVerification(input: {
  lastCheckedAt?: string | null;
  verdict?: string | null;
  now?: Date;
}): VerificationState {
  const verdict = (input.verdict ?? "").trim().toLowerCase();
  if (verdict && VERDICT_BAD.has(verdict)) return "failed";
  if (!input.lastCheckedAt) return "needs_verification";
  const checked = Date.parse(input.lastCheckedAt);
  if (!Number.isFinite(checked)) return "needs_verification";
  const ageDays = ((input.now ?? new Date()).getTime() - checked) / 86_400_000;
  if (ageDays > VERIFICATION_MAX_AGE_DAYS) return "needs_verification";
  if (verdict && !VERDICT_OK.has(verdict)) return "needs_verification";
  return "verified";
}


export function mapToCanonicalSlot(
  slot: string | null | undefined,
  slotLabel?: string | null,
): VisibleProductSlot | null {
  const raw = (slot ?? "").trim().toLowerCase();
  if (raw === "dress" || raw === "reference dress" || raw === "set" || raw === "coord")
    return "outfit";
  if (raw === "shoe" || raw === "sandal" || raw === "sandals") return "shoes";
  if (raw === "clutch" || raw === "tote" || raw === "pouch") return "bag";
  return canonicalVisibleSlot(slot) ?? canonicalVisibleSlot(slotLabel);
}

/** A row is eligible only with a live status and a real external PDP. */
const LIVE = new Set(["active", "live", "ok", "verified", "healthy"]);

export function isEligibleRow(row: {
  status?: string | null;
  url?: string | null;
}): boolean {
  if (!LIVE.has((row.status ?? "").trim().toLowerCase())) return false;
  return isPublishableProductUrl(row.url ?? null);
}

// ── Heuristic coherence scoring (free, deterministic) ─────────────

const WARM_LEATHER = /\b(tan|cognac|caramel|camel|brown|chocolate|natural)\b/i;
const COOL_LEATHER = /\b(black|jet|onyx)\b/i;
const GOLD = /\b(gold|gilded|brass|vermeil)\b/i;
const SILVER = /\b(silver|platinum|rhodium|white gold)\b/i;
const BAD_DAY_SHOE = /\b(sneaker|trainer|boot|bootie|platform|pool slide|flip.?flop|stiletto 105|clog)\b/i;
const PEARL = /\bpearl\b/i;
const LOUD_TREND = /\b(cargo|logomania|bedazzled|rhinestone|micro.?mini|neon)\b/i;

function text(c: AutoEditCandidate): string {
  const dna = c.styleDna ?? {};
  return [c.brand, c.productName, dna["color"], dna["material"], dna["silhouette"]]
    .filter(Boolean)
    .join(" ");
}

function leatherFamily(c: AutoEditCandidate): "warm" | "cool" | null {
  const t = text(c);
  if (WARM_LEATHER.test(t)) return "warm";
  if (COOL_LEATHER.test(t)) return "cool";
  return null;
}

function metalFamily(c: AutoEditCandidate): "gold" | "silver" | null {
  const t = text(c);
  if (GOLD.test(t)) return "gold";
  if (SILVER.test(t)) return "silver";
  return null;
}

const JEWELRY_SLOTS = new Set<VisibleProductSlot>(["earrings", "necklace", "bracelet"]);

/**
 * Holistic 0–100 coherence score for a whole assembled look. Deliberately
 * evaluates the OUTFIT, not each slot in isolation.
 */
export function heuristicCoherence(
  slots: AutoEditSlotPick[],
  opts: { pearlsApproved?: boolean } = {},
): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 82;

  // Colour / leather harmony
  const families = slots
    .filter((s) => s.slot === "shoes" || s.slot === "bag" || s.slot === "belt")
    .map(leatherFamily)
    .filter(Boolean) as ("warm" | "cool")[];
  if (new Set(families).size > 1) {
    score -= 14;
    notes.push("Brown and black leathers mixed in one look.");
  } else if (families.length >= 2) {
    score += 5;
    notes.push("Leather accessories share one colour family.");
  }

  // Jewellery coordination
  const jewels = slots.filter((s) => JEWELRY_SLOTS.has(s.slot));
  const metals = new Set(jewels.map(metalFamily).filter(Boolean));
  if (metals.size > 1) {
    score -= 10;
    notes.push("Jewellery mixes metal families.");
  } else if (metals.size === 1 && jewels.length >= 2) {
    score += 5;
    notes.push("Jewellery stays in one metal family.");
  }
  const designers = new Set(jewels.map((j) => j.brand.trim().toLowerCase()).filter(Boolean));
  if (jewels.length >= 2 && designers.size === 1) {
    score += 4;
    notes.push("Jewellery is a single designer suite.");
  }

  // Footwear appropriateness
  for (const s of slots) {
    if (s.slot === "shoes" && BAD_DAY_SHOE.test(text(s))) {
      score -= 34;
      notes.push(`${s.brand} footwear is wrong for an elegant daytime lunch.`);
    }
  }

  // Taste guards
  for (const s of slots) {
    if (!opts.pearlsApproved && PEARL.test(text(s))) {
      score -= 12;
      notes.push(`${s.brand} reads as pearls, which are not approved.`);
    }
    if (LOUD_TREND.test(text(s))) {
      score -= 10;
      notes.push(`${s.productName} reads trend-driven.`);
    }
  }

  // Visual interest: a look built only of plain neutrals is dull.
  const interesting = slots.some((s) =>
    /\b(print|floral|stripe|eyelet|majolica|embroider|raffia|crochet|pleat|jacquard)\b/i.test(
      text(s),
    ),
  );
  if (interesting) {
    score += 6;
    notes.push("The look carries genuine visual interest.");
  } else {
    score -= 5;
    notes.push("The look is very plain; consider more colour or texture.");
  }

  // Brand-level breadth — a look of one label reads like a lookbook page.
  const brands = new Set(slots.map((s) => s.brand.trim().toLowerCase()));
  if (brands.size >= 4) score += 3;

  return { score: Math.max(0, Math.min(100, Math.round(score))), notes };
}

/** Score a single candidate for a slot, given the pieces already locked in. */
export function heuristicSlotFit(
  candidate: AutoEditCandidate,
  keep: AutoEditSlotPick[],
  opts: { pearlsApproved?: boolean } = {},
): number {
  const trial: AutoEditSlotPick[] = [...keep, { ...candidate, heuristicScore: 0 }];
  return heuristicCoherence(trial, opts).score;
}

/** Coherence a look must reach to be published. */
export const MIN_PUBLISH_COHERENCE = 74;
/** A single-slot repair must reach this, else the system rebuilds the look. */
export const MIN_SINGLE_SLOT_COHERENCE = 80;

/** Stable fingerprint of an assembled look — used to skip needless restyling. */
export function lookFingerprint(slots: { slot: string; url: string }[]): string {
  return slots
    .map((s) => `${s.slot}:${s.url}`)
    .sort()
    .join("|");
}

export function missingRequiredSlots(slots: { slot: string }[]): VisibleProductSlot[] {
  const present = new Set(slots.map((s) => s.slot));
  return LONG_LUNCH_REQUIRED_SLOTS.filter((s) => !present.has(s));
}
