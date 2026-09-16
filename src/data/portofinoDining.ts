/**
 * PORTOFINO DINING — the EAT layer of the destination hub.
 *
 * One place to edit the dining recommendations. Honesty rules:
 *  - `linkKey` points at the outbound registry. Where a restaurant has no
 *    verified page of its own, no key is set and the card stays text-only
 *    rather than pointing somewhere invented.
 *  - No prices, no ratings, no claims of a booking relationship we don't have.
 *  - We describe what a place is, not what "locals" do or when it empties.
 */

export type DiningSpot = {
  key: string;
  name: string;
  /** Short category label, e.g. "On the piazzetta". */
  kind: string;
  /** Editorial one-liner. */
  note: string;
  /** Outbound registry key, when a verified official page exists. */
  linkKey?: string;
  /** Practical planning line shown when there is no link. */
  planning?: string;
};

export const PORTOFINO_DINING: readonly DiningSpot[] = [
  {
    key: "dav-mare",
    name: "DaV Mare, Splendido Mare",
    kind: "On the piazzetta",
    note: "Ligurian seafood at the water's edge, inside Belmond's harbourfront hotel. Reserve through the hotel.",
    linkKey: "dining-dav-mare",
  },
  {
    key: "la-terrazza",
    name: "La Terrazza, Splendido",
    kind: "Clifftop dinner",
    note: "Dinner on the terrace above the harbour, bougainvillea on every side. Reserve through the hotel.",
    linkKey: "dining-la-terrazza",
  },
  {
    key: "bagni-fiore-restaurant",
    name: "Bagni Fiore, Paraggi",
    kind: "Long lunch by the sea",
    note: "Emerald water, striped umbrellas, a lunch that quietly becomes the afternoon. Sunbeds and the restaurant are booked separately.",
    linkKey: "dining-bagni-fiore",
  },
  {
    key: "ristorante-puny",
    name: "Ristorante Puny",
    kind: "Piazzetta institution",
    note: "A small, long-established dining room right on the square.",
    planning: "No booking page we can verify — reserve by phone or ask your hotel to call ahead.",
  },
  {
    key: "da-o-batti",
    name: "Da ö Batti",
    kind: "Off the harbour",
    note: "A compact seafood kitchen a short walk back from the quay.",
    planning: "No booking page we can verify — reserve by phone or ask your hotel to call ahead.",
  },
  {
    key: "santa-margherita-tables",
    name: "Santa Margherita Ligure",
    kind: "Ten minutes away",
    note: "A larger choice of restaurants a short drive or boat ride along the coast, useful when Portofino is fully booked.",
    planning: "Reserve directly with the restaurant you choose.",
  },
];
