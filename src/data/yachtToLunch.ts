/**
 * Day 1 — Yacht Day & Harbour Aperitivo
 * 10-look editorial sourced from the canonical reference board
 * (src/assets/yacht-to-lunch-reference.asset.json). The reference image is
 * the source of truth — do NOT reorder, swap, or reinterpret looks here
 * without an updated reference board.
 *
 * Product links use the brand's own search/PDP endpoint or an approved
 * luxury retailer search URL. Replace with exact PDPs after Firecrawl
 * validation; mark `needs_validation: true` until verified.
 */

export type YachtProduct = {
  category: string;
  brand: string;
  item: string;
  price: string;
  href: string;
  imageUrl?: string;
  needs_validation?: boolean;
};

export type YachtLook = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  /** Editorial role / chapter in the day narrative. */
  chapter: string;
  /** Editorial prose shown alongside the muse image. */
  story: string;
  /** object-position for the cropped reference thumb (2-row × 5-col grid). */
  refPos: string;
  /** Standalone AI muse image for this look (resolved as URL). */
  museImage: string;
  products: YachtProduct[];
};

import look1Muse from "@/assets/looks/look-1-muse.jpg";
import look2Muse from "@/assets/looks/look-2-muse.jpg";
import look4Muse from "@/assets/looks/look-4-muse.jpg";
import look9Muse from "@/assets/looks/look-9-muse.jpg";
import look10Muse from "@/assets/looks/look-10-muse.jpg";

const FF = (q: string) =>
  `https://www.farfetch.com/shopping/women/search/?q=${encodeURIComponent(q)}`;
const NAP = (q: string) =>
  `https://www.net-a-porter.com/en-us/shop/search?keywords=${encodeURIComponent(q)}`;
const MT = (q: string) =>
  `https://www.mytheresa.com/en-us/search?q=${encodeURIComponent(q)}`;
const REV = (q: string) =>
  `https://www.revolve.com/r/Search.jsp?search=${encodeURIComponent(q)}`;
const SAKS = (q: string) =>
  `https://www.saksfifthavenue.com/search?q=${encodeURIComponent(q)}`;

export const YACHT_TO_LUNCH_LOOKS: YachtLook[] = [
  {
    id: "look-1",
    number: 1,
    title: "Yacht Arrival",
    subtitle: "Stepping onto teak in Majolica blue and woven raffia.",
    chapter: "Arrival",
    story:
      "The day begins at the marina — Majolica blue against bleached teak, a woven hat brim shading sunglasses, gold catching the morning light. A hero arrival look built around Dolce & Gabbana's signature print ecosystem.",
    refPos: "0% 0%",
    museImage: look1Muse,
    products: [
      { category: "Swim", brand: "Dolce & Gabbana", item: "Majolica Bikini Top", price: "$395", href: MT("dolce gabbana majolica bikini top"), needs_validation: true },
      { category: "Cover-up", brand: "Dolce & Gabbana", item: "Majolica Pareo", price: "$495", href: MT("dolce gabbana majolica pareo"), needs_validation: true },
      { category: "Shoes", brand: "Biankina", item: "Rope Espadrille Sandals", price: "$250", href: "https://www.biankina.com/collections/sandals", needs_validation: true },
      { category: "Bag", brand: "Loewe", item: "Paula's Ibiza Basket Bag", price: "$690", href: NAP("loewe paulas ibiza basket bag"), needs_validation: true },
      { category: "Sunglasses", brand: "Krewe", item: "St. Louis Sunglasses", price: "$235", href: "https://krewe.com/collections/st-louis", needs_validation: true },
      { category: "Necklace", brand: "Jennifer Meyer", item: "Initial Necklace", price: "$475", href: "https://www.jennifermeyer.com/collections/necklaces", needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Small Gold Hoops", price: "$475", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Jennifer Meyer", item: "Gold Bracelet", price: "$1,175", href: "https://www.jennifermeyer.com/collections/bracelets", needs_validation: true },
      { category: "Hat", brand: "Lack of Color", item: "Woven Wide Brim Hat", price: "$149", href: "https://www.lackofcolor.com/collections/sun-hats", needs_validation: true },
    ],
  },
  {
    id: "look-2",
    number: 2,
    title: "Feminine Yacht Swim",
    subtitle: "Cobalt belted maillot, raffia tote, layered gold.",
    chapter: "Open Water",
    story:
      "Anchored over the cove in a sculptural cobalt Alexandra Miro maillot — belted at the waist, sheer Anine Bing layer thrown across the shoulders. Braided Dragon Diffusion leather, fisherman flats, Lizzie Fortunato shells. Feminine, considered, all swim.",
    refPos: "25% 0%",
    museImage: look2Muse,
    products: [
      { category: "Swim", brand: "Alexandra Miro", item: "Whitney Belted Swimsuit (Cobalt)", price: "$390", href: MT("alexandra miro whitney swimsuit"), needs_validation: true },
      { category: "Layer", brand: "Anine Bing", item: "Mylah Sheer Cotton Shirt", price: "$250", href: "https://www.aninebing.com/collections/tops", needs_validation: true },
      { category: "Bag", brand: "Dragon Diffusion", item: "Mini Pyla Woven Tote", price: "$475", href: NAP("dragon diffusion woven tote"), needs_validation: true },
      { category: "Shoes", brand: "Ancient Greek Sandals", item: "Aristea Fisherman Sandals", price: "$235", href: NAP("ancient greek fisherman sandals"), needs_validation: true },
      { category: "Necklace", brand: "Lizzie Fortunato", item: "Stacked Shell Necklace", price: "$325", href: "https://www.lizziefortunato.com/collections/necklaces", needs_validation: true },
      { category: "Earrings", brand: "Lizzie Fortunato", item: "Mother of Pearl Drops", price: "$245", href: "https://www.lizziefortunato.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Lizzie Fortunato", item: "Gold Cuff", price: "$285", href: "https://www.lizziefortunato.com/collections/bracelets", needs_validation: true },
      { category: "Hat", brand: "Anine Bing", item: "Wide Brim Straw Hat", price: "$200", href: "https://www.aninebing.com/collections/accessories", needs_validation: true },
      { category: "Sunglasses", brand: "Anine Bing", item: "Indio Tortoise Sunglasses", price: "$165", href: "https://www.aninebing.com/collections/accessories", needs_validation: true },
    ],
  },
  {
    id: "look-3",
    number: 3,
    title: "Beach Club Swim",
    subtitle: "Johanna Ortiz emerald print, Cult Gaia clutch, Amanu sandals.",
    chapter: "Beach Club",
    story:
      "Mid-day at the beach club in a Johanna Ortiz emerald bikini and matching shirt-dress cover-up. Cult Gaia sculptural clutch, Amanu custom leather sandals, Gianvito Rossi slides at the ready, Completedworks pearl drops. Social, confident, fully swim.",
    refPos: "75% 0%",
    museImage: look4Muse,
    products: [
      { category: "Swim", brand: "Johanna Ortiz", item: "Emerald Print Triangle Bikini", price: "$425", href: MT("johanna ortiz bikini"), needs_validation: true },
      { category: "Cover-up", brand: "Johanna Ortiz", item: "Matching Linen Shirt-Dress", price: "$685", href: MT("johanna ortiz cover up"), needs_validation: true },
      { category: "Bag", brand: "Cult Gaia", item: "Eos Sculptural Clutch", price: "$398", href: REV("cult gaia eos clutch"), needs_validation: true },
      { category: "Shoes", brand: "Amanu", item: "Style 3 Custom Leather Sandals", price: "$595", href: "https://amanu.us/collections/sandals", needs_validation: true },
      { category: "Slides", brand: "Gianvito Rossi", item: "Portofino Flat Sandals", price: "$795", href: NAP("gianvito rossi portofino"), needs_validation: true },
      { category: "Earrings", brand: "Completedworks", item: "Pearl Drop Earrings", price: "$295", href: NAP("completedworks pearl earrings"), needs_validation: true },
      { category: "Necklace", brand: "Completedworks", item: "Sculptural Gold Chain", price: "$380", href: NAP("completedworks necklace"), needs_validation: true },
      { category: "Bracelet", brand: "Completedworks", item: "Twisted Gold Cuff", price: "$340", href: NAP("completedworks cuff"), needs_validation: true },
      { category: "Hat", brand: "Johanna Ortiz", item: "Wide Brim Sun Hat", price: "$345", href: MT("johanna ortiz hat"), needs_validation: true },
    ],
  },
  {
    id: "look-4",
    number: 4,
    title: "Sunset Aperitivo Swim",
    subtitle: "Johanna Ortiz coral bikini, Cult Gaia clutch, Gianvito Rossi heels.",
    chapter: "Aperitivo",
    story:
      "Golden hour on the piazzetta. A coral Johanna Ortiz bikini under a matching draped sarong, Cult Gaia woven clutch, Gianvito Rossi heeled sandals, sculptural Anita Ko gold, Spinelli Kilcollin linked rings. Aperol in hand, swim-led.",
    refPos: "75% 100%",
    museImage: look9Muse,
    products: [
      { category: "Swim", brand: "Johanna Ortiz", item: "Coral Tie Bikini", price: "$425", href: MT("johanna ortiz coral bikini"), needs_validation: true },
      { category: "Cover-up", brand: "Johanna Ortiz", item: "Coral Draped Sarong", price: "$485", href: MT("johanna ortiz sarong"), needs_validation: true },
      { category: "Bag", brand: "Cult Gaia", item: "Hera Woven Clutch", price: "$398", href: REV("cult gaia hera clutch"), needs_validation: true },
      { category: "Shoes", brand: "Gianvito Rossi", item: "Bijoux Heeled Sandals", price: "$895", href: NAP("gianvito rossi bijoux"), needs_validation: true },
      { category: "Earrings", brand: "Anita Ko", item: "Gold Drop Earrings", price: "$2,450", href: NAP("anita ko earrings"), needs_validation: true },
      { category: "Necklace", brand: "Anita Ko", item: "Sculptural Gold Choker", price: "$3,800", href: NAP("anita ko necklace"), needs_validation: true },
      { category: "Bracelet", brand: "Anita Ko", item: "Diamond Cuff", price: "$5,500", href: NAP("anita ko bracelet"), needs_validation: true },
      { category: "Ring", brand: "Spinelli Kilcollin", item: "Sirius Linked Ring", price: "$1,150", href: NAP("spinelli kilcollin ring"), needs_validation: true },
      { category: "Sunglasses", brand: "Spinelli Kilcollin", item: "Cat-Eye Sunglasses", price: "$580", href: NAP("spinelli kilcollin sunglasses"), needs_validation: true },
    ],
  },
  {
    id: "look-5",
    number: 5,
    title: "Evening Yacht Swim",
    subtitle: "Oséree gold lamé, Saint Laurent slides, Aquazzura heels, Mateo jewels.",
    chapter: "Evening Yacht",
    story:
      "Back on the yacht at dusk in an Oséree gold-lamé maillot with a matching sheer skirt, Saint Laurent slides for the deck, Aquazzura heels for the tender, Mateo diamond pieces, a Persée gold cuff. The day's swim-led highest glamour.",
    refPos: "100% 100%",
    museImage: look10Muse,
    products: [
      { category: "Swim", brand: "Oséree", item: "Lumière Gold Lamé Maillot", price: "$425", href: NAP("oseree lumiere swimsuit"), needs_validation: true },
      { category: "Cover-up", brand: "Oséree", item: "Lumière Gold Sheer Skirt", price: "$395", href: NAP("oseree lumiere skirt"), needs_validation: true },
      { category: "Slides", brand: "Saint Laurent", item: "Tribute Black Leather Slides", price: "$795", href: NAP("saint laurent tribute"), needs_validation: true },
      { category: "Shoes", brand: "Aquazzura", item: "Strappy Gold Heeled Sandals", price: "$795", href: NAP("aquazzura gold sandals"), needs_validation: true },
      { category: "Bag", brand: "Saint Laurent", item: "Kate Black Evening Clutch", price: "$1,990", href: NAP("saint laurent kate clutch"), needs_validation: true },
      { category: "Earrings", brand: "Mateo", item: "Diamond Drop Earrings", price: "$2,250", href: NAP("mateo earrings"), needs_validation: true },
      { category: "Necklace", brand: "Mateo", item: "Diamond Pendant Necklace", price: "$3,500", href: NAP("mateo necklace"), needs_validation: true },
      { category: "Bracelet", brand: "Persée", item: "Gold Diamond Cuff", price: "$4,200", href: NAP("persee bracelet"), needs_validation: true },
      { category: "Ring", brand: "Persée", item: "Gold Diamond Ring", price: "$2,800", href: NAP("persee ring"), needs_validation: true },
    ],
  },
];
