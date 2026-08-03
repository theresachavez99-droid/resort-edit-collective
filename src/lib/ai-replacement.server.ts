/**
 * Replacement orchestration (server-only) — the workflow layer around the
 * OpenAI styling engine.
 *
 * This app does NOT style. It:
 *  1. assembles the complete editorial context of the look,
 *  2. calls the OpenAI stylist (`openai-stylist.server.ts`),
 *  3. independently verifies every proposed PDP (`pdp-verification.server.ts`),
 *  4. stores candidates with provider / model / prompt-version / timestamp so
 *     repeated page loads never regenerate them,
 *  5. leaves approval, promotion and publishing to the owner.
 *
 * Nothing here publishes or promotes a product.
 */
import { enumerateRegistryLooks, findRegistryLook } from "./look-registry";
import { isExcludedProduct } from "./merchandising-exclusions";
import { budgetTierForPrice } from "./resort-edit-styling-rules";
import { loadStylingFeedback, loadStylingPolicy } from "./resort-edit-styling-policy.server";
import { verifyPdp, type PdpVerification } from "./pdp-verification.server";
import {
  OpenAiStylistNotConnectedError,
  generateResortEditFullRestyle,
  generateResortEditReplacementCandidates,
  isOpenAiStylistConfigured,
  openAiStylistModel,
  type OutfitPiece,
  type StylistCandidate,
  type StylistInput,
  type StylistResult,
  type StylistRunMeta,
} from "./openai-stylist.server";

export { isOpenAiStylistConfigured, OpenAiStylistNotConnectedError, openAiStylistModel };

type SlotRow = {
  id: string;
  destination: string;
  moment: string;
  look_key: string;
  look_kind: string | null;
  look_title: string | null;
  slot: string;
  slot_label: string | null;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string | null;
  price: string | null;
  status: string;
  is_primary: boolean;
  style_dna: Record<string, unknown> | null;
};

const JEWELRY = ["earring", "necklace", "bracelet", "cuff", "anklet", "pendant"];
const METALS = ["gold", "yellow gold", "white gold", "rose gold", "silver", "platinum"];

async function loadLookContext(
  row: SlotRow,
  opts: { regenerationFeedback?: string | null } = {},
): Promise<StylistInput> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: siblings } = await supabaseAdmin
    .from("shop_slot_products")
    .select(
      "id,slot,slot_label,brand,product_name,retailer,url,price,status,is_primary,style_dna,slot_order",
    )
    .eq("look_key", row.look_key)
    .eq("is_primary", true)
    .order("slot_order");

  const outfit: OutfitPiece[] = (siblings ?? []).map((s) => {
    const dna = (s.style_dna ?? {}) as Record<string, unknown>;
    return {
      slot: s.slot,
      slotLabel: s.slot_label,
      brand: s.brand,
      productName: s.product_name,
      retailer: s.retailer,
      price: s.price,
      url: s.url,
      status: s.status,
      color: typeof dna["color"] === "string" ? dna["color"] : null,
    };
  });

  const registry = findRegistryLook(row.look_key);
  if (registry) {
    for (const s of registry.slots) {
      if (!outfit.some((o) => o.slot.toLowerCase() === s.slot.toLowerCase())) {
        outfit.push({
          slot: s.slot,
          slotLabel: s.slotLabel,
          brand: s.brand,
          productName: s.productName,
          retailer: s.retailer,
          price: s.price,
          url: s.url,
        });
      }
    }
  }

  const { data: momentRow } = await supabaseAdmin
    .from("destination_moments")
    .select("narrative,styling_cues")
    .eq("destination_slug", row.destination)
    .eq("moment_slug", row.moment)
    .maybeSingle();

  const cues = Array.isArray(momentRow?.styling_cues)
    ? (momentRow?.styling_cues as unknown[]).map((c) => String(c))
    : typeof momentRow?.styling_cues === "object" && momentRow?.styling_cues
      ? Object.values(momentRow.styling_cues as Record<string, unknown>).map((c) => String(c))
      : [];

  const colors = new Set<string>();
  for (const p of outfit) if (p.color) colors.add(p.color);
  const jewelryBrands = new Set<string>();
  const metals = new Set<string>();
  for (const p of outfit) {
    if (JEWELRY.some((j) => p.slot.toLowerCase().includes(j))) {
      jewelryBrands.add(p.brand);
      const hay = `${p.productName} ${p.color ?? ""}`.toLowerCase();
      for (const m of METALS) if (hay.includes(m)) metals.add(m);
    }
  }

  // Nearby looks in the same moment — avoid accidental accessory/designer repeats.
  const nearbyLooks = enumerateRegistryLooks({ destination: row.destination, moment: row.moment })
    .filter((l) => l.lookKey !== row.look_key)
    .slice(0, 4)
    .map((l) => ({
      lookTitle: l.lookTitle,
      pieces: l.slots.map((s) => `${s.slot}: ${s.brand} ${s.productName}`),
    }));

  const [policy, adminFeedback] = await Promise.all([
    loadStylingPolicy(),
    loadStylingFeedback({ lookKey: row.look_key }),
  ]);

  const failedProduct: OutfitPiece = {
    slot: row.slot,
    slotLabel: row.slot_label,
    brand: row.brand,
    productName: row.product_name,
    retailer: row.retailer,
    price: row.price,
    url: row.url,
    status: row.status,
    color:
      typeof (row.style_dna as Record<string, unknown> | null)?.["color"] === "string"
        ? ((row.style_dna as Record<string, unknown>)["color"] as string)
        : null,
  };

  return {
    destination: row.destination,
    moment: row.moment,
    momentNarrative: momentRow?.narrative ?? null,
    stylingCues: cues,
    lookKey: row.look_key,
    lookKind: row.look_kind === "editorial" ? "supporting" : "hero",
    lookTitle: row.look_title ?? registry?.lookTitle ?? row.look_key,
    editorialCopy: registry?.editorialCopy ?? null,
    editorialImageUrl: null,
    imageAlt: registry?.imageAlt ?? null,
    outfit,
    failedSlot: row.slot,
    failedProduct,
    failedStyleDna: (row.style_dna ?? {}) as Record<string, unknown>,
    colorsInLook: [...colors],
    colorStory: [...colors].join(", ") || null,
    jewelryBrandsInLook: [...jewelryBrands],
    jewelryMetalFamily: [...metals].join(" / ") || null,
    nearbyLooks,
    priceTier: budgetTierForPrice(row.price),
    policy,
    adminFeedback,
    regenerationFeedback: opts.regenerationFeedback ?? null,
  };
}

export type ReviewedCandidate = StylistCandidate & { verification: PdpVerification };

/** Independent verification — model-supplied URLs are never trusted. */
async function reviewCandidate(
  c: StylistCandidate,
  slot: string,
): Promise<ReviewedCandidate | null> {
  if (isExcludedProduct({ slot, category: c.category ?? slot })) return null;
  const verification = await verifyPdp({
    url: c.exact_pdp_url,
    brand: c.brand,
    productName: c.product_name,
    color: c.color,
  });
  return { ...c, verification };
}

async function loadSlotRow(slotProductId: string): Promise<SlotRow> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("shop_slot_products")
    .select(
      "id,destination,moment,look_key,look_kind,look_title,slot,slot_label,brand,product_name,retailer,url,price,status,is_primary,style_dna",
    )
    .eq("id", slotProductId)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Slot product not found");
  return data as SlotRow;
}

async function storeCandidates(args: {
  row: SlotRow;
  slot: string;
  reviewed: ReviewedCandidate[];
  meta: StylistRunMeta;
  result: StylistResult;
  batch: string;
  source: string;
  feedback?: string | null;
}): Promise<number> {
  if (!args.reviewed.length) return 0;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows = args.reviewed.map((c) => ({
    slot_product_id: args.row.id,
    destination: args.row.destination,
    moment: args.row.moment,
    look_key: args.row.look_key,
    slot: args.slot,
    brand: c.brand,
    product_name: c.product_name,
    retailer: c.retailer || null,
    pdp_url: c.exact_pdp_url,
    price: c.verification.priceFound ?? c.price,
    color: c.color,
    category: c.category,
    silhouette: c.silhouette,
    material: c.material,
    matching_score: c.matching_score,
    rationale: c.stylist_rationale,
    look_impact: c.full_look_impact,
    retailer_priority_rank: c.retailer_priority_rank,
    possible_duplicate_warning: c.possible_duplicate_warning,
    style_dna: {
      category: c.category,
      color: c.color,
      silhouette: c.silhouette,
      material: c.material,
    } as Record<string, never>,
    verification_status: c.verification.status,
    verification_detail: c.verification as unknown as Record<string, never>,
    availability_verdict: c.verification.verdict,
    availability_http_status: c.verification.httpStatus,
    verified_at: c.verification.verifiedAt,
    // A candidate that failed verification is rejected automatically and can
    // never be presented as verified or publishable.
    approval_status: c.verification.status === "verified" ? "pending" : "rejected",
    failed_slot_summary: args.result.failed_slot_summary || null,
    nonnegotiable_constraints: args.result.nonnegotiable_style_constraints,
    feedback_note: args.feedback ?? null,
    provider: args.meta.provider,
    model: args.meta.model,
    prompt_version: args.meta.promptVersion,
    generated_at: args.meta.generatedAt,
    generation_batch: args.batch,
    source: args.source,
  }));
  const { error } = await supabaseAdmin.from("product_replacement_candidates").insert(rows);
  if (error) throw new Error(error.message);
  return rows.length;
}

/**
 * Ask ChatGPT to style ONE failed slot inside the full existing outfit, verify
 * each proposal, and store the results for owner review.
 */
export async function generateCandidatesForSlotProduct(
  slotProductId: string,
  opts: { regenerate?: boolean; feedback?: string | null } = {},
): Promise<{
  candidates: ReviewedCandidate[];
  batch: string;
  meta: StylistRunMeta;
  result: StylistResult;
}> {
  if (!isOpenAiStylistConfigured()) throw new OpenAiStylistNotConnectedError();
  const row = await loadSlotRow(slotProductId);
  const ctx = await loadLookContext(row, { regenerationFeedback: opts.feedback ?? null });
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  if (opts.regenerate) {
    await supabaseAdmin
      .from("product_replacement_candidates")
      .delete()
      .eq("slot_product_id", row.id)
      .eq("approval_status", "pending");
  }
  if (opts.feedback?.trim()) {
    await supabaseAdmin.from("product_styling_feedback").insert({
      slot_product_id: row.id,
      look_key: row.look_key,
      slot: row.slot,
      destination: row.destination,
      moment: row.moment,
      feedback: opts.feedback.trim(),
    });
  }

  const { meta, result } = await generateResortEditReplacementCandidates(ctx);
  const reviewed: ReviewedCandidate[] = [];
  for (const c of result.candidates) {
    const r = await reviewCandidate(c, row.slot);
    if (r) reviewed.push(r);
  }
  const batch = crypto.randomUUID();
  await storeCandidates({
    row,
    slot: row.slot,
    reviewed,
    meta,
    result,
    batch,
    source: "openai_stylist",
    feedback: opts.feedback ?? null,
  });
  return { candidates: reviewed, batch, meta, result };
}

/**
 * Explicit owner action: ask ChatGPT to restyle a complete look. The editorial
 * image, title and copy are untouched — only commerce items are re-proposed,
 * one candidate per slot, for review.
 */
export async function restyleCompleteLook(
  lookKey: string,
  opts: { feedback?: string | null } = {},
): Promise<{ batch: string; stored: number; skipped: string[]; reason: string | null }> {
  if (!isOpenAiStylistConfigured()) throw new OpenAiStylistNotConnectedError();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: primaries, error } = await supabaseAdmin
    .from("shop_slot_products")
    .select(
      "id,destination,moment,look_key,look_kind,look_title,slot,slot_label,brand,product_name,retailer,url,price,status,is_primary,style_dna",
    )
    .eq("look_key", lookKey)
    .eq("is_primary", true)
    .order("slot_order");
  if (error) throw new Error(error.message);
  const rows = (primaries ?? []) as SlotRow[];
  if (!rows.length) throw new Error("No products registered for this look yet — import it first.");

  const anchor = rows[0]!;
  const ctx = await loadLookContext(anchor, { regenerationFeedback: opts.feedback ?? null });
  const { meta, result } = await generateResortEditFullRestyle(ctx);
  const batch = crypto.randomUUID();
  const skipped: string[] = [];
  let stored = 0;

  for (const c of result.candidates) {
    const slot = (c.slot ?? "").trim().toLowerCase();
    const target = rows.find((r) => r.slot.toLowerCase() === slot);
    if (!target) {
      skipped.push(c.slot ?? c.product_name);
      continue;
    }
    const reviewed = await reviewCandidate(c, target.slot);
    if (!reviewed) {
      skipped.push(`${slot} (excluded by Resort Edit rules)`);
      continue;
    }
    stored += await storeCandidates({
      row: target,
      slot: target.slot,
      reviewed: [reviewed],
      meta,
      result,
      batch,
      source: "openai_restyle",
      feedback: opts.feedback ?? null,
    });
  }
  return { batch, stored, skipped, reason: result.insufficient_candidates_reason };
}
