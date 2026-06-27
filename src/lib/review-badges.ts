/**
 * Editorial Review Queue badge derivation (admin-only).
 *
 * Pure client-side helpers — derive badges from review-queue items already
 * returned by `listEditorialReviewQueue`. No schema changes, no extra
 * server reads. Badges surface at two levels:
 *   1. Collection summary (aggregated counts across all items in a
 *      collection that share an issue).
 *   2. Individual review row (the specific issues that triggered the
 *      enqueue or are visible on the slot's current state).
 *
 * All badge logic is conservative: when the underlying signal is absent
 * the badge is omitted (we'd rather miss a badge than mislabel a slot).
 */

export type ReviewBadgeId =
  | "missing_image"
  | "duplicate"
  | "low_confidence"
  | "needs_founder_review"
  | "inventory_issue"
  | "broken_link"
  | "sold_out"
  | "weak_lilla_match"
  | "incomplete_look"
  | "replacement_needed";

export type ReviewBadge = {
  id: ReviewBadgeId;
  label: string;
  tone: "red" | "amber" | "stone" | "ink";
};

const BADGE_DEFS: Record<ReviewBadgeId, Omit<ReviewBadge, "id">> = {
  missing_image:        { label: "Missing image",        tone: "red" },
  broken_link:          { label: "Broken product link",  tone: "red" },
  sold_out:             { label: "Sold out",             tone: "red" },
  inventory_issue:      { label: "Inventory issue",      tone: "amber" },
  replacement_needed:   { label: "Replacement needed",   tone: "amber" },
  incomplete_look:      { label: "Incomplete look",      tone: "amber" },
  needs_founder_review: { label: "Needs founder review", tone: "ink" },
  duplicate:            { label: "Duplicate",            tone: "stone" },
  low_confidence:       { label: "Low confidence",       tone: "stone" },
  weak_lilla_match:     { label: "Weak Lilla match",     tone: "stone" },
};

export function badgeMeta(id: ReviewBadgeId): ReviewBadge {
  return { id, ...BADGE_DEFS[id] };
}

type ReviewItem = {
  reason: string | null;
  priority: string | null;
  payload: unknown;
  slot?: {
    image_url?: string | null;
    source_url?: string | null;
    product_name?: string | null;
    brand?: string | null;
    health_status?: string | null;
  } | null;
};

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function bool(v: unknown): boolean {
  return v === true;
}
function reasonText(it: ReviewItem): string {
  const p = (it.payload && typeof it.payload === "object") ? (it.payload as Record<string, unknown>) : {};
  return `${it.reason ?? ""} ${String(p.reason ?? "")}`.toLowerCase();
}

/** Derive the badge set for one review-queue item. */
export function deriveBadges(it: ReviewItem): ReviewBadge[] {
  const ids = new Set<ReviewBadgeId>();
  const r = reasonText(it);
  const p = (it.payload && typeof it.payload === "object")
    ? (it.payload as Record<string, unknown>)
    : {};
  const health = it.slot?.health_status ?? null;

  // Inventory / link / sold-out signals — straight from health_status.
  if (health === "http_404" || /404|broken|dead link/.test(r)) {
    ids.add("broken_link");
  }
  if (health === "sold_out" || /sold[\s-]?out|out of stock/.test(r)) {
    ids.add("sold_out");
  }
  if (
    health === "unavailable" ||
    health === "redirect_failed" ||
    /unavailable|retailer_(4|5)xx|timeout|redirect/.test(r)
  ) {
    ids.add("inventory_issue");
  }

  // Image signals.
  const slot = it.slot;
  if (slot && !slot.image_url) ids.add("missing_image");
  if (health === "thumbnail_missing" || /thumbnail|image/.test(r)) {
    ids.add("missing_image");
  }

  // Confidence / discovery signals (only emitted when present in payload).
  const conf = num(p.confidence) ?? num((p as { editorialScore?: unknown }).editorialScore);
  if (conf !== null && conf < 0.5) ids.add("low_confidence");
  const lilla = num((p as { lilla_confidence?: unknown }).lilla_confidence)
    ?? num((p as { lillaScore?: unknown }).lillaScore);
  if (lilla !== null && lilla < 0.5) ids.add("weak_lilla_match");

  if (bool((p as { duplicate?: unknown }).duplicate) || /duplicate/.test(r)) {
    ids.add("duplicate");
  }
  if (
    bool((p as { incomplete_look?: unknown }).incomplete_look) ||
    /incomplete look|missing slot|under[\s-]?staffed/.test(r)
  ) {
    ids.add("incomplete_look");
  }
  if (
    bool((p as { fallback_active?: unknown }).fallback_active) ||
    bool((p as { needs_replacement?: unknown }).needs_replacement) ||
    /replace|fallback/.test(r)
  ) {
    ids.add("replacement_needed");
  }

  // Founder review escalation — high priority OR explicit needs_review.
  if (
    it.priority === "high" ||
    health === "needs_review" ||
    /founder|manual review/.test(r)
  ) {
    ids.add("needs_founder_review");
  }

  return Array.from(ids).map(badgeMeta);
}

/** Aggregate badge counts across a list of items (collection summary). */
export function aggregateBadges(items: ReviewItem[]): Array<ReviewBadge & { count: number }> {
  const counts = new Map<ReviewBadgeId, number>();
  for (const it of items) {
    for (const b of deriveBadges(it)) {
      counts.set(b.id, (counts.get(b.id) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ ...badgeMeta(id), count }));
}

export function badgeToneClasses(tone: ReviewBadge["tone"]): string {
  switch (tone) {
    case "red":   return "bg-red-50 text-red-800 border-red-300";
    case "amber": return "bg-amber-50 text-amber-900 border-amber-300";
    case "ink":   return "bg-ink text-ivory border-ink";
    case "stone": return "bg-stone-100 text-stone-700 border-stone-300";
  }
}