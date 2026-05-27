import { portofinoLooks, type ShopItem } from "./portofino";

export type Tier = "designer" | "mid" | "riviera";

export type TierMeta = {
  id: Tier;
  label: string;
  tagline: string;
  range: string;
};

export const tiers: TierMeta[] = [
  { id: "designer", label: "Designer Edit", tagline: "Investment luxury pieces.", range: "$300+" },
  { id: "mid", label: "Mid-Luxe Edit", tagline: "Elevated resort style at modern prices.", range: "$100–400" },
  { id: "riviera", label: "Riviera Finds", tagline: "Curated accessible alternatives.", range: "Under $150" },
];

type DayEdit = {
  day: string;
  title: string;
  subtitle: string;
  image: string;
  tiers: Record<Tier, ShopItem[]>;
};

// Tiered translations of each day's look — same aesthetic, different investment.
const tieredShop: Array<Record<Tier, ShopItem[]>> = [
  // Day 1 — Yacht Day
  {
    designer: [
      { brand: "Eres", item: "Bandeau Bikini Top", price: "$385", href: "#" },
      { brand: "Johanna Ortiz", item: "Silk Sarong", price: "$590", href: "#" },
      { brand: "Loewe", item: "Raffia Basket Tote", price: "$1,150", href: "#" },
      { brand: "Celine", item: "Triomphe Sunglasses", price: "$490", href: "#" },
      { brand: "Jennifer Fisher", item: "Gold Hoop Earrings", price: "$525", href: "#" },
    ],
    mid: [
      { brand: "Melissa Odabash", item: "Bandeau Top", price: "$165", href: "#" },
      { brand: "Faithfull the Brand", item: "Cotton Sarong", price: "$169", href: "#" },
      { brand: "Cult Gaia", item: "Mini Raffia Tote", price: "$298", href: "#" },
      { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
      { brand: "Missoma", item: "Chunky Hoops", price: "$185", href: "#" },
    ],
    riviera: [
      { brand: "Hunza G", item: "Bandeau Bikini", price: "$95", href: "#" },
      { brand: "Mango", item: "Linen Sarong", price: "$59", href: "#" },
      { brand: "Sézane", item: "Straw Tote", price: "$145", href: "#" },
      { brand: "Quay", item: "Oversized Sunglasses", price: "$75", href: "#" },
      { brand: "Mejuri", item: "Bold Hoops", price: "$98", href: "#" },
    ],
  },
  // Day 2 — Beach Cabana
  {
    designer: [
      { brand: "Dolce & Gabbana", item: "Lemon Print Kaftan", price: "$1,895", href: "#" },
      { brand: "Dolce & Gabbana", item: "Silk Headscarf", price: "$395", href: "#" },
      { brand: "Loewe", item: "Anagram Raffia Tote", price: "$1,250", href: "#" },
      { brand: "Saint Laurent", item: "Sunglasses", price: "$465", href: "#" },
      { brand: "Tiffany & Co.", item: "Shell Pendant", price: "$650", href: "#" },
    ],
    mid: [
      { brand: "Farm Rio", item: "Lemon Print Kaftan", price: "$245", href: "#" },
      { brand: "Anine Bing", item: "Silk Scarf", price: "$120", href: "#" },
      { brand: "Loeffler Randall", item: "Raffia Tote", price: "$350", href: "#" },
      { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
      { brand: "Shashi", item: "Shell Necklace", price: "$98", href: "#" },
    ],
    riviera: [
      { brand: "H&M", item: "Printed Kaftan", price: "$59", href: "#" },
      { brand: "Sézane", item: "Square Scarf", price: "$65", href: "#" },
      { brand: "Mango", item: "Woven Tote", price: "$79", href: "#" },
      { brand: "Le Specs", item: "Sunglasses", price: "$89", href: "#" },
      { brand: "Brinker & Eliza", item: "Shell Strand", price: "$110", href: "#" },
    ],
  },
  // Day 3 — Day Club
  {
    designer: [
      { brand: "Zimmermann", item: "Printed Shirtdress", price: "$1,250", href: "#" },
      { brand: "Christian Louboutin", item: "Sandals", price: "$895", href: "#" },
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
  // Day 4 — Dinner in Portofino
  {
    designer: [
      { brand: "Galvan", item: "Silk Halter Maxi", price: "$1,495", href: "#" },
      { brand: "Aquazzura", item: "Nudist Sandal", price: "$895", href: "#" },
      { brand: "Saint Laurent", item: "Kate Chain Wallet", price: "$1,650", href: "#" },
      { brand: "Jennifer Fisher", item: "Drop Earrings", price: "$525", href: "#" },
      { brand: "Cartier", item: "Love Bracelet", price: "$7,350", href: "#" },
    ],
    mid: [
      { brand: "Alemais", item: "Bonita Silk Maxi", price: "$595", href: "#" },
      { brand: "Schutz", item: "Strappy Heel", price: "$198", href: "#" },
      { brand: "Demellier", item: "Mini Chain Bag", price: "$495", href: "#" },
      { brand: "Jennifer Behr", item: "Crystal Drops", price: "$285", href: "#" },
      { brand: "Monica Vinader", item: "Gold Cuff", price: "$295", href: "#" },
    ],
    riviera: [
      { brand: "Reformation", item: "Halter Slip Dress", price: "$148", href: "#" },
      { brand: "Sam Edelman", item: "Strappy Heel", price: "$140", href: "#" },
      { brand: "Mango", item: "Mini Shoulder Bag", price: "$89", href: "#" },
      { brand: "BaubleBar", item: "Crystal Drops", price: "$58", href: "#" },
      { brand: "Mejuri", item: "Gold Cuff", price: "$128", href: "#" },
    ],
  },
  // Day 5 — Exploring the Town
  {
    designer: [
      { brand: "The Row", item: "Striped Linen Shirt", price: "$890", href: "#" },
      { brand: "Khaite", item: "Tailored Shorts", price: "$680", href: "#" },
      { brand: "Isabel Marant", item: "Leather Sandals", price: "$495", href: "#" },
      { brand: "Loewe", item: "Woven Tote", price: "$1,150", href: "#" },
      { brand: "Celine", item: "Sunglasses", price: "$490", href: "#" },
    ],
    mid: [
      { brand: "Anine Bing", item: "Linen Shirt", price: "$200", href: "#" },
      { brand: "Re/Done", item: "Tailored Shorts", price: "$245", href: "#" },
      { brand: "Ancient Greek Sandals", item: "Leather Sandals", price: "$215", href: "#" },
      { brand: "Dragon Diffusion", item: "Woven Tote", price: "$385", href: "#" },
      { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
    ],
    riviera: [
      { brand: "Mango", item: "Striped Linen Shirt", price: "$69", href: "#" },
      { brand: "Reformation", item: "Linen Shorts", price: "$98", href: "#" },
      { brand: "Sam Edelman", item: "Slide Sandals", price: "$110", href: "#" },
      { brand: "Sézane", item: "Straw Tote", price: "$145", href: "#" },
      { brand: "DIFF", item: "Sunglasses", price: "$95", href: "#" },
    ],
  },
];

export const portofinoEdit: DayEdit[] = portofinoLooks.map((look, i) => ({
  day: look.day,
  title: look.title,
  subtitle: look.subtitle,
  image: look.image,
  tiers: tieredShop[i],
}));