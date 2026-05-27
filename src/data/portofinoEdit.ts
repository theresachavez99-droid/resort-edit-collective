import { portofinoLooks, type ShopItem } from "./portofino";

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
  { id: "designer", label: "Designer Edit", tagline: "Investment luxury pieces.", range: "$300+" },
  { id: "mid", label: "Mid-Luxe Edit", tagline: "Elevated resort style at modern prices.", range: "$100–400" },
  { id: "riviera", label: "Riviera Finds", tagline: "Curated accessible alternatives.", range: "Under $150" },
];

export const lookMetas: LookMeta[] = [
  { id: "print", shortLabel: "Look A", category: "Print Forward" },
  { id: "neutral", shortLabel: "Look B", category: "Quiet Luxury & Fabric Focused" },
  { id: "texture", shortLabel: "Look C", category: "Fabric + Texture Forward" },
];

export type LookEdit = {
  id: LookKey;
  name: string;       // e.g. "Mediterranean Glam"
  category: string;   // "Print Forward"
  fabric: string;     // e.g. "Blue tile print • Linen blend • Raffia accents"
  description: string;
  tiers: Record<Tier, ShopItem[]>;
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
    name: "Mediterranean Glam",
    category: "Print Forward",
    description: "A printed silk caftan over a sleek swimsuit. Gold at the ears, citrus on the deck.",
    tiers: {
      designer: [
        { brand: "Emilio Pucci", item: "Printed Silk Caftan", price: "$1,495", href: "#" },
        { brand: "Eres", item: "Solid Bandeau Swimsuit", price: "$385", href: "#" },
        { brand: "Loewe", item: "Raffia Basket Tote", price: "$1,150", href: "#" },
        { brand: "Celine", item: "Triomphe Sunglasses", price: "$490", href: "#" },
        { brand: "Jennifer Fisher", item: "Bold Gold Hoops", price: "$525", href: "#" },
      ],
      mid: [
        { brand: "Hutch", item: "Printed Silk Caftan", price: "$298", href: "#" },
        { brand: "Melissa Odabash", item: "Bandeau Swimsuit", price: "$245", href: "#" },
        { brand: "Cult Gaia", item: "Mini Raffia Tote", price: "$298", href: "#" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
        { brand: "Missoma", item: "Chunky Gold Hoops", price: "$185", href: "#" },
      ],
      riviera: [
        { brand: "Farm Rio", item: "Printed Caftan", price: "$135", href: "#" },
        { brand: "Hunza G", item: "Bandeau Swimsuit", price: "$95", href: "#" },
        { brand: "Sézane", item: "Straw Tote", price: "$145", href: "#" },
        { brand: "Quay", item: "Oversized Sunglasses", price: "$75", href: "#" },
        { brand: "Mejuri", item: "Bold Hoops", price: "$98", href: "#" },
      ],
    },
  },
  {
    id: "neutral",
    name: "Quiet Luxury Yacht Wife",
    category: "Quiet Luxury",
    description: "White linen pants, a cream knit polo, and a quiet leather tote. Cartier on the wrist.",
    tiers: {
      designer: [
        { brand: "The Row", item: "Cream Knit Polo", price: "$890", href: "#" },
        { brand: "Khaite", item: "White Linen Trousers", price: "$680", href: "#" },
        { brand: "Hermès", item: "Garden Party Tote", price: "$3,250", href: "#" },
        { brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "#" },
        { brand: "Saint Laurent", item: "Cream Sunglasses", price: "$465", href: "#" },
      ],
      mid: [
        { brand: "Vince", item: "Cream Knit Polo", price: "$245", href: "#" },
        { brand: "Anine Bing", item: "Linen Trousers", price: "$229", href: "#" },
        { brand: "Demellier", item: "Tan Leather Tote", price: "$495", href: "#" },
        { brand: "Monica Vinader", item: "Gold Cuff", price: "$295", href: "#" },
        { brand: "Le Specs", item: "Cream Sunglasses", price: "$110", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Knit Polo Top", price: "$59", href: "#" },
        { brand: "Reformation", item: "Linen Trousers", price: "$148", href: "#" },
        { brand: "Mansur Gavriel", item: "Mini Tote", price: "$145", href: "#" },
        { brand: "Mejuri", item: "Gold Cuff", price: "$128", href: "#" },
        { brand: "DIFF", item: "Cream Sunglasses", price: "$95", href: "#" },
      ],
    },
  },
  {
    id: "texture",
    name: "Italian Riviera Glam",
    category: "Texture Forward",
    description: "Crocheted top, woven raffia bag, tonal cream-on-cream. Texture as the focal point.",
    tiers: {
      designer: [
        { brand: "Chloé", item: "Crochet Knit Top", price: "$1,295", href: "#" },
        { brand: "Zimmermann", item: "Linen Wide-Leg Pants", price: "$725", href: "#" },
        { brand: "Bottega Veneta", item: "Intrecciato Raffia Tote", price: "$2,400", href: "#" },
        { brand: "Celine", item: "Sunglasses", price: "$490", href: "#" },
        { brand: "Sophie Buhai", item: "Sculptural Earrings", price: "$485", href: "#" },
      ],
      mid: [
        { brand: "Sea NY", item: "Crochet Knit Top", price: "$295", href: "#" },
        { brand: "Faithfull the Brand", item: "Linen Pants", price: "$249", href: "#" },
        { brand: "Dragon Diffusion", item: "Woven Leather Tote", price: "$385", href: "#" },
        { brand: "Melissa Odabash", item: "Sunglasses", price: "$245", href: "#" },
        { brand: "Jenny Bird", item: "Sculptural Earrings", price: "$148", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Crochet Top", price: "$79", href: "#" },
        { brand: "H&M", item: "Linen Wide-Leg Pants", price: "$59", href: "#" },
        { brand: "Sézane", item: "Raffia Basket Bag", price: "$145", href: "#" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#" },
        { brand: "BaubleBar", item: "Sculptural Earrings", price: "$48", href: "#" },
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
    name: "Lemon Print Cabana",
    category: "Print Forward",
    description: "The iconic lemon-print kaftan over a solid swimsuit, knotted silk scarf, raffia at hand.",
    tiers: {
      designer: [
        { brand: "Dolce & Gabbana", item: "Lemon Print Kaftan", price: "$1,895", href: "#" },
        { brand: "Eres", item: "Solid Maillot", price: "$485", href: "#" },
        { brand: "Dolce & Gabbana", item: "Silk Headscarf", price: "$395", href: "#" },
        { brand: "Loewe", item: "Anagram Raffia Tote", price: "$1,250", href: "#" },
        { brand: "Saint Laurent", item: "Sunglasses", price: "$465", href: "#" },
      ],
      mid: [
        { brand: "Farm Rio", item: "Lemon Print Kaftan", price: "$245", href: "#" },
        { brand: "Melissa Odabash", item: "Maillot", price: "$245", href: "#" },
        { brand: "Anine Bing", item: "Silk Scarf", price: "$120", href: "#" },
        { brand: "Loeffler Randall", item: "Raffia Tote", price: "$350", href: "#" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
      ],
      riviera: [
        { brand: "H&M", item: "Printed Kaftan", price: "$59", href: "#" },
        { brand: "Hunza G", item: "Maillot", price: "$135", href: "#" },
        { brand: "Sézane", item: "Square Silk Scarf", price: "$65", href: "#" },
        { brand: "Mango", item: "Woven Tote", price: "$79", href: "#" },
        { brand: "Le Specs", item: "Sunglasses", price: "$89", href: "#" },
      ],
    },
  },
  {
    id: "neutral",
    name: "Neutral Resort Luxe",
    category: "Quiet Luxury",
    description: "Ivory linen shirtdress, oat-toned swim underneath, polished leather sandals.",
    tiers: {
      designer: [
        { brand: "Toteme", item: "Ivory Linen Shirtdress", price: "$720", href: "#" },
        { brand: "Eres", item: "Oat Bandeau Swim", price: "$385", href: "#" },
        { brand: "Hermès", item: "Oran Sandals", price: "$760", href: "#" },
        { brand: "The Row", item: "Soft Leather Tote", price: "$1,890", href: "#" },
        { brand: "Saint Laurent", item: "Sunglasses", price: "$465", href: "#" },
      ],
      mid: [
        { brand: "Anine Bing", item: "Linen Shirtdress", price: "$249", href: "#" },
        { brand: "Melissa Odabash", item: "Oat Bandeau Swim", price: "$245", href: "#" },
        { brand: "Ancient Greek Sandals", item: "Flat Sandals", price: "$215", href: "#" },
        { brand: "Demellier", item: "Leather Tote", price: "$495", href: "#" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Linen Shirtdress", price: "$89", href: "#" },
        { brand: "Hunza G", item: "Bandeau Swim", price: "$95", href: "#" },
        { brand: "Sam Edelman", item: "Flat Sandals", price: "$110", href: "#" },
        { brand: "Mansur Gavriel", item: "Mini Tote", price: "$145", href: "#" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#" },
      ],
    },
  },
  {
    id: "texture",
    name: "Coastal Texture",
    category: "Texture Forward",
    description: "Eyelet cover-up, raffia hat, woven slides — tonal sand-on-cream texture story.",
    tiers: {
      designer: [
        { brand: "Zimmermann", item: "Eyelet Cover-up Dress", price: "$795", href: "#" },
        { brand: "Eres", item: "Cream Triangle Bikini", price: "$485", href: "#" },
        { brand: "Eric Javits", item: "Raffia Wide-Brim Hat", price: "$395", href: "#" },
        { brand: "Loewe", item: "Raffia Basket Bag", price: "$1,150", href: "#" },
        { brand: "Ancient Greek Sandals", item: "Woven Leather Slides", price: "$295", href: "#" },
      ],
      mid: [
        { brand: "Sea NY", item: "Eyelet Cover-up", price: "$345", href: "#" },
        { brand: "Melissa Odabash", item: "Cream Triangle Bikini", price: "$220", href: "#" },
        { brand: "Lack of Color", item: "Raffia Hat", price: "$129", href: "#" },
        { brand: "Cult Gaia", item: "Raffia Bag", price: "$298", href: "#" },
        { brand: "Dragon Diffusion", item: "Woven Slides", price: "$215", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Eyelet Cover-up", price: "$69", href: "#" },
        { brand: "Hunza G", item: "Triangle Bikini", price: "$95", href: "#" },
        { brand: "& Other Stories", item: "Raffia Hat", price: "$49", href: "#" },
        { brand: "Sézane", item: "Woven Raffia Bag", price: "$145", href: "#" },
        { brand: "Mango", item: "Woven Slides", price: "$79", href: "#" },
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
    name: "Palermo Print Day Club",
    category: "Print Forward",
    description: "A bold Mediterranean print shirtdress, sandals that mean business, statement earrings.",
    tiers: {
      designer: [
        { brand: "Zimmermann", item: "Printed Shirtdress", price: "$1,250", href: "#" },
        { brand: "Christian Louboutin", item: "Strappy Sandals", price: "$895", href: "#" },
        { brand: "Bottega Veneta", item: "Mini Jodie", price: "$3,200", href: "#" },
        { brand: "Bottega Veneta", item: "Sunglasses", price: "$420", href: "#" },
        { brand: "Sophie Buhai", item: "Drop Earrings", price: "$485", href: "#" },
      ],
      mid: [
        { brand: "Alemais", item: "Palermo Shirtdress", price: "$595", href: "#" },
        { brand: "Schutz", item: "Strappy Sandals", price: "$198", href: "#" },
        { brand: "Staud", item: "Moon Bag", price: "$345", href: "#" },
        { brand: "Melissa Odabash", item: "Sunglasses", price: "$245", href: "#" },
        { brand: "Jennifer Behr", item: "Statement Earrings", price: "$235", href: "#" },
      ],
      riviera: [
        { brand: "Farm Rio", item: "Print Midi Dress", price: "$185", href: "#" },
        { brand: "Mango", item: "Strappy Sandals", price: "$89", href: "#" },
        { brand: "Mansur Gavriel", item: "Mini Bucket", price: "$145", href: "#" },
        { brand: "DIFF", item: "Tortoise Sunglasses", price: "$95", href: "#" },
        { brand: "BaubleBar", item: "Drop Earrings", price: "$48", href: "#" },
      ],
    },
  },
  {
    id: "neutral",
    name: "White Resort Day Club",
    category: "Quiet Luxury",
    description: "A long ivory shirtdress, gold sandals, a structured camel bag. Monochrome and polished.",
    tiers: {
      designer: [
        { brand: "Toteme", item: "Ivory Shirtdress", price: "$890", href: "#" },
        { brand: "Aquazzura", item: "Gold Sandals", price: "$895", href: "#" },
        { brand: "Saint Laurent", item: "Camel Shoulder Bag", price: "$1,950", href: "#" },
        { brand: "Celine", item: "Triomphe Sunglasses", price: "$490", href: "#" },
        { brand: "Jennifer Fisher", item: "Gold Drop Earrings", price: "$525", href: "#" },
      ],
      mid: [
        { brand: "Anine Bing", item: "Ivory Shirtdress", price: "$329", href: "#" },
        { brand: "Schutz", item: "Gold Strap Heel", price: "$198", href: "#" },
        { brand: "Demellier", item: "Camel Shoulder Bag", price: "$495", href: "#" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
        { brand: "Monica Vinader", item: "Gold Drop Earrings", price: "$245", href: "#" },
      ],
      riviera: [
        { brand: "Reformation", item: "Ivory Shirtdress", price: "$178", href: "#" },
        { brand: "Sam Edelman", item: "Gold Sandals", price: "$130", href: "#" },
        { brand: "Mango", item: "Camel Shoulder Bag", price: "$89", href: "#" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#" },
        { brand: "Mejuri", item: "Gold Drops", price: "$118", href: "#" },
      ],
    },
  },
  {
    id: "texture",
    name: "Crochet Day Club",
    category: "Texture Forward",
    description: "Crochet midi, woven slides, raffia mini. Tonal cream layered with handworked texture.",
    tiers: {
      designer: [
        { brand: "Chloé", item: "Crochet Midi Dress", price: "$2,295", href: "#" },
        { brand: "Bottega Veneta", item: "Woven Heeled Sandal", price: "$1,150", href: "#" },
        { brand: "Loewe", item: "Raffia Bucket", price: "$1,250", href: "#" },
        { brand: "Bottega Veneta", item: "Sunglasses", price: "$420", href: "#" },
        { brand: "Sophie Buhai", item: "Sculpted Earrings", price: "$485", href: "#" },
      ],
      mid: [
        { brand: "Sea NY", item: "Crochet Midi Dress", price: "$395", href: "#" },
        { brand: "Schutz", item: "Woven Heel", price: "$198", href: "#" },
        { brand: "Cult Gaia", item: "Raffia Bucket", price: "$298", href: "#" },
        { brand: "Melissa Odabash", item: "Sunglasses", price: "$245", href: "#" },
        { brand: "Jenny Bird", item: "Sculpted Earrings", price: "$148", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Crochet Midi Dress", price: "$99", href: "#" },
        { brand: "Sam Edelman", item: "Woven Heel", price: "$140", href: "#" },
        { brand: "Sézane", item: "Raffia Bucket", price: "$145", href: "#" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#" },
        { brand: "BaubleBar", item: "Sculpted Earrings", price: "$58", href: "#" },
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
    name: "Sunset Print Dress",
    category: "Print Forward",
    description: "A sunset-print silk maxi, strappy heel, a small jeweled clutch.",
    tiers: {
      designer: [
        { brand: "Johanna Ortiz", item: "Sunset Print Silk Maxi", price: "$1,890", href: "#" },
        { brand: "Aquazzura", item: "Nudist Sandal", price: "$895", href: "#" },
        { brand: "Bottega Veneta", item: "Knot Minaudière", price: "$2,300", href: "#" },
        { brand: "Jennifer Fisher", item: "Drop Earrings", price: "$525", href: "#" },
        { brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "#" },
      ],
      mid: [
        { brand: "Alemais", item: "Bonita Silk Maxi", price: "$595", href: "#" },
        { brand: "Schutz", item: "Strappy Heel", price: "$198", href: "#" },
        { brand: "Cult Gaia", item: "Acrylic Minaudière", price: "$398", href: "#" },
        { brand: "Jennifer Behr", item: "Crystal Drops", price: "$285", href: "#" },
        { brand: "Monica Vinader", item: "Gold Cuff", price: "$295", href: "#" },
      ],
      riviera: [
        { brand: "Farm Rio", item: "Print Silk Maxi", price: "$185", href: "#" },
        { brand: "Sam Edelman", item: "Strappy Heel", price: "$140", href: "#" },
        { brand: "Mango", item: "Jeweled Clutch", price: "$89", href: "#" },
        { brand: "BaubleBar", item: "Crystal Drops", price: "$58", href: "#" },
        { brand: "Mejuri", item: "Gold Cuff", price: "$128", href: "#" },
      ],
    },
  },
  {
    id: "neutral",
    name: "Silk Slip Dressing",
    category: "Quiet Luxury",
    description: "An ivory silk slip, a small black chain bag, a single gold cuff. Quietly powerful.",
    tiers: {
      designer: [
        { brand: "Galvan", item: "Ivory Silk Slip Dress", price: "$1,495", href: "#" },
        { brand: "Manolo Blahnik", item: "Black Strappy Heel", price: "$925", href: "#" },
        { brand: "Saint Laurent", item: "Kate Chain Wallet", price: "$1,650", href: "#" },
        { brand: "Cartier", item: "Love Cuff", price: "$7,350", href: "#" },
        { brand: "Jennifer Fisher", item: "Gold Drop Earrings", price: "$525", href: "#" },
      ],
      mid: [
        { brand: "Reformation", item: "Silk Slip Dress (Silk Edit)", price: "$298", href: "#" },
        { brand: "Schutz", item: "Black Strappy Heel", price: "$198", href: "#" },
        { brand: "Demellier", item: "Mini Chain Bag", price: "$495", href: "#" },
        { brand: "Monica Vinader", item: "Gold Cuff", price: "$295", href: "#" },
        { brand: "Jenny Bird", item: "Gold Drops", price: "$148", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Satin Slip Dress", price: "$89", href: "#" },
        { brand: "Sam Edelman", item: "Black Strappy Heel", price: "$140", href: "#" },
        { brand: "Mango", item: "Mini Chain Bag", price: "$89", href: "#" },
        { brand: "Mejuri", item: "Gold Cuff", price: "$128", href: "#" },
        { brand: "BaubleBar", item: "Gold Drops", price: "$48", href: "#" },
      ],
    },
  },
  {
    id: "texture",
    name: "Black Resort Glam",
    category: "Texture Forward",
    description: "Textured black knit halter, satin column skirt, sculpted woven clutch. All tone, all texture.",
    tiers: {
      designer: [
        { brand: "Khaite", item: "Black Knit Halter Top", price: "$780", href: "#" },
        { brand: "The Row", item: "Black Satin Column Skirt", price: "$1,290", href: "#" },
        { brand: "Bottega Veneta", item: "Woven Pouch Clutch", price: "$2,500", href: "#" },
        { brand: "Aquazzura", item: "Black Strappy Heel", price: "$795", href: "#" },
        { brand: "Sophie Buhai", item: "Onyx Drop Earrings", price: "$525", href: "#" },
      ],
      mid: [
        { brand: "Anine Bing", item: "Black Knit Halter", price: "$229", href: "#" },
        { brand: "Anine Bing", item: "Satin Column Skirt", price: "$249", href: "#" },
        { brand: "Cult Gaia", item: "Woven Clutch", price: "$298", href: "#" },
        { brand: "Schutz", item: "Black Strappy Heel", price: "$198", href: "#" },
        { brand: "Jenny Bird", item: "Onyx Drops", price: "$148", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Knit Halter", price: "$69", href: "#" },
        { brand: "Reformation", item: "Satin Column Skirt", price: "$148", href: "#" },
        { brand: "Mango", item: "Woven Clutch", price: "$79", href: "#" },
        { brand: "Sam Edelman", item: "Black Strappy Heel", price: "$140", href: "#" },
        { brand: "BaubleBar", item: "Onyx Drops", price: "$58", href: "#" },
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
    name: "Riviera Stripe",
    category: "Print Forward",
    description: "A signature blue Riviera stripe shirt, white shorts, a woven tote.",
    tiers: {
      designer: [
        { brand: "Saint Laurent", item: "Striped Cotton Shirt", price: "$890", href: "#" },
        { brand: "Khaite", item: "White Tailored Shorts", price: "$680", href: "#" },
        { brand: "Isabel Marant", item: "Leather Sandals", price: "$495", href: "#" },
        { brand: "Loewe", item: "Woven Tote", price: "$1,150", href: "#" },
        { brand: "Celine", item: "Sunglasses", price: "$490", href: "#" },
      ],
      mid: [
        { brand: "Frame", item: "Striped Cotton Shirt", price: "$228", href: "#" },
        { brand: "Re/Done", item: "White Tailored Shorts", price: "$245", href: "#" },
        { brand: "Ancient Greek Sandals", item: "Leather Sandals", price: "$215", href: "#" },
        { brand: "Dragon Diffusion", item: "Woven Tote", price: "$385", href: "#" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Striped Linen Shirt", price: "$69", href: "#" },
        { brand: "Reformation", item: "White Shorts", price: "$98", href: "#" },
        { brand: "Sam Edelman", item: "Slide Sandals", price: "$110", href: "#" },
        { brand: "Sézane", item: "Straw Tote", price: "$145", href: "#" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#" },
      ],
    },
  },
  {
    id: "neutral",
    name: "Camel & Cream Wander",
    category: "Quiet Luxury",
    description: "Camel linen shirt, cream trousers, polished leather sandals, a structured tan tote.",
    tiers: {
      designer: [
        { brand: "The Row", item: "Camel Linen Shirt", price: "$890", href: "#" },
        { brand: "Toteme", item: "Cream Trousers", price: "$520", href: "#" },
        { brand: "Hermès", item: "Oran Sandals", price: "$760", href: "#" },
        { brand: "The Row", item: "Tan Leather Tote", price: "$1,890", href: "#" },
        { brand: "Celine", item: "Sunglasses", price: "$490", href: "#" },
      ],
      mid: [
        { brand: "Anine Bing", item: "Camel Linen Shirt", price: "$200", href: "#" },
        { brand: "Anine Bing", item: "Cream Trousers", price: "$229", href: "#" },
        { brand: "Ancient Greek Sandals", item: "Leather Sandals", price: "$215", href: "#" },
        { brand: "Demellier", item: "Tan Leather Tote", price: "$495", href: "#" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Camel Linen Shirt", price: "$69", href: "#" },
        { brand: "Reformation", item: "Cream Trousers", price: "$148", href: "#" },
        { brand: "Sam Edelman", item: "Leather Sandals", price: "$110", href: "#" },
        { brand: "Mansur Gavriel", item: "Tan Tote", price: "$145", href: "#" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#" },
      ],
    },
  },
  {
    id: "texture",
    name: "Linen & Raffia",
    category: "Texture Forward",
    description: "Crinkled linen set, raffia tote, woven slides. Texture from head to toe.",
    tiers: {
      designer: [
        { brand: "Loro Piana", item: "Crinkled Linen Shirt", price: "$1,250", href: "#" },
        { brand: "Loro Piana", item: "Linen Bermuda Shorts", price: "$895", href: "#" },
        { brand: "Bottega Veneta", item: "Woven Slides", price: "$1,090", href: "#" },
        { brand: "Loewe", item: "Raffia Basket Tote", price: "$1,150", href: "#" },
        { brand: "Celine", item: "Sunglasses", price: "$490", href: "#" },
      ],
      mid: [
        { brand: "Vince", item: "Crinkled Linen Shirt", price: "$245", href: "#" },
        { brand: "Faithfull the Brand", item: "Linen Bermudas", price: "$179", href: "#" },
        { brand: "Dragon Diffusion", item: "Woven Slides", price: "$215", href: "#" },
        { brand: "Cult Gaia", item: "Raffia Tote", price: "$298", href: "#" },
        { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
      ],
      riviera: [
        { brand: "Mango", item: "Crinkled Linen Shirt", price: "$59", href: "#" },
        { brand: "H&M", item: "Linen Bermudas", price: "$49", href: "#" },
        { brand: "Mango", item: "Woven Slides", price: "$79", href: "#" },
        { brand: "Sézane", item: "Raffia Tote", price: "$145", href: "#" },
        { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#" },
      ],
    },
  },
];

const allLooks: LookEdit[][] = [day1Looks, day2Looks, day3Looks, day4Looks, day5Looks];

export const portofinoEdit: DayEdit[] = portofinoLooks.map((look, i) => ({
  day: look.day,
  title: look.title,
  subtitle: look.subtitle,
  image: look.image,
  looks: allLooks[i],
}));
