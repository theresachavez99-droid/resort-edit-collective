/**
 * Seeded product library for the Resort Edit "More Like This" engine.
 *
 * Each entry is DNA-tagged (destination + style family + activity) so the
 * recommender can match by editorial energy, not brand. New products can be
 * appended here without touching the scorer.
 */

import type { ActivityTag, StyleFamily } from "@/data/styleDNA";

import millyLela from "@/assets/products/milly-lela-embroidered-midi.png.asset.json";
import millyLene from "@/assets/products/milly-lene-embroidered-mini.png.asset.json";
import farmRioPorcelain from "@/assets/products/farmrio-porcelain-garden-midi.png.asset.json";
import dgMajolica from "@/assets/products/dolce-gabbana-majolica-shirtdress.png.asset.json";
import aoGlinda from "@/assets/products/alice-olivia-glinda-majolica-mini.png.asset.json";
import aoMiriam from "@/assets/products/alice-olivia-miriam-linen-top.png.asset.json";

export type BrandTier = "familiar" | "discovery";

export interface ProductDNA {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: string;
  href: string;
  retailer: string;
  destinations: string[];
  styleFamilies: StyleFamily[];
  activityTags: ActivityTag[];
  brandTier: BrandTier;
  /** Optional pill rendered on the card, e.g. "Mediterranean Embroidery". */
  editorialLabel?: string;
  soldOut?: boolean;
}

export const PRODUCT_LIBRARY: ProductDNA[] = [
  // ── New seeded references (uploaded) ──────────────────────────────
  {
    id: "milly-lela-embroidered-midi",
    brand: "Milly",
    name: "Lela Embroidered Midi Dress",
    price: "$450",
    image: millyLela.url,
    href: "https://milly.com/products/lela-embroidered-midi-dress",
    retailer: "milly.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["mediterranean_embroidery", "blue_white_porcelain"],
    activityTags: ["market_morning", "beach_club_lunch", "shopping_afternoon"],
    brandTier: "discovery",
    editorialLabel: "Mediterranean Embroidery",
  },
  {
    id: "milly-lene-embroidered-mini",
    brand: "Milly",
    name: "Lene Embroidered Mini Dress",
    price: "$395",
    image: millyLene.url,
    href: "https://milly.com/products/lene-embroidered-mini-dress",
    retailer: "milly.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["mediterranean_embroidery", "blue_white_porcelain"],
    activityTags: ["beach_club_lunch", "arrival_day", "harbor_aperitivo"],
    brandTier: "discovery",
    editorialLabel: "Mediterranean Embroidery",
  },
  {
    id: "farmrio-porcelain-garden-midi",
    brand: "Farm Rio",
    name: "Off-White Porcelain Garden Cut-Out Midi Dress",
    price: "$298",
    image: farmRioPorcelain.url,
    href: "https://www.farmrio.com/products/off-white-porcelain-garden-cut-out-midi-dress",
    retailer: "farmrio.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["blue_white_porcelain", "destination_print"],
    activityTags: ["market_morning", "sunset_views", "shopping_afternoon", "harbor_aperitivo"],
    brandTier: "discovery",
    editorialLabel: "Porcelain Prints",
  },
  {
    id: "dolce-gabbana-majolica-shirtdress",
    brand: "Dolce & Gabbana",
    name: "Majolica-Print Twill Shirt Dress",
    price: "$4,645",
    image: dgMajolica.url,
    href: "https://www.farfetch.com/shopping/women/dolce-gabbana-majolica-print-twill-shirt-dress",
    retailer: "farfetch.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["blue_white_porcelain", "destination_print", "sunset_glamour"],
    activityTags: ["riviera_dinner", "sunset_views", "shopping_afternoon"],
    brandTier: "familiar",
    editorialLabel: "Majolica Print",
  },
  {
    id: "alice-olivia-glinda-majolica-mini",
    brand: "Alice + Olivia",
    name: "Glinda Majolica Tassel Tie-Strap Mini Dress",
    price: "$595",
    image: aoGlinda.url,
    href: "https://www.saksfifthavenue.com/product/alice-olivia-glinda-majolica-tassel-tie-strap-linen-blend-mini-dress",
    retailer: "saksfifthavenue.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["blue_white_porcelain", "sunset_glamour", "destination_print"],
    activityTags: ["sunset_views", "harbor_aperitivo", "riviera_dinner"],
    brandTier: "familiar",
    editorialLabel: "Majolica Print",
  },
  {
    id: "alice-olivia-miriam-linen-top",
    brand: "Alice + Olivia",
    name: "Miriam Linen Sweetheart Top",
    price: "$350",
    image: aoMiriam.url,
    href: "https://www.aliceandolivia.com/products/miriam-linen-sweetheart-top",
    retailer: "aliceandolivia.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["blue_white_porcelain", "destination_print"],
    activityTags: ["harbor_aperitivo", "beach_club_lunch", "shopping_afternoon"],
    brandTier: "familiar",
    editorialLabel: "Porcelain Prints",
  },
  // ── Re-tagged Resort Edit pieces (existing SVG product art) ───────
  {
    id: "eres-aquarelle-one-piece",
    brand: "Eres",
    name: "Aquarelle Square-Neck Swimsuit",
    price: "$465",
    image: "/src/assets/products/eres-aquarelle-one-piece.svg",
    href: "https://www.eresparis.com/us/aquarelle-one-piece",
    retailer: "eresparis.com",
    destinations: ["portofino", "capri", "st-tropez"],
    styleFamilies: ["yacht_swim"],
    activityTags: ["yacht_day", "pool_day", "beach_club_lunch"],
    brandTier: "familiar",
    editorialLabel: "Yacht Swim",
  },
  {
    id: "hunza-blue-bandeau",
    brand: "Hunza G",
    name: "Bandeau Crinkle Swimsuit",
    price: "$215",
    image: "/src/assets/products/hunza-blue-bandeau.svg",
    href: "https://hunzag.com",
    retailer: "hunzag.com",
    destinations: ["portofino", "capri", "st-tropez"],
    styleFamilies: ["yacht_swim", "coastal_knit"],
    activityTags: ["yacht_day", "pool_day"],
    brandTier: "discovery",
  },
  {
    id: "zimmermann-blue-pareo",
    brand: "Zimmermann",
    name: "Riviera Pareo",
    price: "$385",
    image: "/src/assets/products/zimmermann-blue-pareo.svg",
    href: "https://www.zimmermann.com",
    retailer: "zimmermann.com",
    destinations: ["portofino", "capri"],
    styleFamilies: ["yacht_swim", "riviera_floral", "blue_white_porcelain"],
    activityTags: ["yacht_day", "beach_club_lunch", "pool_day"],
    brandTier: "familiar",
  },
  {
    id: "hereu-woven-tote",
    brand: "Hereu",
    name: "Woven Leather Tote",
    price: "$520",
    image: "/src/assets/products/hereu-woven-tote.svg",
    href: "https://hereustudio.com",
    retailer: "hereustudio.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["raffia_luxury"],
    activityTags: ["market_morning", "beach_club_lunch", "shopping_afternoon", "arrival_day"],
    brandTier: "discovery",
    editorialLabel: "Raffia Luxury",
  },
  {
    id: "large-woven-raffia-tote-chestnut",
    brand: "Loewe",
    name: "Large Anagram Raffia Tote",
    price: "$1,250",
    image: "/src/assets/products/large-woven-raffia-tote-chestnut.svg",
    href: "https://www.loewe.com",
    retailer: "loewe.com",
    destinations: ["portofino", "capri", "amalfi", "st-tropez"],
    styleFamilies: ["raffia_luxury"],
    activityTags: ["beach_club_lunch", "market_morning", "shopping_afternoon", "arrival_day"],
    brandTier: "familiar",
    editorialLabel: "Raffia Luxury",
  },
  {
    id: "gianvito-portofino-sandal",
    brand: "Gianvito Rossi",
    name: "Portofino Leather Sandal",
    price: "$795",
    image: "/src/assets/products/gianvito-portofino-sandal.svg",
    href: "https://www.gianvitorossi.com",
    retailer: "gianvitorossi.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["harbor_aperitivo", "sunset_glamour"],
    activityTags: ["harbor_aperitivo", "sunset_views", "riviera_dinner", "shopping_afternoon"],
    brandTier: "familiar",
  },
  {
    id: "posse-ivory-romper",
    brand: "Posse",
    name: "Ivory Linen Romper",
    price: "$320",
    image: "/src/assets/products/posse-ivory-romper.svg",
    href: "https://posse.com",
    retailer: "posse.com",
    destinations: ["portofino", "capri"],
    styleFamilies: ["coastal_knit", "harbor_aperitivo"],
    activityTags: ["beach_club_lunch", "harbor_aperitivo", "arrival_day"],
    brandTier: "discovery",
  },
  {
    id: "etro-paisley-halter-maxi",
    brand: "Etro",
    name: "Paisley Halter Maxi Dress",
    price: "$1,890",
    image: "/src/assets/products/etro-paisley-halter-maxi.svg",
    href: "https://www.etro.com",
    retailer: "etro.com",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["sunset_glamour", "destination_print", "riviera_floral"],
    activityTags: ["riviera_dinner", "sunset_views"],
    brandTier: "familiar",
  },
  {
    id: "pucci-blue-kaftan",
    brand: "Pucci",
    name: "Marmo-Print Silk Kaftan",
    price: "$1,450",
    image: "/src/assets/products/pucci-blue-kaftan.svg",
    href: "https://www.emiliopucci.com",
    retailer: "emiliopucci.com",
    destinations: ["portofino", "capri"],
    styleFamilies: ["destination_print", "sunset_glamour", "riviera_floral"],
    activityTags: ["sunset_views", "harbor_aperitivo", "beach_club_lunch"],
    brandTier: "familiar",
  },
  {
    id: "melissa-odabash-micha-floral",
    brand: "Melissa Odabash",
    name: "Micha Floral Maxi",
    price: "$485",
    image: "/src/assets/products/melissa-odabash-micha-floral.svg",
    href: "https://www.odabash.com",
    retailer: "odabash.com",
    destinations: ["portofino", "capri"],
    styleFamilies: ["riviera_floral", "coastal_knit"],
    activityTags: ["beach_club_lunch", "pool_day", "harbor_aperitivo"],
    brandTier: "discovery",
    editorialLabel: "Riviera Florals",
  },
];