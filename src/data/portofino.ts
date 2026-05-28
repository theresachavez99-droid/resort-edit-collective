import yacht from "@/assets/look-yacht.jpg";
import beach from "@/assets/look-beach.jpg";
import dayclub from "@/assets/look-dayclub.jpg";
import dinner from "@/assets/look-dinner.jpg";
import town from "@/assets/look-town.jpg";

export type ShopItem = { brand: string; item: string; price: string; href: string };

export type Experience = {
  experience_name: string;
  experience_image: string;
  experience_description: string;
  affiliate_link?: string;
  backup_link?: string;
  provider: "Viator" | "GetYourGuide" | "Direct";
  destination: string;
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
    subtitle: "Sail the Ligurian coast. Salty kisses, sunshine & sunset drinks.",
    caption:
      "Private yacht charter along the Ligurian coast, swim stops in hidden coves, dockside aperitivo, and sunset drinks overlooking the harbor.",
    image: yacht,
    itinerary:
      "Private charter from Marina di Portofino at 10am, swim stops along the Promontorio, aperitivo at Lo Scoglio, sunset return.",
    experience: { label: "Charter a Private Yacht", href: "#" },
    shop: [
      { brand: "Melissa Odabash", item: "Bandeau Bikini Top", price: "$165", href: "#" },
      { brand: "Melissa Odabash", item: "Sarong", price: "$195", href: "#" },
      { brand: "Cult Gaia", item: "Mini Raffia Tote", price: "$398", href: "#" },
      { brand: "Celine", item: "Sunglasses", price: "$490", href: "#" },
      { brand: "Jennifer Fisher", item: "Hoop Earrings", price: "$250", href: "#" },
    ],
    experiences: [
      {
        experience_name: "Private Yacht Charter — Portofino Coast",
        experience_image: yacht,
        experience_description: "Half-day private charter with swim stops in hidden Ligurian coves.",
        affiliate_link: "https://www.viator.com/Portofino/d50421",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        category: "yacht charter",
      },
      {
        experience_name: "Sunset Boat Cruise with Aperitivo",
        experience_image: dinner,
        experience_description: "Golden hour cruise along the promontory with chilled prosecco on board.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/sunset-cruise",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        category: "boat tour",
      },
      {
        experience_name: "Private Captain Day Experience",
        experience_image: town,
        experience_description: "Your own captain for the day — a tailored route from Paraggi to San Fruttuoso.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/private-captain",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        category: "yacht charter",
      },
    ],
  },
  {
    day: "Day 2",
    title: "Beach Club & Long Lunches",
    subtitle: "Slow mornings, seafood lunch & limoncello by the water.",
    caption:
      "Slow morning, beach club lounging, seafood lunch, limoncello by the water, and golden hour strolls.",
    image: beach,
    itinerary:
      "Reserve a cabana at La Fontelina from 11am. Lunch at DaV Mare. Afternoon swim, an espresso, and the long walk back along the cliff path.",
    experience: { label: "Book La Fontelina", href: "#" },
    shop: [
      { brand: "Dolce & Gabbana", item: "Lemon Print Bikini", price: "$595", href: "#" },
      { brand: "Dolce & Gabbana", item: "Linen Shirt", price: "$745", href: "#" },
      { brand: "Loeffler Randall", item: "Raffia Tote", price: "$350", href: "#" },
      { brand: "Anine Bing", item: "Sunglasses", price: "$230", href: "#" },
      { brand: "Shashi", item: "Shell Necklace", price: "$98", href: "#" },
    ],
    experiences: [
      {
        experience_name: "Paraggi Beach Club Cabana",
        experience_image: beach,
        experience_description: "Reserved cabana on the turquoise cove with full service all afternoon.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/paraggi-beach",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        category: "beach club",
      },
      {
        experience_name: "Ligurian Seafood Cooking Class",
        experience_image: town,
        experience_description: "Hands-on lesson in trofie al pesto and the catch of the day, with wine pairings.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/cooking-class",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        category: "cooking class",
      },
      {
        experience_name: "Cinque Terre Wine Tasting Day",
        experience_image: dayclub,
        experience_description: "Boutique cellar visits across the cliffs of Cinque Terre with sommelier guide.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/cinque-terre-wine",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        category: "wine tasting",
      },
    ],
  },
  {
    day: "Day 3",
    title: "Pool Club, Shopping & Aperitivo",
    subtitle: "Poolside cocktails, boutique shopping & marina aperitivo.",
    caption:
      "Poolside cocktails, boutique shopping through town, and evening aperitivo overlooking the marina.",
    image: dayclub,
    itinerary:
      "Pool day at Eight Club Portofino. Late afternoon aperitivo at Langosteria. Boutique browsing along Via Roma.",
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
        experience_name: "Eight Club Portofino Daybed",
        experience_image: dayclub,
        experience_description: "Poolside daybed with bottle service and harbor views all afternoon.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/eight-club",
        backup_link: "https://www.eighthotels.com/en/eight-hotel-portofino/",
        provider: "Direct",
        destination: "Portofino, Italy",
        category: "beach club",
      },
      {
        experience_name: "Private Shopping Tour — Via Roma",
        experience_image: town,
        experience_description: "A local stylist walks you through the boutiques of Portofino's piazzetta.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/private-shopping",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        category: "shopping",
      },
      {
        experience_name: "Splendido Spa Afternoon",
        experience_image: yacht,
        experience_description: "Signature massage and pool access at the Belmond Splendido spa.",
        affiliate_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/spa",
        backup_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
        provider: "Direct",
        destination: "Portofino, Italy",
        category: "spa",
      },
    ],
  },
  {
    day: "Day 4",
    title: "Sunset Cocktails & Dinner With a View",
    subtitle: "Golden hour cocktails & a destination dinner over the harbor.",
    caption:
      "Golden hour cocktails followed by a destination dinner overlooking Portofino Harbor.",
    image: dinner,
    itinerary:
      "Sunset drinks at Belmond Hotel Splendido. Dinner at La Terrazza overlooking the marina. Nightcap at the piazza.",
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
        experience_description: "Reserved harbor-view table for golden hour cocktails at the Splendido.",
        affiliate_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/dining",
        backup_link: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
        provider: "Direct",
        destination: "Portofino, Italy",
        category: "nightlife",
      },
      {
        experience_name: "Chef's Table Dinner Experience",
        experience_image: town,
        experience_description: "Tasting menu with paired Italian wines at a celebrated harbor restaurant.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/chefs-table",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        category: "wine tasting",
      },
      {
        experience_name: "Private Driver to Santa Margherita",
        experience_image: dayclub,
        experience_description: "Chauffeured transfer for the evening — door-to-door along the coast road.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/private-transfer",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        category: "transfer",
      },
    ],
  },
  {
    day: "Day 5",
    title: "Market Strolls & Coastal Goodbyes",
    subtitle: "Coffee walks, local shops & one final waterfront lunch.",
    caption:
      "Coffee walks, local shops, coastal wandering, and one final waterfront lunch.",
    image: town,
    itinerary:
      "Morning espresso at Caffè Excelsior. Climb to Castello Brown for the harbor view. Gelato at Gelateria Mario. A boat ride to San Fruttuoso.",
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
        experience_name: "San Fruttuoso Abbey Boat Tour",
        experience_image: yacht,
        experience_description: "Short boat ride to the hidden 10th-century abbey reachable only by sea.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/san-fruttuoso",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        category: "boat tour",
      },
      {
        experience_name: "Castello Brown Walking Tour",
        experience_image: town,
        experience_description: "Guided climb to the cliffside castello with the best view in Portofino.",
        affiliate_link: "https://www.getyourguide.com/portofino-l1093/castello-brown",
        backup_link: "https://www.viator.com/Portofino/d50421",
        provider: "GetYourGuide",
        destination: "Portofino, Italy",
        category: "walking tour",
      },
      {
        experience_name: "Cinque Terre Day Trip",
        experience_image: beach,
        experience_description: "Full-day excursion through the five villages with a local guide.",
        affiliate_link: "https://www.viator.com/Portofino/d50421/cinque-terre",
        backup_link: "https://www.getyourguide.com/portofino-l1093/",
        provider: "Viator",
        destination: "Portofino, Italy",
        category: "day trip",
      },
    ],
  },
];

export const itinerary = [
  { day: "Day 1", title: "Yacht Day & Harbor Aperitivo", text: "Private yacht charter along the Ligurian coast, swim stops in hidden coves, dockside aperitivo, and sunset drinks overlooking the harbor." },
  { day: "Day 2", title: "Beach Club & Long Lunches", text: "Slow morning, beach club lounging, seafood lunch, limoncello by the water, and golden hour strolls." },
  { day: "Day 3", title: "Pool Club, Shopping & Aperitivo", text: "Poolside cocktails, boutique shopping through town, and evening aperitivo overlooking the marina." },
  { day: "Day 4", title: "Sunset Cocktails & Dinner With a View", text: "Golden hour cocktails followed by a destination dinner overlooking Portofino Harbor." },
  { day: "Day 5", title: "Market Strolls & Coastal Goodbyes", text: "Coffee walks, local shops, coastal wandering, and one final waterfront lunch." },
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