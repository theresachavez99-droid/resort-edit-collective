import type { Look } from "@/data/lookbook";
import type { LookSlug } from "@/lib/portofino-spec";

export type HotelKey = "splendido" | "eight" | "piccolo";

export type LookEnrichment = {
  activities: string[];
  whyItWorks: string[];
  packing: string[];
  experiences: { label: string; href: string }[];
  hotels: HotelKey[];
};

const DAY_DEFAULTS: Record<Look["daySlug"], LookEnrichment> = {
  "day-1": {
    activities: [
      "Hotel pickup",
      "Marina departure",
      "Yacht cruise along the coast",
      "Swimming stop in a hidden cove",
      "Lunch onboard",
      "Harbor return at golden hour",
    ],
    whyItWorks: [
      "The blue-and-white print mirrors the ceramics, harbor colors, and architecture found throughout Portofino — the outfit photographs as part of the destination, not against it.",
      "The pareo transitions effortlessly from swimming to lunch without requiring a full outfit change, which matters when you're tendered between boat and shore.",
      "Flat sandals provide practical yacht-day functionality while maintaining an elevated Riviera aesthetic — no wedges sinking into teak decking.",
      "The silhouette photographs beautifully while remaining comfortable for a full day on the water, with no straps to readjust after every dip.",
    ],
    packing: [
      "SPF 50",
      "Polarized sunglasses",
      "Hair tie & silk scrunchie",
      "Coverup / pareo",
      "Portable charger",
      "Waterproof phone pouch",
      "Motion sickness remedy (optional)",
    ],
    experiences: [
      { label: "Yacht Charter", href: "/portofino" },
      { label: "Beach Club Reservation", href: "/portofino" },
      { label: "Boat Tour", href: "/portofino" },
    ],
    hotels: ["splendido", "eight", "piccolo"],
  },
  "day-2": {
    activities: [
      "Slow breakfast on the terrace",
      "Beach club arrival",
      "Cabana morning",
      "Long lunch by the water",
      "Afternoon swim",
      "Aperitivo at sunset",
    ],
    whyItWorks: [
      "Lightweight fabrics handle the heat of a long beach club afternoon without ever looking creased.",
      "The palette reads sun-bleached and coastal — at home on cabana stripes and white linen tables.",
      "Footwear is dressy enough for lunch yet flat for the walk back along the harbor.",
      "Everything layers under a coverup without changing the silhouette of the look.",
    ],
    packing: ["SPF 50", "Sunglasses", "Wide-brim hat", "Coverup", "Cash for tips", "Lip balm with SPF"],
    experiences: [
      { label: "Beach Club Reservation", href: "/portofino" },
      { label: "Lunch Booking", href: "/portofino" },
      { label: "Sunset Aperitivo", href: "/portofino" },
    ],
    hotels: ["splendido", "eight", "piccolo"],
  },
  "day-3": {
    activities: [
      "Late breakfast in robe",
      "Pool morning",
      "Light lunch on the terrace",
      "Via Roma boutique stroll",
      "Espresso break",
      "Golden-hour balcony moment",
    ],
    whyItWorks: [
      "The look reads polished poolside, dressed enough to walk straight into a boutique without changing.",
      "Neutral resort tones flatter every kind of light, from harsh midday sun to the lower angle of afternoon.",
      "Sandals are walk-the-village comfortable on cobblestones, never sloppy.",
      "The bag holds wallet, phone, sunscreen and a small purchase — built for an actual day.",
    ],
    packing: ["SPF", "Sunglasses", "Tote for purchases", "Light cardigan", "Comfortable sandals", "Cash & card"],
    experiences: [
      { label: "Spa Booking", href: "/portofino" },
      { label: "Private Shopping", href: "/portofino" },
      { label: "Wine Tasting", href: "/portofino" },
    ],
    hotels: ["splendido", "eight", "piccolo"],
  },
  "day-4": {
    activities: [
      "Golden hour aperitivo",
      "Pre-dinner walk along the harbor",
      "Candlelit dinner reservation",
      "Post-dinner passeggiata",
      "Nightcap on a terrace",
    ],
    whyItWorks: [
      "The silhouette comes alive in candlelight without feeling overdressed for an outdoor table.",
      "Fabrics catch the harbor breeze the way summer evening dresses should.",
      "Jewelry is meaningful but easy — no fussing during dinner.",
      "Heels are elevated yet survivable on cobblestone.",
    ],
    packing: ["Light wrap or shawl", "Evening clutch", "Lipstick", "Reservation confirmation", "Comfortable second pair of sandals"],
    experiences: [
      { label: "Dinner Reservation", href: "/portofino" },
      { label: "Private Driver", href: "/portofino" },
      { label: "Sunset Sailing", href: "/portofino" },
    ],
    hotels: ["splendido", "eight", "piccolo"],
  },
  "day-5": {
    activities: [
      "Espresso in the piazzetta",
      "Morning market stroll",
      "Pastry stop",
      "One last long coastal lunch",
      "Slow walk back to pack",
      "Coastal goodbye",
    ],
    whyItWorks: [
      "Lightweight enough to travel home in, polished enough for a final lunch.",
      "The palette photographs beautifully against painted facades and market produce.",
      "Comfortable sandals carry you across cobblestones without compromise.",
      "Easy layering for an air-conditioned car or train back.",
    ],
    packing: ["SPF", "Sunglasses", "Tote bag", "Reusable water bottle", "Cash for the market", "Light layer for travel"],
    experiences: [
      { label: "Private Transfer", href: "/portofino" },
      { label: "Market Tour", href: "/portofino" },
      { label: "Farewell Lunch", href: "/portofino" },
    ],
    hotels: ["splendido", "eight", "piccolo"],
  },
};

export function enrichmentFor(daySlug: Look["daySlug"], _lookSlug: LookSlug): LookEnrichment {
  return DAY_DEFAULTS[daySlug];
}

export const HOTEL_DETAILS: Record<HotelKey, { name: string; tag: string; note: string; href: string }> = {
  splendido: {
    name: "Splendido, A Belmond Hotel",
    tag: "ICONIC · CLIFFTOP VIEWS",
    note: "Where to stay if this trip is the trip.",
    href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
  },
  eight: {
    name: "Eight Hotel Portofino",
    tag: "PIAZZETTA · LOCAL ENERGY",
    note: "For the trip you'll want to repeat next summer.",
    href: "https://www.eighthotels.com/en/eight-hotel-portofino/",
  },
  piccolo: {
    name: "Hotel Piccolo Portofino",
    tag: "HIDDEN · PRIVATE COVE",
    note: "For the harbor without the crowd.",
    href: "https://www.hotelpiccoloportofino.com/",
  },
};

export const CUSTOMIZE_OPTIONS = [
  "More Coverage",
  "Less Coverage",
  "Petite Friendly",
  "Curvy Friendly",
  "Large Bust Friendly",
  "Flat Shoes Only",
  "Prefer Linen",
  "Sun Protection Focused",
] as const;