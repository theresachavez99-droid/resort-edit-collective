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
import { partnerHref } from "@/data/partnerLinks";
import heroVideoAsset from "@/assets/portofino-hero.mp4.asset.json";
import heroPosterAsset from "@/assets/portofino-hero-poster.jpg.asset.json";
import * as React from "react";

const featured = getFeaturedDestination();
const heroMuse = featured.heroImage;
const heroVideoUrl = heroVideoAsset.url;
const heroPosterUrl = heroPosterAsset.url;

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
      { rel: "preload", as: "image", href: heroPosterUrl, fetchpriority: "high" },
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
    partnerKey: "hotel-splendido",
  },
  {
    name: "Eight Hotel Portofino",
    image: hotelEight,
    vibe: "PIAZZETTA · LOCAL ENERGY",
    pick: "Best for First-Time Visitors",
    desc: "Quietly chic and steps from the piazzetta. A modern Italian retreat for travelers who want to live like a local in the heart of town.",
    signals: ["Steps from the piazzetta", "Boutique, under 20 rooms", "Concierge who books the impossible"],
    note: "For the trip you'll want to repeat next summer.",
    partnerKey: "hotel-eight-portofino",
  },
  {
    name: "Hotel Piccolo Portofino",
    image: hotelPiccolo,
    vibe: "HIDDEN · PRIVATE COVE",
    pick: "Best for Privacy",
    desc: "An intimate seaside hideaway tucked into a private cove. Sun-bleached terraces, turquoise water, and the kind of service that anticipates everything.",
    signals: ["Private sea-access terrace", "Quiet side of the harbor", "Sea-view suites only"],
    note: "For the traveler who wants the harbor without the crowd.",
    partnerKey: "hotel-piccolo-portofino",
  },
];

const experiences = [
  {
    badge: "Editor's Pick",
    name: "Private Yacht Charter",
    desc: "Sail the Ligurian coast in style, from the harbor to hidden coves.",
    image: experienceYacht,
    cta: "Explore Yacht Charters",
    partnerKey: "experience-yacht-charter",
  },
  {
    badge: "Most Popular",
    name: "Beach Club Reservation",
    desc: "Sun, sea, and the perfect lunch on a private deck above the water.",
    image: experienceBeachClub,
    cta: "Reserve Beach Club",
    partnerKey: "experience-beach-club",
  },
  {
    badge: "Half-Day Adventure",
    name: "Boat Excursions",
    desc: "Discover San Fruttuoso and the coastline by classic Italian boat.",
    image: experienceBoat,
    cta: "Explore Boat Excursions",
    partnerKey: "experience-boat-excursions",
  },
  {
    badge: "Authentic Experience",
    name: "Cooking Classes",
    desc: "Learn Ligurian classics—pesto, pasta, and lemon-kissed desserts.",
    image: experienceCooking,
    cta: "View Cooking Classes",
    partnerKey: "experience-cooking-classes",
  },
];

function Index() {
  const wrap = "px-4 sm:px-6 lg:px-10 xl:px-14 mx-auto max-w-[1440px]";
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return (
    <div className="bg-ivory w-full">
      {/* HERO — single cinematic scene, no commerce, no nav stack. */}
      <section
        aria-label={`${featured.name} — editorial cover`}
        className="relative w-full overflow-hidden bg-ink"
      >
        <div
          className="relative w-full h-[78vh] min-h-[560px] max-h-[920px] [--hero-focal:50%_15%] sm:[--hero-focal:50%_15%] md:[--hero-focal:50%_12%] lg:[--hero-focal:50%_10%] xl:[--hero-focal:50%_8%]"
        >
          {prefersReducedMotion ? (
            <img
              src={heroPosterUrl}
              alt={featured.heroImageAlt}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "var(--hero-focal, 50% 15%)" }}
            />
          ) : (
            <video
              key="portofino-hero-video"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "var(--hero-focal, 50% 15%)" }}
              src={heroVideoUrl}
              poster={heroPosterUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              aria-label={featured.heroImageAlt}
            />
          )}
          {/* Quiet gradient so the type stays readable without crushing the image. */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/15 to-ink/25" />
          <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 lg:px-14 pb-12 md:pb-16 lg:pb-20">
            <div className="max-w-[1440px] mx-auto">
              <p className="eyebrow text-ivory/85 text-[0.7rem] sm:text-[0.78rem] tracking-[0.42em]">
                RESORT EDIT™  ·  PORTOFINO, ITALY
              </p>
              <h1 className="mt-3 font-display text-ivory text-[2.6rem] sm:text-[3.6rem] lg:text-[4.4rem] leading-[1.02] tracking-[0.01em] max-w-[22ch]">
                One perfect day in Portofino.
              </h1>
              <p className="mt-3 font-serif italic text-ivory/85 text-[1.05rem] sm:text-[1.15rem] lg:text-[1.25rem] leading-snug max-w-[44ch]">
                From the first walk along the harbor to one final cocktail on the piazzetta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THESIS BAND — quiet centered statement, no commerce. */}
      <section className={`${wrap} pt-12 md:pt-16 pb-8 md:pb-12 text-center`}>
        <p
          className="font-serif italic text-[1.5rem] sm:text-[1.8rem] lg:text-[2.05rem] leading-[1.15] tracking-[-0.005em] max-w-[34ch] mx-auto"
          style={{ color: "oklch(0.42 0.06 60)" }}
        >
          Dressed for the Destination™
        </p>
        <p className="mt-4 font-serif italic text-ink/70 text-[1rem] sm:text-[1.08rem] max-w-[48ch] mx-auto leading-relaxed">
          Every moment thoughtfully curated — from your first arrival to your final nightcap.
        </p>
        <div className="mt-6 mx-auto h-px w-16 bg-gold/60" />
      </section>

      {/* THE TWELVE MOMENTS — promoted to first beat after the thesis band. */}
      <section className={`${wrap}`}>
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold text-[0.7rem] tracking-[0.34em]">
            THE PORTOFINO EDIT
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl tracking-[0.02em] text-ink leading-[1.05]">
            Twelve Editorial Moments.
          </h2>
          <div className="mt-4 mx-auto h-px w-16 bg-gold/60" />
        </div>

        <div className="mt-5 md:mt-7">
          <HomeEditorialChapters />
        </div>
      </section>

      {/* WHERE TO STAY */}
      <section className={`${wrap} mt-12 md:mt-16`}>
        <div className="flex items-center gap-4 justify-center mb-3">
          <div className="h-px w-12 bg-gold/50" />
          <h2 className="font-display text-[1.75rem] sm:text-[2.05rem] font-medium tracking-[0.18em] text-ink">WHERE RESORT EDIT WOULD STAY</h2>
          <div className="h-px w-12 bg-gold/50" />
        </div>
        <p className="mb-7 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
          Where Resort Edit would stay—chosen for location, atmosphere, and unforgettable views.
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
                  href={partnerHref(h.partnerKey)}
                  data-partner-key={h.partnerKey}
                  data-partner-type="hotel"
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

      {/* BOOK YOUR PORTOFINO EXPERIENCE */}
      <section className={`${wrap} mt-12 md:mt-16`}>
        <div className="flex items-center gap-4 justify-center mb-3">
          <div className="h-px w-12 bg-gold/50" />
          <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">BOOK YOUR PORTOFINO EXPERIENCE</h2>
          <div className="h-px w-12 bg-gold/50" />
        </div>
        <p className="mb-7 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
          The experiences we'd book to complete the perfect Portofino itinerary.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {experiences.map((e) => (
            <article key={e.name} className="bg-card border border-border/50 flex flex-col">
              <div className="relative aspect-[4/3] min-h-[220px] overflow-hidden bg-muted">
                <img src={e.image} alt={e.name} loading="lazy" width={1024} height={768} className="absolute inset-0 h-full w-full object-cover" />
                {e.badge && (
                  <span className="absolute left-4 bottom-4 bg-ink/75 text-ivory eyebrow text-[0.6rem] tracking-[0.26em] px-3 py-1.5 backdrop-blur-sm">
                    {e.badge}
                  </span>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-2xl tracking-wide text-ink">{e.name}</h3>
                <p className="mt-3 font-serif text-[0.95rem] text-ink/75 leading-relaxed flex-1">{e.desc}</p>
                <a
                  href={partnerHref(e.partnerKey)}
                  data-partner-key={e.partnerKey}
                  data-partner-type="experience"
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

      {/* BRANDS WE LOVE */}
      <section className={`${wrap} mt-10 md:mt-14 pb-12 md:pb-20`}>
        <div className="flex items-center gap-4 justify-center mb-3">
          <div className="h-px w-12 bg-gold/50" />
          <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">BRANDS WE LOVE</h2>
          <div className="h-px w-12 bg-gold/50" />
        </div>
        <p className="mb-7 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
          Designers consistently chosen for their craftsmanship, destination relevance, and timeless style.
        </p>
        <ul className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:gap-x-10">
          {[
            { name: "Eres", slug: "eres" },
            { name: "Callas Milano", slug: "callas-milano" },
            { name: "Pucci", slug: "pucci" },
            { name: "Missoni", slug: "missoni" },
            { name: "Zimmermann", slug: "zimmermann" },
            { name: "Johanna Ortiz", slug: "johanna-ortiz" },
            { name: "Alexandra Miro", slug: "alexandra-miro" },
            { name: "Vix Paula Hermanny", slug: "vix-paula-hermanny" },
          ].map(({ name, slug }, i, arr) => (
            <li key={name} className="flex items-center gap-x-7 lg:gap-x-10">
              <Link
                to="/brands/$slug"
                params={{ slug }}
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

      <div className={`${wrap} pb-16 md:pb-24`}>
        <div className="mx-auto h-px w-16 bg-ink/15" />
        <p className="mt-6 text-center font-serif text-[11px] md:text-[12px] tracking-normal leading-relaxed text-ink/40">
          Prices and availability may change. Some links may earn a commission at no additional cost to you.
        </p>
      </div>
    </div>
  );
}
