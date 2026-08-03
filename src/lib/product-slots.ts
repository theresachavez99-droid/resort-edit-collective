/**
 * Canonical product-slot taxonomy.
 *
 * Curated look data across the project uses free-text labels ("Bag",
 * "Shoe", "Hero Piece · Trousers", "THE LOOK", "Cuff", …). This module maps
 * every observed label onto a small canonical enum so completeness can be
 * validated, without ever discarding the original editorial display label.
 *
 * NOTE: `ring` is intentionally NOT a slot — Resort Edit does not merchandise
 * rings (see `merchandising-exclusions.ts`). Ring labels resolve to `null` so
 * they are never required, filled, or reported as a missing slot.
 */
import { isExcludedSlotLabel } from "./merchandising-exclusions";

export const PRODUCT_SLOTS = [
  "outfit",
  "shoes",
  "bag",
  "earrings",
  "necklace",
  "bracelet",
  "sunglasses",
  "hat",
  "layer",
  "hair",
] as const;

export type ProductSlot = (typeof PRODUCT_SLOTS)[number];

/** Human label used in audit output and admin summaries. */
export const SLOT_DISPLAY: Record<ProductSlot, string> = {
  outfit: "Outfit",
  shoes: "Shoes",
  bag: "Bag",
  earrings: "Earrings",
  necklace: "Necklace",
  bracelet: "Bracelet",
  sunglasses: "Sunglasses",
  hat: "Hat",
  layer: "Layer",
  hair: "Hair Detail",
};

/**
 * Required slots per moment type.
 *
 * Daytime looks carry sunglasses; evening looks never do. `hat`, `layer` and
 * `hair` stay advisory (reported as optional, never as blockers) because the
 * editorial direction decides them per moment.
 */
export const REQUIRED_SLOTS: Record<"day" | "evening", ProductSlot[]> = {
  day: [
    "outfit",
    "shoes",
    "bag",
    "earrings",
    "bracelet",
    "sunglasses",
    "necklace",
  ],
  evening: ["outfit", "shoes", "bag", "earrings", "bracelet", "necklace"],
};

export const ADVISORY_SLOTS: ProductSlot[] = ["hat", "layer", "hair"];

/** Slots that must NOT appear for a given moment type. */
export const FORBIDDEN_SLOTS: Record<"day" | "evening", ProductSlot[]> = {
  day: [],
  evening: ["sunglasses"],
};

/**
 * Keyword → canonical slot. Order matters: the first matching keyword wins,
 * so more specific terms are listed before broader ones.
 */
const KEYWORD_SLOTS: Array<[string, ProductSlot]> = [
  // jewellery first — "cuff bracelet" must not fall through to a garment
  ["earring", "earrings"],
  ["stud", "earrings"],
  ["hoop", "earrings"],
  ["necklace", "necklace"],
  ["pendant", "necklace"],
  ["bracelet", "bracelet"],
  ["cuff", "bracelet"],
  ["bangle", "bracelet"],
  // accessories
  ["sunglass", "sunglasses"],
  ["eyewear", "sunglasses"],
  ["hat", "hat"],
  ["boater", "hat"],
  ["visor", "hat"],
  ["hair", "hair"],
  ["scarf", "hair"],
  ["headband", "hair"],
  // bags
  ["bag", "bag"],
  ["clutch", "bag"],
  ["tote", "bag"],
  ["pouch", "bag"],
  ["basket", "bag"],
  ["minaudiere", "bag"],
  // shoes
  ["shoe", "shoes"],
  ["sandal", "shoes"],
  ["heel", "shoes"],
  ["mule", "shoes"],
  ["espadrille", "shoes"],
  ["wedge", "shoes"],
  ["flat", "shoes"],
  ["loafer", "shoes"],
  ["slide", "shoes"],
  ["pump", "shoes"],
  ["boot", "shoes"],
  // layers
  ["jacket", "layer"],
  ["blazer", "layer"],
  ["cardigan", "layer"],
  ["coat", "layer"],
  ["cape", "layer"],
  ["kaftan", "layer"],
  ["caftan", "layer"],
  ["cover-up", "layer"],
  ["cover up", "layer"],
  ["coverup", "layer"],
  ["wrap", "layer"],
  ["shawl", "layer"],
  ["knit", "layer"],
  // primary garment (broadest — last)
  ["the look", "outfit"],
  ["hero", "outfit"],
  ["reference", "outfit"],
  ["outfit", "outfit"],
  ["dress", "outfit"],
  ["gown", "outfit"],
  ["skirt", "outfit"],
  ["trouser", "outfit"],
  ["pant", "outfit"],
  ["short", "outfit"],
  ["top", "outfit"],
  ["blouse", "outfit"],
  ["shirt", "outfit"],
  ["cami", "outfit"],
  ["corset", "outfit"],
  ["vest", "outfit"],
  ["waistcoat", "outfit"],
  ["bodysuit", "outfit"],
  ["jumpsuit", "outfit"],
  ["swim", "outfit"],
  ["bikini", "outfit"],
  ["maillot", "outfit"],
  ["one-piece", "outfit"],
  ["set", "outfit"],
  ["separates", "outfit"],
  ["suit", "outfit"],
];

/**
 * Map a free-text editorial label onto a canonical slot.
 * Returns `null` when nothing matches, so callers can report the label as
 * unmapped rather than silently mis-binning it.
 */
export function normalizeSlot(label: string | undefined | null): ProductSlot | null {
  if (!label) return null;
  // Permanently excluded merchandise (rings) never maps to a slot.
  if (isExcludedSlotLabel(label)) return null;
  const l = label.toLowerCase();
  for (const [needle, slot] of KEYWORD_SLOTS) {
    if (l.includes(needle)) return slot;
  }
  return null;
}

/**
 * Resolve a slot from any combination of label fields, preserving the
 * original display label for rendering.
 */
export function resolveSlot(input: {
  slotLabel?: string | null;
  category?: string | null;
  slot?: string | null;
  title?: string | null;
}): { slot: ProductSlot | null; displayLabel: string } {
  const displayLabel =
    input.slotLabel?.trim() ||
    input.category?.trim() ||
    input.slot?.trim() ||
    "";
  const slot =
    normalizeSlot(input.category) ??
    normalizeSlot(input.slotLabel) ??
    normalizeSlot(input.slot) ??
    normalizeSlot(input.title);
  return { slot, displayLabel };
}