/**
 * Replacement queue — server functions.
 *
 * The badge count is gated on the signed admin session cookie (so it can render
 * in the Studio shell without re-entering the password); everything else is
 * password-gated like the rest of the Studio. Nothing here publishes product:
 * generation produces pending candidates only, approval stays on the Product
 * Health screen.
 */
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import { routeForLookKey } from "./product-health";
import {
  deriveQueue,
  summarizeQueue,
  QUEUE_STATES,
  type QueueCandidateRow,
  type QueueSlotRow,
} from "./replacement-queue";

const pw = z.object({ password: z.string().min(1).max(200) });

const SLOT_COLUMNS =
  "id,destination,moment,look_key,look_title,slot,slot_label,brand,product_name,retailer,url,status,is_primary,replacement_priority,last_checked_at,last_audit_verdict";
const CANDIDATE_COLUMNS =
  "id,look_key,slot,approval_status,verification_status,generated_at,created_at,updated_at";

type LoadedQueue = Awaited<ReturnType<typeof loadQueue>>;

async function loadQueue(filter: {
  destination?: string;
  moment?: string;
  lookKey?: string;
  runId?: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // A run filter narrows the queue to the looks that run actually touched.
  let runLookSlots: Set<string> | null = null;
  if (filter.runId) {
    const { data: evts } = await supabaseAdmin
      .from("product_audit_events")
      .select("look_key,slot")
      .eq("run_id", filter.runId);
    runLookSlots = new Set((evts ?? []).map((e) => `${e.look_key}::${e.slot.toLowerCase()}`));
  }

  let slotQuery = supabaseAdmin.from("shop_slot_products").select(SLOT_COLUMNS).limit(2000);
  if (filter.destination) slotQuery = slotQuery.eq("destination", filter.destination);
  if (filter.moment) slotQuery = slotQuery.eq("moment", filter.moment);
  if (filter.lookKey) slotQuery = slotQuery.eq("look_key", filter.lookKey);
  const { data: slotRows, error: slotErr } = await slotQuery;
  if (slotErr) throw new Error(slotErr.message);

  const { data: candidateRows, error: candErr } = await supabaseAdmin
    .from("product_replacement_candidates")
    .select(CANDIDATE_COLUMNS)
    .limit(2000);
  if (candErr) throw new Error(candErr.message);

  const { data: stylingEvents } = await supabaseAdmin
    .from("product_audit_events")
    .select("look_key,slot,created_at,event_type")
    .in("event_type", ["styling_requested", "queue_generating_candidates"])
    .order("created_at", { ascending: false })
    .limit(500);
  const stylingRequestedAt: Record<string, string> = {};
  for (const e of stylingEvents ?? []) {
    const key = `${e.look_key}::${e.slot.toLowerCase()}`;
    if (!stylingRequestedAt[key]) stylingRequestedAt[key] = e.created_at;
  }

  let items = deriveQueue({
    rows: (slotRows ?? []) as QueueSlotRow[],
    candidates: (candidateRows ?? []) as QueueCandidateRow[],
    stylingRequestedAt,
    routeForLookKey,
  });
  if (runLookSlots) items = items.filter((i) => runLookSlots.has(i.key));

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count: approvedToday } = await supabaseAdmin
    .from("product_replacement_candidates")
    .select("id", { count: "exact", head: true })
    .eq("approval_status", "approved")
    .gte("updated_at", since.toISOString());

  return { items, summary: summarizeQueue(items, approvedToday ?? 0) };
}

/**
 * Nav badge count. Cookie-gated: the /admin shell has already verified the
 * signed admin session, so the badge renders without a second password prompt.
 */
export const getQueueBadge = createServerFn({ method: "GET" }).handler(async () => {
  const { isValidAdminSession, ADMIN_SESSION_COOKIE } = await import("./admin-auth.server");
  if (!isValidAdminSession(getCookie(ADMIN_SESSION_COOKIE))) {
    return { ok: false as const, unresolved: 0 };
  }
  const { summary } = await loadQueue({});
  return { ok: true as const, unresolved: summary.unresolved, summary };
});

/** Full queue for the queue screen. Optional destination/moment/look/run filter. */
export const listReplacementQueue = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw
      .extend({
        destination: z.string().max(80).optional(),
        moment: z.string().max(80).optional(),
        lookKey: z.string().max(200).optional(),
        runId: z.string().uuid().optional(),
        state: z.enum(QUEUE_STATES).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const loaded: LoadedQueue = await loadQueue({
      ...(data.destination ? { destination: data.destination } : {}),
      ...(data.moment ? { moment: data.moment } : {}),
      ...(data.lookKey ? { lookKey: data.lookKey } : {}),
      ...(data.runId ? { runId: data.runId } : {}),
    });
    const items = data.state ? loaded.items.filter((i) => i.state === data.state) : loaded.items;
    return { items, summary: loaded.summary };
  });

/**
 * Queue CTA for `awaiting_styling`: ask the ChatGPT stylist for candidates.
 * Candidates are always pending — approval remains a manual action.
 */
export const generateQueueReplacements = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.extend({ slotProductId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { emitQueueStateChange } = await import("./queue-notifications.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("shop_slot_products")
      .select("look_key,slot,destination,moment")
      .eq("id", data.slotProductId)
      .single();
    if (row) {
      await emitQueueStateChange({
        lookKey: row.look_key,
        slot: row.slot,
        destination: row.destination,
        moment: row.moment,
        route: routeForLookKey(row.look_key),
        state: "generating_candidates",
        actor: "admin",
      });
    }
    const { generateCandidatesForSlotProduct } = await import("./ai-replacement.server");
    const out = await generateCandidatesForSlotProduct(data.slotProductId);
    if (row && out.candidates.length > 0) {
      await emitQueueStateChange({
        lookKey: row.look_key,
        slot: row.slot,
        destination: row.destination,
        moment: row.moment,
        route: routeForLookKey(row.look_key),
        state: "candidates_ready",
        candidateCount: out.candidates.length,
        actor: "admin",
      });
    }
    return { candidates: out.candidates.length };
  });

/** Latest stored audit summary — keeps the result visible after the toast. */
export const getLatestAuditSummary = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: run } = await supabaseAdmin
      .from("product_audit_runs")
      .select(
        "id,scope,destination,moment,look_key,urls_audited,counts,auto_promoted,awaiting_styling,started_at,finished_at,triggered_by",
      )
      .not("finished_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { run: run ?? null };
  });
