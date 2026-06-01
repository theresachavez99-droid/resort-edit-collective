/**
 * Editor's Alternatives — additional curated options rendered below the
 * primary "Complete the Look" grid on the View Full Look template.
 *
 * Keyed by `${daySlug}/${lookSlug}`. Each entry is a list of groups
 * (e.g. "Swim Alternatives", "Outfit Alternatives"). Each item carries
 * the same shape rendered by ProductCategoryCard so we get one card
 * style across the whole page.
 *
 * Sourcing rule: every item MUST have an exact affiliate URL on an
 * approved retailer and a product image URL. Items missing either
 * should be removed, not placeholdered — alternatives are additive
 * and a missing alt should simply not appear.
 */

import eresAquarelleOnePiece from "@/assets/products/eres-aquarelle-one-piece.svg";
import hunzaBlueBandeau from "@/assets/products/hunza-blue-bandeau.svg";
import posseIvoryRomper from "@/assets/products/posse-ivory-romper.svg";
import pucciBlueKaftan from "@/assets/products/pucci-blue-kaftan.svg";
import zimmermannBluePareo from "@/assets/products/zimmermann-blue-pareo.svg";
import zimmermannBlueSilkSet from "@/assets/products/zimmermann-blue-silk-set.svg";

export type AlternativeProduct = {
  brand: string;
  title: string;
  /** Eyebrow label (e.g. "One-Piece", "Sarong", "Outfit Alt 1"). */
  slotLabel: string;
  price: string;
  url: string;
  image: string;
  /** Optional stylist note shown under the title. */
  note?: string;
};

export type AlternativeGroup = {
  title: string;
  /** Optional short intro paragraph for the group. */
  description?: string;
  items: AlternativeProduct[];
};

export const LOOK_ALTERNATIVES: Record<string, AlternativeGroup[]> = {
  // ─────────────────────────────────────────────────────────────
  // DAY 1 · LOOK A — Mediterranean Glam
  // Brief: Riviera one-piece + bandeau alternatives with matching
  // sarongs, plus three outfit alternatives that emulate the muse —
  // white-on-blue print, yacht-to-lunch, beach club transitional.
  // ─────────────────────────────────────────────────────────────
  "day-1/look-a": [
    {
      title: "Swim Alternatives",
      description:
        "Two Mediterranean swim options with their matching sarongs — both engineered to walk straight from the swim ladder into a long lunch without a costume change.",
      items: [
        {
          brand: "Eres",
          title: "Aquarelle Square-Neck One-Piece",
          slotLabel: "Swim Alt 1 · One-Piece",
          price: "$640",
          url: "https://www.net-a-porter.com/en-us/shop/product/eres/clothing/one-piece/aquarelle-square-neck-swimsuit/1647597321197131",
          image: eresAquarelleOnePiece,
          note: "Architectural square neckline, Riviera blue. Yacht-elegant, never sporty.",
        },
        {
          brand: "Dolce & Gabbana",
          title: "Majolica Print Cotton Pareo",
          slotLabel: "Matching Sarong",
          price: "$495",
          url: "https://www.net-a-porter.com/en-us/shop/product/dolcegabbana/clothing/coverups/maiolica-printed-cotton-pareo/46376663163104529",
          image: "https://www.net-a-porter.com/variants/images/46376663163104529/in/w920_q60.jpg",
          note: "Blue and white tile print — knot at the hip over the one-piece.",
        },
        {
          brand: "Hunza G",
          title: "Tracy Crinkle Bandeau Swimsuit",
          slotLabel: "Swim Alt 2 · Bandeau",
          price: "$245",
          url: "https://www.net-a-porter.com/en-us/shop/product/hunza-g/clothing/bandeau/tracy-bandeau-seersucker-swimsuit/1647597338129030",
          image: hunzaBlueBandeau,
          note: "Bandeau silhouette in signature crinkle — yacht appropriate, never juvenile.",
        },
        {
          brand: "Zimmermann",
          title: "Alight Printed Cotton Pareo",
          slotLabel: "Matching Sarong",
          price: "$295",
          url: "https://www.net-a-porter.com/en-us/shop/product/zimmermann/clothing/coverups/alight-printed-cotton-pareo/46376663163067275",
          image: zimmermannBluePareo,
          note: "Mediterranean print in tonal blues — pairs with the bandeau or worn alone as a maxi.",
        },
      ],
    },
    {
      title: "Outfit Alternatives",
      description:
        "Three full-outfit moves for Day 1 — the closest white-and-blue match to the muse, a Mediterranean lunch silk co-ord, and a beach-club kaftan that transitions clean from yacht to lunch.",
      items: [
        {
          brand: "Posse",
          title: "Hailey Linen Romper — Ivory",
          slotLabel: "Outfit Alt 1 · Closest to Muse",
          price: "$370",
          url: "https://www.net-a-porter.com/en-us/shop/product/posse/clothing/playsuits/hailey-linen-romper/46376663163057411",
          image: posseIvoryRomper,
          note: "White linen romper to layer under a blue printed kaftan — raffia underfoot, gold at the ears.",
        },
        {
          brand: "Emilio Pucci",
          title: "Marmo Print Silk Twill Kaftan",
          slotLabel: "Layer over Alt 1",
          price: "$1,495",
          url: "https://www.mytheresa.com/us/en/women/pucci-marmo-print-silk-twill-kaftan-blue-white-p01095481",
          image: pucciBlueKaftan,
          note: "Blue-and-white printed silk caftan — the muse layer.",
        },
        {
          brand: "Zimmermann",
          title: "Alight Printed Silk Co-Ord Set",
          slotLabel: "Outfit Alt 2 · Riviera Lunch",
          price: "$1,250",
          url: "https://www.mytheresa.com/us/en/women/zimmermann-alight-printed-silk-set-blue-p01089412",
          image: zimmermannBlueSilkSet,
          note: "Printed silk co-ord for a long Mediterranean lunch — sleek with resort sandals and raffia.",
        },
        {
          brand: "Cult Gaia",
          title: "Adira Printed Cotton-Voile Kaftan",
          slotLabel: "Outfit Alt 3 · Beach Club",
          price: "$648",
          url: "https://www.net-a-porter.com/en-us/shop/product/cult-gaia/clothing/coverups/adira-printed-cotton-voile-kaftan/46376663162966810",
          image: "https://www.net-a-porter.com/variants/images/46376663162966810/in/w920_q60.jpg",
          note: "Elevated kaftan to throw over a swim — yacht to lunch in one piece.",
        },
      ],
    },
  ],
};

export function alternativesFor(
  daySlug: string,
  lookSlug: string,
): AlternativeGroup[] {
  return LOOK_ALTERNATIVES[`${daySlug}/${lookSlug}`] ?? [];
}