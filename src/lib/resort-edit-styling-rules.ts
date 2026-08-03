/**
 * Resort Edit styling policy — the single source of truth every AI styling
 * workflow must apply. Client-safe (no server imports) so the admin UI can
 * display the exact rules the model was given.
 */

/** Bumped whenever the prompt or rule set changes; stored on every candidate. */
export const AI_STYLIST_PROMPT_VERSION = "resort-edit-stylist-v1";

/** Approved affiliate retailers, in priority order. */
export const APPROVED_RETAILER_PRIORITY = [
  "Revolve",
  "Shopbop",
  "Saks Fifth Avenue",
  "Neiman Marcus",
  "Nordstrom",
  "Bloomingdale's",
] as const;

/** Brand-direct is a last resort, allowed only when no approved affiliate carries the exact product. */
export const BRAND_DIRECT_POLICY =
  "Brand-direct PDPs are permitted ONLY when no approved affiliate retailer carries the exact product.";

/**
 * Hard rules. These are injected verbatim into every stylist prompt and are
 * also enforced server-side (URL policy + no-ring exclusions + PDP probing);
 * the model is never trusted on its own.
 */
export const RESORT_EDIT_STYLING_RULES = [
  "Editorial consistency and destination personality come before retailer convenience.",
  `Approved retailer priority: ${APPROVED_RETAILER_PRIORITY.join(" → ")}. ${BRAND_DIRECT_POLICY}`,
  "Only exact product detail pages (PDPs). Never search pages, category/collection pages, homepages, guessed URLs, redirects to collections, or dead links.",
  "Rings are never merchandised on Resort Edit. Never propose a ring in any slot.",
  "Jewelry within a single look should stay within one designer and one metal family wherever possible.",
  "Avoid duplicating the same accessory across nearby looks in the same moment.",
  "Preserve the moment narrative and activity appropriateness — the piece must belong in that scene.",
  "Maintain luxury-editorial quality. No filler substitutes and no fast-fashion stand-ins.",
  "Distinguish hero-quality pieces (the garment the look is built on) from acceptable supporting accessories.",
  "Replace only the failed slot. Keep every other piece in the outfit intact unless a full restyle was explicitly requested.",
] as const;

/** Slot roles that carry the look; everything else is supporting. */
export const HERO_SLOT_ROLES = [
  "dress",
  "corset",
  "top",
  "vest",
  "waistcoat",
  "trousers",
  "pant",
  "skirt",
  "jumpsuit",
  "coat",
  "blazer",
] as const;

export function slotRole(slot: string): "hero" | "supporting" {
  const s = slot.trim().toLowerCase();
  return HERO_SLOT_ROLES.some((h) => s.includes(h)) ? "hero" : "supporting";
}

/**
 * Auto-promotion configuration. Default is fully manual: AI candidates are
 * stored for review and never published without an admin approval. Flip
 * `enabled` (and keep the guards) only when the owner explicitly asks for it.
 */
export const AUTO_PROMOTION_RULE = {
  enabled: false,
  /** Minimum AI matching score required before an auto-promotion is even considered. */
  minMatchingScore: 92,
  /** Auto-promotion is only ever considered for supporting accessories, never hero pieces. */
  allowedRoles: ["supporting"] as const,
  /** The PDP must verify as reachable at approval time regardless of score. */
  requireVerifiedPdp: true,
} as const;

/** Budget tiers used to keep a replacement in the same price world as the piece it replaces. */
export function budgetTierForPrice(price: string | null | undefined): string {
  const n = Number(String(price ?? "").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "contemporary-premium ($150–$600)";
  if (n < 150) return "accessible-premium (under $150)";
  if (n < 600) return "contemporary-premium ($150–$600)";
  if (n < 1500) return "luxury ($600–$1,500)";
  return "high-luxury ($1,500+)";
}

/** Season hint from the current date — resort styling is seasonally aware. */
export function currentSeason(now: Date = new Date()): string {
  const m = now.getUTCMonth();
  if (m <= 1 || m === 11) return "Northern-hemisphere winter (resort / cruise season)";
  if (m <= 4) return "Spring resort";
  if (m <= 7) return "High summer Mediterranean";
  return "Early autumn / late-season Mediterranean";
}