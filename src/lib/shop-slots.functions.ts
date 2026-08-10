import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public read for "The Resort Edit" itemization sidebar.
 *
 * SINGLE SOURCE OF TRUTH: the `public_shop_slot_display` view, which already
 * filters to `status = 'active'` rows. The sidebar must never be rendered from
 * a hardcoded frontend registry again — that drift is exactly what this module
 * exists to prevent.
 */
export type PublicShopSlot = {
  destination: string | null;
  moment: string | null;
  look_key: string;
  slot: string | null;
  slot_label: string | null;
  brand: string | null;
  product_name: string | null;
  retailer: string | null;
  url: string | null;
  status: string | null;
  is_primary: boolean | null;
  replacement_priority: number | null;
};

export const getShopSlots = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lookKey: z.string().min(1).max(160) }).parse(d))
  .handler(async ({ data }): Promise<{ slots: PublicShopSlot[] }> => {
    // Server-side read of a public, non-PII display view. `shop_slot_products`
    // has RLS with no anon policy, so the publishable key sees zero rows; this
    // handler therefore reads server-side with an explicit, price-free column
    // projection and the view's own `status = 'active'` filter. No schema,
    // grant, or policy change required.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("public_shop_slot_display")
      .select(
        "destination,moment,look_key,slot,slot_label,brand,product_name,retailer,url,status,is_primary,replacement_priority",
      )
      .eq("look_key", data.lookKey)
      .eq("status", "active");
    if (error) return { slots: [] };
    return { slots: (rows ?? []) as PublicShopSlot[] };
  });
