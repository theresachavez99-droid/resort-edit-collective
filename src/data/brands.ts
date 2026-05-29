export type Brand = {
  name: string;
  slug: string;
  blurb?: string;
  destinations?: string[];
  bestFor?: string;
};

export type BrandCategory = {
  title: string;
  description: string;
  /** Image asset slug used by the brands page hero (e.g. "portofino"). */
  image?: string;
  brands: Brand[];
};

const b = (
  name: string,
  blurb?: string,
  extra: { destinations?: string[]; bestFor?: string } = {},
): Brand => ({
  name,
  slug: name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  blurb,
  ...extra,
});

export const brandCategories: BrandCategory[] = [
  {
    title: "Resort Icons",
    description:
      "The labels that defined modern resort dressing — print-forward, romantic, unmistakably destination.",
    image: "portofino",
    brands: [
      b("Zimmermann", "Romantic Australian-born resort, broderie & paneled prints.", { destinations: ["Portofino", "Capri", "Mallorca"], bestFor: "Garden parties & long lunches" }),
      b("Johanna Ortiz", "Latin maximalism, ruffles, painterly florals.", { destinations: ["Tulum", "St. Barths"], bestFor: "Sunset dinners" }),
      b("Alemais", "Folk-art prints with a collector's eye.", { destinations: ["Ibiza", "Mallorca"], bestFor: "Coastal villas" }),
      b("Farm Rio", "Rio-energy florals & tropical optimism.", { destinations: ["Tulum", "Phuket"], bestFor: "Beach club lunches" }),
      b("Agua by Agua Bendita", "Embroidered Colombian craft, slow resort.", { destinations: ["St. Barths", "Tulum"], bestFor: "Slow island weeks" }),
    ],
  },
  {
    title: "Quiet Luxury",
    description:
      "Restrained palettes, exquisite fabric, the wardrobe of the woman who doesn't need a logo.",
    image: "sttropez",
    brands: [
      b("Toteme", "Scandinavian minimalism, perfect tailoring.", { destinations: ["St. Tropez", "Portofino"], bestFor: "Travel days" }),
      b("The Row", "The reference point for quiet luxury.", { destinations: ["St. Barths", "Portofino"], bestFor: "Private dinners" }),
      b("Khaite", "Sculptural American refinement.", { destinations: ["Capri", "St. Tropez"], bestFor: "Evening aperitivo" }),
      b("Loro Piana", "Cashmere, linen, and considered ease.", { destinations: ["Portofino", "Mallorca"], bestFor: "Yacht days" }),
      b("Anine Bing", "Modern essentials with rock-and-roll polish.", { destinations: ["Ibiza", "St. Tropez"], bestFor: "Off-duty mornings" }),
      b("Veronica Beard", "Tailoring built for travel.", { destinations: ["Capri", "Portofino"], bestFor: "City-to-coast" }),
    ],
  },
  {
    title: "Swim & Beach Club",
    description:
      "Swim, coverups, and cabana-ready pieces for long lunches by the water.",
    image: "capri",
    brands: [
      b("Melissa Odabash", "The Riviera swim authority.", { destinations: ["Portofino", "Capri", "St. Tropez"], bestFor: "Cabana days" }),
      b("Eres", "French swimwear, sculpted and discreet.", { destinations: ["St. Tropez", "St. Barths"], bestFor: "Private beaches" }),
      b("Hunza G", "Crinkle one-pieces, iconic and forever.", { destinations: ["Ibiza", "Mallorca"], bestFor: "Pool clubs" }),
      b("Faithfull the Brand", "Bali-born sundresses & matching sets.", { destinations: ["Tulum", "Phuket"], bestFor: "Beachside lunches" }),
      b("Posse", "Linen separates engineered for golden hour.", { destinations: ["Mallorca", "Ibiza"], bestFor: "Sunset hours" }),
      b("Sir.", "Australian softness, perfectly cut.", { destinations: ["Portofino", "Capri"], bestFor: "Effortless evenings" }),
    ],
  },
  {
    title: "Accessories",
    description: "Raffia, sculptural leather, hand-woven, and the heirloom jewelry that anchors a look.",
    image: "mallorca",
    brands: [
      b("Cult Gaia", "Sculptural raffia, resin, and resort-ready bags.", { destinations: ["Capri", "Tulum"], bestFor: "Day-to-night carry" }),
      b("Dragon Diffusion", "Hand-woven Italian leather totes.", { destinations: ["Portofino", "Mallorca"], bestFor: "Market mornings" }),
      b("Ancient Greek Sandals", "Athens-made leather sandals, forever season.", { destinations: ["Mallorca", "Ibiza"], bestFor: "Cobblestones" }),
      b("Jennifer Fisher", "Statement gold, modern heirloom.", { destinations: ["St. Barths", "Portofino"], bestFor: "Every look" }),
      b("Celine", "Sunglasses, leather, the Riviera shorthand.", { destinations: ["St. Tropez", "Capri"], bestFor: "Harbor walks" }),
    ],
  },
  {
    title: "Riviera Finds",
    description:
      "Discoveries from boutique racks, Italian ateliers, and the small labels we keep close.",
    image: "ibiza",
    brands: [
      b("Kivari", "Vintage-inspired Australian romance.", { destinations: ["Ibiza", "Mallorca"], bestFor: "Boho weekends" }),
      b("Sézane", "Parisian ease in seasonless palettes.", { destinations: ["St. Tropez", "Portofino"], bestFor: "Café mornings" }),
      b("Maje", "French girl polish with a touch of edge.", { destinations: ["St. Tropez", "Capri"], bestFor: "Town-to-tavern" }),
      b("Reformation", "Slip dresses & sundresses with conscience.", { destinations: ["Tulum", "Ibiza"], bestFor: "Warm evenings" }),
      b("Mango", "The well-edited high-street resort piece.", { destinations: ["Mallorca", "Ibiza"], bestFor: "Capsule packing" }),
      b("Rails", "Soft shirting that travels everywhere.", { destinations: ["Portofino", "St. Barths"], bestFor: "Layered ease" }),
    ],
  },
];