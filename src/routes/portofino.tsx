import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import portofinoImg from "@/assets/dest-portofino.jpg";
import { absoluteUrl } from "@/lib/site";
import { TierNavBar } from "@/components/TierPortofinoView";
import d1a from "@/assets/edit-d1-a.jpg";
import d1b from "@/assets/edit-d1-b.jpg";
import d1c from "@/assets/edit-d1-c.jpg";
import d2a from "@/assets/edit-d2-a.jpg";
import d3a from "@/assets/edit-d3-a.jpg";
import d4a from "@/assets/edit-d4-a.jpg";
import d5a from "@/assets/edit-d5-a.jpg";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "5 Days in Portofino — A Style & Itinerary Guide | Resort Edit" },
      { name: "description", content: "Five complete resort looks and a five-day itinerary for Portofino — yacht days, beach cabanas, sunset dinners and quiet harbor mornings." },
      { property: "og:title", content: "5 Days in Portofino — Resort Edit" },
      { property: "og:description", content: "A luxury style and travel guide to the Italian Riviera." },
      { property: "og:image", content: absoluteUrl(portofinoImg) },
      { property: "og:url", content: absoluteUrl("/portofino") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino") }],
  }),
  component: PortofinoPage,
});

function PortofinoPage() {
  const dayNav: Array<{
    slug: string;
    label: string;
    title: string;
    caption: string;
    image: string;
    previews: Array<{ n: number; title: string; caption: string; image: string }>;
  }> = [
    {
      slug: "day-1", label: "Day 1", title: "Yacht Day & Harbor Aperitivo",
      caption: "Open water, tan lines and hidden coves.", image: d1a,
      previews: [
        { n: 1, title: "Harbor Hero", caption: "Designer · yacht-day polish.", image: d1a },
        { n: 2, title: "Riviera Lunch", caption: "Mid-luxe · harborfront aperitivo.", image: d1b },
        { n: 3, title: "Riviera Daywear", caption: "Riviera finds · effortless ease.", image: d1c },
      ],
    },
    {
      slug: "day-2", label: "Day 2", title: "Beach Club Lunch",
      caption: "Slow mornings, long lunches, seaside glamour.", image: d2a,
      previews: [
        { n: 1, title: "Cabana Designer", caption: "Designer · beach club polish.", image: d2a },
        { n: 2, title: "Long Lunch Mid-Luxe", caption: "Mid-luxe · linen and gold.", image: d2a },
        { n: 3, title: "Seaside Finds", caption: "Riviera finds · easy glamour.", image: d2a },
      ],
    },
    {
      slug: "day-3", label: "Day 3", title: "Day Club & Shopping",
      caption: "Poolside ease, via Roma, Capri luxe.", image: d3a,
      previews: [
        { n: 1, title: "Via Roma Designer", caption: "Designer · boutique strolls.", image: d3a },
        { n: 2, title: "Poolside Mid-Luxe", caption: "Mid-luxe · daybed ease.", image: d3a },
        { n: 3, title: "Capri Finds", caption: "Riviera finds · sun-drenched.", image: d3a },
      ],
    },
    {
      slug: "day-4", label: "Day 4", title: "Dinner & Sunset",
      caption: "Golden hour, candlelight, harbor glow.", image: d4a,
      previews: [
        { n: 1, title: "Sunset Designer", caption: "Designer · candlelit drama.", image: d4a },
        { n: 2, title: "Harbor Mid-Luxe", caption: "Mid-luxe · golden hour.", image: d4a },
        { n: 3, title: "Evening Finds", caption: "Riviera finds · soft glow.", image: d4a },
      ],
    },
    {
      slug: "day-5", label: "Day 5", title: "Espresso & A Long Last Lunch",
      caption: "Espresso rituals and one last long lunch.", image: d5a,
      previews: [
        { n: 1, title: "Farewell Designer", caption: "Designer · final flourish.", image: d5a },
        { n: 2, title: "Café Mid-Luxe", caption: "Mid-luxe · espresso ease.", image: d5a },
        { n: 3, title: "Last Lunch Finds", caption: "Riviera finds · sun-soaked send-off.", image: d5a },
      ],
    },
  ];

  const [selectedDay, setSelectedDay] = useState<string>("day-1");
  const activeDay = dayNav.find((d) => d.slug === selectedDay) ?? dayNav[0];
  const activeDayNumber = activeDay.slug.replace("day-", "");
  const activePreviews = activeDay.previews;

  const experiences: Array<{
    name: string;
    tier: "Signature Experience" | "Elevated Find" | "Riviera Find";
    description: string;
    image: string;
    href: string;
  }> = [
    {
      name: "Private Yacht Charter — Portofino Coast",
      tier: "Signature Experience",
      description: "Your own boat, your own pace, and hidden swim coves along the promontory.",
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=80",
      href: "https://www.viator.com/Portofino/d50421",
    },
    {
      name: "Splendido Spa Afternoon",
      tier: "Signature Experience",
      description: "A signature ritual and quiet pool access at Portofino's most storied address.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80",
      href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/spa",
    },
    {
      name: "Small Group Sunset Cruise",
      tier: "Elevated Find",
      description: "Golden hour along the Ligurian coast with a glass of chilled prosecco in hand.",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1400&q=80",
      href: "https://www.getyourguide.com/portofino-l1093/sunset-cruise",
    },
    {
      name: "Ligurian Cooking Class",
      tier: "Elevated Find",
      description: "An intimate afternoon learning trofie al pesto with the day's catch.",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80",
      href: "https://www.getyourguide.com/portofino-l1093/cooking-class",
    },
    {
      name: "Cinque Terre Wine Tasting",
      tier: "Riviera Find",
      description: "Sommelier-led cellar visits along the terraced cliffs of the Ligurian coast.",
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1400&q=80",
      href: "https://www.getyourguide.com/portofino-l1093/cinque-terre-wine",
    },
    {
      name: "San Fruttuoso Abbey by Sea",
      tier: "Riviera Find",
      description: "A quiet crossing to a 10th-century abbey reachable only by water.",
      image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1400&q=80",
      href: "https://www.viator.com/Portofino/d50421/san-fruttuoso",
    },
  ];

  return (
    <div>
      {/* HERO — Editorial full-bleed */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="Portofino harbor — editorial hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-12 md:pb-16 text-ivory">
          <span className="eyebrow text-ivory/80 tracking-[0.4em]">The Resort Edit · Portofino</span>
          <h1 className="font-display text-5xl md:text-7xl mt-5 tracking-[0.05em] leading-[1]">
            5 Days in Portofino
          </h1>
          <p className="font-serif italic text-base md:text-xl text-ivory/85 mt-4 max-w-2xl leading-relaxed">
            Curated destination dressing for the Italian Riviera.
          </p>
        </div>
      </section>

      {/* FIVE DAYS, THREE WAYS + Day nav + Day 1 preview */}
      <section className="bg-ivory pt-12 md:pt-14 pb-14 md:pb-16">
        <div className="mx-auto max-w-3xl px-6 text-center mb-8 md:mb-10">
          <span className="eyebrow text-gold">The Wardrobe</span>
          <h2 className="font-display text-3xl md:text-5xl mt-3 tracking-[0.05em]">
            Five Days, Three Ways
          </h2>
          <div className="mx-auto my-4 h-px w-12 bg-gold" />
          <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed">
            Three shoppable looks per day: Designer / Mid-Luxe / Riviera Finds.
          </p>
        </div>

        {/* Horizontal day pill navigation */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {dayNav.map((d) => (
              <button
                key={d.slug}
                type="button"
                role="tab"
                aria-selected={selectedDay === d.slug}
                onClick={() => setSelectedDay(d.slug)}
                title={d.title}
                className={
                  selectedDay === d.slug
                    ? "eyebrow tracking-[0.3em] text-[0.65rem] px-5 py-3 border bg-gold/90 border-gold text-ink font-semibold transition-colors"
                    : "eyebrow tracking-[0.3em] text-[0.65rem] px-5 py-3 border border-border bg-transparent text-ink hover:bg-gold/20 transition-colors"
                }
              >
                {d.label.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-center font-serif italic text-ink/65 text-sm mt-5">
            Showing {activeDay.label} · {activeDay.title} — {activeDay.caption.replace(/\.$/, "")}.
          </p>
        </div>

        {/* Featured Preview Strip — Active day looks */}
        <div className="mx-auto max-w-6xl px-6 mt-10 md:mt-12">
          <div className="hidden md:grid grid-cols-3 gap-5">
            {activePreviews.map((p) => (
              <Link
                key={p.n}
                to="/portofino/day-{$day}"
                params={{ day: activeDayNumber }}
                className="group block bg-ivory border border-border/60 hover:border-gold transition-colors"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img src={p.image} alt={`${activeDay.label} Look ${p.n} — ${p.title}`} loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
                    LOOK {p.n}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl tracking-wide leading-snug">{p.title}</h3>
                  <p className="font-serif italic text-ink/65 text-sm mt-1.5 leading-relaxed">{p.caption}</p>
                  <span className="mt-3 inline-block eyebrow text-[0.6rem] tracking-[0.35em] text-ink group-hover:text-gold transition-colors">
                    View Look →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {/* Mobile horizontal scroll */}
          <div className="md:hidden -mx-6 px-6 overflow-x-auto">
            <div className="flex gap-4 snap-x snap-mandatory">
              {activePreviews.map((p) => (
                <Link
                  key={p.n}
                  to="/portofino/day-{$day}"
                  params={{ day: activeDayNumber }}
                  className="snap-start shrink-0 w-[78%] bg-ivory border border-border/60"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <img src={p.image} alt={`${activeDay.label} Look ${p.n}`} loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
                      LOOK {p.n}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg tracking-wide">{p.title}</h3>
                    <p className="font-serif italic text-ink/65 text-sm mt-1.5">{p.caption}</p>
                    <span className="mt-3 inline-block eyebrow text-[0.6rem] tracking-[0.35em] text-ink">View Look →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY PRICE TIER */}
      <section className="bg-cream py-20 md:py-24 border-y border-border/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="eyebrow text-gold">Shop By Price Point</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            Choose Your Tier
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Same aesthetic. Different investment. Pick a tier to load matching products, shoppable links, and pricing.
          </p>
          <div className="mt-10">
            <TierNavBar />
          </div>
          <Link
            to="/portofino-edit"
            className="mt-8 inline-block eyebrow text-[0.65rem] tracking-[0.3em] text-ink/65 border-b border-ink/30 hover:text-gold hover:border-gold transition-colors pb-1"
          >
            Or view the full side-by-side edit →
          </Link>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center mb-16">
          <span className="eyebrow text-gold">The Experiences</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            Bookable Moments
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Six concierge-curated experiences along the Ligurian coast.
          </p>
        </div>
        {/* Desktop / tablet: 3 cols × 2 rows, 32px gap */}
        <div className="mx-auto max-w-6xl px-6 hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp) => (
            <a
              key={exp.name}
              href={exp.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group block bg-cream border-2 border-ink/15 hover:border-gold hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)] transition-all duration-300"
            >
              <div className="aspect-[3/5] overflow-hidden bg-muted">
                <img
                  src={exp.image}
                  alt={exp.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span className="eyebrow text-gold text-[9px] tracking-[0.3em]">{exp.tier}</span>
                <h4 className="font-display text-xl tracking-wide mt-2 leading-snug">
                  {exp.name}
                </h4>
                <p className="font-serif italic text-ink/65 text-[14px] mt-2 leading-snug">
                  {exp.description}
                </p>
                <span className="mt-4 inline-block eyebrow text-[11px] tracking-[0.28em] text-ink border-b border-gold/70 pb-1 group-hover:text-gold transition-colors">
                  Book This Experience →
                </span>
              </div>
            </a>
          ))}
        </div>
        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden -mx-0 px-6 overflow-x-auto">
          <div className="flex gap-5 snap-x snap-mandatory">
            {experiences.map((exp) => (
              <a
                key={exp.name}
                href={exp.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="snap-start shrink-0 w-[82%] bg-cream border-2 border-ink/15"
              >
                <div className="aspect-[3/5] overflow-hidden bg-muted">
                  <img src={exp.image} alt={exp.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <span className="eyebrow text-gold text-[9px] tracking-[0.3em]">{exp.tier}</span>
                  <h4 className="font-display text-lg tracking-wide mt-2 leading-snug">{exp.name}</h4>
                  <p className="font-serif italic text-ink/65 text-[14px] mt-2 leading-snug">{exp.description}</p>
                  <span className="mt-4 inline-block eyebrow text-[11px] tracking-[0.28em] text-ink border-b border-gold/70 pb-1">
                    Book This Experience →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HOTELS */}
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center mb-16">
          <span className="eyebrow text-gold">Where To Stay</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            The Hotels
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Three addresses on the promontory — each one a different way to wake up in Portofino.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Belmond Hotel Splendido",
              tier: "Iconic",
              note: "Pastel-pink cliffside legend with the most photographed pool in the Riviera.",
              href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
            },
            {
              name: "Splendido Mare, A Belmond Hotel",
              tier: "Harborfront",
              note: "Right on the piazzetta — wake to the boats, dine on the waterfront.",
              href: "https://www.belmond.com/hotels/europe/italy/portofino/splendido-mare/",
            },
            {
              name: "Eight Hotel Portofino",
              tier: "Boutique",
              note: "Quietly elegant, walkable to everything, a more intimate alternative.",
              href: "https://www.eighthotelportofino.com/",
            },
          ].map((h) => (
            <a
              key={h.name}
              href={h.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group block bg-ivory border border-border/60 hover:border-gold transition-colors p-7"
            >
              <span className="eyebrow text-gold text-[10px]">{h.tier}</span>
              <h3 className="font-display text-2xl tracking-wide mt-3 leading-snug">{h.name}</h3>
              <p className="font-serif italic text-ink/70 mt-4 leading-relaxed">{h.note}</p>
              <span className="mt-6 inline-block eyebrow text-[10px] text-ink group-hover:text-gold transition-colors">
                Reserve →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span className="eyebrow text-gold">The Newsletter</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            New Edits, Quietly Delivered
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Resort edits, packing lists, and destination notes — sent only when there's something worth wearing.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 bg-ivory border border-border/60 px-5 py-4 font-serif italic text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="eyebrow text-ivory bg-ink px-7 py-4 hover:bg-gold transition-colors cursor-pointer"
            >
              Subscribe →
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

