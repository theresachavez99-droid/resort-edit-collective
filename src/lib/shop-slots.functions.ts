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
    // Long Lunch Auto-Edit: when the styling engine has an ACTIVE, COMPLETE,
    // coherence-cleared version for this look, it is the source of truth. When
    // it does not, this falls through to the view exactly as before — and the
    // itemization renders nothing rather than a partial look.
    const { LONG_LUNCH_LOOK_KEY } = await import("./long-lunch-auto-edit");
    if (data.lookKey === LONG_LUNCH_LOOK_KEY) {
      const { loadActiveAutoEditLook } = await import("./long-lunch-auto-edit.server");
      const version = await loadActiveAutoEditLook(data.lookKey);
      if (version) {
        return {
          slots: (version.slots ?? [])
            .filter((s) => Boolean(s.url))
            .map((s, i) => ({
              destination: "Portofino",
              moment: "The Long Lunch",
              look_key: data.lookKey,
              // Keep the sidebar's existing visual hierarchy: "outfit" is the
              // engine's canonical name for the hero garment chapter.
              slot: s.slot === "outfit" ? "dress" : s.slot,
              slot_label: s.slot_label,
              brand: s.brand,
              product_name: s.product_name,
              retailer: s.retailer,
              url: s.url,
              status: "active",
              is_primary: s.slot === "outfit",
              replacement_priority: i,
            })),
        };
      }
    }

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

