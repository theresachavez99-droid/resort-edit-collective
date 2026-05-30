import yacht from "@/assets/look-yacht.jpg";
import beach from "@/assets/look-beach.jpg";
import dayclub from "@/assets/look-dayclub.jpg";
import dinner from "@/assets/look-dinner.jpg";
import town from "@/assets/look-town.jpg";
import productAnineBingSilkScarf from "@/assets/products/anine-bing-silk-scarf.svg";
import productCelineTriompheSunglasses from "@/assets/products/celine-triomphe-sunglasses.svg";
import productDgMajolicaBikini from "@/assets/products/dg-majolica-bikini.jpg";
import productDgMajolicaSarong from "@/assets/products/dg-majolica-sarong.svg";
import productDior30MontaigneSunglasses from "@/assets/products/dior-30montaigne-sunglasses.svg";
import productDragonSantaCroceTote from "@/assets/products/dragon-santa-croce-tote.jpg";
import productGianvitoPortofinoSandal from "@/assets/products/gianvito-portofino-sandal.svg";
import productGoldLariatNecklace from "@/assets/products/gold-lariat-necklace.svg";
import productHereuWovenTote from "@/assets/products/hereu-woven-tote.svg";
import productLoroPianaPocketBag from "@/assets/products/loro-piana-pocket-bag.svg";
import productPosseStripedCropTop from "@/assets/products/posse-striped-crop-top.svg";
import productVcaFrivolePendant from "@/assets/products/vca-frivole-pendant.svg";
import productEtroPaisleyHalterMaxi from "@/assets/products/etro-paisley-halter-maxi.svg";
import productOradinaVicenzaNecklace from "@/assets/products/oradina-vicenza-necklace.svg";
import productBenAmunLaurenEarrings from "@/assets/products/ben-amun-lauren-earrings.jpg";
import productCultGaiaEosClutch from "@/assets/products/cult-gaia-eos-clutch.svg";
import productAquazzuraTequilaSandal from "@/assets/products/aquazzura-tequila-sandal.jpg";
import productRetrofeteAnatEucalyptus from "@/assets/products/retrofete-anat-eucalyptus.jpg";
import productAquazzuraTequilaCrystal from "@/assets/products/aquazzura-tequila-crystal-powder-pink.jpg";
import productLoefflerRandallRayneChampagne from "@/assets/products/loeffler-randall-rayne-champagne.jpg";
import productKendraScottDaphneGold from "@/assets/products/kendra-scott-daphne-gold.jpg";
import productDavidYurmanCableClassics from "@/assets/products/david-yurman-cable-classics.jpg";

/**
 * Product resilience model.
 *
 * Replacement hierarchy (apply in order when primary fails / sells out):
 *   1. Identical item, different retailer
 *   2. Closest alternative, same brand
 *   3. Approved substitute brand at same tier
 *   4. Item preserving silhouette + fabric + color story
 *
 * Preserve: silhouette, fabric story, destination fit, styling energy,
 * luxury feel, price tier placement, color palette.
 * Never replace on price alone. Never swap linen → polyester or quiet luxury → trend.
 *
 * Display: when `replaced` is true, show an "Updated pick" badge (never
 * "Sold out" or "Unavailable"). When `inventory_status` is "unavailable"
 * and no backup resolves, the card is hidden.
 */
export type InventoryStatus = "in_stock" | "low" | "unavailable";

export type ShopItem = {
  brand: string;
  item: string;
  price: string;
  /** Primary affiliate URL (a.k.a. primary_link). */
  href: string;
  /** Product thumbnail image URL (optional — falls back to brand monogram). */
  image?: string;
  backup_link_1?: string;
  backup_link_2?: string;
  /** ISO date of last URL/inventory verification. */
  last_verified_date?: string;
  inventory_status?: InventoryStatus;
  /** True when shown product was swapped from the original pick. */
  replaced?: boolean;
  /** CMS-only flag (e.g. "needs exact product link"). Never rendered on frontend. */
  cms_flag?: string;
  /**
   * Optional explicit grouping into one of the three "looks" rendered per day.
   * When set, the renderer puts this item into that look's tab instead of
   * using the default price-tier split. Untagged items still fall through
   * to the price-split fallback.
   */
  lookIndex?: 1 | 2 | 3;
};

/**
 * Resolve the best live link for a product, walking the backup hierarchy.
 * Returns null when nothing is usable — caller should hide the card.
 */
export function resolveProductLink(item: ShopItem): string | null {
  if (item.inventory_status === "unavailable") {
    return item.backup_link_1 || item.backup_link_2 || null;
  }
  return item.href || item.backup_link_1 || item.backup_link_2 || null;
}

export type Experience = {
  experience_name: string;
  experience_image: string;
  experience_description: string;
  affiliate_link?: string;
  backup_link?: string;
  provider: "Viator" | "GetYourGuide" | "Direct";
  destination: string;
  price_tier: "Signature Experience" | "Elevated Find" | "Riviera Find";
  category:
    | "yacht charter"
    | "beach club"
    | "cooking class"
    | "wine tasting"
    | "walking tour"
    | "day trip"
    | "transfer"
    | "boat tour"
    | "spa"
    | "nightlife"
    | "shopping";
};

export type Look = {
  day: string;
  title: string;
  subtitle: string;
  caption: string;
  image: string;
  itinerary: string;
  experience: { label: string; href: string };
  shop: ShopItem[];
  experiences: Experience[];
};

// Replace href="#" with your ShopMy / LTK / Booking.com / Viator affiliate links.
export const portofinoLooks: Look[] = [
  {
    day: "Day 1",
    title: "Yacht Day & Harbor Aperitivo",
    subtitle: "Open water, tan lines, and hidden coves.",
    caption:
      "Drift past the lighthouse into glassy green water, then ease back to the marina as the piazzetta fills with candlelight and Negronis.",
    image: yacht,
    itinerary:
      "Cast off from Marina di Portofino around 10. Two long swim stops along the Promontorio, lunch on board, a pause at Paraggi, and a dockside aperitivo at Lo Scoglio before golden hour.",
    experience: { label: "Charter a Private Yacht", href: "#" },
    shop: [
      {
        brand: "Dolce & Gabbana",
        item: "Majolica-Print Triangle Bikini",
        price: "$595",
        href: "https://www.farfetch.com/shopping/women/dolce-gabbana-majolica-print-triangle-bikini-item-34814361.aspx",
        image: productDgMajolicaBikini,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Dolce & Gabbana",
        item: "Majolica Beachwear Sarong",
        price: "$495",
        href: "https://www.net-a-porter.com/en-us/shop/product/dolcegabbana/clothing/coverups/maiolica-printed-cotton-pareo/46376663163104529",
        image: productDgMajolicaSarong,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Biankina",
        item: "Marseille Espadrille Wedges — Beige Tan",
        price: "$295",
        href: "https://biankina.com/products/marseille-eco-canvas-vegan-espadrille-wedges-beige-tan?ref=Resortedit",
        image: "https://biankina.com/cdn/shop/files/marseille-eco-canvas-vegan-espadrille-wedges-beige-tan-biankina-481366_1200x1200.jpg?v=1713884035",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Krewe",
        item: "St. Louis Matte Oyster 24K Sunglasses",
        price: "$295",
        href: "https://www.saksfifthavenue.com/product/krewe-st-louis-sunglasses-0400017131385.html",
        image: "https://www.krewe.com/cdn/shop/products/StLouis-MatteOyster-Front.png?v=1602803050&width=2048",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Ben-Amun",
        item: "Hammered Disc Earrings",
        price: "$165",
        href: "https://www.revolve.com/ben-amun-hammered-disc-earrings/dp/BAMR-WL88/",
        image: "https://is4.revolveassets.com/images/p4/n/uv/BAMR-WL88_V1.jpg",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Jenny Bird",
        item: "Tomé Gold Cuff Bracelet",
        price: "$128",
        href: "https://www.revolve.com/jenny-bird-tome-cuff/dp/JBER-WL98/",
        image: "https://is4.revolveassets.com/images/p4/n/uv/JBER-WL98_V1.jpg",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Dragon Diffusion",
        item: "Santa Croce Small Woven Leather Bag",
        price: "$485",
        href: "https://www.revolve.com/dragon-diffusion-santa-croce-small-bag/dp/DRAF-WY62/",
        image: "https://is4.revolveassets.com/images/p4/n/uv/DRAF-WY62_V1.jpg",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
    ],
    experiences: [
      {
        experience_name: "Private Yacht Charter — Portofino Coast",
        experience_image: yacht,
        experience_description: "Your own boat, your own pace, and hidden swim coves along the promontory.",
        affiliate_link: "https://www.viator.com/Portofino/d50421",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        price_tier: "Signature Experience",
        category: "yacht charter",
      },
      {
        experience_name: "Small-Group Sunset Cruise",
        experience_image: dinner,
        experience_description: "Golden hour along the Ligurian coast with a glass of chilled prosecco in hand.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/sunset-cruise",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        price_tier: "Elevated Find",
        category: "boat tour",
      },
      {
        experience_name: "Portofino Coastline Boat Excursion",
        experience_image: town,
        experience_description: "Riviera energy without the private charter price tag — a shared route past the icons.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/coastline-excursion",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        price_tier: "Riviera Find",
        category: "yacht charter",
      },
    ],
  },
  {
    day: "Day 2",
    title: "Beach Club & Long Lunches",
    subtitle: "Slow mornings, long lunches, seaside glamour.",
    caption:
      "Trade the morning for a cliffside cabana above Paraggi, then linger over crudo beneath the pines until the coastal path back into town turns gold.",
    image: beach,
    itinerary:
      "Cabana at La Fontelina from late morning. Lunch at DaV Mare with the sea below. Afternoon swim, an espresso at the bar, and the slow cliff-path walk back into town.",
    experience: { label: "Book La Fontelina", href: "#" },
    shop: [
      {
        brand: "Agua by Agua Bendita",
        item: "Primavera Canna Bikini Top",
        price: "$185",
        href: "https://us.aguabyaguabendita.com/products/secreto-primavera-canna-bikini-top-19250",
        image: "https://us.aguabyaguabendita.com/cdn/shop/files/Secreto-Primavera-Canna-Bikini-top-19250-1_1024x1024.jpg?v=1747842398",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 1,
      },
      {
        brand: "Agua by Agua Bendita",
        item: "Magenta Canna Bikini Bottom",
        price: "$165",
        href: "https://us.aguabyaguabendita.com/products/secreto-magenta-canna-bikini-bottom-19251",
        image: "https://us.aguabyaguabendita.com/cdn/shop/files/Secreto-Magenta-Canna-Bikini-bottom-19251-1_1024x1024.jpg?v=1747842368",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 1,
      },
      {
        brand: "Faithfull the Brand",
        item: "Marie-Louise Linen Midi Dress",
        price: "$229",
        href: "https://www.revolve.com/faithfull-the-brand-marie-louise-midi-dress/dp/FAIB-WD451/",
        image: "https://is4.revolveassets.com/images/p4/n/z/FAIB-WD451_V1.jpg",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      {
        brand: "Krewe",
        item: "Sasha Selene 24K Sunglasses",
        price: "$295",
        href: "https://www.krewe.com/products/sasha-selene-24k-sunglasses",
        image: "https://www.krewe.com/cdn/shop/files/Sasha-Selene-Front-Web.jpg?v=1713968782&width=2048",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      {
        brand: "Anine Bing",
        item: "Silk Scarf — Cream",
        price: "$95",
        href: "https://www.aninebing.com/products/silk-scarf-cream-and-black",
        image: productAnineBingSilkScarf,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 1,
      },
      {
        brand: "Hereu",
        item: "Castell Woven Leather Tote — Tan",
        price: "$695",
        href: "https://hereustudio.com/products/castell-woven-leather-tote-bag-tan",
        image: productHereuWovenTote,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      // -----------------------------------------------------------------
      // DAY 2 · LOOK 2 — "Long-Lunch Linen"
      // Completes the accessory stack started above (dress = outfit,
      // tote = bag, Krewe = sunglasses): adds shoes, earrings, necklace,
      // bracelet, ring, hair detail, optional layer.
      // Built on cobblestone-friendly luxury shoes, sculptural jewelry
      // (single statement pieces, no necklace-stacking), and a relaxed
      // linen shirt as the optional layer (never cropped over a maxi).
      // -----------------------------------------------------------------
      {
        brand: "Aquazzura",
        item: "Maxi Almost Bare 15 Leather Sandals — Shoes",
        price: "$750",
        href: "https://www.mytheresa.com/us/en/women/aquazzura-maxi-almost-bare-15-leather-sandals",
        backup_link_1: "https://www.net-a-porter.com/en-us/shop/product/aquazzura/shoes/flat-sandals/maxi-almost-bare-leather-sandals",
        backup_link_2: "https://www.farfetch.com/shopping/women/aquazzura-maxi-almost-bare-flat-sandals-item.aspx",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      {
        brand: "Jennifer Behr",
        item: "Tamsin Sculptural Gold Drop Earrings",
        price: "$325",
        href: "https://www.net-a-porter.com/en-us/shop/product/jennifer-behr/accessories/earrings/tamsin-gold-tone-earrings",
        backup_link_1: "https://www.shopbop.com/tamsin-earrings-jennifer-behr/vp/v=1/1542850232.htm",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      {
        brand: "Saint Laurent",
        item: "Twisted Gold-Tone Collar — Necklace",
        price: "$595",
        href: "https://www.mytheresa.com/us/en/women/saint-laurent-twisted-gold-tone-collar-necklace",
        backup_link_1: "https://www.net-a-porter.com/en-us/shop/product/saint-laurent/accessories/necklaces/twisted-gold-tone-collar",
        backup_link_2: "https://www.farfetch.com/shopping/women/saint-laurent-twisted-collar-necklace-item.aspx",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      {
        brand: "David Yurman",
        item: "Cable Classics Bracelet — 5mm",
        price: "$550",
        href: "https://www.davidyurman.com/products/cable-classics-bracelet-5mm",
        backup_link_1: "https://www.nordstrom.com/s/david-yurman-cable-classics-bracelet/3076283",
        backup_link_2: "https://www.saksfifthavenue.com/product/david-yurman-cable-classics-bracelet-0400099999999.html",
        image: productDavidYurmanCableClassics,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      {
        brand: "Missoma",
        item: "Molten Heavy Stacking Ring — Gold",
        price: "$258",
        href: "https://www.shopbop.com/molten-heavy-stacking-ring-missoma/vp/v=1/1576781299.htm",
        backup_link_1: "https://www.revolve.com/missoma-molten-stacking-ring/dp/MISR-WL56/",
        backup_link_2: "https://www.nordstrom.com/s/missoma-molten-stacking-ring/6512893",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      {
        brand: "Lelet NY",
        item: "Mini Tortoise Barrette — Hair Detail",
        price: "$225",
        href: "https://www.shopbop.com/mini-tort-barrette-lelet-ny/vp/v=1/1521352288.htm",
        backup_link_1: "https://www.net-a-porter.com/en-us/shop/product/lelet-ny/accessories/hair-accessories/mini-tortoise-barrette",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
      {
        brand: "Faithfull the Brand",
        item: "Beline Linen Shirt — Optional Layer",
        price: "$229",
        href: "https://www.revolve.com/faithfull-the-brand-beline-shirt/dp/FAIB-WS239/",
        backup_link_1: "https://www.shopbop.com/beline-shirt-faithfull-brand/vp/v=1/1592877211.htm",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        lookIndex: 2,
      },
    ],
    experiences: [
      {
        experience_name: "Cliffside Cabana Above Paraggi",
        experience_image: beach,
        experience_description: "A reserved daybed above the turquoise cove, all afternoon, fully attended.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/paraggi-beach",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        price_tier: "Signature Experience",
        category: "beach club",
      },
      {
        experience_name: "Ligurian Seafood Cooking Class",
        experience_image: town,
        experience_description: "An intimate afternoon learning trofie al pesto with the day's catch and a local vintner.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/cooking-class",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        price_tier: "Elevated Find",
        category: "cooking class",
      },
      {
        experience_name: "Cinque Terre Wine Tasting",
        experience_image: dayclub,
        experience_description: "Small-group cellar visits along the terraced cliffs — sommelier-led, beautifully paced.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/cinque-terre-wine",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        price_tier: "Riviera Find",
        category: "wine tasting",
      },
    ],
  },
  {
    day: "Day 3",
    title: "POOL & SHOPPING IN TOWN",
    subtitle: "Poolside ease, via Roma, Capri luxe.",
    caption:
      "Drift from a sun-warmed daybed into the cool of the ateliers along Via Roma, landing in the piazzetta just as the yachts come in and the Prosecco starts to pour.",
    image: dayclub,
    itinerary:
      "Morning daybed at Eight Club Portofino. A wander through the ateliers on Via Roma. Aperitivo at Langosteria as the boats come in.",
    experience: { label: "Reserve a Daybed", href: "#" },
    shop: [
      {
        brand: "Zimmermann",
        item: "Illumination Top — Spring 2025",
        price: "$525",
        href: "https://www.net-a-porter.com/en-us/shop/product/zimmermann/clothing/blouses/illumination-cropped-cotton-and-silk-blend-blouse/46376663162848181",
        image: "https://cdn.modaoperandi.com/assets/images/products/1058425/706197/medium_zimmermann-multi-rebellion-lantern-maxi-skirt.jpg",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Zimmermann",
        item: "Illumination Skirt",
        price: "$695",
        href: "https://www.net-a-porter.com/en-us/shop/product/zimmermann/clothing/midi-skirts/illumination-linen-and-silk-blend-skirt/46376663162848182",
        image: "https://cdn.modaoperandi.com/assets/images/products/1058425/706197/medium_zimmermann-multi-rebellion-lantern-maxi-skirt.jpg",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Loro Piana",
        item: "Extra Pocket Bag",
        price: "$3,450",
        href: "https://us.loropiana.com/en/p/woman/bags-FAO7203",
        image: productLoroPianaPocketBag,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Gianvito Rossi",
        item: "Portofino 105 Leather Sandals",
        price: "$895",
        href: "https://www.mytheresa.com/us/en/women/gianvito-rossi-portofino-105-leather-sandals-p00432123",
        image: productGianvitoPortofinoSandal,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Krewe",
        item: "Sahara 24K Sunglasses",
        price: "$295",
        href: "https://www.krewe.com/products/sahara-24k-sunglasses",
        image: "https://www.krewe.com/cdn/shop/files/Sasha-Maple-Front-Web.jpg?v=1774995369&width=2048",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Van Cleef & Arpels",
        item: "Frivole Pendant, Small Model",
        price: "$3,950",
        href: "https://www.vancleefarpels.com/us/en/collections/jewelry/frivole/frivole-pendant-small-model--VCARP7RM00.html",
        image: productVcaFrivolePendant,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
    ],
    experiences: [
      {
        experience_name: "Splendido Spa Afternoon",
        experience_image: yacht,
        experience_description: "A signature ritual and quiet pool access at Portofino's most storied address.",
        affiliate_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/spa",
        backup_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
        provider: "Direct",
        destination: "Portofino, Italy",
        price_tier: "Signature Experience",
        category: "spa",
      },
      {
        experience_name: "Eight Club Portofino Daybed",
        experience_image: dayclub,
        experience_description: "A poolside daybed with full service and uninterrupted harbor light.",
        affiliate_link: "https://www.eighthotels.com/en/eight-hotel-portofino/",
        backup_link: "https://www.viator.com/Portofino/d50421/eight-club",
        provider: "Direct",
        destination: "Portofino, Italy",
        price_tier: "Elevated Find",
        category: "beach club",
      },
      {
        experience_name: "Via Roma Boutique Walk",
        experience_image: town,
        experience_description: "A local stylist's loop through the ateliers of the piazzetta.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/private-shopping",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        price_tier: "Riviera Find",
        category: "shopping",
      },
    ],
  },
  {
    day: "Day 4",
    title: "Sunset Cocktails & Dinner With a View",
    subtitle: "Golden hour, candlelight, harbor glow.",
    caption:
      "A silk dress, a rooftop cocktail high above the cliffs, and a long Italian dinner unfolding as the lights of the harbor blink on one by one.",
    image: dinner,
    itinerary:
      "Cocktails on the terrace at Belmond Splendido. Dinner at La Terrazza as the lights come up around the bay. A digestivo down in the piazzetta before bed.",
    experience: { label: "Reserve at Belmond Splendido", href: "#" },
    shop: [
      {
        brand: "Retrofête",
        item: "Anat Dress in Eucalyptus",
        price: "$695",
        href: "https://www.revolve.com/retrofete-anat-dress-in-eucalyptus/dp/ROFR-WD993/",
        image: productRetrofeteAnatEucalyptus,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-30",
      },
      {
        brand: "Kendra Scott",
        item: "Daphne Gold Drop Earrings in Ivory Mother-of-Pearl",
        price: "$78",
        href: "https://www.kendrascott.com/jewelry/earrings/daphne-gold-drop-earrings-in-ivory-mother-of-pearl/196088555492.html",
        image: productKendraScottDaphneGold,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-30",
      },
      {
        brand: "David Yurman",
        item: "Cable Classics Bracelet with 18k Yellow Gold, 4mm",
        price: "$595",
        href: "https://www.nordstrom.com/s/david-yurman-cable-classics-sterling-silver-18k-yellow-gold-bracelet-4mm/3625630",
        image: productDavidYurmanCableClassics,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-30",
      },
      {
        brand: "Loeffler Randall",
        item: "Rayne Pleated Bow Frame Clutch — Champagne Metallic",
        price: "$395",
        href: "https://www.bloomingdales.com/shop/product/loeffler-randall-rayne-small-pleated-bow-frame-clutch?ID=4607288",
        image: productLoefflerRandallRayneChampagne,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-30",
      },
      {
        brand: "Aquazzura",
        item: "Tequila Crystal Embellished Sandal — Powder Pink",
        price: "$1,295",
        href: "https://www.saksfifthavenue.com/product/Aquazzura-Tequila-Crystal-Embellished-Leather-Sandals-0400099378466.html",
        image: productAquazzuraTequilaCrystal,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-30",
      },
    ],
    experiences: [
      {
        experience_name: "Sunset Cocktails at La Terrazza",
        experience_image: dinner,
        experience_description: "A reserved harbor-view table at the Splendido as the bay turns gold.",
        affiliate_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/dining",
        backup_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
        provider: "Direct",
        destination: "Portofino, Italy",
        price_tier: "Signature Experience",
        category: "nightlife",
      },
      {
        experience_name: "Chef's Table at the Harbor",
        experience_image: town,
        experience_description: "An intimate tasting menu and Italian pairings beside the boats coming in.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/chefs-table",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        price_tier: "Elevated Find",
        category: "wine tasting",
      },
      {
        experience_name: "Evening Car to Santa Margherita",
        experience_image: dayclub,
        experience_description: "A polished door-to-door transfer along the coast road, no logistics required.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/private-transfer",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        price_tier: "Riviera Find",
        category: "transfer",
      },
    ],
  },
  {
    day: "Day 5",
    title: "Market Strolls & Coastal Goodbyes",
    subtitle: "Espresso rituals and one last long lunch.",
    caption:
      "Climb the path to Castello Brown for one last look over the harbor, then drift down to a waterside table where lunch turns into the kind of farewell that already feels like a return.",
    image: town,
    itinerary:
      "Espresso at Caffè Excelsior. The walk up to Castello Brown for the view that defines Portofino. Gelato at Mario, then a boat over to the abbey at San Fruttuoso before lunch.",
    experience: { label: "Book the San Fruttuoso Boat", href: "#" },
    shop: [
      {
        brand: "Posse",
        item: "Ari Striped Crop Top — Blue",
        price: "$229",
        href: "https://www.mytheresa.com/us/en/women/posse-ari-striped-crop-top-blue-p01078791",
        image: productPosseStripedCropTop,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Anine Bing",
        item: "Classic Tank — Cream",
        price: "$89",
        href: "https://www.aninebing.com/products/cream-essential-tank-classic",
        image: "https://cdn.shopify.com/s/files/1/0630/4999/0366/products/G55WqrDtNFU8OflKrPl4At52DEhfoj6c-1.jpg?v=1696262202",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Dragon Diffusion",
        item: "Santa Croce Woven Leather Tote — Tan",
        price: "$565",
        href: "https://dragondiffusion.com/products/santa-croce-tan",
        image: productDragonSantaCroceTote,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Loeffler Randall",
        item: "Daphne Pleated Raffia Slide Sandals — Natural",
        price: "$295",
        href: "https://www.shopbop.com/daphne-pleated-knot-flat-sandal/vp/v=1/1577497953.htm",
        image: "https://loefflerrandall.com/cdn/shop/files/DAPHNE-PLS-NATRL_4266_medium.jpg?v=1738174973",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Celine",
        item: "Triomphe 01 Sunglasses in Acetate — Black",
        price: "$490",
        href: "https://www.mytheresa.com/us/en/women/celine-eyewear-triomphe-01-oval-sunglasses-black-p00576284",
        image: productCelineTriompheSunglasses,
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Jennifer Fisher",
        item: "Large Essential Necklace — Yellow Gold",
        price: "$525",
        href: "https://jenniferfisherjewelry.com/products/large-essential-necklace-yellow-gold",
        image: "https://marissacollections.com/cdn/shop/files/jennifer-fisher-jewelryboutiquenecklace-o-yellow-gold-large-essential-necklace.jpg?v=1732499091",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
    ],
    experiences: [
      {
        experience_name: "Private Cinque Terre Day",
        experience_image: beach,
        experience_description: "A guided full day across the five villages, designed for unhurried discovery.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/cinque-terre",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        price_tier: "Signature Experience",
        category: "day trip",
      },
      {
        experience_name: "San Fruttuoso Abbey by Sea",
        experience_image: yacht,
        experience_description: "A quiet crossing to a 10th-century abbey reachable only by water.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/san-fruttuoso",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        price_tier: "Elevated Find",
        category: "boat tour",
      },
      {
        experience_name: "Castello Brown Cliff Walk",
        experience_image: town,
        experience_description: "A short guided climb to the view that defines the Riviera.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/castello-brown",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        price_tier: "Riviera Find",
        category: "walking tour",
      },
    ],
  },
];

export const itinerary = [
  { day: "Day 1", title: "Yacht Day & Harbor Aperitivo", text: "Open water, tan lines, and hidden coves." },
  { day: "Day 2", title: "Beach Club & Long Lunches", text: "Slow mornings, long lunches, seaside glamour." },
  { day: "Day 3", title: "POOL & SHOPPING IN TOWN", text: "Poolside ease, via Roma, Capri luxe." },
  { day: "Day 4", title: "Sunset Cocktails & Dinner With a View", text: "Golden hour, candlelight, harbor glow." },
  { day: "Day 5", title: "Market Strolls & Coastal Goodbyes", text: "Espresso rituals and one last long lunch." },
];

export const travelTips = [
  { title: "Best Time to Go", text: "May–September for sunshine & warm waters." },
  { title: "Getting Around", text: "Walk the town, boat taxis, or rent a Vespa." },
  { title: "What to Pack", text: "Light linens, swimsuits, statement accessories & chic sandals." },
  { title: "Don't Miss", text: "Sunset at Castello Brown & a boat ride to San Fruttuoso." },
];

export type Hotel = {
  hotel_name: string;
  destination: string;
  description: string;
  image_url: string;
  affiliate_link?: string;
  booking_link?: string;
  backup_link?: string;
};

export const whereToStay: Hotel[] = [
  {
    hotel_name: "Splendido, A Belmond Hotel",
    destination: "Portofino, Italy",
    description:
      "A cliffside grande dame above the harbor. Timeless Italian glamour, bougainvillea terraces, and the most storied view on the Riviera.",
    image_url: "splendido",
    affiliate_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
    booking_link: "https://www.booking.com/hotel/it/splendido.html",
    backup_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
  },
  {
    hotel_name: "Eight Hotel Portofino",
    destination: "Portofino, Italy",
    description:
      "Quietly chic and steps from the piazzetta. A modern Italian retreat for travelers who want to live like a local in the heart of town.",
    image_url: "eight",
    affiliate_link: "https://www.booking.com/hotel/it/eight-portofino.html",
    booking_link: "https://www.eighthotels.com/en/eight-hotel-portofino/",
    backup_link: "https://www.eighthotels.com/en/eight-hotel-portofino/",
  },
  {
    hotel_name: "Hotel Piccolo Portofino",
    destination: "Portofino, Italy",
    description:
      "An intimate seaside hideaway tucked into a private cove. Sun-bleached terraces, turquoise water, and the kind of service that anticipates everything.",
    image_url: "piccolo",
    affiliate_link: "https://www.booking.com/hotel/it/piccolo.html",
    booking_link: "https://www.hotelpiccoloportofino.com/",
    backup_link: "https://www.hotelpiccoloportofino.com/",
  },
];

export const moreBrands: string[][] = [
  ["Zimmermann", "Johanna Ortiz", "Alemais"],
  ["Faithfull the Brand", "Sir", "Posse"],
  ["Agua by Agua Bendita", "Farm Rio", "Melissa Odabash"],
  ["Anine Bing", "Reformation", "Rails"],
  ["Mango", "Sézane", "Veronica Beard"],
  ["Rag & Bone", "Maje", "Kivari"],
  ["Cult Gaia", "Dragon Diffusion", "Ancient Greek Sandals"],
];