/**
 * Editorial Memory — server-only helpers.
 *
 * Phase 3 (Editorial Memory & Collection Diversity).
 *
 * The memory layer answers: "What has Resort Edit already shown?"
 *  - Has this exact product been used? How many times?
 *  - Has this brand dominated the destination?
 *  - Have we already shown too many raffia bags / tortoise sunglasses /
 *    Aquazzura sandals at this destination?
 *
 * It does NOT hard-block. It applies *soft* diversity penalties so the
 * collection feels intentionally curated rather than repetitive. Founder
 * Signature Pieces are exempt from penalties.
 *
 * Only imported from `.functions.ts` handlers and engine handlers; never
 * imported at module scope of a client-reachable file.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type MemoryEntry = {
  product_url: string;
  brand: string;
  retailer: string | null;
  product_name: string | null;
  image_url: string | null;
  category: string | null;
  color_family: string | null;
  material: string | null;
  silhouette: string | null;
  style_family: string[];
  destinations: string[];
  moments: string[];
  usage_count: number;
  signature_piece: boolean;
  signature_reason: string | null;
  destination_usage_count: number; // computed
};

export type MemorySnapshot = {
  byUrl: Map<string, MemoryEntry>;
  brandUseInDestination: Map<string, number>; // brand -> usages at this destination
  categoryUseInDestination: Map<string, number>;
  materialUseInDestination: Map<string, number>;
  totalDestinationUses: number;
  generatedAt: string;
};

/**
 * Load a memory snapshot scoped to a destination. The snapshot includes:
 *  - every product previously used (for exact-reuse lookup) — global
 *  - per-brand / per-category / per-material aggregates *at this destination*
 */
export async function loadMemorySnapshot(
  supabase: SupabaseClient,
  destination: string,
): Promise<MemorySnapshot> {
  // Pull all products. The library is admin-only and bounded by the number
  // of published Resort Edit looks, so a full scan is fine.
  const { data: products } = await supabase
    .from("editorial_memory_products")
    .select(
      "product_url,brand,retailer,product_name,image_url,category,color_family,material,silhouette,style_family,destinations,moments,usage_count,signature_piece,signature_reason",
    )
    .limit(5000);

  const byUrl = new Map<string, MemoryEntry>();
  for (const row of (products ?? []) as Array<Record<string, unknown>>) {
    const url = String(row.product_url ?? "");
    if (!url) continue;
    const destinations = (row.destinations as string[] | null) ?? [];
    byUrl.set(url, {
      product_url: url,
      brand: String(row.brand ?? ""),
      retailer: (row.retailer as string | null) ?? null,
      product_name: (row.product_name as string | null) ?? null,
      image_url: (row.image_url as string | null) ?? null,
      category: (row.category as string | null) ?? null,
      color_family: (row.color_family as string | null) ?? null,
      material: (row.material as string | null) ?? null,
      silhouette: (row.silhouette as string | null) ?? null,
      style_family: ((row.style_family as string[] | null) ?? []),
      destinations,
      moments: ((row.moments as string[] | null) ?? []),
      usage_count: Number(row.usage_count ?? 0),
      signature_piece: Boolean(row.signature_piece ?? false),
      signature_reason: (row.signature_reason as string | null) ?? null,
      destination_usage_count: 0, // filled below
    });
  }

  // Per-destination aggregates derived from usage rows.
  const { data: usages } = await supabase
    .from("editorial_memory_usages")
    .select("product_url, destination")
    .eq("destination", destination)
    .limit(20000);

  const brandUse = new Map<string, number>();
  const categoryUse = new Map<string, number>();
  const materialUse = new Map<string, number>();
  let total = 0;
  for (const u of (usages ?? []) as Array<{ product_url: string }>) {
    total += 1;
    const entry = byUrl.get(u.product_url);
    if (!entry) continue;
    entry.destination_usage_count += 1;
    brandUse.set(entry.brand, (brandUse.get(entry.brand) ?? 0) + 1);
    if (entry.category) {
      categoryUse.set(entry.category, (categoryUse.get(entry.category) ?? 0) + 1);
    }
    if (entry.material) {
      materialUse.set(entry.material, (materialUse.get(entry.material) ?? 0) + 1);
    }
  }

  return {
    byUrl,
    brandUseInDestination: brandUse,
    categoryUseInDestination: categoryUse,
    materialUseInDestination: materialUse,
    totalDestinationUses: total,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Soft reuse penalty curve. First use = 0; penalty grows with each repeat.
 * Tunable; numbers chosen to feel like "you can repeat a sandal once, the
 * fourth time it really should be a Signature."
 */
export function reusePenalty(usageCount: number): number {
  if (usageCount <= 0) return 0;
  if (usageCount === 1) return 1.5; // 2nd use
  if (usageCount === 2) return 3.5; // 3rd use
  if (usageCount === 3) return 6.0; // 4th use
  return 8.5; // 5th+
}

/** Brand concentration penalty: discourage one brand from dominating a destination. */
export function brandConcentrationPenalty(
  brandUses: number,
  totalUses: number,
): number {
  if (totalUses < 6) return 0; // not enough signal yet
  const share = brandUses / totalUses;
  if (share < 0.25) return 0;
  if (share < 0.4) return 1.5;
  if (share < 0.55) return 3.0;
  return 5.0;
}

/** Material/category saturation (raffia bags, tortoise sunglasses, etc.). */
export function saturationPenalty(useCount: number): number {
  if (useCount < 2) return 0;
  if (useCount < 4) return 1.0;
  if (useCount < 6) return 2.0;
  return 3.5;
}

export type DiversityEvaluation = {
  diversityScore: number; // 0..100; lower = more saturated
  penaltyTotal: number; // sum applied to editorialScore
  isSignature: boolean;
  exactReuseCount: number; // how many times this URL appeared before
  destinationReuseCount: number;
  brandUsesInDestination: number;
  brandShareInDestination: number;
  reasons: string[]; // human-readable diagnostics
};

/**
 * Evaluate a single candidate against the snapshot. Mutation-free —
 * returns a verdict the engine can apply (or surface as a diagnostic).
 */
export function evaluateCandidateDiversity(
  args: {
    url: string;
    brand: string;
    category?: string | null;
    material?: string | null;
  },
  snapshot: MemorySnapshot,
): DiversityEvaluation {
  const entry = args.url ? snapshot.byUrl.get(args.url) : undefined;
  const isSignature = entry?.signature_piece ?? false;
  const exactReuse = entry?.usage_count ?? 0;
  const destReuse = entry?.destination_usage_count ?? 0;

  const brandUses = snapshot.brandUseInDestination.get(args.brand) ?? 0;
  const total = snapshot.totalDestinationUses;
  const brandShare = total > 0 ? brandUses / total : 0;

  const catUses = args.category
    ? snapshot.categoryUseInDestination.get(args.category) ?? 0
    : 0;
  const matUses = args.material
    ? snapshot.materialUseInDestination.get(args.material) ?? 0
    : 0;

  const reasons: string[] = [];
  let penalty = 0;

  if (isSignature) {
    reasons.push(
      `Signature Piece — exempt from diversity penalties${
        entry?.signature_reason ? ` (${entry.signature_reason})` : ""
      }.`,
    );
  } else {
    if (exactReuse > 0) {
      const p = reusePenalty(exactReuse);
      penalty += p;
      reasons.push(
        `Used ${exactReuse}× before (penalty ${p.toFixed(1)}). Encourage a fresh pick.`,
      );
    }
    const brandP = brandConcentrationPenalty(brandUses, total);
    if (brandP > 0) {
      penalty += brandP;
      reasons.push(
        `${args.brand} already covers ${(brandShare * 100).toFixed(
          0,
        )}% of ${total} ${args.brand === args.brand ? "uses" : ""} at this destination (penalty ${brandP.toFixed(1)}).`,
      );
    }
    const catP = saturationPenalty(catUses);
    if (catP > 0 && args.category) {
      penalty += catP;
      reasons.push(
        `${args.category} already shown ${catUses}× (penalty ${catP.toFixed(1)}).`,
      );
    }
    const matP = saturationPenalty(matUses);
    if (matP > 0 && args.material) {
      penalty += matP;
      reasons.push(
        `${args.material} already shown ${matUses}× (penalty ${matP.toFixed(1)}).`,
      );
    }
  }

  // Diversity score: 100 = fresh; subtract penalty (capped 100).
  const diversityScore = Math.max(0, Math.round(100 - penalty * 8));

  return {
    diversityScore,
    penaltyTotal: Math.round(penalty * 100) / 100,
    isSignature,
    exactReuseCount: exactReuse,
    destinationReuseCount: destReuse,
    brandUsesInDestination: brandUses,
    brandShareInDestination: Math.round(brandShare * 1000) / 1000,
    reasons,
  };
}

/**
 * Persist a usage. Calls the SECURITY DEFINER RPC which upserts the
 * product row and inserts a usage row in one round-trip.
 */
export async function recordMemoryUsage(
  supabase: SupabaseClient,
  args: {
    productUrl: string;
    brand: string;
    retailer?: string | null;
    productName?: string | null;
    imageUrl?: string | null;
    category?: string | null;
    colorFamily?: string | null;
    material?: string | null;
    silhouette?: string | null;
    styleFamily?: string[];
    destination: string;
    moment: string;
    slot?: string | null;
    role?: string | null;
    founderLookId?: string | null;
  },
): Promise<{ ok: boolean; newCount?: number; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("record_editorial_memory_usage", {
    p_product_url: args.productUrl,
    p_brand: args.brand,
    p_retailer: args.retailer ?? null,
    p_product_name: args.productName ?? null,
    p_image_url: args.imageUrl ?? null,
    p_category: args.category ?? null,
    p_color_family: args.colorFamily ?? null,
    p_material: args.material ?? null,
    p_silhouette: args.silhouette ?? null,
    p_style_family: args.styleFamily ?? [],
    p_destination: args.destination,
    p_moment: args.moment,
    p_slot: args.slot ?? null,
    p_role: args.role ?? null,
    p_founder_look_id: args.founderLookId ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, newCount: typeof data === "number" ? data : undefined };
}
