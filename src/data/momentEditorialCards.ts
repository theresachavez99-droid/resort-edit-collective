/**
 * Page-local editorial-reference card data for `/portofino/$moment`.
 * Extracted verbatim from the route module so read-only audit tooling can
 * import the data without pulling in React components.
 */
import nightcapIvorySatinImage from "@/assets/uploads/lilla/nightcap-lilla-ivory-after-dark-cami-v3-oat-trousers.jpg.asset.json";
import nightcapBlackCapeImage from "@/assets/uploads/lilla/nightcap-lilla-black-cape.jpg.asset.json";
import poolLoungingWaveKnitImage from "@/assets/uploads/lilla/lilla-pool-lounging-white-wave-knit.jpg.asset.json";
import longLunchStarfruitSilkImage from "@/assets/uploads/lilla/lilla-long-lunch-starfruit-silk.jpg.asset.json";
import rivieraDinnerTideBlueHourImage from "@/assets/uploads/lilla/lilla-riviera-dinner-tide-at-blue-hour.jpg.asset.json";
import longLunchWhiteEyeletImage from "@/assets/uploads/lilla/lilla-long-lunch-white-eyelet-at-noon-v2.jpg.asset.json";
import exploringHarborEloiseImage from "@/assets/uploads/lilla/lilla-exploring-harbor-eloise-at-noon.jpg.asset.json";
import arrivalLinenVestHarborImage from "@/assets/uploads/lilla/arrival-lilla-linen-vest-harbor.jpg.asset.json";
import arrivalButterMargiHarborImage from "@/assets/uploads/lilla/arrival-lilla-butter-margi-harbor.jpg.asset.json";
import shoppingGreenEyeletImage from "@/assets/uploads/lilla/shopping-lilla-green-eyelet-via-roma.png.asset.json";

/**
 * Additional page-local editorial-reference cards appended to the "More
 * Resort Edit Looks" grid on select moment pages. Each card carries one
 * real reference product with a direct outbound "SHOP THE REFERENCE" link.
 * Preserves any existing siblings and Nightcap-specific overrides.
 */
export type ExtraEditorialCard = {
  key: string;
  title: string;
  caption: string;
  image: string;
  alt: string;
  imageClassName?: string;
  reference: {
    brand: string;
    name: string;
    color?: string;
    /** Omitted when no verified retail price is on record. */
    price?: string;
    retailer: string;
    url: string;
    slot?: string;
  };
  /** Optional expanded complete-look shop rows rendered beneath the
   *  reference product via an inline "SHOP COMPLETE LOOK" expander. */
  shop?: {
    stylingNote?: string;
    products: Array<{
      slot: string;
      brand: string;
      name: string;
      price?: string;
      url: string;
      /**
       * True when this slot is an editor-approved piece with no verified exact
       * product URL yet. The row is withheld from the public page instead of
       * shipping a homepage/category/dead link, and the launch audit reports it
       * as an explicit omission rather than a silent gap.
       */
      unsourced?: boolean;
    }>;
  };
};
export const MOMENT_EXTRA_EDITORIAL_CARDS: Record<string, ExtraEditorialCard[]> = {
  "arrival": [
    {
      key: "linen-vest-at-the-harbor",
      title: "Linen Vest at the Harbor",
      caption:
        "Faithfull's Maya vest and Isotta pant in natural linen — tonal, quietly tailored, and finished with warm tan leather and slim gold for the first walk along the harbor.",
      image: arrivalLinenVestHarborImage.url,
      alt: "Lilla on the Portofino harbor cobblestones in a natural linen square-neck button-front vest and matching high-rise wide-leg linen trousers, carrying a natural raffia tote, wearing flat tan leather sandals, sunglasses resting on her softly pinned-up hair, with layered delicate gold necklaces, small gold hoops and a slim polished gold cuff.",
      reference: {
        slot: "Hero Piece · Vest",
        brand: "FAITHFULL THE BRAND",
        name: "Maya Vest",
        color: "Natural",
        price: "$159",
        retailer: "Revolve",
        url: "https://www.revolve.com/faithfull-maya-vest-in-natural/dp/FAIB-WS275/",
      },
      shop: {
        stylingNote:
          "Natural linen tailoring worn as a set, warmed with tan leather and one gold family — polished arrival dressing, never boho.",
        products: [
          {
            slot: "Hero Piece · Trousers",
            brand: "FAITHFULL THE BRAND",
            name: "Isotta Pant — Natural (high-rise linen straight leg)",
            price: "$239",
            url: "https://www.revolve.com/faithfull-isotta-pant-in-natural/dp/FAIB-WP74/",
          },
          {
            slot: "Shoes",
            brand: "Ancient Greek Sandals",
            name: "Clotho Sandal — Natural",
            price: "$95",
            url: "https://www.revolve.com/ancient-greek-sandals-clotho-sandal-in-natural/dp/ANCR-WZ10/",
          },
          {
            slot: "Bag",
            brand: "DeMellier London",
            name: "Genova Top Handle Bag — Light Tan",
            url: "https://www.revolve.com/demellier-london-genova-top-handle-bag-in-light-tan/dp/DEMR-WY21/",
          },
          {
            slot: "Sunglasses",
            brand: "Le Specs",
            name: "Work It! Sunglasses — Ivory Tan Tint",
            price: "$140",
            url: "https://www.revolve.com/le-specs-work-it-sunglasses-in-ivory-tan-tint/dp/LSPE-WG68/",
          },
          {
            slot: "Belt",
            brand: "B-Low the Belt",
            name: "Nolami Belt — Latte & Gold",
            price: "$189",
            url: "https://www.revolve.com/blow-the-belt-nolami-in-latte-gold/dp/BLOW-WA317/",
          },
          {
            slot: "Earrings",
            brand: "Jenny Bird",
            name: "Nouveaux Puff Earrings — Gold",
            price: "$158",
            url: "https://www.revolve.com/jenny-bird-nouveaux-puff-earrings-in-gold/dp/JENR-WL199/",
          },
          {
            slot: "Necklace",
            brand: "Jenny Bird",
            name: "Lyra Necklace — Gold",
            price: "$110",
            url: "https://www.revolve.com/jenny-bird-lyra-necklace-in-gold/dp/JENR-WL221/",
          },
          {
            slot: "Bracelet",
            brand: "Jenny Bird",
            name: "Uma Bangle Stack — Gold",
            price: "$175",
            url: "https://www.revolve.com/jenny-bird-uma-bangle-stack-in-gold/dp/JENR-WL43/",
          },
        ],
      },
    },
    {
      key: "butter-light-arrival",
      title: "Butter Light on Arrival",
      caption:
        "Just off the boat and into the village — STAUD's Margi midi in soft butter, a fine ivory cashmere cardigan draped at the shoulders, and quiet woven leather for the walk up from the harbor.",
      image: arrivalButterMargiHarborImage.url,
      alt: "Editorial reference frame for the Arrival butter-dress look in Portofino — a soft butter midi dress worn with a fine ivory cashmere cardigan draped over the shoulders, flat leather sandals, a woven leather bag, tortoise sunglasses and sculptural gold jewelry.",
      reference: {
        slot: "Hero Piece · Dress",
        brand: "STAUD",
        name: "Margi Dress",
        color: "Butter",
        retailer: "STAUD",
        url: "https://staud.clothing/products/margi-dress-butter?variant=45845141586093",
      },
      shop: {
        stylingNote:
          "Travel ease, elevated: butter poplin, a fine ivory knit off the shoulders, one warm leather line and a single sculptural gold family. No necklace — the gathered strap bodice reads cleaner bare, so the weight sits at the ears and wrist.",
        products: [
          {
            slot: "Cardigan",
            brand: "W. Cashmere",
            name: "Asteria Cardigan — Ivory (fine-gauge cashmere)",
            price: "$334",
            url: "https://www.revolve.com/w-cashmere-asteria-cardigan-in-ivory/dp/WCAR-WK15/",
          },
          {
            slot: "Shoes",
            brand: "St. Agni",
            name: "Fine Strap Sandal — Chocolate (flat leather)",
            price: "$263",
            url: "https://www.revolve.com/st-agni-fine-strap-sandal-in-chocolate/dp/SAGN-WZ35/",
          },
          {
            slot: "Bag",
            brand: "Dragon Diffusion",
            name: "Triple Jump Mini Woven Leather Bag — Tan",
            price: "$350",
            url: "https://www.revolve.com/dragon-diffusion-triple-jump-mini-bag-in-tan/dp/DRAR-WY4/",
          },
          {
            slot: "Sunglasses",
            brand: "Le Specs",
            name: "The Muse Sunglasses — Tort & Brown Mono Polarized",
            price: "$92",
            url: "https://www.revolve.com/le-specs-the-muse-sunglasses-in-tort-brown-mono-polarized/dp/LSPE-WG87/",
          },
          {
            slot: "Earrings",
            brand: "LELET NY",
            name: "Hera Hammered Earrings — Gold",
            price: "$182",
            url: "https://www.revolve.com/lelet-ny-hera-hammered-earrings-in-gold/dp/LELR-WL16/",
          },
          {
            slot: "Bracelet",
            brand: "LELET NY",
            name: "Glossy Void Arched Cuff Bracelet — Gold",
            price: "$173",
            url: "https://www.revolve.com/lelet-ny-glossy-void-arched-cuff-bracelet-in-gold/dp/LELR-WL20/",
          },
        ],
      },
    },
  ],
  "riviera-dinner": [
    {
      key: "tide-at-blue-hour",
      title: "Tide at Blue Hour",
      caption:
        "A deep tide-blue off-the-shoulder silhouette, sculpted at the waist and paired with sleek evening heels and brushed gold above the harbor at twilight.",
      image: rivieraDinnerTideBlueHourImage.url,
      alt: "Lilla in an original off-the-shoulder deep-blue silk maxi on a candlelit stone terrace over Portofino harbor at blue hour, with gold cuff, gold drop earrings and sleek black evening sandals.",
      reference: {
        slot: "Reference Dress",
        brand: "Cult Gaia",
        name: "Rivoli Dress",
        color: "Tide",
        price: "$798",
        retailer: "Bloomingdale's",
        url: "https://www.bloomingdales.com/shop/product/cult-gaia-rivoli-dress?ID=6135592",
      },
      shop: {
        stylingNote:
          "Nighttime heels, a sculptural gold cuff and drop earrings — nothing competing with the off-the-shoulder line.",
        products: [
          {
            slot: "Shoes",
            brand: "Aquazzura",
            name: "So Nude 105 Leather Sandals — Black",
            price: "$795",
            url: "https://www.net-a-porter.com/en-us/shop/product/aquazzura/shoes/high-heel/so-nude-105-leather-sandals/1647597331686937",
          },
          {
            slot: "Bag",
            brand: "Cult Gaia",
            name: "Hera Nano Acrylic Clutch — Gold",
            price: "$298",
            url: "https://www.cultgaia.com/products/hera-nano-acrylic-clutch-gold",
          },
          {
            slot: "Cuff",
            brand: "Jenny Bird",
            name: "Ola Arm Cuff — High Polish Gold",
            price: "$138",
            url: "https://www.shopbop.com/ola-arm-cuff-jenny-bird/vp/v=1/1581195563.htm",
          },
          {
            slot: "Earrings",
            brand: "Jennifer Behr",
            name: "Mireille Gold Drop Earrings",
            price: "$395",
            url: "https://jenniferbehr.com/products/mireille-earrings-gold",
          },
        ],
      },
    },
  ],
  "pool-lounging": [
    {
      key: "white-wave-knit",
      title: "White Wave Knit",
      caption:
        "A body-skimming white open knit, a woven mini bag and bare feet between the pool and the Ligurian Sea.",
      image: poolLoungingWaveKnitImage.url,
      alt: "Lilla wearing an original white open-knit midi pool dress beside a cliffside Portofino pool.",
      reference: {
        slot: "Reference Dress",
        brand: "STAUD",
        name: "Jessica Knit Dress",
        color: "White",
        price: "$295",
        retailer: "Shopbop",
        url: "https://www.shopbop.com/jessica-knit-dress-staud/vp/v=1/1530716894.htm",
      },
    },
  ],
  "long-lunch": [
    {
      key: "starfruit-at-lunch",
      title: "Starfruit at Lunch",
      caption:
        "A vivid starfruit waist, a softly fluted midi hem and cream accessories for a long table by the harbor.",
      image: longLunchStarfruitSilkImage.url,
      alt: "Lilla wearing an original fitted starfruit silk-faille midi dress at a sunlit long lunch in Portofino.",
      reference: {
        slot: "Reference Dress",
        brand: "Cinq à Sept",
        name: "Jerome Dress",
        color: "Starfruit",
        price: "$267 (was $445)",
        retailer: "Bloomingdale's",
        url: "https://www.bloomingdales.com/shop/product/cinq-a-sept-jerome-dress?ID=5926128&swatchColor=Starfruit",
      },
      shop: {
        products: [
          {
            slot: "Bag",
            brand: "Veronica Beard",
            name: "Anchor Raffia Effect Clutch",
            price: "$298",
            url: "https://www.bloomingdales.com/shop/product/veronica-beard-anchor-raffia-effect-clutch?ID=6002151",
          },
        ],
      },
    },
    {
      key: "white-eyelet-at-noon",
      title: "White Eyelet at Noon",
      caption:
        "A fitted white eyelet midi, warm raffia and tan leather for a slow, sunlit lunch along the Portofino quay.",
      image: longLunchWhiteEyeletImage.url,
      alt: "Lilla in an original fitted white cotton-eyelet midi at a sunlit Portofino harbor lunch, styled with a natural raffia tote, tan leather slide sandals and gold hoops.",
      reference: {
        slot: "Reference Dress",
        brand: "Cara Cara",
        name: "Calypso Dress",
        color: "White",
        price: "$595",
        retailer: "Revolve",
        url: "https://www.revolve.com/calypso-dress/dp/CCAR-WD61/",
      },
      shop: {
        stylingNote:
          "Daytime resort accents — a natural raffia tote, tan leather slides and a slim gold cuff.",
        products: [
          {
            slot: "Shoes",
            brand: "Ancient Greek Sandals",
            name: "Eleftheria Leather Slides — Natural Tan",
            price: "$275",
            url: "https://www.net-a-porter.com/en-us/shop/product/ancient-greek-sandals/shoes/flat-sandals/eleftheria-leather-slides/1647597326961148",
          },
          {
            slot: "Bag",
            brand: "Dragon Diffusion",
            name: "Santa Croce Woven Leather Tote — Tan",
            price: "$620",
            url: "https://www.dragondiffusion.com/collections/all/products/santa-croce-tan",
          },
          {
            slot: "Sunglasses",
            brand: "CELINE",
            name: "Triomphe Cat-Eye Sunglasses — Champagne Crystal",
            price: "$490",
            url: "https://www.neimanmarcus.com/p/celine-triomphe-cat-eye-sunglasses-prod284390071",
          },
          {
            slot: "Earrings",
            brand: "Jenny Bird",
            name: "Mini Tome Hoop Earrings — High Polish Gold",
            price: "$128",
            url: "https://www.shopbop.com/mini-tome-hoop-earrings-jenny/vp/v=1/1535586561.htm",
          },
          {
            slot: "Cuff",
            brand: "Jenny Bird",
            name: "Ola Arm Cuff — High Polish Gold",
            price: "$138",
            url: "https://www.shopbop.com/ola-arm-cuff-jenny-bird/vp/v=1/1581195563.htm",
          },
        ],
      },
    },
  ],
  "exploring-the-harbor": [
    {
      key: "eloise-at-noon",
      title: "Eloise at Noon",
      caption:
      "An ivory cotton-lace maxi, natural jute espadrille wedges and a woven raffia bag for a slow walk along the pastel harbor.",
      image: exploringHarborEloiseImage.url,
    alt: "Lilla wearing an ivory cotton-lace maxi dress along the pastel harbor of Portofino at midday, styled with ankle-tie jute espadrille wedges, a woven raffia bag and a fine gold pendant.",
      reference: {
        slot: "Reference Dress",
        brand: "SIMKHAI",
        name: "Eloise Lace Maxi Dress",
        color: "Ivory",
        price: "$595",
        retailer: "Shopbop",
        url: "https://www.shopbop.com/eloise-lace-maxi-dress-simkhai/vp/v=1/1566292527.htm",
      },
      shop: {
        stylingNote:
        "A polished daytime harbor look — jute espadrille wedges, a woven raffia bag and delicate gold jewelry echoing the photograph. No necklace layering — one fine pendant only.",
        products: [
          {
            slot: "Shoes",
            brand: "Castañer",
            name: "Carina 80 Canvas & Jute Espadrille Wedges — Ivory",
            price: "$225",
            url: "https://www.net-a-porter.com/en-us/shop/product/castaner/shoes/wedge/carina-80-canvas-and-jute-wedge-espadrilles/1647597326963298",
          },
          {
            slot: "Bag",
            brand: "LOEWE",
            name: "Paula's Ibiza Puzzle Fold Raffia Crossbody",
            price: "$1,850",
            url: "https://www.net-a-porter.com/en-us/shop/product/loewe/bags/tote-bags/plus-paula-s-ibiza-puzzle-fold-medium-leather-trimmed-raffia-tote/1647597333838602",
          },
          {
            slot: "Necklace",
            brand: "EF Collection",
            name: "14K Yellow Gold Diamond Mini Disc Pendant Necklace",
            price: "$450",
            url: "https://www.bloomingdales.com/shop/product/ef-collection-14k-yellow-gold-diamond-mini-disc-pendant-necklace-16-18?ID=4992549",
          },
          {
            slot: "Earrings",
            brand: "Jenny Bird",
            name: "Mini Tome Hoop Earrings — High Polish Gold",
            price: "$128",
            url: "https://www.shopbop.com/mini-tome-hoop-earrings-jenny/vp/v=1/1535586561.htm",
          },
          {
            slot: "Bracelet",
            brand: "EF Collection",
            name: "14K Yellow Gold Lola Open Mini Chain Link Bracelet",
            price: "$625",
            url: "https://www.bloomingdales.com/shop/product/ef-collection-14k-yellow-gold-lola-open-mini-chain-link-bracelet?ID=4992610",
          },
        ],
      },
    },
  ],
  "shopping": [
    {
      key: "green-eyelet-on-via-roma",
      title: "Green Eyelet on Via Roma",
      caption:
        "A strapless sprout-green eyelet midi with a gathered skirt, worn with a woven raffia top-handle bag, alabaster sunglasses and the finest diamonds for a slow morning through the boutiques.",
      image: shoppingGreenEyeletImage.url,
      alt: "Lilla walking the boutique-lined Via Roma in Portofino in a strapless sprout-green eyelet midi dress with a fitted bodice and gathered skirt, carrying a woven raffia top-handle bag, wearing tan thong heels and delicate gold and diamond jewelry.",
      reference: {
        slot: "Hero Piece · Dress",
        brand: "STAUD",
        name: "Nia Dress",
        color: "Sprout",
        retailer: "STAUD",
        url: "https://staud.clothing/products/nia-dress-sprout?variant=45410497069229",
      },
      shop: {
        stylingNote:
          "One green note, everything else warm and quiet — alabaster acetate with 18K hardware and fine diamonds at the throat, ears and wrist. No ring.",
        products: [
          {
            slot: "Shoes",
            brand: "STAUD",
            name: "Tan Leather Thong Heel",
            // The supplied link resolves to the Nia dress PDP, not a shoe.
            // Held as an explicit omission until an exact shoe URL is approved.
            url: "",
            unsourced: true,
          },
          {
            slot: "Sunglasses",
            brand: "KREWE",
            name: "St. Louis Sunglasses — Alabaster 18K",
            url: "https://www.krewe.com/collections/st-louis-classics/products/st-louis-alabaster-18k-sunglasses",
          },
          {
            slot: "Necklace",
            brand: "STONE AND STRAND",
            name: "Tiny Diamond Choker",
            url: "https://www.stoneandstrand.com/products/tiny-diamond-choker",
          },
          {
            slot: "Earrings",
            brand: "STONE AND STRAND",
            name: "Bezel Diamond Huggies",
            url: "https://www.stoneandstrand.com/products/bezel-diamond-huggies",
          },
          {
            slot: "Bracelet",
            brand: "STONE AND STRAND",
            name: "Noble Diamond Tennis Bracelet",
            url: "https://www.stoneandstrand.com/products/noble-diamond-tennis-bracelet",
          },
        ],
      },
    },
  ],
};

/**
 * Nightcap-only editorial-reference cards for the "More Resort Edit Looks"
 * grid. These are editorial-only (no product grid, no COMING SOON CTA)
 * because the exact affiliate product sets for these two looks are not yet
 * approved. When the shopping edits are approved, wire them through the
 * normal sibling-look pipeline and remove this override.
 */
export type NightcapEditorialCard = {
  key: string;
  title: string;
  caption: string;
  image: string;
  alt: string;
  /** Optional Tailwind object-position override for taller source images
   *  so Lilla's head and shoes are both preserved inside the 4:5 frame. */
  imageClassName?: string;
  /** Optional complete-look shop rows for an inline expand. Text-based
   *  linked product rows — no fabricated thumbnails. */
  shop?: {
    stylingNote?: string;
    products: Array<{
      slot: string;
      brand: string;
      name: string;
      price: string;
      url: string;
      /** See `ExtraEditorialCard` — explicit, audited omission marker. */
      unsourced?: boolean;
    }>;
  };
};
export const NIGHTCAP_EDITORIAL_CARDS: NightcapEditorialCard[] = [
  {
    key: "ivory-after-dark",
    title: "Ivory After Dark",
    caption:
      "A sculpted strapless top and fluid oat satin trousers, finished with sculptural gold and pointed pumps for one final cocktail by the harbor.",
    image: nightcapIvorySatinImage.url,
    alt: "Lilla in an ivory strapless satin top and matching oat satin trousers at night in Portofino, styled with black pointed pumps, a small black clutch and a wide gold cuff.",
    imageClassName: "object-cover object-[center_30%]",
    shop: {
      stylingNote:
        "Photographed in ivory; the pieces below are linked in the black colorway currently stocked. No necklace — the sculpted strapless neckline is intentionally left clean.",
      products: [
        {
          slot: "Hero Piece · Top",
          brand: "L'AGENCE",
          name: "Asuka Shirred Mesh Top — Black",
          price: "$206.50 (was $295)",
          url: "https://www.bloomingdales.com/shop/product/lagence-asuka-shirred-mesh-top?ID=5887256",
        },
        {
          slot: "Hero Piece · Pants",
          brand: "L'AGENCE",
          name: "Pilar Satin Pants",
          price: "$475",
          url: "https://www.bloomingdales.com/shop/product/lagence-pilar-pants?ID=5207763&swatchColor=Black",
        },
        {
          slot: "Shoes",
          brand: "Gianvito Rossi",
          name: "Gianvito 85 Pump — Black Leather",
          price: "$875",
          url: "https://www.nordstrom.com/s/gianvito-85-pump/8105626?color=Black+Leather",
        },
        {
          slot: "Bag",
          brand: "Jimmy Choo",
          name: "Bonny Clutch — Black Satin",
          price: "$895",
          url: "https://us.jimmychoo.com/en/women/bags/bonny-clutch/black-satin-clutch-bag-BONNYCLUTCHSAT010003.html",
        },
        {
          slot: "Earrings",
          brand: "Jenny Bird",
          name: "Mini Tome Hoop Earrings — High Polish Gold",
          price: "$128",
          url: "https://www.shopbop.com/mini-tome-hoop-earrings-jenny/vp/v=1/1535586561.htm",
        },
        {
          slot: "Cuff",
          brand: "Jenny Bird",
          name: "Ola Arm Cuff — High Polish Gold",
          price: "$138",
          url: "https://www.shopbop.com/ola-arm-cuff-jenny-bird/vp/v=1/1581195563.htm",
        },
      ],
    },
  },
  {
    key: "the-midnight-drape",
    title: "The Midnight Drape",
    caption:
      "Liquid black satin, an asymmetric cape line, and brushed gold against the lights of the piazzetta.",
    image: nightcapBlackCapeImage.url,
    alt: "Lilla in a black satin asymmetric cape dress at night in Portofino, styled with brushed gold evening accessories.",
    // Taller portrait source — contain against ink so the full cape line,
    // head, and shoes all stay inside the 4:5 card frame.
    imageClassName: "object-contain bg-ink",
  },
];
