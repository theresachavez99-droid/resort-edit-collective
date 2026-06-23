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
import arrivalDayImage from "@/assets/uploads/portofino/arrival-day-lilla-splendido-v2.png.asset.json";
import yachtDayHero from "@/assets/uploads/portofino/yacht-day-harbor.png.asset.json";
import marketMorningCard from "@/assets/uploads/portofino/market-morning-espresso.png.asset.json";
import sunsetViewsCard from "@/assets/uploads/portofino/sunset-views-lilla-harbor-golden.png.asset.json";
import sunsetViewsHero from "@/assets/uploads/portofino/sunset-views-harbor-golden-hour.png.asset.json";
import harborAperitivoCard from "@/assets/uploads/portofino/harbor-aperitivo-lilla-crochet-harbor.png.asset.json";
import rivieraDinnerCard from "@/assets/uploads/portofino/riviera-dinner-lilla-harbor-terrace-v2.png.asset.json";
import rivieraDinnerHero from "@/assets/uploads/portofino/riviera-dinner-harbor-terrace-sunset.png.asset.json";
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
    moment_slug: "arrival-day",
    archetype_slug: "arrival",
    moment_name: "Arrival Day",
    narrative:
      "The first afternoon in Portofino—sun on the harbor, luggage unpacked, and nowhere to be but here.",
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
    moment_card_image: harborAperitivoCard.url,
    hero_banner_image: harborAperitivoCard.url,
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
      "The golden hour above Portofino — terrace views, warm light, a slow stroll, and the harbor turning gold.",
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
  return PORTOFINO_MOMENT_DEFS.find((m) => m.moment_slug === slug);
}

export const PORTOFINO_MOMENT_SLUGS = PORTOFINO_MOMENT_DEFS.map((m) => m.moment_slug);

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
  { canonical_name: "Beach Club + Long Lunch", legacy_day_slug: "day-2", look_slug: "look-a" },
  { canonical_name: "Pool Lounging + Shopping", legacy_day_slug: "day-3", look_slug: "look-a" },
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