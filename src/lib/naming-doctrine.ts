/**
 * Resort Edit naming doctrine (Phase 1 — warn + flag, never block).
 *
 * Two valid content classes:
 *   - destination_moment: "Harbor Aperitivo", "Yacht Day", "Riviera Dinner"
 *   - editorial_commerce: "Resort Sandals", "Raffia Bags", "Beach Club Dresses"
 *
 * Generic influencer / Pinterest language ("Coastal Muse", "Summer Essentials",
 * "Mediterranean Escape", "Vacation Vibes") is flagged. The classifier returns
 * an advisory verdict only — generation is never blocked.
 */

export type NamingClass = "destination_moment" | "editorial_commerce" | "generic" | "unknown";

export type NamingVerdict = {
  class: NamingClass;
  /** Human-readable explanation suitable for an admin chip tooltip. */
  reason: string;
  /** Specific allowlist / blocklist tokens that matched. */
  matches: string[];
  /** Optional rewrite hint if the title is generic. */
  suggestion?: string;
};

/** Destination + moment tokens — extend as new destinations launch. */
const DESTINATION_TOKENS = [
  "portofino", "capri", "amalfi", "positano", "st. barths", "st barths",
  "palm beach", "tulum", "cabo", "mykonos", "ibiza", "marbella", "sardinia",
  "santorini", "hvar", "mallorca", "lake como", "como",
  // Portofino-specific landmarks
  "harbor", "riviera", "marina grande", "via camerelle", "blue grotto",
  "worth avenue", "gustavia", "shellona",
];

/** Moment / activity / time-of-day tokens that anchor a destination moment. */
const MOMENT_TOKENS = [
  "arrival", "market morning", "aperitivo", "yacht day", "sunset", "sunset views",
  "dinner", "lunch", "boat", "boat excursion", "market", "harbor",
  "afternoon", "morning", "evening", "shopping afternoon", "villa dinner",
  "beach club", "spritz", "cliffside", "cocktail hour", "cocktails",
];

/** Functional commerce categories — evergreen shopping nouns. */
const COMMERCE_CATEGORIES = [
  "sandals", "bags", "tote", "totes", "sunglasses", "dresses", "dress",
  "jewelry", "earrings", "necklace", "bracelet", "hats", "coverups",
  "coverup", "espadrilles", "slides", "kaftans", "kaftan", "swim", "swimwear",
  "linen", "raffia", "straw", "scarves", "belts", "blazer", "blazers",
  "trousers", "skirt", "skirts", "top", "tops", "shoes",
];

/** Adjectives that frequently appear in evergreen edits and are allowed. */
const COMMERCE_QUALIFIERS = [
  "resort", "vacation", "yacht day", "harbor", "beach club", "white",
  "best", "the best", "everything",
];

/** Explicit "do not name like this" tokens. */
const GENERIC_BLOCKLIST: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bcoastal\s+muse\b/i, label: "Coastal Muse" },
  { pattern: /\bmediterranean\s+escape\b/i, label: "Mediterranean Escape" },
  { pattern: /\bsummer\s+essentials\b/i, label: "Summer Essentials" },
  { pattern: /\bvacation\s+(vibes|style|mode)\b/i, label: "Vacation Vibes / Style" },
  { pattern: /\bresort\s+(chic|vibes|glam)\b/i, label: "Resort Chic" },
  { pattern: /\bbeach\s+(chic|glam|vibes)\b/i, label: "Beach Chic / Glam" },
  { pattern: /\beuropean\s+summer\b/i, label: "European Summer" },
  { pattern: /\bsummer\s+escape\b/i, label: "Summer Escape" },
  { pattern: /\b(coastal|seaside|riviera)\s+(escape|moment|vibes)\b/i, label: "Generic coastal phrase" },
  { pattern: /\bcapsule\s+wardrobe\b/i, label: "Capsule Wardrobe (generic)" },
  { pattern: /\boutfit\s+inspo\b/i, label: "Outfit Inspo" },
];

function findMatches(text: string, tokens: string[]): string[] {
  const lower = text.toLowerCase();
  return tokens.filter((t) => lower.includes(t));
}

/**
 * Optional dynamic context — pass a list of registered moment names
 * (from `destination_moments`) and active destinations so the classifier
 * matches whatever exists in the live database in addition to the static
 * tokens above.
 */
export type DoctrineContext = {
  knownMomentNames?: string[];
  knownDestinationSlugs?: string[];
};

export function classifyName(title: string | null | undefined, ctx: DoctrineContext = {}): NamingVerdict {
  if (!title || !title.trim()) {
    return { class: "unknown", reason: "Untitled", matches: [] };
  }
  const text = title.trim();

  // 1. Hard blocklist — generic influencer language.
  const blocked = GENERIC_BLOCKLIST.filter((b) => b.pattern.test(text)).map((b) => b.label);
  if (blocked.length) {
    return {
      class: "generic",
      reason: `Generic influencer naming detected (${blocked.join(", ")}). Use a destination moment or functional editorial category.`,
      matches: blocked,
      suggestion: "e.g. 'Harbor Aperitivo', 'Yacht Day', 'Resort Sandals', 'Raffia Bags'",
    };
  }

  // 2. Registered moments / destinations from the live DB win first.
  const dynamicMoments = (ctx.knownMomentNames ?? []).map((m) => m.toLowerCase());
  const dynamicDestinations = (ctx.knownDestinationSlugs ?? []).map((d) => d.toLowerCase().replace(/-/g, " "));

  const destMatches = [
    ...findMatches(text, DESTINATION_TOKENS),
    ...findMatches(text, dynamicDestinations),
  ];
  const momentMatches = [
    ...findMatches(text, MOMENT_TOKENS),
    ...findMatches(text, dynamicMoments),
  ];

  if (destMatches.length && momentMatches.length) {
    return {
      class: "destination_moment",
      reason: "Destination + moment naming — on-doctrine.",
      matches: [...new Set([...destMatches, ...momentMatches])],
    };
  }
  if (momentMatches.length && /day|morning|afternoon|evening|night|dinner|lunch|arrival/i.test(text)) {
    return {
      class: "destination_moment",
      reason: "Moment-led naming — on-doctrine. Consider prefixing with a destination.",
      matches: momentMatches,
    };
  }

  // 3. Editorial commerce — functional shopping category.
  const categoryMatches = findMatches(text, COMMERCE_CATEGORIES);
  const qualifierMatches = findMatches(text, COMMERCE_QUALIFIERS);
  if (categoryMatches.length) {
    return {
      class: "editorial_commerce",
      reason: "Functional editorial category — on-doctrine for evergreen edits.",
      matches: [...new Set([...qualifierMatches, ...categoryMatches])],
    };
  }

  // 4. Heuristic generic catch — short adjective+noun titles like "Coastal Story" or "Beach Edit".
  const tokens = text.split(/\s+/);
  if (tokens.length <= 3 && /(muse|escape|story|moment|vibes|edit|chic|glam|mood)\b/i.test(text)) {
    return {
      class: "generic",
      reason: "Looks like generic influencer / Pinterest phrasing. Anchor to a destination moment or category.",
      matches: [text],
      suggestion: "e.g. 'Portofino Harbor Aperitivo' or 'Best Raffia Bags'",
    };
  }

  return {
    class: "unknown",
    reason: "No destination, moment, or functional category recognised. Manual review suggested.",
    matches: [],
  };
}

/** Convenience: just the class. */
export function classifyClass(title: string | null | undefined, ctx?: DoctrineContext): NamingClass {
  return classifyName(title, ctx).class;
}
