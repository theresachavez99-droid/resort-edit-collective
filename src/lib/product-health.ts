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
  "non_product_url",
  "title_mismatch",
  "blocked_or_inconclusive",
  "needs_review",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/**
 * Statuses that must never render as a clickable outbound link and that make a
 * primary eligible for automatic replacement by an approved, validated backup.
 */
export const FAILED_PRODUCT_STATUSES = [
  "sold_out",
  "unavailable",
  "404",
  "non_product_url",
  "title_mismatch",
] as const satisfies readonly ProductStatus[];

export function isFailedStatus(status: string): boolean {
  return (FAILED_PRODUCT_STATUSES as readonly string[]).includes(status);
}

/**
 * A retailer blocking automated requests is NOT a product failure. These
 * statuses suppress the link but require a human look before replacement.
 */
export function isInconclusiveStatus(status: string): boolean {
  return status === "blocked_or_inconclusive" || status === "needs_review";
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  sold_out: "Sold out",
  unavailable: "Unavailable",
  "404": "404 / removed",
  non_product_url: "Not a product page",
  title_mismatch: "Title mismatch",
  blocked_or_inconclusive: "Inconclusive (retailer blocked)",
  needs_review: "Needs review",
};

/**
 * Public route a look renders on. `destination/moment[/cardKey]` — editorial
 * cards render on their moment page, so both map to the same public route.
 */
export function routeForLookKey(lookKey: string): string {
  const [destination, moment] = lookKey.split("/");
  if (!destination) return "/";
  if (!moment) return `/${destination}`;
  return `/${destination}/${moment}`;
}

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

/** Composite key used to match a DB row to one specific look's slot. */
export function lookSlotKey(lookKey: string, slot: string): string {
  return `${lookKey}::${slotKey(slot)}`;
}

/** True for a hero look key (`destination/moment`), false for editorial looks. */
export function isHeroLookKey(lookKey: string): boolean {
  return lookKey.split("/").length <= 2;
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

/**
 * Group public rows into a `slot → resolution` map for one moment's HERO look.
 * Editorial ("More Resort Edit Looks") rows are excluded here so they can never
 * overwrite a hero slot; use `resolveLookSlots` for those.
 */
export function resolveMomentSlots(
  rows: SlotProductDisplay[],
): Record<string, SlotResolution> {
  const bySlot = new Map<string, SlotProductDisplay[]>();
  for (const row of rows) {
    if (!isHeroLookKey(row.look_key)) continue;
    const key = slotKey(row.slot);
    const list = bySlot.get(key) ?? [];
    list.push(row);
    bySlot.set(key, list);
  }
  const out: Record<string, SlotResolution> = {};
  for (const [key, list] of bySlot) out[key] = resolveSlot(list);
  return out;
}

/**
 * Group rows into a `"lookKey::slot" → resolution` map. Sitewide: works for
 * hero looks and for every supporting/editorial look on the page.
 */
export function resolveLookSlots(
  rows: SlotProductDisplay[],
): Record<string, SlotResolution> {
  const byKey = new Map<string, SlotProductDisplay[]>();
  for (const row of rows) {
    const key = lookSlotKey(row.look_key, row.slot);
    byKey.set(key, [...(byKey.get(key) ?? []), row]);
  }
  const out: Record<string, SlotResolution> = {};
  for (const [key, list] of byKey) out[key] = resolveSlot(list);
  return out;
}

/** Copy shown in place of a broken/unavailable product. Text-first, never a link. */
export const REPLACEMENT_IN_REVIEW_LABEL = "Replacement in review";
