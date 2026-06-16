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
  /** Human-friendly look name (e.g. "Mediterranean Majolica"). */
  name?: string;
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
  /**
   * Phase 2 styling brief fields — drive product sourcing and outfit assembly.
   * Optional so legacy entries continue to compile.
   */
  heroPiece?: string;
  colorStory?: string[];
  printStory?: string;
  accessories?: string[];
  /** Preferred brands for this DNA. Sourcing prioritizes these, then expands. */
  targetBrands?: string[];
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

  // ─────────────────────────────────────────────────────────────────
  // Yacht Day Look DNA registry (Phase 2)
  // These are STYLING BRIEFS, not products. Sourcing engine consumes
  // these to find Vault candidates and rank/score against the brief.
  // ─────────────────────────────────────────────────────────────────

  "yacht-day/mediterranean-majolica": {
    id: "yacht-day/mediterranean-majolica",
    name: "Mediterranean Majolica",
    destination: "Portofino",
    activity: "Yacht Day",
    mood: "Mediterranean glamour",
    palette: ["Capri blue", "ivory", "white", "gold"],
    silhouette: "Bandeau swimwear with flowing pareo layer",
    printLanguage: "Majolica tile, hand-painted ceramic, fine blue stripe",
    resortEnergy: "Old-money coastal — wealthy traveler, relaxed luxury",
    ageAlignment: "Sophisticated women 32–48",
    stylingNotes: [
      "silk scarf in hair",
      "layered fine gold",
      "flat woven sandal",
      "raffia bag",
    ],
    isWaterLook: true,
    tier: "luxury",
    heroPiece: "Bandeau swimwear",
    colorStory: ["blue", "white"],
    printStory: "Majolica-inspired",
    accessories: ["raffia bag", "gold jewelry", "flat sandals", "silk scarf"],
    targetBrands: ["Alexandra Miro", "Dolce & Gabbana", "Cala de la Cruz"],
  },

  "yacht-day/emerald-riviera": {
    id: "yacht-day/emerald-riviera",
    name: "Emerald Riviera",
    destination: "Portofino",
    activity: "Yacht Day",
    mood: "Quiet confidence — harbor elegance",
    palette: ["emerald", "deep green", "gold", "ivory"],
    silhouette: "Structured one-piece or sculpted bikini, clean lines",
    printLanguage: "Solid jewel tone; subtle ribbing or matte texture",
    resortEnergy: "Wealthy traveler — understated, expensive, considered",
    ageAlignment: "Sophisticated women 35–50",
    stylingNotes: [
      "polished gold cuff",
      "luxury leather or suede sandal",
      "woven tote",
      "minimal hair — sleek low pony",
    ],
    isWaterLook: true,
    tier: "luxury",
    heroPiece: "Structured swimwear",
    colorStory: ["emerald green"],
    accessories: ["gold jewelry", "luxury sandals", "woven tote"],
    targetBrands: ["Eres", "Melissa Odabash", "Johanna Ortiz"],
  },

  "yacht-day/coral-aperitivo": {
    id: "yacht-day/coral-aperitivo",
    name: "Coral Aperitivo",
    destination: "Portofino",
    activity: "Yacht Day",
    mood: "Playful luxury — late-afternoon spritz on deck",
    palette: ["coral", "terracotta", "warm gold", "sand"],
    silhouette: "Printed bikini or playful one-piece with ruffle detail",
    printLanguage: "Latin-American botanical, hand-painted floral, gradient coral",
    resortEnergy: "Joyful, sun-warmed, confident colour",
    ageAlignment: "Sophisticated women 28–45",
    stylingNotes: [
      "stack of gold bangles",
      "raffia tote and raffia earrings",
      "warm-tone lip",
      "loose tousled hair",
    ],
    isWaterLook: true,
    tier: "luxury",
    heroPiece: "Printed swimwear",
    colorStory: ["coral", "terracotta"],
    accessories: ["gold jewelry", "raffia accessories"],
    targetBrands: ["Agua by Agua Bendita", "Johanna Ortiz", "Alemais"],
  },

  "yacht-day/ivory-and-gold": {
    id: "yacht-day/ivory-and-gold",
    name: "Ivory & Gold",
    destination: "Portofino",
    activity: "Yacht Day",
    mood: "Sophisticated luxury — quiet expensive",
    palette: ["ivory", "cream", "sand", "antique gold"],
    silhouette: "Luxury one-piece, sculpted, often cut-out or draped",
    printLanguage: "Solid neutrals; matte or subtle metallic finish",
    resortEnergy: "Editorial old-money — Slim Aarons composure",
    ageAlignment: "Sophisticated women 35–55",
    stylingNotes: [
      "statement gold cuff or chunky chain",
      "neutral leather sandal",
      "tortoise oversized sunglasses",
      "sleek wet-look or low chignon",
    ],
    isWaterLook: true,
    tier: "luxury",
    heroPiece: "Luxury one-piece",
    colorStory: ["ivory", "cream", "sand"],
    accessories: ["statement gold jewelry", "neutral sandals"],
    targetBrands: ["Eres", "Zimmermann"],
  },

  "yacht-day/mediterranean-floral": {
    id: "yacht-day/mediterranean-floral",
    name: "Mediterranean Floral",
    destination: "Portofino",
    activity: "Yacht Day",
    mood: "Editorial Riviera glamour",
    palette: ["multi-color floral", "rose", "sky", "leaf green", "gold"],
    silhouette: "Floral bikini or romantic one-piece with ruffle / tie detail",
    printLanguage: "Painterly multi-color floral, watercolor bloom, Provençal sprig",
    resortEnergy: "Riviera magazine cover — joyful, photographed, romantic",
    ageAlignment: "Sophisticated women 28–48",
    stylingNotes: [
      "raffia clutch",
      "fine gold layering",
      "natural-finish skin",
      "loose beach waves",
    ],
    isWaterLook: true,
    tier: "luxury",
    heroPiece: "Floral swimwear",
    colorStory: ["multi-color floral"],
    accessories: ["gold jewelry", "raffia accessories"],
    targetBrands: ["Agua by Agua Bendita", "Zimmermann", "Faithfull the Brand"],
  },
};

export function getLookDNA(id: string): LookDNA | undefined {
  return LOOK_DNA[id];
}

/**
 * Convenience: all Yacht Day briefs. Sourcing engine uses this set to drive
 * the Portofino yacht-day inventory build.
 */
export function getYachtDayDNA(): LookDNA[] {
  return Object.values(LOOK_DNA).filter((d) => d.activity === "Yacht Day");
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