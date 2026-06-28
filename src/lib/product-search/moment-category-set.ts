// Editorial Category Sets — replaces "Hero Category" as the primary search
// driver. Each Moment maps to a set of editorially equivalent retail
// categories. The Founder Hero Brief is the source of truth; garment
// categories are retrieval strategies, not editorial constraints.
//
// The Buying Review merges all results into one editorial pool. The Founder
// picks the strongest Hero for the Moment regardless of garment type.

import type { EditorialCategoryKey } from "./category-registry";

export type MomentKey =
  | "arrival"
  | "espresso-morning"
  | "yacht-day"
  | "beach-club"
  | "long-lunch"
  | "shopping"
  | "pool-lounging"
  | "exploring-the-harbor"
  | "harbor-aperitivo"
  | "sunset-views"
  | "riviera-dinner"
  | "nightcap";

export interface EditorialCategorySet {
  moment: MomentKey;
  /** Highest editorial fit for the Moment — weighted first in retrieval. */
  primary: EditorialCategoryKey[];
  /** Editorially equivalent alternates that satisfy the same Brief. */
  secondary: EditorialCategoryKey[];
}

/**
 * Registry of editorially equivalent Hero Categories per Moment.
 * Founder-managed; extend through the admin, not ad-hoc edits.
 */
export const MOMENT_CATEGORY_SETS: Record<MomentKey, EditorialCategorySet> = {
  arrival: {
    moment: "arrival",
    primary: ["tailored_coordinated_short_set", "tailored_linen_set"],
    secondary: [
      "luxury_shirt_dress",
      "structured_day_dress",
      "tailored_playsuit",
      "modern_daywear_set",
      "elevated_matching_set",
      "vest_short_set",
    ],
  },
  "espresso-morning": {
    moment: "espresso-morning",
    primary: ["luxury_shirt_dress", "structured_day_dress"],
    secondary: ["tailored_linen_set", "modern_daywear_set"],
  },
  "yacht-day": {
    moment: "yacht-day",
    primary: ["elevated_matching_set", "tailored_linen_set"],
    secondary: ["luxury_shirt_dress", "modern_daywear_set"],
  },
  "beach-club": {
    moment: "beach-club",
    primary: ["elevated_matching_set"],
    secondary: ["luxury_shirt_dress", "modern_daywear_set"],
  },
  "long-lunch": {
    moment: "long-lunch",
    primary: ["structured_day_dress", "luxury_shirt_dress"],
    secondary: ["elevated_matching_set", "modern_daywear_set"],
  },
  "shopping": {
    moment: "shopping",
    primary: ["tailored_linen_set", "luxury_shirt_dress"],
    secondary: ["modern_daywear_set", "structured_day_dress"],
  },
  "pool-lounging": {
    moment: "pool-lounging",
    primary: ["elevated_matching_set"],
    secondary: ["luxury_shirt_dress", "modern_daywear_set"],
  },
  "exploring-the-harbor": {
    moment: "exploring-the-harbor",
    primary: ["tailored_linen_set", "luxury_shirt_dress"],
    secondary: ["structured_day_dress", "modern_daywear_set", "elevated_matching_set"],
  },
  "harbor-aperitivo": {
    moment: "harbor-aperitivo",
    primary: ["structured_day_dress", "elevated_matching_set"],
    secondary: ["luxury_shirt_dress", "modern_daywear_set"],
  },
  "sunset-views": {
    moment: "sunset-views",
    primary: ["structured_day_dress", "elevated_matching_set"],
    secondary: ["luxury_shirt_dress", "modern_daywear_set"],
  },
  "riviera-dinner": {
    moment: "riviera-dinner",
    primary: ["structured_day_dress", "elevated_matching_set"],
    secondary: ["luxury_shirt_dress"],
  },
  "nightcap": {
    moment: "nightcap",
    primary: ["structured_day_dress", "elevated_matching_set"],
    secondary: ["luxury_shirt_dress"],
  },
};

export function categorySetFor(moment: MomentKey): EditorialCategoryKey[] {
  const set = MOMENT_CATEGORY_SETS[moment];
  return [...set.primary, ...set.secondary];
}

/** Weight used by ranking: primary categories rank above secondary on ties. */
export function categoryTier(
  moment: MomentKey,
  category: EditorialCategoryKey,
): "primary" | "secondary" | "off_set" {
  const set = MOMENT_CATEGORY_SETS[moment];
  if (set.primary.includes(category)) return "primary";
  if (set.secondary.includes(category)) return "secondary";
  return "off_set";
}