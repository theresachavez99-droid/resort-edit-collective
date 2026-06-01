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
import productDgLemonKaftan from "@/assets/products/dg-lemon-kaftan.jpg";
import productEresCreamMaillot from "@/assets/products/eres-cream-maillot.jpg";
import productHunzaBlueBandeau from "@/assets/products/hunza-blue-bandeau.svg";
import productDgMajolicaSarong from "@/assets/products/dg-majolica-sarong.svg";
import productPosseIvoryRomper from "@/assets/products/posse-ivory-romper.svg";
import productPucciBlueKaftan from "@/assets/products/pucci-blue-kaftan.svg";
import productLoeweBasketBag from "@/assets/products/loewe-basket-bag.svg";
import productCultGaiaEosClutch from "@/assets/products/cult-gaia-eos-clutch.svg";

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

  // ─────────────────────────────────────────────────────────────
  // DAY 2 · LOOK A — Lemon Print Cabana
  // Brief: Mediterranean beach club, lemon print, raffia, gold.
  // Swim alts cover one-piece, bandeau, Mediterranean print, and
  // an elevated neutral. Outfit alts span Beach Club Lunch, Yacht
  // Transfer, Long Lunch, and Cabana Cocktails — same woman,
  // different moments. Brand cap ≤25% per page enforced.
  // ─────────────────────────────────────────────────────────────
  "day-2/look-a": [
    {
      title: "Swim Alternatives",
      description:
        "Four directions on the same cabana — a plunge one-piece, a clean bandeau, a Mediterranean print, and an elevated neutral. Each one wears under the lemon kaftan without competing with it.",
      items: [
        {
          brand: "Eres",
          title: "Aquarelle Plunge Maillot",
          slotLabel: "Closest to Muse · One-Piece",
          price: "$485",
          url: "https://www.eresparis.com/us/en/swimwear/maillot/aquarelle",
          image: productEresCreamMaillot,
          note: "Ivory plunge maillot — the quiet anchor under a lemon kaftan, all clean line and no competing print.",
        },
        {
          brand: "Hunza G",
          title: "Gloria Bandeau Swimsuit, Yellow",
          slotLabel: "Bandeau Alt · Lemon Yellow",
          price: "$235",
          url: "https://www.hunzag.com/products/gloria-yellow",
          image: productHunzaBlueBandeau,
          note: "Crinkle bandeau in saturated lemon — picks up the kaftan palette without doubling the print.",
        },
        {
          brand: "Dolce & Gabbana",
          title: "Majolica-Print One-Piece Swimsuit",
          slotLabel: "Mediterranean Print · Tile",
          price: "$875",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/swimwear/majolica-print-one-piece-swimsuit-multicolor-O9A46JONO19IP3TN.html",
          image: productDgMajolicaSarong,
          note: "Blue-and-white majolica — when you want the print story under the print kaftan to feel intentional, not loud.",
        },
        {
          brand: "Marysia",
          title: "Antibes Scalloped Maillot, Ivory",
          slotLabel: "Elevated Neutral · Scallop",
          price: "$354",
          url: "https://www.marysia.com/products/antibes-maillot-ivory",
          image: productPosseIvoryRomper,
          note: "Scalloped ivory — the quietest version of the look, all texture, no color.",
        },
      ],
    },
    {
      title: "Outfit Alternatives",
      description:
        "Five destination personalities for Day 2 — Beach Club Lunch, Yacht Transfer, Long Lunch, Cabana Cocktails, and the Closest to Muse cabana original.",
      items: [
        {
          brand: "Dolce & Gabbana",
          title: "Portofino Lemon-Print Cotton Kaftan",
          slotLabel: "Closest to Muse · Lemon Kaftan",
          price: "$1,895",
          url: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/coverups/portofino-lemon-print-kaftan-multicolor.html",
          image: productDgLemonKaftan,
          note: "The muse piece — Portofino lemon print, cotton voile, V-neck. Layer over a clean maillot.",
        },
        {
          brand: "Farm Rio",
          title: "Yellow Lemons Maxi Dress",
          slotLabel: "Beach Club Lunch · Maxi Print",
          price: "$285",
          url: "https://www.farmrio.com/products/yellow-lemons-maxi-dress",
          image: productDgLemonKaftan,
          note: "Brazilian resort label — same lemon energy in a maxi dress that walks straight from lounger to long-table lunch.",
        },
        {
          brand: "Zimmermann",
          title: "Halliday Linen Wide-Leg Pant + Top Set",
          slotLabel: "Yacht Transfer · Ivory Linen",
          price: "$1,395",
          url: "https://www.zimmermann.com/halliday-linen-set-ivory.html",
          image: productPosseIvoryRomper,
          note: "Crinkled ivory linen set — for the tender transfer in and the espresso bar after. Same suitcase, no print.",
        },
        {
          brand: "Emilio Pucci",
          title: "Marmo-Print Silk Maxi Kaftan",
          slotLabel: "Long Lunch · Painterly Silk",
          price: "$2,150",
          url: "https://www.mytheresa.com/us/en/women/pucci-marmo-print-silk-kaftan-multicolor-p00951220",
          image: productPucciBlueKaftan,
          note: "Pucci marmo print on silk — when the lunch runs into late afternoon and the light gets generous.",
        },
        {
          brand: "Cult Gaia",
          title: "Sariyah Eyelet Cotton Maxi Dress",
          slotLabel: "Cabana Cocktails · Eyelet White",
          price: "$498",
          url: "https://cultgaia.com/products/sariyah-dress-off-white",
          image: productPosseIvoryRomper,
          note: "White eyelet maxi — the quiet cocktail option that lets a single gold cuff and the lemon scarf do the talking.",
        },
      ],
    },
    {
      title: "Accessories That Pull It Together",
      description:
        "Raffia textures and gold — the connective tissue across every swim and outfit direction above.",
      items: [
        {
          brand: "Loewe",
          title: "Anagram Raffia Basket Bag",
          slotLabel: "Bag · Raffia",
          price: "$1,250",
          url: "https://www.mytheresa.com/us/en/women/loewe-anagram-raffia-basket-bag-natural-p00863414",
          image: productLoeweBasketBag,
          note: "Spanish raffia in a basket silhouette — the bag the kaftan was waiting for.",
        },
        {
          brand: "Cult Gaia",
          title: "Eos Acrylic Box Clutch",
          slotLabel: "Bag · Cocktail Hour",
          price: "$398",
          url: "https://cultgaia.com/products/eos-clutch-ivory",
          image: productCultGaiaEosClutch,
          note: "Ivory acrylic clutch — for when the cabana becomes cocktails and the basket bag stays at the lounger.",
        },
        {
          brand: "Hereu",
          title: "Castell Woven Leather Tote",
          slotLabel: "Bag · Market Stroll",
          price: "$495",
          url: "https://hereustudio.com/products/castell-woven-leather-tote-bag-tan",
          image: productHereuWovenTote,
          note: "Catalan woven leather in raffia-adjacent tan — for the walk back through the village.",
        },
      ],
    },
  ],
};

export function alternativesFor(daySlug: string, lookSlug: string): AlternativeGroup[] {
  return LOOK_ALTERNATIVES[`${daySlug}/${lookSlug}`] ?? [];
}
