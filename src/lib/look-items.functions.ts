import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

/**
 * Public read for the shoppable "Shop The Look" layer.
 *
 * Reads ONLY the `look_items_public` security_invoker view with the
 * publishable key, so the anon boundary applies exactly as it does in the
 * browser: active rows, display columns only, no writes.
 */
export type PublicLookItem = {
  look_key: string;
  sort_order: number;
  item_name: string;
  brand_name: string | null;
  brand_slug: string | null;
  price_display: string | null;
  currency: string | null;
  image_url: string | null;
  affiliate_url: string | null;
  retailer_name: string | null;
};

export const getLookItems = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lookKey: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }): Promise<{ items: PublicLookItem[] }> => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: rows, error } = await supabase
      .from("look_items_public")
      .select(
        "look_key,sort_order,item_name,brand_name,brand_slug,price_display,currency,image_url,affiliate_url,retailer_name",
      )
      .eq("look_key", data.lookKey)
      .order("sort_order", { ascending: true });
    if (error) return { items: [] };
    return { items: (rows ?? []) as PublicLookItem[] };
  });
