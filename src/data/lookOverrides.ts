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
};

export function lookOverrideFor(daySlug: Look["daySlug"], lookSlug: LookSlug): LookOverride | undefined {
  return OVERRIDES[`${daySlug}/${lookSlug}`];
}