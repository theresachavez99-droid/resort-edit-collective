import { createFileRoute, Link } from "@tanstack/react-router";
import { Ship, Umbrella, Camera, Compass } from "lucide-react";
import heroMuseAsset from "@/assets/hero-muse-portofino-majolica.png.asset.json";
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

const heroMuse = heroMuseAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resort Edit | Dressed for the destination — 5 Days in Portofino, La Dolce Vita" },
      { name: "description", content: "A luxury style and itinerary guide to Portofino — five days, fifteen looks, hotels, beach clubs, and experiences." },
      { property: "og:title", content: "Resort Edit | Dressed for the destination — 5 Days in Portofino" },
      { property: "og:description", content: "Five days, fifteen looks in Portofino — hotels, beach clubs, and experiences. Dressed for the destination." },
      { property: "og:image", content: absoluteUrl(heroMuse) },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:image", content: absoluteUrl(heroMuse) },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

type DayCard = {
  n: "1" | "2" | "3" | "4" | "5";
  href:
    | "/portofino/day-1"
    | "/portofino/day-2"
    | "/portofino/day-3"
    | "/portofino/day-4"
    | "/portofino/day-5";
  title: string;
  desc: string;
  image: string;
  imageMobile?: string;
  imageRetina?: string;
};

const days: DayCard[] = [
  { n: "1", href: "/portofino/day-1", title: "Yacht Day & Harbour Aperitivo", desc: "Open water, tan lines & hidden coves.", image: lookYacht },
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
  {
    name: "Splendido, A Belmond Hotel",
    image: hotelSplendido,
    vibe: "ICONIC · CLIFFTOP VIEWS",
    desc: "A cliffside grande dame above the harbor. Timeless Italian glamour, bougainvillea terraces, and the most storied view on the Riviera.",
    signals: ["The Resort Edit top pick", "Harbour-facing rooms only", "Private pool terrace & cabanas"],
    note: "Where to stay if this trip is the trip.",
    href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
  },
  {
    name: "Eight Hotel Portofino",
    image: hotelEight,
    vibe: "PIAZZETTA · LOCAL ENERGY",
    desc: "Quietly chic and steps from the piazzetta. A modern Italian retreat for travelers who want to live like a local in the heart of town.",
    signals: ["Steps from the piazzetta", "Boutique, under 20 rooms", "Concierge who books the impossible"],
    note: "For the trip you'll want to repeat next summer.",
    href: "https://www.eighthotels.com/en/eight-hotel-portofino/",
  },
  {
    name: "Hotel Piccolo Portofino",
    image: hotelPiccolo,
    vibe: "HIDDEN · PRIVATE COVE",
    desc: "An intimate seaside hideaway tucked into a private cove. Sun-bleached terraces, turquoise water, and the kind of service that anticipates everything.",
    signals: ["Private sea-access terrace", "Quiet side of the harbor", "Sea-view suites only"],
    note: "For the traveler who wants the harbor without the crowd.",
    href: "https://www.hotelpiccoloportofino.com/",
  },
];

const ctas = [
  { label: "Book a Yacht", Icon: Ship, hash: "on-water" },
  { label: "Reserve a Beach Club", Icon: Umbrella, hash: "beachclubs" },
  { label: "Book a Tour", Icon: Camera, hash: "experiences" },
  { label: "View Experiences", Icon: Compass, hash: "experiences" },
];

const brandChips = ["Zimmermann", "Johanna Ortiz", "SIR", "Faithfull the Brand"];

function Index() {
  const wrap = "px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24";
  return (
    <div className="bg-ivory w-full">
      {/* HERO — balanced 50/50 split */}
      <section className={`${wrap} pt-6 lg:pt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center`}>
          <div className="relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={heroMuse}
              alt="Resort Edit muse in a blue and gold majolica print set by a Portofino harbour pool"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "center 28%" }}
            />
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
            <p className="font-serif text-lg lg:text-[1.2rem] text-ink/80 leading-[1.7] max-w-2xl">
              Curated across Zimmermann, Johanna Ortiz, SIR — and labels you haven't discovered yet.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {brandChips.map((b) => (
                <Link
                  key={b}
                  to="/brands"
                  className="eyebrow text-[0.66rem] tracking-[0.26em] text-ink/75 border border-ink/25 rounded-full px-3.5 py-1.5 hover:border-gold hover:text-gold transition-colors"
                >
                  {b}
                </Link>
              ))}
              <Link
                to="/brands"
                className="eyebrow text-[0.66rem] tracking-[0.26em] text-gold border border-gold/40 rounded-full px-3.5 py-1.5 hover:bg-gold hover:text-ivory transition-colors"
              >
                More →
              </Link>
            </div>
            <p className="mt-5 font-serif italic text-[1.05rem] lg:text-[1.15rem] text-ink/75 leading-snug max-w-[85%]">
              Curated looks, hotels and experiences — for women who dress for the destination.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/portofino" className="bg-gold text-ivory eyebrow text-[0.82rem] tracking-[0.28em] px-12 py-[22px] hover:bg-ink transition-colors">
                Shop 15 Looks — Day by Day
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-ink/80">
              <span className="eyebrow text-[0.92rem] tracking-[0.26em]">
                5 Days <span className="text-gold">·</span> 15 Looks <span className="text-gold">·</span> 6 Experiences
              </span>
              <span className="hidden md:inline h-4 w-px bg-ink/25" aria-hidden />
              <span className="eyebrow text-[0.82rem] tracking-[0.3em] text-gold">
                ★ The Edit We Keep Coming Back To
              </span>
            </div>
          </div>
      </section>

      {/* 5-DAY CARDS */}
      <section className={`${wrap} mt-16 lg:mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5`}>
          {days.map((d) => (
            <Link
              key={d.n}
              to={d.href}
              data-route-card={d.n === "1" ? d.href : undefined}
              className="group bg-card border border-border/50 flex flex-col no-underline text-inherit"
            >
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
                  data-route-image={d.n === "1" ? d.href : undefined}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: d.n === "5" ? "center center" : "center top", imageRendering: "auto" }}
                />
              </div>
              <div className="px-4 pt-5 text-center flex-1 flex flex-col">
                <p className="font-serif italic text-[0.96rem] text-ink/70 leading-relaxed flex-1">{d.desc}</p>
              </div>
              <span
                data-route-cta={d.n === "1" ? d.href : undefined}
                className="mt-5 block bg-gold text-ivory text-center eyebrow text-[0.7rem] tracking-[0.24em] py-4 group-hover:bg-ink transition-colors"
              >
                Shop 3 Looks <span data-route-arrow={d.n === "1" ? d.href : undefined}>→</span>
              </span>
            </Link>
          ))}
      </section>

      {/* SHOP THE LOOKS + TIP */}
      <section className={`${wrap} mt-24 lg:mt-32`}>
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
                  Get the Look →
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
              </div>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={stillLife} alt="Portofino still life" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </aside>
          </div>
      </section>

      {/* WHERE TO STAY */}
      <section className={`${wrap} mt-24 lg:mt-32`}>
          <div className="flex items-center gap-4 justify-center mb-10">
            <div className="h-px w-16 bg-gold/50" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">WHERE TO STAY</h2>
            <div className="h-px w-16 bg-gold/50" />
          </div>

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
                  <div className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">PORTOFINO, ITALY</div>
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
          <div className="flex items-center gap-4 justify-center">
            <div className="h-px w-16 bg-gold/50" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink text-center">BOOK YOUR PORTOFINO EXPERIENCE</h2>
            <div className="h-px w-16 bg-gold/50" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 w-full">
          {ctas.map(({ label, Icon, hash }) => (
            <Link
              key={label}
              to="/destinations/$slug"
              params={{ slug: "portofino" }}
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