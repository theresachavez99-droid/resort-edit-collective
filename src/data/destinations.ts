import portofino from "@/assets/dest-portofino.jpg";
import capri from "@/assets/dest-capri.jpg";
import sttropez from "@/assets/dest-sttropez.jpg";
import phuket from "@/assets/dest-phuket.jpg";
import ibiza from "@/assets/dest-ibiza.jpg";
import tulum from "@/assets/dest-tulum.jpg";
import mallorca from "@/assets/dest-mallorca.jpg";

export type TravelType =
  | "Mediterranean"
  | "Tropical"
  | "Island"
  | "Coastal";

export type RegionGroup =
  | "Mediterranean & Riviera"
  | "Balearic & Atlantic Islands"
  | "Caribbean & Latin America"
  | "Asia Pacific";

export type Destination = {
  slug: string;
  name: string;
  country: string;
  region: string;
  regionGroup: RegionGroup;
  travelType: TravelType;
  tagline: string;
  image: string;
  /** Latitude (-90..90) and longitude (-180..180) for the world map pin. */
  lat: number;
  lng: number;
  /** When set, the card links to a bespoke edit route instead of /destinations/$slug. */
  href?: string;
  overview: string;
  whatToWear: string[];
  shopEdits: { label: string; href: string }[];
  itinerary: { day: string; plan: string }[];
  dining: { name: string; type: "Restaurant" | "Beach Club" | "Bar"; note: string }[];
  related: string[]; // slugs
};

export const destinations: Destination[] = [
  {
    slug: "portofino",
    name: "Portofino",
    country: "Italy",
    region: "Italian Riviera",
    regionGroup: "Mediterranean & Riviera",
    travelType: "Mediterranean",
    tagline: "The harbor of pastel palazzi and silk caftans.",
    image: portofino,
    lat: 44.303,
    lng: 9.21,
    href: "/portofino",
    overview:
      "A pocket-sized harbor on the Ligurian coast where pastel facades meet superyachts and the aperitivo hour stretches into a small ceremony.",
    whatToWear: ["Silk caftans", "Crisp linen sets", "Espadrille wedges", "Gold hoop earrings"],
    shopEdits: [{ label: "The Portofino Edit", href: "/portofino" }],
    itinerary: [
      { day: "Day 1", plan: "Late breakfast at Belmond Splendido, harbor stroll, sunset Negroni at Chuflay." },
      { day: "Day 2", plan: "Boat to San Fruttuoso abbey, long lunch at Da Puny, evening walk to the lighthouse." },
    ],
    dining: [
      { name: "Da Puny", type: "Restaurant", note: "The harborside trattoria everyone whispers about." },
      { name: "Chuflay", type: "Bar", note: "Belmond's tented terrace for golden-hour spritzes." },
    ],
    related: ["capri", "sttropez"],
  },
  {
    slug: "capri",
    name: "Capri",
    country: "Italy",
    region: "Tyrrhenian Sea",
    regionGroup: "Mediterranean & Riviera",
    travelType: "Island",
    tagline: "Limoncello afternoons above the Faraglioni.",
    image: capri,
    lat: 40.553,
    lng: 14.243,
    overview:
      "A vertical island of lemon groves, white-washed villas and Tyrrhenian blue — built for slow lunches and even slower descents to the sea.",
    whatToWear: ["Capri pants", "Eyelet cotton dresses", "Leather sandals from a Marina Grande cobbler", "Wide straw hat"],
    shopEdits: [{ label: "Coming soon: The Capri Edit", href: "/destinations/capri" }],
    itinerary: [
      { day: "Day 1", plan: "Funicular to Capri town, granita at Piazzetta, sunset at Punta Tragara." },
      { day: "Day 2", plan: "Private gozzo around the Faraglioni, lunch at Da Luigi ai Faraglioni." },
    ],
    dining: [
      { name: "Da Luigi ai Faraglioni", type: "Beach Club", note: "Lunch on a wooden deck under the rock arches." },
      { name: "La Fontelina", type: "Beach Club", note: "Sun loungers reached only by boat or footpath." },
    ],
    related: ["portofino", "mallorca"],
  },
  {
    slug: "sttropez",
    name: "St. Tropez",
    country: "France",
    region: "Côte d'Azur",
    regionGroup: "Mediterranean & Riviera",
    travelType: "Mediterranean",
    tagline: "White umbrellas, rosé and a private tender.",
    image: sttropez,
    lat: 43.272,
    lng: 6.64,
    overview:
      "Sun-bleached Provence with a yachting wardrobe — fishing village mornings, Pampelonne afternoons, jazz-bar nights.",
    whatToWear: ["Striped Breton tops", "Linen jumpsuits", "Sandales tropéziennes", "Oversized resort sunglasses"],
    shopEdits: [{ label: "Coming soon: The St. Tropez Edit", href: "/destinations/sttropez" }],
    itinerary: [
      { day: "Day 1", plan: "Morning at Place des Lices market, lunch at Club 55, dinner at La Vague d'Or." },
      { day: "Day 2", plan: "Tender to Pampelonne, sunset rosé at Senequier on the old port." },
    ],
    dining: [
      { name: "Club 55", type: "Beach Club", note: "The originator of the long Pampelonne lunch." },
      { name: "Senequier", type: "Bar", note: "Red awnings, harbor view, perfect early evening." },
    ],
    related: ["portofino", "ibiza"],
  },
  {
    slug: "mallorca",
    name: "Mallorca",
    country: "Spain",
    region: "Balearic Islands",
    regionGroup: "Balearic & Atlantic Islands",
    travelType: "Island",
    tagline: "Hidden coves and a quiet sailboat at noon.",
    image: mallorca,
    lat: 39.695,
    lng: 3.017,
    overview:
      "The Balearic for those who want the quiet side — Tramuntana villages, almond groves and coves you reach by foot or by sail.",
    whatToWear: ["Crochet cover-ups", "Slip dresses", "Raffia totes", "Flat leather sandals"],
    shopEdits: [{ label: "Coming soon: The Mallorca Edit", href: "/destinations/mallorca" }],
    itinerary: [
      { day: "Day 1", plan: "Drive the Tramuntana to Deià, lunch at Ca's Patró March." },
      { day: "Day 2", plan: "Boat from Port d'Andratx to a hidden cala for a long swim and picnic." },
    ],
    dining: [
      { name: "Ca's Patró March", type: "Restaurant", note: "Cliffside fish lunch above Cala Deià." },
      { name: "Hotel Cort", type: "Bar", note: "Olive-tree courtyard in Palma's old town." },
    ],
    related: ["ibiza", "capri"],
  },
  {
    slug: "ibiza",
    name: "Ibiza",
    country: "Spain",
    region: "Balearic Islands",
    regionGroup: "Balearic & Atlantic Islands",
    travelType: "Island",
    tagline: "Whitewashed cliffs and bougainvillea sunsets.",
    image: ibiza,
    lat: 38.909,
    lng: 1.433,
    overview:
      "The north of the island, not the south — finca hotels, almond-grove dinners, and a sunset stretch above Cala d'Hort.",
    whatToWear: ["Bohemian maxi dresses", "Embroidered tunics", "Stacked silver bangles", "Leather flat sandals"],
    shopEdits: [{ label: "Coming soon: The Ibiza Edit", href: "/destinations/ibiza" }],
    itinerary: [
      { day: "Day 1", plan: "Slow morning at La Granja, sunset at Hostal La Torre with a glass of cava." },
      { day: "Day 2", plan: "Hire a boat from Santa Eulalia for a day on Formentera's white-sand shallows." },
    ],
    dining: [
      { name: "La Paloma", type: "Restaurant", note: "Garden tables under lemon trees in San Lorenzo." },
      { name: "Beso Beach", type: "Beach Club", note: "Linen-draped tables on the Formentera sand." },
    ],
    related: ["mallorca", "sttropez"],
  },
  {
    slug: "tulum",
    name: "Tulum",
    country: "Mexico",
    region: "Riviera Maya",
    regionGroup: "Caribbean & Latin America",
    travelType: "Tropical",
    tagline: "Caribbean cabanas under turning palms.",
    image: tulum,
    lat: 20.211,
    lng: -87.466,
    overview:
      "Jungle and turquoise sea meet on a thin ribbon of beach — candlelit dinners, cenote mornings, and an unhurried barefoot dress code.",
    whatToWear: ["Linen wrap dresses", "Crochet bikinis", "Beaded sandals", "Panama hat"],
    shopEdits: [{ label: "Coming soon: The Tulum Edit", href: "/destinations/tulum" }],
    itinerary: [
      { day: "Day 1", plan: "Sunrise yoga at Habitas, cenote swim, dinner at Hartwood." },
      { day: "Day 2", plan: "Day trip to Sian Ka'an biosphere, sunset mezcal at Casa Jaguar." },
    ],
    dining: [
      { name: "Hartwood", type: "Restaurant", note: "Open-fire jungle kitchen — book weeks ahead." },
      { name: "Casa Jaguar", type: "Bar", note: "Lantern-lit garden, the right last stop of the night." },
    ],
    related: ["phuket", "capri"],
  },
  {
    slug: "phuket",
    name: "Phuket",
    country: "Thailand",
    region: "Andaman Sea",
    regionGroup: "Asia Pacific",
    travelType: "Tropical",
    tagline: "Infinity pools above a jade horizon.",
    image: phuket,
    lat: 7.88,
    lng: 98.392,
    overview:
      "Cliffside villas, long-tail boats to Phang Nga Bay and pool decks that drop straight into the Andaman.",
    whatToWear: ["Silk slip dresses", "Cotton kaftans", "Gold cuff bracelets", "Sliders for the pool deck"],
    shopEdits: [{ label: "Coming soon: The Phuket Edit", href: "/destinations/phuket" }],
    itinerary: [
      { day: "Day 1", plan: "Morning at Amanpuri, long-tail boat to Phi Phi for a picnic lunch." },
      { day: "Day 2", plan: "Sunset cocktails at Baba Nest, dinner at Pru in Layan." },
    ],
    dining: [
      { name: "Pru", type: "Restaurant", note: "Farm-to-table tasting menu with Andaman views." },
      { name: "Baba Nest", type: "Bar", note: "Rooftop perch at Sri Panwa for the full 360 sunset." },
    ],
    related: ["tulum", "mallorca"],
  },
];

export const regionGroups: RegionGroup[] = [
  "Mediterranean & Riviera",
  "Balearic & Atlantic Islands",
  "Caribbean & Latin America",
  "Asia Pacific",
];

export const travelTypes: TravelType[] = ["Mediterranean", "Island", "Tropical", "Coastal"];

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function destinationHref(d: Destination): string {
  return d.href ?? `/destinations/${d.slug}`;
}

/**
 * Third shopping tier label, adapted to destination context.
 * First two tiers are always "Luxury" and "Mid-Luxe"; the third stays curated
 * to where the guest is going (Riviera Finds, Beach Club Finds, etc.).
 */
const destinationTierLabels: Record<string, string> = {
  portofino: "Riviera Finds",
  capri: "Island Finds",
  sttropez: "Riviera Finds",
  mallorca: "Island Finds",
  ibiza: "Beach Club Finds",
  tulum: "Jungle Finds",
  phuket: "Andaman Finds",
};

export function getDestinationTierLabel(slug: string): string {
  return destinationTierLabels[slug] ?? "Destination Finds";
}