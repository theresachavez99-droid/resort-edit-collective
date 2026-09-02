/**
 * ATOMIC LOOK COMPLETENESS
 *
 * A public Lilla look is all-or-nothing. It may render its image, itemization,
 * accordion/CTA or supporting-card expansion only when EVERY product category
 * visible in the photograph is present, active, and carries a valid exact
 * external product URL.
 *
 * Rules encoded here:
 *  - Base requirement: outfit · shoes · bag.
 *  - Daytime looks that visibly wear sunglasses must link sunglasses.
 *  - Every declared visible accessory (earrings, necklace, bracelet, hat,
 *    belt, scarf, layer …) needs its own active, valid link.
 *  - Any missing / sold-out / needs_review / null / placeholder / malformed /
 *    non-http(s) row makes the WHOLE look incomplete. The caller hides the
 *    look — it never renders a partial set, a "Still sourcing" line, a
 *    disabled row, or an omission explanation.
 *
 * Pure and client-safe: shared by the moment route, the repo-wide Lilla audit
 * and the regression tests, so runtime and CI can never drift.
 */
import { isPublishableProductUrl } from "./shop-url-policy";
import { isExcludedSlotLabel } from "./merchandising-exclusions";

export const VISIBLE_PRODUCT_SLOTS = [
  "outfit",
  "layer",
  "shoes",
  "bag",
  "sunglasses",
  "hat",
  "belt",
  "scarf",
  "earrings",
  "necklace",
  "bracelet",
] as const;

export type VisibleProductSlot = (typeof VISIBLE_PRODUCT_SLOTS)[number];

/** Categories that must always be linked for any published look. */
export const BASE_REQUIRED_SLOTS: readonly VisibleProductSlot[] = ["outfit", "shoes", "bag"];

/** Statuses that count as a live, publishable commerce row. */
const LIVE_STATUSES = new Set(["active", "live", "ok", "verified"]);

/**
 * Map any free-text slot label ("Hero Piece · Dress", "Cuff", "Reference
 * Dress") onto a canonical visible-product slot. Rings and other permanently
 * excluded merchandise resolve to `null` — never required, never rendered.
 */
export function canonicalVisibleSlot(
  label: string | null | undefined,
): VisibleProductSlot | null {
  const l = (label ?? "").trim().toLowerCase();
  if (!l) return null;
  if (isExcludedSlotLabel(l)) return null;
  if (/earring|hoop|stud/.test(l)) return "earrings";
  if (/necklace|pendant|chain|choker/.test(l)) return "necklace";
  if (/bracelet|cuff|bangle/.test(l)) return "bracelet";
  if (/sunglass|eyewear/.test(l)) return "sunglasses";
  if (/hat|boater|visor/.test(l)) return "hat";
  if (/belt/.test(l)) return "belt";
  if (/scarf|headband|hair/.test(l)) return "scarf";
  if (/shoe|sandal|heel|espadrille|slide|flat|mule|loafer|pump|boot/.test(l)) return "shoes";
  if (/bag|clutch|tote|pouch|basket|purse|minaudiere/.test(l)) return "bag";
  if (/cardigan|blazer|jacket|coat|cape|kaftan|caftan|cover|wrap|shawl|layer/.test(l))
    return "layer";
  if (
    /dress|gown|outfit|look|hero|reference|top|blouse|shirt|cami|corset|vest|waistcoat|pant|trouser|short|skirt|jumpsuit|romper|swim|bikini|maillot|one-piece|set|separates|knit/.test(
      l,
    )
  )
    return "outfit";
  return null;
}

export type AtomicRow = {
  /** Free-text editorial slot label. */
  slot?: string | null;
  slotLabel?: string | null;
  category?: string | null;
  url?: string | null;
  /** DB status when known (`active`, `sold_out`, `needs_review`, …). */
  status?: string | null;
  /** Editor marker for an approved piece with no verified URL yet. */
  unsourced?: boolean;
  /** Runtime health marker for a failed link awaiting replacement. */
  inReview?: boolean;
};

/** True only when this row may ship as a live, clickable commerce row. */
export function isLiveAtomicRow(row: AtomicRow): boolean {
  if (row.unsourced || row.inReview) return false;
  const status = (row.status ?? "").trim().toLowerCase();
  if (status && !LIVE_STATUSES.has(status)) return false;
  return isPublishableProductUrl(row.url);
}

export type AtomicLookInput = {
  /**
   * Categories visibly worn in the image. Declared per look so completeness is
   * deterministic and testable rather than inferred from prose.
   */
  visibleProductSlots: readonly VisibleProductSlot[];
  rows: readonly AtomicRow[];
};

export type AtomicLookVerdict = {
  complete: boolean;
  /** Visible categories with no live linked row. */
  missing: VisibleProductSlot[];
};

/**
 * Evaluate a look atomically. `missing` is the audit trail; `complete` is the
 * only thing a render path may branch on.
 */
export function evaluateAtomicLook(input: AtomicLookInput): AtomicLookVerdict {
  const required = new Set<VisibleProductSlot>([
    ...BASE_REQUIRED_SLOTS,
    ...input.visibleProductSlots,
  ]);
  const live = new Set<VisibleProductSlot>();
  for (const row of input.rows) {
    if (!isLiveAtomicRow(row)) continue;
    const slot = canonicalVisibleSlot(row.slot ?? row.slotLabel ?? row.category);
    if (slot) live.add(slot);
  }
  const missing = [...required].filter((s) => !live.has(s));
  // Preserve the canonical ordering for stable audit output.
  missing.sort(
    (a, b) => VISIBLE_PRODUCT_SLOTS.indexOf(a) - VISIBLE_PRODUCT_SLOTS.indexOf(b),
  );
  return { complete: missing.length === 0, missing };
}
