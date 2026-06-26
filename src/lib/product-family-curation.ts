/**
 * Stylist Engine v4.4 — Product Family Curation.
 *
 * Resort Edit does not approve brands wholesale. It approves PRODUCTS.
 * Brands fall into three editorial levels:
 *
 *   core       — nearly all products align (Eres, Matteau, ViX, etc.)
 *   selective  — only specific product families are approved
 *                (MC2 Saint Barth, L'AGENCE, …)
 *   reference  — kept as inspiration; never enters discovery automatically
 *
 * Selective brands MUST pass the product-family gate before scoring.
 * Every product, regardless of brand level, receives a construction
 * boost (or penalty) based on craftsmanship vocabulary in the title
 * and description.
 */

export type ApprovalLevel = "core" | "selective" | "reference";

export type BrandCurationProfile = {
  level: ApprovalLevel;
  approvedFamilies?: string[];
  excludedFamilies?: string[];
  preferredConstruction?: string[];
  preferredMaterials?: string[];
  preferredDesignLanguage?: string[];
  editorialNotes?: string;
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Per-brand curation overrides. Keys are normalized brand names.
 * Brands not listed here default to `core` with no family restrictions.
 */
const PROFILES: Record<string, BrandCurationProfile> = {
  [norm("MC2 Saint Barth")]: {
    level: "selective",
    approvedFamilies: [
      "sangallo",
      "broderie anglaise",
      "cotton lace",
      "refined crochet",
      "architectural one-piece",
      "elevated swim",
      "resort trousers",
      "elevated separates",
    ],
    excludedFamilies: [
      "logo",
      "graphic",
      "novelty",
      "cartoon",
      "terry",
      "branded",
      "tourist",
      "souvenir",
      "vacation graphic",
    ],
    preferredConstruction: [
      "sangallo",
      "broderie",
      "lace",
      "embroidery",
      "crochet",
    ],
    editorialNotes:
      "Selective: only sangallo/broderie/lace/refined crochet/architectural one-pieces and elevated separates. Reject logo, novelty, terry, and tourist collections.",
  },
  [norm("L'AGENCE")]: {
    level: "selective",
    approvedFamilies: [
      "linen trousers",
      "white tailoring",
      "elevated separates",
      "lightweight jacket",
      "resort denim",
      "silk blouse",
    ],
    excludedFamilies: ["swimwear", "bikini", "destination print", "beachwear"],
    preferredConstruction: ["tailored", "linen", "silk"],
    editorialNotes:
      "Selective: tailored separates that transition arrival → harbor → evening. Never swim or beachwear.",
  },
  [norm("Lagence")]: {
    level: "selective",
    approvedFamilies: [
      "linen trousers",
      "white tailoring",
      "elevated separates",
      "lightweight jacket",
      "resort denim",
      "silk blouse",
    ],
    excludedFamilies: ["swimwear", "bikini", "destination print", "beachwear"],
    editorialNotes:
      "Selective: tailored separates that transition arrival → harbor → evening. Never swim or beachwear.",
  },
  [norm("Farm Rio")]: {
    level: "selective",
    approvedFamilies: [
      "printed dress",
      "kaftan",
      "tropical print",
      "embroidered top",
      "linen set",
    ],
    excludedFamilies: ["logo tee", "graphic sweatshirt", "novelty"],
    editorialNotes:
      "Joyful tropical destination dressing. Approved for Beyond the Riviera moments; not a Mediterranean Icon.",
  },
  [norm("Bond-Eye")]: {
    level: "selective",
    approvedFamilies: ["minimalist one-piece", "sculptural swim", "recycled knit"],
    excludedFamilies: ["novelty", "logo"],
  },
  [norm("Melissa Odabash")]: {
    level: "selective",
    approvedFamilies: [
      "one-piece",
      "bandeau",
      "kaftan",
      "cover-up",
      "embellished swim",
    ],
    excludedFamilies: ["logo", "novelty"],
  },
  [norm("Cala de la Cruz")]: {
    level: "selective",
    approvedFamilies: ["linen dress", "linen set", "cotton dress", "kaftan"],
    excludedFamilies: ["logo", "graphic"],
  },
  [norm("Hunza G")]: {
    level: "reference",
    editorialNotes: "Removed from active editorial rotation (v4.4).",
  },
  [norm("Solid & Striped")]: {
    level: "reference",
    editorialNotes: "Removed from active editorial rotation (v4.4).",
  },
};

export function brandCurationProfile(brand: string): BrandCurationProfile {
  return PROFILES[norm(brand)] ?? { level: "core" };
}

// ── Construction vocabulary (used for the editorial boost). ──

const PRO_TOKENS = [
  "sangallo",
  "broderie",
  "broderie anglaise",
  "anglaise",
  "lace",
  "guipure",
  "hand embroider",
  "embroider",
  "crochet",
  "linen",
  "silk",
  "tailored",
  "tailoring",
  "architectural",
  "sculptural",
  "knit",
  "knitwear",
  "raffia",
  "cashmere",
  "poplin",
  "organza",
  "cotton voile",
];

const CON_TOKENS = [
  "logo",
  "graphic",
  "novelty",
  "cartoon",
  "souvenir",
  "tourist",
  "terry logo",
  "branded",
  "slogan",
  "license",
  "licensed",
];

export type CurationVerdict = {
  approved: boolean;
  level: ApprovalLevel;
  reason: string;
  familyMatched: string | null;
  constructionScore: number;
};

/**
 * Evaluate a single candidate product against its brand's curation
 * profile. Returns the editorial decision PLUS a construction score
 * (positive boosts good craftsmanship vocabulary, negative penalizes
 * branded/novelty signal).
 */
export function evaluateProductFamily(args: {
  brand: string;
  title: string | null;
  description?: string | null;
}): CurationVerdict {
  const profile = brandCurationProfile(args.brand);
  const hay = `${args.title ?? ""} ${args.description ?? ""}`.toLowerCase();

  // Construction score is brand-agnostic.
  let constructionScore = 0;
  for (const t of PRO_TOKENS) if (hay.includes(t)) constructionScore += 1.5;
  for (const t of CON_TOKENS) if (hay.includes(t)) constructionScore -= 3;
  constructionScore = Math.max(-9, Math.min(9, constructionScore));

  if (profile.level === "reference") {
    return {
      approved: false,
      level: "reference",
      reason: "Reference brand — excluded from automatic discovery.",
      familyMatched: null,
      constructionScore,
    };
  }

  if (profile.level === "core") {
    // Core brands still reject obvious novelty/branded items.
    if (constructionScore <= -3) {
      return {
        approved: false,
        level: "core",
        reason: "Construction below editorial standard (novelty/logo signal).",
        familyMatched: null,
        constructionScore,
      };
    }
    return {
      approved: true,
      level: "core",
      reason: "Core editorial brand.",
      familyMatched: null,
      constructionScore,
    };
  }

  // Selective — must match an approved family AND avoid excluded ones.
  const excluded = (profile.excludedFamilies ?? []).find((f) =>
    hay.includes(f.toLowerCase()),
  );
  if (excluded) {
    return {
      approved: false,
      level: "selective",
      reason: `${excluded} collection excluded.`,
      familyMatched: null,
      constructionScore,
    };
  }
  const matched = (profile.approvedFamilies ?? []).find((f) =>
    hay.includes(f.toLowerCase()),
  );
  if (!matched) {
    // Strong construction signal can still rescue a selective candidate.
    if (constructionScore >= 4) {
      return {
        approved: true,
        level: "selective",
        reason: "Approved on construction merit.",
        familyMatched: null,
        constructionScore,
      };
    }
    return {
      approved: false,
      level: "selective",
      reason: "Product family not approved.",
      familyMatched: null,
      constructionScore,
    };
  }
  return {
    approved: true,
    level: "selective",
    reason: `Approved family: ${matched}.`,
    familyMatched: matched,
    constructionScore,
  };
}