/**
 * Resort Edit look-level scoring rubric.
 *
 * The unit of approval is the LOOK, not the product. These ten categories
 * are scored 0–10 per complete outfit and combined into a composite score
 * that emphasizes destination specificity and styling cohesion (1.5×).
 *
 * See mem://features/look-studio for the workflow this scoring drives.
 */
export const LOOK_SCORE_CATEGORIES = [
  "destination_specificity",
  "activity_fidelity",
  "styling_cohesion",
  "luxury_traveler_appeal",
  "editorial_uniqueness",
  "saveability",
  "color_story",
  "print_story",
  "accessory_ecosystem",
  "resort_edit_luxury_score",
] as const;

export type LookScoreCategory = (typeof LOOK_SCORE_CATEGORIES)[number];

export const LOOK_SCORE_LABELS: Record<LookScoreCategory, string> = {
  destination_specificity: "Destination Specificity",
  activity_fidelity: "Activity Fidelity",
  styling_cohesion: "Styling Cohesion",
  luxury_traveler_appeal: "Luxury Traveler Appeal",
  editorial_uniqueness: "Editorial Uniqueness",
  saveability: "Saveability",
  color_story: "Color Story",
  print_story: "Print Story",
  accessory_ecosystem: "Accessory Ecosystem",
  resort_edit_luxury_score: "Resort Edit Luxury Score",
};

const WEIGHTS: Record<LookScoreCategory, number> = {
  destination_specificity: 1.5,
  styling_cohesion: 1.5,
  activity_fidelity: 1,
  luxury_traveler_appeal: 1,
  editorial_uniqueness: 1,
  saveability: 1,
  color_story: 1,
  print_story: 1,
  accessory_ecosystem: 1,
  resort_edit_luxury_score: 1,
};

export type LookScoring = Partial<Record<LookScoreCategory, number>> & {
  rationale?: string;
};

export function composite(scoring: LookScoring): number {
  let total = 0;
  let weight = 0;
  for (const cat of LOOK_SCORE_CATEGORIES) {
    const v = scoring[cat];
    if (typeof v === "number" && Number.isFinite(v)) {
      total += v * WEIGHTS[cat];
      weight += WEIGHTS[cat];
    }
  }
  return weight === 0 ? 0 : Math.round((total / weight) * 100) / 100;
}

export const LOOK_SLOTS = [
  "swimwear",
  "dress_or_coverup",
  "shoes",
  "bag",
  "earrings",
  "necklace",
  "bracelet",
  "ring",
  "sunglasses",
  "hair_detail",
  "optional_layer",
] as const;

export type LookSlot = (typeof LOOK_SLOTS)[number];

export const LOOK_SLOT_LABELS: Record<LookSlot, string> = {
  swimwear: "Swimwear",
  dress_or_coverup: "Dress / Coverup",
  shoes: "Shoes",
  bag: "Bag",
  earrings: "Earrings",
  necklace: "Necklace",
  bracelet: "Bracelet",
  ring: "Ring",
  sunglasses: "Sunglasses",
  hair_detail: "Hair Detail",
  optional_layer: "Optional Layer",
};

/** Preset feedback chips for the Improve Look workflow. */
export const IMPROVE_FEEDBACK_PRESETS = [
  "More Mediterranean",
  "More yacht-wife",
  "More Portofino",
  "More colorful",
  "More luxury",
  "More editorial",
  "Less influencer",
  "Less generic",
  "Less repetitive",
  "More destination-specific",
  "Better accessories",
] as const;