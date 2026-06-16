import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

/**
 * Mark a product_source's availability. Admin tool — manual override and the
 * write target for any future background availability scanners.
 */
export const setSourceAvailability = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        source_id: z.string().uuid(),
        availability: z.enum(["in_stock", "low_stock", "out_of_stock", "unknown"]),
        token: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb: any = supabaseAdmin;
    const { error } = await sb
      .from("product_sources")
      .update({ availability: data.availability, last_checked_at: new Date().toISOString() })
      .eq("id", data.source_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/**
 * Re-run the dynamic source resolver across every slot of a published look.
 * Returns the per-slot status snapshot for the admin Look Studio.
 */
export const refreshLookInventory = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ candidate_id: z.string().uuid(), token: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { resolveSlotSource, persistSlotResolution } = await import("./source-resolver.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb: any = supabaseAdmin;
    const { data: slots } = await sb
      .from("look_candidate_slots")
      .select("id, slot, product_id")
      .eq("candidate_id", data.candidate_id)
      .order("position");
    const out: Array<{ slot_id: string; slot: string; status: string; retailer: string | null }> = [];
    for (const s of (slots ?? []) as Array<{ id: string; slot: string; product_id: string | null }>) {
      if (!s.product_id) {
        out.push({ slot_id: s.id, slot: s.slot, status: "legacy", retailer: null });
        continue;
      }
      const r = await resolveSlotSource(supabaseAdmin, s.product_id);
      await persistSlotResolution(supabaseAdmin, s.id, r);
      out.push({
        slot_id: s.id,
        slot: s.slot,
        status: r.status,
        retailer: r.source?.retailer ?? r.alternatives.find((a) => a.url)?.retailer ?? null,
      });
    }
    return { ok: true as const, slots: out };
  });

/**
 * Get inventory health for every approved / published candidate of a
 * destination — drives the admin status panel.
 */
export const getDestinationInventoryHealth = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ destination: z.string().min(1).max(64), token: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb: any = supabaseAdmin;
    const { data: cands } = await sb
      .from("look_candidates")
      .select("id, slug, variant, status")
      .eq("destination", data.destination)
      .in("status", ["approved", "published"]);
    const candIds = (cands ?? []).map((c: { id: string }) => c.id);
    if (!candIds.length) return { ok: true as const, looks: [] };
    const { data: slots } = await sb
      .from("look_candidate_slots")
      .select("candidate_id, slot, resolution_status, resolved_at")
      .in("candidate_id", candIds);
    type SlotRow = { candidate_id: string; slot: string; resolution_status: string; resolved_at: string | null };
    const byCand = new Map<string, SlotRow[]>();
    for (const s of (slots ?? []) as SlotRow[]) {
      const arr = byCand.get(s.candidate_id) ?? [];
      arr.push(s);
      byCand.set(s.candidate_id, arr);
    }
    return {
      ok: true as const,
      looks: (cands ?? []).map((c: { id: string; slug: string; variant: string; status: string }) => {
        const ss = byCand.get(c.id) ?? [];
        const counts: Record<string, number> = {};
        for (const x of ss) counts[x.resolution_status] = (counts[x.resolution_status] ?? 0) + 1;
        return {
          candidate_id: c.id,
          slug: c.slug,
          variant: c.variant,
          status: c.status,
          slot_count: ss.length,
          status_counts: counts,
          slots: ss.map((s) => ({ slot: s.slot, status: s.resolution_status, resolved_at: s.resolved_at })),
        };
      }),
    };
  });