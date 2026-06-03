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
  needs_validation?: boolean;
};

export type YachtLook = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  /** object-position for the cropped reference thumb (2-row × 5-col grid). */
  refPos: string;
  products: YachtProduct[];
};

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
    subtitle: "Blue-and-white deck dressing, raffia, and a printed swimsuit.",
    refPos: "0% 0%",
    products: [
      { category: "Swim", brand: "Alexandra Miro", item: "Whitney Belted Printed Swimsuit", price: "$390", href: MT("alexandra miro whitney swimsuit"), needs_validation: true },
      { category: "Cover-up", brand: "Alexandra Miro", item: "White Bay Pareo Skirt", price: "$295", href: MT("alexandra miro bay pareo"), needs_validation: true },
      { category: "Bag", brand: "Prada", item: "Raffia Tote", price: "$1,950", href: FF("prada raffia tote"), needs_validation: true },
      { category: "Shoes", brand: "Ancient Greek Sandals", item: "Classic Leather Sandals", price: "$210", href: NAP("ancient greek sandals"), needs_validation: true },
      { category: "Sunglasses", brand: "Krewe", item: "Webster Sunglasses", price: "$295", href: "https://krewe.com/collections/sunglasses", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Lilu Hoop Earrings", price: "$85", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
      { category: "Cuff", brand: "Jenny Bird", item: "Gold Cuff", price: "$148", href: "https://us.jenny-bird.com/collections/bracelets", needs_validation: true },
      { category: "Necklace", brand: "Éra", item: "Gold Chain Necklace", price: "$220", href: FF("era jewelry necklace"), needs_validation: true },
    ],
  },
  {
    id: "look-2",
    number: 2,
    title: "Coastal Cruise",
    subtitle: "Cala Di Volpe print bikini and matching kaftan, raffia tote.",
    refPos: "25% 0%",
    products: [
      { category: "Swim", brand: "Melissa Odabash", item: "Cala Di Volpe Bikini", price: "$285", href: "https://www.odabash.com/collections/bikinis", needs_validation: true },
      { category: "Cover-up", brand: "Melissa Odabash", item: "Cala Di Volpe Kaftan", price: "$395", href: "https://www.odabash.com/collections/kaftans", needs_validation: true },
      { category: "Bag", brand: "Aranáz", item: "Woven Tote", price: "$320", href: FF("aranaz tote"), needs_validation: true },
      { category: "Shoes", brand: "ATP Atelier", item: "Leather Sandals", price: "$295", href: "https://atpatelier.com/collections/sandals", needs_validation: true },
      { category: "Sunglasses", brand: "Ray-Ban", item: "Aviator Classic", price: "$200", href: "https://www.ray-ban.com/usa/sunglasses/aviator", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Drop Earrings", price: "$95", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Jenny Bird", item: "Gold Necklace", price: "$98", href: "https://us.jenny-bird.com/collections/necklaces", needs_validation: true },
      { category: "Charm", brand: "Maria Tash", item: "Diamond Charm", price: "$650", href: "https://www.mariatash.com/collections/charms", needs_validation: true },
    ],
  },
  {
    id: "look-3",
    number: 3,
    title: "Yacht to Lunch",
    subtitle: "Striped poplin shirt, crochet shorts, triangle top.",
    refPos: "50% 0%",
    products: [
      { category: "Swim", brand: "Vitamin A", item: "Neo Triangle Top", price: "$130", href: "https://vitaminaswim.com/collections/bikini-tops", needs_validation: true },
      { category: "Shirt", brand: "Faithfull the Brand", item: "Cornelia Stripe Shirt", price: "$189", href: REV("faithfull cornelia shirt"), needs_validation: true },
      { category: "Shorts", brand: "Zimmermann", item: "Crochet Shorts", price: "$595", href: FF("zimmermann crochet shorts"), needs_validation: true },
      { category: "Bag", brand: "Aranáz", item: "Woven Tote", price: "$320", href: FF("aranaz tote"), needs_validation: true },
      { category: "Shoes", brand: "Castañer", item: "Carina Espadrilles", price: "$165", href: "https://www.castaner.com/us/en/shop/espadrilles/woman", needs_validation: true },
      { category: "Sunglasses", brand: "Le Specs", item: "Air Heart Sunglasses", price: "$69", href: "https://lespecs.com/collections/sunglasses", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Drop Earrings", price: "$95", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Missoma", item: "Gold Chain Necklace", price: "$175", href: "https://www.missoma.com/collections/necklaces", needs_validation: true },
    ],
  },
  {
    id: "look-4",
    number: 4,
    title: "Yacht Glamour",
    subtitle: "Emerald maillot, ivory wrap skirt, raffia tote.",
    refPos: "75% 0%",
    products: [
      { category: "Swim", brand: "Zimmermann", item: "Emerald One-Piece", price: "$425", href: FF("zimmermann one piece swimsuit"), needs_validation: true },
      { category: "Cover-up", brand: "Heidi Klein", item: "Ivory Wrap Skirt", price: "$295", href: "https://www.heidiklein.com/collections/cover-ups", needs_validation: true },
      { category: "Bag", brand: "Hunting Season", item: "Raffia Tote", price: "$795", href: FF("hunting season raffia"), needs_validation: true },
      { category: "Shoes", brand: "Gianvito Rossi", item: "Portofino Wedge", price: "$895", href: NAP("gianvito rossi portofino"), needs_validation: true },
      { category: "Sunglasses", brand: "Velvet Canyon", item: "Tortoise Sunglasses", price: "$165", href: "https://velvetcanyon.com/collections/all", needs_validation: true },
      { category: "Necklace", brand: "Éra", item: "Gold Chain Necklace", price: "$220", href: FF("era jewelry necklace"), needs_validation: true },
      { category: "Cuff", brand: "Jenny Bird", item: "Gold Cuff", price: "$148", href: "https://us.jenny-bird.com/collections/bracelets", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Lilu Hoop Earrings", price: "$85", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
    ],
  },
  {
    id: "look-5",
    number: 5,
    title: "Sunset Aperitivo",
    subtitle: "Ivory maillot, sheer skirt, leather belt, raffia bag.",
    refPos: "100% 0%",
    products: [
      { category: "Swim", brand: "Zimmermann", item: "Ivory Swimsuit", price: "$395", href: FF("zimmermann swimsuit ivory"), needs_validation: true },
      { category: "Cover-up", brand: "Zimmermann", item: "Sheer Skirt", price: "$695", href: FF("zimmermann sheer skirt"), needs_validation: true },
      { category: "Belt", brand: "Saint Laurent", item: "Leather Belt", price: "$595", href: SAKS("saint laurent belt"), needs_validation: true },
      { category: "Bag", brand: "Cult Gaia", item: "Raffia Bag", price: "$398", href: REV("cult gaia raffia"), needs_validation: true },
      { category: "Shoes", brand: "Emme Parsons", item: "Leather Sandals", price: "$425", href: NAP("emme parsons sandals"), needs_validation: true },
      { category: "Sunglasses", brand: "Linda Farrow", item: "Tortoise Sunglasses", price: "$385", href: "https://www.lindafarrow.com/us/women/sunglasses", needs_validation: true },
      { category: "Earrings", brand: "Lizzie Fortunato", item: "Drop Earrings", price: "$185", href: "https://lizziefortunato.com/collections/earrings", needs_validation: true },
      { category: "Bracelet", brand: "Jenny Bird", item: "Gold Bracelet", price: "$118", href: "https://us.jenny-bird.com/collections/bracelets", needs_validation: true },
      { category: "Necklace", brand: "Missoma", item: "Gold Necklace", price: "$175", href: "https://www.missoma.com/collections/necklaces", needs_validation: true },
    ],
  },
  {
    id: "look-6",
    number: 6,
    title: "Mediterranean Print Moment",
    subtitle: "Maygel Coronel bikini, paisley sarong, woven tote.",
    refPos: "0% 100%",
    products: [
      { category: "Swim", brand: "Maygel Coronel", item: "Coronel Bikini", price: "$365", href: "https://maygelcoronel.com/collections/swimwear", needs_validation: true },
      { category: "Cover-up", brand: "Melissa Odabash", item: "Printed Sarong", price: "$245", href: "https://www.odabash.com/collections/sarongs", needs_validation: true },
      { category: "Bag", brand: "Cult Gaia", item: "Rhythm Tote", price: "$498", href: REV("cult gaia rhythm tote"), needs_validation: true },
      { category: "Shoes", brand: "Ancient Greek Sandals", item: "Classic Leather Sandals", price: "$210", href: NAP("ancient greek sandals"), needs_validation: true },
      { category: "Sunglasses", brand: "Quay Australia", item: "Cat-Eye Sunglasses", price: "$65", href: "https://www.quayaustralia.com/collections/cat-eye-sunglasses", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Drop Earrings", price: "$95", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Éra", item: "Gold Chain Necklace", price: "$220", href: FF("era jewelry necklace"), needs_validation: true },
      { category: "Cuff", brand: "Jenny Bird", item: "Gold Cuff", price: "$148", href: "https://us.jenny-bird.com/collections/bracelets", needs_validation: true },
    ],
  },
  {
    id: "look-7",
    number: 7,
    title: "Statement Swim",
    subtitle: "Cobalt bikini with matching pareo and woven shell bag.",
    refPos: "25% 100%",
    products: [
      { category: "Swim", brand: "Melissa Odabash", item: "Cobalt Swimsuit", price: "$285", href: "https://www.odabash.com/collections/bikinis", needs_validation: true },
      { category: "Cover-up", brand: "Melissa Odabash", item: "Cobalt Pareo", price: "$195", href: "https://www.odabash.com/collections/sarongs", needs_validation: true },
      { category: "Bag", brand: "Shashi", item: "Shell Bag", price: "$148", href: "https://www.shashijewels.com/collections/accessories", needs_validation: true },
      { category: "Shoes", brand: "K. Jacques", item: "Leather Sandals", price: "$345", href: NAP("k jacques sandals"), needs_validation: true },
      { category: "Sunglasses", brand: "Krewe", item: "Webster Sunglasses", price: "$295", href: "https://krewe.com/collections/sunglasses", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Drop Earrings", price: "$95", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Jenny Bird", item: "Gold Necklace", price: "$98", href: "https://us.jenny-bird.com/collections/necklaces", needs_validation: true },
      { category: "Charm", brand: "Maria Tash", item: "Diamond Charm", price: "$650", href: "https://www.mariatash.com/collections/charms", needs_validation: true },
    ],
  },
  {
    id: "look-8",
    number: 8,
    title: "Yacht to Harbor Lunch",
    subtitle: "Bandeau bikini, MC2 Saint Barth printed pants, micro bag.",
    refPos: "50% 100%",
    products: [
      { category: "Swim", brand: "Melonga", item: "Bandeau Bikini", price: "$245", href: FF("melonga bikini"), needs_validation: true },
      { category: "Pants", brand: "MC2 Saint Barth", item: "Printed Trousers", price: "$285", href: "https://www.mc2saintbarth.com/us_en/woman/clothing/trousers", needs_validation: true },
      { category: "Bag", brand: "Cult Gaia", item: "Tyla Mini Bag", price: "$348", href: REV("cult gaia tyla"), needs_validation: true },
      { category: "Shoes", brand: "Ancient Greek Sandals", item: "Leather Sandals", price: "$210", href: NAP("ancient greek sandals"), needs_validation: true },
      { category: "Sunglasses", brand: "Raen", item: "Tortoise Sunglasses", price: "$185", href: "https://raen.com/collections/womens-sunglasses", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Drop Earrings", price: "$95", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Missoma", item: "Gold Necklace", price: "$175", href: "https://www.missoma.com/collections/necklaces", needs_validation: true },
      { category: "Cuff", brand: "Jenny Bird", item: "Gold Cuff", price: "$148", href: "https://us.jenny-bird.com/collections/bracelets", needs_validation: true },
    ],
  },
  {
    id: "look-9",
    number: 9,
    title: "Italian Lunch Date",
    subtitle: "Coral bandeau, peach Simkhai skirt, Aquazzura sandals.",
    refPos: "75% 100%",
    products: [
      { category: "Swim", brand: "Heidi Klein", item: "Tramonti Ring Bandeau", price: "$295", href: "https://www.heidiklein.com/collections/swimwear", needs_validation: true },
      { category: "Skirt", brand: "Simkhai", item: "Peach Midi Skirt", price: "$495", href: FF("simkhai skirt"), needs_validation: true },
      { category: "Cuff", brand: "Ben-Amun", item: "Gold Cuff", price: "$165", href: "https://www.ben-amun.com/collections/bracelets", needs_validation: true },
      { category: "Shoes", brand: "Aquazzura", item: "Tequila Sandals", price: "$795", href: NAP("aquazzura tequila sandals"), needs_validation: true },
      { category: "Sunglasses", brand: "Le Specs", item: "Air Heart Sunglasses", price: "$69", href: "https://lespecs.com/collections/sunglasses", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Drop Earrings", price: "$95", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Missoma", item: "Gold Necklace", price: "$175", href: "https://www.missoma.com/collections/necklaces", needs_validation: true },
      { category: "Bracelet", brand: "Jenny Bird", item: "Gold Bracelet", price: "$118", href: "https://us.jenny-bird.com/collections/bracelets", needs_validation: true },
    ],
  },
  {
    id: "look-10",
    number: 10,
    title: "Dockside Lunch",
    subtitle: "Coral bandeau, Heidi Klein wrap, Heidi Klein tie top.",
    refPos: "100% 100%",
    products: [
      { category: "Swim", brand: "Heidi Klein", item: "Tramonti Ring Bandeau", price: "$295", href: "https://www.heidiklein.com/collections/swimwear", needs_validation: true },
      { category: "Cover-up", brand: "Heidi Klein", item: "White Bay Wrap Skirt", price: "$295", href: "https://www.heidiklein.com/collections/cover-ups", needs_validation: true },
      { category: "Top", brand: "Heidi Klein", item: "Tie Top", price: "$185", href: "https://www.heidiklein.com/collections/tops", needs_validation: true },
      { category: "Shoes", brand: "Ancient Greek Sandals", item: "Leather Sandals", price: "$210", href: NAP("ancient greek sandals"), needs_validation: true },
      { category: "Sunglasses", brand: "Randolph", item: "Aviator Sunglasses", price: "$289", href: "https://www.randolphusa.com/collections/sunglasses", needs_validation: true },
      { category: "Earrings", brand: "Shashi", item: "Drop Earrings", price: "$95", href: "https://www.shashijewels.com/collections/earrings", needs_validation: true },
      { category: "Necklace", brand: "Jenny Bird", item: "Gold Necklace", price: "$98", href: "https://us.jenny-bird.com/collections/necklaces", needs_validation: true },
    ],
  },
];
