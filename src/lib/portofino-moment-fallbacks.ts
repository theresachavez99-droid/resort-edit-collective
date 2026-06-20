/**
 * Portofino canonical moment definitions + legacy-look fallbacks.
 *
 * Used by the public `/portofino` rebuild. Every moment ALWAYS resolves
 * to a hero image + legacy day page so no moment ever appears empty,
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
import arrivalDayHero from "@/assets/uploads/portofino/arrival-day-harbor-terrace.png.asset.json";

export type LegacyDayPath =
  | "/portofino/day-1"
  | "/portofino/day-2"
  | "/portofino/day-3"
  | "/portofino/day-4"
  | "/portofino/day-5";

export type PortofinoMomentDef = {
  moment_slug: string;
  archetype_slug: string;
  moment_name: string;
  /** Short one-sentence narrative shown on the landing card. */
  narrative: string;
  /** Hero image used on landing card AND inside the moment page. */
  hero_image: string;
  /** Tighter portrait of the legacy hero outfit. */
  outfit_image: string;
  /** Legacy day page the fallback look originally lived on. */
  legacy_day: LegacyDayPath;
  legacy_look_title: string;
};

/**
 * Canonical six moments, in canonical order. Edit copy here only — the
 * landing page and per-moment route both read from this list.
 */
export const PORTOFINO_MOMENT_DEFS: PortofinoMomentDef[] = [
  {
    moment_slug: "arrival-day",
    archetype_slug: "arrival",
    moment_name: "Arrival Day",
    narrative:
      "The first afternoon in Portofino—sun on the harbor, luggage unpacked, and nowhere to be but here.",
    hero_image: arrivalDayHero.url,
    outfit_image: cira14.url,
    legacy_day: "/portofino/day-5",
    legacy_look_title: "The Slow Departure",
  },
  {
    moment_slug: "market-morning",
    archetype_slug: "market-morning",
    moment_name: "Market Morning",
    narrative:
      "Walking up for peaches and flowers before the heat lands — cotton, raffia, espresso in hand.",
    hero_image: cira13.url,
    outfit_image: cira13.url,
    legacy_day: "/portofino/day-5",
    legacy_look_title: "Morning Espresso & Market",
  },
  {
    moment_slug: "yacht-day",
    archetype_slug: "yacht-day",
    moment_name: "Yacht Day",
    narrative:
      "A long day on the water — Paraggi, Camogli, lunch on board. Swim under, throw-on over, considered finish.",
    hero_image: getCanonicalDayImage("day-1", "hero"),
    outfit_image: getCanonicalDayImage("day-1", "hero"),
    legacy_day: "/portofino/day-1",
    legacy_look_title: "Boarding the Boat",
  },
  {
    moment_slug: "harbor-aperitivo",
    archetype_slug: "harbor-aperitivo",
    moment_name: "Harbor Aperitivo",
    narrative:
      "A spritz at sunset overlooking the harbor — yachts lit, hills pink. The hinge moment between day and dinner.",
    hero_image: cira3.url,
    outfit_image: cira3.url,
    legacy_day: "/portofino/day-1",
    legacy_look_title: "Harbour Aperitivo",
  },
  {
    moment_slug: "sunset-views",
    archetype_slug: "sunset-views",
    moment_name: "Sunset Views",
    narrative:
      "The long golden hour from a terrace above the harbor — light layers, the right earring, a slow walk.",
    hero_image: cira11.url,
    outfit_image: cira11.url,
    legacy_day: "/portofino/day-4",
    legacy_look_title: "Sunset Cocktails",
  },
  {
    moment_slug: "riviera-dinner",
    archetype_slug: "riviera-dinner",
    moment_name: "Riviera Dinner",
    narrative:
      "Dinner at Puny or DaU Mari — polished, romantic, distinctly Riviera. Never city-cocktail.",
    hero_image: cira10.url,
    outfit_image: cira10.url,
    legacy_day: "/portofino/day-4",
    legacy_look_title: "Dinner with a View",
  },
];

export function getPortofinoMomentDef(slug: string): PortofinoMomentDef | undefined {
  return PORTOFINO_MOMENT_DEFS.find((m) => m.moment_slug === slug);
}

export const PORTOFINO_MOMENT_SLUGS = PORTOFINO_MOMENT_DEFS.map((m) => m.moment_slug);