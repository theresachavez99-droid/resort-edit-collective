/**
 * PREVIEW-STAGED LOOKS
 *
 * Founder-approved hero replacements staged in code, rendered only where
 * `@/lib/preview-staging` says staging is on (Lovable preview / localhost).
 * The live production hostname keeps its currently deployed behaviour until
 * approval; enabling is then one atomic flag change, not a data migration.
 *
 * These rows are shipped in code on purpose — no production database rows are
 * written or mutated by staging a look here. Prices are never stored or shown.
 */
import evelynJadeImage from "@/assets/uploads/lilla/portofino-shopping-lilla-evelyn-jade-v2.png.asset.json";
import arrivalIvoryLinenImage from "@/assets/uploads/lilla/arrival-lilla-ivory-linen-quay-v6.png.asset.json";
import type { VisibleProductSlot } from "@/lib/look-atomic-completeness";

export type StagedLookRow = {
  /** Editorial slot label, e.g. "Hero Piece · Dress". */
  slot: string;
  brand: string;
  name: string;
  color?: string;
  retailer: string;
  url: string;
};

export type StagedLook = {
  key: string;
  title: string;
  caption: string;
  image: string;
  alt: string;
  /** Every product category visible in the photograph. */
  visibleProductSlots: readonly VisibleProductSlot[];
  rows: readonly StagedLookRow[];
};

/** Portofino Shopping — the Evelyn in Jade on Via Roma. */
export const SHOPPING_EVELYN_JADE: StagedLook = {
  key: "evelyn-jade-on-via-roma",
  title: "Shopping in Portofino",
  caption:
    "Mister Zimi's Evelyn dress in deep jade — scalloped straps, a cut-out waist and a full linen skirt — walked slowly past the lemon trees and shuttered boutiques, with gold leather sandals, a moon-shaped raffia tote and one warm gold family at the ears, throat and wrist.",
  image: evelynJadeImage.url,
  alt: "Lilla walking a sunlit Portofino lane in a deep jade Mister Zimi Evelyn maxi dress with scalloped straps and a cut-out waist, carrying a moon-shaped natural raffia tote, wearing gold leather thong sandals, tortoiseshell sunglasses pushed onto her head and fine gold hoops, chain necklace and bangle.",
  visibleProductSlots: [
    "outfit",
    "shoes",
    "bag",
    "sunglasses",
    "earrings",
    "necklace",
    "bracelet",
  ],
  rows: [
    {
      slot: "Hero Piece · Dress",
      brand: "Mister Zimi",
      name: "Evelyn Dress In Jade",
      color: "Jade",
      retailer: "Mister Zimi",
      url: "https://us.misterzimi.com/products/evelyn-dress-in-jade?variant=53016407376235",
    },
    {
      slot: "Shoes",
      brand: "Ancient Greek Sandals",
      name: "Leda Sandals",
      color: "Gold",
      retailer: "Shopbop",
      url: "https://www.shopbop.com/leda-sandal-ancient-greek-sandals/vp/v=1/1513893494.htm",
    },
    {
      slot: "Bag",
      brand: "STAUD",
      name: "Moon Raffia Tote Bag",
      color: "Natural/Tan",
      retailer: "Shopbop",
      url: "https://www.shopbop.com/moon-raffia-tote-bag-staud/vp/v=1/1590776527.htm",
    },
    {
      slot: "Sunglasses",
      brand: "Illesteva",
      name: "Veneto Sunglasses",
      color: "Havana/Taupe Flat Gradient",
      retailer: "Shopbop",
      url: "https://www.shopbop.com/veneto-illesteva/vp/v=1/1531641219.htm",
    },
    {
      slot: "Earrings",
      brand: "Jenny Bird",
      name: "Mini Florence Hoop Earrings",
      color: "Gold",
      retailer: "Shopbop",
      url: "https://www.shopbop.com/mini-florence-earrings-jenny-bird/vp/v=1/1538094001.htm",
    },
    {
      slot: "Necklace",
      brand: "Jenny Bird",
      name: "Rome Chain",
      color: "High Polish Gold",
      retailer: "Shopbop",
      url: "https://www.shopbop.com/rome-chain-jenny-bird/vp/v=1/1562860957.htm",
    },
    {
      slot: "Bracelet",
      brand: "Jenny Bird",
      name: "Ola Bangle",
      color: "High Polish Gold",
      retailer: "Shopbop",
      url: "https://www.shopbop.com/ola-bangle-jenny-bird/vp/v=1/1597419075.htm",
    },
  ],
};

/** Portofino Arrival — the Ivory Arrival on the harbour quay. */
export const ARRIVAL_IVORY_LINEN: StagedLook = {
  key: "ivory-linen-on-the-quay",
  title: "The Ivory Arrival",
  caption:
    "Faithfull's Maya vest and Isotta pant in natural linen — tonal, quietly tailored, finished with tan flat leather, a crochet raffia tote, tortoiseshell sunglasses pushed up into her hair and one slim gold family at the ears, throat and wrist.",
  image: arrivalIvoryLinenImage.url,
  alt: "Lilla on the stone quay in Portofino in a natural ivory linen button-front vest and matching wide-leg linen trousers, tan flat leather thong sandals, a natural crochet raffia and leather tote, tortoiseshell sunglasses pushed up on her head and slim gold hoops, chain necklace and bangles.",
  visibleProductSlots: [
    "outfit",
    "shoes",
    "bag",
    "sunglasses",
    "earrings",
    "necklace",
    "bracelet",
  ],
  rows: [
    {
      slot: "Hero Piece · Vest",
      brand: "FAITHFULL THE BRAND",
      name: "Maya Vest In Natural",
      color: "Natural",
      retailer: "Revolve",
      url: "https://www.revolve.com/dp/FAIB-WS275/",
    },
    {
      slot: "Hero Piece · Trousers",
      brand: "FAITHFULL THE BRAND",
      name: "Isotta Pant In Natural",
      color: "Natural",
      retailer: "Revolve",
      url: "https://www.revolve.com/dp/FAIB-WP74/",
    },
    {
      slot: "Shoes",
      brand: "Rag & Bone",
      name: "Remi Flat Sandal",
      color: "Tan",
      retailer: "Revolve",
      url: "https://www.revolve.com/dp/RGBR-WZ359/",
    },
    {
      slot: "Bag",
      brand: "florabella",
      name: "Foggia Crochet Raffia And Leather Tote Bag",
      color: "Natural & Gold",
      retailer: "Revolve",
      url: "https://www.revolve.com/dp/FLOR-WY94/",
    },
    {
      slot: "Sunglasses",
      brand: "Chimi",
      name: "Sally Sunglasses",
      color: "Lica Tortoise",
      retailer: "Revolve",
      url: "https://www.revolve.com/dp/CHMI-WG61/",
    },
    {
      slot: "Earrings",
      brand: "Jenny Bird",
      name: "Nouveaux Puff Earrings",
      color: "Gold",
      retailer: "Revolve",
      url: "https://www.revolve.com/dp/JENR-WL199/",
    },
    {
      slot: "Necklace",
      brand: "Jenny Bird",
      name: "Zeina Slim Chain",
      color: "Gold",
      retailer: "Revolve",
      url: "https://www.revolve.com/dp/JENR-WL355/",
    },
    {
      slot: "Bracelet",
      brand: "Jenny Bird",
      name: "Gia Bangle",
      color: "Gold",
      retailer: "Revolve",
      url: "https://www.revolve.com/dp/JENR-WL237/",
    },
  ],
};

/** Staged hero replacements keyed by canonical moment slug. */
export const PREVIEW_STAGED_LOOKS: Record<string, StagedLook> = {
  shopping: SHOPPING_EVELYN_JADE,
  arrival: ARRIVAL_IVORY_LINEN,
};
