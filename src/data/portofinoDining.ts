/**
 * PORTOFINO DINING — the EAT layer of the destination hub.
 *
 * One place to edit the dining recommendations. Honesty rules:
 *  - `href` is only set where we have a verified official page. Where a
 *    restaurant has no reliable site, the card stays text-only rather than
 *    pointing somewhere invented.
 *  - No prices, no ratings, no claims of a booking relationship we don't have.
 */

export type DiningSpot = {
  key: string;
  name: string;
  /** Short category label, e.g. "Harbourside institution". */
  kind: string;
  /** Editorial one-liner. */
  note: string;
  /** Verified official page, when one exists. */
  href?: string;
  /** Truthful CTA wording for that link. */
  hrefLabel?: string;
};

export const PORTOFINO_DINING: readonly DiningSpot[] = [
  {
    key: "dav-mare",
    name: "DaV Mare, Splendido Mare",
    kind: "On the piazzetta",
    note: "Ligurian seafood at the water's edge — the table to book on your first night.",
    href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-splendido-mare/",
    hrefLabel: "Reserve via Splendido Mare",
  },
  {
    key: "la-terrazza",
    name: "La Terrazza, Belmond Hotel Splendido",
    kind: "Clifftop dinner",
    note: "Dinner above the harbor, bougainvillea on every side, the view doing most of the work.",
    href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
    hrefLabel: "Reserve via Belmond Splendido",
  },
  {
    key: "bagni-fiore-restaurant",
    name: "Bagni Fiore, Paraggi",
    kind: "Long lunch by the sea",
    note: "Emerald water, striped umbrellas, a lunch that quietly becomes the afternoon.",
    href: "https://www.bagnifiore.com/en",
    hrefLabel: "Check the club's calendar",
  },
  {
    key: "ristorante-puny",
    name: "Ristorante Puny",
    kind: "Piazzetta institution",
    note: "The classic Portofino dining room. Small, beloved, and worth calling well ahead.",
  },
  {
    key: "da-o-batti",
    name: "Da ö Batti",
    kind: "Local, unfussy",
    note: "Tucked off the harbor for the kind of seafood pasta locals order without reading the menu.",
  },
  {
    key: "santa-margherita-tables",
    name: "Santa Margherita Ligure",
    kind: "Ten minutes away",
    note: "Easier tables and easier logistics — come into Portofino for the aperitivo instead.",
  },
];
