/**
 * Permanent Resort Edit merchandising exclusions.
 *
 * EDITORIAL RULE: Resort Edit does not merchandise RINGS. Rings are never
 * sourced, recommended, auto-filled, scored, required, or displayed anywhere
 * in the public experience (complete looks, More Resort Edit Looks, supporting
 * looks, product grids, My Edit saved looks, admin sourcing workflows).
 *
 * All other jewelry — earrings, necklaces, bracelets/cuffs, watches — is
 * unaffected and must keep working exactly as before.
 *
 * Historical database rows and legacy static entries are NOT deleted; they are
 * excluded from public merchandising and from future sourcing by the guards in
 * this module. Filter every product list through `excludeUnmerchandisable`
 * before rendering or scoring.
 */

/** Slot/category tokens that are permanently excluded from merchandising. */
export const EXCLUDED_SLOT_TOKENS = ["ring", "rings", "signet"] as const;

/**
 * True when a slot/category label refers to an excluded product type.
 * Deliberately label-driven (slot / category / slotLabel) — never title-driven,
 * so "Ring Wrap Sandal" or "Hoop Earrings" are never mis-flagged.
 */
export function isExcludedSlotLabel(label?: string | null): boolean {
  if (!label) return false;
  const l = label.toLowerCase();
  if (/earring/.test(l)) return false;
  return EXCLUDED_SLOT_TOKENS.some((token) =>
    new RegExp(`(^|[^a-z])${token}([^a-z]|$)`).test(l),
  );
}

type SlotLike = {
  slot?: string | null;
  slotLabel?: string | null;
  category?: string | null;
  slot_category?: string | null;
  product_category?: string | null;
  role?: string | null;
};

/** True when a product/slot record is permanently excluded from merchandising. */
export function isExcludedProduct(item: SlotLike | null | undefined): boolean {
  if (!item) return false;
  return (
    isExcludedSlotLabel(item.slot) ||
    isExcludedSlotLabel(item.slotLabel) ||
    isExcludedSlotLabel(item.category) ||
    isExcludedSlotLabel(item.slot_category) ||
    isExcludedSlotLabel(item.product_category) ||
    isExcludedSlotLabel(item.role)
  );
}

/** Drop every permanently excluded product from a list. */
export function excludeUnmerchandisable<T extends SlotLike>(items: readonly T[] | null | undefined): T[] {
  return (items ?? []).filter((item) => !isExcludedProduct(item));
}
