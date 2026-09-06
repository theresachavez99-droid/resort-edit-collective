/**
 * VISIBLE-PRODUCT DECLARATIONS FOR PUBLIC LILLA IMAGES
 *
 * Every public Lilla editorial image declares the product categories that are
 * visibly worn in the photograph, keyed by look key
 * (`portofino/<moment>/<card-key>`). Completeness is then deterministic and
 * testable: a visible category with no live, valid linked row makes the whole
 * look incomplete, and the look is hidden rather than partially shopped.
 *
 * Derived from each card's own alt text / editorial caption. When a new Lilla
 * image ships, add its declaration here.
 */
import type { VisibleProductSlot } from "@/lib/look-atomic-completeness";

export const LILLA_VISIBLE_SLOTS: Record<string, readonly VisibleProductSlot[]> = {
  // Arrival
  "portofino/arrival/blue-lagoon-stripe": [
    "outfit",
    "shoes",
    "bag",
    "sunglasses",
    "earrings",
    "necklace",
    "bracelet",
  ],
  "portofino/arrival/butter-light-arrival": [
    "outfit",
    "shoes",
    "bag",
    "earrings",
    "necklace",
    "bracelet",
  ],

  // Riviera Dinner (evening — no sunglasses)
  "portofino/riviera-dinner/tide-at-blue-hour": [
    "outfit",
    "shoes",
    "bag",
    "earrings",
    "bracelet",
  ],
  // Pool Lounging — a woven mini bag is visible in frame, unlinked.
  "portofino/pool-lounging/white-wave-knit": ["outfit", "bag"],
  // Long Lunch
  "portofino/long-lunch/starfruit-at-lunch": ["outfit", "shoes", "bag"],
  "portofino/long-lunch/white-eyelet-at-noon": [
    "outfit",
    "shoes",
    "bag",
    "sunglasses",
    "earrings",
    "bracelet",
  ],
  // Exploring the Harbor
  "portofino/exploring-the-harbor/eloise-at-noon": [
    "outfit",
    "shoes",
    "bag",
    "necklace",
    "earrings",
    "bracelet",
  ],
  // Shopping — the retired green eyelet frame: tan thong heels and a raffia
  // top-handle bag are both visible; neither has a verified linked product.
  "portofino/shopping/green-eyelet-on-via-roma": [
    "outfit",
    "shoes",
    "bag",
    "sunglasses",
    "necklace",
    "earrings",
    "bracelet",
  ],
  // Nightcap (evening)
  "portofino/nightcap/ivory-after-dark": ["outfit", "shoes", "bag", "earrings", "bracelet"],
  "portofino/nightcap/the-midnight-drape": ["outfit", "shoes", "bag", "earrings", "bracelet"],
};
