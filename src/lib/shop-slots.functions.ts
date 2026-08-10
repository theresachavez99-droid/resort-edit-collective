import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

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
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: rows, error } = await supabase
      .from("public_shop_slot_display")
      .select(
        "destination,moment,look_key,slot,slot_label,brand,product_name,retailer,url,status,is_primary,replacement_priority",
      )
      .eq("look_key", data.lookKey);
    if (error) return { slots: [] };
    return { slots: (rows ?? []) as PublicShopSlot[] };
  });
