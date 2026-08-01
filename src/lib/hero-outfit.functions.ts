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
import { APPROVED_RETAILERS } from "./yacht-day-pilot.functions";
import { normalizeDestinationSlug, normalizeMomentSlug } from "./moment-slug";

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
  "hat", "hair", "necklace_or_bracelet",
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
    // Mark any previously-selected sibling as `replaced` (memory-preserving)
    // and clear its selection flag — the Founder will not see it again unless
    // they toggle "Show rejected/archived".
    await db
      .from("buying_candidates")
      .update({ selected_for_look: false, status: "replaced" })
      .eq("hero_outfit_id", data.outfitId)
      .eq("stylist_slot", data.slot)
      .eq("selected_for_look", true);
    if (data.candidateId) {
      const r = await db
        .from("buying_candidates")
        .update({ selected_for_look: true, status: "selected" })
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

    // URL hygiene: refuse to publish a selected product that has no real
    // shopping URL (search-engine fallback or AFF- placeholder). Founder
    // must paste a real retailer URL before publishing.
    const isUsable = (u: string | null | undefined): u is string => {
      if (!u) return false;
      if (u.startsWith("AFF-")) return false;
      try {
        const url = new URL(u);
        if (url.hostname.endsWith("google.com") && url.pathname.startsWith("/search")) return false;
        if (url.hostname.endsWith("bing.com") && url.pathname.startsWith("/search")) return false;
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    };
    const offenders: string[] = [];
    const customs = ((outfit.data.custom_components ?? []) as CustomComponent[]) || [];
    const hero_urls = [...heroes, ...accessories].map((c) => {
      const url = c.affiliate_url ?? c.product_url ?? "";
      if (!isUsable(url)) {
        offenders.push(
          `${c.stylist_slot ?? c.category ?? "slot"}: ${c.brand ?? ""} ${c.product_name ?? ""}`.trim(),
        );
      }
      return {
        brand: c.brand ?? "",
        url,
        product_url: c.product_url ?? null,
        affiliate_url: c.affiliate_url ?? null,
        retailer: c.retailer ?? null,
        price: c.price ?? null,
        currency: c.currency ?? null,
        image_url: c.image_url ?? null,
        product_name: c.product_name ?? "",
        category: c.stylist_slot ?? c.category ?? "hero",
        role: c.is_hero_garment ? "Hero Garment" : "Accessory",
      };
    });
    // Append Founder-defined Optional Components — these render under
    // "Complete the Look" on the public moment page. Same URL hygiene.
    for (const c of customs) {
      const url = c.url;
      if (!isUsable(url)) {
        offenders.push(`optional: ${c.brand ?? ""} ${c.name}`.trim());
        continue;
      }
      hero_urls.push({
        brand: c.brand ?? "",
        url,
        product_url: url,
        affiliate_url: null,
        retailer: null,
        price: c.price ?? null,
        currency: c.currency ?? null,
        image_url: c.image_url ?? null,
        product_name: c.name,
        category: c.name.toLowerCase(),
        role: "Optional",
      });
    }
    if (offenders.length > 0) {
      throw new Error(
        "Cannot publish: the following selected products are missing a real retailer URL. " +
          "Paste an exact product URL (Affiliate > Product > Retailer) before publishing.\n• " +
          offenders.join("\n• "),
      );
    }

    const destSlug = normalizeDestinationSlug(outfit.data.destination);
    const momentSlug = normalizeMomentSlug(outfit.data.moment);
    const slug = `${destSlug}-${momentSlug}-look-${outfit.data.id.slice(0, 8)}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const look = await db
      .from("founder_looks")
      .insert({
        slug,
        title: data.title ?? outfit.data.title ?? `${outfit.data.moment} — ${outfit.data.primary_brand ?? "Founder Look"}`,
        // Canonical slugs — downstream `/portofino/$moment` resolver and
        // founder_reference_products tag matching key off these exact values.
        destination: destSlug,
        moment: momentSlug,
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

// ──────────────────────────────────────────────────────────
// Stage 7 — Regenerate slot with AI (Lovable AI Gateway)
// ──────────────────────────────────────────────────────────

type AISuggestion = {
  brand: string;
  retailer: string;
  product_name: string;
  category: string;
  color?: string;
  estimated_price?: number | null;
  editorial_score: number; // 0–100
  founder_similarity: number; // 0–100
  why_works: string;
  why_fits: string;
};

async function callGeminiJSON(system: string, user: string): Promise<unknown> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429) throw new Error("AI gateway rate limit — try again in a moment.");
  if (res.status === 402) throw new Error("AI gateway credits exhausted.");
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  try {
    return JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
  } catch {
    return {};
  }
}

export const regenerateSlotWithAI = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        outfitId: z.string().uuid(),
        slot: z.enum(VALID_SLOTS),
        count: z.number().int().min(2).max(8).default(6),
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
      .select(
        "id, brand, retailer, product_name, category, color, is_hero_garment, stylist_slot, selected_for_look, image_url, product_url",
      )
      .eq("hero_outfit_id", data.outfitId);
    if (cands.error) throw new Error(cands.error.message);

    const heroes = (cands.data ?? []).filter((c) => c.is_hero_garment);
    if (heroes.length === 0) {
      throw new Error("Promote the Hero Outfit before regenerating slot candidates.");
    }
    const otherFilled = (cands.data ?? []).filter(
      (c) => !c.is_hero_garment && c.selected_for_look && c.stylist_slot !== data.slot,
    );

    // Approved brands registry (curation source of truth).
    const brandsQ = await db
      .from("brand_intelligence")
      .select("brand, suggested_activities")
      .eq("status", "approved");
    const approvedBrands = (brandsQ.data ?? []).map((b) => b.brand).filter(Boolean);

    const palette = (outfit.data.color_palette as string[] | null) ?? [];
    const dna = (outfit.data.editorial_dna as Record<string, unknown> | null) ?? {};

    const system = `You are the Resort Edit Stylist Engine — a luxury personal stylist who completes outfits around a locked Founder Hero Outfit. The Hero Garments are non-negotiable; you ONLY recommend the requested accessory slot.

RULES:
- Recommend brands ONLY from the approved list provided.
- Recommend retailers ONLY from: ${APPROVED_RETAILERS.join(", ")}.
- No logo-heavy bags, no sporty/athletic silhouettes, no Scandi minimalism unless the brief asks for it.
- Warm gold over silver for jewelry; raffia/handwoven/leather over synthetic.
- Each recommendation must explain (a) why it works with the Hero Outfit and (b) why it fits the moment.
- Score editorial_score (0–100) for how PORTER/Moda Operandi-worthy it reads.
- Score founder_similarity (0–100) for how close it sits to the Founder's editorial DNA (palette, fabric, mood).

Return JSON: { "suggestions": [ { brand, retailer, product_name, category, color, estimated_price, editorial_score, founder_similarity, why_works, why_fits } ] } with exactly ${data.count} suggestions.`;

    const heroText = heroes
      .map(
        (h) =>
          `• ${h.brand ?? "?"} — ${h.product_name ?? h.category ?? "garment"}${h.color ? ` (${h.color})` : ""}`,
      )
      .join("\n");
    const filledText = otherFilled.length
      ? otherFilled
          .map((c) => `• ${c.stylist_slot}: ${c.brand ?? "?"} — ${c.product_name ?? ""}`)
          .join("\n")
      : "(none yet)";

    const user = `DESTINATION: ${outfit.data.destination}
MOMENT: ${outfit.data.moment}
SLOT TO FILL: ${data.slot}

LOCKED HERO OUTFIT (do NOT modify):
${heroText}

OTHER SELECTED ACCESSORIES:
${filledText}

COLOR PALETTE: ${palette.join(", ") || "(open)"}
SILHOUETTE: ${outfit.data.silhouette ?? "(open)"}
ACTIVITY: ${outfit.data.activity ?? outfit.data.moment}
EDITORIAL DNA: ${JSON.stringify(dna).slice(0, 600)}
FOUNDER NOTES: ${(outfit.data.founder_notes ?? "").slice(0, 600)}

APPROVED BRANDS (pick only from these):
${approvedBrands.join(", ")}

Return ${data.count} candidates for the "${data.slot}" slot.`;

    const parsed = (await callGeminiJSON(system, user)) as {
      suggestions?: AISuggestion[];
    };
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, data.count) : [];
    if (suggestions.length === 0) throw new Error("AI returned no suggestions — try again.");

    const inserted: Record<string, unknown>[] = [];
    const runId = crypto.randomUUID();

    // Archive any prior AI suggestions for this slot — only the latest
    // generation should be visible. Founder selections (status='selected'
    // or selected_for_look=true) are preserved untouched.
    await db
      .from("buying_candidates")
      .update({ status: "replaced" })
      .eq("hero_outfit_id", data.outfitId)
      .eq("stylist_slot", data.slot)
      .eq("stylist_source", "ai")
      .eq("selected_for_look", false)
      .neq("status", "rejected");

    for (let i = 0; i < suggestions.length; i++) {
      const s = suggestions[i];
      // Build a clickable retailer search URL so the founder can locate the piece.
      const q = encodeURIComponent(`${s.brand} ${s.product_name}`);
      const retailer = APPROVED_RETAILERS.includes(s.retailer as never)
        ? s.retailer
        : "net-a-porter.com";
      // AI suggestions are starting points, not real retailer URLs.
      // Persist a placeholder marker (AFF- prefix → filtered by the public
      // page) so this candidate cannot accidentally publish as a real link,
      // and stash the search URL in notes for the founder's lookup workflow.
      const productUrl = `AFF-AI-${runId}-${i}`;
      const searchHelper = `https://www.google.com/search?q=site%3A${retailer}+${q}`;

      const editorial = Math.max(0, Math.min(10, (s.editorial_score ?? 0) / 10));
      const similarity = Math.max(0, Math.min(1, (s.founder_similarity ?? 0) / 100));

      const ins = await db
        .from("buying_candidates")
        .insert({
          session_id: outfit.data.session_id,
          hero_outfit_id: data.outfitId,
          source: "ai_recommendation",
          source_adapter: "lovable_ai",
          import_type: "shopping",
          product_url: productUrl,
          canonical_url: productUrl,
          affiliate_url: null,
          affiliate_status: "pending",
          retailer,
          brand: s.brand,
          product_name: s.product_name,
          category: s.category ?? data.slot,
          color: s.color ?? null,
          price: s.estimated_price ?? null,
          currency: s.estimated_price ? "USD" : null,
          image_url: null,
          image_missing: true,
          description: null,
          notes: `${s.why_works}\n\nWhy it fits: ${s.why_fits}\n\nLookup: ${searchHelper}`,
          editorial_score: editorial,
          benchmark_similarity: similarity,
          ranking_reasons: {
            why_works: s.why_works,
            why_fits: s.why_fits,
            ai_run_id: runId,
          } as never,
          raw: { ai_suggestion: s } as never,
          status: "review",
          stylist_slot: data.slot,
          stylist_source: "ai",
          is_hero_garment: false,
        })
        .select()
        .single();
      if (!ins.error && ins.data) inserted.push(ins.data as Record<string, unknown>);
    }

    return { inserted: inserted.length };
  });

export const rejectSlotCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...pw, candidateId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const db = await admin();
    const r = await db
      .from("buying_candidates")
      .update({ status: "rejected", selected_for_look: false })
      .eq("id", data.candidateId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true as const };
  });

// ──────────────────────────────────────────────────────────
// Custom Optional Components — flexible per-look additions
// (Suitcase, belt, beach towel, shawl, watch, anything else).
// Stored as a jsonb array on founder_hero_outfits.custom_components.
// ──────────────────────────────────────────────────────────

type CustomComponent = {
  id: string;
  name: string;
  url: string;
  image_url?: string | null;
  price?: number | null;
  currency?: string | null;
  brand?: string | null;
  notes?: string | null;
};

const customComponentSchema = z.object({
  name: z.string().min(1).max(120),
  url: z.string().url().refine(isHttpUrl, { message: "URL must use http or https" }),
  image_url: z.string().url().refine(isHttpUrl, { message: "URL must use http or https" }).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(8).nullable().optional(),
  brand: z.string().max(120).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

async function readCustomComponents(outfitId: string): Promise<CustomComponent[]> {
  const db = await admin();
  const r = await db
    .from("founder_hero_outfits")
    .select("custom_components")
    .eq("id", outfitId)
    .single();
  if (r.error) throw new Error(r.error.message);
  const raw = r.data?.custom_components;
  return Array.isArray(raw) ? (raw as CustomComponent[]) : [];
}

async function writeCustomComponents(outfitId: string, items: CustomComponent[]) {
  const db = await admin();
  const r = await db
    .from("founder_hero_outfits")
    .update({ custom_components: items as never })
    .eq("id", outfitId);
  if (r.error) throw new Error(r.error.message);
}

export const addCustomComponent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...pw, outfitId: z.string().uuid(), component: customComponentSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const items = await readCustomComponents(data.outfitId);
    const next: CustomComponent = { id: crypto.randomUUID(), ...data.component };
    items.push(next);
    await writeCustomComponents(data.outfitId, items);
    return { ok: true as const, component: next };
  });

export const updateCustomComponent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...pw,
        outfitId: z.string().uuid(),
        componentId: z.string().min(1),
        patch: customComponentSchema.partial(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const items = await readCustomComponents(data.outfitId);
    const idx = items.findIndex((i) => i.id === data.componentId);
    if (idx < 0) throw new Error("Custom component not found.");
    items[idx] = { ...items[idx], ...data.patch } as CustomComponent;
    await writeCustomComponents(data.outfitId, items);
    return { ok: true as const, component: items[idx] };
  });

export const removeCustomComponent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ ...pw, outfitId: z.string().uuid(), componentId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const items = (await readCustomComponents(data.outfitId)).filter(
      (i) => i.id !== data.componentId,
    );
    await writeCustomComponents(data.outfitId, items);
    return { ok: true as const };
  });