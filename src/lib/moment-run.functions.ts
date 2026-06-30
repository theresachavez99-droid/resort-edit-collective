// Moment Run engine — Step 3.
//
// Generic, parameterized 5-stage Run Contract that replaces the hardcoded
// "Generate Yacht Day" path. Reads (destination, momentSlug) from the
// Moment record. The same engine runs any moment.
//
// Stage contract:
//   1. Compile  — build the run brief from Moment.brief + references.
//                 REJECTS any compiled brief that contains a product name
//                 (anti-fabrication guardrail — Gate C).
//   2. Feed     — query the active ProductSearchProvider. With Gate B the
//                 default provider is the dormant DatafeedrAdapter, which
//                 returns zero candidates. No fallback fills in for an
//                 empty feed.
//   3. Rank     — score feed results only (Brand Tier + Editorial Memory
//                 reuse penalty). Empty in → empty out.
//   4. Curate   — surface ranked candidates to the founder for selection.
//                 Performed in the UI; this stage just packages state.
//   5. Publish  — writes the curated look into founder_looks and updates
//                 moments.status. No-op when curate is empty.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import { datafeedrAdapter } from "./product-search/datafeedr-adapter.server";
import type {
  NormalizedCandidate,
  ProductSearchProvider,
} from "./product-search/provider";

// ──────────────────────────────────────────────────────────────
// Stage 1 — anti-fabrication guard
// ──────────────────────────────────────────────────────────────

/**
 * Reject any compiled brief string containing a literal product name.
 * Stage 1 must produce abstract editorial direction only — never a
 * pre-named SKU. If any matcher fires, the run aborts before Feed.
 */
const PRODUCT_NAME_PATTERNS: RegExp[] = [
  // proper-noun "Brand + product noun" pattern
  /\b[A-Z][A-Za-z'’]+\s+(Dress|Top|Bag|Sandal|Sandals|Skirt|Earrings|Necklace|Sunglasses|Bikini|Swimsuit|Caftan|Kaftan|Hat|Tote|Clutch|Mule|Mules|Pump|Pumps)\b/,
  // explicit "the <Brand> <Product>" reference
  /\bthe\s+[A-Z][A-Za-z'’]+\s+[A-Z][A-Za-z'’]+/,
];

export function detectProductNames(text: string): string[] {
  const hits: string[] = [];
  for (const re of PRODUCT_NAME_PATTERNS) {
    const m = text.match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

export function assertNoProductNames(briefText: string): void {
  const hits = detectProductNames(briefText);
  if (hits.length > 0) {
    throw new Error(
      `Stage 1 (Compile) rejected: brief contains product names (${hits
        .slice(0, 3)
        .join(", ")}). Briefs must be abstract editorial direction.`,
    );
  }
}

// ──────────────────────────────────────────────────────────────
// Provider selection — default: dormant Datafeedr (Gate B)
// ──────────────────────────────────────────────────────────────

function activeProvider(): ProductSearchProvider & {
  status?: () => { connected: boolean; reason: string; detail: string };
} {
  return datafeedrAdapter;
}

// ──────────────────────────────────────────────────────────────
// Stage 3 — Rank (feed candidates only)
// ──────────────────────────────────────────────────────────────

type RankedCandidate = NormalizedCandidate & {
  rank: number;
  brand_tier_boost: number;
  memory_reuse_penalty: number;
};

function rankCandidates(
  candidates: NormalizedCandidate[],
  ctx: { brandTier: Map<string, number>; previouslyUsedUrls: Set<string> },
): RankedCandidate[] {
  return candidates
    .map((c) => {
      const tier = c.brand ? ctx.brandTier.get(c.brand.toLowerCase()) ?? 0 : 0;
      const reused = ctx.previouslyUsedUrls.has(c.source_url) ? -25 : 0;
      const tierBoost = tier; // -50..+50
      return {
        ...c,
        rank: tierBoost + reused,
        brand_tier_boost: tierBoost,
        memory_reuse_penalty: reused,
      } satisfies RankedCandidate;
    })
    .sort((a, b) => b.rank - a.rank);
}

// ──────────────────────────────────────────────────────────────
// Server fn — runMoment (5-stage)
// ──────────────────────────────────────────────────────────────

export type MomentRunOutput = {
  ok: true;
  momentId: string;
  destination: string;
  momentSlug: string;
  feed: {
    providerId: string;
    connected: boolean;
    reason: string;
    detail: string;
  };
  stages: {
    compile: { status: "ok"; briefSummary: string; references: number };
    feed: { status: "ok" | "empty"; rawCandidates: number };
    rank: { status: "ok" | "empty"; ranked: number };
    curate: { status: "pending" | "empty"; pool: RankedCandidate[] };
    publish: { status: "pending" | "blocked"; reason: string };
  };
};

export const runMoment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        momentId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<MomentRunOutput | { ok: false; stage: string; error: string }> => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Load moment
    const { data: moment, error: momentErr } = await supabaseAdmin
      .from("moments")
      .select("id, destination, slug, name, brief")
      .eq("id", data.momentId)
      .maybeSingle();
    if (momentErr || !moment) {
      return { ok: false, stage: "load", error: momentErr?.message ?? "moment not found" };
    }

    // record run start (best-effort)
    const { data: runRow } = await supabaseAdmin
      .from("moment_runs")
      .insert({
        moment_id: moment.id,
        stage: "compile",
        status: "running",
        params: { destination: moment.destination, momentSlug: moment.slug },
      })
      .select("id")
      .maybeSingle();
    const runId = runRow?.id ?? null;

    const finish = async (stage: string, status: string, output: unknown, err?: string) => {
      if (!runId) return;
      await supabaseAdmin
        .from("moment_runs")
        .update({ stage, status, output: output as never, last_error: err ?? null })
        .eq("id", runId);
    };

    // ── Stage 1 — Compile
    const brief = (moment.brief ?? {}) as Record<string, unknown>;
    const briefText = [
      `Destination: ${moment.destination}`,
      `Moment: ${moment.name}`,
      typeof brief.mood === "string" ? `Mood: ${brief.mood}` : "",
      Array.isArray((brief as { style_notes?: unknown }).style_notes)
        ? `Style notes: ${((brief as { style_notes: unknown[] }).style_notes as string[]).join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      assertNoProductNames(briefText);
    } catch (e) {
      const msg = (e as Error).message;
      await finish("compile", "rejected", { briefText }, msg);
      return { ok: false, stage: "compile", error: msg };
    }
    const references = Array.isArray((brief as { references?: unknown }).references)
      ? ((brief as { references: unknown[] }).references as unknown[]).length
      : 0;

    // ── Stage 2 — Feed (dormant by default)
    const provider = activeProvider();
    const feedStatus = provider.status
      ? provider.status()
      : { connected: true, reason: "ok", detail: "no status() implemented" };
    const feedResult = await provider.search({
      sessionId: runId ?? `run-${Date.now()}`,
      categorySet: {
        moment: moment.slug,
        primary: Array.isArray((brief as { primary_categories?: unknown }).primary_categories)
          ? ((brief as { primary_categories: string[] }).primary_categories)
          : [],
        secondary: Array.isArray((brief as { secondary_categories?: unknown }).secondary_categories)
          ? ((brief as { secondary_categories: string[] }).secondary_categories)
          : [],
      },
      retailers: [],
      strategy: "editorial_first",
      depth: "standard",
    });

    // ── Stage 3 — Rank (feed-only, never invent)
    const ranked = rankCandidates(feedResult.candidates, {
      brandTier: new Map(),
      previouslyUsedUrls: new Set(),
    });

    // ── Stage 4 — Curate (handled in UI; pool is what's available)
    const curateStatus: "pending" | "empty" = ranked.length === 0 ? "empty" : "pending";

    // ── Stage 5 — Publish
    // BLOCKED whenever there is nothing curated. No fabrication path.
    const publishStatus: "pending" | "blocked" = ranked.length === 0 ? "blocked" : "pending";
    const publishReason =
      publishStatus === "blocked"
        ? feedStatus.connected
          ? "Feed returned zero candidates."
          : "Feed not connected — Step 4 not yet enabled. Gate B keeps the engine dormant."
        : "Awaiting founder curation.";

    const out: MomentRunOutput = {
      ok: true,
      momentId: moment.id,
      destination: moment.destination,
      momentSlug: moment.slug,
      feed: {
        providerId: provider.id,
        connected: feedStatus.connected,
        reason: feedStatus.reason,
        detail: feedStatus.detail,
      },
      stages: {
        compile: { status: "ok", briefSummary: briefText, references },
        feed: { status: feedResult.candidates.length === 0 ? "empty" : "ok", rawCandidates: feedResult.candidates.length },
        rank: { status: ranked.length === 0 ? "empty" : "ok", ranked: ranked.length },
        curate: { status: curateStatus, pool: ranked },
        publish: { status: publishStatus, reason: publishReason },
      },
    };
    await finish("publish", publishStatus === "blocked" ? "blocked" : "ready", out);
    return out;
  });

// ──────────────────────────────────────────────────────────────
// listMomentsForRun — workspace index
// ──────────────────────────────────────────────────────────────

export const listMomentsForRun = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("moments")
      .select("id, destination, slug, name, sequence, status")
      .neq("slug", "__unassigned__")
      .order("destination")
      .order("sequence");
    if (error) throw new Error(error.message);
    return { ok: true as const, moments: rows ?? [] };
  });