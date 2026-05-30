import { createFileRoute, Link } from "@tanstack/react-router";
import { Ship, Umbrella, Camera, Compass } from "lucide-react";
import heroMuse from "@/assets/hero-muse-portofino.jpg";
import stillLife from "@/assets/portofino-stilllife.jpg";
import lookYacht from "@/assets/look-yacht.jpg";
import lookBeach from "@/assets/look-beach.jpg";
import lookDayclub from "@/assets/look-dayclub.jpg";
import lookDinner from "@/assets/look-dinner.jpg";
import lookTown from "@/assets/look-town.jpg";
import editD2a from "@/assets/edit-d2-a.jpg";
import editD2b from "@/assets/edit-d2-b.jpg";
import editD1a from "@/assets/edit-d1-a.jpg";
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

const days = [
  { n: 1, title: "Yacht Day & Harbour Aperitivo", desc: "Open water, hidden coves, and a night in Portofino.", image: lookYacht, pos: "50% 18%" },
  { n: 2, title: "Beach Club & Long Lunches", desc: "Slow mornings, seafood lunches, seaside glamour.", image: lookBeach, pos: "50% 12%" },
  { n: 3, title: "Pool Lounging & Shopping", desc: "Poolside ease, via Roma, Capresi luxe.", image: lookDayclub, pos: "50% 15%" },
  { n: 4, title: "Sunset Cocktails & Dinner With a View", desc: "Golden hour, candlelight, harbor glow.", image: lookDinner, pos: "50% 22%" },
  { n: 5, title: "Market Strolls & Coastal Goodbyes", desc: "Quiet rituals and a long last lunch.", image: lookTown, pos: "50% 20%" },
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
  { label: "Book a Yacht", Icon: Ship },
  { label: "Reserve a Beach Club", Icon: Umbrella },
  { label: "Book a Tour", Icon: Camera },
  { label: "View Experiences", Icon: Compass },
];

function Index() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10 pb-16">
        {/* HERO — split screen */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-muted">
            <img src={heroMuse} alt="Portofino editorial muse" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="lg:pt-10 lg:pl-2">
            <p className="eyebrow text-gold text-[0.7rem] tracking-[0.3em]">A Style &amp; Itinerary Guide</p>
            <h1 className="font-display mt-6 text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] leading-[0.95] tracking-[0.01em] text-ink">
              5 DAYS IN
              <br />
              PORTOFINO
            </h1>
            <p className="mt-5 font-serif italic text-gold text-3xl sm:text-4xl lg:text-5xl leading-tight">
              La Dolce Vita
            </p>
            <div className="my-8 h-px w-20 bg-gold/70" />
            <p className="eyebrow text-ink text-[0.85rem] tracking-[0.22em] leading-relaxed">
              Luxury labels. Riviera finds.<br />Resort style across price points.
            </p>
            <p className="mt-6 font-serif text-base lg:text-lg text-ink/70 leading-relaxed max-w-lg">
              Curated from international resort favorites, quiet luxury labels, and vacation brands we love.
            </p>
            <p className="mt-8 eyebrow text-[0.65rem] tracking-[0.28em] text-ink/65">
              Zimmermann <span className="text-gold">·</span> Johanna Ortiz <span className="text-gold">·</span> SIR <span className="text-gold">·</span> Faithfull the Brand <span className="text-gold">·</span> <Link to="/brands" className="hover:text-gold">More</Link>
            </p>
            <div className="mt-10 flex flex-wrap gap-5">
              <Link to="/portofino" className="bg-ink text-ivory eyebrow text-[0.7rem] tracking-[0.28em] px-7 py-4 hover:bg-gold transition-colors">
                Explore the Edit →
              </Link>
              <Link to="/portofino-edit" className="eyebrow text-[0.7rem] tracking-[0.28em] text-ink border-b border-ink/40 hover:border-gold hover:text-gold pb-1">
                Shop by Price Point
              </Link>
            </div>
          </div>
        </section>

        {/* 5-DAY CARDS */}
        <section className="mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {days.map((d) => (
            <article key={d.n} className="bg-card border border-border/50 flex flex-col">
              <div className="text-center pt-5 px-3">
                <div className="eyebrow text-[0.62rem] tracking-[0.28em] text-gold">Day {d.n}</div>
                <h3 className="mt-3 eyebrow text-[0.72rem] tracking-[0.2em] leading-snug text-ink min-h-[2.5rem]">
                  {d.title}
                </h3>
              </div>
              <div className="relative aspect-[4/5] mt-4 overflow-hidden bg-muted">
                <img src={d.image} alt={d.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: d.pos }} />
              </div>
              <div className="px-4 pt-5 pb-5 text-center flex-1 flex flex-col">
                <p className="font-serif italic text-[0.9rem] text-ink/70 leading-relaxed flex-1">{d.desc}</p>
                <Link to="/portofino" className="mt-5 eyebrow text-[0.65rem] tracking-[0.24em] text-gold border-b border-gold/50 pb-1 self-center hover:text-ink hover:border-ink transition-colors">
                  Explore the Look →
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* SHOP THE LOOKS + TIP */}
        <section className="mt-20 lg:mt-28">
          <div className="flex items-center gap-4 justify-center mb-10">
            <div className="h-px w-16 bg-gold/50" />
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink">SHOP THE LOOKS</h2>
            <div className="h-px w-16 bg-gold/50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-6">
            {looks.map((l) => (
              <article key={l.title} className="bg-card border border-border/50 flex flex-col">
                <div className="text-center pt-5 px-3">
                  <div className="eyebrow text-[0.62rem] tracking-[0.28em] text-gold">{l.tag}</div>
                  <h3 className="mt-3 eyebrow text-[0.78rem] tracking-[0.2em] text-ink">{l.title}</h3>
                </div>
                <div className="relative aspect-[4/5] mt-4 overflow-hidden bg-muted">
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
                <Link to="/portofino" className="mt-6 inline-block text-center bg-gold text-ivory eyebrow text-[0.65rem] tracking-[0.24em] py-3 px-4 hover:bg-ink transition-colors">
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
        <section className="mt-20 lg:mt-28">
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

        {/* BOTTOM CTA BAR */}
        <section className="mt-20 lg:mt-24">
          <h2 className="text-center font-display text-xl sm:text-2xl tracking-[0.2em] text-ink mb-6">
            BOOK YOUR PORTOFINO EXPERIENCE
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
            {ctas.map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                className="h-16 lg:h-20 bg-gold hover:bg-ink text-ivory transition-colors flex items-center justify-center gap-3 eyebrow text-[0.7rem] lg:text-[0.8rem] tracking-[0.22em] text-center px-4"
              >
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center eyebrow text-[0.55rem] tracking-[0.24em] text-ink/50">
          Prices are subject to change. Links may earn a small commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}