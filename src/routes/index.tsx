import { Ship, Umbrella, Camera, Compass } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import stillLife from "@/assets/portofino-still-life.jpg";
import lookDinner from "@/assets/generated/resort-edit/look-dinner-card-thumb.jpg";
import editD1a from "@/assets/generated/resort-edit/edit-d1-a-card-thumb.jpg";
import poolLoungingShoppingAsset from "@/assets/uploads/portofino/pool-lounging-shopping-lilla-red-floral-splendido.png.asset.json";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { HomeItinerary, portofinoMomentsQuery } from "@/components/HomeItinerary";
import { getCanonicalDayImage, useDayImageOverrides } from "@/data/dayImageRegistry";
import { getFeaturedDestination } from "@/data/featuredDestination";

const featured = getFeaturedDestination();
const heroMuse = featured.heroImage;
const editD2a = getCanonicalDayImage("day-2", "hero");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resort Edit | Dressed for the Destination" },
      { name: "description", content: "Luxury resort style guides and itineraries — curated looks, hotels, and experiences for women who dress for the destination." },
      { property: "og:title", content: "Resort Edit | Dressed for the Destination" },
      { property: "og:description", content: "Luxury resort style guides and itineraries — curated looks, hotels, and experiences for women who dress for the destination." },
      { property: "og:image", content: absoluteUrl(heroMuse) },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:image", content: absoluteUrl(heroMuse) },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(portofinoMomentsQuery),
  component: Index,
});

const baseLooks: Array<{
  tag: string;
  title: string;
  image: string;
  day: "day-1" | "day-2" | "day-3" | "day-4" | "day-5";
  look: "look-a" | "look-b" | "look-c";
  momentSlug?: string;
}> = [
  { tag: "Additional Look", title: "Beach Club + Long Lunch", image: editD2a, day: "day-2", look: "look-a" },
  { tag: "Additional Look", title: "Pool Lounging + Shopping", image: poolLoungingShoppingAsset.url, day: "day-3", look: "look-a", momentSlug: "pool-lounging-shopping" },
  { tag: "Additional Look", title: "Exploring the Harbor", image: editD1a, day: "day-3", look: "look-b" },
];

const hotels = [
  {
    name: "Splendido, A Belmond Hotel",
    image: hotelSplendido,
    vibe: "ICONIC · CLIFFTOP VIEWS",
    pick: "Resort Edit Favorite",
    desc: "A cliffside grande dame above the harbor. Timeless Italian glamour, bougainvillea terraces, and the most storied view on the Riviera.",
    signals: ["The Resort Edit top pick", "Harbour-facing rooms only", "Private pool terrace & cabanas"],
    note: "Where to stay if this trip is the trip.",
    href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
  },
  {
    name: "Eight Hotel Portofino",
    image: hotelEight,
    vibe: "PIAZZETTA · LOCAL ENERGY",
    pick: "Best for First-Time Visitors",
    desc: "Quietly chic and steps from the piazzetta. A modern Italian retreat for travelers who want to live like a local in the heart of town.",
    signals: ["Steps from the piazzetta", "Boutique, under 20 rooms", "Concierge who books the impossible"],
    note: "For the trip you'll want to repeat next summer.",
    href: "https://www.eighthotels.com/en/eight-hotel-portofino/",
  },
  {
    name: "Hotel Piccolo Portofino",
    image: hotelPiccolo,
    vibe: "HIDDEN · PRIVATE COVE",
    pick: "Best for Privacy",
    desc: "An intimate seaside hideaway tucked into a private cove. Sun-bleached terraces, turquoise water, and the kind of service that anticipates everything.",
    signals: ["Private sea-access terrace", "Quiet side of the harbor", "Sea-view suites only"],
    note: "For the traveler who wants the harbor without the crowd.",
    href: "https://www.hotelpiccoloportofino.com/",
  },
];

const ctas = [
  { label: "Book a Yacht", Icon: Ship },
  { label: "Reserve a Beach Club", Icon: Umbrella },
  { label: "Book a Tour", Icon: Camera },
  { label: "View Experiences", Icon: Compass },
];

function Index() {
  const dayOverrides = useDayImageOverrides();
  const looks = baseLooks.map((l) =>
    l.look === "look-a" && dayOverrides[l.day] && !l.momentSlug
      ? { ...l, image: dayOverrides[l.day] }
      : l,
  );
  const wrap = "px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24";
  return (
    <div className="bg-ivory w-full">
      {/* HERO — editorial cover: photography-led, destination-first hierarchy */}
      <section
        className={`${wrap} pt-6 lg:pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center`}
      >
        {/* Photography — full-body editorial portrait, never cropped at head or hem */}
        <div className="relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-cream/40 lg:col-span-7">
          <img
            src={featured.heroImage}
            alt={featured.heroImageAlt}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        </div>
        <div className="lg:pl-2 max-w-[680px] lg:col-span-5">
          <p className="eyebrow text-gold text-[0.82rem] tracking-[0.38em]">
            RESORT EDIT™
          </p>
          <h1 className="font-display mt-1.5 text-[4.2rem] sm:text-[5.6rem] lg:text-[7.4rem] xl:text-[8.6rem] leading-[0.86] tracking-[0.005em] text-ink uppercase">
            {featured.name}
          </h1>
          <p
            className="font-serif italic text-[1.4rem] sm:text-[1.6rem] lg:text-[1.85rem] leading-[1.05] tracking-[-0.01em] mt-1.5"
            style={{ color: "oklch(0.62 0.12 66)" }}
          >
            Dressed for the Destination™
          </p>
          <p className="eyebrow text-ink/65 text-[0.7rem] sm:text-[0.74rem] tracking-[0.24em] mt-2.5">
            {featured.country} <span className="text-gold/70">•</span>{" "}
            {featured.totalLooks} Looks{" "}
            <span className="text-gold/70">•</span>{" "}
            {featured.totalMoments} Moments
          </p>
          <p
            className="font-serif italic text-[1.2rem] sm:text-[1.32rem] lg:text-[1.45rem] leading-[1.15] mt-2.5 text-ink"
          >
            {featured.tagline}
          </p>
          <div className="mt-3 mb-2.5 h-px w-24 bg-gold/80" />
          <p className="font-serif text-[1rem] lg:text-[1.05rem] text-ink/75 leading-[1.5] max-w-xl">
            Curated outfits, hotels, experiences, and insider recommendations designed around how women actually travel.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={featured.primaryCtaHref as "/"}
              className="bg-gold text-ivory eyebrow text-[0.78rem] tracking-[0.28em] px-10 py-[18px] hover:bg-ink transition-colors"
            >
              Explore {featured.name}
            </Link>
            <Link
              to="/destinations"
              className="border border-ink text-ink eyebrow text-[0.78rem] tracking-[0.28em] px-10 py-[18px] hover:bg-ink hover:text-ivory transition-colors"
            >
              View All Destinations
            </Link>
          </div>

          {/* Chapter navigation — communicates depth above the fold */}
          <nav
            aria-label={`${featured.name} chapters`}
            className="mt-5 -mx-4 sm:mx-0 overflow-x-auto lg:overflow-visible"
          >
            <ul className="flex lg:flex-wrap items-center gap-x-5 gap-y-2 px-4 sm:px-0 whitespace-nowrap lg:whitespace-normal">
              {featured.momentLabels.map((m, i) => (
                <li key={m.slug} className="flex items-center gap-x-5">
                  <Link
                    to="/portofino/$moment"
                    params={{ moment: m.slug }}
                    className="eyebrow text-[0.68rem] tracking-[0.22em] text-ink/70 hover:text-gold transition-colors"
                  >
                    {m.label}
                  </Link>
                  {i < featured.momentLabels.length - 1 && (
                    <span aria-hidden className="text-gold/50">·</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* DESTINATION INTRO — editorial context, intentionally understated */}
      <section className={`${wrap} mt-14 lg:mt-20`}>
        <p className="mx-auto max-w-2xl text-center font-serif italic text-[1.05rem] sm:text-[1.15rem] lg:text-[1.22rem] leading-[1.55] text-ink/75">
          Portofino is a harbor town on the Italian Riviera known for pastel waterfront buildings, yacht culture, beach clubs, long lunches, and sunset aperitivos.
        </p>
      </section>

      {/* PORTOFINO ITINERARY */}
      <section className={`${wrap} mt-16 lg:mt-24`}>
        <div className="flex items-center gap-4 justify-center mb-4">
          <div className="h-px w-16 bg-gold/50" />
          <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">PORTOFINO ITINERARY</h2>
          <div className="h-px w-16 bg-gold/50" />
        </div>
        <p className="mt-1 text-center font-serif italic text-[1rem] sm:text-[1.08rem] text-ink/80 max-w-2xl mx-auto leading-snug">
          Six destination moments. One editorial wardrobe.
        </p>
        <p className="mb-10 mt-2 text-center font-serif italic text-[0.92rem] sm:text-[0.98rem] text-ink/60 max-w-2xl mx-auto leading-relaxed">
          From market mornings and yacht afternoons to sunset cocktails and Riviera dinners.
        </p>
        <HomeItinerary />
      </section>

      {/* SHOP THE LOOKS + TIP */}
      <section className={`${wrap} mt-24 lg:mt-32`}>
          <div className="flex items-center gap-4 justify-center mb-4">
            <div className="h-px w-16 bg-gold/50" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">MORE WAYS TO DRESS FOR PORTOFINO</h2>
            <div className="h-px w-16 bg-gold/50" />
          </div>
          <p className="mb-10 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
            Additional outfit ideas for beach clubs, harbor lunches, shopping afternoons, and sunset reservations.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-6">
            {looks.map((l) => (
              <article key={l.title} className="bg-card border border-border/50 flex flex-col">
                <div className="text-center pt-5 px-3">
                  <div className="eyebrow text-[0.62rem] tracking-[0.28em] text-gold">{l.tag}</div>
                  <h3 className="mt-3 eyebrow text-[0.72rem] tracking-[0.2em] text-ink">{l.title}</h3>
                </div>
                <div className="relative aspect-[5/6] mt-4 overflow-hidden bg-muted">
                  <img src={l.image} alt={l.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                {l.momentSlug ? (
                  <Link
                    to="/portofino/$moment"
                    params={{ moment: l.momentSlug }}
                    className="text-center py-4 eyebrow text-[0.65rem] tracking-[0.24em] text-gold hover:text-ink border-t border-border/50 transition-colors"
                  >
                    Get the Look →
                  </Link>
                ) : (
                  <Link
                    to="/portofino/$day/$look"
                    params={{ day: l.day, look: l.look }}
                    className="text-center py-4 eyebrow text-[0.65rem] tracking-[0.24em] text-gold hover:text-ink border-t border-border/50 transition-colors"
                  >
                    Get the Look →
                  </Link>
                )}
              </article>
            ))}

            {/* Resort Edit Tip */}
            <aside className="flex flex-col gap-5">
              <div className="bg-gold/15 border border-gold/30 p-6 flex-1 flex flex-col">
                <div className="eyebrow text-[0.62rem] tracking-[0.28em] text-gold">✦ Resort Edit Tip</div>
                <p className="mt-5 font-serif italic text-lg text-ink/85 leading-relaxed">
                  Book a cabana.<br />Sip limoncello.<br />Stay until sunset.
                </p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={stillLife} alt="Portofino still life" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </aside>
          </div>
      </section>

      {/* WHERE TO STAY */}
      <section className={`${wrap} mt-24 lg:mt-32`}>
          <div className="flex items-center gap-4 justify-center mb-4">
            <div className="h-px w-16 bg-gold/50" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">WHERE RESORT EDIT WOULD STAY</h2>
            <div className="h-px w-16 bg-gold/50" />
          </div>
          <p className="mb-10 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
            Hotels chosen as part of the destination — where to stay, why it fits, and the experience it delivers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {hotels.map((h) => (
              <article key={h.name} className="bg-card border border-border/50 flex flex-col">
                <div className="relative aspect-[4/3] min-h-[220px] overflow-hidden bg-muted">
                  <img src={h.image} alt={h.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute left-4 bottom-4 bg-ink/75 text-ivory eyebrow text-[0.6rem] tracking-[0.26em] px-3 py-1.5 backdrop-blur-sm">
                    {h.vibe}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">{h.pick}</div>
                  <h3 className="mt-2 font-display text-2xl tracking-wide text-ink">{h.name}</h3>
                  <p className="mt-3 font-serif text-[0.95rem] text-ink/75 leading-relaxed">{h.desc}</p>
                  <ul className="mt-5 space-y-1.5">
                    {h.signals.map((s) => (
                      <li key={s} className="flex gap-2 font-serif text-[0.9rem] text-ink/80">
                        <span className="text-gold">·</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 font-serif italic text-[0.9rem] text-ink/60 flex-1">{h.note}</p>
                  <a
                    href={h.href}
                    target="_blank"
                    rel="noreferrer noopener sponsored"
                    className="mt-6 inline-flex justify-center eyebrow text-[0.72rem] tracking-[0.3em] text-gold border-b border-gold/50 pb-1 self-center hover:text-ink hover:border-ink transition-colors"
                  >
                    Explore This Stay →
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-ink/15 text-center">
            <p className="font-serif italic text-[0.9rem] text-ink/55 max-w-2xl mx-auto leading-relaxed">
              Rates available on enquiry. Some properties book out months in advance — we recommend reserving before your flights.
            </p>
          </div>
      </section>

      {/* BOOK YOUR PORTOFINO EXPERIENCE — booking rail */}
      <section className="mt-24 lg:mt-32">
        <div className={`${wrap} mb-8`}>
          <div className="flex items-center gap-4 justify-center mb-4">
            <div className="h-px w-16 bg-gold/50" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink text-center">BOOK YOUR PORTOFINO EXPERIENCE</h2>
            <div className="h-px w-16 bg-gold/50" />
          </div>
          <p className="text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
            The restaurants, beach clubs, yacht charters, and experiences that complete the trip.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 w-full">
          {ctas.map(({ label, Icon }) => (
            <Link
              key={label}
              to="/portofino"
              className="h-16 lg:h-20 bg-gold hover:bg-ink text-ivory transition-colors flex items-center justify-center gap-3 eyebrow text-[0.7rem] lg:text-[0.8rem] tracking-[0.22em] text-center px-4"
            >
              <Icon className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* DISCLOSURE — visually secondary, well below CTAs */}
      {/* BRANDS WE LOVE — minimalist trust signal, no logos/carousels */}
      <section className={`${wrap} mt-24 lg:mt-32`}>
        <div className="flex items-center gap-4 justify-center mb-4">
          <div className="h-px w-16 bg-gold/50" />
          <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">BRANDS WE LOVE</h2>
          <div className="h-px w-16 bg-gold/50" />
        </div>
        <p className="mb-10 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
          A short list of the ateliers and houses we keep returning to across destinations.
        </p>
        <ul className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:gap-x-10">
          {[
            "Zimmermann",
            "Johanna Ortiz",
            "Alexandra Miro",
            "Agua by Agua Bendita",
            "Alemais",
            "Posse",
            "SIR.",
            "Faithfull the Brand",
          ].map((name, i, arr) => (
            <li key={name} className="flex items-center gap-x-7 lg:gap-x-10">
              <Link
                to="/brands"
                className="font-display text-[1rem] sm:text-[1.1rem] tracking-[0.22em] uppercase text-ink/75 hover:text-gold transition-colors"
              >
                {name}
              </Link>
              {i < arr.length - 1 && (
                <span aria-hidden className="text-gold/50">·</span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link
            to="/brands"
            className="eyebrow text-[0.72rem] tracking-[0.3em] text-gold border-b border-gold/50 pb-1 hover:text-ink hover:border-ink transition-colors"
          >
            See All Brands We Love →
          </Link>
        </div>
      </section>

      <div className={`${wrap} mt-24 lg:mt-32 pb-16`}>
        <div className="mx-auto h-px w-16 bg-ink/15" />
        <p className="mt-8 text-center font-serif text-[11px] md:text-[12px] tracking-normal leading-relaxed text-ink/40">
          Prices and availability may change. Some links may earn a commission at no additional cost to you.
        </p>
      </div>
    </div>
  );
}