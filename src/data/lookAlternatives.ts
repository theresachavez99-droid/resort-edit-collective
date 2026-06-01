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
          brand: "Dolce & Gabbana",
          title: "Majolica-Print One-Piece Swimsuit",
          slotLabel: "Swim Alt 1 · One-Piece",
          price: "$875",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/swimwear/majolica-print-one-piece-swimsuit-multicolor-O9A46JONO19IP3TN.html",
          image:
            "https://www.dolcegabbana.com/dw/image/v2/BKDB_PRD/on/demandware.static/-/Sites-15/default/dw1d7aff2d/images/zoom/O9A46JONO19_IP3TN_0.jpg?sw=740&sh=944",
          note: "Blue-and-white majolica with a polished one-piece silhouette — the closest Riviera match to the muse.",
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
          brand: "Dolce & Gabbana",
          title: "Majolica-Print Padded Bikini",
          slotLabel: "Swim Alt 2 · Bandeau",
          price: "$945",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/swimwear/majolica-print-padded-bikini-multicolor-O8A27JONO19IP3TN.html",
          image:
            "https://www.dolcegabbana.com/dw/image/v2/BKDB_PRD/on/demandware.static/-/Sites-15/default/dw59508ef3/images/zoom/O8A27JONO19_IP3TN_0.jpg?sw=740&sh=944",
          note: "A balconette-leaning bandeau shape with the same Mediterranean tile story.",
        },
        {
          brand: "Dolce & Gabbana",
          title: "Short Majolica-Print Chiffon Caftan",
          slotLabel: "Matching Coverup",
          price: "$1,995",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/dresses/short-majolica-print-chiffon-caftan-multicolor-F6F1ITHI1BLHA3TN.html",
          image:
            "https://www.dolcegabbana.com/dw/image/v2/BKDB_PRD/on/demandware.static/-/Sites-15/default/dwadda0c95/images/zoom/F6F1ITHI1BL_HA3TN_0.jpg?sw=740&sh=944",
          note: "Light chiffon, blue-white majolica, yacht-to-lunch without losing polish.",
        },
      ],
    },
    {
      title: "Outfit Alternatives",
      description:
        "Three full-outfit moves for Day 1 — the closest white-and-blue match to the muse, a Mediterranean lunch silk co-ord, and a beach-club kaftan that transitions clean from yacht to lunch.",
      items: [
        {
          brand: "Dolce & Gabbana",
          title: "Majolica-Print Twill Shirt with Slits",
          slotLabel: "Outfit Alt 1 · Closest to Muse",
          price: "$2,495",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/shirts-and-tops/majolica-print-twill-shirt-with-slits-multicolor-F5O28THI1BOHA3TN.html",
          image:
            "https://www.dolcegabbana.com/dw/image/v2/BKDB_PRD/on/demandware.static/-/Sites-15/default/dw40098fc3/images/zoom/F5O28THI1BO_HA3TN_0.jpg?sw=740&sh=944",
          note: "A blue-white silk layer that mirrors the muse’s print and open, yacht-ready ease.",
        },
        {
          brand: "Dolce & Gabbana",
          title: "Poplin Midi Skirt with Majolica Print",
          slotLabel: "Layer over Alt 1",
          price: "$1,445",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/skirts/poplin-midi-skirt-with-majolica-print-multicolor-F4CEHTHH5A6HA3TN.html",
          image:
            "https://www.dolcegabbana.com/dw/image/v2/BKDB_PRD/on/demandware.static/-/Sites-15/default/dw079b3e80/images/zoom/F4CEHTHH5A6_HA3TN_0.jpg?sw=740&sh=944",
          note: "Wear with the twill shirt for a polished full-print set, softened by raffia and gold.",
        },
        {
          brand: "Dolce & Gabbana",
          title: "Long Majolica-Print Chiffon Dress",
          slotLabel: "Outfit Alt 2 · Riviera Lunch",
          price: "$6,445",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/dresses/long-majolica-print-chiffon-dress-multicolor-F6ADQTHI1BRHA3TN.html",
          image:
            "https://www.dolcegabbana.com/dw/image/v2/BKDB_PRD/on/demandware.static/-/Sites-15/default/dw52bac1d2/images/zoom/F6ADQTHI1BR_HA3TN_0.jpg?sw=740&sh=944",
          note: "A long, fluid majolica dress for lunch that still feels coastal, not evening-heavy.",
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

export function alternativesFor(daySlug: string, lookSlug: string): AlternativeGroup[] {
  return LOOK_ALTERNATIVES[`${daySlug}/${lookSlug}`] ?? [];
}
