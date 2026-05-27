import yacht from "@/assets/look-yacht.jpg";
import beach from "@/assets/look-beach.jpg";
import dayclub from "@/assets/look-dayclub.jpg";
import dinner from "@/assets/look-dinner.jpg";
import town from "@/assets/look-town.jpg";

export type ShopItem = { brand: string; item: string; price: string; href: string };

export type Look = {
  day: string;
  title: string;
  subtitle: string;
  caption: string;
  image: string;
  itinerary: string;
  experience: { label: string; href: string };
  shop: ShopItem[];
};

// Replace href="#" with your ShopMy / LTK / Booking.com / Viator affiliate links.
export const portofinoLooks: Look[] = [
  {
    day: "Day 1",
    title: "Yacht Day",
    subtitle: "Sail in style. Champagne, sea breeze & Italian sun.",
    caption:
      "She steps onto the teak deck in a bandeau and floor-grazing sarong — the kind of ensemble that needs no apology. A raffia tote, gold at the ears, and the harbor of Portofino unfolding behind her.",
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
  },
  {
    day: "Day 2",
    title: "Beach Cabana",
    subtitle: "Laid-back luxury. Cabana days & limoncello lunches.",
    caption:
      "A lemon-print kaftan moving in the breeze, a silk scarf knotted at the temples. The crispness of linen, the slow ritual of a long lunch under a white umbrella.",
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
  },
  {
    day: "Day 3",
    title: "Day Club",
    subtitle: "Bold prints. Great music. Unforgettable energy.",
    caption:
      "Mediterranean prints in blue and citron — a long shirtdress that moves like a holiday. Statement earrings catching the light, sandals that mean business by evening.",
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
  },
  {
    day: "Day 4",
    title: "Dinner in Portofino",
    subtitle: "Sunset aperitivo. Candlelight. Italian elegance.",
    caption:
      "A halter silk maxi the color of late-summer apricot. The harbor turns gold, then violet. A small black clutch, a heel that whispers, a single glass of Vermentino.",
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
  },
  {
    day: "Day 5",
    title: "Exploring the Town",
    subtitle: "Wander. Explore. Gelato stops & beautiful views.",
    caption:
      "Crisp blue stripes over white. Tailored shorts, a woven tote, sandals built for cobblestones. A morning of small streets, a long afternoon goodbye.",
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
  },
];

export const itinerary = [
  { day: "Day 1", title: "Yacht Party & Harbour Views", text: "Private yacht charter, swim stops, sunset drinks at Baratta." },
  { day: "Day 2", title: "Beach Club & Relax", text: "La Fontelina beach club, lunch at DaV Mare, limoncello & seaside lounging." },
  { day: "Day 3", title: "Day Club & Shop", text: "Pool day at Eight Club Portofino, explore local boutiques & aperitivo at Langosteria." },
  { day: "Day 4", title: "Dinner & Sunset", text: "Sunset drinks at Belmond Splendido, dinner at Terrazza with a view." },
  { day: "Day 5", title: "Explore & Goodbyes", text: "Wander the town, gelato at Gelateria Mario, last views & a cozy coastal lunch." },
];

export const travelTips = [
  { title: "Best Time to Go", text: "May–September for sunshine & warm waters." },
  { title: "Getting Around", text: "Walk the town, boat taxis, or rent a Vespa." },
  { title: "What to Pack", text: "Light linens, swimsuits, statement accessories & chic sandals." },
  { title: "Don't Miss", text: "Sunset at Castello Brown & a boat ride to San Fruttuoso." },
];

export const whereToStay = [
  { name: "Splendido, A Belmond Hotel", text: "Iconic views, timeless Italian luxury." },
  { name: "Eight Hotel Portofino", text: "Chic, stylish & steps from the piazzetta." },
  { name: "Hotel Piccolo Portofino", text: "Boutique charm with exceptional service." },
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