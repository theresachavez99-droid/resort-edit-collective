import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import portofinoImg from "@/assets/hero-portofino-harbor.jpg";
import { absoluteUrl } from "@/lib/site";
import { listPortofinoMomentsForLanding, type PortofinoMomentCard } from "@/lib/portofino-moments.functions";
import { getCanonicalDayImage, useDayImageOverrides } from "@/data/dayImageRegistry";
import cira2Asset from "@/assets/uploads/cira/cira-2.png.asset.json";
import cira3Asset from "@/assets/uploads/cira/cira-3.png.asset.json";
import cira4Asset from "@/assets/uploads/cira/cira-4.png.asset.json";
import cira5Asset from "@/assets/uploads/cira/cira-5.png.asset.json";
import cira6Asset from "@/assets/uploads/cira/cira-6.png.asset.json";
import cira7Asset from "@/assets/uploads/cira/cira-7.png.asset.json";
import cira8Asset from "@/assets/uploads/cira/cira-8.png.asset.json";
import cira9Asset from "@/assets/uploads/cira/cira-9.png.asset.json";
import cira10Asset from "@/assets/uploads/cira/cira-10.png.asset.json";
import cira11Asset from "@/assets/uploads/cira/cira-11.png.asset.json";
import cira12Asset from "@/assets/uploads/cira/cira-12.png.asset.json";
import cira13Asset from "@/assets/uploads/cira/cira-13.png.asset.json";
import cira14Asset from "@/assets/uploads/cira/cira-14.png.asset.json";
import cira15Asset from "@/assets/uploads/cira/cira-15.png.asset.json";
// Day 1 hero card on /portofino — read from the canonical Day Image
// Registry so a founder-approved swap propagates here automatically.
const lookYacht = getCanonicalDayImage("day-1", "destination_card");
const lookBeach = getCanonicalDayImage("day-2", "destination_card");
const lookDayclub = cira9Asset.url;
const lookDinner = cira10Asset.url;
const day5MarketStrolls = cira13Asset.url;
const d1a = getCanonicalDayImage("day-1", "hero");
const d1b = cira2Asset.url;
const d1c = cira3Asset.url;
const d2a = getCanonicalDayImage("day-2", "hero");
const d2b = cira5Asset.url;
const d2c = cira6Asset.url;
const d3a = cira7Asset.url;
const d3b = cira8Asset.url;
const d3c = cira9Asset.url;
const d4a = cira10Asset.url;
const d4b = cira11Asset.url;
const d4c = cira12Asset.url;
const d5a = cira13Asset.url;
const d5b = cira14Asset.url;
const d5c = cira15Asset.url;
import expYacht from "@/assets/exp-yacht-charter.jpg";
import expHarbor from "@/assets/exp-harbor-golden.jpg";
import expCruise from "@/assets/exp-sunset-cruise.jpg";
import expCooking from "@/assets/exp-cooking-class.jpg";
import expAbbey from "@/assets/exp-san-fruttuoso.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelSplendidoMare from "@/assets/hotel-splendido-mare.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { DAY_PATHS, type DaySlug } from "@/components/PortofinoDayPage";
import { type LookSlug } from "@/lib/portofino-spec";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "Portofino — Six Moments | Resort Edit | Dressed for the Destination" },
      { name: "description", content: "Six destination moments in Portofino — Arrival Day, Market Morning, Yacht Day, Harbor Aperitivo, Sunset Views, Riviera Dinner. A luxury editorial guide to the Italian Riviera." },
      { property: "og:title", content: "Portofino — Six Moments | Resort Edit" },
      { property: "og:description", content: "Browse Portofino through six destination moments. Dressed for the Destination." },
      { property: "og:image", content: absoluteUrl(portofinoImg) },
      { property: "og:url", content: absoluteUrl("/portofino") },
      { name: "twitter:image", content: absoluteUrl(portofinoImg) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino") }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["portofino-moments-landing"],
        queryFn: () => listPortofinoMomentsForLanding(),
      }),
    ),
  errorComponent: () => (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-ink">
      <p className="font-display text-xl">Portofino is taking a moment. Please refresh.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-ink">
      <p className="font-display text-xl">Not found.</p>
    </main>
  ),
  component: PortofinoPage,
});

type LookCard = { slug: LookSlug; label: string; title: string; image: string };
type DayRow = {
  slug: DaySlug;
  href: (typeof DAY_PATHS)[DaySlug];
  label: string;
  title: string;
  caption: string;
  image: string;
  imagePos: string;
  looks: LookCard[];
};

const DAYS: DayRow[] = [
  {
    slug: "day-1", href: DAY_PATHS["day-1"], label: "Day 1",
    title: "Yacht Day & Harbour Aperitivo",
    caption: "Open water, tan lines & hidden coves.",
    image: lookYacht,
    imagePos: "50% 20%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Boarding the Boat", image: d1a },
      { slug: "look-b", label: "Look B", title: "Midday on Deck", image: d1b },
      { slug: "look-c", label: "Look C", title: "Harbour Aperitivo", image: d1c },
    ],
  },
  {
    slug: "day-2", href: DAY_PATHS["day-2"], label: "Day 2",
    title: "Beach Club & Long Lunches",
    caption: "Slow mornings, long lunches, seaside glamour.",
    image: lookBeach,
    imagePos: "50% 18%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Beach Club Morning", image: d2a },
      { slug: "look-b", label: "Look B", title: "The Long Lunch", image: d2b },
      { slug: "look-c", label: "Look C", title: "Seaside Glamour", image: d2c },
    ],
  },
  {
    slug: "day-3", href: DAY_PATHS["day-3"], label: "Day 3",
    title: "Pool Lounging & Shopping",
    caption: "Poolside ease, via Roma, Capri luxe.",
    image: lookDayclub,
    imagePos: "50% 16%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Poolside", image: d3a },
      { slug: "look-b", label: "Look B", title: "Via Roma Boutiques", image: d3b },
      { slug: "look-c", label: "Look C", title: "Capri Aperitivo", image: d3c },
    ],
  },
  {
    slug: "day-4", href: DAY_PATHS["day-4"], label: "Day 4",
    title: "Sunset Cocktails & Dinner With A View",
    caption: "Golden hour, candlelight, harbor glow.",
    image: lookDinner,
    imagePos: "50% 22%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Sunset Cocktails", image: d4a },
      { slug: "look-b", label: "Look B", title: "Dinner with a View", image: d4b },
      { slug: "look-c", label: "Look C", title: "After-Dinner Drinks", image: d4c },
    ],
  },
  {
    slug: "day-5", href: DAY_PATHS["day-5"], label: "Day 5",
    title: "Market Strolls & Coastal Goodbyes",
    caption: "Espresso, linen, and one long last lunch.",
    image: day5MarketStrolls,
    imagePos: "50% 18%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Morning Espresso & Market", image: d5a },
      { slug: "look-b", label: "Look B", title: "One Long Last Lunch", image: d5b },
      { slug: "look-c", label: "Look C", title: "The Slow Departure", image: d5c },
    ],
  },
];

function PortofinoPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const normalized = pathname.replace(/\/+$/, "");
  if (normalized !== "/portofino") return <Outlet />;

  const { data } = useSuspenseQuery(
    queryOptions({
      queryKey: ["portofino-moments-landing"],
      queryFn: () => listPortofinoMomentsForLanding(),
    }),
  );
  const moments: PortofinoMomentCard[] = data.ok ? data.moments : [];
  // Founder-approved canonical day images override the TS default at render.
  const dayOverrides = useDayImageOverrides();
  const lookBeachOverride = dayOverrides["day-2"] ?? lookBeach;

  return (
    <div className="pb-10 md:pb-12">
      {/* HERO */}
      <section className="relative h-[34vh] md:h-[46vh] min-h-[260px] md:min-h-[320px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="Portofino harbor — editorial hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-4 md:pb-6 text-ivory">
          <span className="eyebrow text-[0.62rem] md:text-[0.7rem] tracking-[0.42em] text-ivory/80">
            DRESSED FOR THE DESTINATION
          </span>
          <h1 className="font-display text-5xl md:text-[6rem] mt-2 tracking-[0.05em] leading-[1]">
            Portofino
          </h1>
          <p className="font-serif italic text-base md:text-xl text-ivory/90 mt-2 max-w-2xl leading-relaxed">
            A pastel harbor on the Italian Riviera — six destination moments, one editorial language.
          </p>
        </div>
      </section>

      {/* SIX DESTINATION MOMENTS — editorial chapter index */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-8 md:pt-12 pb-10 md:pb-14">
          <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8">
            <span className="eyebrow text-gold tracking-[0.32em] text-[0.7rem]">The Edit</span>
            <h2 className="font-display text-3xl md:text-5xl tracking-[0.04em] mt-2 text-ink">
              Six Moments in Portofino
            </h2>
            <div className="mx-auto my-3 h-px w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed">
              Each moment is its own chapter — a single look, dressed for one place at one hour of the day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {moments.map((m) => (
              <MomentCard key={m.moment_slug} m={m} />
            ))}
          </div>
        </div>
      </section>

      {/* PLAN YOUR PORTOFINO STAY — concierge layer */}
      <section className="bg-cream border-y border-border/40">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 md:py-14">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
            <span className="eyebrow text-gold tracking-[0.32em] text-[0.7rem]">The Concierge</span>
            <h2 className="font-display text-3xl md:text-5xl tracking-[0.04em] mt-2 text-ink">
              Plan Your Portofino Stay
            </h2>
            <div className="mx-auto my-3 h-px w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed">
              The tables, beach clubs, boats, and reservations worth planning ahead.
            </p>
          </div>

          {/* 1. RESORT EDIT FAVORITES */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">RESORT EDIT FAVORITES</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">Editor&rsquo;s shortlist</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              {/* Dolce & Gabbana Beach Club — hero card */}
              <article className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 bg-ivory border border-border/60">
                <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[320px] overflow-hidden bg-muted">
                  <img src={lookBeachOverride} alt="Dolce & Gabbana Beach Club, Paraggi" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center" }} />
                  <div className="absolute top-3 left-3 bg-gold text-ivory eyebrow px-2.5 py-1 tracking-[0.28em] text-[0.55rem]">
                    MOST INSTAGRAMMABLE
                  </div>
                </div>
                <div className="p-5 md:p-6 flex flex-col">
                  <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-gold">Le Carillon · Paraggi Bay</span>
                  <h4 className="font-display text-2xl md:text-[1.7rem] tracking-wide mt-1.5 leading-tight">Dolce &amp; Gabbana Beach Club</h4>
                  <p className="font-serif italic text-ink/70 text-[0.95rem] mt-2 leading-relaxed flex-1">
                    Majolica umbrellas, Riviera water, seaside lunches, and the most photographed beach setup in Portofino.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <a href="https://www.dolcegabbana.com/en/special-projects/dg-le-carillon/" target="_blank" rel="noopener noreferrer sponsored" className="eyebrow text-[0.62rem] tracking-[0.3em] text-ink hover:text-gold border-b border-ink/40 hover:border-gold pb-1">
                      Reserve →
                    </a>
                    <Link to={DAY_PATHS["day-2"]} className="eyebrow text-[0.62rem] tracking-[0.3em] text-gold hover:text-ink border-b border-gold/60 hover:border-ink pb-1">
                      What To Wear Here →
                    </Link>
                  </div>
                </div>
              </article>

              {/* Two side favorites */}
              <div className="grid grid-rows-2 gap-4 md:gap-5">
                <article className="bg-ivory border border-border/60 p-4 flex flex-col">
                  <span className="self-start bg-ink text-ivory eyebrow px-2.5 py-1 tracking-[0.28em] text-[0.55rem]">BOOK FIRST</span>
                  <h4 className="font-display text-lg tracking-wide mt-2.5 leading-tight">Private Boat to San Fruttuoso</h4>
                  <p className="font-serif italic text-ink/65 text-[0.88rem] mt-1.5 leading-relaxed flex-1">
                    The abbey, swim stops, and quiet coves most day trippers miss.
                  </p>
                  <a href="https://www.viator.com/Portofino/d50421/san-fruttuoso" target="_blank" rel="noopener noreferrer sponsored" className="mt-2.5 self-start eyebrow text-[0.6rem] tracking-[0.3em] text-gold hover:text-ink border-b border-gold/60 pb-1">
                    Book →
                  </a>
                </article>
                <article className="bg-ivory border border-border/60 p-4 flex flex-col">
                  <span className="self-start bg-ivory text-ink border border-ink eyebrow px-2.5 py-1 tracking-[0.28em] text-[0.55rem]">INSIDER FAVORITE</span>
                  <h4 className="font-display text-lg tracking-wide mt-2.5 leading-tight">Sunset Aperitivo Reservation</h4>
                  <p className="font-serif italic text-ink/65 text-[0.88rem] mt-1.5 leading-relaxed flex-1">
                    Harbor cocktails before dinner — reserve early.
                  </p>
                  <Link to={DAY_PATHS["day-4"]} className="mt-2.5 self-start eyebrow text-[0.6rem] tracking-[0.3em] text-gold hover:text-ink border-b border-gold/60 pb-1">
                    Plan The Evening →
                  </Link>
                </article>
              </div>
            </div>
          </div>

          {/* 2. BOOKABLE MOMENTS */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">BOOKABLE MOMENTS</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">Reserve before you go</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {[
                { name: "Dolce & Gabbana Beach Club", image: lookBeachOverride, desc: "Cabana service in Paraggi Bay with majolica-print umbrellas.", href: "https://www.dolcegabbana.com/en/special-projects/dg-le-carillon/", look: DAY_PATHS["day-2"] },
                { name: "Private Yacht Charter", image: expYacht, desc: "Your own boat along the promontory — Portofino to Cinque Terre.", href: "https://www.viator.com/Portofino/d50421", look: DAY_PATHS["day-1"] },
                { name: "Private Boat to San Fruttuoso", image: expAbbey, desc: "A 10th-century abbey reachable only by water.", href: "https://www.viator.com/Portofino/d50421/san-fruttuoso", look: DAY_PATHS["day-1"] },
                { name: "Sunset Cruise + Aperitivo", image: expCruise, desc: "Golden hour along the Ligurian coast, prosecco in hand.", href: "https://www.getyourguide.com/portofino-l1093/sunset-cruise", look: DAY_PATHS["day-4"] },
                { name: "Private Driver Transfer", image: expHarbor, desc: "Black-car arrival from Genoa, Milan, or Nice — no parking, no stress.", href: "https://www.getyourguide.com/portofino-l1093/transfers", look: DAY_PATHS["day-5"] },
                { name: "Reserve Harbor Dinner", image: expCooking, desc: "A candlelit table on the piazzetta — book weeks ahead.", href: "https://www.opentable.com/landmark/restaurants-near-portofino", look: DAY_PATHS["day-4"] },
              ].map((exp) => (
                <article key={exp.name} className="bg-ivory border border-border/60 flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img src={exp.image} alt={exp.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                  <div className="p-3.5 md:p-4 flex flex-col flex-1">
                    <h4 className="font-display text-[1.05rem] tracking-wide leading-snug">{exp.name}</h4>
                    <p className="font-serif italic text-ink/65 text-[0.86rem] mt-1.5 leading-relaxed flex-1">{exp.desc}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 pt-2.5 border-t border-border/50">
                      <a href={exp.href} target="_blank" rel="noopener noreferrer sponsored" className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink hover:text-gold">
                        BOOK →
                      </a>
                      <Link to={exp.look} className="eyebrow text-[0.6rem] tracking-[0.3em] text-gold hover:text-ink">
                        WHAT TO WEAR HERE →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 3. WHERE TO STAY */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">WHERE TO STAY</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">Four addresses on the promontory</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {[
                { name: "Splendido, A Belmond Hotel", category: "ULTRA LUXURY", note: "A cliffside grande dame above the harbor — bougainvillea terraces, pastel-pink facade, and the most storied view on the Riviera.", image: hotelSplendido, href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/" },
                { name: "Splendido Mare", category: "HARBORFRONT", note: "On the piazzetta itself. Wake to the boats, dine on the waterfront, walk everywhere that matters.", image: hotelSplendidoMare, href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-splendido-mare/" },
                { name: "Eight Hotel Portofino", category: "BOUTIQUE", note: "Quietly chic, steps from the piazzetta — an intimate Italian retreat for travelers who want to live like a local.", image: hotelEight, href: "https://www.eighthotels.com/en/eight-hotel-portofino/" },
                { name: "Hotel Piccolo Portofino", category: "ICONIC", note: "An intimate seaside hideaway tucked into a private cove — sun-bleached terraces and turquoise water.", image: hotelPiccolo, href: "https://www.hotelpiccoloportofino.com/" },
              ].map((h) => (
                <a key={h.name} href={h.href} target="_blank" rel="noopener noreferrer sponsored" className="group grid grid-cols-[42%_1fr] bg-ivory border border-border/60 hover:border-gold transition-colors">
                  <div className="relative overflow-hidden bg-muted">
                    <img src={h.image} alt={h.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-4 flex flex-col">
                    <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-gold">{h.category}</span>
                    <h4 className="font-display text-lg md:text-xl tracking-wide mt-1.5 leading-snug">{h.name}</h4>
                    <p className="font-serif italic text-ink/65 text-[0.86rem] mt-2 leading-relaxed flex-1">{h.note}</p>
                    <span className="mt-3 self-start eyebrow text-[0.6rem] tracking-[0.3em] text-ink group-hover:text-gold transition-colors border-b border-ink/30 group-hover:border-gold pb-1">
                      Book This Stay →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 4. INSIDER NOTES */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">INSIDER NOTES</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">From the concierge desk</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
              {[
                "Reserve beach clubs weeks ahead — Paraggi sells out by May.",
                "Paraggi for beach time. Portofino for dinner.",
                "Avoid driving into Portofino. Park in Santa Margherita or arrive by boat.",
                "Wear flats after aperitivo — the cobblestones are unforgiving.",
                "Dinner reservations matter more than spontaneity here.",
                "Book boats before restaurants — captains fill up first.",
                "Santa Margherita is easier for logistics, ten minutes by car.",
                "The harbor empties after 10pm. That is when locals come out.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-display text-gold text-sm pt-0.5 tracking-wider">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-serif italic text-ink/75 text-[0.95rem] leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. GETTING THERE */}
          <div>
            <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">GETTING THERE</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">Arrival, the easy way</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {[
                { label: "Private Driver", note: "Black-car transfer from Genoa (45 min), Milan (2.5 hr), or Nice (3 hr). The most direct arrival." },
                { label: "By Boat", note: "Water taxi from Santa Margherita or Rapallo — the entrance the village was designed for." },
                { label: "Santa Margherita Base", note: "Stay ten minutes away for easier logistics, then come into Portofino for lunch and dinner." },
                { label: "Train + Transfer", note: "High-speed rail to Santa Margherita Ligure, then taxi or boat into the village." },
              ].map((g) => (
                <article key={g.label} className="bg-ivory border border-border/60 p-4">
                  <span className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">{g.label.toUpperCase()}</span>
                  <p className="font-serif italic text-ink/70 text-[0.92rem] mt-2 leading-relaxed">{g.note}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TIER OPTIONS — bottom of page (spec §8) */}
    </div>
  );
}

function MomentCard({ m }: { m: PortofinoMomentCard }) {
  return (
    <Link
      to="/portofino/$moment"
      params={{ moment: m.moment_slug }}
      className="group flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream/40">
        <img
          src={m.moment_card_image}
          alt={`${m.moment_name} — Portofino`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          style={
            m.moment_slug === "sunset-views" || m.moment_slug === "harbor-aperitivo"
              ? { objectPosition: "center top" }
              : undefined
          }
        />
        <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
          {m.archetype_slug.replace(/-/g, " ").toUpperCase()}
        </span>
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl md:text-2xl tracking-[0.04em] text-ink leading-tight">
          {m.moment_name}
        </h3>
        <p className="font-serif italic text-ink/70 text-[0.92rem] mt-2 leading-relaxed flex-1">
          {m.narrative}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 eyebrow text-[0.62rem] tracking-[0.3em] text-gold group-hover:text-ink border-b border-gold/60 group-hover:border-ink pb-1 self-start">
          View Moment <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
