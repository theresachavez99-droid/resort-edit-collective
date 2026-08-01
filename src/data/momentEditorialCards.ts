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
import arrivalPiazzaIvoryImage from "@/assets/uploads/lilla/lilla-arrival-piazza-in-ivory-v3.jpg.asset.json";
import arrivalWellsAtHarborImage from "@/assets/uploads/lilla/lilla-arrival-wells-at-the-harbor.jpg.asset.json";

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
    price: string;
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
      key: "piazza-in-ivory",
      title: "Piazza in Ivory",
      caption:
        "An ivory silk blouse tucked into fluid ivory wide-leg trousers — tan structured leather and one small travel case for the first walk to the piazzetta.",
      image: arrivalPiazzaIvoryImage.url,
      alt: "Lilla arriving on the Portofino harbor cobblestones in a soft round-neck ivory silk blouse with short cap sleeves, tucked into fluid ivory stretch-suiting wide-leg trousers, carrying a small tan-leather structured top-handle bag with a compact tan travel case at her feet, wearing cream leather pointed-toe slingback pumps on a low block heel with dark rectangular acetate sunglasses perched on her head.",
      reference: {
        slot: "Hero Piece · Top",
        brand: "L'AGENCE",
        name: "Ellah Silk Blouse",
        color: "Ivory",
        price: "$335",
        retailer: "L'AGENCE",
        url: "https://lagence.com/products/ellah-silk-blouse-ivory",
      },
      shop: {
        stylingNote:
          "Tonal ivory head-to-toe with warm tan leather and quiet gold — a polished check-in, not airport basics.",
        products: [
          {
            slot: "Hero Piece · Trousers",
            brand: "L'AGENCE",
            name: "Pilar Pants — Ivory (fluid stretch-suiting wide-leg)",
            price: "$475",
            url: "https://www.bloomingdales.com/shop/product/lagence-pilar-pants?ID=5207763&swatchColor=Ivory",
          },
          {
            slot: "Shoes",
            brand: "Aquazzura",
            name: "Love Link 50 Leather Slingback — Cream",
            price: "$795",
            // Verified 2026-08-01: this PDP 301-redirects to aquazzura.com/eu_en
            // (region landing). Held as an explicit omission until an exact
            // product URL is approved — no substitute chosen automatically.
            url: "",
            unsourced: true,
          },
          {
            slot: "Bag",
            brand: "DeMellier",
            name: "The Midi New York — Tan Small Grain, Ecru Stitching",
            price: "$595",
            url: "https://demellierlondon.com/products/the-midi-new-york-tan-small-grain-ecru-stitching",
          },
          {
            slot: "Sunglasses",
            brand: "CELINE",
            name: "Triomphe 01 Sunglasses — Black Acetate",
            price: "$490",
            url: "https://www.celine.com/en-us/celine-shop-women/accessories/sunglasses/triomphe-01-sunglasses-in-acetate-4S194CPLB.38NO.html",
          },
          {
            slot: "Earrings",
            brand: "Jenny Bird",
            name: "Nouveaux Puff Earrings — High Polish Gold",
            price: "$138",
            // Verified 2026-08-01: /pages/ is a Shopify collection landing, not
            // a PDP. Held as an explicit omission until an exact URL is approved.
            url: "",
            unsourced: true,
          },
          {
            slot: "Bracelet",
            brand: "EF Collection",
            name: "14K Yellow Gold Mini Lola Chain Bracelet",
            price: "$795",
            url: "https://www.efcollection.com/products/mini-lola-chain-bracelet",
          },
        ],
      },
    },
    {
      key: "wells-at-the-harbor",
      title: "Wells at the Harbor",
      caption:
        "STAUD's Wells midi in polished navy cotton poplin — a fitted-waist scoop-neck dress worn with tan suede block heels and a small camel crossbody for the first turn along the harbor.",
      image: arrivalWellsAtHarborImage.url,
      alt: "Lilla walking the Portofino harbor promenade in the STAUD Wells navy stretch cotton poplin midi dress — sleeveless with a scoop neckline, corset-style seaming through a fitted waist and a fluted a-line skirt — with tan suede block-heel open-toe sandals, a small camel-textured leather crossbody and dark rectangular acetate sunglasses.",
      reference: {
        slot: "Hero Piece · Dress",
        brand: "STAUD",
        name: "Wells Dress (stretch cotton poplin)",
        color: "Navy",
        price: "$285",
        retailer: "STAUD",
        url: "https://staud.clothing/products/wells-dress-navy-1",
      },
      shop: {
        stylingNote:
          "One confident navy silhouette in crisp cotton poplin, one clean tan-leather line and quiet gold — no necklace competing with the scoop neckline.",
        products: [
          {
            slot: "Shoes",
            brand: "STAUD",
            name: "Sloane Heel — Tan Suede",
            price: "$350",
            url: "https://staud.clothing/products/sloane-heel-tan-suede",
          },
          {
            slot: "Bag",
            brand: "Polène",
            name: "Numéro Neuf Mini — Camel Textured",
            price: "$540",
            url: "https://eng.polene-paris.com/products/numero-neuf-mini-textured-camel",
          },
          {
            slot: "Sunglasses",
            brand: "Chloé",
            name: "Gayia Sunglasses — Havana",
            price: "$425",
            url: "https://www.mytheresa.com/us/en/women/chloe-gayia-round-frame-acetate-sunglasses-havana-p00888273",
          },
          {
            slot: "Earrings",
            brand: "Missoma",
            name: "Small Chubby Hoop Earrings — 18ct Gold Plated Vermeil",
            price: "$99",
            url: "https://www.missoma.com/products/small-chubby-hoop-earrings-18ct-gold-plated-vermeil",
          },
          {
            slot: "Bracelet",
            brand: "Monica Vinader",
            name: "Deia Cuff — 18kt Gold Vermeil",
            price: "$325",
            url: "https://www.mytheresa.com/us/en/women/monica-vinader-deia-18kt-gold-vermeil-cuff-p00808811",
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
          "Nighttime heels, a sculptural gold cuff and drop earrings — no ring competing with the neckline.",
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
        "An ivory cotton-lace maxi, natural jute espadrilles and a small raffia crossbody for a slow walk along the pastel harbor.",
      image: exploringHarborEloiseImage.url,
      alt: "Lilla wearing an ivory cotton-lace maxi dress along the pastel harbor of Portofino at midday, styled with natural jute espadrille wedges, a tan raffia crossbody and delicate gold jewelry.",
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
          "A polished daytime harbor look — jute espadrille wedges, a small tan raffia crossbody and delicate gold jewelry echoing the photograph. No necklace layering — one fine pendant only.",
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
    alt: "Lilla in a strapless top and oat satin trousers with a soft satin sheen, at night in Portofino, styled with pointed pumps, a clutch, gold hoops, a wide gold cuff, and a sculptural gold ring.",
    imageClassName: "object-cover object-[center_30%]",
    shop: {
      stylingNote:
        "No necklace — the sculpted strapless neckline is intentionally left clean.",
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
        {
          slot: "Ring",
          brand: "Jenny Bird",
          name: "Solene Ring — Gold",
          price: "$128",
          url: "https://www.shopbop.com/solene-ring-jenny-bird/vp/v=1/1572934765.htm",
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
