import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import portofinoImg from "@/assets/hero-portofino-harbor.jpg";
import { absoluteUrl } from "@/lib/site";
import lookYacht from "@/assets/generated/resort-edit/look-yacht-card-thumb.jpg";
import lookBeach from "@/assets/generated/resort-edit/look-beach-card-thumb.jpg";
import lookDayclub from "@/assets/generated/resort-edit/look-dayclub-card-thumb.jpg";
import heroMuse from "@/assets/hero-muse-portofino.jpg";
import lookDinner from "@/assets/generated/resort-edit/look-dinner-card-thumb.jpg";
import day5MarketStrolls from "@/assets/generated/resort-edit/day5-market-strolls-hires-card-20260601.jpg";
import d1a from "@/assets/generated/resort-edit/edit-d1-a-card-thumb.jpg";
import d1b from "@/assets/generated/resort-edit/edit-d1-b-card-thumb.jpg";
import d1c from "@/assets/generated/resort-edit/edit-d1-c-card-thumb.jpg";
import d2a from "@/assets/generated/resort-edit/edit-d2-a-card-thumb.jpg";
import d2b from "@/assets/generated/resort-edit/edit-d2-b-card-thumb.jpg";
import d2c from "@/assets/generated/resort-edit/edit-d2-c-card-thumb.jpg";
import d3a from "@/assets/generated/resort-edit/edit-d3-a-card-thumb.jpg";
import d3b from "@/assets/generated/resort-edit/edit-d3-b-card-thumb.jpg";
import d3c from "@/assets/generated/resort-edit/edit-d3-c-card-thumb.jpg";
import d4a from "@/assets/generated/resort-edit/edit-d4-a-card-thumb.jpg";
import d4b from "@/assets/generated/resort-edit/edit-d4-b-card-thumb.jpg";
import d4c from "@/assets/generated/resort-edit/edit-d4-c-card-thumb.jpg";
import d5a from "@/assets/generated/resort-edit/edit-d5-a-card-thumb.jpg";
import d5b from "@/assets/generated/resort-edit/edit-d5-b-card-thumb.jpg";
import d5c from "@/assets/generated/resort-edit/edit-d5-c-card-thumb.jpg";
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
      { title: "5 Days in Portofino — A Style & Itinerary Guide | Resort Edit | Dressed for the destination" },
      { name: "description", content: "Five complete resort looks and a five-day itinerary for Portofino — yacht days, beach cabanas, sunset dinners and quiet harbor mornings." },
      { property: "og:title", content: "5 Days in Portofino | Resort Edit | Dressed for the destination" },
      { property: "og:description", content: "A luxury style and travel guide to the Italian Riviera." },
      { property: "og:image", content: absoluteUrl(portofinoImg) },
      { property: "og:url", content: absoluteUrl("/portofino") },
      { name: "twitter:image", content: absoluteUrl(portofinoImg) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino") }],
  }),
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
    imagePos: "50% 18%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Mediterranean Glam", image: d1a },
      { slug: "look-b", label: "Look B", title: "Riviera Chic", image: d1b },
      { slug: "look-c", label: "Look C", title: "Coastal Sophistication", image: d1c },
    ],
  },
  {
    slug: "day-2", href: DAY_PATHS["day-2"], label: "Day 2",
    title: "Beach Club & Long Lunches",
    caption: "Slow mornings, long lunches, seaside glamour.",
    image: lookBeach,
    imagePos: "50% 12%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Lemon Print Cabana", image: d2a },
      { slug: "look-b", label: "Look B", title: "Coastal Minimalist", image: d2b },
      { slug: "look-c", label: "Look C", title: "Coral Coast", image: d2c },
    ],
  },
  {
    slug: "day-3", href: DAY_PATHS["day-3"], label: "Day 3",
    title: "Pool Lounging & Shopping",
    caption: "Poolside ease, via Roma, Capri luxe.",
    image: heroMuse,
    imagePos: "50% 25%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Printed Set", image: d3a },
      { slug: "look-b", label: "Look B", title: "White Linen Ease", image: d3b },
      { slug: "look-c", label: "Look C", title: "Sage Escape", image: d3c },
    ],
  },
  {
    slug: "day-4", href: DAY_PATHS["day-4"], label: "Day 4",
    title: "Sunset Cocktails & Dinner With A View",
    caption: "Golden hour, candlelight, harbor glow.",
    image: lookDinner,
    imagePos: "50% 22%",
    looks: [
      { slug: "look-a", label: "Look A", title: "Sunset Print Dress", image: d4a },
      { slug: "look-b", label: "Look B", title: "Champagne Satin", image: d4b },
      { slug: "look-c", label: "Look C", title: "Terracotta Elegance", image: d4c },
    ],
  },
  {
    slug: "day-5", href: DAY_PATHS["day-5"], label: "Day 5",
    title: "Market Strolls & Coastal Goodbyes",
    caption: "Espresso, linen, and one long last lunch.",
    image: day5MarketStrolls,
    imagePos: "center center",
    looks: [
      { slug: "look-a", label: "Look A", title: "Coastal Chic", image: d5a },
      { slug: "look-b", label: "Look B", title: "Olive Safari", image: d5b },
      { slug: "look-c", label: "Look C", title: "Soft Neutrals", image: d5c },
    ],
  },
];

function PortofinoPage() {
  const childMatch = useMatch({ from: "/portofino/$day/$look", shouldThrow: false });
  if (childMatch) return <Outlet />;

  return (
    <div className="pb-16 md:pb-20">
      {/* HERO */}
      <section className="relative h-[42vh] md:h-[56vh] min-h-[300px] md:min-h-[380px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="Portofino harbor — editorial hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-6 md:pb-8 text-ivory">
          <span className="eyebrow text-ivory/80 tracking-[0.4em]">The Resort Edit · Portofino</span>
          <h1 className="font-display text-5xl md:text-[5.5rem] mt-2 tracking-[0.05em] leading-[1]">
            5 Days in Portofino
          </h1>
          <p className="font-serif italic text-base md:text-xl text-ivory/85 mt-2 max-w-2xl leading-relaxed">
            — Explore each day. Shop three complete looks. —
          </p>
        </div>
      </section>

      {/* 5 DAY SECTIONS — stacked editorial rows */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 md:py-14">
          <div className="space-y-12 md:space-y-16">
            {DAYS.map((d) => (
              <article
                key={d.slug}
                id={d.slug}
                className="grid grid-cols-1 lg:grid-cols-[minmax(220px,1fr)_3fr] gap-6 lg:gap-10 border-b border-border/40 pb-12 md:pb-16 last:border-b-0"
              >
                {/* LEFT — Editorial muse + day caption */}
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted border border-border/60">
                    <img
                      src={d.image}
                      alt={`${d.label} — ${d.title}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: d.slug === "day-5" ? d.imagePos : "center top", imageRendering: "auto" }}
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl tracking-[0.05em] text-ink leading-tight">
                      {d.title}
                    </h2>
                    <p className="font-serif italic text-[0.9rem] text-ink/65 mt-2 leading-relaxed">
                      {d.caption}
                    </p>
                    <Link
                      to={d.href}
                      className="mt-3 inline-flex items-center gap-2 eyebrow text-[0.6rem] tracking-[0.3em] text-gold hover:text-ink transition-colors border-b border-gold/60 pb-1"
                    >
                      View Full Day Edit <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* RIGHT — Three looks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                  {d.looks.map((look) => (
                    <a
                      key={look.slug}
                      href={`/portofino/${d.slug}/${look.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-ivory border border-border/60 hover:border-gold transition-colors"
                    >
                      {/* Reserved header — keeps label off the model */}
                      <div className="min-h-[48px] px-3 pt-3 pb-2 border-b border-border/40 text-center">
                        <span className="block eyebrow text-[0.55rem] tracking-[0.32em] text-gold">
                          {look.label.toUpperCase()}
                        </span>
                        <span className="block eyebrow text-[0.6rem] tracking-[0.22em] text-ink mt-1 leading-snug">
                          {look.title.toUpperCase()}
                        </span>
                      </div>
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        <img
                          src={look.image}
                          alt={`${d.label} ${look.label} — ${look.title}`}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          style={{ objectPosition: "center top" }}
                        />
                      </div>
                      <div className="p-3 md:p-4 text-center">
                        <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink group-hover:text-gold transition-colors">
                          View Full Look →
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN YOUR PORTOFINO STAY — concierge layer */}
      <section className="bg-cream border-y border-border/40">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <span className="eyebrow text-gold tracking-[0.32em] text-[0.7rem]">The Concierge</span>
            <h2 className="font-display text-3xl md:text-5xl tracking-[0.04em] mt-3 text-ink">
              Plan Your Portofino Stay
            </h2>
            <div className="mx-auto my-4 h-px w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed">
              The tables, beach clubs, boats, and reservations worth planning ahead.
            </p>
          </div>

          {/* 1. RESORT EDIT FAVORITES */}
          <div className="mb-16 md:mb-20">
            <div className="flex items-baseline justify-between mb-6 border-b border-ink/15 pb-3">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">RESORT EDIT FAVORITES</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">Editor&rsquo;s shortlist</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
              {/* Dolce & Gabbana Beach Club — hero card */}
              <article className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 bg-ivory border border-border/60">
                <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[320px] overflow-hidden bg-muted">
                  <img src={lookBeach} alt="Dolce & Gabbana Beach Club, Paraggi" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center" }} />
                  <div className="absolute top-3 left-3 bg-gold text-ivory eyebrow px-2.5 py-1 tracking-[0.28em] text-[0.55rem]">
                    MOST INSTAGRAMMABLE
                  </div>
                </div>
                <div className="p-6 md:p-7 flex flex-col">
                  <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-gold">Le Carillon · Paraggi Bay</span>
                  <h4 className="font-display text-2xl md:text-[1.7rem] tracking-wide mt-2 leading-tight">Dolce &amp; Gabbana Beach Club</h4>
                  <p className="font-serif italic text-ink/70 text-[0.95rem] mt-3 leading-relaxed flex-1">
                    Majolica umbrellas, Riviera water, seaside lunches, and the most photographed beach setup in Portofino.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
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
              <div className="grid grid-rows-2 gap-5 md:gap-6">
                <article className="bg-ivory border border-border/60 p-5 flex flex-col">
                  <span className="self-start bg-ink text-ivory eyebrow px-2.5 py-1 tracking-[0.28em] text-[0.55rem]">BOOK FIRST</span>
                  <h4 className="font-display text-lg tracking-wide mt-3 leading-tight">Private Boat to San Fruttuoso</h4>
                  <p className="font-serif italic text-ink/65 text-[0.88rem] mt-2 leading-relaxed flex-1">
                    The abbey, swim stops, and quiet coves most day trippers miss.
                  </p>
                  <a href="https://www.viator.com/Portofino/d50421/san-fruttuoso" target="_blank" rel="noopener noreferrer sponsored" className="mt-3 self-start eyebrow text-[0.6rem] tracking-[0.3em] text-gold hover:text-ink border-b border-gold/60 pb-1">
                    Book →
                  </a>
                </article>
                <article className="bg-ivory border border-border/60 p-5 flex flex-col">
                  <span className="self-start bg-ivory text-ink border border-ink eyebrow px-2.5 py-1 tracking-[0.28em] text-[0.55rem]">INSIDER FAVORITE</span>
                  <h4 className="font-display text-lg tracking-wide mt-3 leading-tight">Sunset Aperitivo Reservation</h4>
                  <p className="font-serif italic text-ink/65 text-[0.88rem] mt-2 leading-relaxed flex-1">
                    Harbor cocktails before dinner — reserve early.
                  </p>
                  <Link to={DAY_PATHS["day-4"]} className="mt-3 self-start eyebrow text-[0.6rem] tracking-[0.3em] text-gold hover:text-ink border-b border-gold/60 pb-1">
                    Plan The Evening →
                  </Link>
                </article>
              </div>
            </div>
          </div>

          {/* 2. BOOKABLE MOMENTS */}
          <div className="mb-16 md:mb-20">
            <div className="flex items-baseline justify-between mb-6 border-b border-ink/15 pb-3">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">BOOKABLE MOMENTS</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">Reserve before you go</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[
                { name: "Dolce & Gabbana Beach Club", image: lookBeach, desc: "Cabana service in Paraggi Bay with majolica-print umbrellas.", href: "https://www.dolcegabbana.com/en/special-projects/dg-le-carillon/", look: DAY_PATHS["day-2"] },
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
                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <h4 className="font-display text-[1.05rem] tracking-wide leading-snug">{exp.name}</h4>
                    <p className="font-serif italic text-ink/65 text-[0.86rem] mt-2 leading-relaxed flex-1">{exp.desc}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-border/50">
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
          <div className="mb-16 md:mb-20">
            <div className="flex items-baseline justify-between mb-6 border-b border-ink/15 pb-3">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">WHERE TO STAY</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">Four addresses on the promontory</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
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
                  <div className="p-5 flex flex-col">
                    <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-gold">{h.category}</span>
                    <h4 className="font-display text-lg md:text-xl tracking-wide mt-1.5 leading-snug">{h.name}</h4>
                    <p className="font-serif italic text-ink/65 text-[0.86rem] mt-2.5 leading-relaxed flex-1">{h.note}</p>
                    <span className="mt-4 self-start eyebrow text-[0.6rem] tracking-[0.3em] text-ink group-hover:text-gold transition-colors border-b border-ink/30 group-hover:border-gold pb-1">
                      Book This Stay →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 4. INSIDER NOTES */}
          <div className="mb-16 md:mb-20">
            <div className="flex items-baseline justify-between mb-6 border-b border-ink/15 pb-3">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">INSIDER NOTES</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">From the concierge desk</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
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
            <div className="flex items-baseline justify-between mb-6 border-b border-ink/15 pb-3">
              <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">GETTING THERE</h3>
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">Arrival, the easy way</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {[
                { label: "Private Driver", note: "Black-car transfer from Genoa (45 min), Milan (2.5 hr), or Nice (3 hr). The most direct arrival." },
                { label: "By Boat", note: "Water taxi from Santa Margherita or Rapallo — the entrance the village was designed for." },
                { label: "Santa Margherita Base", note: "Stay ten minutes away for easier logistics, then come into Portofino for lunch and dinner." },
                { label: "Train + Transfer", note: "High-speed rail to Santa Margherita Ligure, then taxi or boat into the village." },
              ].map((g) => (
                <article key={g.label} className="bg-ivory border border-border/60 p-5">
                  <span className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">{g.label.toUpperCase()}</span>
                  <p className="font-serif italic text-ink/70 text-[0.92rem] mt-3 leading-relaxed">{g.note}</p>
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
