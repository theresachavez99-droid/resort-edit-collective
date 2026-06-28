/**
 * Founder Hero Outfit — server functions (Buying Office V2).
 *
 * Owns the Stages 3–8 workflow:
 *   3. Import Hero Garments  (auto-detect coordinated sets)
 *   4. Review Hero Outfit    (group / split / edit)
 *   5. Promote Hero Outfit   (lock garments — never replaced)
 *   6. Build Complete Outfit (AI suggestions per missing slot)
 *   7. Founder Reviews picks (select / paste / regenerate / clear)
 *   8. Publish Founder Look  (required-slot validation)
 *
 * Admin-password gated via the same ADMIN_PASSWORD pattern. Reads/writes
 * use the service-role client (Buying Office tables are deny-all RLS).
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import { isHttpUrl } from "./safe-url";
import {
  normalizeManualRow,
  canonicalizeUrl,
  type ManualImportRow,
} from "./product-search/manual-import-provider.server";
import {
  detectCoordinatedOutfits,
  type GarmentLike,
} from "./hero-outfit-detection";
import {
  slotsForMoment,
  validateForPublish,
  isHeroGarmentCategory,
} from "./hero-outfit-slots";

const pw = { password: z.string().min(1).max(200) };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// ──────────────────────────────────────────────────────────
// Read: workspace bundle for the Hero Outfit Studio UI
// ──────────────────────────────────────────────────────────

export const getHeroOutfitWorkspace = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...pw, sessionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const s = await db
      .from("buying_search_sessions")
      .select("*")
      .eq("id", data.sessionId)
      .single();
    if (s.error) throw new Error(s.error.message);

    const outfitsQ = await db
      .from("founder_hero_outfits")
      .select("*")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true });
    if (outfitsQ.error) throw new Error(outfitsQ.error.message);

    const candsQ = await db
      .from("buying_candidates")
      .select("*")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true });
    if (candsQ.error) throw new Error(candsQ.error.message);

    return {
      session: s.data,
      outfits: outfitsQ.data ?? [],
      candidates: candsQ.data ?? [],
    };
  });

// ──────────────────────────────────────────────────────────
// Stage 3 — Import Hero Garment URLs
// ──────────────────────────────────────────────────────────

export const importHeroGarments = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        sessionId: z.string().uuid(),
        urls: z
          .array(z.string().url().refine(isHttpUrl, { message: "URL must use http or https" }))
          .min(1)
          .max(20),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();

    // Pull session for destination/moment context.
    const sess = await db
      .from("buying_search_sessions")
      .select("destination, moment")
      .eq("id", data.sessionId)
      .single();
    if (sess.error) throw new Error(sess.error.message);
    const destination = sess.data.destination;
    const moment = sess.data.moment;

    // Dedupe by canonical URL.
    const seen = new Set<string>();
    const rows: ManualImportRow[] = [];
    for (const u of data.urls) {
      const key = canonicalizeUrl(u);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ product_url: u });
    }

    // Normalize + insert each garment as a hero candidate.
    const insertedIds: string[] = [];
    const failures: { url: string; reason: string }[] = [];
    for (const row of rows) {
      try {
        const norm = await normalizeManualRow(row, "url_paste");
        const ins = await db
          .from("buying_candidates")
          .upsert(
            {
              session_id: data.sessionId,
              source: norm.source,
              source_adapter: norm.source_adapter,
              import_type: "shopping",
              product_url: norm.product_url,
              canonical_url: norm.canonical_url,
              affiliate_url: norm.affiliate_url,
              affiliate_status: norm.affiliate_status,
              retailer: norm.retailer,
              brand: norm.brand,
              product_name: norm.product_name,
              category: norm.category,
              color: norm.color,
              price: norm.price,
              currency: norm.currency,
              image_url: norm.image_url,
              image_missing: norm.image_missing,
              description: norm.description,
              notes: norm.notes,
              raw: norm.raw as never,
              status: "review",
              is_hero_garment: true,
              stylist_source: "founder_url",
            },
            { onConflict: "session_id,canonical_url" },
          )
          .select("id")
          .single();
        if (ins.error) failures.push({ url: row.product_url, reason: ins.error.message });
        else insertedIds.push(ins.data.id);
      } catch (e) {
        failures.push({ url: row.product_url, reason: (e as Error).message });
      }
    }

    // Re-read full rows for the just-imported garments.
    const fresh = await db
      .from("buying_candidates")
      .select("id, brand, retailer, product_name, color, description, category")
      .in("id", insertedIds);
    if (fresh.error) throw new Error(fresh.error.message);
    const garments = (fresh.data ?? []) as GarmentLike[];

    // Detect coordinated outfit(s) within THIS import batch.
    const detected = detectCoordinatedOutfits(garments);

    const createdOutfits: string[] = [];
    for (const cluster of detected) {
      const outfitIns = await db
        .from("founder_hero_outfits")
        .insert({
          session_id: data.sessionId,
          destination,
          moment,
          primary_brand: cluster.primaryBrand,
          retailers: cluster.retailers,
          color_palette: cluster.sharedColors,
          editorial_dna: {
            shared_colors: cluster.sharedColors,
            shared_fabric: cluster.sharedFabric,
            garment_count: cluster.garmentIds.length,
          } as never,
          status: "draft",
        })
        .select("id")
        .single();
      if (outfitIns.error) continue;
      const outfitId = outfitIns.data.id;
      createdOutfits.push(outfitId);
      await db
        .from("buying_candidates")
        .update({ hero_outfit_id: outfitId })
        .in("id", cluster.garmentIds);
    }

    return {
      imported: insertedIds.length,
      failures,
      outfitsCreated: createdOutfits.length,
      outfitIds: createdOutfits,
    };
  });

// ──────────────────────────────────────────────────────────
// Stage 4 — Manual grouping controls
// ──────────────────────────────────────────────────────────

export const groupGarmentsIntoOutfit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        sessionId: z.string().uuid(),
        garmentIds: z.array(z.string().uuid()).min(1).max(10),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const sess = await db
      .from("buying_search_sessions")
      .select("destination, moment")
      .eq("id", data.sessionId)
      .single();
    if (sess.error) throw new Error(sess.error.message);
    const garments = await db
      .from("buying_candidates")
      .select("brand, retailer, color")
      .in("id", data.garmentIds);
    const primaryBrand = garments.data?.[0]?.brand ?? null;
    const retailers = Array.from(
      new Set((garments.data ?? []).map((g) => g.retailer).filter((r): r is string => !!r)),
    );
    const outfitIns = await db
      .from("founder_hero_outfits")
      .insert({
        session_id: data.sessionId,
        destination: sess.data.destination,
        moment: sess.data.moment,
        primary_brand: primaryBrand,
        retailers,
        status: "draft",
      })
      .select("id")
      .single();
    if (outfitIns.error) throw new Error(outfitIns.error.message);
    await db
      .from("buying_candidates")
      .update({ hero_outfit_id: outfitIns.data.id, is_hero_garment: true })
      .in("id", data.garmentIds);
    return { outfitId: outfitIns.data.id };
  });

export const addGarmentToOutfit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        outfitId: z.string().uuid(),
        garmentId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const r = await db
      .from("buying_candidates")
      .update({ hero_outfit_id: data.outfitId, is_hero_garment: true })
      .eq("id", data.garmentId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true as const };
  });

export const removeGarmentFromOutfit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...pw, garmentId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const r = await db
      .from("buying_candidates")
      .update({ hero_outfit_id: null })
      .eq("id", data.garmentId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true as const };
  });

/**
 * Patch any garment field — image_url, brand, name, color, etc.
 * Used when og:image extraction failed and the Founder pastes a URL
 * manually (clarification #3 — images never block promotion).
 */
export const patchHeroGarment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        garmentId: z.string().uuid(),
        patch: z.object({
          brand: z.string().max(120).nullable().optional(),
          product_name: z.string().max(300).nullable().optional(),
          image_url: z
            .string()
            .url()
            .refine(isHttpUrl, { message: "URL must use http or https" })
            .nullable()
            .optional(),
          color: z.string().max(80).nullable().optional(),
          category: z.string().max(120).nullable().optional(),
          price: z.number().nonnegative().nullable().optional(),
          notes: z.string().max(2000).nullable().optional(),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const patch: Record<string, unknown> = { ...data.patch };
    if ("image_url" in patch) patch.image_missing = !patch.image_url;
    const r = await db
      .from("buying_candidates")
      .update(patch as never)
      .eq("id", data.garmentId)
      .select()
      .single();
    if (r.error) throw new Error(r.error.message);
    return { candidate: r.data };
  });

export const patchHeroOutfit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        outfitId: z.string().uuid(),
        patch: z.object({
          title: z.string().max(200).nullable().optional(),
          look_number: z.number().int().nullable().optional(),
          preview_image_url: z
            .string()
            .url()
            .refine(isHttpUrl, { message: "URL must use http or https" })
            .nullable()
            .optional(),
          silhouette: z.string().max(120).nullable().optional(),
          activity: z.string().max(120).nullable().optional(),
          founder_notes: z.string().max(2000).nullable().optional(),
          color_palette: z.array(z.string().max(40)).optional(),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const r = await db
      .from("founder_hero_outfits")
      .update(data.patch as never)
      .eq("id", data.outfitId)
      .select()
      .single();
    if (r.error) throw new Error(r.error.message);
    return { outfit: r.data };
  });

// ──────────────────────────────────────────────────────────
// Stage 5 — Promote Hero Outfit
// ──────────────────────────────────────────────────────────

export const promoteHeroOutfit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...pw, outfitId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();

    const outfit = await db
      .from("founder_hero_outfits")
      .select("*")
      .eq("id", data.outfitId)
      .single();
    if (outfit.error) throw new Error(outfit.error.message);

    const garments = await db
      .from("buying_candidates")
      .select("id, product_url, brand")
      .eq("hero_outfit_id", data.outfitId);
    if (garments.error) throw new Error(garments.error.message);
    if ((garments.data ?? []).length === 0) {
      throw new Error("Hero Outfit must contain at least one garment before promotion.");
    }
    // URL validity is enforced at import time. Images are NOT required
    // (clarification #3 — show missing fields, do not block).
    for (const g of garments.data ?? []) {
      if (!g.product_url) throw new Error("Every Hero garment needs a product URL.");
    }

    const r = await db
      .from("founder_hero_outfits")
      .update({ status: "promoted", promoted_at: new Date().toISOString() })
      .eq("id", data.outfitId)
      .select()
      .single();
    if (r.error) throw new Error(r.error.message);

    // Mark every hero garment as "founder_hero" status for traceability.
    await db
      .from("buying_candidates")
      .update({ status: "founder_hero", selected_for_look: true })
      .eq("hero_outfit_id", data.outfitId);

    return { outfit: r.data };
  });

// ──────────────────────────────────────────────────────────
// Stage 6/7 — Slot management (manual + AI)
// ──────────────────────────────────────────────────────────

const VALID_SLOTS = [
  "shoes", "bag", "sunglasses", "earrings", "necklace", "bracelet",
  "ring", "hat", "hair", "necklace_or_bracelet",
] as const;

/**
 * Returns the list of required + optional slots for a Hero Outfit,
 * annotated with what's already filled (by a Hero garment or by a
 * selected accessory candidate).
 */
export const getOutfitSlotPlan = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...pw, outfitId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const outfit = await db
      .from("founder_hero_outfits")
      .select("moment")
      .eq("id", data.outfitId)
      .single();
    if (outfit.error) throw new Error(outfit.error.message);
    const slots = slotsForMoment(outfit.data.moment);

    const garments = await db
      .from("buying_candidates")
      .select("id, category, is_hero_garment, stylist_slot, selected_for_look")
      .eq("hero_outfit_id", data.outfitId);
    if (garments.error) throw new Error(garments.error.message);

    const filled = new Set<string>();
    for (const g of garments.data ?? []) {
      if (g.is_hero_garment && isHeroGarmentCategory(g.category)) continue;
      if (g.selected_for_look && g.stylist_slot) filled.add(g.stylist_slot);
    }
    const plan = slots.map((s) => ({
      ...s,
      filled: filled.has(s.slot),
    }));
    return { plan, moment: outfit.data.moment };
  });

/**
 * Founder pastes a URL for a specific slot. Same normalization path
 * as the Hero import. New candidate is tagged with the outfit + slot
 * and stylist_source='founder_url'.
 */
export const addManualSlotCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        outfitId: z.string().uuid(),
        slot: z.enum(VALID_SLOTS),
        url: z.string().url().refine(isHttpUrl, { message: "URL must use http or https" }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const outfit = await db
      .from("founder_hero_outfits")
      .select("session_id")
      .eq("id", data.outfitId)
      .single();
    if (outfit.error) throw new Error(outfit.error.message);

    const norm = await normalizeManualRow({ product_url: data.url }, "url_paste");
    const ins = await db
      .from("buying_candidates")
      .upsert(
        {
          session_id: outfit.data.session_id,
          hero_outfit_id: data.outfitId,
          source: norm.source,
          source_adapter: norm.source_adapter,
          import_type: "shopping",
          product_url: norm.product_url,
          canonical_url: norm.canonical_url,
          affiliate_url: norm.affiliate_url,
          affiliate_status: norm.affiliate_status,
          retailer: norm.retailer,
          brand: norm.brand,
          product_name: norm.product_name,
          category: norm.category ?? data.slot,
          color: norm.color,
          price: norm.price,
          currency: norm.currency,
          image_url: norm.image_url,
          image_missing: norm.image_missing,
          description: norm.description,
          notes: norm.notes,
          raw: norm.raw as never,
          status: "review",
          stylist_slot: data.slot,
          stylist_source: "founder_url",
          is_hero_garment: false,
        },
        { onConflict: "session_id,canonical_url" },
      )
      .select()
      .single();
    if (ins.error) throw new Error(ins.error.message);
    return { candidate: ins.data };
  });

export const selectSlotCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        outfitId: z.string().uuid(),
        slot: z.enum(VALID_SLOTS),
        candidateId: z.string().uuid().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    // Clear sibling selections in the same slot.
    await db
      .from("buying_candidates")
      .update({ selected_for_look: false })
      .eq("hero_outfit_id", data.outfitId)
      .eq("stylist_slot", data.slot);
    if (data.candidateId) {
      const r = await db
        .from("buying_candidates")
        .update({ selected_for_look: true })
        .eq("id", data.candidateId);
      if (r.error) throw new Error(r.error.message);
    }
    return { ok: true as const };
  });

export const clearSlotCandidates = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        outfitId: z.string().uuid(),
        slot: z.enum(VALID_SLOTS),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const r = await db
      .from("buying_candidates")
      .delete()
      .eq("hero_outfit_id", data.outfitId)
      .eq("stylist_slot", data.slot);
    if (r.error) throw new Error(r.error.message);
    return { ok: true as const };
  });

// ──────────────────────────────────────────────────────────
// Stage 8 — Publish Founder Look
// ──────────────────────────────────────────────────────────

export const validateHeroOutfitForPublish = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...pw, outfitId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const outfit = await db
      .from("founder_hero_outfits")
      .select("moment")
      .eq("id", data.outfitId)
      .single();
    if (outfit.error) throw new Error(outfit.error.message);
    const garments = await db
      .from("buying_candidates")
      .select("stylist_slot, selected_for_look, is_hero_garment")
      .eq("hero_outfit_id", data.outfitId);
    if (garments.error) throw new Error(garments.error.message);
    const filled = new Set<string>();
    for (const g of garments.data ?? []) {
      if (g.selected_for_look && g.stylist_slot) filled.add(g.stylist_slot);
    }
    const v = validateForPublish(outfit.data.moment, filled);
    const heroCount = (garments.data ?? []).filter((g) => g.is_hero_garment).length;
    return {
      ok: v.ok && heroCount > 0,
      missing: v.missing,
      profile: v.profile,
      heroGarmentCount: heroCount,
    };
  });

export const publishFounderLookFromOutfit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        outfitId: z.string().uuid(),
        title: z.string().max(200).optional(),
        notes: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();

    const outfit = await db
      .from("founder_hero_outfits")
      .select("*")
      .eq("id", data.outfitId)
      .single();
    if (outfit.error) throw new Error(outfit.error.message);

    const cands = await db
      .from("buying_candidates")
      .select("*")
      .eq("hero_outfit_id", data.outfitId);
    if (cands.error) throw new Error(cands.error.message);

    const filled = new Set<string>();
    for (const c of cands.data ?? []) {
      if (c.selected_for_look && c.stylist_slot) filled.add(c.stylist_slot);
    }
    const validation = validateForPublish(outfit.data.moment, filled);
    const heroes = (cands.data ?? []).filter((c) => c.is_hero_garment && c.selected_for_look);
    if (heroes.length === 0) {
      throw new Error("Cannot publish: no Hero garments are selected for the look.");
    }
    if (!validation.ok) {
      throw new Error(
        "Cannot publish: missing required slots — " +
          validation.missing.map((s) => s.label).join(", "),
      );
    }

    // Compose hero_urls payload for founder_looks (existing schema).
    const accessories = (cands.data ?? []).filter(
      (c) => !c.is_hero_garment && c.selected_for_look,
    );
    const hero_urls = [...heroes, ...accessories].map((c) => ({
      brand: c.brand ?? "",
      url: c.affiliate_url ?? c.product_url,
      image_url: c.image_url ?? null,
      product_name: c.product_name ?? "",
      category: c.stylist_slot ?? c.category ?? "hero",
      role: c.is_hero_garment ? "Hero Garment" : "Accessory",
    }));

    const slug = `${outfit.data.destination}-${outfit.data.moment}-look-${outfit.data.id.slice(0, 8)}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const look = await db
      .from("founder_looks")
      .insert({
        slug,
        title: data.title ?? outfit.data.title ?? `${outfit.data.moment} — ${outfit.data.primary_brand ?? "Founder Look"}`,
        destination: outfit.data.destination,
        moment: outfit.data.moment,
        style_family: (outfit.data.color_palette ?? []) as never,
        hero_urls: hero_urls as never,
        color_palette: { include: outfit.data.color_palette ?? [] } as never,
        positive_rules: {} as never,
        negative_rules: {} as never,
        accessory_philosophy: null,
        luxury_level: "editorial",
        founder_notes: data.notes ?? outfit.data.founder_notes ?? null,
        status: "approved",
      })
      .select("id")
      .single();
    if (look.error) throw new Error(look.error.message);

    // Trigger the existing publish_founder_look RPC to write references + brand intel.
    const rpc = await db.rpc("publish_founder_look", { look_id: look.data.id });
    if (rpc.error) throw new Error(rpc.error.message);

    await db
      .from("founder_hero_outfits")
      .update({
        status: "published",
        founder_look_id: look.data.id,
        published_at: new Date().toISOString(),
      })
      .eq("id", data.outfitId);

    return { ok: true as const, founderLookId: look.data.id };
  });