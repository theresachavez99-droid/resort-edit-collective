/**
 * Founder Look Builder — server functions.
 *
 * The Founder Look is the source of truth for the editorial direction
 * of a destination + moment. Approving / publishing a look:
 *   1. Upserts one founder_reference_products row per hero URL.
 *   2. Approves each hero brand in brand_intelligence.
 *   3. Makes the look immediately available to the Stylist Engine
 *      (which auto-resolves the latest approved/published look at
 *      generation time when none is named explicitly).
 *
 * No SQL is required from the Founder once a look is saved.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import { isHttpUrl } from "./safe-url";

const pw = z.string().min(1).max(200);
const httpUrl = z
  .string()
  .url()
  .refine(isHttpUrl, { message: "URL must use http or https" });

const heroUrlSchema = z.object({
  url: httpUrl,
  brand: z.string().min(1).max(120),
  product_name: z.string().max(240).nullable().optional(),
  category: z.string().max(80).default("other"),
  role: z.string().max(80).default("Hero Garment"),
  image_url: httpUrl.nullable().optional(),
});

const rulesSchema = z
  .record(z.string().min(1).max(60), z.array(z.string().min(1).max(120)).max(40))
  .default({});

const lookCommon = {
  title: z.string().min(2).max(200),
  destination: z.string().min(1).max(80),
  moment: z.string().min(1).max(120),
  style_family: z.array(z.string().min(1).max(80)).max(20).default([]),
  hero_urls: z.array(heroUrlSchema).max(20).default([]),
  activity_sequence: z.array(z.string().min(1).max(120)).max(20).default([]),
  color_palette: z
    .object({
      include: z.array(z.string().min(1).max(40)).max(40).default([]),
      exclude: z.array(z.string().min(1).max(40)).max(40).default([]),
    })
    .default({ include: [], exclude: [] }),
  positive_rules: rulesSchema,
  negative_rules: rulesSchema,
  editorial_dna: z.string().max(4000).nullable().optional(),
  hero_philosophy: z.string().max(2000).nullable().optional(),
  founder_notes: z.string().max(4000).nullable().optional(),
  accessory_philosophy: z.string().max(4000).nullable().optional(),
  visual_weight: z.enum(["hero-dominant", "balanced", "accessory-led"]).default("hero-dominant"),
  luxury_level: z.enum(["editorial", "heritage", "mass-luxury"]).default("editorial"),
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/* ─────────────────────────────────────────────────────────────────── */
/* CRUD                                                                */
/* ─────────────────────────────────────────────────────────────────── */

export const listFounderLooks = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        destination: z.string().max(80).nullable().optional(),
        moment: z.string().max(120).nullable().optional(),
        status: z.enum(["draft", "approved", "published", "retired"]).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("founder_looks")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (data.destination) q = q.eq("destination", data.destination);
    if (data.moment) q = q.eq("moment", data.moment);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, looks: rows ?? [] };
  });

export const getFounderLook = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("founder_looks")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) return { ok: false as const, error: error.message };
    if (!row) return { ok: false as const, error: "not_found" };
    return { ok: true as const, look: row };
  });

export const saveFounderLook = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        id: z.string().uuid().nullable().optional(),
        slug: z.string().min(2).max(80).nullable().optional(),
        status: z.enum(["draft", "approved", "published", "retired"]).default("draft"),
        ...lookCommon,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Auto-enrich hero pieces with og:image so locked Founder Hero cards
    // render in the Blind A/B studio. This runs at save time so the
    // expensive HTML fetches don't happen during outfit generation.
    const { enrichHeroUrlsWithImages } = await import("./og-image.server");
    const enriched = await enrichHeroUrlsWithImages(data.hero_urls);
    const slug = data.slug ?? slugify(`${data.destination}-${data.moment}-${data.title}`);
    const payload = {
      slug,
      title: data.title,
      destination: data.destination,
      moment: data.moment,
      style_family: data.style_family,
      hero_urls: enriched.heroUrls,
      activity_sequence: data.activity_sequence,
      color_palette: data.color_palette,
      positive_rules: data.positive_rules,
      negative_rules: data.negative_rules,
      editorial_dna: data.editorial_dna ?? null,
      hero_philosophy: data.hero_philosophy ?? null,
      founder_notes: data.founder_notes ?? null,
      accessory_philosophy: data.accessory_philosophy ?? null,
      visual_weight: data.visual_weight,
      luxury_level: data.luxury_level,
      status: data.status,
    };
    let id = data.id ?? null;
    if (id) {
      const { error } = await supabaseAdmin
        .from("founder_looks")
        .update(payload)
        .eq("id", id);
      if (error) return { ok: false as const, error: error.message };
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("founder_looks")
        .insert(payload)
        .select("id")
        .single();
      if (error) return { ok: false as const, error: error.message };
      id = row.id;
    }
    return { ok: true as const, id, slug, imageReport: enriched.report };
  });

/**
 * Explicit re-enrichment of an existing Founder Look's hero images.
 * Use when image extraction failed at save time (e.g. retailer was down)
 * or after editing hero URLs. Returns a per-URL diagnostic report so the
 * UI can surface exactly why any image is still missing.
 */
export const refreshFounderLookHeroImages = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        id: z.string().uuid(),
        force: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { enrichHeroUrlsWithImages } = await import("./og-image.server");
    const { data: row, error } = await supabaseAdmin
      .from("founder_looks")
      .select("hero_urls")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) {
      return { ok: false as const, error: error?.message ?? "not_found" };
    }
    const heroes = Array.isArray(row.hero_urls) ? row.hero_urls : [];
    // `force` clears existing image_url so every hero re-fetches.
    const seed = data.force
      ? heroes.map((h) => ({ ...(h as Record<string, unknown>), image_url: null }))
      : (heroes as Array<{ url?: string | null; image_url?: string | null }>);
    const enriched = await enrichHeroUrlsWithImages(
      seed as Array<{ url?: string | null; image_url?: string | null }>,
    );
    const { error: upErr } = await supabaseAdmin
      .from("founder_looks")
      .update({ hero_urls: enriched.heroUrls as never })
      .eq("id", data.id);
    if (upErr) return { ok: false as const, error: upErr.message };
    // Also update any matching founder_reference_products rows so accessory
    // discovery and learning loops see the same canonical image_url.
    for (const h of enriched.heroUrls) {
      const hh = h as { url?: string | null; image_url?: string | null };
      if (!hh.url || !hh.image_url) continue;
      try {
        await supabaseAdmin
          .from("founder_reference_products")
          .update({ image_url: hh.image_url })
          .eq("source_url", hh.url);
      } catch {
        // image_url column may not exist on the references table — non-fatal.
      }
    }
    return {
      ok: true as const,
      report: enriched.report,
      filled: enriched.report.filter((r) => r.ok && r.image_url).length,
      total: enriched.report.length,
    };
  });

/** Publish (or re-publish): runs the SQL pipeline that fans out to
 *  founder_reference_products + brand_intelligence. */
export const publishFounderLook = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Stamp status=published, then call the publish RPC.
    await supabaseAdmin
      .from("founder_looks")
      .update({ status: "published" })
      .eq("id", data.id);
    const { data: rpc, error } = await supabaseAdmin.rpc("publish_founder_look", {
      look_id: data.id,
    });
    if (error) return { ok: false as const, error: error.message };
    const row = Array.isArray(rpc) ? rpc[0] : rpc;
    return {
      ok: true as const,
      refsWritten: row?.refs_written ?? 0,
      brandsWritten: row?.brands_written ?? 0,
    };
  });

/* ─────────────────────────────────────────────────────────────────── */
/* Validation seed: Pool Lounging & Shopping (Alexandra Miro Pietra Rosa) */
/* ─────────────────────────────────────────────────────────────────── */

export const seedPoolLoungingValidationLook = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Clean up the prior manual Alexandra Miro seed so this Founder Look
    // owns the canonical references going forward. We retire (not delete)
    // legacy founder_reference_products rows that aren't linked to a look.
    const heroUrls = [
      "https://alexandramiro.com/collections/pietra-rosa/products/zella-swimsuit-red-capri",
      "https://alexandramiro.com/collections/pietra-rosa/products/jaimee-skirt-red-capri",
    ];
    await supabaseAdmin
      .from("founder_reference_products")
      .delete()
      .is("founder_look_id", null)
      .in("source_url", heroUrls);

    const payload = {
      slug: "portofino-pool-lounging-pietra-rosa",
      title: "Pool Lounging & Shopping — Pietra Rosa Hero",
      destination: "Portofino",
      moment: "Pool Lounging & Shopping",
      style_family: [
        "Mediterranean Glamour",
        "Italian Riviera",
        "Vintage Resort",
        "Dolce-inspired",
        "Quiet Luxury",
        "Editorial Resortwear",
      ],
      hero_urls: [
        {
          url: heroUrls[0],
          brand: "Alexandra Miro",
          product_name: "Zella Swimsuit — Red Capri",
          category: "swimwear",
          role: "Hero Garment",
        },
        {
          url: heroUrls[1],
          brand: "Alexandra Miro",
          product_name: "Jaimee Skirt — Red Capri",
          category: "coverup",
          role: "Hero Garment",
        },
      ],
      activity_sequence: [
        "Luxury hotel pool",
        "Lunch",
        "Walk into town",
        "Boutique shopping",
        "Gelato",
        "Return to hotel",
      ],
      color_palette: {
        include: [
          "tomato red",
          "warm ivory",
          "cream",
          "natural raffia",
          "warm camel",
          "honey",
          "olive",
          "warm gold",
        ],
        exclude: ["bright white", "black", "silver"],
      },
      positive_rules: {
        global: ["mediterranean", "vintage", "editorial", "quiet luxury", "handwoven"],
        bag: ["raffia", "handwoven", "natural", "structured", "minimal", "straw"],
        shoes: ["cream", "sand", "tan", "champagne", "leather", "espadrille", "flat"],
        jewelry: ["organic", "sculptural", "gold", "hammered", "shell", "coral", "vintage"],
        sunglasses: ["tortoise", "honey", "acetate", "oversized", "vintage", "italian"],
        hat: ["natural straw", "elegant", "brim"],
      },
      negative_rules: {
        global: ["mass luxury", "influencer", "trend", "viral", "tiktok"],
        bag: ["logo", "monogram", "canvas logo", "plastic", "sport tote", "tourist"],
        shoes: ["chunky", "sport", "platform", "oversized logo"],
        jewelry: ["sparkly", "department store", "thin chain", "silver", "starter"],
        sunglasses: ["sport", "wrap", "athletic", "shield", "futuristic"],
        hat: ["floppy", "cowboy", "ribbon dark", "logo"],
      },
      editorial_dna:
        "The Alexandra Miro print is the hero. Every accessory supports the print — none competes. Luxury comes from restraint. Reads like 'I checked into Splendido and walked from the pool into the boutiques.'",
      hero_philosophy:
        "Print is hero. Accessories must elevate, never overpower.",
      founder_notes:
        "Validation Founder Look for the Pool Lounging & Shopping moment.",
      accessory_philosophy:
        "Quiet luxury. Natural materials. Warm metals. No logos, no sport cues, no scandi minimal.",
      visual_weight: "hero-dominant" as const,
      luxury_level: "editorial" as const,
      status: "approved" as const,
    };

    // Upsert by slug.
    const { data: existing } = await supabaseAdmin
      .from("founder_looks")
      .select("id")
      .eq("slug", payload.slug)
      .maybeSingle();
    let id = existing?.id ?? null;
    if (id) {
      const { error } = await supabaseAdmin
        .from("founder_looks")
        .update(payload)
        .eq("id", id);
      if (error) return { ok: false as const, error: error.message };
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("founder_looks")
        .insert(payload)
        .select("id")
        .single();
      if (error) return { ok: false as const, error: error.message };
      id = row.id;
    }
    // Publish (fans out to references + brand_intelligence).
    const { data: rpc, error: rpcErr } = await supabaseAdmin.rpc(
      "publish_founder_look",
      { look_id: id },
    );
    if (rpcErr) return { ok: false as const, error: rpcErr.message };
    const r = Array.isArray(rpc) ? rpc[0] : rpc;
    return {
      ok: true as const,
      id,
      slug: payload.slug,
      refsWritten: r?.refs_written ?? 0,
      brandsWritten: r?.brands_written ?? 0,
    };
  });

/* ─────────────────────────────────────────────────────────────────── */
/* Blind A/B validation harness                                        */
/* ─────────────────────────────────────────────────────────────────── */

/** Persist the result of a blind A/B run so we can revisit how the
 *  Founder Learning side compared to the baseline. */
export const recordValidationRun = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        founder_look_id: z.string().uuid(),
        destination: z.string().min(1).max(80),
        moment: z.string().min(1).max(120),
        run_a: z.any(),
        run_b: z.any(),
        founder_side: z.enum(["A", "B"]),
        notes: z.string().max(4000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("founder_validation_runs")
      .insert({
        founder_look_id: data.founder_look_id,
        destination: data.destination,
        moment: data.moment,
        run_a: data.run_a as never,
        run_b: data.run_b as never,
        founder_side: data.founder_side,
        notes: data.notes ?? null,
      })
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, id: row.id };
  });
