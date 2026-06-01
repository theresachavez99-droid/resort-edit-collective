/**
 * Look DNA — the canonical sourcing brief for every look on Resort Edit.
 *
 * Order of operations (HARD RULE, never reversed):
 *   1. Create Look DNA
 *   2. Source products (Firecrawl, approved retailers/brands)
 *   3. Validate products (URL + image + PDP integrity)
 *   4. Score products (productScoring.ts, reject below threshold)
 *   5. Build wardrobe (apply category rules — water vs non-water)
 *   6. Generate AI muse image FROM sourced products
 *   7. Publish look page
 *
 * Muse imagery MUST NOT be generated before sourcing. Products are not
 * chosen to match a fantasy image — the muse image emulates real sourced
 * products.
 */

export type LookTier = "luxury" | "mid-luxe" | "riviera-finds";

export type LookDNA = {
  /** Stable id e.g. "day-2/look-a" — used to join with lookbook + fallbacks. */
  id: string;
  destination: string;
  activity: string;
  mood: string;
  /** Palette as a small set of plain-English color words. */
  palette: string[];
  silhouette: string;
  printLanguage: string;
  resortEnergy: string;
  ageAlignment: string;
  /** Free-form list of styling cues (e.g. "slick bun", "layered gold"). */
  stylingNotes: string[];
  /**
   * True when the look is centered around water (yacht, beach, pool, boat).
   * Drives the wardrobe rules engine — water looks unlock swim categories,
   * non-water looks disable swim entirely.
   */
  isWaterLook: boolean;
  /** Tier this DNA was authored against. Other tiers re-source from it. */
  tier: LookTier;
};

/**
 * DNA registry. Add a new entry BEFORE sourcing a look.
 * Day 2 / Look A is the proof-of-concept entry.
 */
export const LOOK_DNA: Record<string, LookDNA> = {
  "day-2/look-a": {
    id: "day-2/look-a",
    destination: "Portofino",
    activity: "Beach Club Lunch — Lemon Cabana",
    mood: "Mediterranean Maximalist",
    palette: ["lemon yellow", "ivory", "Capri blue", "gold"],
    silhouette: "Coordinated separates with movement; fluid kaftan layer over swim",
    printLanguage: "Lemon, majolica tile, painted citrus, fine stripe",
    resortEnergy: "Elevated beach club glamour — Dolce Vita lunch by the water",
    ageAlignment: "Sophisticated women 35–49",
    stylingNotes: [
      "raffia bag",
      "oversized tortoise sunglasses",
      "layered gold (hoops + lariat)",
      "espadrille or flat woven sandal",
      "slick low bun or silk scarf in hair",
    ],
    isWaterLook: true,
    tier: "luxury",
  },
};

export function getLookDNA(id: string): LookDNA | undefined {
  return LOOK_DNA[id];
}

/**
 * Wardrobe rules engine — derives required slot list from Look DNA.
 * Water looks unlock swim + cover-ups. Non-water looks expand into
 * dresses/separates and explicitly DISABLE swim.
 */
export type WardrobeSlot =
  | "swim-bikini"
  | "swim-bandeau"
  | "swim-one-piece"
  | "cover-up"
  | "outfit"
  | "shoes-sandal"
  | "shoes-wedge-or-heel"
  | "shoes-flat-or-espadrille"
  | "bag"
  | "earrings"
  | "necklace"
  | "bracelet-or-ring"
  | "sunglasses"
  | "hair-detail"
  | "optional-layer";

export type WardrobeBlueprint = {
  required: WardrobeSlot[];
  minPerSlot: Partial<Record<WardrobeSlot, number>>;
  /** Slots explicitly forbidden — e.g. swim on a non-water look. */
  forbidden: WardrobeSlot[];
};

const COMMON_REQUIRED: WardrobeSlot[] = [
  "shoes-sandal",
  "bag",
  "earrings",
  "necklace",
  "bracelet-or-ring",
  "hair-detail",
];

export function buildWardrobeBlueprint(dna: LookDNA): WardrobeBlueprint {
  if (dna.isWaterLook) {
    return {
      required: [
        "swim-bikini",
        "swim-bandeau",
        "swim-one-piece",
        "cover-up",
        ...COMMON_REQUIRED,
        "sunglasses",
      ],
      minPerSlot: {
        "swim-bikini": 3,
        "swim-bandeau": 3,
        "swim-one-piece": 3,
        "cover-up": 3,
        bag: 2,
        "shoes-sandal": 3,
      },
      forbidden: [],
    };
  }
  return {
    required: ["outfit", ...COMMON_REQUIRED, "sunglasses", "shoes-wedge-or-heel"],
    minPerSlot: {
      outfit: 3,
      "shoes-sandal": 2,
      "shoes-wedge-or-heel": 2,
      bag: 2,
    },
    forbidden: ["swim-bikini", "swim-bandeau", "swim-one-piece"],
  };
}