/**
 * AI replacement orchestration (server-only).
 *
 * Assembles the full editorial context for a look, asks the AI stylist to
 * restyle the failed slot (or the whole look on explicit request), VERIFIES
 * every proposed PDP server-side, then stores the candidates for review with
 * provider / model / prompt-version / timestamp metadata so repeated page loads
 * never regenerate them.
 *
 * Nothing here publishes or promotes a product.
 */
import { findRegistryLook } from "./look-registry";
import { isExcludedProduct } from "./merchandising-exclusions";
import { isPublishableProductUrl } from "./shop-url-policy";
import { probeProductUrl } from "./product-health.server";
import {
  AiStylistNotConfiguredError,
  generateCompleteRestyle,
  generateSlotReplacements,
  isAiStylistConfigured,
  type OutfitPiece,
  type RawAiCandidate,
  type StylistLookContext,
} from "./ai-stylist.server";

export { isAiStylistConfigured, AiStylistNotConfiguredError };

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

async function loadLookContext(row: SlotRow): Promise<StylistLookContext> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: siblings } = await supabaseAdmin
    .from("shop_slot_products")
    .select(
      "id,slot,slot_label,brand,product_name,retailer,url,price,status,is_primary,style_dna,slot_order",
    )
    .eq("look_key", row.look_key)
    .eq("is_primary", true)
    .order("slot_order");

  const outfit: OutfitPiece[] = (siblings ?? []).map((s) => ({
    slot: s.slot,
    slotLabel: s.slot_label,
    brand: s.brand,
    productName: s.product_name,
    retailer: s.retailer,
    price: s.price,
    url: s.url,
    status: s.status,
  }));

  // Editorial context: registry (title, caption, image alt) + moment narrative.
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
  for (const s of siblings ?? []) {
    const dna = (s.style_dna ?? {}) as Record<string, unknown>;
    if (typeof dna["color"] === "string") colors.add(dna["color"]);
  }
  const jewelryBrands = new Set<string>();
  for (const p of outfit) {
    if (JEWELRY.some((j) => p.slot.toLowerCase().includes(j))) jewelryBrands.add(p.brand);
  }

  return {
    destination: row.destination,
    moment: row.moment,
    momentNarrative: momentRow?.narrative ?? null,
    stylingCues: cues,
    lookKey: row.look_key,
    lookKind: row.look_kind === "editorial" ? "editorial" : "hero",
    lookTitle: row.look_title ?? registry?.lookTitle ?? row.look_key,
    editorialCopy: registry?.editorialCopy ?? null,
    imageAlt: registry?.imageAlt ?? null,
    outfit,
    failedSlot: row.slot,
    failedProduct: {
      slot: row.slot,
      slotLabel: row.slot_label,
      brand: row.brand,
      productName: row.product_name,
      retailer: row.retailer,
      price: row.price,
      url: row.url,
      status: row.status,
    },
    failedStyleDna: (row.style_dna ?? {}) as Record<string, unknown>,
    colorsInLook: [...colors],
    jewelryBrandsInLook: [...jewelryBrands],
    brandRestrictions: ["No rings in any slot (permanent Resort Edit rule)"],
  };
}

export type VerifiedCandidate = {
  brand: string;
  productName: string;
  retailer: string | null;
  pdpUrl: string;
  price: string | null;
  color: string | null;
  matchingScore: number | null;
  rationale: string | null;
  lookImpact: string | null;
  styleDna: Record<string, unknown>;
  availabilityVerdict: string;
  availabilityHttpStatus: number | null;
  verifiedAt: string;
};

/** Server-side verification — AI-supplied URLs are never trusted. */
async function verifyCandidate(
  c: RawAiCandidate,
  slot: string,
): Promise<VerifiedCandidate | null> {
  if (isExcludedProduct({ slot, category: (c.styleDna?.["category"] as string) ?? slot })) {
    return null;
  }
  const now = new Date().toISOString();
  if (!isPublishableProductUrl(c.pdpUrl)) {
    return {
      brand: c.brand,
      productName: c.productName,
      retailer: c.retailer || null,
      pdpUrl: c.pdpUrl,
      price: c.price ?? null,
      color: c.color ?? null,
      matchingScore: c.matchingScore ?? null,
      rationale: c.rationale ?? null,
      lookImpact: c.lookImpact ?? null,
      styleDna: c.styleDna ?? {},
      availabilityVerdict: "rejected_not_exact_pdp",
      availabilityHttpStatus: null,
      verifiedAt: now,
    };
  }
  const probe = await probeProductUrl(c.pdpUrl);
  return {
    brand: c.brand,
    productName: c.productName,
    retailer: c.retailer || null,
    pdpUrl: c.pdpUrl,
    price: c.price ?? null,
    color: c.color ?? null,
    matchingScore: c.matchingScore ?? null,
    rationale: c.rationale ?? null,
    lookImpact: c.lookImpact ?? null,
    styleDna: c.styleDna ?? {},
    availabilityVerdict: probe.status === "active" ? "verified_live" : `unverified_${probe.status}`,
    availabilityHttpStatus: probe.httpStatus,
    verifiedAt: now,
  };
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

async function storeCandidates(
  row: SlotRow,
  slot: string,
  verified: VerifiedCandidate[],
  runMeta: { provider: string; model: string; promptVersion: string; generatedAt: string },
  batch: string,
  source: string,
): Promise<number> {
  if (!verified.length) return 0;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows = verified.map((v) => ({
    slot_product_id: row.id,
    destination: row.destination,
    moment: row.moment,
    look_key: row.look_key,
    slot,
    brand: v.brand,
    product_name: v.productName,
    retailer: v.retailer,
    pdp_url: v.pdpUrl,
    price: v.price,
    color: v.color,
    matching_score: v.matchingScore,
    rationale: v.rationale,
    look_impact: v.lookImpact,
    style_dna: v.styleDna,
    availability_verdict: v.availabilityVerdict,
    availability_http_status: v.availabilityHttpStatus,
    verified_at: v.verifiedAt,
    provider: runMeta.provider,
    model: runMeta.model,
    prompt_version: runMeta.promptVersion,
    generated_at: runMeta.generatedAt,
    generation_batch: batch,
    source,
  }));
  const { error } = await supabaseAdmin.from("product_replacement_candidates").insert(rows);
  if (error) throw new Error(error.message);
  return rows.length;
}

/**
 * Generate + verify + store 3 replacement candidates for one failed slot,
 * styled inside the full existing outfit. Existing pending candidates for the
 * slot are cleared first when `regenerate` is set.
 */
export async function generateCandidatesForSlotProduct(
  slotProductId: string,
  opts: { regenerate?: boolean } = {},
): Promise<{ candidates: VerifiedCandidate[]; batch: string; meta: unknown }> {
  if (!isAiStylistConfigured()) throw new AiStylistNotConfiguredError();
  const row = await loadSlotRow(slotProductId);
  const ctx = await loadLookContext(row);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  if (opts.regenerate) {
    await supabaseAdmin
      .from("product_replacement_candidates")
      .delete()
      .eq("slot_product_id", row.id)
      .eq("approval_status", "pending");
  }

  const { meta, candidates } = await generateSlotReplacements(ctx);
  const verified: VerifiedCandidate[] = [];
  for (const c of candidates) {
    const v = await verifyCandidate(c, row.slot);
    if (v) verified.push(v);
  }
  const batch = crypto.randomUUID();
  await storeCandidates(row, row.slot, verified, meta, batch, "ai_stylist");
  return { candidates: verified, batch, meta };
}

/**
 * Full restyle of a look (explicit admin action). Generates one candidate per
 * slot, attached to that slot's current primary product, and stores them for
 * review. The editorial image, title and copy are untouched.
 */
export async function restyleCompleteLook(
  lookKey: string,
): Promise<{ batch: string; stored: number; skipped: string[] }> {
  if (!isAiStylistConfigured()) throw new AiStylistNotConfiguredError();
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
  const ctx = await loadLookContext(anchor);
  const { meta, candidates } = await generateCompleteRestyle(ctx);
  const batch = crypto.randomUUID();
  const skipped: string[] = [];
  let stored = 0;

  for (const c of candidates) {
    const slot = (c.slot ?? "").trim().toLowerCase();
    const target = rows.find((r) => r.slot.toLowerCase() === slot);
    if (!target) {
      skipped.push(c.slot ?? c.productName);
      continue;
    }
    const v = await verifyCandidate(c, target.slot);
    if (!v) {
      skipped.push(`${slot} (excluded)`);
      continue;
    }
    stored += await storeCandidates(target, target.slot, [v], meta, batch, "ai_restyle");
  }
  return { batch, stored, skipped };
}