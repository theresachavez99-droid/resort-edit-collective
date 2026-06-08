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
        slotLabel: "OUTFIT · SWIM",
        brand: "Shani Shemer",
        title: "Geneva One-Piece Swimsuit in Espresso",
        url: "https://www.fwrd.com/product-shani-shemer-geneva-one-piece-swimsuit-in-espresso/SMEF-WX124/",
        image: imgShaniGeneva,
      },
      {
        slotLabel: "TROUSERS · LAYER",
        brand: "MC2 Saint Barth",
        title: "Brown Amalia Degradé Raschel Long Trousers",
        url: "https://us.mc2saintbarth.com/products/brown-amalia-degrade-raschel-long-trousers",
        image: imgMc2Amalia,
      },
      {
        slotLabel: "SHOES",
        brand: "Ancient Greek Sandals",
        title: "Eleftheria Sandals",
        url: "https://www.shopbop.com/eleftheria-sandal-ancient-greek-sandals/vp/v=1/1535976709.htm",
        image: imgEleftheria,
      },
      {
        slotLabel: "EARRINGS",
        brand: "Jennifer Behr",
        title: "Leanna Crystal Earrings",
        url: "https://www.neimanmarcus.com/p/jennifer-behr-leanna-crystal-earrings-prod284790262",
        image: imgLeanna,
      },
      {
        slotLabel: "BRACELET",
        brand: "Jennifer Fisher",
        title: "Natasha Cuff",
        url: "https://www.shopbop.com/natasha-cuff-jennifer-fisher/vp/v=1/1542946262.htm",
        image: imgNatashaCuff,
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
      {
        slotLabel: "HAT",
        brand: "Nordstrom",
        title: "Collette Straw Sun Hat",
        url: "https://www.nordstrom.com/s/collette-straw-sun-hat/8048666",
        image: imgCollette,
      },
      {
        slotLabel: "RING",
        brand: "Nordstrom",
        title: "Madison Avenue Ring",
        url: "https://www.nordstrom.com/s/madison-avenue-ring/8506686",
        image: imgMadisonRing,
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
        brand: "Oradina",
        title: "14K Gold Forget Me Knot Stud Earrings",
        url: "https://www.oradina.com/products/forget-me-knot-stud-earrings",
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
};

export function lookOverrideFor(daySlug: Look["daySlug"], lookSlug: LookSlug): LookOverride | undefined {
  return OVERRIDES[`${daySlug}/${lookSlug}`];
}