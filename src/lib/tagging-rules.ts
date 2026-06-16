/**
 * Deterministic product tagger. Runs after Firecrawl extraction to fill
 * sourced_products.{category, subcategory, silhouette, fabric, texture,
 * print_family, color_family, destination_tags, activity_tags}.
 *
 * Rule-based — no LLM call. Editable + testable. Brand priors come from
 * brands.{categories, activities, destinations}.
 */

export type ProductTags = {
  category: string | null;
  subcategory: string | null;
  silhouette: string | null;
  fabric: string | null;
  texture: string | null;
  print_family: string | null;
  color_family: string | null;
  destination_tags: string[];
  activity_tags: string[];
};

type Hint = { brand?: string | null; product_name?: string | null; slot_category?: string | null };
type BrandPrior = { categories?: string[] | null; activities?: string[] | null; destinations?: string[] | null };

const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ["swimwear", ["bikini", "swim", "one-piece", "onepiece", "maillot", "tankini"]],
  ["coverups", ["coverup", "cover-up", "cover up", "sarong", "kaftan", "caftan", "pareo", "tunic"]],
  ["dresses", ["dress", "gown", "midi", "maxi", "mini ", "minidress"]],
  ["shoes", ["sandal", "espadrille", "heel", "mule", "slide", "wedge", "loafer", "flat"]],
  ["bags", ["bag", "tote", "clutch", "basket", "pochette", "minaudiere", "purse", "raffia"]],
  ["jewelry", ["earring", "necklace", "bracelet", "ring ", "rings", "anklet", "cuff", "pendant", "choker"]],
  ["sunglasses", ["sunglass", "shades", "eyewear", "frame"]],
  ["hats", ["hat", "panama", "fedora", "visor", "bucket"]],
];

const SUBCATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ["one-piece", ["one-piece", "onepiece", "one piece", "maillot"]],
  ["bikini", ["bikini", "triangle", "bandeau"]],
  ["sarong", ["sarong", "pareo"]],
  ["kaftan", ["kaftan", "caftan", "tunic"]],
  ["midi-dress", ["midi"]],
  ["maxi-dress", ["maxi"]],
  ["mini-dress", ["mini "]],
  ["espadrille", ["espadrille"]],
  ["sandal-flat", ["flat sandal", "thong sandal", "slide"]],
  ["sandal-heel", ["heeled sandal", "heel sandal", "ankle-tie"]],
  ["mule", ["mule"]],
  ["raffia-bag", ["raffia"]],
  ["basket-bag", ["basket"]],
  ["clutch", ["clutch", "pochette", "minaudiere"]],
  ["tote", ["tote"]],
  ["earrings", ["earring"]],
  ["necklace", ["necklace", "pendant", "choker"]],
  ["bracelet", ["bracelet", "cuff", "anklet"]],
  ["ring", ["ring"]],
];

const FABRIC_KEYWORDS: Array<[string, string[]]> = [
  ["linen", ["linen"]],
  ["silk", ["silk", "satin"]],
  ["cotton", ["cotton", "poplin", "voile"]],
  ["crochet", ["crochet"]],
  ["broderie", ["broderie", "eyelet"]],
  ["chiffon", ["chiffon"]],
  ["denim", ["denim"]],
  ["leather", ["leather"]],
  ["raffia", ["raffia", "straw"]],
  ["lyocell", ["lyocell", "tencel"]],
  ["jersey", ["jersey", "ribbed"]],
  ["lurex", ["lurex", "metallic"]],
];

const TEXTURE_KEYWORDS: Array<[string, string[]]> = [
  ["crochet", ["crochet"]],
  ["eyelet", ["eyelet", "broderie"]],
  ["smocked", ["smock", "shirred"]],
  ["pleated", ["pleat"]],
  ["ruffled", ["ruffle", "flounce", "frill"]],
  ["lace", ["lace"]],
  ["embroidered", ["embroid", "beaded", "sequin"]],
  ["fringed", ["fringe", "tassel"]],
  ["quilted", ["quilt"]],
  ["ribbed", ["ribbed"]],
];

const PRINT_KEYWORDS: Array<[string, string[]]> = [
  ["majolica", ["majolica", "ceramic", "tile"]],
  ["floral", ["floral", "rose", "garden", "bouquet", "flower"]],
  ["paisley", ["paisley"]],
  ["gingham", ["gingham", "check"]],
  ["stripe", ["stripe", "marinière"]],
  ["polka-dot", ["polka", "dot"]],
  ["abstract", ["abstract", "brushstroke"]],
  ["tropical", ["tropical", "palm", "leaf", "jungle"]],
  ["animal", ["leopard", "zebra", "snake", "tortoise"]],
  ["solid", ["solid"]],
];

const COLOR_KEYWORDS: Array<[string, string[]]> = [
  ["white", ["white", "ivory", "cream", "ecru", "off-white"]],
  ["black", ["black", "noir"]],
  ["red", ["red", "scarlet", "cherry", "crimson"]],
  ["pink", ["pink", "rose", "blush", "fuchsia", "magenta"]],
  ["coral", ["coral", "peach", "salmon"]],
  ["orange", ["orange", "tangerine", "terracotta"]],
  ["yellow", ["yellow", "lemon", "butter", "saffron"]],
  ["green", ["green", "emerald", "olive", "sage", "lime", "mint"]],
  ["blue", ["blue", "navy", "cobalt", "azure", "sky", "denim"]],
  ["aqua", ["aqua", "turquoise", "teal"]],
  ["purple", ["purple", "lilac", "lavender", "violet"]],
  ["brown", ["brown", "cognac", "tan", "camel", "chocolate"]],
  ["beige", ["beige", "sand", "stone", "natural", "nude"]],
  ["gold", ["gold", "champagne"]],
  ["silver", ["silver"]],
  ["multi", ["multicolor", "multi-color", "rainbow"]],
];

const SILHOUETTE_KEYWORDS: Array<[string, string[]]> = [
  ["a-line", ["a-line", "fit-and-flare", "flared"]],
  ["column", ["column", "sheath", "slip"]],
  ["tiered", ["tiered", "tiered-skirt"]],
  ["empire", ["empire", "babydoll"]],
  ["wrap", ["wrap", "sarong-dress"]],
  ["bodycon", ["bodycon", "fitted"]],
  ["oversized", ["oversized", "relaxed"]],
  ["off-shoulder", ["off-shoulder", "off the shoulder", "bardot"]],
  ["halter", ["halter"]],
  ["strapless", ["strapless", "bandeau"]],
];

const ACTIVITY_RULES: Array<{ when: (t: Partial<ProductTags>) => boolean; tags: string[] }> = [
  { when: (t) => t.category === "swimwear", tags: ["yacht-day", "beach-club"] },
  { when: (t) => t.subcategory === "sarong" || t.subcategory === "kaftan", tags: ["beach-club", "yacht-day"] },
  { when: (t) => t.subcategory === "espadrille", tags: ["market-morning", "long-lunch"] },
  { when: (t) => t.subcategory === "sandal-heel" || t.subcategory === "mule", tags: ["harbor-aperitivo", "statement-dinner", "sunset-cocktails"] },
  { when: (t) => t.subcategory === "clutch", tags: ["statement-dinner", "sunset-cocktails"] },
  { when: (t) => t.subcategory === "raffia-bag" || t.subcategory === "basket-bag", tags: ["beach-club", "market-morning", "long-lunch"] },
  { when: (t) => t.subcategory === "maxi-dress" && (t.fabric === "silk" || t.texture === "embroidered"), tags: ["statement-dinner", "sunset-cocktails"] },
  { when: (t) => t.subcategory === "midi-dress", tags: ["long-lunch", "harbor-aperitivo"] },
];

function firstMatch(hay: string, table: Array<[string, string[]]>): string | null {
  for (const [key, words] of table) for (const w of words) if (hay.includes(w)) return key;
  return null;
}

export function tagProduct(hint: Hint, brand: BrandPrior | null): ProductTags {
  const hay = [hint.product_name ?? "", hint.slot_category ?? "", hint.brand ?? ""]
    .join(" ")
    .toLowerCase();

  const category =
    firstMatch(hay, CATEGORY_KEYWORDS) ??
    (brand?.categories?.length === 1 ? brand.categories[0] : null);
  const subcategory = firstMatch(hay, SUBCATEGORY_KEYWORDS);
  const fabric = firstMatch(hay, FABRIC_KEYWORDS);
  const texture = firstMatch(hay, TEXTURE_KEYWORDS);
  const print_family = firstMatch(hay, PRINT_KEYWORDS) ?? (texture || fabric ? "solid" : null);
  const color_family = firstMatch(hay, COLOR_KEYWORDS);
  const silhouette = firstMatch(hay, SILHOUETTE_KEYWORDS);

  const partial = { category, subcategory, silhouette, fabric, texture, print_family, color_family };
  const activitySet = new Set<string>(brand?.activities ?? []);
  for (const rule of ACTIVITY_RULES) if (rule.when(partial)) rule.tags.forEach((t) => activitySet.add(t));

  const destinationSet = new Set<string>(brand?.destinations ?? []);
  // Italian-resort code words inferred from product naming
  if (/positano|portofino|capri|riviera|amalfi|sicilian/.test(hay)) {
    ["portofino", "capri", "amalfi"].forEach((d) => destinationSet.add(d));
  }
  if (/mykonos|santorini|greek/.test(hay)) destinationSet.add("mykonos");
  if (/st\s*barth|st-?barths|caribbean/.test(hay)) destinationSet.add("st-barth");
  if (/ibiza|formentera|balearic|mallorca/.test(hay)) destinationSet.add("mallorca");
  if (/phuket|bali|tropical/.test(hay)) destinationSet.add("phuket");

  return {
    ...partial,
    destination_tags: Array.from(destinationSet),
    activity_tags: Array.from(activitySet),
  };
}