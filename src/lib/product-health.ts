/**
 * Product availability model — shared (client-safe) types and pure resolution.
 *
 * Resort Edit looks are permanent editorial concepts with *replaceable*
 * commerce items. A look never breaks because a PDP dies: each slot holds one
 * primary product plus up to three approved backups, and exactly one product
 * is displayed publicly at a time.
 *
 * Resolution is deterministic and never invents a substitute:
 *   1. primary, when `active`
 *   2. otherwise the lowest `replacement_priority` backup that is `active`
 *   3. otherwise `needs_review` → the public page renders a non-clickable
 *      "Replacement in review" state (never a dead link).
 */
export const PRODUCT_STATUSES = [
  "active",
  "sold_out",
  "unavailable",
  "404",
  "needs_review",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const CANDIDATE_APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type CandidateApprovalStatus = (typeof CANDIDATE_APPROVAL_STATUSES)[number];

/** Maximum approved backups per slot (primary excluded). */
export const MAX_BACKUPS_PER_SLOT = 3;

export type StyleDna = {
  category?: string;
  color?: string;
  silhouette?: string;
  fabric?: string;
  neckline?: string;
  fit?: string;
  occasion?: string;
  luxury_level?: string;
  editorial_notes?: string;
};

/** Public-safe projection of a slot product (mirrors `public_shop_slot_display`). */
export type SlotProductDisplay = {
  destination: string;
  moment: string;
  look_key: string;
  slot: string;
  slot_label: string | null;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string | null;
  price: string | null;
  status: ProductStatus;
  is_primary: boolean;
  replacement_priority: number;
};

export type SlotResolution =
  | { state: "live"; product: SlotProductDisplay; promotedBackup: boolean }
  | { state: "needs_review"; primary: SlotProductDisplay | null };

/** Slot key used to match DB rows against curated editorial data. */
export function slotKey(slot: string): string {
  return slot.trim().toLowerCase();
}

/**
 * Choose the single product to display for a slot. Backups are only eligible
 * when already approved into the slot (an unapproved candidate never reaches
 * `shop_slot_products`), so promotion here is safe and never automatic
 * publishing of unvetted product.
 */
export function resolveSlot(rows: SlotProductDisplay[]): SlotResolution {
  const primary = rows.find((r) => r.is_primary) ?? null;
  if (primary && primary.status === "active" && primary.url) {
    return { state: "live", product: primary, promotedBackup: false };
  }
  const backup = rows
    .filter((r) => !r.is_primary && r.status === "active" && r.url)
    .sort((a, b) => a.replacement_priority - b.replacement_priority)[0];
  if (backup) return { state: "live", product: backup, promotedBackup: true };
  return { state: "needs_review", primary };
}

/** Group public rows into a `slot → resolution` map for one moment. */
export function resolveMomentSlots(
  rows: SlotProductDisplay[],
): Record<string, SlotResolution> {
  const bySlot = new Map<string, SlotProductDisplay[]>();
  for (const row of rows) {
    const key = slotKey(row.slot);
    const list = bySlot.get(key) ?? [];
    list.push(row);
    bySlot.set(key, list);
  }
  const out: Record<string, SlotResolution> = {};
  for (const [key, list] of bySlot) out[key] = resolveSlot(list);
  return out;
}

/** Copy shown in place of a broken/unavailable product. Text-first, never a link. */
export const REPLACEMENT_IN_REVIEW_LABEL = "Replacement in review";
