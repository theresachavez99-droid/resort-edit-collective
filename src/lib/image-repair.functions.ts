import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

/**
 * Image Repair Queue — server functions backing /admin/image-repair-queue.
 *
 * Surfaces every founder_reference_products row whose image cannot be
 * trusted on a live rail and provides the actions to fix it. Reason
 * classification is derived at query time so the founder always sees the
 * truest current state of the data, not a stale denormalized flag.
 */

export type ImageSource =
  | "retailer_cdn"
  | "brand_cdn"
  | "cleaned_thumbnail"
  | "founder_screenshot"
  | "placeholder"
  | "unknown";

export type RepairReason =
  | "placeholder"
  | "sketch"
  | "founder_screenshot"
  | "unknown_source"
  | "cross_brand_collision"
  | "duplicate_url"
  | "broken_url";

export interface RepairQueueItem {
  id: string;
  brand: string;
  product_name: string;
  product_category: string | null;
  image_url: string | null;
  source_url: string | null;
  image_source: ImageSource;
  reasons: RepairReason[];
  collision_brands?: string[];
}

const PasswordOnly = z.object({ password: z.string().min(1).max(200) });

export const listImageRepairQueue = createServerFn({ method: "POST" })
  .inputValidator((input) => PasswordOnly.parse(input))
  .handler(async ({ data }): Promise<RepairQueueItem[]> => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("founder_reference_products")
      .select(
        "id,brand,product_name,product_category,image_url,source_url,image_source,image_review_status,founder_approved",
      )
      .eq("founder_approved", true)
      .or("image_review_status.is.null,image_review_status.eq.")
      .order("brand");

    if (error) throw new Error(error.message);

    // Cross-brand image collision map across the FULL approved set so a
    // collision is surfaced for every row sharing the URL.
    const urlBrands = new Map<string, Set<string>>();
    const urlCount = new Map<string, number>();
    for (const r of rows ?? []) {
      if (!r.image_url) continue;
      const set = urlBrands.get(r.image_url) ?? new Set<string>();
      set.add(r.brand.toLowerCase());
      urlBrands.set(r.image_url, set);
      urlCount.set(r.image_url, (urlCount.get(r.image_url) ?? 0) + 1);
    }

    const out: RepairQueueItem[] = [];
    for (const r of rows ?? []) {
      const reasons: RepairReason[] = [];
      const src = (r.image_source as ImageSource) ?? "unknown";
      const url = r.image_url?.trim() ?? "";

      if (src === "placeholder") {
        if (/\.svg($|\?)/i.test(url) || url.includes("/src/assets/products/")) {
          reasons.push("sketch");
        } else {
          reasons.push("placeholder");
        }
      }
      if (src === "founder_screenshot") reasons.push("founder_screenshot");
      if (src === "unknown") reasons.push("unknown_source");
      if (!url) reasons.push("broken_url");

      if (url) {
        const brands = urlBrands.get(url);
        if (brands && brands.size > 1) {
          reasons.push("cross_brand_collision");
        } else if ((urlCount.get(url) ?? 0) > 1) {
          reasons.push("duplicate_url");
        }
      }

      if (reasons.length === 0) continue;
      out.push({
        id: r.id,
        brand: r.brand,
        product_name: r.product_name ?? "",
        product_category: r.product_category,
        image_url: r.image_url,
        source_url: r.source_url,
        image_source: src,
        reasons,
        collision_brands:
          url && urlBrands.get(url)?.size && urlBrands.get(url)!.size > 1
            ? [...urlBrands.get(url)!]
            : undefined,
      });
    }
    // Most actionable first: collisions, then placeholders/sketches, then unknown.
    const weight: Record<RepairReason, number> = {
      cross_brand_collision: 0,
      placeholder: 1,
      sketch: 1,
      founder_screenshot: 2,
      duplicate_url: 3,
      broken_url: 3,
      unknown_source: 4,
    };
    out.sort((a, b) => {
      const wa = Math.min(...a.reasons.map((r) => weight[r]));
      const wb = Math.min(...b.reasons.map((r) => weight[r]));
      return wa - wb || a.brand.localeCompare(b.brand);
    });
    return out;
  });

const Action = z.object({
  password: z.string().min(1).max(200),
  id: z.string().uuid(),
});

/** Mark current image as a valid cleaned thumbnail — no URL change. */
export const approveImage = createServerFn({ method: "POST" })
  .inputValidator((input) => Action.parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("founder_reference_products")
      .update({ image_source: "cleaned_thumbnail", image_review_status: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const ReplaceInput = Action.extend({
  image_url: z.string().url().max(2000),
  image_source: z
    .enum(["retailer_cdn", "brand_cdn", "cleaned_thumbnail"])
    .default("cleaned_thumbnail"),
});

/** Replace image URL with founder-supplied valid product photo. */
export const replaceImage = createServerFn({ method: "POST" })
  .inputValidator((input) => ReplaceInput.parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("founder_reference_products")
      .update({
        image_url: data.image_url,
        image_source: data.image_source,
        image_review_status: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const markAsScreenshot = createServerFn({ method: "POST" })
  .inputValidator((input) => Action.parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("founder_reference_products")
      .update({ image_source: "founder_screenshot", image_review_status: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Pull the whole product from approved inventory until founder revisits. */
export const quarantineProduct = createServerFn({ method: "POST" })
  .inputValidator((input) => Action.parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("founder_reference_products")
      .update({ founder_approved: false })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Dismiss from queue without changing the image (rail still rejects it). */
export const ignoreImageRepair = createServerFn({ method: "POST" })
  .inputValidator((input) => Action.parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("founder_reference_products")
      .update({ image_review_status: "ignored" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });