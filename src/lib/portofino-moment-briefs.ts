/**
 * RESORT EDIT — PORTOFINO MOMENT BRIEFS (client-safe)
 *
 * One editorial brief per canonical Portofino moment. This is the single
 * source of truth for:
 *   - which product slots a look in that moment must fill before it can ever
 *     render publicly (generalised from the Long Lunch pilot),
 *   - the moment's colour story and styling direction, which is injected
 *     verbatim into the stylist prompt and mirrored by the deterministic gates,
 *   - time of day, which decides sunglasses (day only) and heel level.
 *
 * Nothing here is advisory: `requiredSlots` is enforced as a hard publish gate.
 */
import type { VisibleProductSlot } from "./look-atomic-completeness";
import { PORTOFINO_JOURNEY } from "./portofino-moment-fallbacks";

export const MOMENT_BRIEF_VERSION = "portofino-moment-briefs-v1";

export type TimeOfDay = "day" | "golden" | "evening";

export type MomentBrief = {
  momentSlug: string;
  momentName: string;
  timeOfDay: TimeOfDay;
  scene: string;
  /** One coherent colour story per moment — bold, feminine, Mediterranean. */
  colourStory: string;
  direction: readonly string[];
  requiredSlots: readonly VisibleProductSlot[];
  optionalSlots: readonly VisibleProductSlot[];
  forbidden: readonly string[];
};

/** Jewellery is required in every moment: earrings + necklace + bracelet. */
const JEWELLERY = ["earrings", "necklace", "bracelet"] as const;

/** Base coverage: garment(s), shoes, bag. */
const BASE = ["outfit", "shoes", "bag"] as const;

const DAY_REQUIRED = [...BASE, "sunglasses", ...JEWELLERY] as const;
const EVENING_REQUIRED = [...BASE, ...JEWELLERY] as const;

const UNIVERSAL_FORBIDDEN = [
  "rings",
  "pearls",
  "fast-fashion or influencer-trend styling",
  "logo-heavy or loud branding",
  "prices or price signalling of any kind",
] as const;

const DAY_DIRECTION = [
  "Daytime Mediterranean editorial — feminine, colourful, considered.",
  "Sunglasses are mandatory and must be a linked daytime style.",
  "Footwear must be walkable on Portofino stone: refined flat, low or mid heel.",
] as const;

const EVENING_DIRECTION = [
  "Evening Riviera editorial — polished, grown-up, quietly glamorous.",
  "No sunglasses after sundown.",
  "An elegant heel is expected: sculptural mid or high heel sandal, mule or pump.",
] as const;

const COMMON_DIRECTION = [
  "One coherent colour story per moment; bold feminine colour and print over neutral safety.",
  "Jewellery stays within one designer and one metal family. No pearls. Never a ring.",
  "Luxury editorial quality only — no filler substitutes.",
  "Never mix brown and black leathers in the same look.",
  "Every item visible in the photograph must have its own exact linked product.",
] as const;

type Seed = {
  slug: string;
  timeOfDay: TimeOfDay;
  scene: string;
  colourStory: string;
  extraRequired?: readonly VisibleProductSlot[];
  extraOptional?: readonly VisibleProductSlot[];
  extraDirection?: readonly string[];
  extraForbidden?: readonly string[];
};

const SEEDS: readonly Seed[] = [
  {
    slug: "arrival",
    timeOfDay: "day",
    scene: "Stepping off the boat onto the piazzetta with luggage still in hand.",
    colourStory: "Butter yellow and cream with warm gold.",
    extraOptional: ["layer", "scarf", "belt"],
  },
  {
    slug: "espresso-morning",
    timeOfDay: "day",
    scene: "An espresso standing at the bar, early light on the harbour.",
    colourStory: "Crisp white and Ligurian blue stripe with silver.",
    extraOptional: ["layer", "belt"],
  },
  {
    slug: "exploring-the-harbor",
    timeOfDay: "day",
    scene: "Walking the quay and the shopfronts behind it, camera in hand.",
    colourStory: "Terracotta and faded coral with warm gold.",
    extraOptional: ["scarf", "belt", "hat"],
  },
  {
    slug: "yacht-day",
    timeOfDay: "day",
    scene: "A day on the water — deck, swim, lunch on board.",
    colourStory: "Navy and white with bright citrus accent.",
    extraRequired: ["hat"],
    extraOptional: ["layer", "scarf"],
    extraDirection: [
      "A linked sun hat is mandatory for the yacht: brim shape must read as resort, never sporty.",
      "Footwear must be deck-appropriate — flat, non-marking, elegant.",
    ],
    extraForbidden: ["heels on deck", "sneakers"],
  },
  {
    slug: "beach-club",
    timeOfDay: "day",
    scene: "A lounger and lunch at the beach club, swim then cover-up.",
    colourStory: "Emerald and white with warm gold.",
    extraRequired: ["layer"],
    extraOptional: ["hat", "scarf"],
    extraDirection: ["Swim needs its own linked cover-up or kaftan layer."],
  },
  {
    slug: "pool-lounging",
    timeOfDay: "day",
    scene: "A slow afternoon by the pool above the bay.",
    colourStory: "Jade green and white floral with warm gold.",
    extraRequired: ["layer"],
    extraOptional: ["hat"],
    extraDirection: ["Poolside footwear is an elegant flat sandal or slide, never a sports slide."],
  },
  {
    slug: "shopping",
    timeOfDay: "day",
    scene: "Via Roma boutiques in the late morning, bags in hand.",
    colourStory: "Jade and ivory with warm gold.",
    extraOptional: ["belt", "scarf"],
  },
  {
    slug: "long-lunch",
    timeOfDay: "day",
    scene: "A two-hour lunch on a terrace above the harbour.",
    colourStory: "Ice blue and white with warm gold.",
    extraOptional: ["layer", "belt"],
  },
  {
    slug: "harbor-aperitivo",
    timeOfDay: "golden",
    scene: "Aperitivo at golden hour with the boats turning pink.",
    colourStory: "Coral and cream with warm gold.",
    extraOptional: ["layer", "sunglasses"],
    extraDirection: [
      "Golden hour: sunglasses are optional, and only if visibly worn in the photograph.",
      "Heel may step up from daytime — refined mid heel sandal or slingback.",
    ],
  },
  {
    slug: "sunset-views",
    timeOfDay: "golden",
    scene: "The walk up to the castle for the last of the light.",
    colourStory: "Rose and amber with warm gold.",
    extraOptional: ["layer", "sunglasses", "scarf"],
    extraDirection: ["Footwear must handle the climb: elegant flat or block mid heel."],
  },
  {
    slug: "riviera-dinner",
    timeOfDay: "evening",
    scene: "Dinner at a harbour-front table, candles and white linen.",
    colourStory: "Deep sea blue and ink with warm gold.",
    extraOptional: ["layer", "belt"],
  },
  {
    slug: "nightcap",
    timeOfDay: "evening",
    scene: "A last drink on the terrace after dinner.",
    colourStory: "Black and midnight with warm gold.",
    extraOptional: ["layer"],
  },
];

function nameFor(slug: string): string {
  return PORTOFINO_JOURNEY.find((m) => m.moment_slug === slug)?.moment_name ?? slug;
}

function buildBrief(seed: Seed): MomentBrief {
  const base = seed.timeOfDay === "evening" ? EVENING_REQUIRED : DAY_REQUIRED;
  const requiredSet = new Set<VisibleProductSlot>([...base, ...(seed.extraRequired ?? [])]);
  // Golden hour: sunglasses are not mandatory.
  if (seed.timeOfDay === "golden") requiredSet.delete("sunglasses");
  const direction = [
    ...(seed.timeOfDay === "evening" ? EVENING_DIRECTION : DAY_DIRECTION),
    ...COMMON_DIRECTION,
    `Colour story: ${seed.colourStory}`,
    ...(seed.extraDirection ?? []),
  ];
  return {
    momentSlug: seed.slug,
    momentName: nameFor(seed.slug),
    timeOfDay: seed.timeOfDay,
    scene: seed.scene,
    colourStory: seed.colourStory,
    direction,
    requiredSlots: [...requiredSet],
    optionalSlots: seed.extraOptional ?? [],
    forbidden: [...UNIVERSAL_FORBIDDEN, ...(seed.extraForbidden ?? [])],
  };
}

export const PORTOFINO_MOMENT_BRIEFS: readonly MomentBrief[] = SEEDS.map(buildBrief);

export function momentBrief(momentSlug: string): MomentBrief | undefined {
  const slug = momentSlug.trim().toLowerCase();
  return PORTOFINO_MOMENT_BRIEFS.find((b) => b.momentSlug === slug);
}

/** Slots the brief requires that are not present in the supplied set. */
export function missingBriefSlots(
  brief: MomentBrief,
  filled: Iterable<VisibleProductSlot>,
): VisibleProductSlot[] {
  const have = new Set(filled);
  return brief.requiredSlots.filter((s) => !have.has(s));
}

/** Sunglasses must never appear in an evening look, even as an optional extra. */
export function sunglassesAllowed(brief: MomentBrief): boolean {
  return brief.timeOfDay !== "evening";
}
