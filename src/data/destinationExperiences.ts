/**
 * Destination-keyed EXPERIENCES layer.
 *
 * Truthfulness rules baked into the data model:
 *  - `sourceUrl` is the exact supplier/operator page the facts below were read
 *    from, and `factsCheckedOn` is the date they were last verified by hand.
 *  - `facts` may only contain details printed on that page (duration, private
 *    vs shared, language, how booking works). Never invented.
 *  - Outbound URLs are NOT stored here. Every public link resolves through the
 *    outbound registry (`@/data/outboundLinks`) using the experience `key`, so
 *    a URL, affiliate status or CTA wording is only ever changed in one place.
 *  - `booking` decides the CTA wording: "availability" pages let a traveller
 *    check dates directly; "enquiry" operators must never be presented as
 *    instant booking.
 *  - `commissionable` is FALSE unless a real affiliate program is connected.
 *  - Never any prices, reviews, ratings or scarcity claims (standing brand rule).
 *  - `imageIsIllustrative` marks destination imagery that is NOT an operator
 *    photograph, so the UI can label it as an editorial illustration.
 */

import { outboundHref, outboundIsSponsored } from "@/data/outboundLinks";

export type ExperienceBooking = "availability" | "enquiry";

export type DestinationExperience = {
  /** Stable analytics key — also the outbound-registry key. Never change it. */
  key: string;
  destinationSlug: string;
  destinationName: string;
  /** Title exactly as the supplier page names it. */
  name: string;
  /** Who actually operates / sells it. */
  operator: string;
  kind: string;
  /** Editorial one-liner. Descriptive only — no claims of popularity. */
  editorial: string;
  /** Verified facts, each printed on `sourceUrl`. */
  facts: readonly string[];
  /** Resolved from the outbound registry. */
  href: string;
  sourceUrl: string;
  /** ISO date the facts above were verified against the source. */
  factsCheckedOn: string;
  booking: ExperienceBooking;
  /** True only when a live affiliate program is connected for this link. */
  commissionable: boolean;
  /** Legacy field kept for archived admin tooling. */
  momentSlug: string;
  image: string | null;
  imageIsIllustrative: boolean;
  imageAlt?: string;
  /** Short visible caption shown under the image, e.g. an AI illustration notice. */
  imageCaption?: string;
  /** Surfaced in the small featured selection. */
  featured: boolean;
  /** Given the large editorial treatment on the destination page. */
  prominent?: boolean;
};

import expYacht from "@/assets/exp-yacht-charter.jpg";
import expCruise from "@/assets/exp-sunset-cruise.jpg";
import expCooking from "@/assets/exp-cooking-class.jpg";
import expAbbey from "@/assets/exp-san-fruttuoso.jpg";
import expBeachClub from "@/assets/experience-beach-club.jpg";
import ecoFarmVineyard from "@/assets/portofino-ecofarm-vineyard.png.asset.json";

const CHECKED = "2026-09-16";
const ILLUSTRATION_CAPTION =
  "Editorial illustration (AI-generated) — not a photograph of the venue";

type ExperienceSeed = Omit<DestinationExperience, "href" | "commissionable">;

const SEEDS: readonly ExperienceSeed[] = [
  {
    key: "portofino-la-portofinese-eco-farm",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "La Portofinese Eco-Farm",
    operator: "La Portofinese (independent operator, arranged direct)",
    kind: "Vineyard & farm",
    editorial:
      "A working farm inside the Portofino park, above the Cala degli Inglesi: bees, vineyards, olive trees and a butterfly garden. Depending on what you arrange, a visit can pair a guided walk of the farm with a tasting of their wine in the vineyard, a picnic aperitif, lunch or an early dinner — or a hands-on kitchen session: corzetti pasta and pesto, wood-fired pizza and focaccia, or a focaccia and pesto demonstration.",
    facts: [
      "Inside the Portofino park, overlooking Cala degli Inglesi",
      "Bees, vineyards, olive trees and a butterfly garden on the property",
      "Guided visit with vineyard wine tasting; picnic aperitif, lunch or early dinner",
      "Kitchen options include corzetti pasta and pesto, wood-fired pizza and focaccia, or a focaccia and pesto demonstration",
      "Options differ — each visit includes only what you arrange, not everything listed",
      "The farm lists spring and summer opening and requires reservations; confirm off-season dates with the operator",
    ],
    sourceUrl: "https://www.laportofinese.it/en/the-places/eco-farm/",
    factsCheckedOn: CHECKED,
    booking: "enquiry",
    momentSlug: "espresso-morning",
    // Generic coastal-vineyard illustration, approved by the founder. It is NOT
    // a photograph of La Portofinese and is captioned as such wherever shown.
    image: ecoFarmVineyard.url,
    imageIsIllustrative: true,
    imageAlt: "Editorial illustration of a Mediterranean coastal vineyard; not a photograph of La Portofinese",
    imageCaption: ILLUSTRATION_CAPTION,
    featured: true,
    prominent: true,
  },
  {
    key: "portofino-private-riviera-boat",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Private Boat Tour of the Portofino Riviera",
    operator: "Local boat operator, sold via Viator",
    kind: "Private boat",
    editorial:
      "The promontory from the water — coves, cliffs and the pastel harbour seen the way it was meant to be seen.",
    facts: ["About 4 hours", "Private tour", "Departs Portofino", "Offered in English"],
    sourceUrl:
      "https://www.viator.com/tours/Portofino/Private-Boat-Tour-of-the-Portofino-Riviera/d4232-467798P8",
    factsCheckedOn: CHECKED,
    booking: "availability",
    momentSlug: "yacht-day",
    image: expYacht,
    imageIsIllustrative: true,
    imageAlt: "Editorial illustration of a classic boat on the Ligurian coast",
    imageCaption: ILLUSTRATION_CAPTION,
    featured: true,
  },
  {
    key: "portofino-sunset-boat-aperitif",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Sunset Boat Tour with Aperitif",
    operator: "Local boat operator, sold via Viator",
    kind: "Sunset cruise",
    editorial:
      "Golden hour on the Ligurian water, an aperitivo in hand, the hills turning apricot behind you.",
    facts: [
      "About 1 hour 30 minutes",
      "Small group",
      "Departs Portofino",
      "Offered in English and one more language",
    ],
    sourceUrl:
      "https://www.viator.com/tours/Portofino/Sunset-Boat-Tour-for-Small-Groups/d4232-467798P3",
    factsCheckedOn: CHECKED,
    booking: "availability",
    momentSlug: "sunset-views",
    image: expCruise,
    imageIsIllustrative: true,
    imageAlt: "Editorial illustration of the Ligurian coast at sunset",
    imageCaption: ILLUSTRATION_CAPTION,
    featured: true,
  },
  {
    key: "portofino-pesto-boat-walk-lunch",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Boat and Walking Tour with Pesto Cooking & Lunch",
    operator: "Local guide, sold via Viator",
    kind: "Pesto class & Ligurian lunch",
    editorial:
      "Mortar, pestle and basil — Liguria's own recipe, learned between a boat ride and a walk through the village.",
    facts: ["About 3 hours", "Departs Portofino", "Offered in English"],
    sourceUrl:
      "https://www.viator.com/tours/Portofino/Best-of-Portofino-Boat-and-Walking-Tour-Pesto-Cooking-and-Lunch/d4232-68388P1",
    factsCheckedOn: CHECKED,
    booking: "availability",
    momentSlug: "long-lunch",
    image: expCooking,
    imageIsIllustrative: true,
    imageAlt: "Editorial illustration of basil, mortar and pestle for Ligurian pesto",
    imageCaption: ILLUSTRATION_CAPTION,
    featured: true,
  },
  {
    key: "portofino-san-fruttuoso-guided-hike",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Private Coastal Hike to San Fruttuoso",
    operator: "Local private guide, sold via Viator",
    kind: "Guided coastal walk",
    editorial:
      "The old footpath over the headland to the abbey at San Fruttuoso — reachable on foot or by water, never by car.",
    facts: [
      "About 4 to 6 hours",
      "Private guide",
      "Pickup offered",
      "Departs Portofino",
      "Offered in English and five more languages",
    ],
    sourceUrl:
      "https://www.viator.com/tours/Portofino/Portofino-to-S-Fruttuoso-Scenic-Coastal-Hike-with-Private-Guide/d4232-428295P2",
    factsCheckedOn: CHECKED,
    booking: "availability",
    momentSlug: "exploring-the-harbor",
    image: expAbbey,
    imageIsIllustrative: true,
    imageAlt: "Editorial illustration of a coastal footpath above the Ligurian sea",
    imageCaption: ILLUSTRATION_CAPTION,
    featured: false,
  },
  {
    key: "portofino-bagni-fiore-paraggi",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Bagni Fiore, Paraggi — beach club",
    operator: "Bagni Fiore (independent operator, booked direct)",
    kind: "Beach experience",
    editorial:
      "Emerald water at Paraggi, striped umbrellas in rows, lunch that stretches into the afternoon.",
    facts: [
      "Via Paraggi a Mare 1, Santa Margherita Ligure",
      "Sunbeds booked on the club's own calendar",
      "Restaurant reservations handled separately via SevenRooms",
      "Opening dates and hours are seasonal — check the club's site before you travel",
    ],
    sourceUrl: "https://www.bagnifiore.com/en",
    factsCheckedOn: CHECKED,
    booking: "availability",
    momentSlug: "beach-club",
    image: expBeachClub,
    imageIsIllustrative: true,
    imageAlt: "Editorial illustration of a Ligurian beach club with striped umbrellas",
    imageCaption: ILLUSTRATION_CAPTION,
    featured: false,
  },
];

/**
 * Only experiences with a valid outbound destination are published. A missing
 * or withheld URL removes the card rather than rendering a dead link.
 */
export const DESTINATION_EXPERIENCES: readonly DestinationExperience[] = SEEDS.flatMap((seed) => {
  const href = outboundHref(seed.key);
  if (!href) return [];
  return [{ ...seed, href, commissionable: outboundIsSponsored(seed.key) }];
});

export function experiencesForDestination(destinationSlug: string): DestinationExperience[] {
  return DESTINATION_EXPERIENCES.filter((e) => e.destinationSlug === destinationSlug);
}

export function featuredExperiences(destinationSlug?: string, limit = 3): DestinationExperience[] {
  const pool = destinationSlug
    ? experiencesForDestination(destinationSlug)
    : [...DESTINATION_EXPERIENCES];
  return pool.filter((e) => e.featured).slice(0, limit);
}

export function experienceForMoment(momentSlug: string): DestinationExperience | undefined {
  return DESTINATION_EXPERIENCES.find((e) => e.momentSlug === momentSlug);
}

/** Truthful CTA wording, derived from how the operator actually takes bookings. */
export function experienceCta(e: DestinationExperience): string {
  return e.booking === "availability" ? "Check dates & availability" : "Explore & enquire";
}

/** Internal/admin view only — never rendered to visitors. */
export function experienceTrackingStatus(): {
  total: number;
  commissionable: number;
  missingTracking: string[];
} {
  const missing = DESTINATION_EXPERIENCES.filter((e) => !e.commissionable).map((e) => e.key);
  return {
    total: DESTINATION_EXPERIENCES.length,
    commissionable: DESTINATION_EXPERIENCES.length - missing.length,
    missingTracking: missing,
  };
}
