import { createFileRoute, Link } from "@tanstack/react-router";
import experienceYacht from "@/assets/experience-yacht.jpg";
import experienceBeachClub from "@/assets/experience-beach-club.jpg";
import experienceBoat from "@/assets/experience-boat.jpg";
import experienceCooking from "@/assets/experience-cooking.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { portofinoMomentsQuery } from "@/components/HomeItinerary";
import { HomeEditorialChapters } from "@/components/HomeEditorialChapters";
import { getFeaturedDestination } from "@/data/featuredDestination";

const featured = getFeaturedDestination();
const heroMuse = featured.heroImage;

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
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "preload", as: "image", href: heroMuse, fetchpriority: "high" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(portofinoMomentsQuery),
  component: Index,
});

const hotels = [
  {
    name: "Splendido, A Belmond Hotel",
    image: hotelSplendido,
    vibe: "ICONIC · CLIFFTOP VIEWS",
    pick: "Resort Edit Favorite",
    desc: "A cliffside grande dame above the harbor. Timeless Italian glamour, bougainvillea terraces, and the most storied view on the Riviera.",
    signals: ["Resort Edit top pick", "Harbour-facing rooms only", "Private pool terrace & cabanas"],
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

const experiences = [
  {
    category: "Yacht Charters",
    name: "Private Yacht Charter",
    desc: "Sail the Ligurian coast in style, from the harbor to hidden coves.",
    image: experienceYacht,
    cta: "Explore Yacht Charters",
    href: "https://www.getmyboat.com/",
  },
  {
    category: "Beach Clubs",
    name: "Beach Club Reservation",
    desc: "Sun, sea, and the perfect lunch on a private deck above the water.",
    image: experienceBeachClub,
    cta: "Reserve Beach Club",
    href: "https://www.bagnicapri.it/",
  },
  {
    category: "Excursions",
    name: "Boat Excursions",
    desc: "Discover San Fruttuoso and the coastline by classic Italian boat.",
    image: experienceBoat,
    cta: "Explore Boat Excursions",
    href: "https://www.tigullio.it/",
  },
  {
    category: "Culinary",
    name: "Cooking Classes",
    desc: "Learn Ligurian classics—pesto, pasta, and lemon-kissed desserts.",
    image: experienceCooking,
    cta: "View Cooking Classes",
    href: "https://www.tuscanynow.com/experiences/cooking-classes/",
  },
];

function Index() {
  // Wider editorial canvas — up to ~1440px content width on desktop.
  const wrap = "px-4 sm:px-6 lg:px-10 xl:px-14 mx-auto max-w-[1440px]";
  return (
    <div className="bg-ivory w-full">
      {/* HERO — editorial cover: photography-led, destination-first hierarchy */}
      <section
        className={`${wrap} pt-6 lg:pt-10 pb-6 lg:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center`}
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
            {featured.totalMoments} Curated Moments
          </p>
          <p
            className="font-serif italic text-[1.2rem] sm:text-[1.32rem] lg:text-[1.45rem] leading-[1.15] mt-2.5 text-ink"
          >
            Every moment thoughtfully curated—from your first espresso to sunset overlooking the harbor.
          </p>
          <div className="mt-3 mb-2.5 h-px w-24 bg-gold/80" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={featured.primaryCtaHref as "/"}
              className="bg-gold text-ivory eyebrow text-[0.78rem] tracking-[0.28em] px-10 py-[18px] hover:bg-ink transition-colors"
            >
              Discover {featured.name}
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
            className="mt-5"
          >
            <p className="eyebrow text-gold text-[0.62rem] tracking-[0.34em] mb-2">
              Editorial Itinerary
            </p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {featured.momentLabels.map((m, i) => (
                <li key={m.slug} className="flex items-center gap-x-5">
                  <Link
                    to="/portofino/$moment"
                    params={{ moment: m.slug }}
                    className="eyebrow text-[0.72rem] sm:text-[0.7rem] tracking-[0.22em] text-ink/70 hover:text-gold transition-colors py-1"
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

      {/* THE PORTOFINO EDIT — editorial chapter collection */}
      <section className={`${wrap} mt-8 md:mt-10`}>
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold text-[0.7rem] tracking-[0.34em]">
            THE PORTOFINO EDIT
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl tracking-[0.02em] text-ink leading-[0.95]">
            Your Portofino Wardrobe
          </h2>
          <p className="mt-2 font-serif italic text-[0.92rem] sm:text-[0.98rem] text-ink/60 leading-relaxed">
            Curated for every unforgettable moment.
          </p>
          <div className="mt-4 mx-auto h-px w-16 bg-gold/60" />
        </div>

        <div className="mt-5 md:mt-7">
          <HomeEditorialChapters />
        </div>
      </section>

      {/* WHERE TO STAY — moves immediately after the editorial collection */}
      <section className={`${wrap} mt-12 md:mt-16`}>
          <div className="flex items-center gap-4 justify-center mb-3">
            <div className="h-px w-12 bg-gold/50" />
            <h2 className="font-display text-[1.75rem] sm:text-[2.05rem] font-medium tracking-[0.18em] text-ink">WHERE RESORT EDIT WOULD STAY</h2>
            <div className="h-px w-12 bg-gold/50" />
          </div>
          <p className="mb-7 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
            Hotels chosen as part of the destination — where to stay, why it fits, and the experience it delivers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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

          <div className="mt-6 pt-5 border-t border-ink/15 text-center">
            <p className="font-serif italic text-[0.9rem] text-ink/55 max-w-2xl mx-auto leading-relaxed">
              Rates available on enquiry. Some properties book out months in advance — we recommend reserving before your flights.
            </p>
          </div>
      </section>

      {/* BOOK YOUR PORTOFINO EXPERIENCE — image-led editorial rail */}
      <section className={`${wrap} mt-12 md:mt-16`}>
        <div className="flex items-center gap-4 justify-center mb-3">
          <div className="h-px w-12 bg-gold/50" />
          <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">BOOK YOUR PORTOFINO EXPERIENCE</h2>
          <div className="h-px w-12 bg-gold/50" />
        </div>
        <p className="mb-7 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
          Curated experiences to elevate your Portofino escape.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {experiences.map((e) => (
            <article key={e.name} className="bg-card border border-border/50 flex flex-col">
              <div className="relative aspect-[4/3] min-h-[220px] overflow-hidden bg-muted">
                <img src={e.image} alt={e.name} loading="lazy" width={1024} height={768} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute left-4 bottom-4 bg-ink/75 text-ivory eyebrow text-[0.6rem] tracking-[0.26em] px-3 py-1.5 backdrop-blur-sm">
                  {e.category}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-2xl tracking-wide text-ink">{e.name}</h3>
                <p className="mt-3 font-serif text-[0.95rem] text-ink/75 leading-relaxed flex-1">{e.desc}</p>
                <a
                  href={e.href}
                  target="_blank"
                  rel="noreferrer noopener sponsored"
                  className="mt-6 inline-flex justify-center eyebrow text-[0.72rem] tracking-[0.3em] text-gold border-b border-gold/50 pb-1 self-center hover:text-ink hover:border-ink transition-colors"
                >
                  {e.cta} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BRANDS WE LOVE — minimalist trust signal, no logos/carousels */}
      <section className={`${wrap} mt-10 md:mt-14`}>
        <div className="flex items-center gap-4 justify-center mb-3">
          <div className="h-px w-12 bg-gold/50" />
          <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">BRANDS WE LOVE</h2>
          <div className="h-px w-12 bg-gold/50" />
        </div>
        <p className="mb-7 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
          A short list of the ateliers and houses we keep returning to across destinations.
        </p>
        <ul className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:gap-x-10">
          {[
            "ERES",
            "Johanna Ortiz",
            "Zimmermann",
            "ViX Paula Hermanny",
            "Callas Milano",
            "Pucci",
            "Missoni",
            "Alexandra Miro",
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
        <div className="mt-6 text-center">
          <Link
            to="/brands"
            className="eyebrow text-[0.72rem] tracking-[0.3em] text-gold border-b border-gold/50 pb-1 hover:text-ink hover:border-ink transition-colors"
          >
            See All Brands We Love →
          </Link>
        </div>
      </section>

      {/* EDITORIAL CLOSING — single, quiet line that hands off to the footer invitation */}
      <section className={`${wrap} mt-14 md:mt-20 pb-4`}>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto h-px w-12 bg-gold/60" />
          <p className="mt-6 font-serif italic text-[1.35rem] sm:text-[1.55rem] leading-[1.35] text-ink">
            Every Resort Edit begins with the destination —<br className="hidden sm:block" /> not the outfit.
          </p>
          <div className="mt-6 mx-auto h-px w-12 bg-gold/60" />
        </div>
      </section>

      <div className={`${wrap} mt-10 md:mt-14 pb-12`}>
        <div className="mx-auto h-px w-16 bg-ink/15" />
        <p className="mt-6 text-center font-serif text-[11px] md:text-[12px] tracking-normal leading-relaxed text-ink/40">
          Prices and availability may change. Some links may earn a commission at no additional cost to you.
        </p>
      </div>
    </div>
  );
}