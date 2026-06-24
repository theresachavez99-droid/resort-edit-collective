/**
 * Editorial DNA for Portofino looks.
 *
 * Drives the "More Like This" discovery engine. Matching is destination +
 * activity + style-family based — never brand-based. See moreLikeThis.ts.
 */

export type StyleFamily =
  | "mediterranean_embroidery"
  | "blue_white_porcelain"
  | "riviera_floral"
  | "coastal_knit"
  | "crochet_resort"
  | "raffia_luxury"
  | "yacht_swim"
  | "harbor_aperitivo"
  | "sunset_glamour"
  | "destination_print"
  // ── Extended families introduced by the founder reference library ──
  | "riviera_glamour"
  | "coastal_neutral"
  | "destination_glamour"
  | "mediterranean_tailoring"
  | "sequin_glamour"
  | "romantic_evening";

export type ActivityTag =
  | "yacht_day"
  | "beach_club_lunch"
  | "harbor_aperitivo"
  | "market_morning"
  | "sunset_views"
  | "riviera_dinner"
  | "pool_day"
  | "arrival_day"
  | "shopping_afternoon";

export interface LookDNA {
  destination: string;
  momentSlug: string;
  styleFamilies: StyleFamily[];
  activityTags: ActivityTag[];
  /** Activities that should NEVER appear in More Like This for this look. */
  excludeActivities: ActivityTag[];
  /** Editorial label rendered on the carousel chip, e.g. "Mediterranean Embroidery". */
  editorialLabel: string;
}

/**
 * Keyed by `${daySlug}/${lookSlug}` (e.g. "day-1/look-a").
 * Falls back to day-level defaults when a look isn't explicitly mapped.
 */
export const LOOK_DNA: Record<string, LookDNA> = {
  // ── Day 1 · Arrival + Yacht ────────────────────────────────────────
  "day-1/look-a": {
    destination: "portofino",
    momentSlug: "yacht-day",
    styleFamilies: ["yacht_swim", "raffia_luxury", "destination_print"],
    activityTags: ["yacht_day", "pool_day"],
    excludeActivities: ["riviera_dinner", "sunset_views"],
    editorialLabel: "Yacht Alternatives",
  },
  "day-1/look-b": {
    destination: "portofino",
    momentSlug: "harbor-aperitivo",
    styleFamilies: ["harbor_aperitivo", "blue_white_porcelain", "mediterranean_embroidery"],
    activityTags: ["harbor_aperitivo", "sunset_views"],
    excludeActivities: ["yacht_day"],
    editorialLabel: "Harbour Aperitivo",
  },
  "day-1/look-c": {
    destination: "portofino",
    momentSlug: "harbor-aperitivo",
    styleFamilies: ["harbor_aperitivo", "riviera_floral"],
    activityTags: ["harbor_aperitivo"],
    excludeActivities: ["yacht_day"],
    editorialLabel: "Riviera Florals",
  },
  // ── Day 2 · Beach Club + Lunch ─────────────────────────────────────
  "day-2/look-a": {
    destination: "portofino",
    momentSlug: "beach-club-lunch",
    styleFamilies: ["mediterranean_embroidery", "coastal_knit", "crochet_resort"],
    activityTags: ["beach_club_lunch", "pool_day"],
    excludeActivities: ["riviera_dinner", "yacht_day"],
    editorialLabel: "Beach Club Favourites",
  },
  "day-2/look-b": {
    destination: "portofino",
    momentSlug: "beach-club-lunch",
    styleFamilies: ["crochet_resort", "coastal_knit"],
    activityTags: ["beach_club_lunch", "pool_day"],
    excludeActivities: ["riviera_dinner"],
    editorialLabel: "Crochet & Knits",
  },
  "day-2/look-c": {
    destination: "portofino",
    momentSlug: "beach-club-lunch",
    styleFamilies: ["coastal_knit", "blue_white_porcelain"],
    activityTags: ["beach_club_lunch"],
    excludeActivities: ["riviera_dinner", "yacht_day"],
    editorialLabel: "Coastal Knitwear",
  },
  // ── Day 3 · Pool + Shopping ────────────────────────────────────────
  "day-3/look-a": {
    destination: "portofino",
    momentSlug: "pool-lounging-shopping",
    styleFamilies: [
      "destination_glamour",
      "riviera_glamour",
      "riviera_floral",
      "destination_print",
    ],
    activityTags: [
      "pool_day",
      "shopping_afternoon",
    ],
    excludeActivities: [
      "yacht_day",
      "beach_club_lunch",
      "harbor_aperitivo",
      "riviera_dinner",
    ],
    editorialLabel: "Pool Lounging + Shopping",
  },
  "day-3/look-b": {
    destination: "portofino",
    momentSlug: "shopping-afternoon",
    styleFamilies: ["blue_white_porcelain", "destination_print"],
    activityTags: ["shopping_afternoon", "market_morning"],
    excludeActivities: ["yacht_day"],
    editorialLabel: "Porcelain Prints",
  },
  "day-3/look-c": {
    destination: "portofino",
    momentSlug: "pool-day",
    styleFamilies: ["coastal_knit", "yacht_swim"],
    activityTags: ["pool_day", "beach_club_lunch"],
    excludeActivities: ["riviera_dinner"],
    editorialLabel: "Poolside",
  },
  // ── Day 4 · Sunset + Dinner ────────────────────────────────────────
  "day-4/look-a": {
    destination: "portofino",
    momentSlug: "sunset-views",
    styleFamilies: ["sunset_glamour", "blue_white_porcelain", "destination_print"],
    activityTags: ["sunset_views", "riviera_dinner"],
    excludeActivities: ["yacht_day", "pool_day"],
    editorialLabel: "Sunset Glamour",
  },
  "day-4/look-b": {
    destination: "portofino",
    momentSlug: "riviera-dinner",
    styleFamilies: ["sunset_glamour", "riviera_floral", "romantic_evening", "destination_glamour"],
    activityTags: ["riviera_dinner", "sunset_views"],
    excludeActivities: ["yacht_day", "pool_day", "beach_club_lunch"],
    editorialLabel: "Riviera Dinner",
  },
  "day-4/look-c": {
    destination: "portofino",
    momentSlug: "riviera-dinner",
    styleFamilies: ["sunset_glamour", "riviera_floral", "romantic_evening"],
    activityTags: ["riviera_dinner"],
    excludeActivities: ["yacht_day", "pool_day"],
    editorialLabel: "Porcelain Prints",
  },
  // ── Day 5 · Market + Departure ─────────────────────────────────────
  "day-5/look-a": {
    destination: "portofino",
    momentSlug: "market-morning",
    styleFamilies: ["mediterranean_embroidery", "blue_white_porcelain", "raffia_luxury"],
    activityTags: ["market_morning", "arrival_day"],
    excludeActivities: ["yacht_day", "riviera_dinner"],
    editorialLabel: "Mediterranean Embroidery",
  },
  "day-5/look-b": {
    destination: "portofino",
    momentSlug: "market-morning",
    styleFamilies: ["mediterranean_embroidery", "riviera_floral"],
    activityTags: ["market_morning"],
    excludeActivities: ["yacht_day", "riviera_dinner"],
    editorialLabel: "Market Morning",
  },
  "day-5/look-c": {
    destination: "portofino",
    momentSlug: "arrival-day",
    styleFamilies: ["raffia_luxury", "mediterranean_embroidery"],
    activityTags: ["arrival_day", "market_morning"],
    excludeActivities: ["yacht_day"],
    editorialLabel: "Arrival Day",
  },
};

const DAY_DEFAULTS: Record<string, LookDNA> = {
  "day-1": LOOK_DNA["day-1/look-a"],
  "day-2": LOOK_DNA["day-2/look-a"],
  "day-3": LOOK_DNA["day-3/look-a"],
  "day-4": LOOK_DNA["day-4/look-a"],
  "day-5": LOOK_DNA["day-5/look-a"],
};

export function dnaForLook(daySlug: string, lookSlug: string): LookDNA | null {
  return LOOK_DNA[`${daySlug}/${lookSlug}`] ?? DAY_DEFAULTS[daySlug] ?? null;
}