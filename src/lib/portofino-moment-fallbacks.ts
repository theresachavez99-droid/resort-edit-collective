/**
 * Portofino canonical moment definitions + legacy-look fallbacks.
 *
 * Used by the public `/portofino` rebuild. Every moment ALWAYS resolves
 * to separate card + hero banner images and a legacy day page so no moment ever appears empty,
 * even before any Look Studio candidate has been tagged with the moment.
 *
 * When a `look_candidates` row is tagged with the matching moment_slug
 * and status='approved', it OVERRIDES the fallback — see
 * `src/lib/portofino-moments.functions.ts`.
 */
import cira3 from "@/assets/uploads/cira/cira-3.png.asset.json";
import { getCanonicalDayImage } from "@/data/dayImageRegistry";
import cira10 from "@/assets/uploads/cira/cira-10.png.asset.json";
import cira11 from "@/assets/uploads/cira/cira-11.png.asset.json";
import cira13 from "@/assets/uploads/cira/cira-13.png.asset.json";
import cira14 from "@/assets/uploads/cira/cira-14.png.asset.json";
import arrivalDayImage from "@/assets/uploads/portofino/arrival-day-lilla-splendido-v4.png.asset.json";
import yachtDayHero from "@/assets/uploads/portofino/yacht-day-harbor.png.asset.json";
import marketMorningCard from "@/assets/uploads/portofino/market-morning-espresso.png.asset.json";
import sunsetViewsCard from "@/assets/uploads/portofino/sunset-views-lilla-harbor-golden.png.asset.json";
import sunsetViewsHero from "@/assets/uploads/portofino/sunset-views-harbor-golden-hour.png.asset.json";
import harborAperitivoCard from "@/assets/uploads/portofino/harbor-aperitivo-lilla-crochet-harbor.png.asset.json";
import harborAperitivoBanner from "@/assets/uploads/portofino/harbor-aperitivo-banner-golden-hour.png.asset.json";
import rivieraDinnerCard from "@/assets/uploads/portofino/riviera-dinner-lilla-harbor-terrace-v2.png.asset.json";
import rivieraDinnerHero from "@/assets/uploads/portofino/riviera-dinner-harbor-terrace-sunset.png.asset.json";
import poolLoungingShoppingImage from "@/assets/uploads/portofino/pool-lounging-portofino-harbor-pool.png.asset.json";
import exploringHarborAsset from "@/assets/uploads/portofino/exploring-the-harbor-white-eyelet.png.asset.json";
const exploringHarborImage = exploringHarborAsset.url;
import type { LookSlug } from "@/lib/portofino-spec";

export type LegacyDayPath =
  | "/portofino/day-1"
  | "/portofino/day-2"
  | "/portofino/day-3"
  | "/portofino/day-4"
  | "/portofino/day-5";

export type LegacyDaySlug = "day-1" | "day-2" | "day-3" | "day-4" | "day-5";

export type PortofinoMomentDef = {
  moment_slug: string;
  archetype_slug: string;
  moment_name: string;
  /** Short one-sentence narrative shown on the landing card. */
  narrative: string;
  /**
   * Editorial sequence position within the destination journey.
   * Single source of truth for hero nav, homepage grid, /portofino grid,
   * Other Moments strip, and Prev/Next navigation. Lower = earlier in the day.
   */
  editorial_order: number;
  /** Wardrobe-focused thumbnail used only on the `/portofino` Six Moments grid. */
  moment_card_image: string;
  /** Destination-focused banner used only on `/portofino/$moment` detail pages. */
  hero_banner_image: string;
  /** Tighter portrait of the legacy hero outfit. */
  outfit_image: string;
  /** Legacy day page the fallback look originally lived on. */
  legacy_day: LegacyDayPath;
  legacy_look_title: string;
  /** Day slug used to resolve the canonical shoppable Look from `lookbook`. */
  legacy_day_slug: LegacyDaySlug;
  /** Look slug within the day that powers the inline Shop This Look grid. */
  look_slug: LookSlug;
};

/**
 * Canonical six moments, in canonical order. Card images sell the wardrobe;
 * hero banner images sell the destination experience. Keep those sources separate.
 */
export const PORTOFINO_MOMENT_DEFS: PortofinoMomentDef[] = [
  {
    moment_slug: "arrival",
    archetype_slug: "arrival",
    moment_name: "Arrival Day",
    narrative:
      "The first afternoon in Portofino—sun on the harbor, luggage unpacked, and nowhere to be but here.",
    editorial_order: 1,
    moment_card_image: arrivalDayImage.url,
    hero_banner_image: arrivalDayImage.url,
    outfit_image: arrivalDayImage.url,
    legacy_day: "/portofino/day-5",
    legacy_look_title: "The Slow Departure",
    legacy_day_slug: "day-5",
    look_slug: "look-c",
  },
  {
    moment_slug: "market-morning",
    archetype_slug: "market-morning",
    moment_name: "Market Morning",
    narrative:
      "Walking up for peaches and flowers before the heat lands — cotton, raffia, espresso in hand.",
    editorial_order: 2,
    moment_card_image: marketMorningCard.url,
    hero_banner_image: marketMorningCard.url,
    outfit_image: marketMorningCard.url,
    legacy_day: "/portofino/day-5",
    legacy_look_title: "Morning Espresso & Market",
    legacy_day_slug: "day-5",
    look_slug: "look-a",
  },
  {
    moment_slug: "yacht-day",
    archetype_slug: "yacht-day",
    moment_name: "Yacht Day",
    narrative:
      "A long day on the water — Paraggi, Camogli, lunch on board. Swim under, throw-on over, considered finish.",
    editorial_order: 4,
    moment_card_image: getCanonicalDayImage("day-1", "hero"),
    hero_banner_image: yachtDayHero.url,
    outfit_image: getCanonicalDayImage("day-1", "hero"),
    legacy_day: "/portofino/day-1",
    legacy_look_title: "Boarding the Boat",
    legacy_day_slug: "day-1",
    look_slug: "look-a",
  },
  {
    moment_slug: "harbor-aperitivo",
    archetype_slug: "harbor-aperitivo",
    moment_name: "Harbor Aperitivo",
    narrative:
      "A spritz at sunset overlooking the harbor — yachts lit, hills pink. The hinge moment between day and dinner.",
    editorial_order: 7,
    moment_card_image: harborAperitivoCard.url,
    hero_banner_image: harborAperitivoBanner.url,
    outfit_image: harborAperitivoCard.url,
    legacy_day: "/portofino/day-1",
    legacy_look_title: "Harbour Aperitivo",
    legacy_day_slug: "day-1",
    look_slug: "look-c",
  },
  {
    moment_slug: "sunset-views",
    archetype_slug: "sunset-views",
    moment_name: "Sunset Views",
    narrative:
      "The harbor at golden hour — terrace views, warm light, and the slow transition into evening.",
    editorial_order: 8,
    moment_card_image: sunsetViewsCard.url,
    hero_banner_image: sunsetViewsHero.url,
    outfit_image: sunsetViewsCard.url,
    legacy_day: "/portofino/day-4",
    legacy_look_title: "Sunset Cocktails",
    legacy_day_slug: "day-4",
    look_slug: "look-a",
  },
  {
    moment_slug: "riviera-dinner",
    archetype_slug: "riviera-dinner",
    moment_name: "Riviera Dinner",
    narrative:
      "Candlelit terraces, harbor lights, and the best reservation of the trip.",
    editorial_order: 9,
    moment_card_image: rivieraDinnerCard.url,
    hero_banner_image: rivieraDinnerHero.url,
    outfit_image: rivieraDinnerCard.url,
    legacy_day: "/portofino/day-4",
    legacy_look_title: "Dinner with a View",
    legacy_day_slug: "day-4",
    look_slug: "look-b",
  },
];

export function getPortofinoMomentDef(slug: string): PortofinoMomentDef | undefined {
  const canonical = PORTOFINO_MOMENT_SLUG_ALIASES[slug] ?? slug;
  return (
    PORTOFINO_MOMENT_DEFS.find((m) => m.moment_slug === canonical) ??
    PORTOFINO_ADDITIONAL_MOMENT_DEFS.find((m) => m.moment_slug === canonical)
  );
}

/**
 * Legacy/short-form moment slugs we still need to honor for redirects and
 * for any persisted `look_candidates.moment_slug` rows that pre-date the
 * Sep-2025 slug cleanup. Always resolve to the new canonical slug.
 */
export const PORTOFINO_MOMENT_SLUG_ALIASES: Record<string, string> = {
  "arrival-day": "arrival",
  "pool-lounging-shopping": "pool-lounging",
};

/**
 * Resolve a legacy `(daySlug, lookSlug)` pair to a canonical moment slug.
 * Looks without a canonical moment fall back to the day's primary moment
 * (look-a) so legacy bookmarks never 404 during the transition.
 */
export function momentSlugForLookKey(
  daySlug: LegacyDaySlug,
  lookSlug?: string,
): string {
  const exact = PORTOFINO_JOURNEY.find(
    (m) => m.legacy_day_slug === daySlug && m.look_slug === lookSlug,
  );
  if (exact) return exact.moment_slug;
  const primary = PORTOFINO_JOURNEY.find(
    (m) => m.legacy_day_slug === daySlug && m.look_slug === "look-a",
  );
  if (primary) return primary.moment_slug;
  const anyForDay = PORTOFINO_JOURNEY.find((m) => m.legacy_day_slug === daySlug);
  return anyForDay?.moment_slug ?? "arrival";
}

export const PORTOFINO_MOMENT_SLUGS = PORTOFINO_MOMENT_DEFS.map((m) => m.moment_slug);

/**
 * Additional moment defs — surfaced via `/portofino/$moment` but not part of
 * the canonical Six Moments grid. Currently: Pool Lounging + Shopping.
 */
export const PORTOFINO_ADDITIONAL_MOMENT_DEFS: PortofinoMomentDef[] = [
  {
    moment_slug: "exploring-the-harbor",
    archetype_slug: "exploring-the-harbor",
    moment_name: "Exploring the Harbor",
    narrative:
      "A slow afternoon along the quay — boutique windows, espresso stops, and the harbor catching the light.",
    editorial_order: 3,
    moment_card_image: exploringHarborImage,
    hero_banner_image: exploringHarborImage,
    outfit_image: exploringHarborImage,
    legacy_day: "/portofino/day-3",
    legacy_look_title: "Exploring the Harbor",
    legacy_day_slug: "day-3",
    look_slug: "look-b",
  },
  {
    moment_slug: "beach-club-long-lunch",
    archetype_slug: "beach-club",
    moment_name: "Beach Club & Long Lunch",
    narrative:
      "A slow afternoon at the beach club — cabana shade, a long lunch by the water, and the heat softening into gold.",
    editorial_order: 5,
    moment_card_image: getCanonicalDayImage("day-2", "hero"),
    hero_banner_image: getCanonicalDayImage("day-2", "hero"),
    outfit_image: getCanonicalDayImage("day-2", "hero"),
    legacy_day: "/portofino/day-2",
    legacy_look_title: "Beach Club Morning",
    legacy_day_slug: "day-2",
    look_slug: "look-a",
  },
  {
    moment_slug: "pool-lounging",
    archetype_slug: "pool-lounging-shopping",
    moment_name: "Pool Lounging & Shopping",
    narrative:
      "Relaxed poolside hours, boutique discoveries, and an afternoon that drifts effortlessly into town.",
    editorial_order: 6,
    moment_card_image: poolLoungingShoppingImage.url,
    hero_banner_image: poolLoungingShoppingImage.url,
    outfit_image: poolLoungingShoppingImage.url,
    legacy_day: "/portofino/day-3",
    legacy_look_title: "Poolside",
    legacy_day_slug: "day-3",
    look_slug: "look-a",
  },
];

/**
 * Canonical Portofino editorial journey — all moments in narrative order
 * (Arrival → Market → Exploring → Yacht → Beach Club → Pool → Aperitivo →
 * Sunset → Riviera Dinner). Single source of truth for every public surface
 * that lists or sequences Portofino moments.
 */
export const PORTOFINO_JOURNEY: PortofinoMomentDef[] = [
  ...PORTOFINO_MOMENT_DEFS,
  ...PORTOFINO_ADDITIONAL_MOMENT_DEFS,
].sort((a, b) => a.editorial_order - b.editorial_order);

/** Adjacent moments in editorial order — last loops back to /portofino. */
export function getJourneyNeighbors(slug: string): {
  prev: PortofinoMomentDef | null;
  next: PortofinoMomentDef | null;
} {
  const i = PORTOFINO_JOURNEY.findIndex((m) => m.moment_slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? PORTOFINO_JOURNEY[i - 1] : null,
    next: i < PORTOFINO_JOURNEY.length - 1 ? PORTOFINO_JOURNEY[i + 1] : null,
  };
}

/**
 * Three "Additional Looks" — secondary canonical Portofino outfits that
 * sit alongside the Six Moments. Same naming everywhere on the site.
 */
export type PortofinoAdditionalLook = {
  canonical_name: string;
  legacy_day_slug: LegacyDaySlug;
  look_slug: LookSlug;
};

export const PORTOFINO_ADDITIONAL_LOOKS: PortofinoAdditionalLook[] = [
  { canonical_name: "Beach Club & Long Lunch", legacy_day_slug: "day-2", look_slug: "look-a" },
  { canonical_name: "Pool Lounging & Shopping", legacy_day_slug: "day-3", look_slug: "look-a" },
  { canonical_name: "Exploring the Harbor", legacy_day_slug: "day-3", look_slug: "look-b" },
];

/**
 * Single source of truth for what each (daySlug, lookSlug) look is called
 * to users — Six Moments + Three Additional Looks. Falls back to undefined
 * for looks that aren't part of the canonical public taxonomy (those
 * should not be surfaced on user-facing rails).
 */
export function getCanonicalPortofinoLookName(
  daySlug: LegacyDaySlug,
  lookSlug: LookSlug,
): { name: string; category: "moment" | "additional" } | undefined {
  const moment = PORTOFINO_MOMENT_DEFS.find(
    (m) => m.legacy_day_slug === daySlug && m.look_slug === lookSlug,
  );
  if (moment) return { name: moment.moment_name, category: "moment" };
  const add = PORTOFINO_ADDITIONAL_LOOKS.find(
    (a) => a.legacy_day_slug === daySlug && a.look_slug === lookSlug,
  );
  if (add) return { name: add.canonical_name, category: "additional" };
  return undefined;
}