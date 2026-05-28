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
    subtitle: "An unhurried day at sea, ending in candlelight on the marina.",
    caption:
      "Leave the piazzetta behind by mid-morning. Drift past the lighthouse, drop anchor wherever the water turns the right shade of green, and let the afternoon dissolve into espressos on deck. Back in port by dusk, just in time for a Negroni and the slow Ligurian sunset.",
    image: yacht,
    itinerary:
      "Cast off from Marina di Portofino around 10. Two long swim stops along the Promontorio, lunch on board, a pause at Paraggi, and a dockside aperitivo at Lo Scoglio before golden hour.",
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
    subtitle: "Cabana hours measured in espressos, sea swims and chilled white wine.",
    caption:
      "The kind of day that doesn't need a plan. A cliffside cabana, a long table beneath the pines, a plate of just-caught crudo, and the gentle pull of the tide between courses. Walk it off along the coastal path as the light softens.",
    image: beach,
    itinerary:
      "Cabana at La Fontelina from late morning. Lunch at DaV Mare with the sea below. Afternoon swim, an espresso at the bar, and the slow cliff-path walk back into town.",
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
    subtitle: "A loungewear morning, a stylist's afternoon, a Campari kind of evening.",
    caption:
      "Trade the boat for a daybed. The kind of slow day that drifts from poolside to the cool of a boutique fitting room, then back into the piazzetta as it begins to fill. Linen still damp from a swim, a new pair of sandals, and Prosecco that arrives before you've asked.",
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
    subtitle: "Dress for it — the night the whole trip has been building toward.",
    caption:
      "The one night to dress for. Heels you can manage on cobblestones, a silk that catches the breeze, and the rooftop hush of a hotel built into the cliffside. Dinner arrives one course at a time, and so does the moon over the harbor.",
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
    subtitle: "The morning to wander, the lunch to linger, the goodbye to take slowly.",
    caption:
      "Save the last day for the small rituals — the third espresso, the climb to Castello Brown, the gelato eaten standing up. One unhurried lunch on the water, one last boat ride into the cove, and the kind of departure that already feels like a promise to return.",
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
  { day: "Day 1", title: "Yacht Day & Harbor Aperitivo", text: "Open water, hidden coves, and a slow return to port just as the light turns gold." },
  { day: "Day 2", title: "Beach Club & Long Lunches", text: "A cabana at the water's edge, a tablecloth in the shade, and nowhere to be." },
  { day: "Day 3", title: "Pool Club, Shopping & Aperitivo", text: "From a quiet daybed to the ateliers on Via Roma, then into the piazzetta for a Spritz." },
  { day: "Day 4", title: "Sunset Cocktails & Dinner With a View", text: "The night you dress for — cocktails on a cliffside terrace, dinner above the harbor lights." },
  { day: "Day 5", title: "Market Strolls & Coastal Goodbyes", text: "Small rituals: espresso, the climb to the castello, one last boat ride before lunch." },
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