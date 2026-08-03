/**
 * Sitewide product-health sweep (server-only).
 *
 * One code path used by (a) the admin "Run sweep" button today and (b) a future
 * daily scheduled job via `/api/public/product-health-sweep`. It probes active
 * products across EVERY destination, moment and look, records the result, and
 * optionally enqueues AI replacement generation for slots that just failed.
 *
 * It never publishes or promotes anything: display resolution and human
 * approval stay in charge.
 */
import { probeProductUrl } from "./product-health.server";

export type SweepResult = {
  checked: number;
  failed: Array<{ id: string; lookKey: string; slot: string; status: string }>;
  recovered: number;
  generationQueued: string[];
  generationErrors: string[];
};

export async function sweepProductHealth(opts: {
  destination?: string;
  moment?: string;
  productId?: string;
  limit?: number;
  /** When true, failed slots get AI replacement candidates generated immediately. */
  autoGenerate?: boolean;
}): Promise<SweepResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let q = supabaseAdmin
    .from("shop_slot_products")
    .select("id,look_key,slot,url,status")
    .not("url", "is", null)
    .limit(opts.limit ?? 200);
  if (opts.productId) q = q.eq("id", opts.productId);
  if (opts.destination) q = q.eq("destination", opts.destination);
  if (opts.moment) q = q.eq("moment", opts.moment);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);

  const result: SweepResult = {
    checked: 0,
    failed: [],
    recovered: 0,
    generationQueued: [],
    generationErrors: [],
  };

  for (const row of rows ?? []) {
    if (!row.url) continue;
    const probe = await probeProductUrl(row.url);
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      last_checked_at: now,
      last_http_status: probe.httpStatus,
      status: probe.status,
    };
    if (probe.status === "active") patch["last_seen_available_at"] = now;
    const { error: uErr } = await supabaseAdmin
      .from("shop_slot_products")
      .update(patch)
      .eq("id", row.id);
    if (uErr) throw new Error(uErr.message);
    result.checked += 1;
    if (probe.status !== "active") {
      result.failed.push({
        id: row.id,
        lookKey: row.look_key,
        slot: row.slot,
        status: probe.status,
      });
    } else if (row.status !== "active") {
      result.recovered += 1;
    }
  }

  if (opts.autoGenerate) {
    const { generateCandidatesForSlotProduct } = await import("./ai-replacement.server");
    for (const f of result.failed) {
      try {
        const out = await generateCandidatesForSlotProduct(f.id);
        result.generationQueued.push(`${f.lookKey}::${f.slot} → ${out.candidates.length}`);
      } catch (err) {
        result.generationErrors.push(
          `${f.lookKey}::${f.slot}: ${err instanceof Error ? err.message : "failed"}`,
        );
      }
    }
  }

  return result;
}