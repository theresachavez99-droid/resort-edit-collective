import portofino from "@/assets/dest-portofino.jpg";
import capri from "@/assets/dest-capri.jpg";
import sttropez from "@/assets/dest-sttropez.jpg";
import phuket from "@/assets/dest-phuket.jpg";
import ibiza from "@/assets/dest-ibiza.jpg";
import tulum from "@/assets/dest-tulum.jpg";
import mallorca from "@/assets/dest-mallorca.jpg";

export type Destination = {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  image: string;
  href?: string;
};

export const destinations: Destination[] = [
  { slug: "portofino", name: "Portofino", region: "Italian Riviera", tagline: "The harbor of pastel palazzi and silk caftans.", image: portofino, href: "/portofino" },
  { slug: "capri", name: "Capri", region: "Tyrrhenian Sea", tagline: "Limoncello afternoons above the Faraglioni.", image: capri },
  { slug: "sttropez", name: "St. Tropez", region: "Côte d'Azur", tagline: "White umbrellas, rosé and a private tender.", image: sttropez },
  { slug: "mallorca", name: "Mallorca", region: "Balearic Islands", tagline: "Hidden coves and a quiet sailboat at noon.", image: mallorca },
  { slug: "ibiza", name: "Ibiza", region: "Balearic Islands", tagline: "Whitewashed cliffs and bougainvillea sunsets.", image: ibiza },
  { slug: "tulum", name: "Tulum", region: "Riviera Maya", tagline: "Caribbean cabanas under turning palms.", image: tulum },
  { slug: "phuket", name: "Phuket", region: "Andaman Sea", tagline: "Infinity pools above a jade horizon.", image: phuket },
];