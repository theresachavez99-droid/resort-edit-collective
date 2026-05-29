import yacht from "@/assets/look-yacht.jpg";
import beach from "@/assets/look-beach.jpg";
import dayclub from "@/assets/look-dayclub.jpg";
import dinner from "@/assets/look-dinner.jpg";
import town from "@/assets/look-town.jpg";

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
  backup_link_1?: string;
  backup_link_2?: string;
  /** ISO date of last URL/inventory verification. */
  last_verified_date?: string;
  inventory_status?: InventoryStatus;
  /** True when shown product was swapped from the original pick. */
  replaced?: boolean;
  /** CMS-only flag (e.g. "needs exact product link"). Never rendered on frontend. */
  cms_flag?: string;
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
    subtitle: "Open water, hidden coves, harbor nightfall.",
    caption:
      "Drift past the lighthouse into glassy green water, then ease back to the marina as the piazzetta fills with candlelight and Negronis.",
    image: yacht,
    itinerary:
      "Cast off from Marina di Portofino around 10. Two long swim stops along the Promontorio, lunch on board, a pause at Paraggi, and a dockside aperitivo at Lo Scoglio before golden hour.",
    experience: { label: "Charter a Private Yacht", href: "#" },
    shop: [
      {
        brand: "Melissa Odabash",
        item: "Bandeau Bikini Top",
        price: "$165",
        href: "https://us.odabash.com/products/turin-ornate-bikini-top",
        backup_link_1: "https://www.net-a-porter.com/en-us/shop/product/melissa-odabash/clothing/bikinis/turin-strapless-bikini-top/1647597330752528",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Melissa Odabash",
        item: "Sarong",
        price: "$195",
        href: "https://us.odabash.com/products/pareo-white",
        backup_link_1: "https://www.saksfifthavenue.com/product/melissa-odabash-pom-pom-semi-sheer-pareo-0400021798764.html",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Cult Gaia",
        item: "Mini Raffia Tote",
        price: "$398",
        href: "https://cultgaia.com/products/tyla-top-handle-natural",
        backup_link_1: "https://www.nordstrom.com/s/7338575",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Celine",
        item: "Sunglasses",
        price: "$490",
        href: "https://www.celine.com/en-us/women/accessories/sunglasses/triomphe-01-sunglasses-in-acetate-4S194CPLB.19HO.html",
        backup_link_1: "https://www.nordstrom.com/s/5958095",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Jennifer Fisher",
        item: "Hoop Earrings",
        price: "$250",
        href: "https://jenniferfisher.com/products/1-samira-hinged-hoops",
        backup_link_1: "https://www.net-a-porter.com/en-us/shop/product/jennifer-fisher/jewelry-and-watches/earrings/baby-samira-gold-plated-hoop-earrings/24062987016597151",
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
    subtitle: "Slow mornings, seafood lunches, seaside glamour.",
    caption:
      "Trade the morning for a cliffside cabana above Paraggi, then linger over crudo beneath the pines until the coastal path back into town turns gold.",
    image: beach,
    itinerary:
      "Cabana at La Fontelina from late morning. Lunch at DaV Mare with the sea below. Afternoon swim, an espresso at the bar, and the slow cliff-path walk back into town.",
    experience: { label: "Book La Fontelina", href: "#" },
    shop: [
      {
        brand: "Dolce & Gabbana",
        item: "Lemon Print / Majolica Bikini",
        price: "$595",
        href: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/swimwear/majolica-print-padded-bikini-multicolor-O8A27JONO19IP3TN.html",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Dolce & Gabbana",
        item: "Linen Shirt",
        price: "$745",
        href: "https://www.dolcegabbana.com/en-us/fashion/women/clothing/shirts-and-tops/",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        cms_flag: "needs exact product link",
      },
      {
        brand: "Loeffler Randall",
        item: "Raffia Tote",
        price: "$350",
        href: "https://loefflerrandall.com/collections/the-raffia-edit",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        cms_flag: "needs exact product link",
      },
      {
        brand: "Anine Bing",
        item: "Paris Sunglasses",
        price: "$230",
        href: "https://www.aninebing.com/products/paris-sunglasses-black",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
      },
      {
        brand: "Shashi",
        item: "Shell Necklace",
        price: "$98",
        href: "https://shopshashi.com/pages/shell-necklace",
        inventory_status: "in_stock",
        last_verified_date: "2026-05-29",
        cms_flag: "needs exact product link",
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
    title: "Pool Club, Shopping & Aperitivo",
    subtitle: "Poolside ease, Via Roma, Campari hour.",
    caption:
      "Drift from a sun-warmed daybed into the cool of the ateliers along Via Roma, landing in the piazzetta just as the yachts come in and the Prosecco starts to pour.",
    image: dayclub,
    itinerary:
      "Morning daybed at Eight Club Portofino. A wander through the ateliers on Via Roma. Aperitivo at Langosteria as the boats come in.",
    experience: { label: "Reserve a Daybed", href: "#" },
    shop: [
      { brand: "Alemais", item: "Palermo Top", price: "$550", href: "#" },
      { brand: "Alemais", item: "Palermo Skirt", price: "$650", href: "#" },
      { brand: "Christian Louboutin", item: "Sandals", price: "$895", href: "#" },
      { brand: "Bottega Veneta", item: "Mini Jodie", price: "$1,650", href: "#" },
      { brand: "Melissa Odabash", item: "Sunglasses", price: "$245", href: "#" },
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
    subtitle: "Golden hour, candlelight, harbor below.",
    caption:
      "A silk dress, a rooftop cocktail high above the cliffs, and a long Italian dinner unfolding as the lights of the harbor blink on one by one.",
    image: dinner,
    itinerary:
      "Cocktails on the terrace at Belmond Splendido. Dinner at La Terrazza as the lights come up around the bay. A digestivo down in the piazzetta before bed.",
    experience: { label: "Reserve at Belmond Splendido", href: "#" },
    shop: [
      { brand: "Alemais", item: "Bonita Silk Maxi Dress", price: "$895", href: "#" },
      { brand: "Aquazzura", item: "Nudist Sandal", price: "$895", href: "#" },
      { brand: "Saint Laurent", item: "Kate Chain Wallet", price: "$1,650", href: "#" },
      { brand: "Jennifer Fisher", item: "Drop Earrings", price: "$275", href: "#" },
      { brand: "Tom Ford", item: "Sunglasses", price: "$420", href: "#" },
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
    subtitle: "Quiet rituals and a long last lunch.",
    caption:
      "Climb the path to Castello Brown for one last look over the harbor, then drift down to a waterside table where lunch turns into the kind of farewell that already feels like a return.",
    image: town,
    itinerary:
      "Espresso at Caffè Excelsior. The walk up to Castello Brown for the view that defines Portofino. Gelato at Mario, then a boat over to the abbey at San Fruttuoso before lunch.",
    experience: { label: "Book the San Fruttuoso Boat", href: "#" },
    shop: [
      { brand: "Anine Bing", item: "Linen Shirt", price: "$200", href: "#" },
      { brand: "Rag & Bone", item: "Tank Top", price: "$95", href: "#" },
      { brand: "Re/Done", item: "Denim Shorts", price: "$195", href: "#" },
      { brand: "Isabel Marant", item: "Sandals", price: "$495", href: "#" },
      { brand: "Celine", item: "Sunglasses", price: "$490", href: "#" },
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
  { day: "Day 1", title: "Yacht Day & Harbor Aperitivo", text: "Open water, hidden coves, harbor nightfall." },
  { day: "Day 2", title: "Beach Club & Long Lunches", text: "Slow mornings, seafood lunches, seaside glamour." },
  { day: "Day 3", title: "Pool Club, Shopping & Aperitivo", text: "Poolside ease, Via Roma, Campari hour." },
  { day: "Day 4", title: "Sunset Cocktails & Dinner With a View", text: "Golden hour, candlelight, harbor below." },
  { day: "Day 5", title: "Market Strolls & Coastal Goodbyes", text: "Quiet rituals and a long last lunch." },
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