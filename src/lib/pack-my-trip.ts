/**
 * "Pack My Trip" — pure planning logic for the Portofino destination-dressing
 * MVP.
 *
 * Rules that must not drift:
 *  - The public Portofino moment list is the single source of truth. This
 *    module never invents a moment, product, price, retailer or URL.
 *  - Style / price / shoe preferences are recorded in the trip brief. They
 *    only influence ordering when the existing look data supports it; they
 *    never generate a matching claim.
 */
import { queryOptions } from "@tanstack/react-query";
import {
  listPortofinoMomentsForLanding,
  type PortofinoMomentCard,
} from "@/lib/portofino-moments.functions";

/** Shared with `/portofino` so the wizard reuses the same cached read. */
export const portofinoLandingMomentsQuery = queryOptions({
  queryKey: ["portofino-moments-landing"],
  queryFn: () => listPortofinoMomentsForLanding(),
});

export const TRIP_LENGTHS = [3, 5, 7] as const;
export type TripLength = (typeof TRIP_LENGTHS)[number];

export const STYLE_MOODS = [
  "polished-feminine",
  "bold-mediterranean",
  "relaxed-luxury",
] as const;
export type StyleMood = (typeof STYLE_MOODS)[number];

export const PRICE_LEVELS = ["destination-finds", "mid-luxe", "luxury"] as const;
export type PriceLevel = (typeof PRICE_LEVELS)[number];

export const SHOE_PREFERENCES = ["flats-first", "flats-and-heels", "heels-welcome"] as const;
export type ShoePreference = (typeof SHOE_PREFERENCES)[number];

export const STYLE_MOOD_LABELS: Record<StyleMood, string> = {
  "polished-feminine": "Polished & Feminine",
  "bold-mediterranean": "Bold Mediterranean",
  "relaxed-luxury": "Relaxed Luxury",
};

export const PRICE_LEVEL_LABELS: Record<PriceLevel, string> = {
  "destination-finds": "Destination Finds",
  "mid-luxe": "Mid-Luxe",
  luxury: "Luxury",
};

export const SHOE_PREFERENCE_LABELS: Record<ShoePreference, string> = {
  "flats-first": "Flats First",
  "flats-and-heels": "Mix of Flats & Heels",
  "heels-welcome": "Heels Welcome",
};

/**
 * Editorial core itineraries per trip length, expressed as canonical moment
 * slugs. Any slug that is not live on the public Portofino page is simply
 * dropped at render time.
 */
const CORE_ITINERARIES: Record<TripLength, string[]> = {
  3: ["arrival", "espresso-morning", "long-lunch", "harbor-aperitivo", "riviera-dinner", "nightcap"],
  5: [
    "arrival",
    "espresso-morning",
    "exploring-the-harbor",
    "yacht-day",
    "beach-club",
    "long-lunch",
    "harbor-aperitivo",
    "riviera-dinner",
    "nightcap",
  ],
  7: [
    "arrival",
    "espresso-morning",
    "exploring-the-harbor",
    "yacht-day",
    "beach-club",
    "pool-lounging",
    "shopping",
    "long-lunch",
    "harbor-aperitivo",
    "sunset-views",
    "riviera-dinner",
    "nightcap",
  ],
};

/** Preselected itinerary for a trip length, filtered to live moments. */
export function coreItinerary(days: TripLength, live: readonly PortofinoMomentCard[]): string[] {
  const liveSlugs = new Set(live.map((m) => m.moment_slug));
  return CORE_ITINERARIES[days].filter((s) => liveSlugs.has(s));
}

export type TripDay = { day: number; moments: PortofinoMomentCard[] };

/**
 * Spread the chosen moments across the trip in editorial order, keeping each
 * day's moments in the order they'd be lived.
 */
export function buildItinerary(
  days: TripLength,
  chosen: readonly string[],
  live: readonly PortofinoMomentCard[],
): TripDay[] {
  const chosenSet = new Set(chosen);
  const ordered = live
    .filter((m) => chosenSet.has(m.moment_slug))
    .slice()
    .sort((a, b) => a.editorial_order - b.editorial_order);
  const out: TripDay[] = Array.from({ length: days }, (_, i) => ({ day: i + 1, moments: [] }));
  if (ordered.length === 0) return out;
  const perDay = Math.ceil(ordered.length / days);
  ordered.forEach((m, i) => {
    const day = Math.min(days - 1, Math.floor(i / perDay));
    out[day]!.moments.push(m);
  });
  return out;
}

/**
 * Packing summary derived ONLY from product categories already published on
 * the selected looks. Moments with no published pieces contribute nothing —
 * no placeholder counts, ever.
 */
export function summarizeCategories(
  labels: readonly (string | null | undefined)[],
): Array<{ category: string; count: number }> {
  const counts = new Map<string, number>();
  for (const raw of labels) {
    const c = (raw ?? "").trim();
    if (!c) continue;
    const label = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}
