import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

const STATUSES = ["pending", "approved", "archived"] as const;
const TIERS = ["hero", "discovery"] as const;

export const PRIMARY_CATEGORIES = [
  "swimwear",
  "dresses",
  "coverups",
  "shoes",
  "bags",
  "jewelry",
  "sunglasses",
] as const;

export const ACTIVITY_STRENGTHS = [
  "yacht-day",
  "beach-club",
  "market-morning",
  "harbor-aperitivo",
  "long-lunch",
  "sunset-cocktails",
  "statement-dinner",
] as const;

/**
 * Stylist Engine v4 — commerce source kinds and preference order.
 * Affiliate retailers are the default; brand-direct partnerships will
 * activate per-brand without engine changes when populated.
 */
export const COMMERCE_SOURCE_KINDS = ["affiliate_retailer", "brand_direct", "hybrid"] as const;

const commerceSourceEntry = z.object({
  kind: z.enum(COMMERCE_SOURCE_KINDS),
  retailers: z.array(z.string().min(1).max(120)).max(40).optional(),
  program: z.string().max(120).optional(),
  endpoint: z.string().max(500).nullable().optional(),
  status: z.enum(["active", "planned", "paused"]).default("active"),
});

const brandInput = z.object({
  name: z.string().min(1).max(160),
  website: z.string().url().max(2000).nullable().optional(),
  status: z.enum(STATUSES).default("pending"),
  tier: z.enum(TIERS).default("discovery"),
  categories: z.array(z.enum(PRIMARY_CATEGORIES)).max(PRIMARY_CATEGORIES.length).default([]),
  activities: z.array(z.enum(ACTIVITY_STRENGTHS)).max(ACTIVITY_STRENGTHS.length).default([]),
  notes: z.string().max(2000).nullable().optional(),
  why_we_love: z.string().max(2000).nullable().optional(),
  /** v4 — editorial destination strength (Mediterranean, Tropical, etc.). */
  destination_strength: z.array(z.string().min(1).max(80)).max(20).optional(),
  /** v4 — approved commerce channels for this brand. */
  commerce_sources: z.array(commerceSourceEntry).max(10).optional(),
  /** v4 — preferred channel when multiple are active. */
  preferred_commerce_source: z.enum(COMMERCE_SOURCE_KINDS).optional(),
});

export type BrandInput = z.infer<typeof brandInput>;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const listBrands = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        status: z.enum(STATUSES).nullable().optional(),
        category: z.enum(PRIMARY_CATEGORIES).nullable().optional(),
        tier: z.enum(TIERS).nullable().optional(),
        search: z.string().max(120).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("brands")
      .select("*")
      .order("name", { ascending: true })
      .limit(1000);
    if (data.status) q = q.eq("status", data.status);
    if (data.tier) q = q.eq("tier", data.tier);
    if (data.category) q = q.contains("categories", [data.category]);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, " ").trim();
      if (s.length) q = q.ilike("name", `%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true as const, rows: rows ?? [] };
  });

export const upsertBrand = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        id: z.string().uuid().optional(),
        brand: brandInput,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("brands")
        .update(data.brand)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id: data.id };
    }
    const slug = slugify(data.brand.name);
    const { data: inserted, error } = await supabaseAdmin
      .from("brands")
      .insert({ ...data.brand, slug })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true as const, id: inserted.id };
  });

export const setBrandStatus = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        id: z.string().uuid(),
        status: z.enum(STATUSES),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("brands")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteBrand = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200), id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("brands").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });