import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { destinations, getDestination, type Destination } from "@/data/destinations";
import { DestinationLink } from "@/components/DestinationLink";
import { absoluteUrl } from "@/lib/site";
import { ArrowRight } from "lucide-react";
import imgYachtCharter from "@/assets/exp-yacht-charter.jpg";
import imgSunsetCruise from "@/assets/exp-sunset-cruise.jpg";
import imgYacht from "@/assets/exp-yacht.jpg";
import imgBeachclub from "@/assets/exp-beachclub.jpg";
import imgTour from "@/assets/exp-tour.jpg";
import imgAbbey from "@/assets/exp-san-fruttuoso.jpg";
import imgCooking from "@/assets/exp-cooking-class.jpg";
import imgWine from "@/assets/exp-wine-tasting.jpg";
import imgBeach from "@/assets/concierge-beachclub-umbrellas.jpg";
import imgDayclub from "@/assets/concierge-aperitivo-tablescape.jpg";
import imgTown from "@/assets/concierge-shopping-street.jpg";
import imgDinner from "@/assets/concierge-dinner-terrace.jpg";

type PortofinoCard = {
  title: string;
  copy: string;
  image: string;
  href: string;
  cta: string;
};

const portofinoExperiences: PortofinoCard[] = [
  { title: "Portofino Walking Routes", copy: "From the piazzetta up to Castello Brown and out to the lighthouse — a slow, photographic loop.", image: imgTour, href: "https://www.getyourguide.com/portofino-l1093/walking-tour", cta: "Book a Walk" },
  { title: "Cinque Terre Boat Day", copy: "Five villages, terraced vineyards and a polished day trip from Portofino.", image: imgWine, href: "https://www.viator.com/Portofino/d50421/cinque-terre", cta: "Book the Day" },
  { title: "Riviera Cooking Class", copy: "Hands-on pesto, focaccia and a long Ligurian lunch.", image: imgCooking, href: "https://www.getyourguide.com/portofino-l1093/cooking-class", cta: "Reserve a Spot" },
  { title: "Hidden Coves Excursion", copy: "A small boat between the promontory's quietest swim stops.", image: imgAbbey, href: "https://www.viator.com/Portofino/d50421/san-fruttuoso", cta: "Book the Boat" },
  { title: "Santa Margherita Shopping Stroll", copy: "An easy half-day next door — boutiques, gelato, harbor views.", image: imgTown, href: "https://www.getyourguide.com/portofino-l1093/", cta: "Plan the Stroll" },
];

const portofinoBeachClubs: PortofinoCard[] = [
  { title: "Dolce & Gabbana Beach Club", copy: "Bright majolica prints, branded loungers and maximum people-watching. More scene than solitude — and exactly the point.", image: imgBeach, href: "https://www.dolcegabbana.com/en/special-projects/dg-le-carillon/", cta: "Reserve a Cabana" },
  { title: "La Cervara Beach Access", copy: "Historic surroundings, quieter energy and cinematic views.", image: imgBeachclub, href: "https://www.cervara.it/", cta: "Plan a Visit" },
  { title: "Langosteria Beach Lunch", copy: "Come for the long lunch. Stay until sunset.", image: imgDayclub, href: "https://langosteria.com/en/restaurants/langosteria-paraggi", cta: "Reserve a Table" },
];

const portofinoOnWater: PortofinoCard[] = [
  { title: "Private Riviera Charter", copy: "Spend the day between hidden coves, swimming stops and long lunches reached only by boat.", image: imgYachtCharter, href: "https://www.viator.com/Portofino/d50421", cta: "Book a Charter" },
  { title: "Sunset Cruise", copy: "Golden hour, aperitivo and the Ligurian coastline from the deck.", image: imgSunsetCruise, href: "https://www.getyourguide.com/portofino-l1093/sunset-cruise", cta: "Reserve Sunset Cruise" },
  { title: "Small Group Boat Day", copy: "A lower-commitment way to experience the coastline beautifully.", image: imgYacht, href: "https://www.getyourguide.com/portofino-l1093/", cta: "Book a Boat Day" },
];

const portofinoPerfectDay = [
  { when: "Morning", line: "Espresso overlooking the harbor", image: imgTown },
  { when: "Midday", line: "Boat day or beach club", image: imgBeach },
  { when: "Afternoon", line: "Shopping + aperitivo", image: imgDayclub },
  { when: "Evening", line: "Long dinner reservations", image: imgDinner },
];

function PortofinoCardGrid({ cards }: { cards: PortofinoCard[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((c) => (
        <article key={c.title} className="group bg-card border border-border/60 overflow-hidden flex flex-col hover:border-gold transition-colors">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img src={c.image} alt={c.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
          </div>
          <div className="p-6 flex flex-col flex-1">
            <h3 className="font-display text-xl tracking-[0.03em] text-ink leading-tight">{c.title}</h3>
            <p className="font-serif text-[0.9rem] text-ink/70 leading-relaxed mt-2 flex-1">{c.copy}</p>
            <a href={c.href} target="_blank" rel="noopener noreferrer sponsored" className="mt-4 inline-flex items-center gap-2 self-start eyebrow text-[0.62rem] tracking-[0.3em] text-gold border-b border-gold/60 pb-1 hover:text-ink hover:border-ink transition-colors">
              {c.cta} <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const destination = getDestination(params.slug);
    if (!destination) throw notFound();
    return { destination };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.destination;
    if (!d) return { meta: [{ title: "Destination — Resort Edit" }] };
    return {
      meta: [
        { title: `${d.name} — Resort Edit` },
        { name: "description", content: `${d.name}, ${d.country}: ${d.tagline}` },
        { property: "og:title", content: `${d.name} — Resort Edit` },
        { property: "og:description", content: d.tagline },
        { property: "og:image", content: absoluteUrl(d.image) },
        { property: "og:url", content: absoluteUrl(`/destinations/${d.slug}`) },
        { property: "og:type", content: "article" },
        { name: "twitter:image", content: absoluteUrl(d.image) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/destinations/${d.slug}`) }],
    };
  },
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <span className="eyebrow text-gold">Not found</span>
      <h1 className="font-display text-4xl mt-4">This destination hasn't been edited yet.</h1>
      <Link to="/destinations" className="eyebrow text-gold mt-8 inline-block">← Back to the Atlas</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong.</h1>
      <button onClick={reset} className="eyebrow text-gold mt-8">Try again</button>
    </div>
  ),
  component: DestinationPage,
});

function DestinationPage() {
  const { destination: d } = Route.useLoaderData() as { destination: Destination };
  const related: Destination[] = d.related
    .map((slug: string) => destinations.find((x) => x.slug === slug))
    .filter((x): x is Destination => Boolean(x));

  return (
    <article>
      {/* Hero */}
      <section className="relative h-[38vh] md:h-[50vh] min-h-[320px] max-h-[520px]">
        <img src={d.image} alt={d.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-ivory px-6 py-6">
          <span className="eyebrow text-gold-soft">{d.region} · {d.country}</span>
          <h1 className="font-display text-4xl md:text-6xl mt-3 tracking-wide">{d.name}</h1>
          <p className="mt-3 font-serif italic text-base md:text-xl max-w-2xl">{d.tagline}</p>
        </div>
      </section>

      {/* Overview */}
      <section className="mx-auto max-w-3xl px-6 py-14 md:py-16 text-center">
        <span className="eyebrow text-gold">The Overview</span>
        <p className="font-serif text-lg md:text-xl leading-relaxed text-ink mt-5 italic">
          {d.overview}
        </p>
        <div className="my-6 h-px w-16 bg-gold mx-auto" />
      </section>

      {/* What to wear + Shop edits */}
      <section className="mx-auto max-w-6xl px-6 pb-20 grid md:grid-cols-2 gap-16">
        <div>
          <span className="eyebrow text-gold">What to wear</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">The packing list</h2>
          <ul className="mt-8 space-y-3">
            {d.whatToWear.map((item: string) => (
              <li key={item} className="font-serif text-lg text-ink/85 flex items-baseline gap-3">
                <span className="hairline" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="eyebrow text-gold">Shop the edits</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">Curated to pack</h2>
          <div className="mt-8 flex flex-col gap-3">
            {d.shopEdits.map((e: { label: string; href: string }) => (
              <Link
                key={e.href}
                to={e.href as "/"}
                className="eyebrow border border-ink/20 px-5 py-4 hover:bg-ink hover:text-ivory transition-colors text-ink"
              >
                {e.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Itinerary */}
      <section className="bg-cream/60 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="eyebrow text-gold">The Itinerary</span>
            <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">A weekend in {d.name}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-10">
            {d.itinerary.map((it: { day: string; plan: string }) => (
              <div key={it.day} className="border-l-2 border-gold pl-6">
                <span className="eyebrow text-gold">{it.day}</span>
                <p className="font-serif text-lg italic text-ink/85 mt-3">{it.plan}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <span className="eyebrow text-gold">Restaurants & Beach Clubs</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">Where to eat & lounge</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {d.dining.map((dn: Destination["dining"][number]) => (
            <div key={dn.name} className="border border-border/60 p-8 bg-card">
              <span className="eyebrow text-gold">{dn.type}</span>
              <h3 className="font-display text-2xl mt-3 tracking-wide">{dn.name}</h3>
              <p className="font-serif italic text-ink/75 mt-3">{dn.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      {d.slug === "portofino" && (
        <>
          <section className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center mb-12">
              <span className="eyebrow text-gold">Experiences</span>
              <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">Worth leaving the hotel for</h2>
            </div>
            <PortofinoCardGrid cards={portofinoExperiences} />
          </section>

          <section className="mx-auto max-w-6xl px-6 pb-20">
            <div className="text-center mb-12">
              <span className="eyebrow text-gold">Beach Clubs</span>
              <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">Cabanas worth reserving</h2>
            </div>
            <PortofinoCardGrid cards={portofinoBeachClubs} />
          </section>

          <section className="mx-auto max-w-6xl px-6 pb-20">
            <div className="text-center mb-12">
              <span className="eyebrow text-gold">On the Water</span>
              <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">Portofino, from the deck</h2>
            </div>
            <PortofinoCardGrid cards={portofinoOnWater} />
          </section>

          <section className="bg-cream/60 py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="text-center mb-12">
                <span className="eyebrow text-gold">The Shortlist</span>
                <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">A Perfect Day in Portofino</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {portofinoPerfectDay.map((it) => (
                  <article key={it.when} className="bg-card border border-border/60 overflow-hidden flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img src={it.image} alt={it.line} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">{it.when}</span>
                      <p className="font-serif italic text-lg text-ink/85 mt-3 leading-relaxed flex-1">{it.line}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {related.length > 0 && (
        <section className="bg-ink text-ivory py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <span className="eyebrow text-gold-soft">Related Destinations</span>
              <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">You might also love</h2>
            </div>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((r) => (
                <DestinationLink key={r.slug} d={r} className="group block">
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <img
                      src={r.image}
                      alt={r.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="eyebrow text-gold-soft">{r.region}</span>
                      <h3 className="font-display text-2xl mt-2 text-ivory">{r.name}</h3>
                    </div>
                  </div>
                </DestinationLink>
              ))}
            </div>
            <div className="text-center mt-14">
              <Link to="/destinations" className="eyebrow text-gold-soft hover:text-gold">
                ← Back to the Atlas
              </Link>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
