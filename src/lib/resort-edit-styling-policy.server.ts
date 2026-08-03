/**
 * Editable Resort Edit styling policy (server-only).
 *
 * The policy lives in the database so the owner can edit it, and it is injected
 * into EVERY OpenAI styling request. Static defaults in
 * `resort-edit-styling-rules.ts` are the fallback when no row exists yet.
 */
import {
  APPROVED_RETAILER_PRIORITY,
  BRAND_DIRECT_POLICY,
  RESORT_EDIT_STYLING_RULES,
} from "./resort-edit-styling-rules";

export type ResortEditPolicy = {
  id: string | null;
  retailerPriority: string[];
  brandDirectPolicy: string;
  approvedBrands: string[];
  restrictedBrands: string[];
  noRings: boolean;
  singleJewelryFamily: boolean;
  destinationNotes: Record<string, string>;
  heroThresholdNote: string;
  extraRules: string[];
  notes: string | null;
  updatedAt: string | null;
};

export const FALLBACK_POLICY: ResortEditPolicy = {
  id: null,
  retailerPriority: [...APPROVED_RETAILER_PRIORITY],
  brandDirectPolicy: BRAND_DIRECT_POLICY,
  approvedBrands: [],
  restrictedBrands: [],
  noRings: true,
  singleJewelryFamily: true,
  destinationNotes: {},
  heroThresholdNote:
    "Hero garments must be Vogue-resort worthy. Supporting accessories may be quieter but never generic.",
  extraRules: [...RESORT_EDIT_STYLING_RULES],
  notes: null,
  updatedAt: null,
};

export async function loadStylingPolicy(): Promise<ResortEditPolicy> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("resort_edit_styling_policy")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return FALLBACK_POLICY;
  const notes = (data.destination_notes ?? {}) as Record<string, unknown>;
  return {
    id: data.id,
    retailerPriority: data.retailer_priority?.length
      ? data.retailer_priority
      : FALLBACK_POLICY.retailerPriority,
    brandDirectPolicy: data.brand_direct_policy ?? FALLBACK_POLICY.brandDirectPolicy,
    approvedBrands: data.approved_brands ?? [],
    restrictedBrands: data.restricted_brands ?? [],
    noRings: data.no_rings ?? true,
    singleJewelryFamily: data.single_jewelry_family ?? true,
    destinationNotes: Object.fromEntries(
      Object.entries(notes).map(([k, v]) => [k, String(v)]),
    ),
    heroThresholdNote: data.hero_threshold_note ?? FALLBACK_POLICY.heroThresholdNote,
    extraRules: data.extra_rules?.length ? data.extra_rules : FALLBACK_POLICY.extraRules,
    notes: data.notes ?? null,
    updatedAt: data.updated_at ?? null,
  };
}

/** Recent admin styling feedback for a look/slot — context for the next generation. */
export async function loadStylingFeedback(args: {
  lookKey: string;
  slot?: string;
  limit?: number;
}): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let q = supabaseAdmin
    .from("product_styling_feedback")
    .select("feedback,slot,created_at")
    .eq("look_key", args.lookKey)
    .order("created_at", { ascending: false })
    .limit(args.limit ?? 8);
  if (args.slot) q = q.eq("slot", args.slot);
  const { data } = await q;
  return (data ?? []).map((r) => `${r.slot ? `[${r.slot}] ` : ""}${r.feedback}`);
}
