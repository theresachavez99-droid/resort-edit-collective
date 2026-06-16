import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolutionStatus =
  | "primary_active"
  | "switched_to_alternate"
  | "using_alternative"
  | "needs_review";

export type ResolvedSource = {
  id: string;
  product_id: string;
  retailer: string | null;
  source_url: string;
  affiliate_url: string | null;
  price: number | null;
  currency: string | null;
  availability: string;
  is_primary: boolean;
};

export type AlternativeProduct = {
  kind: "same_brand" | "same_dna";
  product_id: string;
  brand: string;
  product_name: string;
  category: string | null;
  image_url: string | null;
  url: string | null;
  retailer: string | null;
  price: number | null;
  currency: string | null;
};

export type SlotResolution = {
  product_id: string;
  status: ResolutionStatus;
  source: ResolvedSource | null; // active commerce link
  all_sources: ResolvedSource[]; // every known retailer for this product
  alternatives: AlternativeProduct[]; // "If this sells out" list
};

const AVAILABLE = (a: string) => a === "in_stock" || a === "low_stock" || a === "unknown";

/**
 * Resolve the best live commerce source for a product identity.
 * Order of preference:
 *   1. primary source if in stock (status: primary_active)
 *   2. any other in-stock source for the same product (switched_to_alternate)
 *   3. fall back to alternatives — same brand / same DNA (using_alternative)
 *   4. nothing usable → needs_review
 */
export async function resolveSlotSource(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, "public", any>,
  productId: string,
): Promise<SlotResolution> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = supabase;

  const { data: srcRows } = await sb
    .from("product_sources")
    .select("id, product_id, retailer, source_url, affiliate_url, price, currency, availability, is_primary")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("updated_at", { ascending: false });
  const sources: ResolvedSource[] = (srcRows ?? []).map((s: ResolvedSource) => ({
    ...s,
    price: s.price != null ? Number(s.price) : null,
  }));

  const primary = sources.find((s) => s.is_primary) ?? null;
  const liveSources = sources.filter((s) => AVAILABLE(s.availability));

  let status: ResolutionStatus;
  let active: ResolvedSource | null = null;

  if (primary && AVAILABLE(primary.availability)) {
    status = "primary_active";
    active = primary;
  } else if (liveSources.length > 0) {
    status = "switched_to_alternate";
    active = liveSources[0];
  } else {
    status = "using_alternative"; // tentative, may downgrade to needs_review
  }

  // Load alternatives (always — render hierarchy on the page).
  const { data: productRow } = await sb
    .from("products")
    .select("id, brand, brand_id, category, silhouette, color_family, destination_tags, activity_tags")
    .eq("id", productId)
    .maybeSingle();

  const alternatives: AlternativeProduct[] = [];
  if (productRow) {
    // Tier 2: same brand, similar category (different product identity)
    const { data: brandAlts } = await sb
      .from("products")
      .select("id, brand, product_name, category, image_url")
      .eq("brand", productRow.brand)
      .eq("category", productRow.category ?? "__none__")
      .neq("id", productId)
      .eq("approval_status", "approved")
      .limit(3);
    for (const a of (brandAlts ?? []) as Array<{ id: string; brand: string; product_name: string; category: string | null; image_url: string | null }>) {
      alternatives.push({
        kind: "same_brand",
        product_id: a.id,
        brand: a.brand,
        product_name: a.product_name,
        category: a.category,
        image_url: a.image_url,
        url: null,
        retailer: null,
        price: null,
        currency: null,
      });
    }

    // Tier 3: same DNA — same category + overlapping destination/silhouette
    if (alternatives.length < 3) {
      let q = sb
        .from("products")
        .select("id, brand, product_name, category, image_url, silhouette, destination_tags")
        .eq("category", productRow.category ?? "__none__")
        .neq("brand", productRow.brand)
        .eq("approval_status", "approved")
        .limit(6);
      if (Array.isArray(productRow.destination_tags) && productRow.destination_tags.length) {
        q = q.overlaps("destination_tags", productRow.destination_tags);
      }
      const { data: dnaAlts } = await q;
      for (const a of (dnaAlts ?? []) as Array<{ id: string; brand: string; product_name: string; category: string | null; image_url: string | null; silhouette: string | null }>) {
        if (alternatives.length >= 6) break;
        // Mild DNA filter: same silhouette wins; otherwise allowed if same destination.
        if (productRow.silhouette && a.silhouette && a.silhouette !== productRow.silhouette) continue;
        alternatives.push({
          kind: "same_dna",
          product_id: a.id,
          brand: a.brand,
          product_name: a.product_name,
          category: a.category,
          image_url: a.image_url,
          url: null,
          retailer: null,
          price: null,
          currency: null,
        });
      }
    }

    // Hydrate alternatives with their primary source (commerce link).
    const altIds = alternatives.map((a) => a.product_id);
    if (altIds.length) {
      const { data: altSrcs } = await sb
        .from("product_sources")
        .select("product_id, retailer, source_url, affiliate_url, price, currency, availability, is_primary")
        .in("product_id", altIds)
        .order("is_primary", { ascending: false });
      const byProduct = new Map<string, ResolvedSource>();
      for (const s of (altSrcs ?? []) as ResolvedSource[]) {
        if (!byProduct.has(s.product_id) && AVAILABLE(s.availability)) {
          byProduct.set(s.product_id, s);
        }
      }
      for (const a of alternatives) {
        const s = byProduct.get(a.product_id);
        if (s) {
          a.url = s.affiliate_url ?? s.source_url;
          a.retailer = s.retailer;
          a.price = s.price != null ? Number(s.price) : null;
          a.currency = s.currency ?? "USD";
        }
      }
    }
  }

  // Promote: if no live source AND no usable alternative with URL, flag for review.
  if (status === "using_alternative") {
    const usable = alternatives.find((a) => a.url);
    if (!usable) status = "needs_review";
  }

  return {
    product_id: productId,
    status,
    source: active,
    all_sources: sources,
    alternatives,
  };
}

/**
 * Persist the resolution decision back onto the slot row so admin views and
 * analytics can read inventory health without re-running the resolver.
 */
export async function persistSlotResolution(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, "public", any>,
  slotId: string,
  resolution: SlotResolution,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = supabase;
  await sb
    .from("look_candidate_slots")
    .update({
      resolved_source_id: resolution.source?.id ?? null,
      resolution_status: resolution.status,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", slotId);
}