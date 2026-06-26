/**
 * Stylist Engine v4.2 — Signature Swim Archetypes.
 *
 * The engine treats swim as the editorial anchor of a Yacht Day look.
 * Each look is pre-assigned ONE archetype; the rest of the outfit is
 * styled around that swim story via the archetype's cohesion recipe.
 *
 * Pure data + helpers. No I/O. No Supabase. Safe to import anywhere.
 */

export type SwimArchetypeId =
  | "architectural_minimal"
  | "hardware_statement"
  | "mediterranean_print"
  | "crochet_texture"
  | "sculptural_modern"
  | "modern_cutout"
  | "retro_riviera"
  | "high_neck"
  | "asymmetric_statement";

export type SwimArchetype = {
  id: SwimArchetypeId;
  label: string;
  description: string;
  /** Ordered: most-preferred sourcing target first. */
  preferredBrands: string[];
  /** Tokens (lowercase) that, if present in a swim title, hint at this archetype. */
  titleTokens: string[];
  /** Tokens that DISQUALIFY a candidate from this archetype (silhouette mismatch). */
  negativeTokens: string[];
  /**
   * Cohesion recipe — token hints for the surrounding slots. A slot
   * is "cohesive" when its candidate title includes ≥1 hint, OR is
   * from a brand the recipe explicitly lists.
   */
  cohesion: {
    coverup: string[];
    bag: string[];
    jewelry: string[];
    shoes: string[];
    sunglasses: string[];
    palette: string[];
  };
};

export const SWIM_ARCHETYPES: SwimArchetype[] = [
  {
    id: "architectural_minimal",
    label: "Architectural Minimal",
    description: "Clean lines, sculptural construction, minimal hardware, timeless luxury.",
    preferredBrands: ["Matteau", "Eres", "Karla Colletto"],
    titleTokens: ["one piece", "one-piece", "maillot", "minimal", "sculpt"],
    negativeTokens: ["print", "floral", "crochet", "ruffle"],
    cohesion: {
      coverup: ["linen", "shirt", "silk", "minimal", "kaftan"],
      bag: ["leather", "structured", "minimal"],
      jewelry: ["fine", "gold", "minimal", "stud"],
      shoes: ["leather sandal", "slide", "minimal", "flat"],
      sunglasses: ["oval", "minimal", "rectangular", "tortoise"],
      palette: ["ivory", "cream", "navy", "black", "sand"],
    },
  },
  {
    id: "hardware_statement",
    label: "Hardware Statement",
    description: "Gold hardware, elevated detailing, sophisticated glamour.",
    preferredBrands: ["Vix Paula Hermanny", "Johanna Ortiz", "Agua by Agua Bendita"],
    titleTokens: ["bandeau", "hardware", "ring", "buckle", "gold", "chain", "firenze", "sade"],
    negativeTokens: ["sport", "racerback"],
    cohesion: {
      coverup: ["linen", "cream", "silk", "kaftan", "wrap"],
      bag: ["raffia", "natural", "leather"],
      jewelry: ["gold", "hammered", "statement", "hoop", "cuff"],
      shoes: ["leather sandal", "slide", "espadrille"],
      sunglasses: ["tortoise", "warm", "cat eye", "oversized"],
      palette: ["cream", "ivory", "gold", "natural"],
    },
  },
  {
    id: "mediterranean_print",
    label: "Mediterranean Print",
    description: "Destination prints — botanical, majolica, coastal florals, artistic patterns.",
    preferredBrands: ["Agua by Agua Bendita", "Alemais", "Etro", "Pucci", "Cala de la Cruz", "Farm Rio"],
    titleTokens: ["print", "floral", "botanical", "majolica", "paisley", "tile", "chevron"],
    negativeTokens: ["solid"],
    cohesion: {
      coverup: ["linen", "solid", "white", "neutral"],
      bag: ["raffia", "natural", "straw"],
      jewelry: ["minimal", "fine", "gold"],
      shoes: ["natural", "leather sandal", "tan"],
      sunglasses: ["cat eye", "classic", "tortoise"],
      palette: ["blue", "white", "coral", "majolica", "navy"],
    },
  },
  {
    id: "crochet_texture",
    label: "Crochet & Texture",
    description: "Crochet, knit, woven, tactile materials.",
    preferredBrands: ["Alexandra Miro", "Zimmermann", "Missoni", "Oséree"],
    titleTokens: ["crochet", "knit", "woven", "lace", "macramé", "macrame", "textured"],
    negativeTokens: [],
    cohesion: {
      coverup: ["crochet", "knit", "lace", "cotton"],
      bag: ["raffia", "woven", "textured", "straw"],
      jewelry: ["hammered", "gold", "shell", "organic"],
      shoes: ["leather slide", "sandal", "espadrille"],
      sunglasses: ["oversized", "tortoise", "warm"],
      palette: ["cream", "ivory", "natural", "sand"],
    },
  },
  {
    id: "sculptural_modern",
    label: "Sculptural Modern",
    description: "Dramatic cuts, sculptural necklines, elevated silhouette.",
    preferredBrands: ["Maygel Coronel", "Johanna Ortiz", "Oséree"],
    titleTokens: ["sculptural", "draped", "twist", "ruched", "one shoulder", "one-shoulder"],
    negativeTokens: ["sport", "basic"],
    cohesion: {
      coverup: ["silk", "minimal", "wrap", "kaftan"],
      bag: ["leather", "structured", "minimal"],
      jewelry: ["sculptural", "gold", "statement"],
      shoes: ["leather sandal", "heel", "slide"],
      sunglasses: ["modern", "rectangular", "black"],
      palette: ["black", "ivory", "navy", "cream"],
    },
  },
  {
    id: "modern_cutout",
    label: "Modern Cut-Out",
    description: "Elegant cut-outs, sophisticated skin exposure, refined proportions.",
    preferredBrands: ["Vix Paula Hermanny", "Maygel Coronel", "Bond-Eye"],
    titleTokens: ["cut out", "cut-out", "cutout", "open back", "side cutout"],
    negativeTokens: [],
    cohesion: {
      coverup: ["linen", "minimal", "silk"],
      bag: ["leather", "structured", "minimal"],
      jewelry: ["fine", "gold", "minimal"],
      shoes: ["leather sandal", "slide"],
      sunglasses: ["modern", "rectangular", "minimal"],
      palette: ["black", "ivory", "cream", "navy"],
    },
  },
  {
    id: "retro_riviera",
    label: "Retro Riviera",
    description: "Balconette, square neckline, vintage glamour, Italian Riviera influence.",
    preferredBrands: ["Karla Colletto", "Matteau", "Melissa Odabash", "Vix Paula Hermanny"],
    titleTokens: ["balconette", "square neck", "square-neck", "retro", "vintage", "underwire"],
    negativeTokens: ["sport"],
    cohesion: {
      coverup: ["linen", "silk", "shirt", "wrap"],
      bag: ["raffia", "leather", "structured"],
      jewelry: ["gold", "hoop", "vintage"],
      shoes: ["espadrille", "leather sandal", "wedge"],
      sunglasses: ["cat eye", "tortoise", "oversized"],
      palette: ["cream", "navy", "gold", "ivory"],
    },
  },
  {
    id: "high_neck",
    label: "High-Neck Sophistication",
    description: "Clean necklines, modern luxury, understated elegance.",
    preferredBrands: ["Eres", "Matteau", "Karla Colletto"],
    titleTokens: ["high neck", "high-neck", "mock neck", "halter"],
    negativeTokens: [],
    cohesion: {
      coverup: ["linen", "silk", "minimal"],
      bag: ["leather", "structured", "minimal"],
      jewelry: ["fine", "minimal", "gold"],
      shoes: ["leather sandal", "slide", "minimal"],
      sunglasses: ["minimal", "rectangular", "oval"],
      palette: ["ivory", "black", "navy", "cream"],
    },
  },
  {
    id: "asymmetric_statement",
    label: "Asymmetric Statement",
    description: "One shoulder, sculptural asymmetry, modern editorial.",
    preferredBrands: ["Matteau", "Johanna Ortiz", "Maygel Coronel"],
    titleTokens: ["asymmetric", "asymmetrical", "one shoulder", "one-shoulder"],
    negativeTokens: [],
    cohesion: {
      coverup: ["minimal", "silk", "wrap"],
      bag: ["leather", "structured"],
      jewelry: ["sculptural", "gold", "statement"],
      shoes: ["leather sandal", "slide"],
      sunglasses: ["modern", "rectangular"],
      palette: ["black", "ivory", "cream"],
    },
  },
];

/**
 * Signature swim pieces — preferred sourcing targets when available.
 * Not registry entries; reference candidates only. A brand here that
 * isn't in the approved registry (e.g. "St. Barths") will only surface
 * if discovered through an approved affiliate retailer and is treated
 * as `supportingOnly` (never elevated to Hero Look).
 */
export type SignaturePiece = {
  brand: string;
  name: string;
  archetypes: SwimArchetypeId[];
  heroEligible?: boolean;
  supportingOnly?: boolean;
  limitPerCollection?: number;
};

export const SIGNATURE_SWIM: SignaturePiece[] = [
  {
    brand: "Vix Paula Hermanny",
    name: "Firenze Sade Bandeau One Piece",
    archetypes: ["hardware_statement", "retro_riviera"],
    heroEligible: true,
  },
  {
    brand: "Missoni",
    name: "Chevron Plunge One Piece",
    archetypes: ["mediterranean_print", "crochet_texture"],
    limitPerCollection: 1,
  },
  {
    brand: "Karla Colletto",
    name: "Floral One Piece",
    archetypes: ["retro_riviera", "architectural_minimal"],
  },
  {
    brand: "St. Barths",
    name: "Carmella Square Neck One Piece",
    archetypes: ["retro_riviera"],
    supportingOnly: true,
  },
];

/** Collection-wide brand caps for swim. */
export const SWIM_BRAND_CAPS: Record<string, number> = {
  Missoni: 1,
};

/** Brands flagged as supporting-only — never elevated to Hero Look. */
export const SUPPORTING_ONLY_BRANDS = new Set<string>(["St. Barths", "St Barths", "St. Barth"]);

/**
 * Deterministically assign one distinct archetype per look slot.
 * Rotates the archetype list using a string seed so successive runs
 * cycle through different starting points.
 */
export function assignArchetypes(count: number, seed: string): SwimArchetypeId[] {
  const all = SWIM_ARCHETYPES.map((a) => a.id);
  // Stable pseudo-random offset derived from seed.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const offset = Math.abs(h) % all.length;
  const rotated = [...all.slice(offset), ...all.slice(0, offset)];
  // If count > distinct archetypes, repeat from the start (extremely rare).
  const out: SwimArchetypeId[] = [];
  for (let i = 0; i < count; i++) out.push(rotated[i % rotated.length]);
  return out;
}

/**
 * Detect the strongest archetype match for a given swim candidate.
 * Returns null when no token signal is present.
 */
export function detectArchetypeForSwim(args: {
  brand: string;
  title: string | null;
}): SwimArchetypeId | null {
  const t = `${args.title ?? ""}`.toLowerCase();
  const brand = args.brand;
  let best: { id: SwimArchetypeId; score: number } | null = null;
  for (const a of SWIM_ARCHETYPES) {
    let s = 0;
    if (a.preferredBrands.some((b) => b.toLowerCase() === brand.toLowerCase())) s += 3;
    for (const tok of a.titleTokens) if (t.includes(tok)) s += 2;
    for (const tok of a.negativeTokens) if (t.includes(tok)) s -= 4;
    if (s > 0 && (!best || s > best.score)) best = { id: a.id, score: s };
  }
  return best?.id ?? null;
}

export function getArchetype(id: SwimArchetypeId): SwimArchetype {
  return SWIM_ARCHETYPES.find((a) => a.id === id)!;
}

/**
 * Score whether a candidate's title/brand matches the cohesion recipe
 * for a given archetype slot. Returns 1 if any hint matches, else 0.
 */
export function cohesionMatch(args: {
  slot: "coverup" | "bag" | "jewelry" | "shoes" | "sunglasses";
  archetype: SwimArchetypeId;
  brand: string;
  title: string | null;
  palette: string | null;
}): boolean {
  const a = getArchetype(args.archetype);
  const hay = `${args.title ?? ""} ${args.brand} ${args.palette ?? ""}`.toLowerCase();
  const hints = a.cohesion[args.slot];
  if (hints.some((h) => hay.includes(h.toLowerCase()))) return true;
  if (a.cohesion.palette.some((p) => hay.includes(p.toLowerCase()))) return true;
  return false;
}

/**
 * Boost a swim candidate's editorial score when it matches its look's
 * assigned archetype or hits a signature piece by name.
 */
export function swimArchetypeBoost(args: {
  brand: string;
  title: string | null;
  archetype: SwimArchetypeId;
}): number {
  let boost = 0;
  const a = getArchetype(args.archetype);
  const t = (args.title ?? "").toLowerCase();
  if (a.preferredBrands.some((b) => b.toLowerCase() === args.brand.toLowerCase())) boost += 0.6;
  for (const tok of a.titleTokens) if (t.includes(tok)) boost += 0.2;
  for (const tok of a.negativeTokens) if (t.includes(tok)) boost -= 0.5;
  for (const sig of SIGNATURE_SWIM) {
    if (
      sig.brand.toLowerCase() === args.brand.toLowerCase() &&
      sig.archetypes.includes(args.archetype)
    ) {
      const sigTokens = sig.name.toLowerCase().split(/\s+/);
      const overlap = sigTokens.filter((tok) => tok.length > 3 && t.includes(tok)).length;
      if (overlap >= 2) boost += 1.0; // strong signature match
      else if (overlap >= 1) boost += 0.3;
    }
  }
  return boost;
}

export type SwimDiagnostics = {
  archetypesAssigned: SwimArchetypeId[];
  archetypesDetected: Array<{ lookIndex: number; assigned: SwimArchetypeId; detected: SwimArchetypeId | null; match: boolean }>;
  uniqueArchetypeCount: number;
  brandCapBreaches: Array<{ brand: string; cap: number; actual: number }>;
  signaturePiecesMatched: Array<{ lookIndex: number; brand: string; name: string }>;
  cohesionScores: Array<{ lookIndex: number; score: number; slotsCohesive: number; slotsTotal: number }>;
  averageCohesion: number;
  warnings: string[];
  silhouetteBalance: Record<string, number>;
  printVsNeutral: { print: number; neutral: number };
  hardwareUsage: number;
  crochetUsage: number;
  cutoutUsage: number;
  heroBrandShare: number;
  discoveryBrandShare: number;
};