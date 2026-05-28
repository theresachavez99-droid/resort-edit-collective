export type Brand = {
  name: string;
  slug: string;
  blurb?: string;
};

export type BrandCategory = {
  title: string;
  description: string;
  brands: Brand[];
};

const b = (name: string, blurb?: string): Brand => ({
  name,
  slug: name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  blurb,
});

export const brandCategories: BrandCategory[] = [
  {
    title: "Resort Icons",
    description:
      "The labels that defined modern resort dressing — print-forward, romantic, unmistakably destination.",
    brands: [
      b("Zimmermann", "Romantic Australian-born resort, broderie & paneled prints."),
      b("Johanna Ortiz", "Latin maximalism, ruffles, painterly florals."),
      b("Alemais", "Folk-art prints with a collector's eye."),
      b("Farm Rio", "Rio-energy florals & tropical optimism."),
      b("Agua by Agua Bendita", "Embroidered Colombian craft, slow resort."),
    ],
  },
  {
    title: "Quiet Luxury",
    description:
      "Restrained palettes, exquisite fabric, the wardrobe of the woman who doesn't need a logo.",
    brands: [
      b("Toteme", "Scandinavian minimalism, perfect tailoring."),
      b("The Row", "The reference point for quiet luxury."),
      b("Khaite", "Sculptural American refinement."),
      b("Loro Piana", "Cashmere, linen, and considered ease."),
      b("Anine Bing", "Modern essentials with rock-and-roll polish."),
      b("Veronica Beard", "Tailoring built for travel."),
    ],
  },
  {
    title: "Swim & Beach Club",
    description:
      "Swim, coverups, and cabana-ready pieces for long lunches by the water.",
    brands: [
      b("Melissa Odabash", "The Riviera swim authority."),
      b("Eres", "French swimwear, sculpted and discreet."),
      b("Hunza G", "Crinkle one-pieces, iconic and forever."),
      b("Faithfull the Brand", "Bali-born sundresses & matching sets."),
      b("Posse", "Linen separates engineered for golden hour."),
      b("Sir.", "Australian softness, perfectly cut."),
    ],
  },
  {
    title: "Accessories",
    description: "Raffia, sculptural leather, hand-woven, and the heirloom jewelry that anchors a look.",
    brands: [
      b("Cult Gaia", "Sculptural raffia, resin, and resort-ready bags."),
      b("Dragon Diffusion", "Hand-woven Italian leather totes."),
      b("Ancient Greek Sandals", "Athens-made leather sandals, forever season."),
      b("Jennifer Fisher", "Statement gold, modern heirloom."),
      b("Celine", "Sunglasses, leather, the Riviera shorthand."),
    ],
  },
  {
    title: "Riviera Finds",
    description:
      "Discoveries from boutique racks, Italian ateliers, and the small labels we keep close.",
    brands: [
      b("Kivari", "Vintage-inspired Australian romance."),
      b("Sézane", "Parisian ease in seasonless palettes."),
      b("Maje", "French girl polish with a touch of edge."),
      b("Reformation", "Slip dresses & sundresses with conscience."),
      b("Mango", "The well-edited high-street resort piece."),
      b("Rails", "Soft shirting that travels everywhere."),
    ],
  },
];