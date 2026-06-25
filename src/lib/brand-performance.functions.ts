/**
 * Brand Performance — internal admin analytics.
 *
 * Reads from `brands` + `brand_founder_signal_view` to surface per-brand
 * editorial affinity, founder approval signals, and commerce metadata.
 *
 * Also exposes a Founder Learning helper that aggregates approval signals
 * into `brands.affinity_signals` and nudges `editorial_affinity` based on
 * approval / rejection patterns. Founder decisions outweigh seeded values.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

const pw = z.object({ password: z.string().min(1) });

type SignalRow = {
  brand_name: string;
  destination: string;
  activity: string;
  approvals: number | null;
  rejections: number | null;
  collection_approvals: number | null;
  total_appearances: number | null;
  avg_editorial_score: number | null;
  last_seen_at: string | null;
};

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  tier: string | null;
  status: string | null;
  categories: string[] | null;
  activities: string[] | null;
  preferred_commerce_source: string | null;
  editorial_affinity: Record<string, number> | null;
  affinity_signals: Record<string, unknown> | null;
};

export const getBrandPerformance = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pw.parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: brands, error: bErr } = await supabaseAdmin
      .from("brands")
      .select(
        "id,name,slug,tier,status,categories,activities,preferred_commerce_source,editorial_affinity,affinity_signals",
      )
      .eq("status", "approved")
      .order("name", { ascending: true });
    if (bErr) throw new Error(bErr.message);

    const { data: signals, error: sErr } = await supabaseAdmin
      .from("brand_founder_signal_view" as never)
      .select("*");
    if (sErr) throw new Error(sErr.message);

    const byBrand: Record<string, SignalRow[]> = {};
    for (const r of (signals ?? []) as SignalRow[]) {
      (byBrand[r.brand_name] ??= []).push(r);
    }

    const rows = ((brands ?? []) as BrandRow[]).map((b) => {
      const brandSignals = byBrand[b.name] ?? [];
      const totalAppearances = brandSignals.reduce((a, r) => a + (r.total_appearances ?? 0), 0);
      const totalApprovals = brandSignals.reduce((a, r) => a + (r.approvals ?? 0), 0);
      const totalRejections = brandSignals.reduce((a, r) => a + (r.rejections ?? 0), 0);
      const totalPublications = brandSignals.reduce(
        (a, r) => a + (r.collection_approvals ?? 0),
        0,
      );
      const scored = brandSignals
        .map((r) => r.avg_editorial_score)
        .filter((n): n is number => typeof n === "number");
      const avgScore = scored.length ? scored.reduce((a, b) => a + b, 0) / scored.length : null;
      const affinity = (b.editorial_affinity ?? {}) as Record<string, number>;
      const topAffinity = Object.entries(affinity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        tier: b.tier,
        categories: b.categories ?? [],
        activities: b.activities ?? [],
        commerceSource: b.preferred_commerce_source,
        affinity,
        topAffinity,
        signals: brandSignals.map((r) => ({
          destination: r.destination,
          activity: r.activity,
          approvals: r.approvals ?? 0,
          rejections: r.rejections ?? 0,
          publications: r.collection_approvals ?? 0,
          appearances: r.total_appearances ?? 0,
          avgScore: r.avg_editorial_score,
        })),
        totals: {
          appearances: totalAppearances,
          approvals: totalApprovals,
          rejections: totalRejections,
          publications: totalPublications,
          approvalRate: totalAppearances ? totalApprovals / totalAppearances : null,
          avgEditorialScore: avgScore,
        },
      };
    });

    return { ok: true as const, brands: rows };
  });

/**
 * Founder Learning — fold approval signals into each brand's
 * `affinity_signals` JSONB and gently nudge `editorial_affinity` toward
 * what the Founder is actually publishing.
 *
 * Rules:
 *  - Approval (+2), Rejection (-3), Publication (+1) per context.
 *  - Clamp resulting affinity to [0, 100].
 *  - Only adjusts contexts where Founder has acted; seeded scores for
 *    untouched contexts are left alone.
 */
export const recomputeBrandAffinitySignals = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pw.parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signals, error: sErr } = await supabaseAdmin
      .from("brand_founder_signal_view" as never)
      .select("*");
    if (sErr) throw new Error(sErr.message);

    const byBrand: Record<string, SignalRow[]> = {};
    for (const r of (signals ?? []) as SignalRow[]) {
      (byBrand[r.brand_name] ??= []).push(r);
    }
    const brandNames = Object.keys(byBrand);
    if (!brandNames.length) {
      return { ok: true as const, updatedBrands: 0, adjustments: [] };
    }

    const { data: brands, error: bErr } = await supabaseAdmin
      .from("brands")
      .select("id,name,editorial_affinity,affinity_signals")
      .in("name", brandNames);
    if (bErr) throw new Error(bErr.message);

    const adjustments: Array<{
      brand: string;
      context: string;
      before: number;
      after: number;
      delta: number;
    }> = [];
    let updated = 0;

    for (const b of (brands ?? []) as BrandRow[]) {
      const rows = byBrand[b.name] ?? [];
      if (!rows.length) continue;
      const affinity = { ...((b.editorial_affinity ?? {}) as Record<string, number>) };
      const signalsMap = { ...((b.affinity_signals ?? {}) as Record<string, unknown>) };
      let changed = false;
      for (const r of rows) {
        const key = `${r.destination.toLowerCase().replace(/\s+/g, "-")}:${r.activity
          .toLowerCase()
          .replace(/\s+/g, "-")}`;
        const before = affinity[key] ?? 60;
        const delta =
          (r.approvals ?? 0) * 2 +
          (r.collection_approvals ?? 0) * 1 -
          (r.rejections ?? 0) * 3;
        const after = Math.max(0, Math.min(100, Math.round(before + delta)));
        signalsMap[key] = {
          approvals: r.approvals ?? 0,
          rejections: r.rejections ?? 0,
          publications: r.collection_approvals ?? 0,
          appearances: r.total_appearances ?? 0,
          avgScore: r.avg_editorial_score,
          lastSeenAt: r.last_seen_at,
          appliedDelta: delta,
        };
        if (after !== before) {
          affinity[key] = after;
          adjustments.push({ brand: b.name, context: key, before, after, delta });
          changed = true;
        }
      }
      if (changed) {
        const { error } = await supabaseAdmin
          .from("brands")
          .update({
            editorial_affinity: affinity as never,
            affinity_signals: signalsMap as never,
          })
          .eq("id", b.id);
        if (error) throw new Error(error.message);
        updated++;
      }
    }

    return { ok: true as const, updatedBrands: updated, adjustments };
  });
