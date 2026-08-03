/**
 * Replacement-queue notification hook — SERVER ONLY.
 *
 * A single documented seam for outbound notifications when a slot's queue state
 * changes. Today it writes an auditable event row (and a server log line) so the
 * change is durable; email or Slack can be added later by extending `SINKS`
 * without touching the audit engine or the queue screen.
 *
 * Usage from server code:
 *
 *   await emitQueueStateChange({
 *     lookKey, slot, destination, moment, state: "candidates_ready",
 *     candidateCount: 3, route: "/portofino/nightcap",
 *   });
 *
 * Contract: never throws — a failed notification must never fail the audit or
 * the styling run that triggered it.
 */
import type { QueueState } from "./replacement-queue";

export type QueueStateChangeEvent = {
  lookKey: string;
  slot: string;
  destination?: string | null;
  moment?: string | null;
  route?: string | null;
  state: QueueState;
  candidateCount?: number;
  actor?: string;
};

type QueueNotificationSink = (event: QueueStateChangeEvent) => Promise<void>;

/** Persist every transition to the audit log so the Studio can show history. */
const auditLogSink: QueueNotificationSink = async (event) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("product_audit_events").insert({
    look_key: event.lookKey,
    slot: event.slot,
    destination: event.destination ?? null,
    moment: event.moment ?? null,
    event_type: `queue_${event.state}`,
    actor: event.actor ?? "system",
    to_status: event.state,
    detail: {
      route: event.route ?? null,
      candidate_count: event.candidateCount ?? null,
    } as never,
  });
};

/**
 * Notification sinks. Add an email or Slack sink here later — for example a
 * function that posts to a Slack webhook when `event.state === "candidates_ready"`.
 * No external integration is required today.
 */
const SINKS: QueueNotificationSink[] = [auditLogSink];

export async function emitQueueStateChange(event: QueueStateChangeEvent): Promise<void> {
  for (const sink of SINKS) {
    try {
      await sink(event);
    } catch (err) {
      console.error("[queue-notification] sink failed", event.state, err);
    }
  }
}
