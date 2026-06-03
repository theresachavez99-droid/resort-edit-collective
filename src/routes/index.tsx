import { createFileRoute, Link } from "@tanstack/react-router";
import { Ship, Umbrella, Camera, Compass } from "lucide-react";
import heroMuse from "@/assets/hero-portofino-harbor.jpg";
import day3Muse from "@/assets/hero-muse-portofino.jpg";
import stillLife from "@/assets/portofino-still-life.jpg";
import lookYacht from "@/assets/generated/resort-edit/look-yacht-card-thumb.jpg";
import lookBeach from "@/assets/generated/resort-edit/look-beach-card-thumb.jpg";
import lookDayclub from "@/assets/generated/resort-edit/look-dayclub-card-thumb.jpg";
import lookDinner from "@/assets/generated/resort-edit/look-dinner-card-thumb.jpg";
import day5Muse from "@/assets/generated/resort-edit/day5-market-strolls-hires-card-20260601.jpg";
import day5MuseMobile from "@/assets/generated/resort-edit/day5-market-strolls-hires-mobile-20260601.jpg";
import day5MuseRetina from "@/assets/generated/resort-edit/day5-market-strolls-hires-retina-2x-20260601.jpg";
import editD2a from "@/assets/generated/resort-edit/edit-d2-a-card-thumb.jpg";
import editD2b from "@/assets/generated/resort-edit/edit-d2-b-card-thumb.jpg";
import editD1a from "@/assets/generated/resort-edit/edit-d1-a-card-thumb.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resort Edit — 5 Days in Portofino, La Dolce Vita" },
      { name: "description", content: "A luxury style and itinerary guide to Portofino — five days, five looks, hotels, beach clubs and experiences across price points." },
      { property: "og:title", content: "Resort Edit — 5 Days in Portofino" },
      { property: "og:description", content: "Luxury labels. Riviera finds. Resort style across price points." },
      { property: "og:image", content: absoluteUrl(heroMuse) },
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

type DayCard = {
  n: "1" | "2" | "3" | "4" | "5";
  href: "/portofino/day-1" | "/portofino/day-2" | "/portofino/day-3" | "/portofino/day-4" | "/portofino/day-5";
  title: string;
  desc: string;
  image: string;
  imageMobile?: string;
  imageRetina?: string;
};

const days: DayCard[] = [
  { n: "1", href: "/destinations/portofino/day-1-yacht-harbour-aperitivo", title: "Yacht Day & Harbour Aperitivo", desc: "Open water, tan lines & hidden coves.", image: lookYacht },
  { n: "2", href: "/portofino/day-2", title: "Beach Club & Long Lunches", desc: "Slow mornings, long lunches, seaside glamour.", image: lookBeach },
  { n: "3", href: "/portofino/day-3", title: "Pool Lounging & Shopping", desc: "Poolside ease, via Roma, Capri luxe.", image: day3Muse },
  { n: "4", href: "/portofino/day-4", title: "Sunset Cocktails & Dinner With a View", desc: "Golden hour, candlelight, harbor glow.", image: lookDinner },
  { n: "5", href: "/portofino/day-5", title: "Market Strolls & Coastal Goodbyes", desc: "Espresso, linen, and one long last lunch.", image: day5Muse, imageMobile: day5MuseMobile, imageRetina: day5MuseRetina },
];

const looks = [
  { tag: "Look A", title: "Lemon Print Set", image: editD2a },
  { tag: "Look B", title: "Lace Chic", image: editD2b },
  { tag: "Look C", title: "Blue Majolica Set", image: editD1a },
];

const hotels = [
  { name: "Splendido, A Belmond Hotel", image: hotelSplendido, desc: "A cliffside grande dame above the harbor. Timeless Italian glamour, bougainvillea terraces, and the most storied view on the Riviera.", href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/" },
  { name: "Eight Hotel Portofino", image: hotelEight, desc: "Quietly chic and steps from the piazzetta. A modern Italian retreat for travelers who want to live like a local in the heart of town.", href: "https://www.eighthotels.com/en/eight-hotel-portofino/" },
  { name: "Hotel Piccolo Portofino", image: hotelPiccolo, desc: "An intimate seaside hideaway tucked into a private cove. Sun-bleached terraces, turquoise water, and the kind of service that anticipates everything.", href: "https://www.hotelpiccoloportofino.com/" },
];

const ctas = [
  { label: "Book a Yacht", Icon: Ship, hash: "yachts" },
  { label: "Reserve a Beach Club", Icon: Umbrella, hash: "beachclubs" },
  { label: "Book a Tour", Icon: Camera, hash: "tours" },
  { label: "View Experiences", Icon: Compass, hash: "experiences" },
];

function Index() {
  const wrap = "px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24";
  return (
    <div className="bg-ivory w-full">
      {/* HERO — balanced 50/50 split */}
      <section className={`${wrap} pt-6 lg:pt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center`}>
          <div className="relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-muted">
            <img src={heroMuse} alt="Portofino editorial muse" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="lg:pl-2 max-w-[750px]">
            <p className="eyebrow text-gold text-[0.82rem] tracking-[0.38em]">A Style &amp; Itinerary Guide</p>
            <h1 className="font-display mt-3 text-[3.4rem] sm:text-[4.2rem] lg:text-[6.2rem] xl:text-[7.4rem] leading-[0.9] tracking-[0.01em] text-ink">
              5 DAYS IN
              <br />
              PORTOFINO
            </h1>
            <p
              className="font-serif italic text-[2.7rem] sm:text-[3.3rem] lg:text-[4.2rem] xl:text-[4.7rem] leading-[0.95] tracking-[-0.01em] mt-1 -ml-0.5 max-w-[85%]"
              style={{ color: "oklch(0.62 0.12 66)" }}
            >
              La Dolce Vita
            </p>
            <div className="mt-5 mb-4 h-px w-32 bg-gold/80" />
            <p className="font-serif text-ink font-semibold text-lg sm:text-xl lg:text-[1.4rem] tracking-[0.01em] leading-[1.5] max-w-[85%]">
              Luxury Labels. Destination Finds. Resort Style Across Price Points.
            </p>
            <p className="mt-3 font-serif text-lg lg:text-[1.2rem] text-ink/80 leading-[1.7] max-w-2xl">
              Curated from international resort favorites, quiet luxury labels, and vacation brands we love.
            </p>
            <p className="mt-4 eyebrow text-[0.72rem] tracking-[0.28em] text-ink/70">
              Zimmermann <span className="text-gold">·</span> Johanna Ortiz <span className="text-gold">·</span> SIR <span className="text-gold">·</span> Faithfull the Brand <span className="text-gold">·</span> <Link to="/brands" className="hover:text-gold">More</Link>
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/portofino" className="bg-ink text-ivory eyebrow text-[0.82rem] tracking-[0.28em] px-12 py-[22px] hover:bg-gold transition-colors">
                Explore the Edit →
              </Link>
              <Link to="/portofino-edit" className="eyebrow text-[0.82rem] tracking-[0.28em] text-ink border border-ink/40 px-12 py-[22px] hover:border-gold hover:text-gold transition-colors">
                Shop by Price Point
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-ink/80">
              <span className="eyebrow text-[0.92rem] tracking-[0.26em]">
                5 Days <span className="text-gold">·</span> 15 Looks <span className="text-gold">·</span> 6 Experiences
              </span>
              <span className="hidden md:inline h-4 w-px bg-ink/25" aria-hidden />
              <span className="font-serif italic text-[1.2rem] text-ink/75">
                Designer / Mid-Luxe / Destination Finds
              </span>
              <span className="hidden md:inline h-4 w-px bg-ink/25" aria-hidden />
              <span className="eyebrow text-[0.82rem] tracking-[0.3em] text-gold">
                ★ Most Saved Edit
              </span>
            </div>
          </div>
      </section>

      {/* 5-DAY CARDS */}
      <section className={`${wrap} mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5`}>
          {days.map((d) => (
            <article key={d.n} className="bg-card border border-border/50 flex flex-col">
              <div className="text-center pt-5 px-3">
                <div className="eyebrow text-[0.62rem] tracking-[0.28em] text-gold">Day {d.n}</div>
                <h3 className="mt-3 eyebrow text-[0.72rem] tracking-[0.2em] leading-snug text-ink min-h-[2.5rem]">
                  {d.title}
                </h3>
              </div>
              <div className="relative aspect-[4/5] mt-4 overflow-hidden bg-muted">
                <img
                  src={d.image}
                  srcSet={d.imageRetina ? `${d.image} 1x, ${d.imageRetina} 2x` : undefined}
                  alt={d.title}
                  loading={d.n === "5" ? "eager" : "lazy"}
                  fetchPriority={d.n === "5" ? "high" : undefined}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: d.n === "5" ? "center center" : "center top", imageRendering: "auto" }}
                />
              </div>
              <div className="px-4 pt-5 pb-[22px] text-center flex-1 flex flex-col">
                <p className="font-serif italic text-[0.96rem] text-ink/70 leading-relaxed flex-1">{d.desc}</p>
                <Link to={d.href} className="mt-5 eyebrow text-[0.65rem] tracking-[0.24em] text-gold border-b border-gold/50 pb-1 self-center hover:text-ink hover:border-ink transition-colors">
                  {d.n === "1" ? "View Full Day Edit →" : "Explore the Look →"}
                </Link>
              </div>
            </article>
          ))}
      </section>

      {/* SHOP THE LOOKS + TIP */}
      <section className={`${wrap} mt-20 lg:mt-28`}>
          <div className="flex items-center gap-4 justify-center mb-10">
            <div className="h-px w-16 bg-gold/50" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">MORE LOOKS FOR PORTOFINO</h2>
            <div className="h-px w-16 bg-gold/50" />
          </div>
          <p className="-mt-6 mb-10 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
            Additional outfits for long lunches, harbor strolls and last-minute reservations.
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
                <Link to="/portofino" className="text-center py-4 eyebrow text-[0.65rem] tracking-[0.24em] text-gold hover:text-ink border-t border-border/50 transition-colors">
                  Shop the Look →
                </Link>
              </article>
            ))}

            {/* Resort Edit Tip */}
            <aside className="flex flex-col gap-5">
              <div className="bg-gold/15 border border-gold/30 p-6 flex-1 flex flex-col">
                <div className="eyebrow text-[0.62rem] tracking-[0.28em] text-gold">✦ Resort Edit Tip</div>
                <p className="mt-5 font-serif italic text-lg text-ink/85 leading-relaxed">
                  Book a cabana.<br />Sip limoncello.<br />Stay until sunset.
                </p>
                <Link to="/portofino-concierge" className="mt-6 inline-block text-center bg-gold text-ivory eyebrow text-[0.65rem] tracking-[0.24em] py-3 px-4 hover:bg-ink transition-colors">
                  Explore Portofino →
                </Link>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={stillLife} alt="Portofino still life" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </aside>
          </div>
      </section>

      {/* WHERE TO STAY */}
      <section className={`${wrap} mt-20 lg:mt-28`}>
          <div className="flex items-center gap-4 justify-center mb-10">
            <div className="h-px w-16 bg-gold/50" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">WHERE TO STAY</h2>
            <div className="h-px w-16 bg-gold/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {hotels.map((h) => (
              <article key={h.name} className="grid grid-cols-[40%_1fr] bg-card border border-border/50">
                <div className="relative overflow-hidden bg-muted">
                  <img src={h.image} alt={h.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="p-5 flex flex-col">
                  <div className="eyebrow text-[0.6rem] tracking-[0.28em] text-gold">Portofino, Italy</div>
                  <h3 className="mt-2 font-display text-xl tracking-wide text-ink">{h.name}</h3>
                  <p className="mt-3 font-serif text-[0.85rem] text-ink/70 leading-relaxed flex-1">{h.desc}</p>
                  <a href={h.href} target="_blank" rel="noreferrer noopener sponsored" className="mt-4 eyebrow text-[0.65rem] tracking-[0.24em] text-gold border-b border-gold/50 pb-1 self-start hover:text-ink hover:border-ink transition-colors">
                    Book This Stay →
                  </a>
                </div>
              </article>
            ))}
          </div>
      </section>

      {/* BOTTOM CTA BAR — edge to edge */}
      <section className="mt-20 lg:mt-24">
        <h2 className={`${wrap} text-center font-display text-xl sm:text-2xl tracking-[0.2em] text-ink mb-6`}>
            BOOK YOUR PORTOFINO EXPERIENCE
          </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 w-full">
            {ctas.map(({ label, Icon, hash }) => (
              <Link
                key={label}
                to="/portofino-concierge"
                hash={hash}
                className="h-16 lg:h-20 bg-gold hover:bg-ink text-ivory transition-colors flex items-center justify-center gap-3 eyebrow text-[0.7rem] lg:text-[0.8rem] tracking-[0.22em] text-center px-4"
              >
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
      </section>

      {/* DISCLOSURE — visually secondary, well below CTAs */}
      <div className={`${wrap} mt-24 lg:mt-32 pb-16`}>
        <div className="mx-auto h-px w-16 bg-ink/15" />
        <p className="mt-8 text-center font-serif text-[11px] md:text-[12px] tracking-normal leading-relaxed text-ink/40">
          Prices and availability may change. Some links may earn a commission at no additional cost to you.
        </p>
      </div>
    </div>
  );
}