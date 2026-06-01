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
 *
 * Diversity rules (mem://features/sourcing-rules §12–17):
 *   - Brand cap ≤25% per page; alt section ≤1–2 per brand per concept.
 *   - Rotate prints/textures (tile, stripes, ivory texture, embroidery,
 *     linen, raffia, eyelet, gauze) — never repeat the same print story.
 *   - Each alternative carries a distinct destination personality
 *     (Closest to Muse / Yacht / Beach Club / Long Lunch / Market Stroll).
 */
import productPosseStripedCropTop from "@/assets/products/posse-striped-crop-top.svg";
import productZimmermannBlueSilkSet from "@/assets/products/zimmermann-blue-silk-set.svg";
import productZimmermannBluePareo from "@/assets/products/zimmermann-blue-pareo.svg";
import productEtroPaisleyHalterMaxi from "@/assets/products/etro-paisley-halter-maxi.svg";
import productHereuWovenTote from "@/assets/products/hereu-woven-tote.svg";

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
  // Brief: rotate prints, textures, and brands around the Riviera
  // muse. One D&G tile anchor only — alternatives lean into
  // blue/white stripes, ivory textures, painterly prints, and woven
  // raffia across distinct destination personalities. Brand cap
  // respected: ≤25% from any single brand on this page.
  // ─────────────────────────────────────────────────────────────
  "day-1/look-a": [
    {
      title: "Swim Alternatives",
      description:
        "One tile-print anchor closest to the muse, one striped bandeau alt — engineered to walk straight from the swim ladder into a long lunch without a costume change.",
      items: [
        {
          brand: "Dolce & Gabbana",
          title: "Majolica-Print One-Piece Swimsuit",
          slotLabel: "Closest to Muse · Tile One-Piece",
          price: "$875",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/swimwear/majolica-print-one-piece-swimsuit-multicolor-O9A46JONO19IP3TN.html",
          image:
            "https://www.dolcegabbana.com/dw/image/v2/BKDB_PRD/on/demandware.static/-/Sites-15/default/dw1d7aff2d/images/zoom/O9A46JONO19_IP3TN_0.jpg?sw=740&sh=944",
          note: "Blue-and-white majolica on a polished one-piece silhouette — the muse anchor, and the only D&G piece in this edit.",
        },
        {
          brand: "Posse",
          title: "Ari Striped Cotton Bikini Top",
          slotLabel: "Bandeau Alt · Blue & White Stripes",
          price: "$140",
          url: "https://www.mytheresa.com/us/en/women/posse-ari-striped-crop-top-blue-p01078791",
          image: productPosseStripedCropTop,
          note: "Bandeau-leaning Australian swim in a crisp blue/white stripe — rotates the print story away from tile.",
        },
      ],
    },
    {
      title: "Outfit Alternatives",
      description:
        "Four destination personalities for Day 1 — same woman, different moments. Ivory-textured co-ord for the yacht, painterly Australian print for the long lunch, embroidered cotton-voile for the beach club, and a woven leather raffia tote for the market stroll.",
      items: [
        {
          brand: "Zimmermann",
          title: "Illumination Cotton & Silk-Blend Blouse",
          slotLabel: "Yacht · Ivory Textured",
          price: "$895",
          url: "https://www.net-a-porter.com/en-us/shop/product/zimmermann/clothing/blouses/illumination-cropped-cotton-and-silk-blend-blouse/46376663162848181",
          image: productZimmermannBlueSilkSet,
          note: "Australian ivory-leaning blouse with eyelet detail — pair with the linen skirt below for a same-suitcase set.",
        },
        {
          brand: "Zimmermann",
          title: "Illumination Linen & Silk-Blend Skirt",
          slotLabel: "Yacht · Pairs Above",
          price: "$895",
          url: "https://www.net-a-porter.com/en-us/shop/product/zimmermann/clothing/midi-skirts/illumination-linen-and-silk-blend-skirt/46376663162848182",
          image: productZimmermannBluePareo,
          note: "Soft linen midi — finishes the ivory-textured Riviera co-ord without leaning on tile print.",
        },
        {
          brand: "Faithfull the Brand",
          title: "Marie Louise Printed Midi Dress",
          slotLabel: "Long Lunch · Painterly Print",
          price: "$249",
          url: "https://www.revolve.com/faithfull-the-brand-marie-louise-midi-dress/dp/FAIB-WD451/",
          image: productEtroPaisleyHalterMaxi,
          note: "Australian-resort painterly print that nods to Mediterranean blues without cloning the tile motif.",
        },
        {
          brand: "Cult Gaia",
          title: "Adira Printed Cotton-Voile Kaftan",
          slotLabel: "Beach Club · Embroidered Voile",
          price: "$648",
          url: "https://www.net-a-porter.com/en-us/shop/product/cult-gaia/clothing/coverups/adira-printed-cotton-voile-kaftan/46376663162966810",
          image: "https://www.net-a-porter.com/variants/images/46376663162966810/in/w920_q60.jpg",
          note: "Embroidered cotton-voile coverup — rotates the texture story toward eyelet and gauze.",
        },
        {
          brand: "Hereu",
          title: "Castell Woven Leather Tote",
          slotLabel: "Market Stroll · Woven Raffia Tone",
          price: "$495",
          url: "https://hereustudio.com/products/castell-woven-leather-tote-bag-tan",
          image: productHereuWovenTote,
          note: "Spanish woven leather in a raffia-adjacent tan — the bag that walks the market without competing with the dress.",
        },
      ],
    },
  ],
};

export function alternativesFor(daySlug: string, lookSlug: string): AlternativeGroup[] {
  return LOOK_ALTERNATIVES[`${daySlug}/${lookSlug}`] ?? [];
}
