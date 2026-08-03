/**
 * EDITORIAL CLOSET — server functions.
 *
 * Public: `getMomentCloset` (anon read of the limited public view, gated by the
 * per-moment enable switch) and `trackClosetEvent` (analytics).
 * Admin: password-gated generation, review, approval, regeneration, removal,
 * re-verification and the per-moment kill switch.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import {
  CLOSET_EVENTS,
  CLOSET_MAX_CANDIDATES,
  type ClosetPublicCandidate,
} from "./editorial-closet";

const pw = z.object({ password: z.string().min(1).max(200) });
const momentSchema = z.string().min(1).max(80);

function publishableClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  return { url, key };
}

async function anonClient() {
  const cfg = publishableClient();
  if (!cfg) return null;
  const { createClient } = await import("@supabase/supabase-js");
  const { key, url } = cfg;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// ── Public read ───────────────────────────────────────────────────

/**
 * Approved + verified alternatives for one moment, capped at 12. Returns an
 * empty list when the Editorial Closet is disabled for that moment.
 */
export const getMomentCloset = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ moment: momentSchema }).parse(i))
  .handler(
    async ({ data }): Promise<{ enabled: boolean; candidates: ClosetPublicCandidate[] }> => {
      const client = await anonClient();
      if (!client) return { enabled: false, candidates: [] };

      const { data: settings } = await client
        .from("editorial_closet_settings")
        .select("enabled")
        .eq("moment_slug", data.moment)
        .maybeSingle();
      if (settings && settings.enabled === false) return { enabled: false, candidates: [] };

      const { data: rows, error } = await client
        .from("editorial_closet_public")
        .select(
          "id,destination,moment_slug,category,context_label,brand,product_name,retailer,product_url,image_url,price,color,availability,editorial_rationale,rationale_tag,match_score,position",
        )
        .eq("moment_slug", data.moment)
        .order("position", { ascending: true, nullsFirst: false })
        .order("match_score", { ascending: false })
        .limit(CLOSET_MAX_CANDIDATES);
      if (error || !rows) return { enabled: true, candidates: [] };

      const candidates: ClosetPublicCandidate[] = rows.flatMap((r) => {
        if (!r.id || !r.product_url || !/^https?:\/\//i.test(r.product_url)) return [];
        return [
          {
            id: r.id,
            destination: r.destination ?? "",
            momentSlug: r.moment_slug ?? data.moment,
            category: r.category ?? "",
            contextLabel: r.context_label ?? null,
            brand: r.brand ?? "",
            productName: r.product_name ?? "",
            retailer: r.retailer ?? "",
            productUrl: r.product_url,
            imageUrl: r.image_url ?? null,
            price: r.price ?? null,
            color: r.color ?? null,
            availability: r.availability ?? "unknown",
            editorialRationale: r.editorial_rationale ?? "",
            rationaleTag: r.rationale_tag ?? null,
            matchScore: r.match_score ?? null,
            position: r.position ?? null,
          },
        ];
      });
      return { enabled: true, candidates };
    },
  );

/** Analytics: drawer opens, card clicks, retailer clicks, conversion intent. */
export const trackClosetEvent = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        eventType: z.enum([
          CLOSET_EVENTS.drawerOpen,
          CLOSET_EVENTS.cardClick,
          CLOSET_EVENTS.retailerClick,
          CLOSET_EVENTS.conversionIntent,
        ]),
        candidateId: z.string().uuid().nullable().optional(),
        destination: z.string().max(80).nullable().optional(),
        moment: momentSchema.nullable().optional(),
        retailer: z.string().max(120).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const client = await anonClient();
    if (!client) return { ok: false as const };
    await client.from("editorial_closet_events").insert({
      event_type: data.eventType,
      candidate_id: data.candidateId ?? null,
      destination: data.destination ?? null,
      moment_slug: data.moment ?? null,
      retailer: data.retailer ?? null,
    });
    if (data.candidateId && data.eventType !== CLOSET_EVENTS.drawerOpen) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const column =
        data.eventType === CLOSET_EVENTS.retailerClick ? "retailer_click_count" : "click_count";
      const { data: row } = await supabaseAdmin
        .from("editorial_closet_candidates")
        .select(column)
        .eq("id", data.candidateId)
        .maybeSingle();
      const current = Number((row as Record<string, unknown> | null)?.[column] ?? 0);
      const patch =
        data.eventType === CLOSET_EVENTS.retailerClick
          ? { retailer_click_count: current + 1 }
          : { click_count: current + 1 };
      await supabaseAdmin
        .from("editorial_closet_candidates")
        .update(patch)
        .eq("id", data.candidateId);
    }
    return { ok: true as const };
  });

// ── Admin ─────────────────────────────────────────────────────────

/** Every candidate + settings + engine status for the Studio view. */
export const listClosetCandidates = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.extend({ moment: z.string().optional() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isOpenAiStylistConfigured, openAiStylistModel } = await import(
      "./openai-stylist.server"
    );

    let q = supabaseAdmin
      .from("editorial_closet_candidates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.moment) q = q.eq("moment_slug", data.moment);
    const [{ data: rows, error }, { data: settings }] = await Promise.all([
      q,
      supabaseAdmin.from("editorial_closet_settings").select("*"),
    ]);
    if (error) throw new Error(error.message);

    return {
      candidates: rows ?? [],
      settings: settings ?? [],
      stylistConnected: isOpenAiStylistConfigured(),
      stylistModel: openAiStylistModel(),
    };
  });

/** Ask ChatGPT for alternatives for a moment, verify them, store for review. */
export const generateMomentCloset = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        moment: momentSchema,
        count: z.number().int().min(3).max(12).optional(),
        feedback: z.string().max(600).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { generateClosetCandidates } = await import("./editorial-closet.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const run = crypto.randomUUID();
    const out = await generateClosetCandidates({
      momentSlug: data.moment,
      requestCount: data.count,
      feedback: data.feedback ?? null,
    });

    let stored = 0;
    let position = 0;
    for (const c of out.candidates) {
      position += 1;
      const status = c.verificationStatus === "verified" ? "verified" : "ready_for_review";
      const { error } = await supabaseAdmin.from("editorial_closet_candidates").upsert(
        {
          destination: out.context.destination,
          moment_slug: data.moment,
          source_look_key: `${data.moment}:hero`,
          category: c.category,
          context_label: out.context.contextLabel,
          brand: c.brand,
          product_name: c.productName,
          retailer: c.retailer,
          product_url: c.productUrl,
          image_url: c.imageUrl,
          price: c.price,
          color: c.color,
          silhouette: c.silhouette,
          material: c.material,
          availability: c.availability,
          editorial_rationale: c.editorialRationale,
          rationale_tag: c.rationaleTag,
          full_look_pairing: c.fullLookPairing ? { pairing: c.fullLookPairing } : null,
          match_score: c.matchScore,
          retailer_priority_rank: c.retailerPriorityRank,
          status,
          verification_status: c.verificationStatus,
          verification_verdict: c.verificationVerdict,
          http_status: c.httpStatus,
          verified_at: c.verifiedAt,
          availability_checked_at: new Date().toISOString(),
          run_id: run,
          model: out.model,
          prompt_version: out.promptVersion,
          position,
        },
        { onConflict: "moment_slug,product_url" },
      );
      if (!error) stored += 1;
    }

    return {
      ok: true as const,
      runId: run,
      generated: out.candidates.length,
      stored,
      verified: out.candidates.filter((c) => c.verificationStatus === "verified").length,
      contextLabel: out.context.contextLabel,
      anchorCategory: out.context.anchorCategory,
      insufficientReason: out.insufficientReason,
    };
  });

/** Re-run live PDP verification for one stored candidate. */
export const reverifyClosetCandidate = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.extend({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyPdp } = await import("./pdp-verification.server");

    const { data: row, error } = await supabaseAdmin
      .from("editorial_closet_candidates")
      .select("id,product_url,brand,product_name,color,status")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) throw new Error("Candidate not found");

    const v = await verifyPdp({
      url: row.product_url,
      brand: row.brand,
      productName: row.product_name,
      color: row.color,
    });

    // A candidate that loses verification is pulled out of public use immediately.
    const nextStatus =
      v.status === "verified"
        ? row.status === "approved"
          ? "approved"
          : "verified"
        : "ready_for_review";

    await supabaseAdmin
      .from("editorial_closet_candidates")
      .update({
        verification_status: v.status,
        verification_verdict: v.verdict,
        http_status: v.httpStatus,
        availability: v.availability,
        availability_checked_at: v.verifiedAt,
        verified_at: v.status === "verified" ? v.verifiedAt : null,
        price: v.priceFound ?? undefined,
        status: nextStatus,
      })
      .eq("id", data.id);

    return { ok: true as const, status: v.status, verdict: v.verdict };
  });

/** Approve / reject / expire a candidate. Approval requires live verification. */
export const setClosetCandidateStatus = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        id: z.string().uuid(),
        status: z.enum(["approved", "rejected", "ready_for_review", "expired"]),
        reason: z.string().max(400).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.status === "approved") {
      const { data: row } = await supabaseAdmin
        .from("editorial_closet_candidates")
        .select("verification_status")
        .eq("id", data.id)
        .maybeSingle();
      if (!row || row.verification_status !== "verified") {
        throw new Error(
          "This option is not verified yet. Re-verify the product page before approving it for public use.",
        );
      }
    }

    await supabaseAdmin
      .from("editorial_closet_candidates")
      .update({
        status: data.status,
        rejected_reason: data.status === "rejected" ? (data.reason ?? null) : null,
      })
      .eq("id", data.id);
    return { ok: true as const };
  });

export const deleteClosetCandidate = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.extend({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("editorial_closet_candidates").delete().eq("id", data.id);
    return { ok: true as const };
  });

/** Per-moment kill switch for weak inventory or off-brand results. */
export const setClosetEnabled = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        moment: momentSchema,
        destination: z.string().max(80).default("Portofino"),
        enabled: z.boolean(),
        reason: z.string().max(300).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("editorial_closet_settings").upsert(
      {
        destination: data.destination,
        moment_slug: data.moment,
        enabled: data.enabled,
        disabled_reason: data.enabled ? null : (data.reason ?? null),
      },
      { onConflict: "destination,moment_slug" },
    );
    return { ok: true as const };
  });

/** Click + open analytics per moment for the Studio view. */
export const getClosetAnalytics = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("editorial_closet_events")
      .select("event_type,moment_slug,retailer,created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    const byMoment: Record<string, Record<string, number>> = {};
    for (const r of rows ?? []) {
      const m = r.moment_slug ?? "unknown";
      byMoment[m] ??= {};
      byMoment[m][r.event_type] = (byMoment[m][r.event_type] ?? 0) + 1;
    }
    return { byMoment, total: rows?.length ?? 0 };
  });