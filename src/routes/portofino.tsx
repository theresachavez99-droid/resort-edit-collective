import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import portofinoImg from "@/assets/hero-portofino-harbor.jpg";
import { listPortofinoMomentsForLanding, type PortofinoMomentCard } from "@/lib/portofino-moments.functions";
import { PortofinoMomentCard as PortofinoMomentCardView } from "@/components/PortofinoMomentCard";
import { getCanonicalDayImage } from "@/data/dayImageRegistry";
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
import { ExperienceCollection } from "@/components/experiences/ExperienceCollection";
import { WhileYoureHere } from "@/components/experiences/WhileYoureHere";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelSplendidoMare from "@/assets/hotel-splendido-mare.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "Portofino — Twelve Curated Moments | Resort Edit | Dressed for the Destination" },
      { name: "description", content: "Twelve curated moments in Portofino — from arrival afternoons and espresso mornings to yacht days, long lunches, harbor aperitivos, and a final nightcap on the piazzetta." },
      { property: "og:title", content: "Portofino — Twelve Curated Moments | Resort Edit" },
      { property: "og:description", content: "Discover Portofino through twelve curated destination moments. Dressed for the Destination." },
    ],
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
            A pastel harbor on the Italian Riviera — twelve curated moments, one editorial language.
          </p>
        </div>
      </section>

      {/* THE PROMISE — entry point into the Pack My Trip flow */}
      <section className="bg-cream border-b border-border/40">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 md:py-14 text-center">
          <span className="eyebrow text-gold tracking-[0.32em] text-[0.7rem]">
            DRESSED FOR THE DESTINATION™
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-5xl tracking-[0.03em] text-ink leading-[1.05] max-w-[26ch] mx-auto">
            Tell us where you're going. We'll dress the entire trip.
          </h2>
          <div className="mx-auto my-4 h-px w-12 bg-gold" />
          <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed max-w-[48ch] mx-auto">
            Complete outfits for every moment of the destination—from arrival to last call.
          </p>
          <Link
            to="/pack-my-trip"
            className="mt-7 inline-flex items-center justify-center eyebrow text-[0.7rem] tracking-[0.3em] text-ivory bg-ink px-7 py-3.5 hover:bg-gold hover:text-ink transition-colors"
          >
            BUILD MY PORTOFINO EDIT
          </Link>
        </div>
      </section>



      {/* NINE DESTINATION MOMENTS — editorial chapter index, in journey order */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-8 md:pt-12 pb-10 md:pb-14">
          <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8">
            <span className="eyebrow text-gold tracking-[0.32em] text-[0.7rem]">Editorial Itinerary</span>
            <h2 className="font-display text-3xl md:text-5xl tracking-[0.04em] mt-2 text-ink">
              Twelve Curated Moments in Portofino
            </h2>
            <div className="mx-auto my-3 h-px w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed">
              From arrival to nightcap — twelve chapters of a single Portofino day, in the order you'll live them.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {moments.map((m) => (
              <PortofinoMomentCardView key={m.moment_slug} m={m} />
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

          {/* EXPERIENCES — six verified operators, each tied to a Moment */}
          <div className="mb-10 md:mb-12">
            <ExperienceCollection destinationSlug="portofino" />
            <WhileYoureHere destinationSlug="portofino" />
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


