import { portofinoLooks, type ShopItem } from "./portofino";
import { getCanonicalDayImage } from "@/data/dayImageRegistry";
import cira2Asset from "@/assets/uploads/cira/cira-2.png.asset.json";
import cira3Asset from "@/assets/uploads/cira/cira-3.png.asset.json";
import cira4Asset from "@/assets/uploads/cira/cira-4.png.asset.json";
import cira5Asset from "@/assets/uploads/cira/cira-5.png.asset.json";
import cira6Asset from "@/assets/uploads/cira/cira-6.png.asset.json";
import cira7Asset from "@/assets/uploads/cira/cira-7.png.asset.json";
import cira8Asset from "@/assets/uploads/cira/cira-8.png.asset.json";
import cira9Asset from "@/assets/uploads/cira/cira-9.png.asset.json";
import cira12Asset from "@/assets/uploads/cira/cira-12.png.asset.json";
import cira13Asset from "@/assets/uploads/cira/cira-13.png.asset.json";
import cira14Asset from "@/assets/uploads/cira/cira-14.png.asset.json";
import cira15Asset from "@/assets/uploads/cira/cira-15.png.asset.json";
import dinnerWithARustHalterAsset from "@/assets/uploads/portofino/dinner-with-a-view-lilla-rust-halter.png.asset.json";
import sunsetCocktailsPinkAsset from "@/assets/uploads/portofino/sunset-views-lilla-pink-dress.png.asset.json";
const d1a = getCanonicalDayImage("day-1", "hero");
const d1b = cira2Asset.url;
const d1c = cira3Asset.url;
const d2a = getCanonicalDayImage("day-2", "hero");
const d2b = cira5Asset.url;
const d2c = cira6Asset.url;
const d3a = cira7Asset.url;
const d3b = cira8Asset.url;
const d3c = cira9Asset.url;
const d4a = sunsetCocktailsPinkAsset.url;
const d4b = dinnerWithARustHalterAsset.url;
const d4c = cira12Asset.url;
const d5a = cira13Asset.url;
const d5b = cira14Asset.url;
const d5c = cira15Asset.url;

export type Tier = "designer" | "mid" | "riviera";
export type LookKey = "print" | "neutral" | "texture";

export type TierMeta = {
  id: Tier;
  label: string;
  tagline: string;
  range: string;
};

export type LookMeta = {
  id: LookKey;
  shortLabel: string; // e.g., "Look A"
  category: string;   // e.g., "Print Forward"
};

export const tiers: TierMeta[] = [
  { id: "designer", label: "Luxury", tagline: "Designer labels and investment pieces.", range: "$300+" },
  { id: "mid", label: "Mid-Luxe", tagline: "Premium contemporary, fashion-forward.", range: "$100–400" },
  { id: "riviera", label: "Destination Finds", tagline: "Riviera discoveries — boutique labels and harbor-town gems.", range: "Under $150" },
];

export const lookMetas: LookMeta[] = [
  { id: "print", shortLabel: "Look A", category: "Print Forward" },
  { id: "neutral", shortLabel: "Look B", category: "Quiet Luxury & Fabric Focused" },
  { id: "texture", shortLabel: "Look C", category: "Fabric + Texture Forward" },
];

export type AccessoryCategory =
  | "clothing"
  | "shoes"
  | "bag"
  | "jewelry"
  | "sunglasses"
  | "layer"
  | "finishing";

export type EditItem = ShopItem & { category: AccessoryCategory };

export const requiredCategories: AccessoryCategory[] = [
  "clothing",
  "shoes",
  "bag",
  "jewelry",
  "sunglasses",
];

export const categoryOrder: AccessoryCategory[] = [
  "clothing",
  "shoes",
  "bag",
  "jewelry",
  "sunglasses",
  "layer",
  "finishing",
];

export const categoryLabels: Record<AccessoryCategory, string> = {
  clothing: "Outfit",
  shoes: "Shoes",
  bag: "Bag",
  jewelry: "Jewelry",
  sunglasses: "Sunglasses",
  layer: "Optional Layer",
  finishing: "Finishing Layer",
};

export type LookEdit = {
  id: LookKey;
  name: string;
  category: string;
  fabric: string;
  description: string;
  finishingNote?: string;
  image?: string;
  tiers: Record<Tier, EditItem[]>;
};

export type DayEdit = {
  day: string;
  title: string;
  subtitle: string;
  image: string;
  looks: LookEdit[];
};

// ============================================================
// Day 1 — Yacht Day
// ============================================================
const day1Looks: LookEdit[] = [
  {
    id: "print",
    name: "Boarding the Boat",
    category: "Print Forward",
    fabric: "Blue tile silk print • Linen blend • Raffia accents",
    description: "A printed silk caftan over a sleek swimsuit. Gold at the ears, citrus on the deck.",
    finishingNote: "Low chignon · Bronzed skin · Tinted SPF",
    tiers: {
      designer: [
        { brand: "Emilio Pucci", item: "Printed Silk Caftan", price: "$1,495", href: "#", category: "layer" },
        { brand: "Eres", item: "Solid Bandeau Swimsuit", price: "$385", href: "#", category: "clothing" },
        { brand: "Loewe", item: "Raffia Basket Tote", price: "$1,150", href: "#", category: "bag" },
        { brand: "Celine", item: "Triomphe Sunglasses", price: "$490", href: "#", category: "sunglasses" },
        { brand: "Jennifer Fisher", item: "Bold Gold Hoops", price: "$525", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Hutch", item: "Printed Silk Caftan", price: "$298", href: "#", category: "layer" },
        { brand: "Melissa Odabash", item: "Bandeau Swimsuit", price: "$245", href: "#", category: "clothing" },
        { brand: "Cult Gaia", item: "Mini Raffia Tote", price: "$298", href: "#", category: "bag" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#", category: "sunglasses" },
        { brand: "Missoma", item: "Chunky Gold Hoops", price: "$185", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Farm Rio", item: "Printed Caftan", price: "$135", href: "#", category: "layer" },
        { brand: "Hunza G", item: "Bandeau Swimsuit", price: "$95", href: "#", category: "clothing" },
        { brand: "Sézane", item: "Straw Tote", price: "$145", href: "#", category: "bag" },
        { brand: "Quay", item: "Oversized Sunglasses", price: "$75", href: "#", category: "sunglasses" },
        { brand: "Mejuri", item: "Bold Hoops", price: "$98", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "neutral",
    name: "Midday on Deck",
    category: "Quiet Luxury",
    fabric: "European linen • Cotton poplin • Gold hardware",
    description: "White linen pants, a cream knit polo, and a soft leather tote. Cartier on the wrist.",
    tiers: {
      designer: [
        { brand: "The Row", item: "Cream Knit Polo", price: "$890", href: "#", category: "clothing" },
        { brand: "Khaite", item: "White Linen Trousers", price: "$680", href: "#", category: "clothing" },
        { brand: "Hermès", item: "Garden Party Tote", price: "$3,250", href: "#", category: "bag" },
        { brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "#", category: "jewelry" },
        { brand: "Saint Laurent", item: "Cream Sunglasses", price: "$465", href: "#", category: "sunglasses" },
      ],
      mid: [
        { brand: "Vince", item: "Cream Knit Polo", price: "$245", href: "#", category: "clothing" },
        { brand: "Anine Bing", item: "Linen Trousers", price: "$229", href: "#", category: "clothing" },
        { brand: "Demellier", item: "Tan Leather Tote", price: "$495", href: "#", category: "bag" },
        { brand: "Monica Vinader", item: "Gold Cuff", price: "$295", href: "#", category: "jewelry" },
        { brand: "Le Specs", item: "Cream Sunglasses", price: "$110", href: "#", category: "sunglasses" },
      ],
      riviera: [
        { brand: "Mango", item: "Knit Polo Top", price: "$59", href: "#", category: "clothing" },
        { brand: "Reformation", item: "Linen Trousers", price: "$148", href: "#", category: "clothing" },
        { brand: "Mansur Gavriel", item: "Mini Tote", price: "$145", href: "#", category: "bag" },
        { brand: "Mejuri", item: "Gold Cuff", price: "$128", href: "#", category: "jewelry" },
        { brand: "DIFF", item: "Cream Sunglasses", price: "$95", href: "#", category: "sunglasses" },
      ],
    },
  },
  {
    id: "texture",
    name: "Coastal Sophistication",
    category: "Texture Forward",
    fabric: "Espresso swim • Degradé crochet knit • Woven raffia",
    description: "A brown plunge one-piece under degradé crochet wide-leg trousers, a straw hat, and a raffia tote — yacht-deck polish in warm coastal neutrals.",
    tiers: {
      designer: [
        { brand: "Chloé", item: "Crochet Knit Top", price: "$1,295", href: "#", category: "clothing" },
        { brand: "Zimmermann", item: "Linen Wide-Leg Pants", price: "$725", href: "#", category: "clothing" },
        { brand: "Bottega Veneta", item: "Intrecciato Raffia Tote", price: "$2,400", href: "#", category: "bag" },
        { brand: "Celine", item: "Sunglasses", price: "$490", href: "#", category: "sunglasses" },
        { brand: "Sophie Buhai", item: "Sculptural Earrings", price: "$485", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Sea NY", item: "Crochet Knit Top", price: "$295", href: "#", category: "clothing" },
        { brand: "Faithfull the Brand", item: "Linen Pants", price: "$249", href: "#", category: "clothing" },
        { brand: "Dragon Diffusion", item: "Woven Leather Tote", price: "$385", href: "#", category: "bag" },
        { brand: "Melissa Odabash", item: "Sunglasses", price: "$245", href: "#", category: "sunglasses" },
        { brand: "Jenny Bird", item: "Sculptural Earrings", price: "$148", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Crochet Top", price: "$79", href: "#", category: "clothing" },
        { brand: "H&M", item: "Linen Wide-Leg Pants", price: "$59", href: "#", category: "clothing" },
        { brand: "Sézane", item: "Raffia Basket Bag", price: "$145", href: "#", category: "bag" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#", category: "sunglasses" },
        { brand: "BaubleBar", item: "Sculptural Earrings", price: "$48", href: "#", category: "jewelry" },
      ],
    },
  },
];

// ============================================================
// Day 2 — Beach Cabana
// ============================================================
const day2Looks: LookEdit[] = [
  {
    id: "print",
    name: "Beach Club Morning",
    category: "Print Forward",
    fabric: "Lemon print cotton voile • Silk twill scarf • Raffia weave",
    description: "The iconic lemon-print kaftan layered over a solid swimsuit, finished with a knotted silk scarf, woven raffia accessories, and easy resort sandals for seaside lunches and waterfront strolls.",
    tiers: {
      designer: [
        { brand: "Dolce & Gabbana", item: "Lemon Print Kaftan", price: "$1,895", href: "#", category: "layer" },
        { brand: "Eres", item: "Solid Maillot", price: "$485", href: "#", category: "clothing" },
        { brand: "Dolce & Gabbana", item: "Silk Headscarf", price: "$395", href: "#", category: "finishing" },
        { brand: "Loewe", item: "Anagram Raffia Tote", price: "$1,250", href: "#", category: "bag" },
        { brand: "Saint Laurent", item: "Sunglasses", price: "$465", href: "#", category: "sunglasses" },
        { brand: "Bottega Veneta", item: "Gold Hoop Earrings", price: "$620", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Farm Rio", item: "Lemon Print Kaftan", price: "$245", href: "#", category: "layer" },
        { brand: "Melissa Odabash", item: "Maillot", price: "$245", href: "#", category: "clothing" },
        { brand: "Anine Bing", item: "Silk Scarf", price: "$120", href: "#", category: "finishing" },
        { brand: "Loeffler Randall", item: "Raffia Tote", price: "$350", href: "#", category: "bag" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#", category: "sunglasses" },
        { brand: "Mejuri", item: "Bold Gold Hoops", price: "$98", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "H&M", item: "Printed Kaftan", price: "$59", href: "#", category: "layer" },
        { brand: "Hunza G", item: "Maillot", price: "$135", href: "#", category: "clothing" },
        { brand: "Sézane", item: "Square Silk Scarf", price: "$65", href: "#", category: "finishing" },
        { brand: "Mango", item: "Woven Tote", price: "$79", href: "#", category: "bag" },
        { brand: "Le Specs", item: "Sunglasses", price: "$89", href: "#", category: "sunglasses" },
        { brand: "Mango", item: "Gold Hoops", price: "$25", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "neutral",
    name: "The Long Lunch",
    category: "Quiet Luxury",
    fabric: "Ivory European linen • Matte swim • Burnished leather",
    description: "Ivory linen shirtdress, oat-toned swim underneath, polished leather sandals.",
    tiers: {
      designer: [
        { brand: "Toteme", item: "Ivory Linen Shirtdress", price: "$720", href: "#", category: "clothing" },
        { brand: "Eres", item: "Oat Bandeau Swim", price: "$385", href: "#", category: "clothing" },
        { brand: "Hermès", item: "Oran Sandals", price: "$760", href: "#", category: "shoes" },
        { brand: "The Row", item: "Soft Leather Tote", price: "$1,890", href: "#", category: "bag" },
        { brand: "Saint Laurent", item: "Sunglasses", price: "$465", href: "#", category: "sunglasses" },
        { brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Anine Bing", item: "Linen Shirtdress", price: "$249", href: "#", category: "clothing" },
        { brand: "Melissa Odabash", item: "Oat Bandeau Swim", price: "$245", href: "#", category: "clothing" },
        { brand: "Ancient Greek Sandals", item: "Flat Sandals", price: "$215", href: "#", category: "shoes" },
        { brand: "Demellier", item: "Leather Tote", price: "$495", href: "#", category: "bag" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#", category: "sunglasses" },
        { brand: "Monica Vinader", item: "Gold Cuff Bracelet", price: "$295", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Linen Shirtdress", price: "$89", href: "#", category: "clothing" },
        { brand: "Hunza G", item: "Bandeau Swim", price: "$95", href: "#", category: "clothing" },
        { brand: "Sam Edelman", item: "Flat Sandals", price: "$110", href: "#", category: "shoes" },
        { brand: "Mansur Gavriel", item: "Mini Tote", price: "$145", href: "#", category: "bag" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#", category: "sunglasses" },
        { brand: "Mejuri", item: "Thin Gold Bracelet", price: "$65", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "texture",
    name: "Seaside Glamour",
    category: "Texture Forward",
    fabric: "Cotton eyelet • Raffia straw • Woven leather slides",
    description: "Eyelet cover-up, raffia hat, woven slides — tonal sand-on-cream texture story.",
    tiers: {
      designer: [
        { brand: "Zimmermann", item: "Eyelet Cover-up Dress", price: "$795", href: "#", category: "layer" },
        { brand: "Eres", item: "Cream Triangle Bikini", price: "$485", href: "#", category: "clothing" },
        { brand: "Eric Javits", item: "Raffia Wide-Brim Hat", price: "$395", href: "#", category: "finishing" },
        { brand: "Loewe", item: "Raffia Basket Bag", price: "$1,150", href: "#", category: "bag" },
        { brand: "Ancient Greek Sandals", item: "Woven Leather Slides", price: "$295", href: "#", category: "shoes" },
        { brand: "Sophie Buhai", item: "Shell Pendant Necklace", price: "$850", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Sea NY", item: "Eyelet Cover-up", price: "$345", href: "#", category: "layer" },
        { brand: "Melissa Odabash", item: "Cream Triangle Bikini", price: "$220", href: "#", category: "clothing" },
        { brand: "Lack of Color", item: "Raffia Hat", price: "$129", href: "#", category: "finishing" },
        { brand: "Cult Gaia", item: "Raffia Bag", price: "$298", href: "#", category: "bag" },
        { brand: "Dragon Diffusion", item: "Woven Slides", price: "$215", href: "#", category: "shoes" },
        { brand: "Lié Studio", item: "Sculptural Earrings", price: "$185", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Eyelet Cover-up", price: "$69", href: "#", category: "layer" },
        { brand: "Hunza G", item: "Triangle Bikini", price: "$95", href: "#", category: "clothing" },
        { brand: "& Other Stories", item: "Raffia Hat", price: "$49", href: "#", category: "finishing" },
        { brand: "Sézane", item: "Woven Raffia Bag", price: "$145", href: "#", category: "bag" },
        { brand: "Mango", item: "Woven Slides", price: "$79", href: "#", category: "shoes" },
        { brand: "& Other Stories", item: "Shell Necklace", price: "$35", href: "#", category: "jewelry" },
      ],
    },
  },
];

// ============================================================
// Day 3 — Day Club
// ============================================================
const day3Looks: LookEdit[] = [
  {
    id: "print",
    name: "Poolside",
    category: "Print Forward",
    fabric: "Mediterranean silk print • Cotton poplin • Polished leather",
    description: "A bold Mediterranean print shirtdress, sandals that mean business, statement earrings.",
    finishingNote: "Loose beach waves · Glossy nude lip",
    tiers: {
      designer: [
        { brand: "Zimmermann", item: "Printed Shirtdress", price: "$1,250", href: "#", category: "clothing" },
        { brand: "Christian Louboutin", item: "Strappy Sandals", price: "$895", href: "#", category: "shoes" },
        { brand: "Bottega Veneta", item: "Mini Jodie", price: "$3,200", href: "#", category: "clothing" },
        { brand: "Bottega Veneta", item: "Sunglasses", price: "$420", href: "#", category: "sunglasses" },
        { brand: "Sophie Buhai", item: "Drop Earrings", price: "$485", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Alemais", item: "Palermo Shirtdress", price: "$595", href: "#", category: "clothing" },
        { brand: "Schutz", item: "Strappy Sandals", price: "$198", href: "#", category: "shoes" },
        { brand: "Staud", item: "Moon Bag", price: "$345", href: "#", category: "bag" },
        { brand: "Melissa Odabash", item: "Sunglasses", price: "$245", href: "#", category: "sunglasses" },
        { brand: "Jennifer Behr", item: "Statement Earrings", price: "$235", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Farm Rio", item: "Print Midi Dress", price: "$185", href: "#", category: "clothing" },
        { brand: "Mango", item: "Strappy Sandals", price: "$89", href: "#", category: "shoes" },
        { brand: "Mansur Gavriel", item: "Mini Bucket", price: "$145", href: "#", category: "bag" },
        { brand: "DIFF", item: "Tortoise Sunglasses", price: "$95", href: "#", category: "sunglasses" },
        { brand: "BaubleBar", item: "Drop Earrings", price: "$48", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "neutral",
    name: "Via Roma Boutiques",
    category: "Print Forward",
    fabric: "Silk floral print • Raffia weave • Natural straw",
    description: "A floral off-shoulder mini, raffia espadrille wedges, and a straw boater — soft, sunlit, and made for a long lunch by the water.",
    tiers: {
      designer: [
        { brand: "Toteme", item: "Ivory Shirtdress", price: "$890", href: "#", category: "clothing" },
        { brand: "Aquazzura", item: "Gold Sandals", price: "$895", href: "#", category: "shoes" },
        { brand: "Saint Laurent", item: "Camel Shoulder Bag", price: "$1,950", href: "#", category: "bag" },
        { brand: "Celine", item: "Triomphe Sunglasses", price: "$490", href: "#", category: "sunglasses" },
        { brand: "Jennifer Fisher", item: "Gold Drop Earrings", price: "$525", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Anine Bing", item: "Ivory Shirtdress", price: "$329", href: "#", category: "clothing" },
        { brand: "Schutz", item: "Gold Strap Heel", price: "$198", href: "#", category: "shoes" },
        { brand: "Demellier", item: "Camel Shoulder Bag", price: "$495", href: "#", category: "bag" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#", category: "sunglasses" },
        { brand: "Monica Vinader", item: "Gold Drop Earrings", price: "$245", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Reformation", item: "Ivory Shirtdress", price: "$178", href: "#", category: "clothing" },
        { brand: "Sam Edelman", item: "Gold Sandals", price: "$130", href: "#", category: "shoes" },
        { brand: "Mango", item: "Camel Shoulder Bag", price: "$89", href: "#", category: "bag" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#", category: "sunglasses" },
        { brand: "Mejuri", item: "Gold Drops", price: "$118", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "texture",
    name: "Capri Aperitivo",
    category: "Texture Forward",
    fabric: "Open crochet • Woven leather • Raffia weave",
    description: "Crochet midi, woven slides, raffia mini. Tonal cream layered with handworked texture.",
    tiers: {
      designer: [
        { brand: "Chloé", item: "Crochet Midi Dress", price: "$2,295", href: "#", category: "clothing" },
        { brand: "Bottega Veneta", item: "Woven Heeled Sandal", price: "$1,150", href: "#", category: "shoes" },
        { brand: "Loewe", item: "Raffia Bucket", price: "$1,250", href: "#", category: "bag" },
        { brand: "Bottega Veneta", item: "Sunglasses", price: "$420", href: "#", category: "sunglasses" },
        { brand: "Sophie Buhai", item: "Sculpted Earrings", price: "$485", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Sea NY", item: "Crochet Midi Dress", price: "$395", href: "#", category: "clothing" },
        { brand: "Schutz", item: "Woven Heel", price: "$198", href: "#", category: "shoes" },
        { brand: "Cult Gaia", item: "Raffia Bucket", price: "$298", href: "#", category: "bag" },
        { brand: "Melissa Odabash", item: "Sunglasses", price: "$245", href: "#", category: "sunglasses" },
        { brand: "Jenny Bird", item: "Sculpted Earrings", price: "$148", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Crochet Midi Dress", price: "$99", href: "#", category: "clothing" },
        { brand: "Sam Edelman", item: "Woven Heel", price: "$140", href: "#", category: "shoes" },
        { brand: "Sézane", item: "Raffia Bucket", price: "$145", href: "#", category: "bag" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#", category: "sunglasses" },
        { brand: "BaubleBar", item: "Sculpted Earrings", price: "$58", href: "#", category: "jewelry" },
      ],
    },
  },
];

// ============================================================
// Day 4 — Dinner in Portofino
// ============================================================
const day4Looks: LookEdit[] = [
  {
    id: "print",
    name: "Sunset Cocktails",
    category: "Print Forward",
    fabric: "Sunset silk print • Silk blend • Jeweled hardware",
    description: "A sunset-print silk maxi, strappy heel, a small jeweled clutch.",
    tiers: {
      designer: [
        { brand: "Johanna Ortiz", item: "Sunset Print Silk Maxi", price: "$1,890", href: "#", category: "clothing" },
        { brand: "Aquazzura", item: "Nudist Sandal", price: "$895", href: "#", category: "shoes" },
        { brand: "Bottega Veneta", item: "Knot Minaudière", price: "$2,300", href: "#", category: "bag" },
        { brand: "Jennifer Fisher", item: "Drop Earrings", price: "$525", href: "#", category: "jewelry" },
        { brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Alemais", item: "Bonita Silk Maxi", price: "$595", href: "#", category: "clothing" },
        { brand: "Schutz", item: "Strappy Heel", price: "$198", href: "#", category: "shoes" },
        { brand: "Cult Gaia", item: "Acrylic Minaudière", price: "$398", href: "#", category: "bag" },
        { brand: "Jennifer Behr", item: "Crystal Drops", price: "$285", href: "#", category: "jewelry" },
        { brand: "Monica Vinader", item: "Gold Cuff", price: "$295", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Farm Rio", item: "Print Silk Maxi", price: "$185", href: "#", category: "clothing" },
        { brand: "Sam Edelman", item: "Strappy Heel", price: "$140", href: "#", category: "shoes" },
        { brand: "Mango", item: "Jeweled Clutch", price: "$89", href: "#", category: "bag" },
        { brand: "BaubleBar", item: "Crystal Drops", price: "$58", href: "#", category: "jewelry" },
        { brand: "Mejuri", item: "Gold Cuff", price: "$128", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "neutral",
    name: "Dinner with a View",
    category: "Quiet Luxury",
    fabric: "Heavy silk slip • Italian leather • Brushed gold",
    description: "An ivory silk slip, a small black chain bag, a single gold cuff. Quietly powerful.",
    finishingNote: "Sleek low pony · Statement red lip",
    tiers: {
      designer: [
        { brand: "Galvan", item: "Ivory Silk Slip Dress", price: "$1,495", href: "#", category: "clothing" },
        { brand: "Manolo Blahnik", item: "Black Strappy Heel", price: "$925", href: "#", category: "shoes" },
        { brand: "Saint Laurent", item: "Kate Chain Wallet", price: "$1,650", href: "#", category: "bag" },
        { brand: "Cartier", item: "Love Cuff", price: "$7,350", href: "#", category: "jewelry" },
        { brand: "Jennifer Fisher", item: "Gold Drop Earrings", price: "$525", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Reformation", item: "Silk Slip Dress (Silk Edit)", price: "$298", href: "#", category: "clothing" },
        { brand: "Schutz", item: "Black Strappy Heel", price: "$198", href: "#", category: "shoes" },
        { brand: "Demellier", item: "Mini Chain Bag", price: "$495", href: "#", category: "bag" },
        { brand: "Monica Vinader", item: "Gold Cuff", price: "$295", href: "#", category: "jewelry" },
        { brand: "Jenny Bird", item: "Gold Drops", price: "$148", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Satin Slip Dress", price: "$89", href: "#", category: "clothing" },
        { brand: "Sam Edelman", item: "Black Strappy Heel", price: "$140", href: "#", category: "shoes" },
        { brand: "Mango", item: "Mini Chain Bag", price: "$89", href: "#", category: "bag" },
        { brand: "Mejuri", item: "Gold Cuff", price: "$128", href: "#", category: "jewelry" },
        { brand: "BaubleBar", item: "Gold Drops", price: "$48", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "texture",
    name: "After-Dinner Drinks",
    category: "Texture Forward",
    fabric: "Ribbed knit halter • Heavy satin • Intrecciato leather",
    description: "Textured black knit halter, satin column skirt, sculpted woven clutch. All tone, all texture.",
    finishingNote: "Soft waves · Glowy skin · Nude lip",
    tiers: {
      designer: [
        { brand: "Khaite", item: "Black Knit Halter Top", price: "$780", href: "#", category: "clothing" },
        { brand: "The Row", item: "Black Satin Column Skirt", price: "$1,290", href: "#", category: "clothing" },
        { brand: "Bottega Veneta", item: "Woven Pouch Clutch", price: "$2,500", href: "#", category: "bag" },
        { brand: "Aquazzura", item: "Black Strappy Heel", price: "$795", href: "#", category: "shoes" },
        { brand: "Sophie Buhai", item: "Onyx Drop Earrings", price: "$525", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Anine Bing", item: "Black Knit Halter", price: "$229", href: "#", category: "clothing" },
        { brand: "Anine Bing", item: "Satin Column Skirt", price: "$249", href: "#", category: "clothing" },
        { brand: "Cult Gaia", item: "Woven Clutch", price: "$298", href: "#", category: "bag" },
        { brand: "Schutz", item: "Black Strappy Heel", price: "$198", href: "#", category: "shoes" },
        { brand: "Jenny Bird", item: "Onyx Drops", price: "$148", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Knit Halter", price: "$69", href: "#", category: "clothing" },
        { brand: "Reformation", item: "Satin Column Skirt", price: "$148", href: "#", category: "clothing" },
        { brand: "Mango", item: "Woven Clutch", price: "$79", href: "#", category: "bag" },
        { brand: "Sam Edelman", item: "Black Strappy Heel", price: "$140", href: "#", category: "shoes" },
        { brand: "BaubleBar", item: "Onyx Drops", price: "$58", href: "#", category: "jewelry" },
      ],
    },
  },
];

// ============================================================
// Day 5 — Exploring the Town
// ============================================================
const day5Looks: LookEdit[] = [
  {
    id: "print",
    name: "Morning Espresso",
    category: "Print Forward",
    fabric: "Cotton poplin stripe • Linen blend shorts • Woven leather",
    description: "A signature blue Riviera stripe shirt, white shorts, a woven tote.",
    tiers: {
      designer: [
        { brand: "Saint Laurent", item: "Striped Cotton Shirt", price: "$890", href: "#", category: "clothing" },
        { brand: "Khaite", item: "White Tailored Shorts", price: "$680", href: "#", category: "clothing" },
        { brand: "Isabel Marant", item: "Leather Sandals", price: "$495", href: "#", category: "shoes" },
        { brand: "Loewe", item: "Woven Tote", price: "$1,150", href: "#", category: "bag" },
        { brand: "Celine", item: "Sunglasses", price: "$490", href: "#", category: "sunglasses" },
        { brand: "Tiffany & Co.", item: "Gold Bean Pendant", price: "$1,150", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Frame", item: "Striped Cotton Shirt", price: "$228", href: "#", category: "clothing" },
        { brand: "Re/Done", item: "White Tailored Shorts", price: "$245", href: "#", category: "clothing" },
        { brand: "Ancient Greek Sandals", item: "Leather Sandals", price: "$215", href: "#", category: "shoes" },
        { brand: "Dragon Diffusion", item: "Woven Tote", price: "$385", href: "#", category: "bag" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#", category: "sunglasses" },
        { brand: "Mejuri", item: "Layered Gold Necklace", price: "$148", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Striped Linen Shirt", price: "$69", href: "#", category: "clothing" },
        { brand: "Reformation", item: "White Shorts", price: "$98", href: "#", category: "clothing" },
        { brand: "Sam Edelman", item: "Slide Sandals", price: "$110", href: "#", category: "shoes" },
        { brand: "Sézane", item: "Straw Tote", price: "$145", href: "#", category: "bag" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#", category: "sunglasses" },
        { brand: "Mango", item: "Gold Pendant Necklace", price: "$29", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "neutral",
    name: "One Long Last Lunch",
    category: "Quiet Luxury",
    fabric: "Washed European linen • Viscose blend trousers • Smooth leather",
    description: "Camel linen shirt, cream trousers, polished leather sandals, a structured tan tote.",
    finishingNote: "Low bun · Glowy skin · Tinted SPF",
    tiers: {
      designer: [
        { brand: "The Row", item: "Camel Linen Shirt", price: "$890", href: "#", category: "clothing" },
        { brand: "Toteme", item: "Cream Trousers", price: "$520", href: "#", category: "clothing" },
        { brand: "Hermès", item: "Oran Sandals", price: "$760", href: "#", category: "shoes" },
        { brand: "The Row", item: "Tan Leather Tote", price: "$1,890", href: "#", category: "bag" },
        { brand: "Celine", item: "Sunglasses", price: "$490", href: "#", category: "sunglasses" },
      ],
      mid: [
        { brand: "Anine Bing", item: "Camel Linen Shirt", price: "$200", href: "#", category: "clothing" },
        { brand: "Anine Bing", item: "Cream Trousers", price: "$229", href: "#", category: "clothing" },
        { brand: "Ancient Greek Sandals", item: "Leather Sandals", price: "$215", href: "#", category: "shoes" },
        { brand: "Demellier", item: "Tan Leather Tote", price: "$495", href: "#", category: "bag" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#", category: "sunglasses" },
        { brand: "Monica Vinader", item: "Gold Hoops", price: "$195", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Camel Linen Shirt", price: "$69", href: "#", category: "clothing" },
        { brand: "Reformation", item: "Cream Trousers", price: "$148", href: "#", category: "clothing" },
        { brand: "Sam Edelman", item: "Leather Sandals", price: "$110", href: "#", category: "shoes" },
        { brand: "Mansur Gavriel", item: "Tan Tote", price: "$145", href: "#", category: "bag" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#", category: "sunglasses" },
        { brand: "Mejuri", item: "Small Gold Hoops", price: "$58", href: "#", category: "jewelry" },
      ],
    },
  },
  {
    id: "texture",
    name: "The Slow Departure",
    category: "Texture Forward",
    fabric: "Crinkled Italian linen • Raffia weave • Woven leather",
    description: "Crinkled linen set, raffia tote, woven slides. Texture from head to toe.",
    tiers: {
      designer: [
        { brand: "Loro Piana", item: "Crinkled Linen Shirt", price: "$1,250", href: "#", category: "clothing" },
        { brand: "Loro Piana", item: "Linen Bermuda Shorts", price: "$895", href: "#", category: "clothing" },
        { brand: "Bottega Veneta", item: "Woven Slides", price: "$1,090", href: "#", category: "shoes" },
        { brand: "Loewe", item: "Raffia Basket Tote", price: "$1,150", href: "#", category: "bag" },
        { brand: "Celine", item: "Sunglasses", price: "$490", href: "#", category: "sunglasses" },
        { brand: "Sophie Buhai", item: "Sculptural Gold Cuff", price: "$720", href: "#", category: "jewelry" },
      ],
      mid: [
        { brand: "Vince", item: "Crinkled Linen Shirt", price: "$245", href: "#", category: "clothing" },
        { brand: "Faithfull the Brand", item: "Linen Bermudas", price: "$179", href: "#", category: "clothing" },
        { brand: "Dragon Diffusion", item: "Woven Slides", price: "$215", href: "#", category: "shoes" },
        { brand: "Cult Gaia", item: "Raffia Tote", price: "$298", href: "#", category: "bag" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#", category: "sunglasses" },
        { brand: "Lié Studio", item: "Wide Sculptural Cuff", price: "$215", href: "#", category: "jewelry" },
      ],
      riviera: [
        { brand: "Mango", item: "Crinkled Linen Shirt", price: "$59", href: "#", category: "clothing" },
        { brand: "H&M", item: "Linen Bermudas", price: "$49", href: "#", category: "clothing" },
        { brand: "Mango", item: "Woven Slides", price: "$79", href: "#", category: "shoes" },
        { brand: "Sézane", item: "Raffia Tote", price: "$145", href: "#", category: "bag" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#", category: "sunglasses" },
        { brand: "& Other Stories", item: "Sculptural Cuff", price: "$39", href: "#", category: "jewelry" },
      ],
    },
  },
];

const allLooks: LookEdit[][] = [day1Looks, day2Looks, day3Looks, day4Looks, day5Looks];

const lookImages: string[][] = [
  [d1a, d1b, d1c],
  [d2a, d2b, d2c],
  [d3a, d3b, d3c],
  [d4a, d4b, d4c],
  [d5a, d5b, d5c],
];

allLooks.forEach((dayLooks, di) => {
  dayLooks.forEach((look, li) => {
    look.image = lookImages[di][li];
  });
});

export const portofinoEdit: DayEdit[] = portofinoLooks.map((look, i) => ({
  day: look.day,
  title: look.title,
  subtitle: look.subtitle,
  image: look.image,
  looks: allLooks[i],
}));
