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
  "emotional_impact",
  "color_story",
  "print_story",
  "accessory_ecosystem",
  "discovery_value",
  "resort_edit_luxury_score",
  "resort_edit_test",
] as const;

export type LookScoreCategory = (typeof LOOK_SCORE_CATEGORIES)[number];

export const LOOK_SCORE_LABELS: Record<LookScoreCategory, string> = {
  destination_specificity: "Destination Specificity",
  activity_fidelity: "Activity Fidelity",
  styling_cohesion: "Styling Cohesion",
  luxury_traveler_appeal: "Luxury Traveler Appeal",
  editorial_uniqueness: "Editorial Uniqueness",
  saveability: "Saveability",
  emotional_impact: "Emotional Impact",
  color_story: "Color Story",
  print_story: "Print Story",
  accessory_ecosystem: "Accessory Ecosystem",
  discovery_value: "Discovery Value",
  resort_edit_luxury_score: "Overall Resort Edit Score",
  resort_edit_test: "Resort Edit Test (would she save it?)",
};

const WEIGHTS: Record<LookScoreCategory, number> = {
  // Editorial-fidelity overhaul: reward destination specificity, editorial
  // uniqueness, emotional impact, saveability, luxury traveler appeal.
  // Down-weight generic "luxury score" and merely competent cohesion.
  destination_specificity: 2.0,
  editorial_uniqueness: 1.75,
  emotional_impact: 1.5,
  saveability: 1.5,
  luxury_traveler_appeal: 1.5,
  resort_edit_test: 2.0,
  styling_cohesion: 1.0,
  activity_fidelity: 1.0,
  color_story: 1.0,
  print_story: 1.0,
  accessory_ecosystem: 1.0,
  discovery_value: 0.75,
  resort_edit_luxury_score: 0.5,
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
  "sunglasses",
  "hair_detail",
  "optional_layer",
] as const;

export type LookSlot = (typeof LOOK_SLOTS)[number];

export const LOOK_SLOT_LABELS: Record<LookSlot, string> = {
  swimwear: "Swimwear",
  dress_or_coverup: "Dress / Coverup / Set / Layer",
  shoes: "Shoes",
  bag: "Bag",
  earrings: "Earrings",
  necklace: "Necklace",
  bracelet: "Bracelet",
  sunglasses: "Sunglasses",
  hair_detail: "Hair Detail",
  optional_layer: "Optional Layer",
};

/** Preset feedback chips for the Improve Look workflow. */
export const IMPROVE_FEEDBACK_PRESETS = [
  "More Mediterranean",
  "More Portofino",
  "More colorful",
  "More luxury",
  "More yacht wife",
  "More editorial",
  "More destination-specific",
  "More saveable",
  "More wealthy traveler",
  "More polished",
  "More Steven Dann",
  "Less influencer",
  "Less generic",
  "Less crochet",
  "Less repetitive",
  "Better accessories",
  "Better jewelry",
  "Better bag",
  "Better sunglasses",
  "Better color story",
  "Better print story",
] as const;