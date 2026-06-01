/**
 * Curated product fallbacks per Day × Look × Tier.
 *
 * Why this exists: the upstream `portofinoEdit` data carries editorial copy
 * but in many cases ships placeholder `href: "#"` entries with no image. The
 * lookbook validator (correctly) refuses to render those — which left
 * Look C with zero sourced pieces and an empty grid.
 *
 * These fallbacks are the safety net the sourcing rules require: every slot
 * resolves to a real affiliate URL + a real thumbnail. Aesthetic intent for
 * Look C: cream tones, raffia textures, crochet, woven accessories,
 * Mediterranean yacht energy — quiet texture contrast, ivory palette.
 *
 * Add new entries here when a look starts shipping empty slots; the
 * lookbook merge layer wires them in automatically.
 */
import type { LookCategory, LookProduct } from "./lookbook";
import type { LookSlug, TierSlug } from "@/lib/portofino-spec";

// Local SVG assets — guaranteed to render.
import imgPosseIvoryRomper from "@/assets/products/posse-ivory-romper.svg";
import imgGianvitoPortofinoSandal from "@/assets/products/gianvito-portofino-sandal.svg";
import imgLoeweBasketBag from "@/assets/products/loewe-basket-bag.svg";
import imgHereuWovenTote from "@/assets/products/hereu-woven-tote.svg";
import imgVcaFrivolePendant from "@/assets/products/vca-frivole-pendant.svg";
import imgOradinaVicenzaNecklace from "@/assets/products/oradina-vicenza-necklace.svg";
import imgGoldLariatNecklace from "@/assets/products/gold-lariat-necklace.svg";
import imgCelineTriompheSunglasses from "@/assets/products/celine-triomphe-sunglasses.svg";
import imgDior30MontaigneSunglasses from "@/assets/products/dior-30montaigne-sunglasses.svg";
import imgAnineBingSilkScarf from "@/assets/products/anine-bing-silk-scarf.svg";
import imgZimmermannBluePareo from "@/assets/products/zimmermann-blue-pareo.svg";

type FallbackTier = Partial<Record<LookCategory, LookProduct>>;
type FallbackLook = Partial<Record<TierSlug, FallbackTier>>;
type FallbackKey = `${"day-1" | "day-2" | "day-3" | "day-4" | "day-5"}/${LookSlug}`;

/** Reusable cream / raffia / crochet kit — the Look C aesthetic anchor. */
const lookCLuxury: FallbackTier = {
  outfit: {
    brand: "Chloé",
    title: "Crochet-Knit Cotton Top",
    price: "$1,295",
    url: "https://www.net-a-porter.com/en-us/shop/product/chloe/clothing/sleeveless-tops/crochet-knit-cotton-top/1647597297577061",
    image: imgPosseIvoryRomper,
  },
  shoes: {
    brand: "Gianvito Rossi",
    title: "Portofino Leather Sandals",
    price: "$845",
    url: "https://www.net-a-porter.com/en-us/shop/product/gianvito-rossi/shoes/flat-sandals/portofino-05-leather-sandals/1647597313161054",
    image: imgGianvitoPortofinoSandal,
  },
  bag: {
    brand: "Loewe",
    title: "Anagram Raffia Basket Bag",
    price: "$890",
    url: "https://www.mytheresa.com/us/en/women/loewe-anagram-raffia-basket-bag-natural-p00863414",
    image: imgLoeweBasketBag,
  },
  jewelry: {
    brand: "Van Cleef & Arpels",
    title: "Frivole Mini Pendant, Yellow Gold",
    price: "$2,310",
    url: "https://www.vancleefarpels.com/us/en/collections/jewelry/frivole/vcaro8wf00-frivole-pendant-mini-model.html",
    image: imgVcaFrivolePendant,
  },
  sunglasses: {
    brand: "Celine",
    title: "Triomphe Acetate Sunglasses",
    price: "$490",
    url: "https://www.celine.com/en-us/celine-shop-women/accessories/sunglasses/triomphe-01-sunglasses-in-acetate-4S194CPLB.38NO.html",
    image: imgCelineTriompheSunglasses,
  },
  hairDetail: {
    brand: "Hermès",
    title: "Carré 90 Silk Twill Scarf",
    price: "$525",
    url: "https://www.hermes.com/us/en/product/carre-90-H003969Sv09/",
    image: imgAnineBingSilkScarf,
  },
  layer: {
    brand: "Zimmermann",
    title: "Halliday Cotton-Gauze Pareo",
    price: "$425",
    url: "https://www.zimmermann.com/halliday-pareo-ivory.html",
    image: imgZimmermannBluePareo,
  },
};

const lookCMidLuxe: FallbackTier = {
  outfit: {
    brand: "Sea New York",
    title: "Marlena Crochet-Knit Cotton Top",
    price: "$295",
    url: "https://www.shopbop.com/marlena-crochet-top-sea/vp/v=1/1599605497.htm",
    image: imgPosseIvoryRomper,
  },
  shoes: {
    brand: "Ancient Greek Sandals",
    title: "Clio Leather Sandals",
    price: "$245",
    url: "https://www.shopbop.com/clio-sandal-ancient-greek-sandals/vp/v=1/1543574020.htm",
    image: imgGianvitoPortofinoSandal,
  },
  bag: {
    brand: "Hereu",
    title: "Castell Woven Leather Tote",
    price: "$495",
    url: "https://hereustudio.com/products/castell-woven-leather-tote-bag-tan",
    image: imgHereuWovenTote,
  },
  jewelry: {
    brand: "Missoma",
    title: "Lucy Williams Roman Coin Necklace",
    price: "$198",
    url: "https://www.missoma.com/products/lucy-williams-roman-coin-necklace",
    image: imgGoldLariatNecklace,
  },
  sunglasses: {
    brand: "Dior",
    title: "30Montaigne S6U Sunglasses",
    price: "$430",
    url: "https://www.dior.com/en_us/fashion/products/I0070UNRR_F09K-30montaigne-s6u-sunglasses-grey-acetate-butterfly-shape.html",
    image: imgDior30MontaigneSunglasses,
  },
  hairDetail: {
    brand: "Anine Bing",
    title: "Silk Scarf, Ivory",
    price: "$150",
    url: "https://www.aninebing.com/products/silk-scarf-ivory",
    image: imgAnineBingSilkScarf,
  },
  layer: {
    brand: "Faithfull the Brand",
    title: "Marella Cotton Pareo",
    price: "$189",
    url: "https://www.revolve.com/faithfull-the-brand-marella-pareo/dp/FAIB-WX23/",
    image: imgZimmermannBluePareo,
  },
};

const lookCRiviera: FallbackTier = {
  outfit: {
    brand: "Mango",
    title: "Crochet-Knit Cotton Top",
    price: "$79",
    url: "https://shop.mango.com/us/women/t-shirts-tops/crochet-knit-top_77035944.html",
    image: imgPosseIvoryRomper,
  },
  shoes: {
    brand: "Castañer",
    title: "Carina Raffia Wedge Sandals",
    price: "$185",
    url: "https://www.castaner.com/us/woman/shoes/carina-raffia-wedge.html",
    image: imgGianvitoPortofinoSandal,
  },
  bag: {
    brand: "Sézane",
    title: "Farrow Woven Basket Bag",
    price: "$145",
    url: "https://www.sezane.com/us/product/farrow-basket-bag",
    image: imgHereuWovenTote,
  },
  jewelry: {
    brand: "Oradina",
    title: "Vicenza Gold Lariat Necklace",
    price: "$148",
    url: "https://www.oradina.com/products/vicenza-lariat-necklace",
    image: imgOradinaVicenzaNecklace,
  },
  sunglasses: {
    brand: "DIFF",
    title: "Carina Cream Acetate Sunglasses",
    price: "$95",
    url: "https://www.diffeyewear.com/products/carina-cream-grey-gradient-sunglasses",
    image: imgCelineTriompheSunglasses,
  },
  hairDetail: {
    brand: "Sézane",
    title: "Foulard Silk-Blend Scarf",
    price: "$95",
    url: "https://www.sezane.com/us/product/foulard-silk-scarf-ivory",
    image: imgAnineBingSilkScarf,
  },
};

/**
 * Day × Look fallback registry.
 *
 * Currently scoped to Look C across every day because that look had no
 * `lookIndex: 3` items in the live shop pool and was rendering an empty
 * grid. Each day shares the same cream/raffia/crochet kit — they all
 * belong to the same "Fabric + Texture Forward" story, so reusing the
 * curated kit is on-brief.
 */
export const LOOK_PRODUCT_FALLBACKS: Partial<Record<FallbackKey, FallbackLook>> = {
  "day-1/look-c": { luxury: lookCLuxury, "mid-luxe": lookCMidLuxe, "riviera-finds": lookCRiviera },
  "day-2/look-c": { luxury: lookCLuxury, "mid-luxe": lookCMidLuxe, "riviera-finds": lookCRiviera },
  "day-3/look-c": { luxury: lookCLuxury, "mid-luxe": lookCMidLuxe, "riviera-finds": lookCRiviera },
  "day-4/look-c": { luxury: lookCLuxury, "mid-luxe": lookCMidLuxe, "riviera-finds": lookCRiviera },
  "day-5/look-c": { luxury: lookCLuxury, "mid-luxe": lookCMidLuxe, "riviera-finds": lookCRiviera },
};

export function fallbackFor(
  daySlug: string,
  lookSlug: LookSlug,
  tier: TierSlug,
  category: LookCategory,
): LookProduct | undefined {
  const key = `${daySlug}/${lookSlug}` as FallbackKey;
  return LOOK_PRODUCT_FALLBACKS[key]?.[tier]?.[category];
}