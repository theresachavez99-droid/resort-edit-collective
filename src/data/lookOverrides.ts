/**
 * Per-look custom overrides.
 *
 * When a Day/Look needs a product grid that doesn't fit the rigid 7-slot
 * LookProduct schema (multiple jewelry pieces, layered outfit + trousers,
 * a separate beauty/details section, etc.), define it here. The
 * `/portofino/$day/$look` route checks for an override and, if present,
 * renders the custom grid + optional Details section in place of the
 * standard "Complete the Look" grid.
 */
import type { LookSlug } from "@/lib/portofino-spec";
import type { Look } from "./lookbook";

import imgShaniGeneva from "@/assets/products/shani-shemer-geneva-espresso.svg";
import imgMc2Amalia from "@/assets/products/mc2-amalia-degrade-trousers.svg";
import imgEleftheria from "@/assets/products/ancient-greek-eleftheria-sandal.svg";
import imgLeanna from "@/assets/products/jennifer-behr-leanna-earrings.svg";
import imgNatashaCuff from "@/assets/products/jennifer-fisher-natasha-cuff.svg";
import imgTriompheCateye from "@/assets/products/celine-triomphe-cateye.svg";
import imgRaffiaTote from "@/assets/products/large-woven-raffia-tote-chestnut.svg";
import imgCollette from "@/assets/products/collette-straw-sun-hat.svg";
import imgMadisonRing from "@/assets/products/madison-avenue-ring.svg";
import imgGlowDrops from "@/assets/products/st-tropez-tonic-glow-drops.svg";

import imgMichaFloral from "@/assets/products/melissa-odabash-micha-floral.svg";
import imgSouliersWedge from "@/assets/products/souliers-martinez-summer-raffia-wedge.svg";
import imgRomanArcNecklace from "@/assets/products/missoma-lucy-williams-roman-arc-necklace.svg";
import imgLyannaEarrings from "@/assets/products/jennifer-behr-lyanna-quartz-earrings.svg";
import imgCloverBracelet from "@/assets/products/by-adina-eden-pave-clover-bracelet-mop.svg";
import imgLisseClutch from "@/assets/products/cult-gaia-lisse-clutch.svg";
import imgKreweStLouis from "@/assets/products/krewe-st-louis-matte-oyster-24k.svg";
import imgPalomaBoater from "@/assets/products/lack-of-color-paloma-sun-boater.svg";
import imgForgetMeKnot from "@/assets/products/oradina-forget-me-knot-studs.svg";
import imgRemiBangle from "@/assets/products/jenny-bird-remi-hinge-bangle.svg";

import imgPoolZella from "@/assets/products/alexandra-miro-zella-red-capri.svg";
import imgPoolJaimee from "@/assets/products/alexandra-miro-jaimee-skirt-red-capri.svg";
import imgPoolDaphnae from "@/assets/products/ancient-greek-daphnae-sandal.svg";
import imgPoolAsa from "@/assets/products/cult-gaia-asa-xl-tote-natural.svg";
import imgPoolLeSpecs from "@/assets/products/le-specs-tortoise-sunglasses.svg";
import imgPoolHoops from "@/assets/products/gold-hoops-revolve.svg";

export type OverrideItem = {
  slotLabel: string;
  brand: string;
  title: string;
  url: string;
  image: string;
};

export type LookOverride = {
  main: OverrideItem[];
  details?: {
    title: string;
    subtitle?: string;
    items: OverrideItem[];
  };
};

type Key = `${Look["daySlug"]}/${LookSlug}`;

const OVERRIDES: Partial<Record<Key, LookOverride>> = {
  "day-1/look-c": {
    main: [
      {
        slotLabel: "DRESS",
        brand: "Resort Edit",
        title: "Ivory Crochet Knit Midi Dress",
        url: "AFF-HARBORAPERITIVO-DRESS",
        image: "",
      },
      {
        slotLabel: "SHOES",
        brand: "Resort Edit",
        title: "Tan Leather Flat Sandals",
        url: "AFF-HARBORAPERITIVO-SHOES",
        image: "",
      },
      {
        slotLabel: "EARRINGS",
        brand: "Revolve",
        title: "Gold Hoop Earrings",
        url: "AFF-HARBORAPERITIVO-EARRINGS",
        image: imgPoolHoops,
      },
      {
        slotLabel: "NECKLACE",
        brand: "Missoma x Lucy Williams",
        title: "18ct Gold-Plated Roman Arc Coin Pendant Necklace",
        url: "https://www.libertylondon.com/us/x-lucy-williams-18ct-gold-plated-engravable-roman-arc-coin-pendant-necklace-R498618006.html",
        image: imgRomanArcNecklace,
      },
      {
        slotLabel: "BRACELET",
        brand: "Jenny Bird",
        title: "Remi Hinge Bangle Bracelet",
        url: "https://www.nordstrom.com/s/jenny-bird-remi-hinge-bangle-bracelet/6839686",
        image: imgRemiBangle,
      },
      {
        slotLabel: "SUNGLASSES",
        brand: "Céline",
        title: "Triomphe Cat-Eye Sunglasses",
        url: "https://www.neimanmarcus.com/p/celine-triomphe-cat-eye-sunglasses-prod284390071",
        image: imgTriompheCateye,
      },
      {
        slotLabel: "BAG",
        brand: "Nordstrom",
        title: "Large Woven Raffia Tote (Chestnut Brown)",
        url: "https://www.nordstrom.com/s/large-woven-raffia-tote/8842846",
        image: imgRaffiaTote,
      },
    ],
    details: {
      title: "The Details",
      subtitle: "Beauty and finishing touches for the look.",
      items: [
        {
          slotLabel: "GLOW",
          brand: "St. Tropez",
          title: "Self Tan Luxe Tan Tonic Glow Drops",
          url: "https://www.shopbop.com/self-tan-luxe-tonic-glow/vp/v=1/1583558086.htm",
          image: imgGlowDrops,
        },
      ],
    },
  },
  "day-3/look-b": {
    main: [
      {
        slotLabel: "DRESS",
        brand: "Melissa Odabash",
        title: "Micha Floral Off-Shoulder Mini Dress",
        url: "https://www.neimanmarcus.com/p/melissa-odabash-micha-floral-off-shoulder-mini-dress-prod288540110",
        image: imgMichaFloral,
      },
      {
        slotLabel: "SHOES",
        brand: "Souliers Martinez",
        title: "Summer Raffia Espadrille Wedges (Beige)",
        url: "https://www.mytheresa.com/us/en/women/souliers-martinez-summer-raffia-espadrille-wedges-beige-p01062265",
        image: imgSouliersWedge,
      },
      {
        slotLabel: "NECKLACE",
        brand: "Missoma x Lucy Williams",
        title: "18ct Gold-Plated Roman Arc Coin Pendant Necklace",
        url: "https://www.libertylondon.com/us/x-lucy-williams-18ct-gold-plated-engravable-roman-arc-coin-pendant-necklace-R498618006.html",
        image: imgRomanArcNecklace,
      },
      {
        slotLabel: "EARRINGS",
        brand: "Bony Levy",
        title: "14K Gold Forget Me Knot Stud Earrings",
        url: "https://www.nordstrom.com/s/bony-levy-14k-gold-knot-stud-earrings/6855642",
        image: imgForgetMeKnot,
      },
      {
        slotLabel: "BRACELET",
        brand: "Jenny Bird",
        title: "Remi Hinge Bangle Bracelet",
        url: "https://www.nordstrom.com/s/jenny-bird-remi-hinge-bangle-bracelet/6839686",
        image: imgRemiBangle,
      },
      {
        slotLabel: "BAG",
        brand: "Cult Gaia",
        title: "Lisse Clutch",
        url: "https://www.shopbop.com/product/vp/v=1/1593649487.htm",
        image: imgLisseClutch,
      },
      {
        slotLabel: "SUNGLASSES",
        brand: "Krewe",
        title: "St. Louis Matte Oyster 24K Sunglasses",
        url: "https://www.krewe.com/products/st-louis-matte-oyster-24k-sunglasses",
        image: imgKreweStLouis,
      },
      {
        slotLabel: "HAT",
        brand: "Lack of Color",
        title: "Paloma Sun Straw Boater Hat",
        url: "https://lackofcolor.com/products/paloma-sun-hat",
        image: imgPalomaBoater,
      },
    ],
  },
  "day-3/look-a": {
    main: [
      {
        slotLabel: "SWIMSUIT",
        brand: "Alexandra Miro",
        title: "Zella Swimsuit — Red Capri",
        url: "AFF-POOL-SWIMSUIT",
        image: imgPoolZella,
      },
      {
        slotLabel: "SKIRT",
        brand: "Alexandra Miro",
        title: "Jaimee Skirt — Red Capri",
        url: "AFF-POOL-SKIRT",
        image: imgPoolJaimee,
      },
      {
        slotLabel: "SHOES",
        brand: "Ancient Greek Sandals",
        title: "Daphnae Sandal",
        url: "AFF-POOL-SHOES",
        image: imgPoolDaphnae,
      },
      {
        slotLabel: "BAG",
        brand: "Cult Gaia",
        title: "Asa XL Tote — Natural",
        url: "AFF-POOL-BAG",
        image: imgPoolAsa,
      },
      {
        slotLabel: "SUNGLASSES",
        brand: "Le Specs",
        title: "Tortoise Sunglasses",
        url: "AFF-POOL-SUNGLASSES",
        image: imgPoolLeSpecs,
      },
      {
        slotLabel: "JEWELRY",
        brand: "Revolve",
        title: "Gold Hoop Earrings",
        url: "AFF-POOL-JEWELRY",
        image: imgPoolHoops,
      },
    ],
  },
};

export function lookOverrideFor(daySlug: Look["daySlug"], lookSlug: LookSlug): LookOverride | undefined {
  return OVERRIDES[`${daySlug}/${lookSlug}`];
}