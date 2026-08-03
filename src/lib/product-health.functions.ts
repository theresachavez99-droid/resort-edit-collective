/**
 * Product availability — server functions.
 *
 * Public: `getMomentSlotHealth` (anon-safe read of the display view) powers the
 * public moment page so a dead PDP is never rendered as a link.
 * Admin: password-gated health checks, status changes, backup promotion and the
 * replacement-candidate workflow (AI-sourcing ready, approval always manual).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import {
  PRODUCT_STATUSES,
  MAX_BACKUPS_PER_SLOT,
  resolveMomentSlots,
  slotKey,
  type SlotProductDisplay,
  type SlotResolution,
} from "./product-health";

const pw = z.object({ password: z.string().min(1).max(200) });

const styleDnaSchema = z
  .object({
    category: z.string().optional(),
    color: z.string().optional(),
    silhouette: z.string().optional(),
    fabric: z.string().optional(),
    neckline: z.string().optional(),
    fit: z.string().optional(),
    occasion: z.string().optional(),
    luxury_level: z.string().optional(),
    editorial_notes: z.string().optional(),
  })
  .default({});

// ── Public read ───────────────────────────────────────────────────

/**
 * Public, unauthenticated read of slot availability for one moment. Uses the
 * publishable key against `public_shop_slot_display` (display columns only).
 */
export const getMomentSlotHealth = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) =>
    z.object({ moment: z.string().min(1).max(80) }).parse(i),
  )
  .handler(async ({ data }): Promise<{ slots: Record<string, SlotResolution> }> => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return { slots: {} };
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: rows, error } = await client
      .from("public_shop_slot_display")
      .select(
        "destination,moment,look_key,slot,slot_label,brand,product_name,retailer,url,price,status,is_primary,replacement_priority",
      )
      .eq("moment", data.moment);
    if (error || !rows) return { slots: {} };
    return { slots: resolveMomentSlots(rows as SlotProductDisplay[]) };
  });

// ── Admin: read ───────────────────────────────────────────────────

export const listProductHealth = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw.extend({ moment: z.string().optional() }).parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("shop_slot_products")
      .select("*")
      .order("moment")
      .order("slot")
      .order("is_primary", { ascending: false })
      .order("replacement_priority");
    if (data.moment) q = q.eq("moment", data.moment);
    const { data: products, error } = await q;
    if (error) throw new Error(error.message);

    const { data: candidates, error: cErr } = await supabaseAdmin
      .from("product_replacement_candidates")
      .select("*")
      .order("matching_score", { ascending: false, nullsFirst: false });
    if (cErr) throw new Error(cErr.message);

    return { products: products ?? [], candidates: candidates ?? [] };
  });

// ── Admin: health check ───────────────────────────────────────────

/**
 * Probe every (or one) slot product and record HTTP status + health.
 * Structured so a daily scheduled job can call the same code path later.
 * NEVER promotes or publishes a replacement automatically.
 */
export const runProductHealthCheck = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        productId: z.string().uuid().optional(),
        moment: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(40),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { probeProductUrl } = await import("./product-health.server");

    let q = supabaseAdmin
      .from("shop_slot_products")
      .select("id,url,status")
      .not("url", "is", null)
      .limit(data.limit);
    if (data.productId) q = q.eq("id", data.productId);
    if (data.moment) q = q.eq("moment", data.moment);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const checked: {
      id: string;
      url: string;
      httpStatus: number | null;
      status: string;
      changed: boolean;
    }[] = [];

    for (const row of rows ?? []) {
      if (!row.url) continue;
      const probe = await probeProductUrl(row.url);
      const now = new Date().toISOString();
      const patch: {
        last_checked_at: string;
        last_http_status: number | null;
        status: string;
        last_seen_available_at?: string;
      } = {
        last_checked_at: now,
        last_http_status: probe.httpStatus,
        status: probe.status,
      };
      if (probe.status === "active") patch.last_seen_available_at = now;
      const { error: uErr } = await supabaseAdmin
        .from("shop_slot_products")
        .update(patch)
        .eq("id", row.id);
      if (uErr) throw new Error(uErr.message);
      checked.push({
        id: row.id,
        url: row.url,
        httpStatus: probe.httpStatus,
        status: probe.status,
        changed: probe.status !== row.status,
      });
    }
    return { checked, count: checked.length };
  });

// ── Admin: status + promotion ─────────────────────────────────────

export const setProductStatus = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        productId: z.string().uuid(),
        status: z.enum(PRODUCT_STATUSES),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("shop_slot_products")
      .update({
        status: data.status,
        ...(data.status === "active" ? { last_seen_available_at: now } : {}),
      })
      .eq("id", data.productId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/**
 * Make an approved backup the displayed product for its slot. The former
 * primary is retained as a backup so nothing is lost, and the editorial image,
 * title and copy are untouched (they live in the editorial layer, not here).
 */
export const promoteBackup = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.extend({ productId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target, error } = await supabaseAdmin
      .from("shop_slot_products")
      .select("id,look_key,slot,status")
      .eq("id", data.productId)
      .single();
    if (error || !target) throw new Error(error?.message ?? "Product not found");
    if (target.status !== "active") {
      throw new Error("Only an active (approved + reachable) backup can be promoted");
    }
    const { data: siblings, error: sErr } = await supabaseAdmin
      .from("shop_slot_products")
      .select("id,is_primary,replacement_priority")
      .eq("look_key", target.look_key)
      .eq("slot", target.slot);
    if (sErr) throw new Error(sErr.message);

    const maxPriority = Math.max(
      0,
      ...(siblings ?? []).map((s) => s.replacement_priority ?? 0),
    );
    // Demote current primary first — one primary per slot is enforced by index.
    for (const s of siblings ?? []) {
      if (s.is_primary && s.id !== target.id) {
        const { error: dErr } = await supabaseAdmin
          .from("shop_slot_products")
          .update({ is_primary: false, replacement_priority: maxPriority + 1 })
          .eq("id", s.id);
        if (dErr) throw new Error(dErr.message);
      }
    }
    const { error: pErr } = await supabaseAdmin
      .from("shop_slot_products")
      .update({ is_primary: true, replacement_priority: 0 })
      .eq("id", target.id);
    if (pErr) throw new Error(pErr.message);
    return { ok: true as const };
  });

// ── Admin: replacement candidates (AI-sourcing ready) ─────────────

export const upsertReplacementCandidate = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        id: z.string().uuid().optional(),
        slotProductId: z.string().uuid(),
        brand: z.string().min(1).max(120),
        productName: z.string().min(1).max(200),
        retailer: z.string().max(120).optional(),
        pdpUrl: z.string().url().max(1000),
        price: z.string().max(40).optional(),
        matchingScore: z.number().min(0).max(100).optional(),
        rationale: z.string().max(2000).optional(),
        styleDna: styleDnaSchema.optional(),
        source: z.string().max(40).default("manual"),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { isPublishableProductUrl } = await import("./shop-url-policy");
    if (!isPublishableProductUrl(data.pdpUrl)) {
      throw new Error(
        "Candidate must be an exact retailer product page (no search, category or homepage URLs)",
      );
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: slot, error } = await supabaseAdmin
      .from("shop_slot_products")
      .select("id,destination,moment,look_key,slot")
      .eq("id", data.slotProductId)
      .single();
    if (error || !slot) throw new Error(error?.message ?? "Slot product not found");

    const row = {
      slot_product_id: slot.id,
      destination: slot.destination,
      moment: slot.moment,
      look_key: slot.look_key,
      slot: slot.slot,
      brand: data.brand,
      product_name: data.productName,
      retailer: data.retailer ?? null,
      pdp_url: data.pdpUrl,
      price: data.price ?? null,
      matching_score: data.matchingScore ?? null,
      rationale: data.rationale ?? null,
      style_dna: data.styleDna ?? {},
      source: data.source,
    };
    if (data.id) {
      const { error: uErr } = await supabaseAdmin
        .from("product_replacement_candidates")
        .update(row)
        .eq("id", data.id);
      if (uErr) throw new Error(uErr.message);
      return { ok: true as const, id: data.id };
    }
    const { data: inserted, error: iErr } = await supabaseAdmin
      .from("product_replacement_candidates")
      .insert(row)
      .select("id")
      .single();
    if (iErr) throw new Error(iErr.message);
    return { ok: true as const, id: inserted.id };
  });

/**
 * Approve a candidate → it becomes an approved backup on the slot (never the
 * primary automatically). Verifies the PDP responds before it can go live, and
 * caps a slot at MAX_BACKUPS_PER_SLOT approved backups.
 */
export const approveReplacementCandidate = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        candidateId: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]).default("approved"),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cand, error } = await supabaseAdmin
      .from("product_replacement_candidates")
      .select("*")
      .eq("id", data.candidateId)
      .single();
    if (error || !cand) throw new Error(error?.message ?? "Candidate not found");

    if (data.decision === "rejected") {
      const { error: rErr } = await supabaseAdmin
        .from("product_replacement_candidates")
        .update({ approval_status: "rejected" })
        .eq("id", cand.id);
      if (rErr) throw new Error(rErr.message);
      return { ok: true as const, promotedProductId: null };
    }

    const { data: existing, error: eErr } = await supabaseAdmin
      .from("shop_slot_products")
      .select("id,is_primary,replacement_priority")
      .eq("look_key", cand.look_key)
      .eq("slot", cand.slot);
    if (eErr) throw new Error(eErr.message);
    const backups = (existing ?? []).filter((r) => !r.is_primary);
    if (backups.length >= MAX_BACKUPS_PER_SLOT) {
      throw new Error(
        `Slot already holds ${MAX_BACKUPS_PER_SLOT} backups — remove one before approving another`,
      );
    }

    const { probeProductUrl } = await import("./product-health.server");
    const probe = await probeProductUrl(cand.pdp_url);
    const now = new Date().toISOString();

    const { data: inserted, error: iErr } = await supabaseAdmin
      .from("shop_slot_products")
      .insert({
        destination: cand.destination,
        moment: cand.moment,
        look_key: cand.look_key,
        slot: cand.slot,
        brand: cand.brand,
        product_name: cand.product_name,
        retailer: cand.retailer,
        url: cand.pdp_url,
        price: cand.price,
        status: probe.status,
        last_checked_at: now,
        last_http_status: probe.httpStatus,
        last_seen_available_at: probe.status === "active" ? now : null,
        is_primary: false,
        replacement_priority: backups.length + 1,
        style_dna: cand.style_dna ?? {},
        notes: `Approved replacement candidate${cand.matching_score ? ` (match ${cand.matching_score})` : ""}.`,
      })
      .select("id")
      .single();
    if (iErr) throw new Error(iErr.message);

    const { error: uErr } = await supabaseAdmin
      .from("product_replacement_candidates")
      .update({
        approval_status: "approved",
        verified_at: now,
        promoted_product_id: inserted.id,
      })
      .eq("id", cand.id);
    if (uErr) throw new Error(uErr.message);

    return { ok: true as const, promotedProductId: inserted.id, health: probe.status };
  });

export { slotKey };
