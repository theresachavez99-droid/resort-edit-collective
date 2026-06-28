/**
 * Founder Buying Office — server functions.
 *
 * Admin-only. Password-gated via the same ADMIN_PASSWORD pattern as the
 * other admin server fns. All DB access uses the service-role client
 * because the buying_* tables have deny-all RLS.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import {
  normalizeManualRow,
  canonicalizeUrl,
  type ManualImportRow,
} from "./product-search/manual-import-provider.server";
import { affiliateNetworkStatus } from "./product-search/affiliate-feed-provider.server";
import {
  computeBuyingScorecard,
  type HeroBrief,
} from "./buying-office-scorecard";
import { MOMENT_CATEGORY_SETS } from "./product-search/moment-category-set";

const pwShape = { password: z.string().min(1).max(200) };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function nextSessionCode(destination: string, moment: string) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const slug = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `SS-${stamp}-${slug(destination)}-${slug(moment)}-${rand}`;
}

// ---------- Sessions ----------

export const createBuyingSession = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      ...pwShape,
      destination: z.string().min(1).max(80),
      moment: z.string().min(1).max(120),
      founderLookId: z.string().uuid().nullable().optional(),
      notes: z.string().max(2000).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const set = (MOMENT_CATEGORY_SETS as Record<string, unknown>)[data.moment] ?? {};
    const insert = await db
      .from("buying_search_sessions")
      .insert({
        session_code: nextSessionCode(data.destination, data.moment),
        destination: data.destination,
        moment: data.moment,
        founder_look_id: data.founderLookId ?? null,
        category_set: set as never,
        notes: data.notes ?? null,
        source_diagnostics: { networks: affiliateNetworkStatus() } as never,
      })
      .select()
      .single();
    if (insert.error) throw new Error(insert.error.message);
    return { session: insert.data };
  });

export const listBuyingSessions = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object(pwShape).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const r = await db
      .from("buying_search_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (r.error) throw new Error(r.error.message);
    return { sessions: r.data ?? [] };
  });

export const getBuyingSession = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ ...pwShape, id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const s = await db
      .from("buying_search_sessions")
      .select("*")
      .eq("id", data.id)
      .single();
    if (s.error) throw new Error(s.error.message);
    const c = await db
      .from("buying_candidates")
      .select("*")
      .eq("session_id", data.id)
      .order("editorial_score", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (c.error) throw new Error(c.error.message);

    let brief: HeroBrief = null;
    if (s.data.founder_look_id) {
      const fl = await db
        .from("founder_looks")
        .select("hero_urls, style_family, color_palette")
        .eq("id", s.data.founder_look_id)
        .maybeSingle();
      if (fl.data) {
        const palette = (fl.data.color_palette ?? {}) as { include?: string[]; exclude?: string[] };
        const heroUrls = (fl.data.hero_urls ?? []) as Array<{ brand?: string }>;
        const brands = Array.from(
          new Set(heroUrls.map((h) => h?.brand).filter((b): b is string => !!b)),
        );
        brief = {
          brands,
          paletteInclude: palette.include ?? [],
          paletteExclude: palette.exclude ?? [],
          styleFamily: (fl.data.style_family ?? []) as string[],
          priceCeiling: 1000,
        };
      }
    }
    return {
      session: s.data,
      candidates: c.data ?? [],
      heroBrief: brief,
      networks: affiliateNetworkStatus(),
    };
  });

// ---------- Imports ----------

const importRow = z.object({
  product_url: z.string().url(),
  affiliate_url: z.string().url().nullable().optional(),
  product_name: z.string().max(300).nullable().optional(),
  brand: z.string().max(120).nullable().optional(),
  retailer: z.string().max(120).nullable().optional(),
  category: z.string().max(120).nullable().optional(),
  color: z.string().max(80).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(8).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

async function persistRows(
  sessionId: string,
  rows: ManualImportRow[],
  adapter: "url_paste" | "row_import",
  brief: HeroBrief,
  importType: "shopping" | "editorial_inspiration" = "shopping",
) {
  const db = await admin();
  const inserted: string[] = [];
  const skipped: { url: string; reason: string }[] = [];

  for (const row of rows) {
    if (!row.product_url) {
      skipped.push({ url: "", reason: "missing product_url" });
      continue;
    }
    let normalized;
    try {
      normalized = await normalizeManualRow(row, adapter);
    } catch (e) {
      skipped.push({ url: row.product_url, reason: (e as Error).message });
      continue;
    }

    const score = computeBuyingScorecard(
      {
        brand: normalized.brand,
        retailer: normalized.retailer,
        retailerApproved: normalized.retailer_approved,
        productName: normalized.product_name,
        category: normalized.category,
        color: normalized.color,
        price: normalized.price,
        imageUrl: normalized.image_url,
        affiliateUrl: normalized.affiliate_url,
      },
      brief,
    );

    const ins = await db
      .from("buying_candidates")
      .upsert(
        {
          session_id: sessionId,
          source: normalized.source,
          source_adapter: normalized.source_adapter,
          import_type: importType,
          product_url: normalized.product_url,
          canonical_url: normalized.canonical_url,
          affiliate_url: normalized.affiliate_url,
          affiliate_status: normalized.affiliate_status,
          retailer: normalized.retailer,
          brand: normalized.brand,
          product_name: normalized.product_name,
          category: normalized.category,
          color: normalized.color,
          price: normalized.price,
          currency: normalized.currency,
          image_url: normalized.image_url,
          image_missing: normalized.image_missing,
          description: normalized.description,
          notes: normalized.notes,
          editorial_score: score.editorialScore,
          benchmark_similarity: score.benchmarkSimilarity,
          editorial_confidence: score.editorialConfidence,
        ranking_reasons: score.reasons as never,
        raw: normalized.raw as never,
          status: "review",
        },
        { onConflict: "session_id,canonical_url" },
      )
      .select("id")
      .single();
    if (ins.error) {
      skipped.push({ url: row.product_url, reason: ins.error.message });
    } else {
      inserted.push(ins.data.id);
    }
  }

  return { inserted, skipped };
}

async function loadBrief(sessionId: string): Promise<HeroBrief> {
  const db = await admin();
  const s = await db
    .from("buying_search_sessions")
    .select("founder_look_id")
    .eq("id", sessionId)
    .single();
  if (s.error || !s.data.founder_look_id) return null;
  const fl = await db
    .from("founder_looks")
    .select("hero_urls, style_family, color_palette")
    .eq("id", s.data.founder_look_id)
    .maybeSingle();
  if (!fl.data) return null;
  const palette = (fl.data.color_palette ?? {}) as { include?: string[]; exclude?: string[] };
  const heroUrls = (fl.data.hero_urls ?? []) as Array<{ brand?: string }>;
  const brands = Array.from(
    new Set(heroUrls.map((h) => h?.brand).filter((b): b is string => !!b)),
  );
  return {
    brands,
    paletteInclude: palette.include ?? [],
    paletteExclude: palette.exclude ?? [],
    styleFamily: (fl.data.style_family ?? []) as string[],
    priceCeiling: 1000,
  };
}

export const importUrlsToSession = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      ...pwShape,
      sessionId: z.string().uuid(),
      urls: z.array(z.string().url()).min(1).max(100),
      importType: z.enum(["shopping", "editorial_inspiration"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    // Dedupe by canonical URL up-front
    const seen = new Set<string>();
    const rows: ManualImportRow[] = [];
    for (const u of data.urls) {
      const key = canonicalizeUrl(u);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ product_url: u });
    }
    const brief = await loadBrief(data.sessionId);
    return await persistRows(
      data.sessionId,
      rows,
      "url_paste",
      brief,
      data.importType ?? "shopping",
    );
  });

export const importRowsToSession = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      ...pwShape,
      sessionId: z.string().uuid(),
      rows: z.array(importRow).min(1).max(200),
      importType: z.enum(["shopping", "editorial_inspiration"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const brief = await loadBrief(data.sessionId);
    return await persistRows(
      data.sessionId,
      data.rows as ManualImportRow[],
      "row_import",
      brief,
      data.importType ?? "shopping",
    );
  });

// ---------- Candidate lifecycle ----------

const STATUSES = [
  "review",
  "favorite",
  "review_later",
  "finalist",
  "founder_hero",
  "rejected",
] as const;

export const updateCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      ...pwShape,
      id: z.string().uuid(),
      patch: z.object({
        status: z.enum(STATUSES).optional(),
        rejection_reason: z.string().max(500).nullable().optional(),
        affiliate_url: z.string().url().nullable().optional(),
        image_url: z.string().url().nullable().optional(),
        product_url: z.string().url().optional(),
        notes: z.string().max(2000).nullable().optional(),
        brand: z.string().max(120).nullable().optional(),
        product_name: z.string().max(300).nullable().optional(),
        price: z.number().nonnegative().nullable().optional(),
        currency: z.string().max(8).nullable().optional(),
        category: z.string().max(120).nullable().optional(),
        color: z.string().max(80).nullable().optional(),
      }),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const patch: Record<string, unknown> = { ...data.patch };
    if (patch.affiliate_url !== undefined) {
      patch.affiliate_status = patch.affiliate_url ? "linked" : "pending";
    }
    if (patch.image_url !== undefined) {
      patch.image_missing = !patch.image_url;
    }
    const r = await db
      .from("buying_candidates")
      .update(patch as never)
      .eq("id", data.id)
      .select()
      .single();
    if (r.error) throw new Error(r.error.message);
    return { candidate: r.data };
  });

export const deleteCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ ...pwShape, id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const r = await db.from("buying_candidates").delete().eq("id", data.id);
    if (r.error) throw new Error(r.error.message);
    return { ok: true as const };
  });

// ---------- Affiliate network readiness ----------

export const getAffiliateNetworkStatus = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object(pwShape).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const networks = affiliateNetworkStatus();
    return {
      networks,
      summary: {
        total: networks.length,
        ready: networks.filter((n) => n.providerReady).length,
        credsPresent: networks.filter((n) => n.credentialsPresent).length,
      },
    };
  });

// ---------- Session metadata ----------

export const updateBuyingSession = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      ...pwShape,
      id: z.string().uuid(),
      patch: z.object({
        founder_look_id: z.string().uuid().nullable().optional(),
        strategy: z.string().max(200).nullable().optional(),
        status: z.string().max(40).nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
        depth: z.string().max(80).nullable().optional(),
        benchmark: z.string().max(400).nullable().optional(),
        editorial_story: z.string().max(1200).nullable().optional(),
        moment_energy: z.string().max(400).nullable().optional(),
        color_direction: z.string().max(400).nullable().optional(),
        exclusions: z.string().max(800).nullable().optional(),
        brief_locked: z.boolean().optional(),
        wizard_stage: z.enum(["setup", "brief", "import", "review"]).optional(),
        hero_celebration_seen: z.boolean().optional(),
      }),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const {
      depth, benchmark,
      editorial_story, moment_energy, color_direction, exclusions,
      brief_locked, wizard_stage, hero_celebration_seen,
      ...direct
    } = data.patch;
    const patch: Record<string, unknown> = { ...direct };
    const diagKeys = {
      depth, benchmark, editorial_story, moment_energy, color_direction,
      exclusions, brief_locked, wizard_stage, hero_celebration_seen,
    };
    const hasDiag = Object.values(diagKeys).some((v) => v !== undefined);
    if (hasDiag) {
      const cur = await db
        .from("buying_search_sessions")
        .select("source_diagnostics")
        .eq("id", data.id)
        .single();
      const diag = (cur.data?.source_diagnostics ?? {}) as Record<string, unknown>;
      for (const [k, v] of Object.entries(diagKeys)) {
        if (v !== undefined) diag[k] = v;
      }
      patch.source_diagnostics = diag as never;
    }
    const r = await db
      .from("buying_search_sessions")
      .update(patch as never)
      .eq("id", data.id)
      .select()
      .single();
    if (r.error) throw new Error(r.error.message);
    return { session: r.data };
  });