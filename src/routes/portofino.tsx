import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Palmtree, Anchor, Umbrella, Camera, Compass } from "lucide-react";
import heroImg from "@/assets/dest-portofino.jpg";
import yachtImg from "@/assets/look-yacht.jpg";
import beachImg from "@/assets/look-beach.jpg";
import dayclubImg from "@/assets/look-dayclub.jpg";
import dinnerImg from "@/assets/look-dinner.jpg";
import townImg from "@/assets/look-town.jpg";
import lookAImg from "@/assets/edit-d2-a.jpg";
import lookBImg from "@/assets/edit-d4-a.jpg";
import lookCImg from "@/assets/edit-d1-a.jpg";
import tipImg from "@/assets/portofino-stilllife.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "5 Days in Portofino — A Style & Itinerary Guide | Resort Edit" },
      { name: "description", content: "Five complete resort looks and a five-day itinerary for Portofino — yacht days, beach cabanas, sunset dinners and quiet harbor mornings." },
      { property: "og:title", content: "5 Days in Portofino — Resort Edit" },
      { property: "og:description", content: "A luxury style and travel guide to the Italian Riviera." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: PortofinoPage,
});

const DAYS = [
  { n: "DAY 1", title: "YACHT DAY &\nHARBOUR APERITIVO", img: yachtImg, caption: "Open water, hidden coves, and a night in Portofino." },
  { n: "DAY 2", title: "BEACH CLUB &\nLONG LUNCHES", img: beachImg, caption: "Slow mornings, seafood lunches, seaside glamour." },
  { n: "DAY 3", title: "POOL CLUB &\nSHOPPING", img: dayclubImg, caption: "Poolside ease, Via Roma, Campagn luxe." },
  { n: "DAY 4", title: "SUNSET COCKTAILS\n& DINNER WITH A VIEW", img: dinnerImg, caption: "Golden hour, candlelight, harbor glow." },
  { n: "DAY 5", title: "MARKET STROLLS &\nCOASTAL GOODBYES", img: townImg, caption: "Quiet rituals and a long last lunch." },
];

const LOOKS = [
  { tag: "LOOK A", title: "LEMON PRINT SET", img: lookAImg },
  { tag: "LOOK B", title: "LACE CHIC", img: lookBImg },
  { tag: "LOOK C", title: "BLUE MAJOLICA SET", img: lookCImg },
];

const HOTELS = [
  {
    name: "Splendido, A Belmond Hotel",
    img: hotelSplendido,
    text: "A cliffside grande dame above the harbor. Timeless Italian glamour, bougainvillea terraces, and the most storied views on the Riviera.",
  },
  {
    name: "Eight Hotel Portofino",
    img: hotelEight,
    text: "Quietly chic and steps from the piazzetta. A modern Italian retreat for travelers who want to live like a local in the heart of town.",
  },
  {
    name: "Hotel Piccolo Portofino",
    img: hotelPiccolo,
    text: "An intimate seaside hideaway tucked into a private cove. Sun-bleached terraces, turquoise water, and the kind of service that anticipates everything.",
  },
];

const BOOKINGS = [
  { icon: Anchor, label: "BOOK A YACHT" },
  { icon: Umbrella, label: "RESERVE A BEACH CLUB" },
  { icon: Camera, label: "BOOK A TOUR" },
  { icon: Compass, label: "VIEW EXPERIENCES" },
];

function SectionRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-6 justify-center mb-10">
      <span className="h-px flex-1 max-w-[18rem] bg-gold/50" />
      <h2 className="font-display text-2xl md:text-3xl tracking-[0.18em] uppercase text-ink whitespace-nowrap">
        {children}
      </h2>
      <span className="h-px flex-1 max-w-[18rem] bg-gold/50" />
    </div>
  );
}

function PortofinoPage() {
  return (
    <div className="bg-ivory min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-6 md:pt-10 pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={heroImg} alt="Portofino harbor in Mediterranean style" className="w-full h-full object-cover" />
          </div>
          <div className="md:pl-4">
            <p className="eyebrow text-gold mb-6">A Style &amp; Itinerary Guide</p>
            <h1 className="font-display text-ink leading-[0.95] tracking-tight">
              <span className="block text-4xl md:text-5xl">5 DAYS IN</span>
              <span className="block text-6xl md:text-[5.5rem] mt-1">PORTOFINO</span>
            </h1>
            <p className="font-script text-gold text-5xl md:text-[4.25rem] leading-none mt-2 mb-8">La Dolce Vita</p>
            <p className="eyebrow text-ink text-[0.85rem] tracking-[0.22em] mb-5 max-w-md">
              Luxury Labels. Riviera Finds. Resort Style Across Price Points.
            </p>
            <p className="font-serif text-ink/80 text-lg leading-relaxed max-w-md mb-6">
              Curated from international resort favorites, quiet luxury labels, and vacation brands we love.
            </p>
            <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ink/60">
              Zimmermann · Johanna Ortiz · Sir · Faithfull the Brand · More
            </p>
          </div>
        </div>
      </section>

      {/* FIVE-DAY CARD ROW */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
          {DAYS.map((d) => (
            <article key={d.n} className="bg-ivory border border-gold/25 p-4 flex flex-col">
              <p className="eyebrow text-gold text-center mb-2">{d.n}</p>
              <h3 className="font-display text-ink text-[0.85rem] md:text-[0.95rem] tracking-[0.14em] uppercase text-center leading-snug whitespace-pre-line mb-4 min-h-[3.5rem]">
                {d.title}
              </h3>
              <div className="aspect-[3/4] overflow-hidden mb-4">
                <img src={d.img} alt={d.title} className="w-full h-full object-cover" />
              </div>
              <p className="font-serif italic text-ink/75 text-sm text-center leading-snug mb-4 flex-1">
                {d.caption}
              </p>
              <a href="#looks" className="eyebrow text-gold text-center hover:text-ink transition-colors">
                Explore the Look →
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* SHOP THE LOOKS + TIP */}
      <section id="looks" className="mx-auto max-w-7xl px-5 md:px-8 pb-16">
        <SectionRule>Shop the Looks</SectionRule>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {LOOKS.map((l) => (
            <article key={l.tag} className="bg-ivory border border-gold/25 p-5 flex flex-col">
              <p className="eyebrow text-ink/70 text-center mb-1">{l.tag}</p>
              <h3 className="font-display tracking-[0.18em] text-ink text-sm uppercase text-center mb-5">
                {l.title}
              </h3>
              <div className="aspect-[3/4] overflow-hidden mb-5 bg-parchment">
                <img src={l.img} alt={l.title} className="w-full h-full object-cover" />
              </div>
              <a href="#" className="eyebrow text-gold text-center mt-auto hover:text-ink transition-colors">
                Shop the Look →
              </a>
            </article>
          ))}

          {/* Resort Edit Tip */}
          <aside className="flex flex-col gap-5">
            <div className="bg-cream border border-gold/30 p-6 flex flex-col">
              <Palmtree className="w-8 h-8 text-gold mb-3" strokeWidth={1.25} />
              <p className="eyebrow text-gold mb-2">Resort Edit Tip</p>
              <p className="font-serif text-ink text-lg leading-snug mb-5">
                Book a cabana.<br />
                Sip limoncello.<br />
                Stay until sunset.
              </p>
              <Link
                to="/portofino"
                className="block text-center bg-gold text-ivory eyebrow tracking-[0.22em] py-3 px-4 hover:bg-ink transition-colors"
              >
                Explore Portofino
              </Link>
            </div>
            <div className="aspect-[4/3] overflow-hidden border border-gold/20">
              <img src={tipImg} alt="Portofino harbor still life" className="w-full h-full object-cover" />
            </div>
          </aside>
        </div>
      </section>

      {/* WHERE TO STAY */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-16">
        <SectionRule>Where to Stay</SectionRule>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HOTELS.map((h) => (
            <article key={h.name} className="bg-ivory border border-gold/25 grid grid-cols-[2fr_3fr] overflow-hidden">
              <div className="overflow-hidden">
                <img src={h.img} alt={h.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex flex-col">
                <p className="eyebrow text-gold mb-2">Portofino, Italy</p>
                <h3 className="font-display text-ink text-xl leading-tight mb-3">{h.name}</h3>
                <p className="font-serif text-ink/75 text-[0.92rem] leading-snug mb-4 flex-1">{h.text}</p>
                <a href="#" className="eyebrow text-gold hover:text-ink transition-colors">
                  Book This Stay →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BOOKING CTA STRIP */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-16">
        <h2 className="font-display text-ink text-center text-2xl md:text-3xl tracking-[0.18em] uppercase mb-6">
          Book Your Portofino Experience
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BOOKINGS.map((b) => (
            <a
              key={b.label}
              href="#"
              className="flex items-center justify-center gap-3 bg-gold text-ivory eyebrow tracking-[0.22em] py-5 hover:bg-ink transition-colors"
            >
              <b.icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{b.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="border-t border-gold/30 bg-ivory">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[0.7rem] tracking-[0.2em] uppercase text-ink/65">
          <span>© {new Date().getFullYear()} Resort Edit</span>
          <span>Curated Escapes. Styled Your Way.</span>
          <span className="normal-case tracking-normal font-serif italic text-ink/60 text-[0.78rem] text-center md:text-right max-w-md">
            Prices are subject to change. Links may earn a small commission at no extra cost to you.
          </span>
        </div>
      </footer>
    </div>
  );
}
