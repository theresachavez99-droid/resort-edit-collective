import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LOOK_DNA } from "@/data/lookDNA";
import { LOOK_SLOT_LABELS, LOOK_SCORE_CATEGORIES, LOOK_SCORE_LABELS, composite, type LookScoring, type LookSlot } from "./lookScoring";
import type { ResolutionStatus, AlternativeProduct } from "./source-resolver.server";

export type PublishedLookProduct = {
  vault_id: string;
  slot: string;
  slot_label: string;
  brand: string;
  product_name: string;
  retailer: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  primary_url: string;
  brand_fallback_url: string | null;
  category_fallback_url: string | null;
  product_type: string | null;
  has_backup: boolean;
  resolution_status: ResolutionStatus | "legacy";
  alternatives: AlternativeProduct[];
  ai_replacements: Array<{
    brand: string;
    product_name: string;
    retailer: string | null;
    price: number | null;
    image_url: string | null;
    url: string;
  }>;
};

export type PublishedLook = {
  slug: string;
  destination: string;
  day: number | null;
  variant: string;
  dna_name: string;
  activity: string;
  mood: string;
  palette: string[];
  silhouette: string;
  muse_image_url: string | null;
  composite_score: number | null;
  scoring: Array<{ key: string; label: string; value: number | null }>;
  why_it_works: string | null;
  best_for: string[];
  resort_edit_tip: string | null;
  pack_instead_of: string | null;
  whats_in_her_bag: Array<{ item: string; note: string }>;
  products: PublishedLookProduct[];
  similar: Array<{
    slug: string;
    destination: string;
    activity: string;
    variant: string;
    muse_image_url: string | null;
    composite_score: number | null;
  }>;
};

/** Public — read a published Resort Edit look by slug. */
export const getPublishedLook = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true; look: PublishedLook } | { ok: false }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cand } = await supabaseAdmin
      .from("look_candidates")
      .select("*")
      .eq("slug", data.slug)
      .in("status", ["approved", "published"])
      .maybeSingle();
    if (!cand) return { ok: false };

    const dna = LOOK_DNA[cand.dna_id];
    const { data: slotRows } = await supabaseAdmin
      .from("look_candidate_slots")
      .select("id, slot, sourced_product_id, product_id, position")
      .eq("candidate_id", cand.id)
      .order("position");

    // PRIMARY READ PATH: slot.product_id -> products + primary product_sources.
    // FALLBACK: vault_products via source_sourced_product_id (legacy slots).
    const productIds = (slotRows ?? [])
      .map((s) => (s as { product_id?: string | null }).product_id)
      .filter((x): x is string => !!x);

    type ProductRow = {
      id: string;
      brand: string;
      product_name: string;
      category: string | null;
      image_url: string | null;
    };
    type SourceRow = {
      product_id: string;
      retailer: string | null;
      source_url: string;
      affiliate_url: string | null;
      price: number | null;
      currency: string | null;
      is_primary: boolean;
    };
    let productMap = new Map<string, ProductRow>();
    let sourceMap = new Map<string, SourceRow>(); // product_id -> primary source
    if (productIds.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb: any = supabaseAdmin;
      const { data: prods } = await sb
        .from("products")
        .select("id, brand, product_name, category, image_url")
        .in("id", productIds);
      productMap = new Map((prods ?? []).map((p: ProductRow) => [p.id, p]));
      const { data: srcs } = await sb
        .from("product_sources")
        .select("product_id, retailer, source_url, affiliate_url, price, currency, is_primary")
        .in("product_id", productIds)
        .order("is_primary", { ascending: false });
      for (const s of (srcs ?? []) as SourceRow[]) {
        if (!sourceMap.has(s.product_id)) sourceMap.set(s.product_id, s);
      }
    }

    // Legacy fallback: vault_products via source_sourced_product_id
    const sourcedIds = (slotRows ?? []).map((s) => s.sourced_product_id).filter((x): x is string => !!x);
    let vaultMap = new Map<string, Record<string, unknown>>();
    if (sourcedIds.length) {
      const { data: vps } = await supabaseAdmin
        .from("vault_products")
        .select("id, brand, product_name, retailer, price, currency, image_url, affiliate_url, brand_url, category_fallback_url, product_type, ai_replacements, source_sourced_product_id, source_slot")
        .in("source_sourced_product_id", sourcedIds);
      vaultMap = new Map((vps ?? []).map((v) => [v.source_sourced_product_id as string, v as Record<string, unknown>]));
    }

    const productsRaw: Array<PublishedLookProduct | null> = (slotRows ?? []).map((s) => {
      const pid = (s as { product_id?: string | null }).product_id ?? null;
      const product = pid ? productMap.get(pid) ?? null : null;
      const source = pid ? sourceMap.get(pid) ?? null : null;

      if (product && source) {
        // Carry across editorial extras (ai_replacements, fallback URLs) from
        // vault when present — these aren't yet on the Product Identity.
        const v = s.sourced_product_id ? vaultMap.get(s.sourced_product_id) : null;
        return {
          vault_id: pid as string,
          slot: s.slot,
          slot_label: LOOK_SLOT_LABELS[s.slot as LookSlot] ?? s.slot,
          brand: product.brand,
          product_name: product.product_name,
          retailer: source.retailer ?? null,
          price: source.price != null ? Number(source.price) : null,
          currency: source.currency ?? "USD",
          image_url: product.image_url,
          primary_url: source.affiliate_url ?? source.source_url,
          brand_fallback_url: v ? ((v.brand_url as string | null) ?? null) : null,
          category_fallback_url: v ? ((v.category_fallback_url as string | null) ?? null) : null,
          product_type: product.category,
          has_backup: !!(v && (v.brand_url || v.category_fallback_url)) || !!(v && Array.isArray(v.ai_replacements) && (v.ai_replacements as unknown[]).length > 0),
          ai_replacements: v && Array.isArray(v.ai_replacements)
            ? (v.ai_replacements as PublishedLookProduct["ai_replacements"])
            : [],
        };
      }

      // Legacy fallback (pre-migration slots without product_id)
      const v = s.sourced_product_id ? vaultMap.get(s.sourced_product_id) : null;
      if (!v) return null;
      return {
        vault_id: v.id as string,
        slot: s.slot,
        slot_label: LOOK_SLOT_LABELS[s.slot as LookSlot] ?? s.slot,
        brand: (v.brand as string) ?? "—",
        product_name: (v.product_name as string) ?? "—",
        retailer: (v.retailer as string | null) ?? null,
        price: v.price != null ? Number(v.price) : null,
        currency: (v.currency as string | null) ?? "USD",
        image_url: (v.image_url as string | null) ?? null,
        primary_url: (v.affiliate_url as string) ?? "#",
        brand_fallback_url: (v.brand_url as string | null) ?? null,
        category_fallback_url: (v.category_fallback_url as string | null) ?? null,
        product_type: (v.product_type as string | null) ?? null,
        has_backup: !!(v.brand_url || v.category_fallback_url) || (Array.isArray(v.ai_replacements) && (v.ai_replacements as unknown[]).length > 0),
        ai_replacements: Array.isArray(v.ai_replacements)
          ? (v.ai_replacements as PublishedLookProduct["ai_replacements"])
          : [],
      };
    });
    const products: PublishedLookProduct[] = productsRaw.filter((x): x is PublishedLookProduct => x !== null);

    // Similar looks — same destination + activity, approved, different slug.
    const { data: similarRows } = await supabaseAdmin
      .from("look_candidates")
      .select("slug, destination, variant, muse_image_url, composite_score, dna_id")
      .in("status", ["approved", "published"])
      .eq("destination", cand.destination)
      .neq("id", cand.id)
      .not("slug", "is", null)
      .order("composite_score", { ascending: false, nullsFirst: false })
      .limit(4);

    const similar = (similarRows ?? []).map((r) => ({
      slug: r.slug as string,
      destination: r.destination,
      activity: LOOK_DNA[r.dna_id]?.activity ?? "",
      variant: r.variant,
      muse_image_url: r.muse_image_url,
      composite_score: r.composite_score != null ? Number(r.composite_score) : null,
    }));

    const scoring = cand.scoring as LookScoring;
    const scoringList = LOOK_SCORE_CATEGORIES.map((cat) => ({
      key: cat,
      label: LOOK_SCORE_LABELS[cat],
      value: typeof scoring?.[cat] === "number" ? (scoring[cat] as number) : null,
    }));

    return {
      ok: true,
      look: {
        slug: cand.slug as string,
        destination: cand.destination,
        day: cand.day,
        variant: cand.variant,
        dna_name: dna?.name ?? cand.dna_id,
        activity: dna?.activity ?? "",
        mood: dna?.mood ?? "",
        palette: dna?.palette ?? [],
        silhouette: dna?.silhouette ?? "",
        muse_image_url: cand.muse_image_url,
        composite_score: cand.composite_score != null ? Number(cand.composite_score) : composite(scoring ?? {}),
        scoring: scoringList,
        why_it_works: cand.why_it_works,
        best_for: Array.isArray(cand.best_for) ? cand.best_for : [],
        resort_edit_tip: cand.resort_edit_tip,
        pack_instead_of: cand.pack_instead_of,
        whats_in_her_bag: Array.isArray(cand.whats_in_her_bag)
          ? (cand.whats_in_her_bag as Array<{ item: string; note: string }>)
          : [],
        products,
        similar,
      },
    };
  });