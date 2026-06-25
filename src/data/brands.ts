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
    title: "Mediterranean Icons",
    description:
      "The Italian, Greek, and Iberian houses that wrote the language of resort — prints, ateliers, and seaside polish from Capri to Comporta.",
    brands: [
      b("Pucci", "Florentine prints, Capri-coded since 1947."),
      b("Etro", "Milanese paisleys and pan-Mediterranean color."),
      b("La DoubleJ", "Milan via Sicily — vintage prints, modern cut."),
      b("Missoni Mare", "Varese-knit zigzags, eternal Riviera."),
      b("Emporio Sirenuse", "Made in Positano, embroidered by the cliffside."),
      b("Loretta Caponi", "Florentine hand-embroidery, generational craft."),
      b("Loewe", "Madrid house, raffia and leather at its sharpest."),
      b("Dolce & Gabbana", "Sicilian Majolica, lemons, and baroque heat."),
      b("Borgo de Nor", "London-painted florals with a Mediterranean soul."),
    ],
  },
  {
    title: "Swim & Beach Club",
    description:
      "Swim, one-pieces, and bandeaus from the houses that dress the cabana lineup along Pampelonne, Paraggi, and Cala Jondal.",
    brands: [
      b("Melissa Odabash", "The Riviera swim authority."),
      b("Eres", "Paris-made, sculpted, discreet."),
      b("Oséree", "Milanese lamé and crochet — golden hour swim."),
      b("Hunza G", "Crinkle one-pieces, iconic and forever."),
      b("Maygel Coronel", "Venezuelan one-pieces with sculptural lines."),
      b("Marysia", "Scalloped silhouettes with a watercolor hand."),
      b("Matteau", "Australian minimalist swim and resort, quiet luxury."),
      b("Bond-Eye", "Australian recycled-knit minimalism."),
      b("MC2 Saint Barth", "St. Barth-born prints, vacation shorthand."),
      b("Stefania Frangista", "Athens swim with bohemian-glam embellishment."),
      b("Vilebrequin", "Saint-Tropez born — the Riviera in swim form."),
      b("Heidi Klein", "London resort, beach-to-bar polish."),
      b("Solid & Striped", "Clean American stripes, easy poolside luxe."),
      b("Vix Paula Hermanny", "Brazilian beach-to-lunch — refined swim, linen, crochet."),
    ],
  },
  {
    title: "Resortwear & Kaftans",
    description:
      "Sundresses, kaftans, and easy separates from the Latin, Australian, and European ateliers we travel with.",
    brands: [
      b("Johanna Ortiz", "Bogotá-born maximalism, painterly florals, ruffles."),
      b("Agua by Agua Bendita", "Embroidered Colombian craft, slow resort."),
      b("Silvia Tcherassi", "Cartagena couturier, breezy architectural cuts."),
      b("PatBO", "São Paulo embroidery and beachside glamour."),
      b("Zimmermann", "Romantic Australian-born resort, broderie & paneled prints."),
      b("Alemais", "Sydney folk-art prints with a collector's eye."),
      b("Faithfull the Brand", "Bali-born sundresses & matching sets."),
      b("Posse", "Linen separates engineered for golden hour."),
      b("SIR.", "Australian softness, perfectly cut."),
      b("Camilla", "Sydney kaftans, kaleidoscopic and unmistakable."),
      b("Devotion Twins", "Athens-made, hand-stitched Greek romance."),
      b("CeliaB", "Barcelona resort with hand-beaded craft."),
      b("Mimi Liberté", "Saint-Tropez-spirited French resort."),
      b("Alexandra Miro", "Capri-print cottons and embroidered ease."),
      b("Juliet Dunn", "Hand-block prints, sequins, barefoot luxe."),
      b("Cala de la Cruz", "Sun-bleached linen, Ibiza to Capri."),
      b("Hannah Artwear", "Collectible silk caftans, artist prints."),
      b("Charo Ruiz Ibiza", "Ibiza-made guipure lace, the white-dress authority."),
    ],
  },
  {
    title: "Accessories & Raffia",
    description:
      "Hand-woven baskets, sculptural raffia, and the Italian leather we carry from boat to bar.",
    brands: [
      b("Dragon Diffusion", "Hand-woven Italian leather totes."),
      b("Cult Gaia", "Sculptural raffia, resin, and resort-ready bags."),
      b("Heimat Atlantica", "Galician artisans, woven seashell totes."),
      b("Kayu", "Filipino-woven straw, San Francisco-edited."),
      b("Aranaz", "Manila-made beaded and embroidered minaudières."),
      b("Poolside", "Tropical straw totes, packable and pristine."),
      b("Lalingi", "Hand-painted Spanish raffia clutches."),
      b("Hereu", "Spanish woven leather, modern artisan."),
    ],
  },
  {
    title: "Jewelry We Pack",
    description:
      "Saltwater-proof gold, statement resin, and the heirlooms we layer from morning espresso through the late lunch.",
    brands: [
      b("Jennifer Meyer", "Soft Los Angeles gold, everyday fine."),
      b("Missoma", "London-born layering, gold-vermeil mainstays."),
      b("Gas Bijoux", "Saint-Tropez-made, sun-warmed Mediterranean shapes."),
      b("Ben-Amun", "Hand-set resin and pearl statement pieces."),
      b("Completedworks", "London sculptural fine, quietly modern."),
      b("Mejuri", "Toronto fine basics, the second-skin layer."),
      b("Brinker & Eliza", "Hand-knotted beads with a downtown wink."),
      b("Oradina", "14k everyday gold, travel-friendly."),
      b("Jenny Bird", "Modern Canadian sculpture for the lobe and wrist."),
    ],
  },
  {
    title: "Shoes for Long Lunches",
    description:
      "Greek leather, Spanish espadrilles, and the heel we keep in the carry-on for dinner at the port.",
    brands: [
      b("Ancient Greek Sandals", "Athens-made leather, forever season."),
      b("K. Jacques", "Saint-Tropez sandals hand-cut since 1933."),
      b("Aquazzura", "Florence-made heels with cinematic poise."),
      b("Castañer", "Catalan espadrilles, the original."),
      b("Emme Parsons", "Architectural sandals, made in Italy."),
      b("Loeffler Randall", "Bow-and-knot flats with editorial polish."),
      b("Biankina", "Italian-made resort flats in chalky pastels."),
      b("Amanu", "Custom Los Angeles leather, fitted to the foot."),
      b("Manolo Blahnik", "The Capri sandal, the Riviera heel."),
      b("René Caovilla", "Embellished, serpentine — made for candlelight."),
      b("Souliers Martinez", "Spanish espadrille wedges, hand-made in Madrid."),
    ],
  },
  {
    title: "Destination Finds",
    description:
      "Smaller ateliers and boutique discoveries from the racks we love — the labels we'd send a friend straight to.",
    brands: [
      b("Leo Lin", "Sydney atelier, painterly silk drama."),
      b("Alexis", "Miami resort with sculptural ruffles."),
      b("Mestiza", "Manila-rooted, hand-finished occasion."),
      b("Kivari", "Vintage-inspired Australian romance."),
      b("Farm Rio", "Rio-energy florals & tropical optimism."),
      b("Rhode", "Linen-forward New York for hot-weather travel."),
    ],
  },
];