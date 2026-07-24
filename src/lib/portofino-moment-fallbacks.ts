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
import espressoMorningCanonical from "@/assets/uploads/portofino/espresso-morning-lilla-green-eyelet.png.asset.json";
import espressoMorningBanner from "@/assets/uploads/portofino/espresso-morning-banner-cafe-portofino.png.asset.json";
import sunsetViewsCard from "@/assets/uploads/portofino/sunset-views-lilla-pink-dress.png.asset.json";
import sunsetViewsHero from "@/assets/uploads/portofino/sunset-views-harbor-golden-hour.png.asset.json";
import harborAperitivoCard from "@/assets/uploads/portofino/harbor-aperitivo-lilla-crochet-harbor.png.asset.json";
import harborAperitivoBanner from "@/assets/uploads/portofino/harbor-aperitivo-banner-golden-hour.png.asset.json";
import rivieraDinnerCard from "@/assets/uploads/portofino/riviera-dinner-lilla-blue-floral-harbor.png.asset.json";
import rivieraDinnerHero from "@/assets/uploads/portofino/riviera-dinner-harbor-terrace-sunset.png.asset.json";
import poolLoungingShoppingImage from "@/assets/uploads/portofino/pool-lounging-lilla-green-floral-splendido.png.asset.json";
import exploringHarborAsset from "@/assets/uploads/portofino/exploring-the-harbor-white-eyelet.png.asset.json";
const exploringHarborImage = exploringHarborAsset.url;
import exploringHarborBannerAsset from "@/assets/uploads/portofino/exploring-the-harbor-banner-lemon-quay.png.asset.json";
const exploringHarborBanner = exploringHarborBannerAsset.url;
import beachClubLongLunchBanner from "@/assets/uploads/portofino/beach-club-long-lunch-banner-cabanas.png.asset.json";
import arrivalBanner from "@/assets/uploads/portofino/arrival-banner-peach-facade-bougainvillea.png.asset.json";
import beachClubLemon from "@/assets/uploads/lilla/lilla-lemon-beach-club.png.asset.json";
import longLunchCard from "@/assets/uploads/portofino/long-lunch-yellow-dress-harbor-v2.png.asset.json";
import shoppingCard from "@/assets/uploads/portofino/arrival-day-lilla-splendido-v3.png.asset.json";
import shoppingBanner from "@/assets/uploads/portofino/market-morning-espresso.png.asset.json";
import nightcapCard from "@/assets/uploads/portofino/nightcap-lilla-harbor.png.asset.json";
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
    narrative: "Your first walk through the village, fresh from checking in at the Splendido above the harbor.",
    editorial_order: 1,
    moment_card_image: arrivalDayImage.url,
    // Moment-specific banner override — applies ONLY to /portofino/arrival.
    // Card + outfit images keep the canonical arrival look image.
    hero_banner_image: arrivalBanner.url,
    outfit_image: arrivalDayImage.url,
    legacy_day: "/portofino/day-5",
    legacy_look_title: "The Slow Departure",
    legacy_day_slug: "day-5",
    look_slug: "look-c",
  },
  {
    moment_slug: "espresso-morning",
    archetype_slug: "market-morning",
    moment_name: "Espresso Morning",
    narrative: "A slow Italian morning that begins with espresso on the piazzetta.",
    editorial_order: 2,
    moment_card_image: espressoMorningCanonical.url,
    // Moment-specific banner override — applies ONLY to /portofino/espresso-morning.
    hero_banner_image: espressoMorningBanner.url,
    outfit_image: espressoMorningCanonical.url,
    legacy_day: "/portofino/day-5",
    legacy_look_title: "Morning Espresso & Market",
    legacy_day_slug: "day-5",
    look_slug: "look-a",
  },
  {
    moment_slug: "yacht-day",
    archetype_slug: "yacht-day",
    moment_name: "Yacht Day",
    narrative: "The crossing to San Fruttuoso — the abbey in a cove reachable only by boat or on foot — in effortless style.",
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
    narrative: "Golden-hour cocktails overlooking the harbor.",
    // Reordered to sit after Shopping + Long Lunch so the day flows:
    // yacht → pool → beach club → shopping → long lunch → aperitivo.
    editorial_order: 9,
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
    narrative: "From the hill above the harbor, the coast glows as the sun disappears into the sea.",
    editorial_order: 10,
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
    narrative: "An unforgettable dinner beneath the harbor lights.",
    editorial_order: 11,
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
  "beach-club-long-lunch": "beach-club",
  "market-morning": "espresso-morning",
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
    moment_name: "Explore the Harbor",
    narrative:
      "The climb to Castello Brown and the path to the lighthouse, through Portofino's hidden corners and colorful streets.",
    editorial_order: 3,
    moment_card_image: exploringHarborImage,
    hero_banner_image: exploringHarborBanner,
    outfit_image: exploringHarborImage,
    legacy_day: "/portofino/day-3",
    legacy_look_title: "Explore the Harbor",
    legacy_day_slug: "day-3",
    look_slug: "look-b",
  },
  {
    moment_slug: "beach-club",
    archetype_slug: "beach-club",
    // Display renamed to "Pool Lounging" — the imagery on this URL
    // (bikini, chaise lounges, luxury resort pool) reads as pool lounging.
    // URL slug intentionally preserved to avoid SEO churn / redirects.
    moment_name: "Pool Lounging",
    narrative: "An elegant afternoon by the pool, above the bay, beneath striped umbrellas.",
    editorial_order: 5,
    moment_card_image: beachClubLemon.url,
    // Moment-specific banner override — applies ONLY to
    // /portofino/beach-club.
    hero_banner_image: beachClubLongLunchBanner.url,
    outfit_image: beachClubLemon.url,
    legacy_day: "/portofino/day-2",
    legacy_look_title: "Pool Lounging Morning",
    legacy_day_slug: "day-2",
    look_slug: "look-a",
  },
  {
    moment_slug: "pool-lounging",
    archetype_slug: "pool-lounging",
    // Display renamed to "Beach Club" — the elevated resort separates,
    // dresses, and polished transition looks on this URL read as arriving
    // at and spending time at an upscale beach club. URL slug preserved.
    moment_name: "Beach Club",
    narrative:
      "A leisurely afternoon at Paraggi, the emerald cove where even Portofino comes to swim.",
    editorial_order: 6,
    moment_card_image: poolLoungingShoppingImage.url,
    hero_banner_image: poolLoungingShoppingImage.url,
    outfit_image: poolLoungingShoppingImage.url,
    legacy_day: "/portofino/day-3",
    legacy_look_title: "Beach Club",
    legacy_day_slug: "day-3",
    look_slug: "look-a",
  },
  {
    moment_slug: "shopping",
    archetype_slug: "shopping",
    moment_name: "Shopping",
    narrative: "Browsing the boutiques around the piazzetta and along the harbor.",
    editorial_order: 7.5,
    moment_card_image: shoppingCard.url,
    hero_banner_image: shoppingBanner.url,
    outfit_image: shoppingCard.url,
    legacy_day: "/portofino/day-3",
    legacy_look_title: "Shopping in Portofino",
    legacy_day_slug: "day-3",
    look_slug: "look-c",
  },
  {
    moment_slug: "long-lunch",
    archetype_slug: "long-lunch",
    moment_name: "Long Lunch",
    narrative:
      "A long, harborside lunch where time slows down between every course.",
    editorial_order: 8,
    moment_card_image: longLunchCard.url,
    hero_banner_image: beachClubLongLunchBanner.url,
    outfit_image: longLunchCard.url,
    legacy_day: "/portofino/day-2",
    legacy_look_title: "Long Lunch by the Sea",
    legacy_day_slug: "day-2",
    look_slug: "look-b",
  },
  {
    moment_slug: "nightcap",
    archetype_slug: "nightcap",
    moment_name: "Nightcap",
    narrative:
      "One final cocktail on the piazzetta before the perfect day comes to a close.",
    editorial_order: 12,
    moment_card_image: nightcapCard.url,
    hero_banner_image: sunsetViewsHero.url,
    outfit_image: nightcapCard.url,
    legacy_day: "/portofino/day-4",
    legacy_look_title: "Nightcap on the Piazzetta",
    legacy_day_slug: "day-4",
    look_slug: "look-c",
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
  { canonical_name: "Beach Club", legacy_day_slug: "day-2", look_slug: "look-a" },
  { canonical_name: "Long Lunch", legacy_day_slug: "day-2", look_slug: "look-b" },
  { canonical_name: "Pool Lounging", legacy_day_slug: "day-3", look_slug: "look-a" },
  { canonical_name: "Shopping", legacy_day_slug: "day-3", look_slug: "look-c" },
  { canonical_name: "Explore the Harbor", legacy_day_slug: "day-3", look_slug: "look-b" },
  { canonical_name: "Nightcap", legacy_day_slug: "day-4", look_slug: "look-c" },
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