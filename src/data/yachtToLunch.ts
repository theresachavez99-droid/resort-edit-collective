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
import look3Muse from "@/assets/looks/look-3-muse.jpg";
import look4Muse from "@/assets/looks/look-4-muse.jpg";
import look5Muse from "@/assets/looks/look-5-muse.jpg";
import look6Muse from "@/assets/looks/look-6-muse.jpg";
import look7Muse from "@/assets/looks/look-7-muse.jpg";
import look8Muse from "@/assets/looks/look-8-muse.jpg";
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
      { category: "Swim", brand: "Dolce & Gabbana", item: "Majolica-Print Triangle Bikini", price: "$695", href: MT("dolce gabbana majolica bikini"), needs_validation: true },
      { category: "Cover-up", brand: "Dolce & Gabbana", item: "Majolica-Print Silk Pareo", price: "$650", href: MT("dolce gabbana majolica pareo"), needs_validation: true },
      { category: "Bag", brand: "Loewe", item: "Raffia Basket Bag", price: "$890", href: NAP("loewe raffia basket"), needs_validation: true },
      { category: "Shoes", brand: "Biankina", item: "Rope Espadrille Sandals", price: "$245", href: "https://www.biankina.com/collections/sandals", needs_validation: true },
      { category: "Hat", brand: "Janessa Leoné", item: "Woven Straw Sun Hat", price: "$245", href: "https://www.janessaleone.com/collections/hats", needs_validation: true },
      { category: "Sunglasses", brand: "Krewe", item: "St. Louis Sunglasses", price: "$295", href: "https://krewe.com/collections/sunglasses", needs_validation: true },
      { category: "Necklace", brand: "Jennifer Meyer", item: "Initial Pendant Necklace", price: "$650", href: "https://www.jennifermeyer.com/collections/necklaces", needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Mini Gold Hoops", price: "$425", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
    ],
  },
  {
    id: "look-2",
    number: 2,
    title: "Feminine Yacht Swim",
    subtitle: "Navy maillot, sheer linen, layered shells.",
    chapter: "Open Water",
    story:
      "Anchored over a hidden cove. A belted navy maillot under crisp white linen, a sarong loose at the hips, pearl and shell strands resting at the collarbone. Quiet, considered yacht lounging.",
    refPos: "25% 0%",
    museImage: look2Muse,
    products: [
      { category: "Swim", brand: "Alexandra Miro", item: "Whitney Belted Swimsuit (Navy)", price: "$390", href: MT("alexandra miro whitney swimsuit"), needs_validation: true },
      { category: "Layer", brand: "Matteau", item: "Oversized Linen Shirt (White)", price: "$340", href: NAP("matteau linen shirt"), needs_validation: true },
      { category: "Cover-up", brand: "Posse", item: "White Cotton Sarong", price: "$165", href: REV("posse sarong"), needs_validation: true },
      { category: "Bag", brand: "Hereu", item: "Calella Woven Tote", price: "$525", href: NAP("hereu calella tote"), needs_validation: true },
      { category: "Shoes", brand: "ATP Atelier", item: "Rosa Leather Sandals", price: "$295", href: "https://atpatelier.com/collections/sandals", needs_validation: true },
      { category: "Sunglasses", brand: "Chimi", item: "Round Tortoise Sunglasses", price: "$135", href: "https://chimi.com/collections/sunglasses", needs_validation: true },
      { category: "Necklace", brand: "Sophie Buhai", item: "Pearl & Shell Necklace", price: "$485", href: NAP("sophie buhai pearl necklace"), needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Pearl Drop Earrings", price: "$525", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
    ],
  },
  {
    id: "look-3",
    number: 3,
    title: "Marina Espresso Stop",
    subtitle: "Ivory ERES under linen, fisherman sandals, raffia crossbody.",
    chapter: "Transfer",
    story:
      "A walk along the cobbled marina for an espresso, swimsuit hidden under tailored linen. The transfer look — easy to step out of the tender, easy to slip back in.",
    refPos: "50% 0%",
    museImage: look3Muse,
    products: [
      { category: "Swim", brand: "ERES", item: "Aquarelle Sculptural One-Piece", price: "$590", href: NAP("eres aquarelle swimsuit"), needs_validation: true },
      { category: "Layer", brand: "Faithfull the Brand", item: "Oversized White Linen Shirt", price: "$219", href: REV("faithfull linen shirt"), needs_validation: true },
      { category: "Shorts", brand: "Matteau", item: "Relaxed Linen Shorts", price: "$295", href: NAP("matteau linen shorts"), needs_validation: true },
      { category: "Bag", brand: "Hereu", item: "Tirita Raffia Crossbody", price: "$385", href: NAP("hereu tirita crossbody"), needs_validation: true },
      { category: "Shoes", brand: "Ancient Greek Sandals", item: "Aristea Fisherman Sandals", price: "$235", href: NAP("ancient greek fisherman sandals"), needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Gold Mini Hoops", price: "$425", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Missoma", item: "Gold Chain Necklace", price: "$175", href: "https://www.missoma.com/collections/necklaces", needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
      { category: "Sunglasses", brand: "Celine", item: "Triomphe Sunglasses", price: "$490", href: "https://www.celine.com/en-us/celine-shop-women/accessories/sunglasses/", needs_validation: true },
    ],
  },
  {
    id: "look-4",
    number: 4,
    title: "Beach Club Swim",
    subtitle: "Tropical print bikini, sculptural gold, cat-eye sunglasses.",
    chapter: "Beach Club",
    story:
      "Mid-day at the beach club. A Johanna Ortiz tropical-print bikini with matching pareo, chunky gold links at the throat, black cat-eyes. Social, confident, unapologetically vacation.",
    refPos: "75% 0%",
    museImage: look4Muse,
    products: [
      { category: "Swim", brand: "Johanna Ortiz", item: "Tropical-Print Triangle Bikini", price: "$425", href: MT("johanna ortiz bikini"), needs_validation: true },
      { category: "Cover-up", brand: "Johanna Ortiz", item: "Matching Printed Pareo", price: "$485", href: MT("johanna ortiz pareo"), needs_validation: true },
      { category: "Bag", brand: "Cult Gaia", item: "Eos Sculptural Clutch", price: "$398", href: REV("cult gaia eos clutch"), needs_validation: true },
      { category: "Shoes", brand: "Gianvito Rossi", item: "Portofino Flat Sandals", price: "$795", href: NAP("gianvito rossi portofino"), needs_validation: true },
      { category: "Sunglasses", brand: "Celine", item: "Cat-Eye Sunglasses", price: "$490", href: "https://www.celine.com/en-us/celine-shop-women/accessories/sunglasses/", needs_validation: true },
      { category: "Necklace", brand: "Bottega Veneta", item: "Chunky Gold Chain", price: "$1,850", href: NAP("bottega veneta gold chain necklace"), needs_validation: true },
      { category: "Cuff", brand: "Tiffany & Co.", item: "T1 Wide Gold Cuff", price: "$8,500", href: "https://www.tiffany.com/jewelry/bracelets/", needs_validation: true },
      { category: "Earrings", brand: "Jennifer Fisher", item: "Lilly Gold Hoops", price: "$525", href: "https://jenniferfisherjewelry.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
    ],
  },
  {
    id: "look-5",
    number: 5,
    title: "Collectible Print Swim",
    subtitle: "Agua by Agua Bendita print ecosystem, shells, rope espadrilles.",
    chapter: "Hidden Cove",
    story:
      "Anchored in a hidden cove. A collectible Agua by Agua Bendita print bikini and matching sarong, layered shell strands, a straw hat against the cliffs. The fashion-collector yacht moment.",
    refPos: "100% 0%",
    museImage: look5Muse,
    products: [
      { category: "Swim", brand: "Agua by Agua Bendita", item: "Botanical Print Bikini", price: "$320", href: NAP("agua bendita bikini"), needs_validation: true },
      { category: "Cover-up", brand: "Agua by Agua Bendita", item: "Matching Printed Sarong", price: "$295", href: NAP("agua bendita sarong"), needs_validation: true },
      { category: "Hat", brand: "Lack of Color", item: "Palma Straw Boater", price: "$129", href: "https://www.lackofcolor.com/collections/sun-hats", needs_validation: true },
      { category: "Bag", brand: "Hereu", item: "Trena Woven Tote", price: "$485", href: NAP("hereu woven tote"), needs_validation: true },
      { category: "Shoes", brand: "Castañer", item: "Carina Rope Espadrilles", price: "$165", href: "https://www.castaner.com/us/en/shop/espadrilles/woman", needs_validation: true },
      { category: "Necklace", brand: "Éliou", item: "Layered Shell Necklace", price: "$285", href: NAP("eliou shell necklace"), needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Mini Gold Hoops", price: "$425", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
      { category: "Sunglasses", brand: "Krewe", item: "St. Louis Sunglasses", price: "$295", href: "https://krewe.com/collections/sunglasses", needs_validation: true },
    ],
  },
  {
    id: "look-6",
    number: 6,
    title: "Minimal Luxury Swim",
    subtitle: "ERES sand maillot, soft linen, leather slides.",
    chapter: "Quiet Luxury",
    story:
      "Mid-afternoon, the boat at rest. A sand-toned ERES maillot under a draped white linen shirt, a single gold chain, oval tortoise sunglasses. The quiet-luxury owner's look.",
    refPos: "0% 100%",
    museImage: look6Muse,
    products: [
      { category: "Swim", brand: "ERES", item: "Les Essentiels Sand Maillot", price: "$520", href: NAP("eres les essentiels swimsuit"), needs_validation: true },
      { category: "Layer", brand: "Loro Piana", item: "Cotton-Linen Shirt", price: "$1,275", href: NAP("loro piana linen shirt"), needs_validation: true },
      { category: "Bag", brand: "The Row", item: "Margaux Linen Tote", price: "$1,790", href: NAP("the row margaux tote"), needs_validation: true },
      { category: "Shoes", brand: "Hermès", item: "Oran Leather Slides", price: "$760", href: "https://www.hermes.com/us/en/category/women/shoes/sandals/", needs_validation: true },
      { category: "Sunglasses", brand: "The Row", item: "Oval Tortoise Sunglasses", price: "$590", href: NAP("the row sunglasses"), needs_validation: true },
      { category: "Necklace", brand: "Sophie Buhai", item: "Single Gold Chain", price: "$485", href: NAP("sophie buhai chain necklace"), needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Tiny Gold Studs", price: "$295", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
      { category: "Ring", brand: "Spinelli Kilcollin", item: "Sirius Linked Ring", price: "$1,150", href: NAP("spinelli kilcollin ring"), needs_validation: true },
    ],
  },
  {
    id: "look-7",
    number: 7,
    title: "Yacht-to-Lunch Onshore",
    subtitle: "Posse cream linen set, espadrilles, raffia tote.",
    chapter: "Lunch Onshore",
    story:
      "Tender to shore for a long lunch at the trattoria. A Posse cream-linen matching set, tan espadrilles, structured raffia. Easy elegance for lemon trees and white tablecloths.",
    refPos: "25% 100%",
    museImage: look7Muse,
    products: [
      { category: "Top", brand: "Posse", item: "Sabine Cream Linen Top", price: "$220", href: REV("posse sabine top"), needs_validation: true },
      { category: "Shorts", brand: "Posse", item: "Charlie Cream Linen Shorts", price: "$220", href: REV("posse charlie shorts"), needs_validation: true },
      { category: "Bag", brand: "Hereu", item: "Calella Raffia Tote", price: "$525", href: NAP("hereu calella tote"), needs_validation: true },
      { category: "Shoes", brand: "Castañer", item: "Carina Tan Espadrilles", price: "$165", href: "https://www.castaner.com/us/en/shop/espadrilles/woman", needs_validation: true },
      { category: "Sunglasses", brand: "Linda Farrow", item: "Lola Sunglasses", price: "$465", href: "https://www.lindafarrow.com/us/women/sunglasses", needs_validation: true },
      { category: "Necklace", brand: "Foundrae", item: "Gold Link Necklace", price: "$3,800", href: NAP("foundrae necklace"), needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Mini Gold Hoops", price: "$425", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
      { category: "Ring", brand: "Jennifer Meyer", item: "Stacking Gold Ring", price: "$650", href: "https://www.jennifermeyer.com/collections/rings", needs_validation: true },
    ],
  },
  {
    id: "look-8",
    number: 8,
    title: "Harbor Shopping",
    subtitle: "Zimmermann floral dress, flat sandals, woven bag.",
    chapter: "Harbour Stroll",
    story:
      "An afternoon walking the boutiques on the piazzetta. A feminine Zimmermann floral dress, flat tan sandals, layered gold and cat-eyes. Walkable, photogenic, easy.",
    refPos: "50% 100%",
    museImage: look8Muse,
    products: [
      { category: "Dress", brand: "Zimmermann", item: "Halliday Floral Midi Dress", price: "$895", href: MT("zimmermann halliday dress"), needs_validation: true },
      { category: "Shoes", brand: "Ancient Greek Sandals", item: "Eleftheria Flat Sandals", price: "$210", href: NAP("ancient greek eleftheria"), needs_validation: true },
      { category: "Bag", brand: "Hereu", item: "Woven Mini Tote", price: "$385", href: NAP("hereu mini tote"), needs_validation: true },
      { category: "Sunglasses", brand: "Celine", item: "Cat-Eye Sunglasses", price: "$490", href: "https://www.celine.com/en-us/celine-shop-women/accessories/sunglasses/", needs_validation: true },
      { category: "Necklace", brand: "Missoma", item: "Layered Gold Chains", price: "$295", href: "https://www.missoma.com/collections/necklaces", needs_validation: true },
      { category: "Earrings", brand: "Jennifer Meyer", item: "Mini Gold Hoops", price: "$425", href: "https://www.jennifermeyer.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
      { category: "Ring", brand: "Jennifer Meyer", item: "Gold Signet Ring", price: "$1,250", href: "https://www.jennifermeyer.com/collections/rings", needs_validation: true },
    ],
  },
  {
    id: "look-9",
    number: 9,
    title: "Golden Hour Aperitivo",
    subtitle: "Peach Johanna Ortiz silhouette, statement earrings, woven clutch.",
    chapter: "Aperitivo",
    story:
      "The piazzetta at golden hour. A soft peach Johanna Ortiz silhouette with draped sleeves, oversized gold drop earrings, a woven clutch. An Aperol spritz, the boats lit gold.",
    refPos: "75% 100%",
    museImage: look9Muse,
    products: [
      { category: "Dress", brand: "Johanna Ortiz", item: "Peach Draped Midi Dress", price: "$1,250", href: MT("johanna ortiz dress"), needs_validation: true },
      { category: "Shoes", brand: "Aquazzura", item: "Tequila Heeled Sandals", price: "$795", href: NAP("aquazzura tequila sandals"), needs_validation: true },
      { category: "Bag", brand: "Bottega Veneta", item: "Woven Mini Clutch", price: "$2,150", href: NAP("bottega veneta woven clutch"), needs_validation: true },
      { category: "Earrings", brand: "Jennifer Behr", item: "Gold Statement Drop Earrings", price: "$295", href: "https://www.jenniferbehr.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Foundrae", item: "Gold Pendant Necklace", price: "$3,200", href: NAP("foundrae pendant necklace"), needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet Stack", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
      { category: "Ring", brand: "Spinelli Kilcollin", item: "Sirius Linked Ring", price: "$1,150", href: NAP("spinelli kilcollin ring"), needs_validation: true },
      { category: "Sunglasses", brand: "Celine", item: "Triomphe Sunglasses", price: "$490", href: "https://www.celine.com/en-us/celine-shop-women/accessories/sunglasses/", needs_validation: true },
    ],
  },
  {
    id: "look-10",
    number: 10,
    title: "Sunset Dinner Transition",
    subtitle: "Retrofête sequin mini, Aquazzura sandals, evening jewels.",
    chapter: "Sunset",
    story:
      "From aperitivo into dinner on the terrace. A Retrofête sequined mini catching candlelight, strappy gold Aquazzura sandals, an elevated jewelry stack. The highest-glamour payoff of the day.",
    refPos: "100% 100%",
    museImage: look10Muse,
    products: [
      { category: "Dress", brand: "Retrofête", item: "Sequin Mini Dress (Champagne)", price: "$650", href: REV("retrofete sequin dress"), needs_validation: true },
      { category: "Shoes", brand: "Aquazzura", item: "Strappy Gold Heeled Sandals", price: "$795", href: NAP("aquazzura gold sandals"), needs_validation: true },
      { category: "Bag", brand: "Bottega Veneta", item: "Knot Evening Clutch", price: "$2,950", href: NAP("bottega veneta knot clutch"), needs_validation: true },
      { category: "Earrings", brand: "Jennifer Behr", item: "Gold Statement Earrings", price: "$345", href: "https://www.jenniferbehr.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Foundrae", item: "Layered Gold Pendant", price: "$3,800", href: NAP("foundrae necklace"), needs_validation: true },
      { category: "Bracelet", brand: "Cartier", item: "Love Bracelet Stack", price: "$7,350", href: "https://www.cartier.com/en-us/jewelry/bracelets/love-bracelets/", needs_validation: true },
      { category: "Ring", brand: "Spinelli Kilcollin", item: "Sirius Linked Ring", price: "$1,150", href: NAP("spinelli kilcollin ring"), needs_validation: true },
      { category: "Sunglasses", brand: "Celine", item: "Triomphe Sunglasses", price: "$490", href: "https://www.celine.com/en-us/celine-shop-women/accessories/sunglasses/", needs_validation: true },
    ],
  },
];
