export type Brand = {
  name: string;
  slug: string;
  blurb?: string;
  /** Editorial: moments where this brand shines (rendered as eyebrow row). */
  bestFor?: string[];
  /** Editorial: silhouettes/materials Resort Edit loves at this house. */
  resortEditLoves?: string[];
};

export type BrandCategory = {
  title: string;
  description: string;
  brands: Brand[];
};

const b = (
  name: string,
  blurb?: string,
  extras?: { bestFor?: string[]; resortEditLoves?: string[]; slug?: string },
): Brand => ({
  name,
  slug:
    extras?.slug ??
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  blurb,
  ...(extras?.bestFor ? { bestFor: extras.bestFor } : {}),
  ...(extras?.resortEditLoves ? { resortEditLoves: extras.resortEditLoves } : {}),
});

export const brandCategories: BrandCategory[] = [
  {
    title: "Mediterranean Icons",
    description:
      "The houses that taught the world how to dress for the Mediterranean — from Capri terraces and Aeolian boats to the quiet glamour of the Italian Riviera and the white-washed coastlines of the Aegean.",
    brands: [
      b("Pucci", "Florentine prints, Capri-coded since 1947.", { bestFor: ["Harbor Aperitivo", "Riviera Dinner"] }),
      b("Etro", "Milanese paisleys and pan-Mediterranean color.", { resortEditLoves: ["Paisley silks", "Printed kaftans"] }),
      b("La DoubleJ", "Milan via Sicily — vintage prints, modern cut.", { bestFor: ["Long Lunch", "Harbor Aperitivo"] }),
      b("Missoni", "The Varese knit house — chevrons, color, Italian heritage resort.", { resortEditLoves: ["Chevron knits", "Crochet swim"] }),
      b("Missoni Mare", "Varese-knit zigzags, eternal Riviera.", { bestFor: ["Pool Lounging", "Beach Club"] }),
      b("Callas Milano", "Quiet Italian luxury — exquisite tailoring built for the long weekend.", { bestFor: ["Arrival", "Long Lunch", "Riviera Dinner"], resortEditLoves: ["Linen tailoring", "Architectural separates"] }),
      b("Emporio Sirenuse", "Made in Positano, embroidered by the cliffside.", { resortEditLoves: ["Hand embroidery", "Cotton voile"] }),
      b("Loretta Caponi", "Florentine hand-embroidery, generational craft.", { resortEditLoves: ["Embroidered cotton", "Sleepwear-as-daywear"] }),
      b("Loewe", "Madrid house, raffia and leather at its sharpest.", { bestFor: ["Long Lunch", "Riviera Dinner"], resortEditLoves: ["Raffia craftsmanship", "Sculptural leather"] }),
      b("Dolce & Gabbana", "Sicilian Majolica, lemons, and baroque heat.", { bestFor: ["Riviera Dinner"] }),
      b("Borgo de Nor", "London-painted florals with a Mediterranean soul.", { resortEditLoves: ["Painterly florals", "Tea-length silk"] }),
    ],
  },
  {
    title: "Swim & Beach Club",
    description:
      "The swim houses we return to every season — beautiful one-pieces, refined bikinis, and elevated textures designed for yachts, beach clubs, and long afternoons by the sea.",
    brands: [
      b("Melissa Odabash", "The Riviera swim authority.", { bestFor: ["Beach Club", "Yacht Day"] }),
      b("Eres", "Paris-made, sculpted, discreet.", { resortEditLoves: ["Sculptural one-pieces", "Quiet luxury swim"] }),
      b("Karla Colletto", "Architectural American swim — sculptural cuts, retro Riviera necklines.", { resortEditLoves: ["Architectural one-pieces", "Retro necklines"] }),
      b("Oséree", "Milanese lamé and crochet — golden hour swim.", { bestFor: ["Yacht Day", "Sunset Cocktails"] }),
      b("Maygel Coronel", "Venezuelan one-pieces with sculptural lines.", { resortEditLoves: ["Sculptural swim", "Draped one-pieces"] }),
      b("Marysia", "Scalloped silhouettes with a watercolor hand.", { resortEditLoves: ["Scallop swim", "Painterly prints"] }),
      b("Matteau", "Australian minimalist swim and resort, quiet luxury.", { bestFor: ["Pool Lounging", "Beach Club"] }),
      b("Stefania Frangista", "Athens swim with bohemian-glam embellishment.", { resortEditLoves: ["Embellished swim"] }),
      b("Vilebrequin", "Saint-Tropez born — the Riviera in swim form.", { bestFor: ["Beach Club"] }),
      b("Heidi Klein", "London resort, beach-to-bar polish."),
      b("Vix Paula Hermanny", "Brazilian beach-to-lunch — refined swim, linen, crochet.", { bestFor: ["Yacht Day", "Long Lunch"], resortEditLoves: ["Refined swim", "Crochet separates"] }),
    ],
  },
  {
    title: "Resortwear & Kaftans",
    description:
      "The sundresses, kaftans, and easy separates we pack first — from Bogotá embroidery houses to Sydney ateliers and the quiet linen masters of the Mediterranean.",
    brands: [
      b("Johanna Ortiz", "Bogotá-born maximalism, painterly florals, ruffles.", { resortEditLoves: ["Painterly florals", "Architectural ruffles"] }),
      b("Agua by Agua Bendita", "Embroidered Colombian craft, slow resort.", { resortEditLoves: ["Hand embroidery", "Slow craftsmanship"] }),
      b("Silvia Tcherassi", "Cartagena couturier, breezy architectural cuts.", { bestFor: ["Long Lunch", "Riviera Dinner"] }),
      b("PatBO", "São Paulo embroidery and beachside glamour.", { resortEditLoves: ["Beaded embroidery"] }),
      b("Zimmermann", "Romantic Australian-born resort, broderie & paneled prints.", { bestFor: ["Long Lunch", "Harbor Aperitivo"], resortEditLoves: ["Broderie", "Paneled prints"] }),
      b("Alemais", "Sydney folk-art prints with a collector's eye.", { resortEditLoves: ["Collector prints"] }),
      b("Faithfull the Brand", "Bali-born sundresses & matching sets."),
      b("Posse", "Linen separates engineered for golden hour.", { resortEditLoves: ["Linen separates", "Linen sets"] }),
      b("SIR.", "Australian softness, perfectly cut.", { bestFor: ["Riviera Dinner"] }),
      b("Camilla", "Riotous silk kaftans — print as celebration.", { resortEditLoves: ["Embellished kaftans"] }),
      b("Devotion Twins", "Athens-made, hand-stitched Greek romance."),
      b("CeliaB", "Barcelona resort with hand-beaded craft."),
      b("Mimi Liberté", "Saint-Tropez-spirited French resort."),
      b("Alexandra Miro", "Capri-print cottons and embroidered ease.", { bestFor: ["Pool Lounging", "Beach Club"], resortEditLoves: ["Embroidered cotton"] }),
      b("Juliet Dunn", "Hand-block prints, sequins, barefoot luxe."),
      b("Cala de la Cruz", "Sun-bleached linen, Ibiza to Capri.", { resortEditLoves: ["Linen dresses"] }),
      b("Hannah Artwear", "Collectible silk caftans, artist prints.", { resortEditLoves: ["Silk caftans", "Artist prints"] }),
      b("Charo Ruiz Ibiza", "Ibiza-made guipure lace, the white-dress authority.", { resortEditLoves: ["Guipure lace", "White dresses"] }),
      b("Cara Cara", "New York-designed, Jaipur-crafted resort — hand-block prints, cotton eyelet and airy midi silhouettes for warm-weather lunches.", { bestFor: ["Long Lunch", "Exploring"], resortEditLoves: ["Cotton eyelet", "Hand-block prints"] }),
      b("Poupette St Barth", "Saint Barths-born prints and bohemian glamour — sun-warmed silks and easy resort minis for beach clubs and long afternoons on the water.", { bestFor: ["Beach Club", "Yacht Day"], resortEditLoves: ["Printed silk", "Ruffled minis"] }),
    ],
  },
  {
    title: "Accessories & Raffia",
    description:
      "The hand-woven baskets, sculptural raffia, and Italian leather we carry from the boat to the bar — the small luxuries that finish every Resort Edit look.",
    brands: [
      b("Dragon Diffusion", "Hand-woven Italian leather totes.", { resortEditLoves: ["Woven leather"] }),
      b("Cult Gaia", "Sculptural raffia, resin, and resort-ready bags.", { resortEditLoves: ["Sculptural raffia"] }),
      b("Heimat Atlantica", "Galician artisans, woven seashell totes.", { resortEditLoves: ["Shell embellishment"] }),
      b("Kayu", "Filipino-woven straw, San Francisco-edited."),
      b("Aranaz", "Manila-made beaded and embroidered minaudières.", { resortEditLoves: ["Beaded minaudières"] }),
      b("Lalingi", "Hand-painted Spanish raffia clutches.", { resortEditLoves: ["Hand-painted raffia"] }),
      b("Hereu", "Spanish woven leather, modern artisan.", { bestFor: ["Long Lunch", "Riviera Dinner"] }),
      b("Bottega Veneta", "Intrecciato in raffia and leather — craft at house scale."),
      b("Chloé", "The Summer Banana family — soft house luxury, woven and warm."),
      b("STAUD", "Architectural bags, clean-lined sets — the modern resort essential."),
    ],
  },
  {
    title: "Jewelry",
    description:
      "Saltwater-proof gold, statement resin, and the heirlooms we layer from morning espresso through long lunches and the table at the harbor.",
    brands: [
      b("Marco Bicego", "Hand-engraved Milanese gold — delicate by day, one perfect cuff by night."),
      b("Alexis Bittar", "The sculptural cuff, perfected — lucite and gold with a point of view."),
      b("EF Collection", "Fine 14k for every day of the trip — thin chains, diamond bezels."),
      b("Jennifer Meyer", "Soft Los Angeles gold, everyday fine."),
      b("Missoma", "London-born layering, gold-vermeil mainstays."),
      b("Gas Bijoux", "Saint-Tropez-made, sun-warmed Mediterranean shapes.", { resortEditLoves: ["Sun-warmed gold"] }),
      b("Ben-Amun", "Hand-set resin and pearl statement pieces."),
      b("Completedworks", "London sculptural fine, quietly modern."),
      b("Brinker & Eliza", "Hand-knotted beads with a downtown wink."),
      b("Jenny Bird", "Modern Canadian sculpture for the lobe and wrist."),
    ],
  },
  {
    title: "Evening & Occasion",
    description:
      "When golden hour turns to evening — color, shine, and a heel that means it.",
    brands: [
      b("Christopher John Rogers", "Color at full volume — the boldest silhouettes in American fashion."),
      b("Retrofête", "Orchid-hued glamour — sequins and silk for golden hour."),
      b("Self-Portrait", "Guipure lace in saturated color — occasion dressing, recolored."),
      b("Manolo Blahnik", "The evening sandal, eternal — delicate straps, jewel tones.", { bestFor: ["Riviera Dinner"] }),
      b("Gianvito Rossi", "Italian precision — the kitten heel that survives the cobblestones."),
    ],
  },
  {
    title: "Resort Footwear",
    description:
      "Greek leather sandals, Spanish espadrilles, and the dinner heel we keep in the carry-on — the footwear that takes a Resort Edit look from morning market to the table at the port.",
    brands: [
      b("Ancient Greek Sandals", "Athens-made leather, forever season.", { resortEditLoves: ["Greek leather"] }),
      b("K. Jacques", "Saint-Tropez sandals hand-cut since 1933.", { bestFor: ["Beach Club", "Long Lunch"] }),
      b("Aquazzura", "Florence-made heels with cinematic poise.", { bestFor: ["Riviera Dinner"] }),
      b("Castañer", "Catalan espadrilles, the original.", { resortEditLoves: ["Espadrille wedges"] }),
      b("Emme Parsons", "Architectural sandals, made in Italy.", { resortEditLoves: ["Architectural sandals"] }),
      b("Loeffler Randall", "Bow-and-knot flats with editorial polish."),
      b("Biankina", "Italian-made resort flats in chalky pastels."),
      b("Amanu", "Custom Los Angeles leather, fitted to the foot."),
      b("René Caovilla", "Embellished, serpentine — made for candlelight.", { bestFor: ["Riviera Dinner"] }),
      b("Souliers Martinez", "Spanish espadrille wedges, hand-made in Madrid."),
    ],
  },
  {
    title: "Beyond the Riviera",
    description:
      "The labels that extend Resort Edit beyond the Mediterranean — joyful prints, tropical optimism, and modern destination dressing from São Paulo to Sydney to New York.",
    brands: [
      b("Farm Rio", "Rio-energy florals and tropical optimism — destination dressing with a smile.", { bestFor: ["Pool Lounging", "Exploring"], resortEditLoves: ["Tropical prints", "Joyful kaftans"] }),
      b("Leo Lin", "Sydney atelier, painterly silk drama.", { resortEditLoves: ["Painterly silks"] }),
      b("Alexis", "Miami resort with sculptural ruffles."),
      b("Mestiza", "Manila-rooted, hand-finished occasion."),
      b("Rhode", "Linen-forward New York for hot-weather travel.", { resortEditLoves: ["Linen separates"] }),
      b("Cinq à Sept", "Feminine cocktail silhouettes and saturated color for the dressier side of resort.", { bestFor: ["Long Lunch", "Riviera Dinner"], slug: "cinq-a-sept" }),
      b("Veronica Beard", "Polished tailoring and versatile separates for travel days, town lunches and cooler evenings.", { bestFor: ["Arrival", "Long Lunch"], resortEditLoves: ["Tailored jackets", "Silk blouses"] }),
      b("L'AGENCE", "Polished LA tailoring — silk, lace insets, the perfect blazer."),
      b("SIMKHAI", "Sculpted contemporary — draping with intent."),
    ],
  },
];