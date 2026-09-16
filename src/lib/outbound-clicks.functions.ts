/**
 * Aggregate outbound-click measurement.
 *
 * Deliberately minimal and privacy-clean:
 *  - counts only, grouped by (day, link key, placement)
 *  - no user identifiers, no IPs, no session ids, no free-text URLs
 *  - the link key must exist in the outbound registry, the placement must be
 *    one of a small predefined list; anything else is rejected server-side
 *  - the table has RLS on with no public policies; only the server writes
 *
 * These are CLICKS, not sales or commissions. Nothing here proves a booking
 * happened or that any commission was earned.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { OUTBOUND_KEYS } from "@/data/outboundLinks";

export const OUTBOUND_PLACEMENTS = [
  "portofino-stay",
  "portofino-do",
  "portofino-eat",
  "home-featured",
  "portofino-collection",
] as const;

const schema = z.object({
  linkKey: z.string().refine((k) => OUTBOUND_KEYS.includes(k), "unknown link key"),
  placement: z.enum(OUTBOUND_PLACEMENTS),
});

export const recordOutboundClick = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("record_outbound_click", {
      p_link_key: data.linkKey,
      p_placement: data.placement,
    });
    if (error) return { ok: false as const };
    return { ok: true as const };
  });
