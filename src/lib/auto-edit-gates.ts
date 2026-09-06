/**
 * RESORT EDIT — AUTO-EDIT PUBLISH GATES (client-safe, pure)
 *
 * Every deterministic reason a generated look may NOT be published lives here,
 * so the admin UI, the engine and the regression tests all read the same rules.
 *
 * The gates are deliberately pessimistic:
 *   - unknown stock (blocked page, timeout, never checked, stale check) is NOT
 *     availability; it holds publication,
 *   - a merchant outside the approved retailer/brand-direct policy is rejected
 *     before ranking ever happens,
 *   - a URL whose host does not match its claimed retailer is rejected,
 *   - the AI stylist verdict must be a real verdict over real candidate ids;
 *     a heuristic score is never a substitute,
 *   - a look and its muse hero image must match, or the version is blocked.
 */
import { APPROVED_RETAILER_PRIORITY } from "./resort-edit-styling-rules";
import { classifyShopUrl } from "./shop-url-policy";
import type { VisibleProductSlot } from "./look-atomic-completeness";
import { momentBrief, missingBriefSlots, sunglassesAllowed, type MomentBrief } from "./portofino-moment-briefs";

export const PUBLISH_GATE_VERSION = "auto-edit-gates-v1";

/** A stock/PDP check older than this is no longer evidence of anything. */
export const STOCK_EVIDENCE_MAX_AGE_DAYS = 7;

/** Host fragments that identify each approved affiliate retailer. */
export const APPROVED_RETAILER_HOSTS: Record<string, readonly string[]> = {
  "Revolve": ["revolve.com"],
  "Shopbop": ["shopbop.com"],
  "Saks Fifth Avenue": ["saksfifthavenue.com", "saks.com"],
  "Neiman Marcus": ["neimanmarcus.com"],
  "Nordstrom": ["nordstrom.com"],
  "Bloomingdale's": ["bloomingdales.com"],
  "Net-a-Porter": ["net-a-porter.com"],
  "MyTheresa": ["mytheresa.com"],
  "Moda Operandi": ["modaoperandi.com"],
  "MatchesFashion": ["matchesfashion.com"],
};

/**
 * Brand-direct domains verified by hand. Brand-direct linking is only allowed
 * from a domain on this list — a hostname that merely contains part of the
 * brand name proves nothing and is rejected.
 */
export const VERIFIED_BRAND_DIRECT_HOSTS: Record<string, readonly string[]> = {
  "Zimmermann": ["zimmermann.com"],
  "Posse": ["posse.com.au", "poss.com"],
  "Faithfull the Brand": ["faithfullthebrand.com"],
  "Jenny Bird": ["jenny-bird.com", "jennybird.com"],
  "Dragon Diffusion": ["dragondiffusion.com"],
  "Alexandra Miro": ["alexandramiro.com"],
  "Mister Zimi": ["misterzimi.com"],
  "Ancient Greek Sandals": ["ancient-greek-sandals.com"],
  "STAUD": ["staud.clothing"],
  "Illesteva": ["illesteva.com"],
  "Karla Colletto": ["karlacolletto.com"],
  "Missoni": ["missoni.com"],
  "Le Specs": ["lespecs.com"],
  "The Attico": ["theattico.com"],
};


export type StockEvidence = {
  /** Only "in_stock" is availability. Everything else holds publication. */
  availability: "in_stock" | "out_of_stock" | "unknown";
  checkedAt: string | null;
  /** Where the evidence came from: pdp_probe, feed:<id>, manual, none. */
  provenance: string | null;
  /** Canonical product page. */
  canonicalUrl: string | null;
  /** Affiliate/tracking URL, when one genuinely exists. Never assumed. */
  affiliateUrl?: string | null;
};

export type GatedPick = {
  slot: VisibleProductSlot;
  brand: string;
  productName: string;
  retailer: string | null;
  url: string;
  candidateId: string;
  evidence: StockEvidence;
  /** Jewellery metal family, when known ("gold" | "silver" | ...). */
  metal?: string | null;
  /** Jewellery designer, when known — usually the brand. */
  designer?: string | null;
};

export type GateFailure = { gate: string; slot?: VisibleProductSlot; detail: string };

export type GateResult = {
  ok: boolean;
  failures: GateFailure[];
};

const ok = (failures: GateFailure[]): GateResult => ({ ok: failures.length === 0, failures });

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

// ── Merchant policy ───────────────────────────────────────────────

export function isApprovedRetailer(retailer: string | null | undefined): boolean {
  if (!retailer) return false;
  const r = retailer.trim().toLowerCase();
  return Object.keys(APPROVED_RETAILER_HOSTS).some((k) => k.toLowerCase() === r);
}

/**
 * Merchant gate. An approved affiliate retailer must be served from one of its
 * own hosts. Brand-direct is only allowed when the retailer is the brand and
 * the host plausibly belongs to that brand.
 */
export function merchantGate(pick: GatedPick): GateResult {
  const failures: GateFailure[] = [];
  const verdict = classifyShopUrl(pick.url);
  if (!verdict.publishable) {
    failures.push({
      gate: "canonical_pdp",
      slot: pick.slot,
      detail: `${verdict.kind}: ${verdict.reason ?? "not an exact product page"}`,
    });
    return ok(failures);
  }
  const host = hostOf(pick.url);
  if (!host) {
    failures.push({ gate: "canonical_pdp", slot: pick.slot, detail: "unparseable URL host" });
    return ok(failures);
  }

  const retailerKey = Object.keys(APPROVED_RETAILER_HOSTS).find(
    (k) => k.toLowerCase() === (pick.retailer ?? "").trim().toLowerCase(),
  );
  if (retailerKey) {
    const hosts = APPROVED_RETAILER_HOSTS[retailerKey] ?? [];
    if (!hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      failures.push({
        gate: "retailer_domain_mismatch",
        slot: pick.slot,
        detail: `${retailerKey} link served from ${host}`,
      });
    }
    return ok(failures);
  }

  // Brand-direct fallback: the host must be an explicitly VERIFIED brand-direct
  // domain. A partial name token in a hostname is not verification.
  const brandKey = Object.keys(VERIFIED_BRAND_DIRECT_HOSTS).find(
    (k) => k.toLowerCase() === pick.brand.trim().toLowerCase(),
  );
  const allowed = brandKey ? (VERIFIED_BRAND_DIRECT_HOSTS[brandKey] ?? []) : [];
  if (!allowed.some((h) => host === h || host.endsWith(`.${h}`))) {
    failures.push({
      gate: "merchant_not_approved",
      slot: pick.slot,
      detail: `${pick.retailer ?? "unknown merchant"} (${host}) is neither an approved retailer (${APPROVED_RETAILER_PRIORITY.join(", ")}) nor a verified brand-direct domain for ${pick.brand}`,
    });
  }
  return ok(failures);
}


// ── Stock evidence ────────────────────────────────────────────────

export function evidenceIsFresh(
  evidence: StockEvidence,
  now: Date = new Date(),
  maxAgeDays = STOCK_EVIDENCE_MAX_AGE_DAYS,
): boolean {
  if (!evidence.checkedAt) return false;
  const t = Date.parse(evidence.checkedAt);
  if (!Number.isFinite(t)) return false;
  const age = now.getTime() - t;
  // A check "from the future" is a clock or data error, not evidence.
  if (age < -60 * 60 * 1000) return false;
  return age <= maxAgeDays * 86_400_000;
}


export function stockGate(pick: GatedPick, now: Date = new Date()): GateResult {
  const failures: GateFailure[] = [];
  const e = pick.evidence;
  if (e.availability === "out_of_stock") {
    failures.push({ gate: "sold_out", slot: pick.slot, detail: `${pick.brand} ${pick.productName} is sold out` });
    return ok(failures);
  }
  if (e.availability === "unknown") {
    failures.push({
      gate: "stock_unknown",
      slot: pick.slot,
      detail: "no confirmed in-stock evidence (blocked page, timeout or never checked)",
    });
    return ok(failures);
  }
  if (!e.provenance) {
    failures.push({ gate: "evidence_provenance_missing", slot: pick.slot, detail: "stock claim has no provenance" });
  }
  if (!evidenceIsFresh(e, now)) {
    failures.push({
      gate: "evidence_stale",
      slot: pick.slot,
      detail: `stock evidence older than ${STOCK_EVIDENCE_MAX_AGE_DAYS} days`,
    });
  }
  return ok(failures);
}

// ── Garment coverage (separates need top AND bottom) ─────────────

const ONE_PIECE =
  /\b(dress|gown|jumpsuit|romper|caftan|kaftan|maillot|one-?piece|swimsuit|playsuit|midi|maxi|slip)\b/i;
const TOP_ONLY = /\b(top|blouse|shirt|cami|bralette|bikini top|corset|bodysuit|knit|sweater|tee)\b/i;
const BOTTOM_ONLY = /\b(trouser|pant|short|skirt|culotte|bikini bottom|brief)\b/i;

export function garmentCoverageGate(outfitPicks: GatedPick[]): GateResult {
  const failures: GateFailure[] = [];
  if (outfitPicks.length === 0) {
    failures.push({ gate: "garment_missing", slot: "outfit", detail: "no garment linked" });
    return ok(failures);
  }
  const names = outfitPicks.map((p) => `${p.brand} ${p.productName}`);
  if (names.some((n) => ONE_PIECE.test(n))) return ok(failures);
  const hasTop = names.some((n) => TOP_ONLY.test(n));
  const hasBottom = names.some((n) => BOTTOM_ONLY.test(n));
  if (hasTop && hasBottom) return ok(failures);
  failures.push({
    gate: "separates_incomplete",
    slot: "outfit",
    detail: hasTop
      ? "a top is linked but no bottom — separates need both"
      : hasBottom
        ? "a bottom is linked but no top — separates need both"
        : "garment does not read as a complete outfit",
  });
  return ok(failures);
}

// ── Jewellery cohesion, pearls, rings ────────────────────────────

const JEWELLERY_SLOTS: readonly VisibleProductSlot[] = ["earrings", "necklace", "bracelet"];

export function jewelleryGate(picks: GatedPick[]): GateResult {
  const failures: GateFailure[] = [];
  const jewels = picks.filter((p) => JEWELLERY_SLOTS.includes(p.slot));
  for (const p of picks) {
    const label = `${p.brand} ${p.productName}`;
    if (/\bring\b/i.test(label)) {
      failures.push({ gate: "ring_forbidden", slot: p.slot, detail: `${label} reads as a ring` });
    }
    if (/\bpearl/i.test(label)) {
      failures.push({ gate: "pearls_forbidden", slot: p.slot, detail: `${label} reads as pearls` });
    }
  }
  const designers = new Set(jewels.map((j) => (j.designer ?? j.brand).trim().toLowerCase()).filter(Boolean));
  if (designers.size > 1) {
    failures.push({
      gate: "jewellery_designer_mixed",
      detail: `jewellery spans ${designers.size} designers: ${[...designers].join(", ")}`,
    });
  }
  const metals = new Set(jewels.map((j) => (j.metal ?? "").trim().toLowerCase()).filter(Boolean));
  if (metals.size > 1) {
    failures.push({ gate: "jewellery_metal_mixed", detail: `mixed metals: ${[...metals].join(", ")}` });
  }
  return ok(failures);
}

// ── Moment brief completeness + time-of-day rules ────────────────

export function briefGate(brief: MomentBrief, picks: GatedPick[]): GateResult {
  const failures: GateFailure[] = [];
  const filled = new Set(picks.map((p) => p.slot));
  for (const missing of missingBriefSlots(brief, filled)) {
    failures.push({ gate: "required_slot_missing", slot: missing, detail: `${brief.momentName} requires ${missing}` });
  }
  if (!sunglassesAllowed(brief) && filled.has("sunglasses")) {
    failures.push({
      gate: "sunglasses_at_night",
      slot: "sunglasses",
      detail: `${brief.momentName} is an evening moment — sunglasses must not appear`,
    });
  }
  return ok(failures);
}

// ── AI verdict ───────────────────────────────────────────────────

export type StylistVerdict = {
  /** Model that produced the verdict. */
  model: string | null;
  /** slot → candidate id the model actually chose. */
  picks: Record<string, string>;
  coherence: number;
  rationale: string;
  concerns: string[];
  approved: boolean;
};

export const MIN_STYLIST_COHERENCE = 85;

/**
 * A verdict counts only when a real model answered, every pick is a real
 * candidate id for the right slot, coherence clears the bar and the model
 * raised no unresolved concern.
 */
export function stylistVerdictGate(
  verdict: StylistVerdict | null,
  validCandidateIdsBySlot: Record<string, readonly string[]>,
): GateResult {
  const failures: GateFailure[] = [];
  if (!verdict || !verdict.model) {
    failures.push({ gate: "stylist_verdict_absent", detail: "no AI stylist verdict — a heuristic score is not a verdict" });
    return ok(failures);
  }
  for (const [slot, id] of Object.entries(verdict.picks)) {
    const allowed = validCandidateIdsBySlot[slot];
    if (!allowed || !allowed.includes(id)) {
      failures.push({
        gate: "stylist_pick_invalid",
        slot: slot as VisibleProductSlot,
        detail: `model chose an id that was not offered for ${slot}`,
      });
    }
  }
  if (verdict.coherence < MIN_STYLIST_COHERENCE) {
    failures.push({
      gate: "stylist_coherence_low",
      detail: `coherence ${verdict.coherence} below ${MIN_STYLIST_COHERENCE}`,
    });
  }
  if (verdict.concerns.length > 0) {
    failures.push({ gate: "stylist_concerns_open", detail: verdict.concerns.join("; ") });
  }
  if (!verdict.approved) {
    failures.push({ gate: "stylist_not_approved", detail: "model did not approve the look" });
  }
  return ok(failures);
}

// ── Hero image pairing ───────────────────────────────────────────

export type HeroValidation = {
  /** Fingerprint of the slot set the image was generated for. */
  slotsFingerprint: string | null;
  identityScore: number | null;
  garmentScore: number | null;
  cropSafe: boolean | null;
  referenceUsed: string | null;
  /** Every reference actually supplied to the generator as image pixels. */
  referencesUsed?: readonly string[];
  /**
   * Affirmative verifier statements. Each must be an explicit `true` — a
   * missing field is never treated as a pass, and a model score alone is not
   * proof of any of them.
   */
  headInFrame?: boolean | null;
  bodyInFrame?: boolean | null;
  feetInFrame?: boolean | null;
  identityConfirmed?: boolean | null;
  productsConfirmed?: boolean | null;
  notes?: string | null;
};


export const HERO_MIN_IDENTITY = 0.85;
export const HERO_MIN_GARMENT = 0.8;

export function heroGate(
  hero: { imageUrl: string | null; validation: HeroValidation | null },
  slotsFingerprint: string,
): GateResult {
  const failures: GateFailure[] = [];
  if (!hero.imageUrl) {
    failures.push({ gate: "hero_missing", detail: "no matching muse hero image for this outfit version" });
    return ok(failures);
  }
  const v = hero.validation;
  if (!v) {
    failures.push({ gate: "hero_unvalidated", detail: "hero image has not been validated" });
    return ok(failures);
  }
  if (!v.referenceUsed) {
    failures.push({
      gate: "hero_identity_reference_missing",
      detail: "hero was not generated against the approved canonical identity reference",
    });
  }
  if (v.slotsFingerprint !== slotsFingerprint) {
    failures.push({ gate: "hero_outfit_mismatch", detail: "hero image was generated for a different outfit" });
  }
  if ((v.identityScore ?? 0) < HERO_MIN_IDENTITY) {
    failures.push({ gate: "hero_identity_low", detail: `identity similarity ${v.identityScore ?? 0}` });
  }
  if ((v.garmentScore ?? 0) < HERO_MIN_GARMENT) {
    failures.push({ gate: "hero_garment_low", detail: `garment fidelity ${v.garmentScore ?? 0}` });
  }
  if (v.cropSafe !== true) {
    failures.push({ gate: "hero_crop_unsafe", detail: "head, hair, body or shoes not safely framed" });
  }
  return ok(failures);
}

// ── Aggregate ────────────────────────────────────────────────────

export type PublishDecision = {
  publishable: boolean;
  failures: GateFailure[];
  /** Grouped for the admin UI. */
  byGate: Record<string, GateFailure[]>;
};

export function evaluatePublishGates(input: {
  momentSlug: string;
  picks: GatedPick[];
  verdict: StylistVerdict | null;
  candidateIdsBySlot: Record<string, readonly string[]>;
  hero: { imageUrl: string | null; validation: HeroValidation | null };
  slotsFingerprint: string;
  now?: Date;
}): PublishDecision {
  const failures: GateFailure[] = [];
  const brief = momentBrief(input.momentSlug);
  if (!brief) {
    failures.push({ gate: "moment_unknown", detail: `no editorial brief for ${input.momentSlug}` });
  } else {
    failures.push(...briefGate(brief, input.picks).failures);
  }
  for (const pick of input.picks) {
    failures.push(...merchantGate(pick).failures);
    failures.push(...stockGate(pick, input.now ?? new Date()).failures);
  }
  failures.push(...garmentCoverageGate(input.picks.filter((p) => p.slot === "outfit")).failures);
  failures.push(...jewelleryGate(input.picks).failures);
  failures.push(...stylistVerdictGate(input.verdict, input.candidateIdsBySlot).failures);
  failures.push(...heroGate(input.hero, input.slotsFingerprint).failures);

  const byGate: Record<string, GateFailure[]> = {};
  for (const f of failures) (byGate[f.gate] ??= []).push(f);
  return { publishable: failures.length === 0, failures, byGate };
}

/** Stable fingerprint of an outfit: slot + canonical URL, order-independent. */
export function outfitFingerprint(picks: { slot: string; url: string }[]): string {
  return picks
    .map((p) => `${p.slot}:${p.url.trim().toLowerCase()}`)
    .sort()
    .join("|");
}

// ── Three-brand diversity across a Moment ─────────────────────────

/** Main clothing brand of a look = the brand of its garment ("outfit") slot. */
export function mainClothingBrand(picks: readonly GatedPick[]): string | null {
  const garment = picks.find((p) => p.slot === "outfit");
  return garment ? garment.brand.trim() : null;
}

/**
 * Founder rule: every Moment publishes exactly three complete looks whose MAIN
 * clothing brands are all different. Coordinated pieces inside one outfit may
 * share a brand; the hero and both supports may not.
 */
export function momentBrandDiversityGate(
  looks: readonly { lookKey: string; picks: readonly GatedPick[] }[],
  requiredLooks = 3,
): GateResult {
  const failures: GateFailure[] = [];
  const brands: string[] = [];
  for (const look of looks) {
    const brand = mainClothingBrand(look.picks);
    if (!brand) {
      failures.push({ gate: "main_brand_unknown", detail: `${look.lookKey} has no linked garment` });
      continue;
    }
    brands.push(brand.toLowerCase());
  }
  if (looks.length < requiredLooks) {
    failures.push({
      gate: "moment_look_count",
      detail: `${looks.length} complete look(s); this Moment requires ${requiredLooks}`,
    });
  }
  const unique = new Set(brands);
  if (brands.length > 0 && unique.size !== brands.length) {
    failures.push({
      gate: "main_brand_repeated",
      detail: `main clothing brands repeat across the Moment: ${brands.join(", ")}`,
    });
  }
  return ok(failures);
}
