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
    title: "Casual Transfer Swim",
    subtitle: "Sculptural ERES one-piece, easy linen, raffia crossbody.",
    chapter: "Transfer",
    story:
      "Tender to shore for an espresso, the ERES Aquarelle one-piece glimpsing under a Faithfull linen shirt and Kivari sarong. Hereu raffia at the hip, Le Specs across the eyes. Swim-first, effortless to slip back into the water.",
    refPos: "50% 0%",
    museImage: look3Muse,
    products: [
      { category: "Swim", brand: "ERES", item: "Aquarelle Sculptural One-Piece", price: "$590", href: NAP("eres aquarelle swimsuit"), needs_validation: true },
      { category: "Layer", brand: "Faithfull the Brand", item: "Oversized White Linen Shirt", price: "$219", href: REV("faithfull linen shirt"), needs_validation: true },
      { category: "Cover-up", brand: "Kivari", item: "Marisol Cotton Sarong", price: "$160", href: REV("kivari sarong"), needs_validation: true },
      { category: "Bag", brand: "Hereu", item: "Tirita Raffia Crossbody", price: "$385", href: NAP("hereu tirita crossbody"), needs_validation: true },
      { category: "Shoes", brand: "Ancient Greek Sandals", item: "Aristea Fisherman Sandals", price: "$235", href: NAP("ancient greek fisherman sandals"), needs_validation: true },
      { category: "Sunglasses", brand: "Le Specs", item: "Outta Love Tortoise Sunglasses", price: "$79", href: REV("le specs outta love"), needs_validation: true },
      { category: "Necklace", brand: "Faithfull the Brand", item: "Coastline Gold Chain", price: "$140", href: REV("faithfull gold necklace"), needs_validation: true },
      { category: "Earrings", brand: "Faithfull the Brand", item: "Gold Hoop Earrings", price: "$110", href: REV("faithfull gold hoop"), needs_validation: true },
      { category: "Bracelet", brand: "Kivari", item: "Gold Bangle", price: "$95", href: REV("kivari gold bangle"), needs_validation: true },
    ],
  },
  {
    id: "look-4",
    number: 4,
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
    id: "look-5",
    number: 5,
    title: "Bold Print Statement Swim",
    subtitle: "Agua by Agua Bendita botanical bikini, Lulu DK sarong, Castañer espadrilles.",
    chapter: "Hidden Cove",
    story:
      "Anchored in a hidden cove. A collectible Agua by Agua Bendita botanical bikini layered against a Lulu DK printed sarong, Lizzie Fortunato woven tote, Castañer rope espadrilles, Gas Bijoux shells at the ears. The print-collector's swim moment.",
    refPos: "100% 0%",
    museImage: look5Muse,
    products: [
      { category: "Swim", brand: "Agua by Agua Bendita", item: "Botanical Print Bikini", price: "$320", href: NAP("agua bendita bikini"), needs_validation: true },
      { category: "Cover-up", brand: "Lulu DK", item: "Printed Silk Sarong", price: "$295", href: "https://www.luludk.com/collections/sarongs", needs_validation: true },
      { category: "Bag", brand: "Lizzie Fortunato", item: "Woven Beach Tote", price: "$495", href: "https://www.lizziefortunato.com/collections/bags", needs_validation: true },
      { category: "Shoes", brand: "Castañer", item: "Carina Rope Espadrilles", price: "$165", href: "https://www.castaner.com/us/en/shop/espadrilles/woman", needs_validation: true },
      { category: "Earrings", brand: "Gas Bijoux", item: "Shell Hoop Earrings", price: "$295", href: NAP("gas bijoux earrings"), needs_validation: true },
      { category: "Necklace", brand: "Gas Bijoux", item: "Cauris Shell Necklace", price: "$345", href: NAP("gas bijoux shell necklace"), needs_validation: true },
      { category: "Bracelet", brand: "Gas Bijoux", item: "Stacked Gold Bracelets", price: "$285", href: NAP("gas bijoux bracelet"), needs_validation: true },
      { category: "Hat", brand: "Lizzie Fortunato", item: "Wide Brim Straw Hat", price: "$245", href: "https://www.lizziefortunato.com/collections/accessories", needs_validation: true },
      { category: "Sunglasses", brand: "Lulu DK", item: "Oversized Tortoise Frames", price: "$185", href: "https://www.luludk.com/collections/accessories", needs_validation: true },
    ],
  },
  {
    id: "look-6",
    number: 6,
    title: "Retro Glam Swim",
    subtitle: "Pucci print maillot, Loewe basket, Aquazzura slides, Linda Farrow shields.",
    chapter: "Retro Glam",
    story:
      "Mid-afternoon retro glamour — a Pucci kaleidoscopic print maillot, Loewe Anagram basket, Aquazzura jeweled slides, oversized Linda Farrow shield sunglasses, candy-bright Roxanne Assoulin stacks. Capri-meets-Portofino, swim-anchored.",
    refPos: "0% 100%",
    museImage: look6Muse,
    products: [
      { category: "Swim", brand: "Pucci", item: "Marmo-Print One-Piece", price: "$890", href: MT("pucci swimsuit"), needs_validation: true },
      { category: "Cover-up", brand: "Pucci", item: "Matching Silk Kaftan", price: "$1,490", href: MT("pucci kaftan"), needs_validation: true },
      { category: "Bag", brand: "Loewe", item: "Anagram Basket Bag", price: "$890", href: NAP("loewe anagram basket"), needs_validation: true },
      { category: "Shoes", brand: "Aquazzura", item: "Crystal Embellished Slides", price: "$795", href: NAP("aquazzura crystal slides"), needs_validation: true },
      { category: "Sunglasses", brand: "Linda Farrow", item: "Oversized Shield Sunglasses", price: "$895", href: "https://www.lindafarrow.com/us/women/sunglasses", needs_validation: true },
      { category: "Necklace", brand: "Roxanne Assoulin", item: "Candy Bead Necklace", price: "$195", href: "https://roxanneassoulin.com/collections/necklaces", needs_validation: true },
      { category: "Earrings", brand: "Roxanne Assoulin", item: "Bonbon Drop Earrings", price: "$165", href: "https://roxanneassoulin.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Roxanne Assoulin", item: "Rainbow Stacked Bangles", price: "$225", href: "https://roxanneassoulin.com/collections/bracelets", needs_validation: true },
      { category: "Ring", brand: "Roxanne Assoulin", item: "Enamel Stacking Rings", price: "$145", href: "https://roxanneassoulin.com/collections/rings", needs_validation: true },
    ],
  },
  {
    id: "look-7",
    number: 7,
    title: "Tropical Escape Swim",
    subtitle: "Zimmermann palm-print bikini, Loewe basket, Manebi espadrilles.",
    chapter: "Tropical Escape",
    story:
      "A jungle-print Zimmermann bikini and matching kaftan against the green hillside. Loewe woven basket, Manebi tan espadrilles, Alighieri medallions, Jennifer Behr crystal florals tucked into the hair. Tropical, layered, all swim.",
    refPos: "25% 100%",
    museImage: look7Muse,
    products: [
      { category: "Swim", brand: "Zimmermann", item: "Alight Palm-Print Bikini", price: "$425", href: MT("zimmermann alight bikini"), needs_validation: true },
      { category: "Cover-up", brand: "Zimmermann", item: "Matching Tropical Kaftan", price: "$695", href: MT("zimmermann kaftan"), needs_validation: true },
      { category: "Bag", brand: "Loewe", item: "Small Anagram Basket Bag", price: "$750", href: NAP("loewe small basket"), needs_validation: true },
      { category: "Shoes", brand: "Manebi", item: "Tan Hamptons Espadrilles", price: "$215", href: "https://manebi.com/collections/espadrilles", needs_validation: true },
      { category: "Necklace", brand: "Alighieri", item: "Il Leone Medallion", price: "$295", href: NAP("alighieri medallion"), needs_validation: true },
      { category: "Earrings", brand: "Alighieri", item: "Token of Love Hoops", price: "$245", href: NAP("alighieri hoops"), needs_validation: true },
      { category: "Bracelet", brand: "Alighieri", item: "Lost Dreamer Cuff", price: "$295", href: NAP("alighieri cuff"), needs_validation: true },
      { category: "Hair", brand: "Jennifer Behr", item: "Crystal Floral Hair Pin", price: "$295", href: "https://www.jenniferbehr.com/collections/hair-accessories", needs_validation: true },
      { category: "Sunglasses", brand: "Zimmermann", item: "Tortoise Sunglasses", price: "$245", href: MT("zimmermann sunglasses"), needs_validation: true },
    ],
  },
  {
    id: "look-8",
    number: 8,
    title: "Italian Coast Swim",
    subtitle: "Melissa Odabash navy stripe, Khaite linen, Saint Laurent slides.",
    chapter: "Italian Coast",
    story:
      "Late afternoon on the rocks — Melissa Odabash navy-stripe maillot under a Khaite oversized linen shirt, Toteme woven tote, Saint Laurent leather slides, Jennifer Meyer fine gold. Riviera coastal codes, swim-anchored.",
    refPos: "50% 100%",
    museImage: look8Muse,
    products: [
      { category: "Swim", brand: "Melissa Odabash", item: "Baku Navy Stripe Maillot", price: "$320", href: MT("melissa odabash baku swimsuit"), needs_validation: true },
      { category: "Layer", brand: "Khaite", item: "Mahmet Oversized Linen Shirt", price: "$760", href: NAP("khaite linen shirt"), needs_validation: true },
      { category: "Bag", brand: "Toteme", item: "Woven Leather Tote", price: "$890", href: NAP("toteme woven tote"), needs_validation: true },
      { category: "Shoes", brand: "Saint Laurent", item: "Tribute Leather Slides", price: "$795", href: NAP("saint laurent tribute slides"), needs_validation: true },
      { category: "Sunglasses", brand: "Saint Laurent", item: "SL 276 Mica Sunglasses", price: "$435", href: NAP("saint laurent sl 276"), needs_validation: true },
      { category: "Necklace", brand: "Jennifer Meyer", item: "Mini Pendant Necklace", price: "$525", href: "https://www.jennifermeyer.com/collections/necklaces", needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Small Gold Hoops", price: "$475", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Jennifer Meyer", item: "Fine Gold Bracelet", price: "$1,175", href: "https://www.jennifermeyer.com/collections/bracelets", needs_validation: true },
      { category: "Hat", brand: "Toteme", item: "Wide Brim Straw Hat", price: "$340", href: NAP("toteme straw hat"), needs_validation: true },
    ],
  },
  {
    id: "look-9",
    number: 9,
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
    id: "look-10",
    number: 10,
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
