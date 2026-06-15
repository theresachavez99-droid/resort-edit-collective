import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

const APPROVAL_STATUSES = ["pending", "approved", "rejected", "archived"] as const;
const INVENTORY_STATUSES = ["in_stock", "low_stock", "out_of_stock", "unknown"] as const;

const tagArray = z.array(z.string().min(1).max(60)).max(40).default([]);

const vaultInput = z.object({
  product_name: z.string().min(1).max(300),
  brand: z.string().min(1).max(120),
  retailer: z.string().max(120).nullable().optional(),
  affiliate_url: z.string().url().max(2000),
  brand_url: z.string().url().max(2000).nullable().optional(),
  image_url: z.string().url().max(2000).nullable().optional(),
  thumbnail_url: z.string().url().max(2000).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(8).nullable().optional(),
  inventory_status: z.enum(INVENTORY_STATUSES).optional(),
  category: z.string().min(1).max(80),
  subcategory: z.string().max(80).nullable().optional(),
  destination_tags: tagArray,
  activity_tags: tagArray,
  color_tags: tagArray,
  print_tags: tagArray,
  material_tags: tagArray,
  silhouette_tags: tagArray,
  luxury_score: z.number().min(0).max(10).nullable().optional(),
  resort_edit_score: z.number().min(0).max(10).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  source_sourced_product_id: z.string().uuid().nullable().optional(),
});

export type VaultProductInput = z.infer<typeof vaultInput>;

export const listVaultProducts = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        status: z.enum(APPROVAL_STATUSES).nullable().optional(),
        category: z.string().max(80).nullable().optional(),
        search: z.string().max(120).nullable().optional(),
        limit: z.number().int().min(1).max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("vault_products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 500);
    if (data.status) q = q.eq("approval_status", data.status);
    if (data.category) q = q.eq("category", data.category);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, " ").trim();
      if (s.length) q = q.or(`product_name.ilike.%${s}%,brand.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true as const, rows: rows ?? [] };
  });

export const upsertVaultProduct = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        id: z.string().uuid().optional(),
        product: vaultInput,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data.product };
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("vault_products")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("vault_products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true as const, id: inserted.id };
  });

export const setVaultProductStatus = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        id: z.string().uuid(),
        approval_status: z.enum(APPROVAL_STATUSES),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: {
      approval_status: (typeof APPROVAL_STATUSES)[number];
      approved_at?: string;
      notes?: string | null;
    } = { approval_status: data.approval_status };
    if (data.approval_status === "approved") patch.approved_at = new Date().toISOString();
    if (data.notes !== undefined) patch.notes = data.notes;
    const { error } = await supabaseAdmin
      .from("vault_products")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const setVaultInventoryStatus = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        id: z.string().uuid(),
        inventory_status: z.enum(INVENTORY_STATUSES),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("vault_products")
      .update({
        inventory_status: data.inventory_status,
        last_verified_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteVaultProduct = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200), id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("vault_products")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const promoteSourcedToVault = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        sourced_id: z.string().uuid(),
        overrides: vaultInput.partial().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: src, error: srcErr } = await supabaseAdmin
      .from("sourced_products")
      .select("*")
      .eq("id", data.sourced_id)
      .single();
    if (srcErr || !src) throw new Error(srcErr?.message ?? "Sourced product not found");

    const base: VaultProductInput = {
      product_name: src.product_name ?? "Untitled",
      brand: src.brand ?? "Unknown",
      retailer: src.retailer_domain ?? null,
      affiliate_url: src.affiliate_url ?? src.source_url,
      brand_url: null,
      image_url: src.image_url ?? null,
      thumbnail_url: null,
      price: src.price != null ? Number(src.price) : null,
      currency: src.currency ?? "USD",
      category: src.slot_category ?? "uncategorized",
      subcategory: null,
      destination_tags: [],
      activity_tags: [],
      color_tags: [],
      print_tags: [],
      material_tags: [],
      silhouette_tags: [],
      notes: src.notes ?? null,
      source_sourced_product_id: src.id,
    };
    const merged = { ...base, ...(data.overrides ?? {}) };
    const parsed = vaultInput.parse(merged);

    const { data: inserted, error } = await supabaseAdmin
      .from("vault_products")
      .insert(parsed)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("sourced_products")
      .update({ status: "promoted", promoted_at: new Date().toISOString() })
      .eq("id", src.id);

    return { ok: true as const, id: inserted.id };
  });