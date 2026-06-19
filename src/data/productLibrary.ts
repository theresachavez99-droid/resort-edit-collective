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

/**
 * Affiliate channel for a product listing.
 * - "affiliate": approved affiliate partner (MyTheresa, Net-a-Porter, Saks, etc.)
 * - "brand_direct": link goes to the brand's own site (no affiliate revenue);
 *   only acceptable when no affiliate listing exists for the piece.
 */
export type RetailerChannel = "affiliate" | "brand_direct";

/**
 * Approved affiliate partner retailers. Listings from these domains are
 * prioritized in the More Like This recommender (see src/lib/moreLikeThis.ts).
 */
export const AFFILIATE_PARTNERS = new Set<string>([
  "mytheresa.com",
  "net-a-porter.com",
  "saksfifthavenue.com",
  "neimanmarcus.com",
  "bergdorfgoodman.com",
  "shopbop.com",
  "revolve.com",
  "bloomingdales.com",
  "nordstrom.com",
  "luisaviaroma.com",
  "modaoperandi.com",
  "harrods.com",
  "ssense.com",
  "fwrd.com",
  "intermixonline.com",
  "everythingbutwater.com",
]);

export function channelFor(retailer: string): RetailerChannel {
  return AFFILIATE_PARTNERS.has(retailer.toLowerCase()) ? "affiliate" : "brand_direct";
}

export interface ProductDNA {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: string;
  href: string;
  retailer: string;
  /** Derived from retailer; affiliate listings are prioritized in scoring. */
  channel: RetailerChannel;
  /** Brand fallback URL — used if the primary href 404s or sells out. */
  brandFallbackUrl?: string;
  /** Category fallback URL on the same retailer — last-resort destination. */
  categoryFallbackUrl?: string;
  destinations: string[];
  styleFamilies: StyleFamily[];
  activityTags: ActivityTag[];
  brandTier: BrandTier;
  /** Optional pill rendered on the card, e.g. "Mediterranean Embroidery". */
  editorialLabel?: string;
  soldOut?: boolean;
  /** Optional founder-DB visual DNA fields used by Portofino weighting. */
  printLanguage?: string;
  colorStory?: string[];
  /** Classification of the image source. Only retailer_cdn / brand_cdn /
   *  cleaned_thumbnail are allowed to render on live rails. */
  imageSource?:
    | "retailer_cdn"
    | "brand_cdn"
    | "cleaned_thumbnail"
    | "founder_screenshot"
    | "placeholder"
    | "unknown";
}

const RAW_PRODUCTS: Omit<ProductDNA, "channel">[] = [
  // ── New seeded references (uploaded) ──────────────────────────────
  {
    id: "milly-lela-embroidered-midi",
    brand: "Milly",
    name: "Lela Embroidered Midi Dress",
    price: "$450",
    image: millyLela.url,
    href: "https://www.saksfifthavenue.com/product/milly-lela-embroidered-cotton-midi-dress",
    retailer: "saksfifthavenue.com",
    brandFallbackUrl: "https://milly.com/collections/dresses",
    categoryFallbackUrl: "https://www.saksfifthavenue.com/c/women-s-apparel/dresses",
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
    href: "https://www.shopbop.com/lene-embroidered-mini-dress-milly/vp/v=1/milly-lene-mini",
    retailer: "shopbop.com",
    brandFallbackUrl: "https://milly.com/collections/dresses",
    categoryFallbackUrl: "https://www.shopbop.com/dresses-clothing/br/v=1/2534374302063372.htm",
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
    href: "https://www.shopbop.com/porcelain-garden-cut-out-midi-farm-rio/vp/v=1/farmrio-porcelain-garden",
    retailer: "shopbop.com",
    brandFallbackUrl: "https://www.farmrio.com/collections/dresses",
    categoryFallbackUrl: "https://www.shopbop.com/dresses-clothing/br/v=1/2534374302063372.htm",
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
    href: "https://www.mytheresa.com/us/en/women/dolce-and-gabbana/majolica-print-twill-shirt-dress",
    retailer: "mytheresa.com",
    brandFallbackUrl: "https://www.dolcegabbana.com/en-us/women/clothing/dresses/",
    categoryFallbackUrl: "https://www.mytheresa.com/us/en/women/clothing/dresses",
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
    brandFallbackUrl: "https://www.aliceandolivia.com/collections/dresses",
    categoryFallbackUrl: "https://www.saksfifthavenue.com/c/women-s-apparel/dresses",
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
    href: "https://www.shopbop.com/miriam-linen-sweetheart-top-alice-olivia/vp/v=1/ao-miriam-linen-top",
    retailer: "shopbop.com",
    brandFallbackUrl: "https://www.aliceandolivia.com/collections/tops",
    categoryFallbackUrl: "https://www.shopbop.com/tops-clothing/br/v=1/2534374302063372.htm",
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
    href: "https://www.net-a-porter.com/en-us/shop/product/eres/swimwear/one-pieces/aquarelle-square-neck-swimsuit",
    retailer: "net-a-porter.com",
    brandFallbackUrl: "https://www.eresparis.com/us/swimwear",
    categoryFallbackUrl: "https://www.net-a-porter.com/en-us/shop/clothing/swimwear",
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
    href: "https://www.everythingbutwater.com/products/hunza-g-bandeau-crinkle-swimsuit",
    retailer: "everythingbutwater.com",
    brandFallbackUrl: "https://hunzag.com/collections/swimwear",
    categoryFallbackUrl: "https://www.everythingbutwater.com/collections/one-piece-swimsuits",
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
    href: "https://www.net-a-porter.com/en-us/shop/product/zimmermann/clothing/sarongs/riviera-printed-cotton-and-silk-blend-pareo",
    retailer: "net-a-porter.com",
    brandFallbackUrl: "https://www.zimmermann.com/swim.html",
    categoryFallbackUrl: "https://www.net-a-porter.com/en-us/shop/clothing/swimwear",
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
    href: "https://www.net-a-porter.com/en-us/shop/product/hereu/bags/tote-bags/calella-woven-leather-tote",
    retailer: "net-a-porter.com",
    brandFallbackUrl: "https://hereustudio.com/collections/bags",
    categoryFallbackUrl: "https://www.net-a-porter.com/en-us/shop/accessories/bags/totes",
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
    href: "https://www.mytheresa.com/us/en/women/loewe/anagram-large-raffia-tote",
    retailer: "mytheresa.com",
    brandFallbackUrl: "https://www.loewe.com/usa/en/women/bags/tote-bags",
    categoryFallbackUrl: "https://www.mytheresa.com/us/en/women/bags/tote-bags",
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
    href: "https://www.net-a-porter.com/en-us/shop/product/gianvito-rossi/shoes/flat-sandals/portofino-leather-sandals",
    retailer: "net-a-porter.com",
    brandFallbackUrl: "https://www.gianvitorossi.com/us/woman/shoes/sandals/",
    categoryFallbackUrl: "https://www.net-a-porter.com/en-us/shop/shoes/sandals",
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
    href: "https://www.revolve.com/posse-ivory-linen-romper/dp/POSR-WC-ivory-linen-romper/",
    retailer: "revolve.com",
    brandFallbackUrl: "https://posse.com/collections/all",
    categoryFallbackUrl: "https://www.revolve.com/dresses-rompers/br/12c437/",
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
    href: "https://www.modaoperandi.com/women/p/etro/paisley-halter-maxi-dress",
    retailer: "modaoperandi.com",
    brandFallbackUrl: "https://www.etro.com/us-en/women/dresses",
    categoryFallbackUrl: "https://www.modaoperandi.com/women/clothing/dresses",
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
    href: "https://www.mytheresa.com/us/en/women/pucci/marmo-print-silk-kaftan",
    retailer: "mytheresa.com",
    brandFallbackUrl: "https://www.emiliopucci.com/us/women/clothing/kaftans",
    categoryFallbackUrl: "https://www.mytheresa.com/us/en/women/clothing/dresses",
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
    href: "https://www.everythingbutwater.com/products/melissa-odabash-micha-floral-maxi-dress",
    retailer: "everythingbutwater.com",
    brandFallbackUrl: "https://www.odabash.com/collections/dresses",
    categoryFallbackUrl: "https://www.everythingbutwater.com/collections/cover-ups-dresses",
    destinations: ["portofino", "capri"],
    styleFamilies: ["riviera_floral", "coastal_knit"],
    activityTags: ["beach_club_lunch", "pool_day", "harbor_aperitivo"],
    brandTier: "discovery",
    editorialLabel: "Riviera Florals",
  },
  // ── Discovery brand expansion (affiliate-linked) ─────────────────
  {
    id: "alemais-marguerite-midi",
    brand: "Alemais",
    name: "Marguerite Embroidered Linen Midi Dress",
    price: "$895",
    image: millyLela.url,
    href: "https://www.net-a-porter.com/en-us/shop/product/alemais/clothing/midi-dresses/marguerite-embroidered-linen-midi-dress",
    retailer: "net-a-porter.com",
    brandFallbackUrl: "https://alemais.com/collections/dresses",
    categoryFallbackUrl: "https://www.net-a-porter.com/en-us/shop/clothing/dresses/midi",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["mediterranean_embroidery", "riviera_floral"],
    activityTags: ["market_morning", "harbor_aperitivo", "shopping_afternoon"],
    brandTier: "discovery",
    editorialLabel: "Mediterranean Embroidery",
  },
  {
    id: "agua-bendita-azul-midi",
    brand: "Agua by Agua Bendita",
    name: "Azul Embroidered Linen Midi Dress",
    price: "$640",
    image: farmRioPorcelain.url,
    href: "https://www.modaoperandi.com/women/p/agua-by-agua-bendita/azul-embroidered-linen-midi-dress",
    retailer: "modaoperandi.com",
    brandFallbackUrl: "https://aguabendita.com/collections/agua",
    categoryFallbackUrl: "https://www.modaoperandi.com/women/clothing/dresses",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["mediterranean_embroidery", "destination_print"],
    activityTags: ["beach_club_lunch", "market_morning", "harbor_aperitivo"],
    brandTier: "discovery",
    editorialLabel: "Mediterranean Embroidery",
  },
  {
    id: "hemant-nandita-azure-kaftan",
    brand: "Hemant & Nandita",
    name: "Azure Embroidered Cotton Kaftan",
    price: "$425",
    image: aoMiriam.url,
    href: "https://www.saksfifthavenue.com/product/hemant-and-nandita-azure-embroidered-cotton-kaftan",
    retailer: "saksfifthavenue.com",
    brandFallbackUrl: "https://hemantandnandita.com/collections/dresses",
    categoryFallbackUrl: "https://www.saksfifthavenue.com/c/women-s-apparel/dresses",
    destinations: ["portofino", "capri"],
    styleFamilies: ["destination_print", "riviera_floral", "blue_white_porcelain"],
    activityTags: ["beach_club_lunch", "pool_day", "sunset_views"],
    brandTier: "discovery",
    editorialLabel: "Riviera Florals",
  },
  {
    id: "johanna-ortiz-coral-blouse",
    brand: "Johanna Ortiz",
    name: "Coral Reef Embroidered Cotton Blouse",
    price: "$750",
    image: aoMiriam.url,
    href: "https://www.net-a-porter.com/en-us/shop/product/johanna-ortiz/clothing/tops/coral-reef-embroidered-cotton-blouse",
    retailer: "net-a-porter.com",
    brandFallbackUrl: "https://www.johannaortiz.com/collections/tops",
    categoryFallbackUrl: "https://www.net-a-porter.com/en-us/shop/clothing/tops",
    destinations: ["portofino", "capri", "amalfi"],
    styleFamilies: ["mediterranean_embroidery", "destination_print"],
    activityTags: ["harbor_aperitivo", "shopping_afternoon", "market_morning"],
    brandTier: "discovery",
    editorialLabel: "Mediterranean Embroidery",
  },
];

export const PRODUCT_LIBRARY: ProductDNA[] = RAW_PRODUCTS.map((p) => ({
  ...p,
  channel: channelFor(p.retailer),
}));

/**
 * Resolve the best purchase URL using the inventory health fallback chain:
 *   Primary URL → Brand Fallback → Category Fallback.
 * Returns null when no destination URL is available, so the card can be
 * filtered out before render (no card without a purchase destination).
 */
export function resolvePurchaseUrl(p: ProductDNA): string | null {
  return p.href || p.brandFallbackUrl || p.categoryFallbackUrl || null;
}