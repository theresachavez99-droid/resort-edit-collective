import yacht from "@/assets/generated/resort-edit/look-yacht-detail-thumb.jpg";
import yachtDay1HeroAsset from "@/assets/generated/resort-edit/look-yacht-day1-hero.png.asset.json";
const yachtDay1Hero = yachtDay1HeroAsset.url;
import poolLoungingShoppingAsset from "@/assets/uploads/portofino/pool-lounging-shopping-lilla-red-floral-splendido.png.asset.json";
const poolLoungingShopping = poolLoungingShoppingAsset.url;
import cira10Asset from "@/assets/uploads/cira/cira-10.png.asset.json";
import cira13Asset from "@/assets/uploads/cira/cira-13.png.asset.json";
import { getCanonicalDayImage } from "@/data/dayImageRegistry";
const beach = getCanonicalDayImage("day-2", "hero");

/**
 * Homepage itinerary data: 5 days, one complete look per day, broken into
 * categorized pieces. Daytime looks include sunglasses + hat/headscarf;
 * the evening look (Day 4) drops both. Bag-detail blocks are inline.
 *
 * Every link is outbound and must be rendered with
 * target="_blank" rel="nofollow sponsored noopener".
 */

export type HomeCategory =
  | "Outfit"
  | "Sandals"
  | "Bag"
  | "Earrings"
  | "Bracelet"
  | "Ring"
  | "Sunglasses"
  | "Hat/Headscarf";

export type HomeBagCategory =
  | "Scent"
  | "Lips"
  | "Glow"
  | "SPF"
  | "Body oil"
  | "Beach towel"
  | "Evening scent"
  | "Bold lip";

export type HomePiece = {
  category: HomeCategory;
  brand: string;
  item: string;
  price?: string;
  href: string;
};

export type HomeBagPiece = {
  category: HomeBagCategory;
  brand: string;
  item: string;
  href: string;
};

export type HomeDay = {
  n: 1 | 2 | 3 | 4 | 5;
  dayLabel: string;
  title: string;
  subtitle: string;
  caption: string;
  image: string;
  imageMobile?: string;
  imageRetina?: string;
  isEvening?: boolean;
  isWaterDay?: boolean;
  /** Moment slug + display label for the "Explore Moment" CTA. */
  momentSlug: string;
  momentLabel: string;
  outfit: HomePiece[];
  bag: HomeBagPiece[];
};

const dinner = cira10Asset.url;
const market = cira13Asset.url;

// Reusable bag-detail building blocks
const dayScent: HomeBagPiece = {
  category: "Scent",
  brand: "Maison Francis Kurkdjian",
  item: "Aqua Universalis Eau de Toilette",
  href: "https://www.sephora.com/product/aqua-universalis-P421891",
};
const dayLips: HomeBagPiece = {
  category: "Lips",
  brand: "Dior",
  item: "Addict Lip Glow — Pink 001",
  href: "https://www.sephora.com/product/dior-addict-lip-glow-P467767",
};
const dayGlow: HomeBagPiece = {
  category: "Glow",
  brand: "Drunk Elephant",
  item: "D-Bronzi Bronzing Drops",
  href: "https://www.sephora.com/product/drunk-elephant-d-bronzi-anti-pollution-sunshine-serum-P441106",
};
const daySpf: HomeBagPiece = {
  category: "SPF",
  brand: "Supergoop!",
  item: "Unseen Sunscreen SPF 40",
  href: "https://www.sephora.com/product/unseen-sunscreen-spf-40-P411680",
};
const bodyOil: HomeBagPiece = {
  category: "Body oil",
  brand: "Nuxe",
  item: "Huile Prodigieuse Multi-Purpose Dry Oil",
  href: "https://www.sephora.com/product/huile-prodigieuse-multi-usage-dry-oil-P461876",
};
const beachTowel: HomeBagPiece = {
  category: "Beach towel",
  brand: "Tekla",
  item: "Striped Organic Cotton Beach Towel",
  href: "https://www.net-a-porter.com/en-us/shop/product/tekla/lifestyle/beach-and-pool/striped-organic-cotton-beach-towel/",
};

const waterBag: HomeBagPiece[] = [dayScent, dayLips, dayGlow, daySpf, bodyOil, beachTowel];
const dayBag: HomeBagPiece[] = [dayScent, dayLips, dayGlow, daySpf];
const eveningBag: HomeBagPiece[] = [
  {
    category: "Evening scent",
    brand: "Tom Ford",
    item: "Black Orchid Eau de Parfum",
    href: "https://www.sephora.com/product/black-orchid-eau-de-parfum-P285651",
  },
  {
    category: "Bold lip",
    brand: "YSL Beauty",
    item: "Rouge Pur Couture Satin Lipstick — №1",
    href: "https://www.sephora.com/product/rouge-pur-couture-lipstick-P441129",
  },
  dayGlow,
];

export const homeDays: HomeDay[] = [
  {
    n: 1,
    dayLabel: "Day 1",
    title: "Yacht Day + Harbor Aperitivo",
    subtitle: "Open water, tan lines & hidden coves.",
    caption:
      "Drift past the lighthouse into glassy green water, then ease back to the marina as the piazzetta fills with candlelight and Negronis.",
    image: yachtDay1Hero,
    isWaterDay: true,
    momentSlug: "yacht-day",
    momentLabel: "Yacht Day",
    outfit: [
      {
        category: "Outfit",
        brand: "Dolce & Gabbana",
        item: "Majolica-Print Triangle Bikini",
        price: "$745",
        href: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/swimwear/majolica-print-triangle-bikini-multicolor-O8A02JONO19IP3TN.html",
      },
      {
        category: "Sandals",
        brand: "Biankina",
        item: "Marseille Espadrille Wedges — Beige Tan",
        price: "$295",
        href: "https://biankina.com/products/marseille-eco-canvas-vegan-espadrille-wedges-beige-tan?ref=Resortedit",
      },
      {
        category: "Bag",
        brand: "Dragon Diffusion",
        item: "Santa Croce Small Woven Leather Bag",
        price: "$485",
        href: "https://www.revolve.com/dragon-diffusion-santa-croce-small-bag/dp/DRAF-WY62/",
      },
      {
        category: "Earrings",
        brand: "Ben-Amun",
        item: "Hammered Disc Earrings",
        price: "$165",
        href: "https://www.revolve.com/ben-amun-hammered-disc-earrings/dp/BAMR-WL88/",
      },
      {
        category: "Bracelet",
        brand: "Jenny Bird",
        item: "Tomé Gold Cuff",
        price: "$128",
        href: "https://www.revolve.com/jenny-bird-tome-cuff/dp/JBER-WL98/",
      },
      {
        category: "Ring",
        brand: "Mejuri",
        item: "Dôme Ring — 14k Gold Vermeil",
        price: "$118",
        href: "https://mejuri.com/products/dome-ring",
      },
      {
        category: "Sunglasses",
        brand: "Krewe",
        item: "St. Louis Matte Oyster 24K",
        price: "$295",
        href: "https://www.saksfifthavenue.com/product/krewe-st-louis-sunglasses-0400017131385.html",
      },
      {
        category: "Hat/Headscarf",
        brand: "Dolce & Gabbana",
        item: "Majolica-Print Silk Twill Bandeau Scarf",
        price: "$245",
        href: "https://www.dolcegabbana.com/en-us/fashion/women/accessories/scarves-and-silks/majolica-print-silk-twill-bandeau-print-IS174WGDDHBHA3OO.html",
      },
    ],
    bag: waterBag,
  },
  {
    n: 2,
    dayLabel: "Day 2",
    title: "Beach Club + Long Lunch",
    subtitle: "Slow mornings, long lunches, seaside glamour.",
    caption:
      "Trade the morning for a cliffside cabana above Paraggi, then linger over a long lunch beneath the pines until the coastal path back into town turns gold.",
    image: beach,
    isWaterDay: true,
    momentSlug: "harbor-aperitivo",
    momentLabel: "Harbor Aperitivo",
    outfit: [
      {
        category: "Outfit",
        brand: "Agua by Agua Bendita",
        item: "Primavera Canna Bikini Set",
        price: "$350",
        href: "https://us.aguabyaguabendita.com/products/secreto-primavera-canna-bikini-top-19250",
      },
      {
        category: "Sandals",
        brand: "Ancient Greek Sandals",
        item: "Eleftheria Braided Leather Sandals",
        price: "$295",
        href: "https://www.farfetch.com/shopping/women/ancient-greek-sandals-eleftheria-braided-leather-sandals-item-17740915.aspx",
      },
      {
        category: "Bag",
        brand: "Hereu",
        item: "Castell Woven Leather Tote — Tan",
        price: "$695",
        href: "https://hereustudio.com/products/castell-woven-leather-tote-bag-tan",
      },
      {
        category: "Earrings",
        brand: "Jennifer Behr",
        item: "Tamsin Sculptural Gold Drops",
        price: "$325",
        href: "https://www.net-a-porter.com/en-us/shop/product/jennifer-behr/accessories/earrings/tamsin-gold-tone-earrings",
      },
      {
        category: "Bracelet",
        brand: "David Yurman",
        item: "Cable Classics Bracelet — 5mm",
        price: "$550",
        href: "https://www.davidyurman.com/products/cable-classics-bracelet-5mm",
      },
      {
        category: "Ring",
        brand: "Missoma",
        item: "Molten Heavy Stacking Ring — Gold",
        price: "$258",
        href: "https://www.shopbop.com/molten-heavy-stacking-ring-missoma/vp/v=1/1576781299.htm",
      },
      {
        category: "Sunglasses",
        brand: "Krewe",
        item: "Sasha Selene 24K",
        price: "$295",
        href: "https://www.krewe.com/products/sasha-selene-24k-sunglasses",
      },
      {
        category: "Hat/Headscarf",
        brand: "Janessa Leoné",
        item: "Klint Wide-Brim Straw — Sand",
        price: "$224",
        href: "https://www.net-a-porter.com/en-us/shop/product/janessa-leone/accessories/sun-hats/klint-leather-trimmed-straw-sunhat/",
      },
    ],
    bag: waterBag,
  },
  {
    n: 3,
    dayLabel: "Day 3",
    title: "Pool Lounging + Shopping",
    subtitle: "Splendido pool hours, then Via Roma boutiques.",
    caption:
      "Relaxed poolside hours, boutique discoveries, and an afternoon that drifts effortlessly into town.",
    image: poolLoungingShopping,
    isWaterDay: true,
    momentSlug: "pool-lounging",
    momentLabel: "Pool Lounging + Shopping",
    outfit: [
      {
        category: "Outfit",
        brand: "Zimmermann",
        item: "Illumination Cotton-Silk Top & Skirt Set",
        price: "$1,220",
        href: "https://www.net-a-porter.com/en-us/shop/product/zimmermann/clothing/blouses/illumination-cropped-cotton-and-silk-blend-blouse/46376663162848181",
      },
      {
        category: "Sandals",
        brand: "Gianvito Rossi",
        item: "Portofino 105 Leather Sandals",
        price: "$895",
        href: "https://www.mytheresa.com/us/en/women/gianvito-rossi-portofino-105-leather-sandals-p00432123",
      },
      {
        category: "Bag",
        brand: "Loro Piana",
        item: "Extra Pocket Bag",
        price: "$3,450",
        href: "https://us.loropiana.com/en/p/woman/bags-FAO7203",
      },
      {
        category: "Earrings",
        brand: "Jennifer Fisher",
        item: "Natasha Mini Hoops, 1-Inch",
        price: "$275",
        href: "https://www.nordstrom.com/s/natasha-mini-hoops-1-inch-nordstrom-exclusive/7909464",
      },
      {
        category: "Bracelet",
        brand: "Monica Vinader",
        item: "Alta Capture Charm Bracelet — 18k Gold Vermeil",
        price: "$295",
        href: "https://www.monicavinader.com/us/alta-capture-charm-bracelet/gold-vermeil-alta-charm-bracelet",
      },
      {
        category: "Ring",
        brand: "Mejuri",
        item: "Dôme Ring — 14k Gold Vermeil",
        price: "$118",
        href: "https://mejuri.com/products/dome-ring",
      },
      {
        category: "Sunglasses",
        brand: "Krewe",
        item: "Sahara 24K",
        price: "$295",
        href: "https://www.krewe.com/products/sahara-24k-sunglasses",
      },
      {
        category: "Hat/Headscarf",
        brand: "Lack of Color",
        item: "Paloma Sun Boater",
        price: "$129",
        href: "https://us.lackofcolor.com/products/palomas-boater-natural",
      },
    ],
    bag: waterBag,
  },
  {
    n: 4,
    dayLabel: "Day 4",
    title: "Sunset Cocktails + Dinner",
    subtitle: "Golden hour, candlelight, harbor glow.",
    caption:
      "A silk dress, a rooftop cocktail high above the cliffs, and a long Italian dinner unfolding as the lights of the harbor blink on one by one.",
    image: dinner,
    isEvening: true,
    momentSlug: "riviera-dinner",
    momentLabel: "Riviera Dinner",
    outfit: [
      {
        category: "Outfit",
        brand: "Retrofête",
        item: "Anat Sequin Dress in Eucalyptus",
        price: "$695",
        href: "https://www.revolve.com/retrofete-anat-dress-in-eucalyptus/dp/ROFR-WD993/",
      },
      {
        category: "Sandals",
        brand: "Aquazzura",
        item: "Tequila Crystal Sandal — Powder Pink",
        price: "$1,295",
        href: "https://www.saksfifthavenue.com/product/Aquazzura-Tequila-Crystal-Embellished-Leather-Sandals-0400099378466.html",
      },
      {
        category: "Bag",
        brand: "Loeffler Randall",
        item: "Rayne Pleated Bow Frame Clutch — Champagne",
        price: "$395",
        href: "https://www.bloomingdales.com/shop/product/loeffler-randall-rayne-small-pleated-bow-frame-clutch?ID=4607288",
      },
      {
        category: "Earrings",
        brand: "Kendra Scott",
        item: "Daphne Gold Drops in Ivory Mother-of-Pearl",
        price: "$78",
        href: "https://www.kendrascott.com/jewelry/earrings/daphne-gold-drop-earrings-in-ivory-mother-of-pearl/196088555492.html",
      },
      {
        category: "Bracelet",
        brand: "David Yurman",
        item: "Cable Classics 18k Yellow Gold 4mm",
        price: "$595",
        href: "https://www.nordstrom.com/s/david-yurman-cable-classics-sterling-silver-18k-yellow-gold-bracelet-4mm/3625630",
      },
      {
        category: "Ring",
        brand: "Mejuri",
        item: "Dôme Ring — Sterling Silver",
        price: "$118",
        href: "https://mejuri.com/products/dome-ring",
      },
    ],
    bag: eveningBag,
  },
  {
    n: 5,
    dayLabel: "Day 5",
    title: "Espresso Morning + Coastal Goodbyes",
    subtitle: "Espresso, linen, and one long last lunch.",
    caption:
      "Climb the path to Castello Brown for one last look over the harbor, then drift down to a waterside table where lunch turns into the kind of farewell that already feels like a return.",
    image: market,
    momentSlug: "espresso-morning",
    momentLabel: "Espresso Morning",
    outfit: [
      {
        category: "Outfit",
        brand: "Posse",
        item: "Ari Striped Crop Top — Blue",
        price: "$229",
        href: "https://www.mytheresa.com/us/en/women/posse-ari-striped-crop-top-blue-p01078791",
      },
      {
        category: "Sandals",
        brand: "Loeffler Randall",
        item: "Daphne Pleated Raffia Slide — Natural",
        price: "$295",
        href: "https://www.shopbop.com/daphne-pleated-knot-flat-sandal/vp/v=1/1577497953.htm",
      },
      {
        category: "Bag",
        brand: "Dragon Diffusion",
        item: "Santa Croce Woven Leather Tote — Tan",
        price: "$565",
        href: "https://dragondiffusion.com/products/santa-croce-tan",
      },
      {
        category: "Earrings",
        brand: "Jennifer Fisher",
        item: "Natasha Mini Hoops, 1-Inch",
        price: "$275",
        href: "https://www.nordstrom.com/s/natasha-mini-hoops-1-inch-nordstrom-exclusive/7909464",
      },
      {
        category: "Bracelet",
        brand: "Monica Vinader",
        item: "Alta Capture Charm Bracelet",
        price: "$295",
        href: "https://www.monicavinader.com/us/alta-capture-charm-bracelet/gold-vermeil-alta-charm-bracelet",
      },
      {
        category: "Ring",
        brand: "Mejuri",
        item: "Dôme Ring — 14k Gold Vermeil",
        price: "$118",
        href: "https://mejuri.com/products/dome-ring",
      },
      {
        category: "Sunglasses",
        brand: "Celine",
        item: "Triomphe 01 Sunglasses — Black",
        price: "$490",
        href: "https://www.mytheresa.com/us/en/women/celine-eyewear-triomphe-01-oval-sunglasses-black-p00576284",
      },
      {
        category: "Hat/Headscarf",
        brand: "Lack of Color",
        item: "Paloma Sun Boater",
        price: "$129",
        href: "https://us.lackofcolor.com/products/palomas-boater-natural",
      },
    ],
    bag: dayBag,
  },
];