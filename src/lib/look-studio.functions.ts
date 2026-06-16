import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import { LOOK_DNA, type LookDNA } from "@/data/lookDNA";
import {
  LOOK_SCORE_CATEGORIES,
  LOOK_SLOTS,
  composite,
  type LookScoreCategory,
  type LookScoring,
  type LookSlot,
} from "./lookScoring";

const pw = z.string().min(1).max(200);

/**
 * Hard quality gate thresholds (0-10 each). A candidate that misses any
 * of these is held in `failed_gate` and never shown to the reviewer.
 */
const GATE_MIN_DESTINATION = 7;
const GATE_MIN_COHESION = 7;
const GATE_MIN_ACCESSORY = 7;
/** Editorial saveability gate: mean of saveability + editorial_uniqueness + luxury_traveler_appeal. */
const GATE_MIN_SAVEABILITY = 7;
/** Resort Edit test threshold — would a wealthy woman save this. */
const GATE_MIN_RESORT_EDIT_TEST = 7;
/** Muse identity / outfit fidelity gates (0-1). */
const GATE_MIN_FACE_SIMILARITY = 0.75;
const GATE_MIN_OUTFIT_FIDELITY = 0.7;
/** Editorial diversity caps within a single candidate. Max share of slots a single trait may occupy. */
const DIVERSITY_CAPS = {
  brand: 0.3,
  silhouette: 0.4,
  fabric: 0.4,
  texture: 0.4,
  print_family: 0.4,
  color_family: 0.4,
  subcategory: 0.3, // "accessory type" — e.g. don't stack 3 raffia bags
} as const;
/** Per-DNA sourcing pool floor — below this we surface a warning. */
export const SOURCING_FLOOR = 150;

type CandidateRow = {
  id: string;
  dna_id: string;
  destination: string;
  day: number | null;
  look: number | null;
  variant: string;
  status: string;
  muse_image_url: string | null;
  lookboard_image_url: string | null;
  scoring: LookScoring;
  composite_score: number | null;
  feedback_history: Array<{ at: string; feedback: string[]; note?: string }>;
  notes: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  brief?: CandidateBriefLike | null;
  quality_gate?: QualityGateLike | null;
  retry_count?: number | null;
  slug?: string | null;
};

export type CandidateBriefLike = {
  variant?: string;
  title?: string;
  destination_energy?: string;
  color_story?: { palette?: string[]; narrative?: string };
  silhouette_strategy?: string;
  accessory_ecosystem?: string;
  luxury_traveler_persona?: string;
  styling_keywords?: string[];
  brand_priorities?: string[];
};

export type QualityGateLike = {
  passed?: boolean;
  reasons?: string[];
  checks?: {
    required_slots_filled?: number;
    required_slots_total?: number;
    muse_present?: boolean;
    destination_specificity?: number;
    styling_cohesion?: number;
    accessory_ecosystem?: number;
  };
  thresholds?: { destination_specificity?: number; styling_cohesion?: number; accessory_ecosystem?: number };
  evaluated_at?: string;
};

type SlotRow = {
  id: string;
  candidate_id: string;
  slot: LookSlot;
  sourced_product_id: string | null;
  vault_product_id: string | null;
  position: number;
  notes: string | null;
};

/**
 * REQUIRED slots for every Resort Edit look. A candidate that cannot fill
 * every required slot is regenerated; if it still fails it is marked
 * `failed_gate`.
 *
 * Swimwear is required only on water looks; sunglasses only on daytime.
 */
function requiredSlotsFor(dna: LookDNA): LookSlot[] {
  const isDaytime = !/dinner|night|evening|sunset/i.test(dna.activity);
  const slots: LookSlot[] = [];
  if (dna.isWaterLook) slots.push("swimwear");
  slots.push("dress_or_coverup", "shoes", "bag", "earrings", "necklace", "bracelet", "ring");
  if (isDaytime) slots.push("sunglasses");
  slots.push("hair_detail");
  return slots;
}

/** DNA queue view: per-DNA candidate counts so the admin sees what needs work. */
export const listLookDNAQueue = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("look_candidates")
      .select("id, dna_id, status, composite_score, updated_at");
    if (error) throw new Error(error.message);

    const counts = new Map<
      string,
      { total: number; approved: number; pending: number; rejected: number; best: number | null }
    >();
    for (const dna of Object.values(LOOK_DNA)) {
      counts.set(dna.id, { total: 0, approved: 0, pending: 0, rejected: 0, best: null });
    }
    for (const r of rows ?? []) {
      const c = counts.get(r.dna_id) ?? { total: 0, approved: 0, pending: 0, rejected: 0, best: null };
      c.total += 1;
      if (r.status === "approved" || r.status === "published") c.approved += 1;
      else if (r.status === "rejected") c.rejected += 1;
      else c.pending += 1;
      if (r.composite_score != null && (c.best == null || Number(r.composite_score) > c.best)) {
        c.best = Number(r.composite_score);
      }
      counts.set(r.dna_id, c);
    }

    return {
      ok: true as const,
      dnas: Object.values(LOOK_DNA).map((d) => ({
        id: d.id,
        name: d.name ?? d.id,
        destination: d.destination,
        activity: d.activity,
        mood: d.mood,
        tier: d.tier,
        isWaterLook: d.isWaterLook,
        targetBrands: d.targetBrands ?? [],
        counts: counts.get(d.id) ?? { total: 0, approved: 0, pending: 0, rejected: 0, best: null },
      })),
    };
  });

export const listCandidatesForDNA = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, dna_id: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: candidates, error } = await supabaseAdmin
      .from("look_candidates")
      .select("*")
      .eq("dna_id", data.dna_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (candidates ?? []).map((c) => c.id);
    let slots: Array<SlotRow & { product?: SourcedProductLite | null }> = [];
    if (ids.length) {
      const { data: slotRows, error: slotErr } = await supabaseAdmin
        .from("look_candidate_slots")
        .select(
          "id, candidate_id, slot, sourced_product_id, vault_product_id, product_id, position, notes",
        )
        .in("candidate_id", ids);
      if (slotErr) throw new Error(slotErr.message);

      const sourcedIds = (slotRows ?? [])
        .map((s) => s.sourced_product_id)
        .filter((x): x is string => !!x);
      let productMap = new Map<string, SourcedProductLite>();
      if (sourcedIds.length) {
        const { data: prods } = await supabaseAdmin
          .from("sourced_products")
          .select("id, brand, product_name, price, currency, image_url, source_url, affiliate_url, retailer_domain")
          .in("id", sourcedIds);
        productMap = new Map((prods ?? []).map((p) => [p.id, p]));
      }
      slots = (slotRows ?? []).map((s) => ({
        ...(s as SlotRow),
        product: s.sourced_product_id ? productMap.get(s.sourced_product_id) ?? null : null,
      }));
    }

    // Pool stats — how big is the sourced funnel vs how many are eligible to fill slots.
    const { count: sourcedTotal } = await supabaseAdmin
      .from("sourced_products")
      .select("id", { count: "exact", head: true });
    const { count: eligibleTotal } = await supabaseAdmin
      .from("sourced_products")
      .select("id", { count: "exact", head: true })
      .neq("status", "rejected")
      .not("image_url", "is", null);

    // Split ready-for-review vs discarded so the admin UI never shows
    // incomplete or muse-less candidates in the review lane.
    const ready: typeof candidates = [];
    const discarded: typeof candidates = [];
    const archived: typeof candidates = [];
    for (const c of candidates ?? []) {
      if (c.status === "discarded" || c.status === "failed_gate") discarded.push(c);
      else if (c.status === "rejected") archived.push(c);
      else ready.push(c);
    }

    return {
      ok: true as const,
      dna: LOOK_DNA[data.dna_id] ?? null,
      candidates: (candidates ?? []) as unknown as CandidateRow[],
      ready: ready as unknown as CandidateRow[],
      discarded: discarded as unknown as CandidateRow[],
      archived: archived as unknown as CandidateRow[],
      slots,
      pool: {
        sourced: sourcedTotal ?? 0,
        eligible: eligibleTotal ?? 0,
        floor: SOURCING_FLOOR,
      },
    };
  });

type SourcedProductLite = {
  id: string;
  brand: string | null;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  source_url: string;
  affiliate_url: string | null;
  retailer_domain: string | null;
};

/** Slot → sourced_products.slot_category fuzzy match. */
const SLOT_CATEGORY_MAP: Record<LookSlot, string[]> = {
  swimwear: ["swimwear", "swim", "bikini", "one-piece"],
  dress_or_coverup: ["coverup", "cover-up", "dress", "kaftan", "pareo"],
  shoes: ["sandals", "shoes", "espadrilles", "flats", "heels", "wedge"],
  bag: ["bag", "tote", "clutch", "raffia"],
  earrings: ["earrings"],
  necklace: ["necklace"],
  bracelet: ["bracelet"],
  ring: ["ring"],
  sunglasses: ["sunglasses"],
  hair_detail: ["hair", "scarf"],
  optional_layer: ["layer", "kaftan", "coverup", "shirt"],
};

function matchesSlot(slot: LookSlot, sp: { slot_category: string | null; brand: string | null }): boolean {
  if (!sp.slot_category) return false;
  const cat = sp.slot_category.toLowerCase();
  return SLOT_CATEGORY_MAP[slot].some((kw) => cat.includes(kw));
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate three complete outfit candidates for a given Look DNA.
 *
 * AESTHETIC-FIRST PIPELINE (one call per variant set):
 *   1. Generate N differentiated briefs (destination energy, color story,
 *      silhouette strategy, accessory ecosystem, traveler persona) in a
 *      single AI call so the model deliberately differentiates A/B/C.
 *   2. For each brief: assemble a complete outfit biased by the brief's
 *      brand priorities + styling keywords. Up to 2 reshuffles if any
 *      REQUIRED slot is empty.
 *   3. Generate a mandatory editorial muse image from the brief.
 *   4. Score the look. Quality gate: every required slot filled + muse
 *      present + destination ≥ 7 + cohesion ≥ 7 + accessory ≥ 7.
 *   5. Pass → status = `pending_review`. Fail → status = `failed_gate`
 *      (still visible in the list with a regenerate-needed badge).
 */
export const generateLookCandidates = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, dna_id: z.string().min(1).max(200), count: z.number().int().min(1).max(5).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const dna = LOOK_DNA[data.dna_id];
    if (!dna) throw new Error(`Unknown DNA: ${data.dna_id}`);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateCandidateBriefs, museImagePrompt } = await import("./candidate-brief.server");
    const { generateAndStoreMuse, verifyMuseFidelity } = await import("./muse-image.server");
    const { getDestinationMuse, destinationRequiresMuseContinuity } = await import("./destination-muse.server");

    // Identity-lock muse for this destination (Lilla → Portofino, etc).
    const destMuse = await getDestinationMuse(dna.destination);
    const requiresContinuity = destinationRequiresMuseContinuity(dna.destination);
    if (requiresContinuity && !destMuse) {
      throw new Error(`Destination "${dna.destination}" requires a configured muse but none is set in destination_muses.`);
    }

    // Pull candidate-eligible products: not rejected; have image + brand + name.
    const { data: pool, error: poolErr } = await supabaseAdmin
      .from("sourced_products")
      .select("id, brand, brand_id, product_name, price, currency, image_url, source_url, affiliate_url, retailer_domain, slot_category, status, auto_approved, category, subcategory, silhouette, fabric, texture, print_family, color_family, destination_tags, activity_tags")
      .neq("status", "rejected")
      .not("image_url", "is", null);
    if (poolErr) throw new Error(poolErr.message);

    const eligible = (pool ?? []).filter((p) => p.image_url && p.brand && p.product_name);

    // Hero brands receive a soft sourcing-priority boost when assembling.
    const { data: heroBrandRows } = await supabaseAdmin
      .from("brands")
      .select("id, name")
      .eq("is_hero", true);
    const heroBrandIds = new Set((heroBrandRows ?? []).map((b) => b.id));
    const heroBrandNames = new Set((heroBrandRows ?? []).map((b) => b.name.toLowerCase()));

    const requiredSlots = requiredSlotsFor(dna);
    // optional_layer is nice-to-have; tried but not gated.
    const slotsToFill: LookSlot[] = [...requiredSlots, "optional_layer"];

    const count = data.count ?? 3;
    // Find next variant letter so "Generate 3 more" appends D/E/F… instead of recreating A/B/C.
    const { data: existingCands } = await supabaseAdmin
      .from("look_candidates")
      .select("variant")
      .eq("dna_id", dna.id);
    const used = new Set((existingCands ?? []).map((c) => String(c.variant ?? "").toUpperCase()));
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const variants: string[] = [];
    for (const letter of alphabet) {
      if (variants.length >= count) break;
      if (!used.has(letter)) variants.push(letter);
    }

    // Stage 1: generate ALL briefs in one AI call — drives differentiation.
    const briefs = await generateCandidateBriefs(dna, variants);

    const created: string[] = [];
    const gateResults: Array<{ candidate_id: string; variant: string; passed: boolean; reasons: string[] }> = [];

    for (let i = 0; i < variants.length; i++) {
      const brief = briefs[i];
      const variant = variants[i];

      // Stage 2: insert candidate shell, store brief.
      const { data: cand, error: candErr } = await supabaseAdmin
        .from("look_candidates")
        .insert({
          dna_id: dna.id,
          destination: dna.destination,
          variant,
          status: "assembling",
          scoring: {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          brief: brief as any,
        })
        .select("id")
        .single();
      if (candErr) throw new Error(candErr.message);

      // Stage 3: assemble with up to 2 reshuffles if required slots are missing.
      let slotPicks: Array<{ slot: LookSlot; sourced_product_id: string | null }> = [];
      let missing: LookSlot[] = [];
      let attempt = 0;
      let diversityNotes: string[] = [];
      for (; attempt < 3; attempt++) {
        const seed = Date.now() + i * 1000 + attempt * 991;
        const result = assembleForBrief(
          slotsToFill,
          eligible,
          dna,
          brief,
          seed,
          { heroBrandIds, heroBrandNames },
        );
        slotPicks = result.picks;
        diversityNotes = result.notes;
        missing = requiredSlots.filter(
          (s) => !slotPicks.find((p) => p.slot === s && p.sourced_product_id),
        );
        if (missing.length === 0) break;
      }

      const slotInserts = slotPicks.map((sp, idx) => ({
        candidate_id: cand.id,
        slot: sp.slot,
        sourced_product_id: sp.sourced_product_id,
        position: idx,
      }));
      if (slotInserts.length) {
        const { error: sErr } = await supabaseAdmin
          .from("look_candidate_slots")
          .insert(slotInserts);
        if (sErr) throw new Error(sErr.message);
      }

      // Stage 4: mandatory muse image.
      await supabaseAdmin.from("look_candidates").update({ status: "pending_muse" }).eq("id", cand.id);
      let museUrl: string | null = null;
      let museError: string | null = null;
      let identityLocked = false;
      // One retry on muse failure — never let a museless candidate through.
      for (let museAttempt = 0; museAttempt < 2 && !museUrl; museAttempt++) {
        try {
          const r = await generateAndStoreMuse(cand.id, museImagePrompt(dna, brief), {
            referenceUrl: destMuse?.reference_url ?? null,
            museName: destMuse?.muse_name ?? null,
            faceDescription: destMuse?.face_description ?? null,
            guardrails: destMuse?.style_guardrails ?? null,
          });
          museUrl = r.url;
          identityLocked = r.identity_locked;
          await supabaseAdmin
            .from("look_candidates")
            .update({ muse_image_url: museUrl })
            .eq("id", cand.id);
        } catch (e) {
          museError = String((e as Error).message ?? e).slice(0, 240);
        }
      }

      // Stage 5: score.
      await supabaseAdmin.from("look_candidates").update({ status: "pending_score" }).eq("id", cand.id);
      let scoring: LookScoring = {};
      try {
        scoring = await scoreCandidateInternal(cand.id, dna, slotPicks, eligible);
      } catch (e) {
        await supabaseAdmin
          .from("look_candidates")
          .update({ notes: `Scoring failed: ${String((e as Error).message ?? e).slice(0, 200)}` })
          .eq("id", cand.id);
      }

      // Stage 6: quality gate.
      const reasons: string[] = [];
      if (missing.length) reasons.push(`Missing required slots: ${missing.join(", ")}`);
      if (!museUrl) reasons.push(`Muse preview missing${museError ? `: ${museError}` : ""}`);
      if (requiresContinuity && museUrl && !identityLocked) {
        reasons.push(`Muse identity not locked to ${destMuse?.muse_name ?? "the destination muse"} — reference image was not applied.`);
      }
      const ds = typeof scoring.destination_specificity === "number" ? scoring.destination_specificity : 0;
      const sc = typeof scoring.styling_cohesion === "number" ? scoring.styling_cohesion : 0;
      const ae = typeof scoring.accessory_ecosystem === "number" ? scoring.accessory_ecosystem : 0;
      const sv = typeof scoring.saveability === "number" ? scoring.saveability : 0;
      const eu = typeof scoring.editorial_uniqueness === "number" ? scoring.editorial_uniqueness : 0;
      const la = typeof scoring.luxury_traveler_appeal === "number" ? scoring.luxury_traveler_appeal : 0;
      const editorialMean = (sv + eu + la) / 3;
      if (ds < GATE_MIN_DESTINATION) reasons.push(`Destination specificity ${ds.toFixed(1)} < ${GATE_MIN_DESTINATION}`);
      if (sc < GATE_MIN_COHESION) reasons.push(`Styling cohesion ${sc.toFixed(1)} < ${GATE_MIN_COHESION}`);
      if (ae < GATE_MIN_ACCESSORY) reasons.push(`Accessory ecosystem ${ae.toFixed(1)} < ${GATE_MIN_ACCESSORY}`);
      if (editorialMean < GATE_MIN_SAVEABILITY) {
        reasons.push(
          `Editorial saveability ${editorialMean.toFixed(1)} < ${GATE_MIN_SAVEABILITY} (saveability ${sv}, uniqueness ${eu}, luxury ${la}) — would not feel at home in a Steven Dann carousel`,
        );
      }
      const passed = reasons.length === 0;

      const gate = {
        passed,
        reasons,
        diversity_notes: diversityNotes,
        muse: {
          present: !!museUrl,
          identity_locked: identityLocked,
          muse_name: destMuse?.muse_name ?? null,
          requires_continuity: requiresContinuity,
        },
        checks: {
          required_slots_filled: requiredSlots.length - missing.length,
          required_slots_total: requiredSlots.length,
          muse_present: !!museUrl,
          destination_specificity: ds,
          styling_cohesion: sc,
          accessory_ecosystem: ae,
          editorial_saveability_mean: editorialMean,
        },
        thresholds: {
          destination_specificity: GATE_MIN_DESTINATION,
          styling_cohesion: GATE_MIN_COHESION,
          accessory_ecosystem: GATE_MIN_ACCESSORY,
          editorial_saveability: GATE_MIN_SAVEABILITY,
        },
        evaluated_at: new Date().toISOString(),
      };

      await supabaseAdmin
        .from("look_candidates")
        .update({
          status: passed ? "ready_for_review" : "discarded",
          failure_reason: passed ? null : reasons.slice(0, 4).join(" · "),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          quality_gate: gate as any,
        })
        .eq("id", cand.id);

      gateResults.push({ candidate_id: cand.id, variant, passed, reasons });
      created.push(cand.id);
    }

    return {
      ok: true as const,
      candidate_ids: created,
      pool: { sourced: (pool ?? []).length, eligible: eligible.length },
      gates: gateResults,
      sourcing_warning: eligible.length < SOURCING_FLOOR ? `Only ${eligible.length} eligible products — Resort Edit floor is ${SOURCING_FLOOR}. Source more inventory across approved brands to unlock genuinely differentiated looks.` : null,
    };
  });

/**
 * Brief-aware product assembly. Ranks eligible products by:
 *   1. Brand priority (brief.brand_priorities, then DNA.targetBrands)
 *   2. Keyword overlap with brief.styling_keywords (product_name / slot_category)
 *   3. Deterministic shuffle (so retries vary picks)
 * Each product is used at most once per candidate.
 */
function assembleForBrief(
  slots: LookSlot[],
  eligible: Array<{
    id: string;
    brand: string | null;
    brand_id?: string | null;
    product_name: string | null;
    slot_category: string | null;
    silhouette?: string | null;
    fabric?: string | null;
    texture?: string | null;
    print_family?: string | null;
    color_family?: string | null;
    subcategory?: string | null;
  }>,
  dna: LookDNA,
  brief: { brand_priorities: string[]; styling_keywords: string[] },
  seed: number,
  hero: { heroBrandIds: Set<string>; heroBrandNames: Set<string> },
): {
  picks: Array<{ slot: LookSlot; sourced_product_id: string | null }>;
  notes: string[];
} {
  const usedIds = new Set<string>();
  const brandPrefs = [...brief.brand_priorities, ...(dna.targetBrands ?? [])].map((b) => b.toLowerCase());
  const keywords = brief.styling_keywords.map((k) => k.toLowerCase());
  const notes: string[] = [];

  // Diversity counters — how many slots already consumed each trait value.
  const counts: Record<keyof typeof DIVERSITY_CAPS, Map<string, number>> = {
    brand: new Map(),
    silhouette: new Map(),
    fabric: new Map(),
    texture: new Map(),
    print_family: new Map(),
    color_family: new Map(),
    subcategory: new Map(),
  };

  const totalSlots = slots.length;

  const traitOf = (
    p: (typeof eligible)[number],
    trait: keyof typeof DIVERSITY_CAPS,
  ): string | null => {
    if (trait === "brand") return (p.brand ?? "").toLowerCase() || null;
    return ((p as Record<string, unknown>)[trait] as string | null) ?? null;
  };

  const violatesCap = (
    p: (typeof eligible)[number],
  ): keyof typeof DIVERSITY_CAPS | null => {
    for (const key of Object.keys(DIVERSITY_CAPS) as Array<keyof typeof DIVERSITY_CAPS>) {
      const v = traitOf(p, key);
      if (!v) continue;
      const cap = DIVERSITY_CAPS[key];
      const current = counts[key].get(v) ?? 0;
      // Would assigning this product push us past the cap (rounded down)?
      const maxAllowed = Math.max(1, Math.floor(cap * totalSlots));
      if (current + 1 > maxAllowed) return key;
    }
    return null;
  };

  const picks = slots.map((slot) => {
    const matches = eligible.filter((p) => matchesSlot(slot, p) && !usedIds.has(p.id));
    if (!matches.length) return { slot, sourced_product_id: null };
    const scored = matches.map((p) => {
      const brand = (p.brand ?? "").toLowerCase();
      const name = (p.product_name ?? "").toLowerCase();
      const cat = (p.slot_category ?? "").toLowerCase();
      const brandScore = brandPrefs.findIndex((b) => brand.includes(b));
      const brandBoost = brandScore >= 0 ? (brandPrefs.length - brandScore) * 5 : 0;
      const kwBoost = keywords.reduce((acc, k) => acc + (name.includes(k) || cat.includes(k) ? 3 : 0), 0);
      // Soft hero-brand boost: bumps tie-break ranking, never overrides destination fit.
      const heroBoost =
        (p.brand_id && hero.heroBrandIds.has(p.brand_id)) || hero.heroBrandNames.has(brand)
          ? 4
          : 0;
      return { p, score: brandBoost + kwBoost + heroBoost };
    });
    const ranked = shuffle(scored, seed + slot.length).sort((a, b) => b.score - a.score);
    // Walk ranked options; skip any that would violate a diversity cap.
    let pick: (typeof eligible)[number] | null = null;
    for (const candidate of ranked) {
      const violated = violatesCap(candidate.p);
      if (!violated) {
        pick = candidate.p;
        break;
      }
      // Otherwise keep looking; record once per dimension we had to skip.
    }
    if (!pick && ranked.length) {
      // Diversity-blocked every option — degrade gracefully to best ranked.
      pick = ranked[0].p;
      const violated = violatesCap(pick);
      if (violated) notes.push(`${slot}: cap on ${violated} relaxed (no alternative for this slot)`);
    }
    if (pick) {
      usedIds.add(pick.id);
      for (const key of Object.keys(DIVERSITY_CAPS) as Array<keyof typeof DIVERSITY_CAPS>) {
        const v = traitOf(pick, key);
        if (v) counts[key].set(v, (counts[key].get(v) ?? 0) + 1);
      }
    }
    return { slot, sourced_product_id: pick?.id ?? null };
  });

  // Summarize brand mix for the UI.
  const brandMix = Array.from(counts.brand.entries())
    .map(([b, n]) => `${b} ${Math.round((n / totalSlots) * 100)}%`)
    .join(", ");
  if (brandMix) notes.unshift(`brand mix: ${brandMix}`);

  return { picks, notes };
}

async function scoreCandidateInternal(
  candidateId: string,
  dna: LookDNA,
  slotPicks: Array<{ slot: LookSlot; sourced_product_id: string | null }>,
  pool: Array<{ id: string; brand: string | null; product_name: string | null; price: number | null }>,
): Promise<LookScoring> {
  const productSummary = slotPicks
    .map((sp) => {
      const p = sp.sourced_product_id ? pool.find((x) => x.id === sp.sourced_product_id) : null;
      return `${sp.slot}: ${p ? `${p.brand} — ${p.product_name}${p.price ? ` ($${p.price})` : ""}` : "MISSING"}`;
    })
    .join("\n");

  const scoring = await scoreViaAI(dna, productSummary);
  const comp = composite(scoring);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("look_candidates")
    .update({ scoring, composite_score: comp })
    .eq("id", candidateId);

  return scoring;
}

async function scoreViaAI(dna: LookDNA, productSummary: string): Promise<LookScoring> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    // Fallback: neutral score so UI still renders.
    return Object.fromEntries(LOOK_SCORE_CATEGORIES.map((c) => [c, 5])) as LookScoring;
  }
  const system = `You are the head stylist for Resort Edit, a luxury destination styling platform. Score complete looks (not products) on a 0-10 scale for ten categories. Be honest and editorial — a generic influencer outfit must score low.`;
  const user = `LOOK DNA
Destination: ${dna.destination}
Activity: ${dna.activity}
Mood: ${dna.mood}
Palette: ${dna.palette.join(", ")}
Silhouette: ${dna.silhouette}
Print language: ${dna.printLanguage}
Resort energy: ${dna.resortEnergy}
Styling notes: ${dna.stylingNotes.join("; ")}
Hero piece: ${dna.heroPiece ?? "n/a"}
Target brands: ${(dna.targetBrands ?? []).join(", ") || "n/a"}

ASSEMBLED LOOK
${productSummary}

Score each category 0-10 and return strict JSON: { destination_specificity, activity_fidelity, styling_cohesion, luxury_traveler_appeal, editorial_uniqueness, saveability, emotional_impact, color_story, print_story, accessory_ecosystem, discovery_value, resort_edit_luxury_score, rationale }. emotional_impact = does this look make a wealthy traveler save it? discovery_value = does it surface brands/pieces she would not have found herself?`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: LookScoring;
  try {
    parsed = JSON.parse(content) as LookScoring;
  } catch {
    parsed = {};
  }
  // Clamp 0-10
  for (const cat of LOOK_SCORE_CATEGORIES) {
    const v = parsed[cat];
    if (typeof v === "number") parsed[cat] = Math.max(0, Math.min(10, v)) as LookScoring[LookScoreCategory];
  }
  return parsed;
}

export const rescoreCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, candidate_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cand } = await supabaseAdmin
      .from("look_candidates")
      .select("id, dna_id")
      .eq("id", data.candidate_id)
      .single();
    if (!cand) throw new Error("Candidate not found");
    const dna = LOOK_DNA[cand.dna_id];
    if (!dna) throw new Error("DNA missing");
    const { data: slots } = await supabaseAdmin
      .from("look_candidate_slots")
      .select("slot, sourced_product_id")
      .eq("candidate_id", cand.id);
    const sourcedIds = (slots ?? []).map((s) => s.sourced_product_id).filter((x): x is string => !!x);
    const { data: prods } = await supabaseAdmin
      .from("sourced_products")
      .select("id, brand, product_name, price")
      .in("id", sourcedIds.length ? sourcedIds : ["00000000-0000-0000-0000-000000000000"]);
    await scoreCandidateInternal(
      cand.id,
      dna,
      ((slots ?? []) as Array<{ slot: LookSlot; sourced_product_id: string | null }>).map((s) => ({
        slot: s.slot,
        sourced_product_id: s.sourced_product_id,
      })),
      (prods ?? []).map((p) => ({ ...p, brand: p.brand ?? null, product_name: p.product_name ?? null, price: p.price != null ? Number(p.price) : null })),
    );
    return { ok: true as const };
  });

/**
 * Improve Look: regenerate while preserving DNA. Records feedback,
 * swaps weakest 2 slots for new picks, re-scores.
 */
export const improveLook = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        candidate_id: z.string().uuid(),
        feedback: z.array(z.string().min(1).max(200)).min(1).max(20),
        note: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cand, error: cErr } = await supabaseAdmin
      .from("look_candidates")
      .select("id, dna_id, feedback_history")
      .eq("id", data.candidate_id)
      .single();
    if (cErr || !cand) throw new Error("Candidate not found");
    const dna = LOOK_DNA[cand.dna_id];
    if (!dna) throw new Error("DNA missing");

    await supabaseAdmin
      .from("look_candidates")
      .update({ status: "improving" })
      .eq("id", cand.id);

    // Pull fresh pool and current slot picks.
    const { data: pool } = await supabaseAdmin
      .from("sourced_products")
      .select("id, brand, product_name, price, currency, image_url, source_url, affiliate_url, retailer_domain, slot_category")
      .neq("status", "rejected")
      .not("image_url", "is", null);
    const { data: slots } = await supabaseAdmin
      .from("look_candidate_slots")
      .select("id, slot, sourced_product_id, position")
      .eq("candidate_id", cand.id)
      .order("position");

    const eligible = (pool ?? []).filter((p) => p.image_url && p.brand && p.product_name);
    const usedIds = new Set<string>(
      (slots ?? []).map((s) => s.sourced_product_id).filter((x): x is string => !!x),
    );

    // Swap each slot for a different pick (rotate the pool by feedback hash).
    const seed = data.feedback.join("|").length * 7919 + Date.now();
    const newPicks: Array<{ slot: LookSlot; sourced_product_id: string | null }> = [];
    for (const s of slots ?? []) {
      const slot = s.slot as LookSlot;
      const matches = eligible.filter((p) => matchesSlot(slot, p) && !usedIds.has(p.id));
      const ranked = shuffle(matches, seed + slot.length);
      const preferred = ranked.find((p) =>
        (dna.targetBrands ?? []).some((b) => p.brand?.toLowerCase().includes(b.toLowerCase())),
      );
      const pick = preferred ?? ranked[0] ?? null;
      if (pick) usedIds.add(pick.id);
      newPicks.push({ slot, sourced_product_id: pick?.id ?? null });
      await supabaseAdmin
        .from("look_candidate_slots")
        .update({ sourced_product_id: pick?.id ?? null })
        .eq("id", s.id);
    }

    const history = Array.isArray(cand.feedback_history) ? (cand.feedback_history as Array<{ at: string; feedback: string[]; note?: string }>) : [];
    history.push({ at: new Date().toISOString(), feedback: data.feedback, note: data.note });

    await supabaseAdmin
      .from("look_candidates")
      .update({ feedback_history: history })
      .eq("id", cand.id);

    await scoreCandidateInternal(cand.id, dna, newPicks, eligible);

    await supabaseAdmin
      .from("look_candidates")
      .update({ status: "ready_for_review", failure_reason: null })
      .eq("id", cand.id);

    return { ok: true as const };
  });

/** Approve a look. Auto-promotes its sourced products into the vault. */
export const approveLook = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, candidate_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateEditorial, pickReplacements, lookSlug } = await import("./look-editorial.server");
    const { promoteSourcedToProduct } = await import("./product-identity.server");

    const { data: cand, error: cErr } = await supabaseAdmin
      .from("look_candidates")
      .select("id, dna_id, variant, slug")
      .eq("id", data.candidate_id)
      .single();
    if (cErr || !cand) throw new Error("Candidate not found");
    const dna = LOOK_DNA[cand.dna_id];

    const { data: slots } = await supabaseAdmin
      .from("look_candidate_slots")
      .select("id, slot, sourced_product_id")
      .eq("candidate_id", cand.id);

    const sourcedIds = (slots ?? []).map((s) => s.sourced_product_id).filter((x): x is string => !!x);
    const insertedVault: Array<{ id: string; brand: string; product_name: string; slot: string | null; sourcedId: string }> = [];
    if (sourcedIds.length) {
      const { data: prods } = await supabaseAdmin
        .from("sourced_products")
        .select("*")
        .in("id", sourcedIds);
      for (const sp of prods ?? []) {
        const slot = (slots ?? []).find((s) => s.sourced_product_id === sp.id)?.slot ?? null;

        // PRODUCT IDENTITY: upsert into products + product_sources and write
        // product_id onto the slot so approved looks point at the identity,
        // not the retailer URL. Survives future affiliate onboarding.
        try {
          const promoted = await promoteSourcedToProduct(
            {
              id: sp.id,
              brand: sp.brand,
              brand_id: sp.brand_id ?? null,
              product_name: sp.product_name,
              retailer_domain: sp.retailer_domain,
              source_url: sp.source_url,
              affiliate_url: sp.affiliate_url,
              image_url: sp.image_url,
              price: sp.price != null ? Number(sp.price) : null,
              currency: sp.currency,
              slot_category: sp.slot_category,
              category: sp.category ?? null,
              subcategory: sp.subcategory ?? null,
              silhouette: sp.silhouette ?? null,
              fabric: sp.fabric ?? null,
              texture: sp.texture ?? null,
              print_family: sp.print_family ?? null,
              color_family: sp.color_family ?? null,
              destination_tags: sp.destination_tags ?? [],
              activity_tags: sp.activity_tags ?? [],
            },
            dna ?? null,
          );
          if (promoted?.product_id) {
            await supabaseAdmin
              .from("look_candidate_slots")
              .update({ product_id: promoted.product_id })
              .eq("candidate_id", cand.id)
              .eq("sourced_product_id", sp.id);
          }
        } catch (e) {
          console.error("product identity promotion failed", e);
        }

        // Skip if already in vault from this candidate.
        const { data: existing } = await supabaseAdmin
          .from("vault_products")
          .select("id")
          .eq("source_sourced_product_id", sp.id)
          .maybeSingle();
        if (existing?.id) {
          insertedVault.push({
            id: existing.id,
            brand: sp.brand ?? "Unknown",
            product_name: sp.product_name ?? "Untitled",
            slot,
            sourcedId: sp.id,
          });
          continue;
        }
        const payload = {
          product_name: sp.product_name ?? "Untitled",
          brand: sp.brand ?? "Unknown",
          retailer: sp.retailer_domain ?? null,
          affiliate_url: sp.affiliate_url ?? sp.source_url,
          brand_url: sp.brand ? `https://www.google.com/search?q=${encodeURIComponent(sp.brand + " " + (sp.product_name ?? ""))}` : null,
          category_fallback_url: sp.retailer_domain
            ? `https://www.google.com/search?q=${encodeURIComponent(`${sp.slot_category ?? slot ?? ""} ${dna?.destination ?? ""}`)}`
            : null,
          product_type: sp.slot_category ?? slot ?? null,
          image_url: sp.image_url ?? null,
          price: sp.price != null ? Number(sp.price) : null,
          currency: sp.currency ?? "USD",
          category: sp.slot_category ?? slot ?? "uncategorized",
          destination_tags: dna ? [dna.destination] : [],
          activity_tags: dna ? [dna.activity] : [],
          color_tags: dna ? dna.palette : [],
          print_tags: [],
          material_tags: [],
          silhouette_tags: [],
          approval_status: "approved" as const,
          approved_at: new Date().toISOString(),
          source_sourced_product_id: sp.id,
          source_look_candidate_id: cand.id,
          source_slot: slot,
        };
        const { data: ins } = await supabaseAdmin.from("vault_products").insert(payload).select("id").single();
        if (ins?.id) {
          insertedVault.push({
            id: ins.id,
            brand: sp.brand ?? "Unknown",
            product_name: sp.product_name ?? "Untitled",
            slot,
            sourcedId: sp.id,
          });
        }
        await supabaseAdmin
          .from("sourced_products")
          .update({ status: "promoted", promoted_at: new Date().toISOString() })
          .eq("id", sp.id);
      }
    }

    // Slug + status
    const slug = cand.slug ?? lookSlug(cand.dna_id, cand.variant);
    await supabaseAdmin
      .from("look_candidates")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        slug,
      })
      .eq("id", cand.id);

    // Best-effort: editorial sections + 3 AI replacements per vault product.
    if (dna) {
      try {
        // Editorial
        const slotsForCopy = insertedVault.map((v) => ({
          slot: v.slot ?? "",
          brand: v.brand,
          product_name: v.product_name,
          retailer: null,
        }));
        const editorial = await generateEditorial(dna, slotsForCopy);
        await supabaseAdmin
          .from("look_candidates")
          .update({
            why_it_works: editorial.why_it_works,
            best_for: editorial.best_for,
            resort_edit_tip: editorial.resort_edit_tip,
            pack_instead_of: editorial.pack_instead_of,
            whats_in_her_bag: editorial.whats_in_her_bag,
            editorial_generated_at: new Date().toISOString(),
          })
          .eq("id", cand.id);
      } catch (e) {
        await supabaseAdmin
          .from("look_candidates")
          .update({ notes: `Editorial gen failed: ${String((e as Error).message ?? e).slice(0, 200)}` })
          .eq("id", cand.id);
      }

      // Replacements per product — pool = same slot_category, not this product.
      try {
        const { data: poolAll } = await supabaseAdmin
          .from("sourced_products")
          .select("id, brand, product_name, retailer_domain, price, image_url, source_url, affiliate_url, slot_category")
          .neq("status", "rejected")
          .not("image_url", "is", null);
        for (const v of insertedVault) {
          const pool = (poolAll ?? []).filter(
            (p) =>
              p.id !== v.sourcedId &&
              p.slot_category &&
              v.slot &&
              p.slot_category.toLowerCase().includes(v.slot.split("_")[0].toLowerCase()),
          );
          const picks = await pickReplacements(dna, { brand: v.brand, product_name: v.product_name, slot: v.slot ?? "item" }, pool);
          await supabaseAdmin
            .from("vault_products")
            .update({ ai_replacements: picks, replacements_generated_at: new Date().toISOString() })
            .eq("id", v.id);
        }
      } catch (e) {
        // swallow — replacements are nice-to-have
        console.error("replacement gen failed", e);
      }
    }

    return { ok: true as const, promoted: sourcedIds.length, slug };
  });

export const rejectLook = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, candidate_id: z.string().uuid(), reason: z.string().max(2000).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("look_candidates")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        notes: data.reason ?? null,
      })
      .eq("id", data.candidate_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, candidate_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("look_candidates")
      .delete()
      .eq("id", data.candidate_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// Re-export slot list for the UI.
export { LOOK_SLOTS };
export type { LookSlot, LookScoring };
export type LookCandidateRow = CandidateRow;
export type LookSlotRow = SlotRow & { product?: SourcedProductLite | null };