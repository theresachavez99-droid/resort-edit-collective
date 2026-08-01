/**
 * Hero Outfit slot templates — Buying Office V2.
 *
 * Defines the canonical accessory slots that must be filled around a
 * Hero Outfit, per moment profile (Day / Night / Pool-Beach-Yacht).
 *
 * Hero garments themselves never appear in this list — they're locked
 * in by the Founder during Stage 3 import and never replaced by the
 * Stylist Engine.
 */

export type AccessoryProfile = "day" | "night" | "water";

export type SlotDefinition = {
  slot: string;
  label: string;
  required: boolean;
  category: "footwear" | "bag" | "eyewear" | "jewelry" | "headwear" | "hair";
  note?: string;
};

const DAY_SLOTS: SlotDefinition[] = [
  { slot: "shoes", label: "Shoes", required: true, category: "footwear" },
  { slot: "bag", label: "Bag / tote", required: true, category: "bag" },
  { slot: "sunglasses", label: "Sunglasses", required: true, category: "eyewear" },
  { slot: "earrings", label: "Earrings", required: true, category: "jewelry" },
  { slot: "necklace", label: "Necklace", required: true, category: "jewelry" },
  { slot: "bracelet", label: "Bracelet", required: true, category: "jewelry" },
  { slot: "ring", label: "Ring", required: true, category: "jewelry" },
];

const NIGHT_SLOTS: SlotDefinition[] = [
  { slot: "shoes", label: "Shoes", required: true, category: "footwear" },
  { slot: "bag", label: "Evening bag", required: true, category: "bag" },
  { slot: "earrings", label: "Earrings", required: true, category: "jewelry" },
  { slot: "necklace", label: "Necklace", required: true, category: "jewelry" },
  { slot: "bracelet", label: "Bracelet", required: true, category: "jewelry" },
  { slot: "ring", label: "Ring", required: true, category: "jewelry" },
];

const WATER_SLOTS: SlotDefinition[] = [
  { slot: "shoes", label: "Sandals", required: true, category: "footwear" },
  { slot: "bag", label: "Tote", required: true, category: "bag" },
  { slot: "sunglasses", label: "Sunglasses", required: true, category: "eyewear" },
  { slot: "earrings", label: "Earrings", required: true, category: "jewelry" },
  {
    slot: "necklace_or_bracelet",
    label: "Necklace or bracelet",
    required: true,
    category: "jewelry",
    note: "Either slot satisfies the requirement.",
  },
];

/**
 * Map Portofino moments → accessory profile. New destinations extend
 * this map; an unknown moment defaults to "day".
 */
const MOMENT_PROFILE: Record<string, AccessoryProfile> = {
  "Arrival Day": "day",
  "Espresso Morning": "day",
  "Exploring the Harbor": "day",
  "Yacht Day": "water",
  "Beach Club": "water",
  "Pool Lounging": "water",
  "Shopping": "day",
  "Long Lunch": "day",
  "Harbor Aperitivo": "night",
  "Sunset Views": "night",
  "Riviera Dinner": "night",
  "Nightcap": "night",
};

export function profileForMoment(moment: string): AccessoryProfile {
  return MOMENT_PROFILE[moment] ?? "day";
}

export function slotsForMoment(moment: string): SlotDefinition[] {
  const p = profileForMoment(moment);
  if (p === "night") return NIGHT_SLOTS;
  if (p === "water") return WATER_SLOTS;
  return DAY_SLOTS;
}

/**
 * Hero-garment categories the Founder might import. Used to mark a
 * slot as already filled by a Hero garment (so the engine doesn't
 * re-source it).
 */
export const HERO_GARMENT_CATEGORIES = [
  "dress",
  "jumpsuit",
  "romper",
  "top",
  "shirt",
  "blouse",
  "vest",
  "pant",
  "trouser",
  "short",
  "skirt",
  "swim",
  "swimsuit",
  "bikini",
  "coverup",
  "kaftan",
  "pareo",
] as const;

export function isHeroGarmentCategory(category: string | null | undefined): boolean {
  if (!category) return false;
  const c = category.toLowerCase();
  return HERO_GARMENT_CATEGORIES.some((k) => c.includes(k));
}

/**
 * Validation result for publishing a Founder Look from a Hero Outfit.
 * `missing` lists required slots that have no selected candidate.
 */
export type PublishValidation = {
  ok: boolean;
  missing: SlotDefinition[];
  profile: AccessoryProfile;
};

export function validateForPublish(
  moment: string,
  filledSlots: Set<string>,
): PublishValidation {
  const profile = profileForMoment(moment);
  const defs = slotsForMoment(moment);
  const missing: SlotDefinition[] = [];
  for (const def of defs) {
    if (!def.required) continue;
    if (def.slot === "necklace_or_bracelet") {
      if (!filledSlots.has("necklace") && !filledSlots.has("bracelet") && !filledSlots.has("necklace_or_bracelet")) {
        missing.push(def);
      }
      continue;
    }
    if (!filledSlots.has(def.slot)) missing.push(def);
  }
  return { ok: missing.length === 0, missing, profile };
}