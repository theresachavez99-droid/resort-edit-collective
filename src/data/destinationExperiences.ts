/**
 * Destination-keyed EXPERIENCES layer.
 *
 * Truthfulness rules baked into the data model:
 *  - `sourceUrl` is the exact supplier/operator page the facts below were read
 *    from, and `factsCheckedOn` is the date they were last verified by hand.
 *  - `facts` may only contain details printed on that page (duration, private
 *    vs shared, language, opening hours). Never invented.
 *  - `booking` decides the CTA wording: "availability" pages let a traveller
 *    check dates directly; "enquiry" operators must never be presented as
 *    instant booking.
 *  - `commissionable` is FALSE unless a real affiliate program is connected.
 *    Ordinary links must never be described as earning commission.
 *  - Never any prices, reviews, ratings or scarcity claims (standing brand rule).
 *  - `imageIsIllustrative` marks destination imagery that is NOT an operator
 *    photograph, so the UI can say so.
 */

export type ExperienceBooking = "availability" | "enquiry";

export type DestinationExperience = {
  /** Stable analytics key — never change once shipped. */
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
  href: string;
  sourceUrl: string;
  /** ISO date the facts above were verified against the source. */
  factsCheckedOn: string;
  booking: ExperienceBooking;
  /** True only when a live affiliate program is connected for this link. */
  commissionable: boolean;
  /** Canonical Portofino moment whose looks suit this activity. */
  momentSlug: string;
  /**
   * Editorial destination imagery. Omit (null) when no accurate image of the
   * real venue exists — the card then uses an elegant text-only treatment
   * rather than borrowing an unrelated photograph.
   */
  image: string | null;
  imageIsIllustrative: boolean;
  /** Surfaced in the small homepage selection. */
  featured: boolean;
};

import expYacht from "@/assets/exp-yacht-charter.jpg";
import expCruise from "@/assets/exp-sunset-cruise.jpg";
import expCooking from "@/assets/exp-cooking-class.jpg";
import expAbbey from "@/assets/exp-san-fruttuoso.jpg";
import expBeachClub from "@/assets/experience-beach-club.jpg";

const CHECKED = "2026-09-06";

export const DESTINATION_EXPERIENCES: readonly DestinationExperience[] = [
  {
    key: "portofino-private-riviera-boat",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Private Boat Tour of the Portofino Riviera",
    operator: "Local boat operator, sold via Viator",
    kind: "Private boat",
    editorial:
      "The promontory from the water — coves, cliffs and the pastel harbour seen the way it was meant to be seen.",
    facts: ["4 hours (approx.)", "Private tour", "Departs Portofino, Italy", "Offered in English"],
    href: "https://www.viator.com/tours/Portofino/Private-Boat-Tour-of-the-Portofino-Riviera/d4232-467798P8",
    sourceUrl:
      "https://www.viator.com/tours/Portofino/Private-Boat-Tour-of-the-Portofino-Riviera/d4232-467798P8",
    factsCheckedOn: CHECKED,
    booking: "availability",
    commissionable: false,
    momentSlug: "yacht-day",
    image: expYacht,
    imageIsIllustrative: true,
    featured: true,
  },
  {
    key: "portofino-sunset-boat-aperitif",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Sunset Boat Tour with Aperitif in Portofino",
    operator: "Local boat operator, sold via Viator",
    kind: "Sunset cruise",
    editorial:
      "Golden hour on the Ligurian water, an aperitivo in hand, the hills turning apricot behind you.",
    facts: [
      "1 hour 30 minutes (approx.)",
      "Small group",
      "Departs Portofino, Italy",
      "Offered in English and 1 more",
    ],
    href: "https://www.viator.com/tours/Portofino/Sunset-Boat-Tour-for-Small-Groups/d4232-467798P3",
    sourceUrl:
      "https://www.viator.com/tours/Portofino/Sunset-Boat-Tour-for-Small-Groups/d4232-467798P3",
    factsCheckedOn: CHECKED,
    booking: "availability",
    commissionable: false,
    momentSlug: "sunset-views",
    image: expCruise,
    imageIsIllustrative: true,
    featured: true,
  },
  {
    key: "portofino-pesto-boat-walk-lunch",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Portofino Boat and Walking Tour with Pesto Cooking & Lunch",
    operator: "Local guide, sold via Viator",
    kind: "Pesto class & Ligurian lunch",
    editorial:
      "Mortar, pestle and basil — Liguria's own recipe, learned between a boat ride and a walk through the village.",
    facts: ["3 hours (approx.)", "Departs Portofino, Italy", "Offered in English"],
    href: "https://www.viator.com/tours/Portofino/Best-of-Portofino-Boat-and-Walking-Tour-Pesto-Cooking-and-Lunch/d4232-68388P1",
    sourceUrl:
      "https://www.viator.com/tours/Portofino/Best-of-Portofino-Boat-and-Walking-Tour-Pesto-Cooking-and-Lunch/d4232-68388P1",
    factsCheckedOn: CHECKED,
    booking: "availability",
    commissionable: false,
    momentSlug: "long-lunch",
    image: expCooking,
    imageIsIllustrative: true,
    featured: true,
  },
  {
    key: "portofino-san-fruttuoso-guided-hike",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Scenic Private Hiking Tour from Portofino to S. Fruttuoso",
    operator: "Local private guide, sold via Viator",
    kind: "Guided coastal walk",
    editorial:
      "The old footpath over the headland to the abbey at San Fruttuoso — reachable on foot or by water, never by car.",
    facts: [
      "4 to 6 hours (approx.)",
      "Private guide",
      "Pickup offered",
      "Departs Portofino, Italy",
      "Offered in English and 5 more",
    ],
    href: "https://www.viator.com/tours/Portofino/Portofino-to-S-Fruttuoso-Scenic-Coastal-Hike-with-Private-Guide/d4232-428295P2",
    sourceUrl:
      "https://www.viator.com/tours/Portofino/Portofino-to-S-Fruttuoso-Scenic-Coastal-Hike-with-Private-Guide/d4232-428295P2",
    factsCheckedOn: CHECKED,
    booking: "availability",
    commissionable: false,
    momentSlug: "exploring-the-harbor",
    image: expAbbey,
    imageIsIllustrative: true,
    featured: false,
  },
  {
    key: "portofino-la-portofinese-eco-farm",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "La Portofinese Eco-Farm — guided visit, vineyard tasting & picnic",
    operator: "La Portofinese (independent operator, booked direct)",
    kind: "Wine & eco-farm",
    editorial:
      "A self-sustaining farm inside the Portofino park — bees, olive trees and vines above the Cala degli Inglesi.",
    facts: [
      "Guided tour of the eco-farm with tasting of their wine in the vineyard",
      "Picnic aperitif, picnic lunch or early dinner options",
      "In the heart of Portofino's park, overlooking Cala degli Inglesi",
      "Arranged directly with the farm — enquiry only",
    ],
    href: "https://www.laportofinese.it/en/the-places/eco-farm/",
    sourceUrl: "https://www.laportofinese.it/en/the-places/eco-farm/",
    factsCheckedOn: CHECKED,
    booking: "enquiry",
    commissionable: false,
    momentSlug: "espresso-morning",
    // No accurate imagery of this farm is licensed to us, and the harbour photo
    // previously used here misrepresented the venue. Text-only by design.
    image: null,
    imageIsIllustrative: false,
    featured: false,
  },
  {
    key: "portofino-bagni-fiore-paraggi",
    destinationSlug: "portofino",
    destinationName: "Portofino",
    name: "Bagni Fiore, Paraggi — beach club & restaurant",
    operator: "Bagni Fiore (independent operator, booked direct)",
    kind: "Beach experience",
    editorial:
      "Emerald water at Paraggi, striped umbrellas in rows, lunch that stretches into the afternoon.",
    facts: [
      "Via Paraggi a Mare 1, Santa Margherita Ligure",
      "Open Sunday to Saturday, 09:00–19:00",
      "Beach club booked on the club's own calendar; restaurant reservations via SevenRooms",
    ],
    href: "https://www.bagnifiore.com/en",
    sourceUrl: "https://www.bagnifiore.com/en",
    factsCheckedOn: CHECKED,
    booking: "availability",
    commissionable: false,
    momentSlug: "beach-club",
    image: expBeachClub,
    imageIsIllustrative: true,
    featured: false,
  },
];

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
  return e.booking === "availability" ? "Check dates & availability" : "Enquire";
}

/** Internal/admin view only — never rendered to shoppers. */
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
