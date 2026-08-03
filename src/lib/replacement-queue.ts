/**
 * Replacement queue model — shared, client-safe.
 *
 * The queue is DERIVED, never a second source of truth: a slot's queue state is
 * a pure function of its `shop_slot_products` rows, its
 * `product_replacement_candidates`, and the last styling request logged in
 * `product_audit_events`. Nothing here publishes anything — the queue only
 * tells the Studio what needs a human.
 *
 * Internal only. Public pages keep rendering a validated active product, an
 * approved validated backup, or the tasteful non-clickable
 * "Replacement in review" state — they never surface queue state.
 */
import { isFailedStatus, type ProductStatus } from "./product-health";

export const QUEUE_STATES = [
  "awaiting_styling",
  "generating_candidates",
  "candidates_ready",
  "needs_manual_verification",
  "awaiting_approval",
  "backup_promoted",
  "resolved",
] as const;
export type QueueState = (typeof QUEUE_STATES)[number];

/** States that count toward the nav badge. Completed work is excluded. */
export const UNRESOLVED_QUEUE_STATES = [
  "awaiting_styling",
  "generating_candidates",
  "candidates_ready",
  "needs_manual_verification",
  "awaiting_approval",
] as const satisfies readonly QueueState[];

export function isUnresolvedQueueState(state: string): boolean {
  return (UNRESOLVED_QUEUE_STATES as readonly string[]).includes(state);
}

/** Human-readable labels used everywhere in the Studio. */
export const QUEUE_STATE_LABELS: Record<QueueState, string> = {
  awaiting_styling: "Replacement needed",
  generating_candidates: "ChatGPT styling in progress",
  candidates_ready: "3 replacements ready",
  needs_manual_verification: "Link verification needed",
  awaiting_approval: "Awaiting your approval",
  backup_promoted: "Backup promoted",
  resolved: "Resolved",
};

/** Label with the real candidate count folded in ("2 replacements ready"). */
export function queueStateLabel(state: QueueState, candidateCount = 3): string {
  if (state === "candidates_ready") return `${candidateCount} replacements ready`;
  return QUEUE_STATE_LABELS[state];
}

export type QueueCta = { label: string; action: QueueAction; disabled: boolean };
export type QueueAction = "generate" | "review" | "verify" | "view_backup" | "none";

export function queueCta(state: QueueState, candidateCount = 3): QueueCta {
  switch (state) {
    case "awaiting_styling":
      return { label: "Generate replacements", action: "generate", disabled: false };
    case "generating_candidates":
      return { label: "Generating…", action: "none", disabled: true };
    case "candidates_ready":
    case "awaiting_approval":
      return { label: `Review ${candidateCount} replacements`, action: "review", disabled: false };
    case "needs_manual_verification":
      return { label: "Verify candidates", action: "verify", disabled: false };
    case "backup_promoted":
      return { label: "View promoted backup", action: "view_backup", disabled: false };
    default:
      return { label: "Resolved", action: "none", disabled: true };
  }
}

/** Summary counters shown at the top of the queue screen. */
export type QueueSummary = {
  needs_styling: number;
  generating: number;
  ready_to_review: number;
  needs_verification: number;
  approved_today: number;
  unresolved: number;
};

const ACCESSORY_SLOT_RE =
  /(sunglass|glasses|hat|bag|clutch|tote|basket|jewel|earring|necklace|pendant|bracelet|cuff|anklet|belt|scarf|hair|shoe|sandal|heel|espadrille|slide|flat|watch)/i;

/** Hero garments are triaged before accessories inside every queue group. */
export function isAccessorySlot(slot: string): boolean {
  return ACCESSORY_SLOT_RE.test(slot);
}

export type QueueSlotRow = {
  id: string;
  destination: string;
  moment: string;
  look_key: string;
  look_title: string | null;
  slot: string;
  slot_label: string | null;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string | null;
  status: string;
  is_primary: boolean;
  replacement_priority: number;
  last_checked_at: string | null;
  last_audit_verdict?: string | null;
};

export type QueueCandidateRow = {
  id: string;
  look_key: string;
  slot: string;
  approval_status: string;
  verification_status: string;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QueueItem = {
  key: string;
  slotProductId: string;
  destination: string;
  moment: string;
  route: string;
  lookKey: string;
  lookTitle: string | null;
  slot: string;
  slotLabel: string | null;
  failedBrand: string;
  failedProduct: string;
  failedRetailer: string | null;
  failedUrl: string | null;
  failureStatus: string;
  failureVerdict: string | null;
  enteredQueueAt: string | null;
  state: QueueState;
  hasApprovedBackup: boolean;
  candidateCount: number;
  verifiedCandidateCount: number;
  isAccessory: boolean;
};

/** How long a styling request is treated as still running. */
const GENERATING_WINDOW_MS = 15 * 60 * 1000;

export type DeriveInput = {
  rows: QueueSlotRow[];
  candidates: QueueCandidateRow[];
  /** `lookKey::slot` → ISO timestamp of the last logged styling request. */
  stylingRequestedAt: Record<string, string>;
  routeForLookKey: (lookKey: string) => string;
  now?: number;
};

/**
 * Derive one queue item per slot that needs attention (plus recently completed
 * history). Pure — safe to run on the client for previews and in tests.
 */
export function deriveQueue(input: DeriveInput): QueueItem[] {
  const now = input.now ?? Date.now();
  const groups = new Map<string, QueueSlotRow[]>();
  for (const r of input.rows) {
    const key = `${r.look_key}::${r.slot.toLowerCase()}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const candidatesByKey = new Map<string, QueueCandidateRow[]>();
  for (const c of input.candidates) {
    const key = `${c.look_key}::${c.slot.toLowerCase()}`;
    candidatesByKey.set(key, [...(candidatesByKey.get(key) ?? []), c]);
  }

  const items: QueueItem[] = [];
  for (const [key, group] of groups) {
    const primary = group.find((r) => r.is_primary);
    if (!primary) continue;
    const cands = candidatesByKey.get(key) ?? [];
    const pending = cands.filter((c) => c.approval_status === "pending");
    const approvedCandidates = cands.filter((c) => c.approval_status === "approved");
    const verified = pending.filter((c) => c.verification_status === "verified");
    const activeBackup = group.some(
      (r) => !r.is_primary && r.status === "active" && !!r.url,
    );
    const primaryFailed = isFailedStatus(primary.status) || primary.status === "needs_review";

    let state: QueueState;
    if (!primaryFailed) {
      // Nothing wrong now. Keep it visible as history when something was done.
      if (approvedCandidates.length > 0) state = "resolved";
      else if (group.length > 1 && !primary.is_primary) state = "backup_promoted";
      else continue;
    } else if (activeBackup) {
      state = "backup_promoted";
    } else if (pending.length > 0) {
      if (verified.length === 0) state = "needs_manual_verification";
      else if (verified.length === pending.length) state = "awaiting_approval";
      else state = "candidates_ready";
    } else {
      const requestedAt = input.stylingRequestedAt[key];
      state =
        requestedAt && now - new Date(requestedAt).getTime() < GENERATING_WINDOW_MS
          ? "generating_candidates"
          : "awaiting_styling";
    }

    items.push({
      key,
      slotProductId: primary.id,
      destination: primary.destination,
      moment: primary.moment,
      route: input.routeForLookKey(primary.look_key),
      lookKey: primary.look_key,
      lookTitle: primary.look_title,
      slot: primary.slot,
      slotLabel: primary.slot_label,
      failedBrand: primary.brand,
      failedProduct: primary.product_name,
      failedRetailer: primary.retailer,
      failedUrl: primary.url,
      failureStatus: primary.status as ProductStatus,
      failureVerdict: primary.last_audit_verdict ?? null,
      enteredQueueAt: primary.last_checked_at,
      state,
      hasApprovedBackup: activeBackup,
      candidateCount: pending.length,
      verifiedCandidateCount: verified.length,
      isAccessory: isAccessorySlot(primary.slot),
    });
  }

  return sortQueue(items);
}

const STATE_RANK: Record<QueueState, number> = {
  candidates_ready: 0,
  awaiting_approval: 0,
  needs_manual_verification: 1,
  awaiting_styling: 2,
  generating_candidates: 3,
  backup_promoted: 4,
  resolved: 4,
};

/** Ready-to-review first, then hero garments before accessories, then oldest. */
export function sortQueue(items: QueueItem[]): QueueItem[] {
  return [...items].sort((a, b) => {
    const rank = STATE_RANK[a.state] - STATE_RANK[b.state];
    if (rank !== 0) return rank;
    if (a.isAccessory !== b.isAccessory) return a.isAccessory ? 1 : -1;
    const at = a.enteredQueueAt ? new Date(a.enteredQueueAt).getTime() : 0;
    const bt = b.enteredQueueAt ? new Date(b.enteredQueueAt).getTime() : 0;
    return at - bt;
  });
}

export function summarizeQueue(items: QueueItem[], approvedToday: number): QueueSummary {
  const count = (s: QueueState) => items.filter((i) => i.state === s).length;
  const summary: QueueSummary = {
    needs_styling: count("awaiting_styling"),
    generating: count("generating_candidates"),
    ready_to_review: count("candidates_ready") + count("awaiting_approval"),
    needs_verification: count("needs_manual_verification"),
    approved_today: approvedToday,
    unresolved: items.filter((i) => isUnresolvedQueueState(i.state)).length,
  };
  return summary;
}
