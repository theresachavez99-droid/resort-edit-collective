/**
 * Editorial Memory — admin server functions.
 *
 * Surfaces the registry to the founder via `/admin/editorial-intelligence`,
 * exposes Signature Piece overrides, and analyzes duplicates before
 * publishing a Founder Look.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

const pw = z.string().min(1).max(200);

export type MemoryProductRow = {
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
  first_used_at: string | null;
  last_used_at: string | null;
};

/* ───────────────────────── List + filter ───────────────────────── */

export const listEditorialMemory = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        destination: z.string().max(80).nullable().optional(),
        moment: z.string().max(120).nullable().optional(),
        brand: z.string().max(120).nullable().optional(),
        category: z.string().max(80).nullable().optional(),
        retailer: z.string().max(120).nullable().optional(),
        color: z.string().max(40).nullable().optional(),
        material: z.string().max(80).nullable().optional(),
        styleFamily: z.string().max(80).nullable().optional(),
        signatureOnly: z.boolean().optional(),
        search: z.string().max(120).nullable().optional(),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("editorial_memory_products")
      .select("*")
      .order("usage_count", { ascending: false })
      .limit(data.limit);
    if (data.brand) q = q.ilike("brand", `%${data.brand}%`);
    if (data.category) q = q.eq("category", data.category);
    if (data.retailer) q = q.ilike("retailer", `%${data.retailer}%`);
    if (data.color) q = q.eq("color_family", data.color);
    if (data.material) q = q.eq("material", data.material);
    if (data.destination) q = q.contains("destinations", [data.destination]);
    if (data.moment) q = q.contains("moments", [data.moment]);
    if (data.styleFamily) q = q.contains("style_family", [data.styleFamily]);
    if (data.signatureOnly) q = q.eq("signature_piece", true);
    if (data.search) {
      const s = data.search.replace(/[%_]/g, "");
      q = q.or(`product_name.ilike.%${s}%,brand.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, products: (rows ?? []) as MemoryProductRow[] };
  });

/* ───────────────────────── Concentration summary ───────────────────────── */

export type ShareRow = { key: string; uses: number; share: number };

export const getEditorialMemorySummary = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        destination: z.string().max(80).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let uq = supabaseAdmin.from("editorial_memory_usages").select("product_url, destination, moment").limit(50000);
    if (data.destination) uq = uq.eq("destination", data.destination);
    const { data: usages, error: uErr } = await uq;
    if (uErr) return { ok: false as const, error: uErr.message };

    const productUrls = Array.from(new Set((usages ?? []).map((u) => u.product_url as string)));
    let products: Array<{
      product_url: string;
      brand: string;
      category: string | null;
      retailer: string | null;
      color_family: string | null;
      material: string | null;
    }> = [];
    if (productUrls.length) {
      const { data: prods } = await supabaseAdmin
        .from("editorial_memory_products")
        .select("product_url, brand, category, retailer, color_family, material")
        .in("product_url", productUrls);
      products = (prods ?? []) as typeof products;
    }
    const productByUrl = new Map(products.map((p) => [p.product_url, p]));

    const brand = new Map<string, number>();
    const category = new Map<string, number>();
    const retailer = new Map<string, number>();
    const color = new Map<string, number>();
    const material = new Map<string, number>();
    const momentBucket = new Map<string, number>();
    const destBucket = new Map<string, number>();
    let total = 0;
    for (const u of usages ?? []) {
      total += 1;
      const p = productByUrl.get(u.product_url as string);
      if (p) {
        brand.set(p.brand, (brand.get(p.brand) ?? 0) + 1);
        if (p.category) category.set(p.category, (category.get(p.category) ?? 0) + 1);
        if (p.retailer) retailer.set(p.retailer, (retailer.get(p.retailer) ?? 0) + 1);
        if (p.color_family) color.set(p.color_family, (color.get(p.color_family) ?? 0) + 1);
        if (p.material) material.set(p.material, (material.get(p.material) ?? 0) + 1);
      }
      momentBucket.set(
        u.moment as string,
        (momentBucket.get(u.moment as string) ?? 0) + 1,
      );
      destBucket.set(
        u.destination as string,
        (destBucket.get(u.destination as string) ?? 0) + 1,
      );
    }
    const toShare = (m: Map<string, number>): ShareRow[] =>
      Array.from(m.entries())
        .map(([key, uses]) => ({
          key,
          uses,
          share: total > 0 ? Math.round((uses / total) * 1000) / 1000 : 0,
        }))
        .sort((a, b) => b.uses - a.uses);

    return {
      ok: true as const,
      total,
      brand: toShare(brand),
      category: toShare(category),
      retailer: toShare(retailer),
      color: toShare(color),
      material: toShare(material),
      moments: toShare(momentBucket),
      destinations: toShare(destBucket),
    };
  });

/* ───────────────────────── Signature override ───────────────────────── */

export const setSignaturePiece = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        productUrl: z.string().url(),
        signature: z.boolean(),
        reason: z.string().max(300).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("editorial_memory_products")
      .update({
        signature_piece: data.signature,
        signature_reason: data.signature ? data.reason ?? null : null,
      })
      .eq("product_url", data.productUrl);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/* ───────────────────────── Duplicate analysis for a Founder Look ───────────────────────── */

export type DuplicateReport = {
  destination: string;
  totalDestinationUses: number;
  brandConcentration: ShareRow[];
  colorConcentration: ShareRow[];
  heroFindings: Array<{
    url: string;
    brand: string;
    exact_reuse_count: number;
    destination_reuse_count: number;
    brand_uses_in_destination: number;
    brand_share_in_destination: number;
    signature_piece: boolean;
    severity: "fresh" | "soft" | "moderate" | "strong";
    similar_products: Array<{ url: string; brand: string; product_name: string | null }>;
  }>;
};

export const analyzeFounderLookDuplicates = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<{ ok: true; report: DuplicateReport } | { ok: false; error: string }> => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadMemorySnapshot, evaluateCandidateDiversity } = await import(
      "./editorial-memory.server"
    );

    const { data: look, error: lErr } = await supabaseAdmin
      .from("founder_looks")
      .select("destination, hero_urls")
      .eq("id", data.id)
      .maybeSingle();
    if (lErr) return { ok: false as const, error: lErr.message };
    if (!look) return { ok: false as const, error: "not_found" };

    const destination = String(look.destination);
    const snapshot = await loadMemorySnapshot(supabaseAdmin, destination);

    const heroes = Array.isArray(look.hero_urls)
      ? (look.hero_urls as Array<Record<string, unknown>>)
      : [];

    const findings = heroes
      .filter((h) => h.url && h.brand)
      .map((h) => {
        const url = String(h.url);
        const brand = String(h.brand);
        const category = (h.category as string) ?? null;
        const verdict = evaluateCandidateDiversity(
          { url, brand, category },
          snapshot,
        );
        const severity: "fresh" | "soft" | "moderate" | "strong" =
          verdict.penaltyTotal === 0
            ? "fresh"
            : verdict.penaltyTotal < 2
              ? "soft"
              : verdict.penaltyTotal < 5
                ? "moderate"
                : "strong";

        // Similar products = same brand + category already used at destination.
        const similar: Array<{ url: string; brand: string; product_name: string | null }> = [];
        for (const entry of snapshot.byUrl.values()) {
          if (entry.product_url === url) continue;
          if (entry.brand !== brand) continue;
          if (category && entry.category !== category) continue;
          if (!entry.destinations.includes(destination)) continue;
          similar.push({
            url: entry.product_url,
            brand: entry.brand,
            product_name: entry.product_name,
          });
          if (similar.length >= 5) break;
        }

        return {
          url,
          brand,
          exact_reuse_count: verdict.exactReuseCount,
          destination_reuse_count: verdict.destinationReuseCount,
          brand_uses_in_destination: verdict.brandUsesInDestination,
          brand_share_in_destination: verdict.brandShareInDestination,
          signature_piece: verdict.isSignature,
          severity,
          similar_products: similar,
        };
      });

    const brandShare = Array.from(snapshot.brandUseInDestination.entries())
      .map(([key, uses]) => ({
        key,
        uses,
        share:
          snapshot.totalDestinationUses > 0
            ? Math.round((uses / snapshot.totalDestinationUses) * 1000) / 1000
            : 0,
      }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 10);

    const colorShare = Array.from(snapshot.categoryUseInDestination.entries())
      .map(([key, uses]) => ({
        key,
        uses,
        share:
          snapshot.totalDestinationUses > 0
            ? Math.round((uses / snapshot.totalDestinationUses) * 1000) / 1000
            : 0,
      }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 10);

    return {
      ok: true as const,
      report: {
        destination,
        totalDestinationUses: snapshot.totalDestinationUses,
        brandConcentration: brandShare,
        colorConcentration: colorShare,
        heroFindings: findings,
      },
    };
  });

/* ───────────────────────── Usage history for a single product ───────────────────────── */

export const getProductMemoryDetail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, productUrl: z.string().url() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product } = await supabaseAdmin
      .from("editorial_memory_products")
      .select("*")
      .eq("product_url", data.productUrl)
      .maybeSingle();
    if (!product) return { ok: false as const, error: "not_found" };
    const { data: usages } = await supabaseAdmin
      .from("editorial_memory_usages")
      .select("id, destination, moment, slot, role, used_at, founder_look_id")
      .eq("product_url", data.productUrl)
      .order("used_at", { ascending: false })
      .limit(200);
    const { data: feedback } = await supabaseAdmin
      .from("founder_product_feedback")
      .select("id, slot, reason_code, notes, created_at, variant")
      .eq("product_url", data.productUrl)
      .order("created_at", { ascending: false })
      .limit(50);
    return {
      ok: true as const,
      product: product as MemoryProductRow,
      usages: usages ?? [],
      feedback: feedback ?? [],
    };
  });
