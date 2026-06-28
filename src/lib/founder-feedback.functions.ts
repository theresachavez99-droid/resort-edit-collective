/**
 * Founder editorial feedback — one-click rejection signals from the
 * Founder Look Builder. Persists to `public.founder_product_feedback` via
 * the privileged service-role client (admin-only feature gated by
 * `verifyAdmin`).
 *
 * Future work: the Stylist Engine reads these rows to derive per-brand
 * and per-pattern penalties analogous to FOUNDER_NEGATIVE_RULES.
 */

import { createServerFn } from "@tanstack/react-start";
import { verifyAdmin } from "./admin-auth.functions";

export type FeedbackReasonCode =
  | "too_logo_heavy"
  | "too_trendy"
  | "too_sporty"
  | "too_influencer"
  | "wrong_texture"
  | "wrong_visual_weight"
  | "wrong_color_temperature"
  | "wrong_jewelry_scale"
  | "not_mediterranean"
  | "doesnt_fit_founder_look";

export const FEEDBACK_REASONS: Array<{ code: FeedbackReasonCode; label: string }> = [
  { code: "too_logo_heavy", label: "Too logo-heavy" },
  { code: "too_trendy", label: "Too trendy" },
  { code: "too_sporty", label: "Too sporty" },
  { code: "too_influencer", label: "Too influencer" },
  { code: "wrong_texture", label: "Wrong texture" },
  { code: "wrong_visual_weight", label: "Wrong visual weight" },
  { code: "wrong_color_temperature", label: "Wrong color temperature" },
  { code: "wrong_jewelry_scale", label: "Wrong jewelry scale" },
  { code: "not_mediterranean", label: "Not Mediterranean" },
  { code: "doesnt_fit_founder_look", label: "Doesn't fit the Founder Look" },
];

export const submitFounderProductFeedback = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      password: string;
      founder_look_id?: string | null;
      destination?: string | null;
      moment?: string | null;
      slot: string;
      brand?: string | null;
      product_title?: string | null;
      product_url?: string | null;
      retailer?: string | null;
      image_url?: string | null;
      reason_code: FeedbackReasonCode;
      reason_label?: string | null;
      notes?: string | null;
      variant?: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    const auth = await verifyAdmin({ data: { password: data.password } });
    if (!auth?.ok) return { ok: false as const, error: "unauthorized" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("founder_product_feedback")
      .insert({
        founder_look_id: data.founder_look_id ?? null,
        destination: data.destination ?? null,
        moment: data.moment ?? null,
        slot: data.slot,
        brand: data.brand ?? null,
        product_title: data.product_title ?? null,
        product_url: data.product_url ?? null,
        retailer: data.retailer ?? null,
        image_url: data.image_url ?? null,
        reason_code: data.reason_code,
        reason_label: data.reason_label ?? null,
        notes: data.notes ?? null,
        variant: data.variant ?? null,
      })
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, id: row.id };
  });