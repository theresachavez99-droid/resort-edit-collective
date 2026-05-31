import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ship, Umbrella, Compass, MapPin, ArrowRight } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import heroHarbor from "@/assets/exp-harbor-golden.jpg";
import imgYachtCharter from "@/assets/exp-yacht-charter.jpg";
import imgSunsetCruise from "@/assets/exp-sunset-cruise.jpg";
import imgYacht from "@/assets/exp-yacht.jpg";
import imgBeachclub from "@/assets/exp-beachclub.jpg";
import imgBeach from "@/assets/generated/resort-edit/look-beach-desktop-hero.jpg";
import imgDayclub from "@/assets/generated/resort-edit/look-dayclub-desktop-hero.jpg";
import imgTour from "@/assets/exp-tour.jpg";
import imgAbbey from "@/assets/exp-san-fruttuoso.jpg";
import imgCooking from "@/assets/exp-cooking-class.jpg";
import imgWine from "@/assets/exp-wine-tasting.jpg";
import imgTown from "@/assets/generated/resort-edit/look-town-desktop-hero.jpg";
import imgDinner from "@/assets/generated/resort-edit/look-dinner-desktop-hero.jpg";

export const Route = createFileRoute("/portofino-concierge")({
  head: () => ({
    meta: [
      { title: "Portofino Concierge — The Resort Edit" },
      { name: "description", content: "The yachts, beach clubs, tables and experiences we'd send a friend to in Portofino." },
      { property: "og:title", content: "Portofino, Edited For You" },
      { property: "og:description", content: "The addresses we'd send a friend to." },
      { property: "og:image", content: absoluteUrl(heroHarbor) },
      { property: "og:url", content: absoluteUrl("/portofino-concierge") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino-concierge") }],
  }),
  component: ConciergePage,
});

type Card = {
  title: string;
  copy: string;
  image: string;
  href: string;
  cta?: string;
  tag?: string;
};

const yachts: Card[] = [
  {
    title: "Private Riviera Charter",
    copy: "Spend the day between hidden coves, swimming stops and long lunches reached only by boat.",
    image: imgYachtCharter,
    href: "https://www.viator.com/Portofino/d50421",
    cta: "Book a Charter",
    tag: "Resort Edit Pick",
  },
  {
    title: "Sunset Cruise",
    copy: "Golden hour, aperitivo and the Ligurian coastline from the deck.",
    image: imgSunsetCruise,
    href: "https://www.getyourguide.com/portofino-l1093/sunset-cruise",
    cta: "Reserve Sunset Cruise",
  },
  {
    title: "Small Group Boat Day",
    copy: "A lower-commitment way to experience the coastline beautifully.",
    image: imgYacht,
    href: "https://www.getyourguide.com/portofino-l1093/",
    cta: "Book a Boat Day",
  },
];

const beachclubs: Card[] = [
  {
    title: "Dolce & Gabbana Beach Club",
    copy: "Bright majolica prints, branded loungers and maximum people-watching. More scene than solitude — and exactly the point.",
    image: imgBeach,
    href: "https://www.dolcegabbana.com/en/special-projects/dg-le-carillon/",
    cta: "Reserve a Cabana",
    tag: "Resort Edit Pick",
  },
  {
    title: "La Cervara Beach Access",
    copy: "Historic surroundings, quieter energy and cinematic views.",
    image: imgBeachclub,
    href: "https://www.cervara.it/",
    cta: "Plan a Visit",
  },
  {
    title: "Langosteria Beach Lunch",
    copy: "Come for the long lunch. Stay until sunset.",
    image: imgDayclub,
    href: "https://langosteria.com/en/restaurants/langosteria-paraggi",
    cta: "Reserve a Table",
  },
];

const tours: Card[] = [
  {
    title: "Portofino Walking Routes",
    copy: "From the piazzetta up to Castello Brown and out to the lighthouse — a slow, photographic loop.",
    image: imgTour,
    href: "https://www.getyourguide.com/portofino-l1093/walking-tour",
    cta: "Book a Walk",
  },
  {
    title: "Cinque Terre Boat Day",
    copy: "Five villages, terraced vineyards and a polished day trip from Portofino.",
    image: imgWine,
    href: "https://www.viator.com/Portofino/d50421/cinque-terre",
    cta: "Book the Day",
  },
  {
    title: "Riviera Cooking Class",
    copy: "Hands-on pesto, focaccia and a long Ligurian lunch.",
    image: imgCooking,
    href: "https://www.getyourguide.com/portofino-l1093/cooking-class",
    cta: "Reserve a Spot",
  },
  {
    title: "Hidden Coves Excursion",
    copy: "A small boat between the promontory's quietest swim stops.",
    image: imgAbbey,
    href: "https://www.viator.com/Portofino/d50421/san-fruttuoso",
    cta: "Book the Boat",
  },
  {
    title: "Santa Margherita Shopping Stroll",
    copy: "An easy half-day next door — boutiques, gelato, harbor views.",
    image: imgTown,
    href: "https://www.getyourguide.com/portofino-l1093/",
    cta: "Plan the Stroll",
  },
];

const itinerary = [
  { when: "Morning", line: "Espresso overlooking the harbor", image: imgTown },
  { when: "Midday", line: "Boat day or beach club", image: imgBeach },
  { when: "Afternoon", line: "Shopping + aperitivo", image: imgDayclub },
  { when: "Evening", line: "Long dinner reservations", image: imgDinner },
];

const NAV = [
  { id: "yachts", label: "Yachts", Icon: Ship },
  { id: "beachclubs", label: "Beach Clubs", Icon: Umbrella },
  { id: "tours", label: "Tours", Icon: MapPin },
  { id: "experiences", label: "Experiences", Icon: Compass },
];

function ConciergePage() {
  const [active, setActive] = useState<string>("yachts");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-ivory min-h-screen pb-28 md:pb-12">
      {/* HERO */}
      <section className="relative h-[68vh] min-h-[460px] w-full overflow-hidden bg-ink">
        <img
          src={heroHarbor}
          alt="Portofino harbor at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center 35%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-black/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-16 md:pb-24 text-ivory">
          <span className="eyebrow tracking-[0.4em] text-ivory/80">The Resort Edit · Concierge</span>
          <h1 className="font-display text-5xl md:text-7xl tracking-[0.04em] mt-5 leading-[1]">
            PORTOFINO, EDITED FOR YOU
          </h1>
          <div className="my-5 h-px w-12 bg-gold" />
          <p className="font-serif italic text-lg md:text-2xl text-ivory/90 max-w-xl leading-relaxed">
            The addresses we&rsquo;d send a friend to.
          </p>
        </div>
      </section>

      {/* STICKY MINI NAV */}
      <div className="sticky top-0 z-30 bg-ivory/95 backdrop-blur border-b border-border/60">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3 flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {NAV.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`eyebrow whitespace-nowrap inline-flex items-center gap-2 text-[0.6rem] sm:text-[0.65rem] tracking-[0.28em] px-3 sm:px-4 py-2 border transition-colors cursor-pointer ${
                  isActive
                    ? "border-gold bg-gold text-ivory"
                    : "border-border/60 text-ink hover:border-gold hover:text-gold"
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* YACHTS */}
      <Section id="yachts" eyebrow="01 · The Water" title="Yacht Days" subtitle="Portofino is best experienced from the water.">
        <CardGrid cards={yachts} columns={3} />
      </Section>

      {/* BEACH CLUBS */}
      <Section id="beachclubs" eyebrow="02 · The Coast" title="Beach Clubs Worth Reserving" subtitle="Cabanas, long lunches and the quieter corners of Paraggi.">
        <CardGrid cards={beachclubs} columns={3} variant="tall" />
      </Section>

      {/* TOURS */}
      <Section id="tours" eyebrow="03 · The Day Out" title="Experiences Worth Leaving The Hotel For" subtitle="Curated for travelers who don&rsquo;t do bus tours.">
        <CardGrid cards={tours} columns={3} />
      </Section>

      {/* EXPERIENCES — Resort Edit Shortlist */}
      <Section id="experiences" eyebrow="04 · The Shortlist" title="The Resort Edit Shortlist" subtitle="One perfect day, paced like a local.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {itinerary.map((it) => (
            <article key={it.when} className="bg-card border border-border/60 flex flex-col overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={it.image} alt={it.line} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">{it.when}</span>
                <p className="font-serif italic text-lg text-ink/85 mt-3 leading-relaxed flex-1">
                  {it.line}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* BOTTOM CTA */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 md:py-28 text-center">
        <span className="eyebrow text-gold tracking-[0.3em] text-[0.7rem]">Still deciding?</span>
        <h2 className="font-display text-3xl md:text-5xl tracking-[0.04em] text-ink mt-5 leading-[1.05]">
          Let the full Portofino edit guide the trip.
        </h2>
        <div className="mx-auto my-6 h-px w-12 bg-gold" />
        <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
          Five days, fifteen looks, hotels and tables across price points.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/portofino"
            className="inline-flex items-center gap-2 bg-ink text-ivory eyebrow tracking-[0.28em] text-[0.7rem] px-8 py-4 hover:bg-gold transition-colors"
          >
            Explore the Full Portofino Edit <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/portofino-edit"
            className="inline-flex items-center gap-2 border border-ink/40 text-ink eyebrow tracking-[0.28em] text-[0.7rem] px-8 py-4 hover:border-gold hover:text-gold transition-colors"
          >
            Shop by Price Point
          </Link>
        </div>
      </section>

      {/* MOBILE STICKY CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ivory/95 backdrop-blur border-t border-border/60 px-2 py-2 grid grid-cols-4 gap-1 shadow-[0_-10px_30px_-15px_rgba(60,30,10,0.25)]">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="flex flex-col items-center justify-center py-2 eyebrow text-[0.5rem] tracking-[0.22em] text-ink hover:text-gold"
          >
            <Icon className="w-4 h-4 mb-1" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* DISCLOSURE */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        <div className="mx-auto h-px w-12 bg-ink/15" />
        <p className="mt-6 text-center font-serif text-[12px] leading-relaxed text-ink/45">
          Some links may earn a commission at no additional cost to you.
        </p>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 mx-auto max-w-[1280px] px-4 sm:px-6 pt-20 md:pt-28">
      <header className="max-w-2xl mb-10 md:mb-14">
        <span className="eyebrow text-gold tracking-[0.32em] text-[0.65rem]">{eyebrow}</span>
        <h2 className="font-display text-3xl md:text-5xl tracking-[0.04em] text-ink mt-4 leading-[1.05]">
          {title}
        </h2>
        <div className="my-4 h-px w-12 bg-gold" />
        <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

function CardGrid({ cards, columns = 3, variant }: { cards: Card[]; columns?: 2 | 3; variant?: "tall" }) {
  const gridCols =
    columns === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";
  const aspect = variant === "tall" ? "aspect-[3/4]" : "aspect-[4/5]";
  return (
    <div className={`grid ${gridCols} gap-6 md:gap-8`}>
      {cards.map((c) => (
        <article key={c.title} className="group bg-card border border-border/60 flex flex-col overflow-hidden hover:border-gold transition-colors">
          <div className={`relative ${aspect} overflow-hidden bg-muted`}>
            <img
              src={c.image}
              alt={c.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
            />
            {c.tag && (
              <span className="absolute top-3 left-3 bg-gold text-ivory eyebrow px-2.5 py-1 tracking-[0.28em] text-[0.55rem]">
                {c.tag}
              </span>
            )}
          </div>
          <div className="p-6 md:p-7 flex-1 flex flex-col">
            <h3 className="font-display text-2xl tracking-[0.03em] text-ink leading-tight">{c.title}</h3>
            <p className="font-serif text-[0.95rem] text-ink/70 leading-relaxed mt-3 flex-1">{c.copy}</p>
            {c.cta && (
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-5 inline-flex items-center gap-2 self-start eyebrow text-[0.62rem] tracking-[0.3em] text-gold border-b border-gold/60 pb-1 hover:text-ink hover:border-ink transition-colors"
              >
                {c.cta} <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}