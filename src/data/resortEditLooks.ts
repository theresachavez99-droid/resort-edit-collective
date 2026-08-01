/**
 * Resort Edit Looks — canonical, founder-approved data model for every
 * complete Resort Edit look surfaced across the site. This is the source
 * of truth: no scraping, no auto-substitution, no invented products.
 *
 * Only products supplied and confirmed by the founder appear here. If an
 * approved image asset is not yet in the project, `image` is set to `null`
 * and the renderer shows an editorial "Image pending founder approval"
 * tile — never a hotlinked retailer image.
 *
 * Future Sovrn integration hooks (`sovrnId`, `liveAvailable`, `livePrice`)
 * are typed in but unused today. The direct approved retailer URL remains
 * the source of truth until Sovrn is connected.
 */

import alexandraMiroSkirt from "@/assets/products/alexandra-miro-jaimee-skirt-red-capri.svg";
import alexandraMiroZella from "@/assets/products/alexandra-miro-zella-red-capri.svg";
import celineTriomphe from "@/assets/products/celine-triomphe-sunglasses.svg";
import poolLoungingHero from "@/assets/uploads/lilla/lilla-lemon-beach-club.png.asset.json";

export type ResortEditProduct = {
  brand: string;
  name: string;
  retailer: string;
  price?: string;
  url: string;
  /** Approved project-owned image asset. `null` = image pending approval. */
  image: string | null;
  /** Reserved for future Sovrn integration. Not rendered today. */
  sovrnId?: string;
  liveAvailable?: boolean;
  livePrice?: string;
};

export type ResortEditLookProducts = {
  /** One or more hero apparel pieces (a bikini set counts as multiple). */
  hero: ResortEditProduct[];
  shoes?: ResortEditProduct;
  bag?: ResortEditProduct;
  earrings?: ResortEditProduct;
  bracelet?: ResortEditProduct;
  necklace?: ResortEditProduct;
  sunglasses?: ResortEditProduct;
  hairDetail?: ResortEditProduct;
  layer?: ResortEditProduct;
};

export type ResortEditLook = {
  slug: string;
  destination: string;
  moment: string;
  title: string;
  /** Single-line styling note used on browse cards. */
  oneLiner: string;
  /** Longer description shown on the detail page beneath the title. */
  description: string;
  /** Editorial paragraph — the styling story. */
  stylingStory: string;
  /** Editorial hero image URL (already-approved project asset). */
  heroImage: string;
  /** Daytime moments show sunglasses; evening moments omit them. */
  daytime: boolean;
  founderFavorite?: boolean;
  tags: string[];
  products: ResortEditLookProducts;
};

// ──────────────────────────────────────────────────────────────
// Seed — Poolside Glam (Founder Favorite)
// The only Resort Edit Look currently approved for public rendering.
// Additional looks are added individually once each product package
// (brand · name · retailer · price · URL · approved image) is signed off.
// ──────────────────────────────────────────────────────────────

const POOLSIDE_GLAM: ResortEditLook = {
  slug: "poolside-glam",
  destination: "portofino",
  moment: "pool-lounging",
  title: "Poolside Glam",
  oneLiner:
    "A polished Riviera poolside look — vibrant Capri print, gold, raffia, and black acetate.",
  description:
    "A polished Riviera poolside look designed for long afternoons overlooking Portofino with an Aperol Spritz in hand.",
  stylingStory:
    "Designed for elegant afternoons beside the pool overlooking Portofino, Poolside Glam balances Alexandra Miro's vibrant Capri print with understated metallic accessories, sculptural gold jewelry, natural raffia textures, and timeless black acetate sunglasses for a refined Riviera aesthetic.",
  heroImage: poolLoungingHero.url,
  daytime: true,
  founderFavorite: true,
  tags: ["mediterranean", "poolside", "riviera", "print", "gold"],
  products: {
    hero: [
      {
        brand: "Alexandra Miro",
        name: "Jaimee Skirt — Red Capri",
        retailer: "Alexandra Miro",
        price: undefined,
        url: "https://alexandramiro.com/collections/ready-to-wear/products/jaimee-skirt-red-capri",
        image: alexandraMiroSkirt,
      },
      {
        brand: "Alexandra Miro",
        name: "Zella Bikini Top — Red Capri",
        retailer: "Alexandra Miro",
        price: undefined,
        url: "https://alexandramiro.com/products/zella-bikini-top-red-capri",
        image: alexandraMiroZella,
      },
      {
        brand: "Alexandra Miro",
        name: "Elise Frill Bikini Bottom — Red Capri",
        retailer: "Alexandra Miro",
        price: undefined,
        url: "https://alexandramiro.com/products/elise-frill-bikini-bottom-red-capri",
        image: null,
      },
    ],
    shoes: {
      brand: "Gianvito Rossi",
      name: "Luana 85 metallic leather sandals in gold",
      retailer: "Mytheresa",
      price: undefined,
      url: "https://www.mytheresa.com/us/en/women/gianvito-rossi-luana-85-metallic-leather-sandals-gold-p01106014",
      image: null,
    },
    bag: {
      brand: "LOEWE",
      name: "Paula's Ibiza Puzzle Fold Raffia Tote",
      retailer: "Net-a-Porter",
      price: undefined,
      url: "https://www.net-a-porter.com/en-us/shop/product/loewe/bags/tote-bags/plus-paula-s-ibiza-puzzle-fold-medium-leather-trimmed-raffia-tote/1647597333838602",
      image: null,
    },
    necklace: {
      brand: "EF Collection",
      name: "14K Yellow Gold Diamond Mini Disc Pendant Necklace (16-18in)",
      retailer: "Bloomingdale's",
      price: undefined,
      url: "https://www.bloomingdales.com/shop/product/ef-collection-14k-yellow-gold-diamond-mini-disc-pendant-necklace-16-18?ID=4992549",
      image: null,
    },
    earrings: {
      brand: "Moon Meadow",
      name: "14K Yellow Gold Diamond Circle Stud Earrings",
      retailer: "Bloomingdale's",
      price: undefined,
      url: "https://www.bloomingdales.com/shop/product/moon-meadow-14k-yellow-gold-diamond-circle-stud-earrings-exclusive?ID=3822029&tdp=cm_app~zBCOM-NAVAPP~xcm_zone~zPDP_ZONE_I~xcm_choiceId~zcidB9CSHX-6f4df622-5823-4ce8-9fbf-c1aa7c7f52a0@HG1@SIMILAR%2BSTYLES$3376$3822111~xcm_pos~zPos4~xcm_srcCatID~z3376",
      image: null,
    },
    bracelet: {
      brand: "EF Collection",
      name: "14K Yellow Gold Lola Open Mini Chain Link Bracelet",
      retailer: "Bloomingdale's",
      price: undefined,
      url: "https://www.bloomingdales.com/shop/product/ef-collection-14k-yellow-gold-lola-open-mini-chain-link-bracelet?ID=4992610",
      image: null,
    },
    sunglasses: {
      brand: "CELINE",
      name: "Triomphe 01 Sunglasses — Black Acetate",
      retailer: "CELINE",
      price: undefined,
      url: "https://www.celine.com/en-us/celine-shop-women/accessories/sunglasses/triomphe-01-sunglasses-in-acetate-4S194CPLB.38NO.html",
      image: celineTriomphe,
    },
  },
};

export const RESORT_EDIT_LOOKS: ResortEditLook[] = [POOLSIDE_GLAM];

export function findResortEditLook(
  destination: string,
  moment: string,
  slug: string,
): ResortEditLook | undefined {
  return RESORT_EDIT_LOOKS.find(
    (l) => l.destination === destination && l.moment === moment && l.slug === slug,
  );
}

export function resortEditLooksForMoment(
  destination: string,
  moment: string,
): ResortEditLook[] {
  return RESORT_EDIT_LOOKS.filter(
    (l) => l.destination === destination && l.moment === moment,
  );
}

/**
 * Ordered, iterable list of products for a look. Renderer uses this order
 * both on the moment page grid and on the detail page.
 */
export function orderedProducts(look: ResortEditLook): ResortEditProduct[] {
  const p = look.products;
  const out: ResortEditProduct[] = [...p.hero];
  if (p.shoes) out.push(p.shoes);
  if (p.bag) out.push(p.bag);
  if (p.earrings) out.push(p.earrings);
  if (p.bracelet) out.push(p.bracelet);
  if (p.necklace) out.push(p.necklace);
  if (look.daytime && p.sunglasses) out.push(p.sunglasses);
  if (p.hairDetail) out.push(p.hairDetail);
  if (p.layer) out.push(p.layer);
  return out;
}