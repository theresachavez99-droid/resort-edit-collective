import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import portofinoImg from "@/assets/dest-portofino.jpg";
import { absoluteUrl } from "@/lib/site";
import d1a from "@/assets/edit-d1-a.jpg";
import d1b from "@/assets/edit-d1-b.jpg";
import d1c from "@/assets/edit-d1-c.jpg";
import d2a from "@/assets/edit-d2-a.jpg";
import d2b from "@/assets/edit-d2-b.jpg";
import d2c from "@/assets/edit-d2-c.jpg";
import d3a from "@/assets/edit-d3-a.jpg";
import d3b from "@/assets/edit-d3-b.jpg";
import d3c from "@/assets/edit-d3-c.jpg";
import d4a from "@/assets/edit-d4-a.jpg";
import d4b from "@/assets/edit-d4-b.jpg";
import d4c from "@/assets/edit-d4-c.jpg";
import d5a from "@/assets/edit-d5-a.jpg";
import d5b from "@/assets/edit-d5-b.jpg";
import d5c from "@/assets/edit-d5-c.jpg";
import expYacht from "@/assets/exp-yacht-charter.jpg";
import expHarbor from "@/assets/exp-harbor-golden.jpg";
import expCruise from "@/assets/exp-sunset-cruise.jpg";
import expCooking from "@/assets/exp-cooking-class.jpg";
import expWine from "@/assets/exp-wine-tasting.jpg";
import expAbbey from "@/assets/exp-san-fruttuoso.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelSplendidoMare from "@/assets/hotel-splendido-mare.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import { DAY_PATHS, type DaySlug } from "@/components/PortofinoDayPage";
import {
  TIER_LABEL,
  TIER_RANGE,
  TIER_TAGLINE,
  TIER_SLUGS,
  isTierSlug,
  persistTier,
  readStoredTier,
  type TierSlug,
  type LookSlug,
} from "@/lib/portofino-spec";

export const Route = createFileRoute("/portofino")({
  validateSearch: (search: Record<string, unknown>) => {
    const tier: TierSlug = isTierSlug(search.tier) ? search.tier : "luxury";
    return { tier };
  },
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

type LookCard = { slug: LookSlug; label: string; title: string; image: string };
type DayRow = {
  slug: DaySlug;
  href: (typeof DAY_PATHS)[DaySlug];
  label: string;
  title: string;
  caption: string;
  image: string;
  looks: LookCard[];
};

const DAYS: DayRow[] = [
  {
    slug: "day-1", href: DAY_PATHS["day-1"], label: "Day 1",
    title: "Yacht Day & Harbour Aperitivo",
    caption: "Open water, tan lines, and hidden coves.",
    image: d1a,
    looks: [
      { slug: "look-a", label: "Look A", title: "Mediterranean Glam", image: d1a },
      { slug: "look-b", label: "Look B", title: "Riviera Chic", image: d1b },
      { slug: "look-c", label: "Look C", title: "Coastal Sophistication", image: d1c },
    ],
  },
  {
    slug: "day-2", href: DAY_PATHS["day-2"], label: "Day 2",
    title: "Beach Club & Long Lunches",
    caption: "Slow mornings, long lunches, seaside glamour.",
    image: d2a,
    looks: [
      { slug: "look-a", label: "Look A", title: "Lemon Print Cabana", image: d2a },
      { slug: "look-b", label: "Look B", title: "Coastal Minimalist", image: d2b },
      { slug: "look-c", label: "Look C", title: "Coral Coast", image: d2c },
    ],
  },
  {
    slug: "day-3", href: DAY_PATHS["day-3"], label: "Day 3",
    title: "Pool Lounging & Shopping",
    caption: "Poolside ease, via Roma, Capri luxe.",
    image: d3a,
    looks: [
      { slug: "look-a", label: "Look A", title: "Printed Set", image: d3a },
      { slug: "look-b", label: "Look B", title: "White Linen Ease", image: d3b },
      { slug: "look-c", label: "Look C", title: "Sage Escape", image: d3c },
    ],
  },
  {
    slug: "day-4", href: DAY_PATHS["day-4"], label: "Day 4",
    title: "Sunset Cocktails & Dinner With A View",
    caption: "Golden hour, candlelight, harbor glow.",
    image: d4a,
    looks: [
      { slug: "look-a", label: "Look A", title: "Sunset Print Dress", image: d4a },
      { slug: "look-b", label: "Look B", title: "Champagne Satin", image: d4b },
      { slug: "look-c", label: "Look C", title: "Terracotta Elegance", image: d4c },
    ],
  },
  {
    slug: "day-5", href: DAY_PATHS["day-5"], label: "Day 5",
    title: "Market Strolls & Coastal Goodbyes",
    caption: "Espresso rituals and one last long lunch.",
    image: d5a,
    looks: [
      { slug: "look-a", label: "Look A", title: "Coastal Chic", image: d5a },
      { slug: "look-b", label: "Look B", title: "Olive Safari", image: d5b },
      { slug: "look-c", label: "Look C", title: "Soft Neutrals", image: d5c },
    ],
  },
];

function PortofinoPage() {
  const search = Route.useSearch();
  const tier: TierSlug = isTierSlug(search.tier) ? search.tier : "luxury";
  const navigate = useNavigate({ from: "/portofino" });

  // Restore persisted tier on first mount if URL doesn't already specify one.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasTierParam = new URLSearchParams(window.location.search).has("tier");
    if (hasTierParam) {
      persistTier(tier);
      return;
    }
    const stored = readStoredTier();
    if (stored && stored !== tier) {
      navigate({ search: { tier: stored }, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    persistTier(tier);
  }, [tier]);

  const setTier = (t: TierSlug) =>
    navigate({ search: { tier: t }, replace: true });

  const experiences: Array<{
    name: string;
    tier: "Signature Experience" | "Elevated Find" | "Riviera Find";
    description: string;
    image: string;
    href: string;
  }> = [
    { name: "Private Yacht Charter — Portofino Coast", tier: "Signature Experience", description: "Your own boat, your own pace, and hidden swim coves along the promontory.", image: expYacht, href: "https://www.viator.com/Portofino/d50421" },
    { name: "Portofino Harbor at Golden Hour", tier: "Signature Experience", description: "Private aperitivo on the piazzetta as the pastel facades catch the last light.", image: expHarbor, href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/spa" },
    { name: "Small Group Sunset Cruise", tier: "Elevated Find", description: "Golden hour along the Ligurian coast with a glass of chilled prosecco in hand.", image: expCruise, href: "https://www.getyourguide.com/portofino-l1093/sunset-cruise" },
    { name: "Ligurian Cooking Class", tier: "Elevated Find", description: "Hands kneading fresh pasta at a long table above the Ligurian coast.", image: expCooking, href: "https://www.getyourguide.com/portofino-l1093/cooking-class" },
    { name: "Cinque Terre Wine Tasting", tier: "Riviera Find", description: "Terraced vineyards above the sea — sommelier-led pours of coastal whites.", image: expWine, href: "https://www.getyourguide.com/portofino-l1093/cinque-terre-wine" },
    { name: "San Fruttuoso Abbey by Sea", tier: "Riviera Find", description: "A quiet crossing to a 10th-century abbey reachable only by water.", image: expAbbey, href: "https://www.viator.com/Portofino/d50421/san-fruttuoso" },
  ];

  return (
    <div className="pb-28 md:pb-24">
      {/* HERO */}
      <section className="relative h-[42vh] md:h-[56vh] min-h-[300px] md:min-h-[380px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="Portofino harbor — editorial hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-6 md:pb-8 text-ivory">
          <span className="eyebrow text-ivory/80 tracking-[0.4em]">The Resort Edit · Portofino</span>
          <h1 className="font-display text-5xl md:text-[5.5rem] mt-2 tracking-[0.05em] leading-[1]">
            5 Days in Portofino
          </h1>
          <p className="font-serif italic text-base md:text-xl text-ivory/85 mt-2 max-w-2xl leading-relaxed">
            — Explore each day. Shop three complete looks. —
          </p>
          <p className="eyebrow text-ivory/70 tracking-[0.3em] text-[0.65rem] mt-3">
            Showing {TIER_LABEL[tier]} Edit · {TIER_RANGE[tier]}
          </p>
        </div>
      </section>

      {/* 5 DAY SECTIONS — stacked editorial rows */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 md:py-14">
          <div className="space-y-12 md:space-y-16">
            {DAYS.map((d) => (
              <article
                key={d.slug}
                id={d.slug}
                className="grid grid-cols-1 lg:grid-cols-[minmax(220px,1fr)_3fr] gap-6 lg:gap-10 border-b border-border/40 pb-12 md:pb-16 last:border-b-0"
              >
                {/* LEFT — Editorial muse + day caption */}
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted border border-border/60">
                    <img
                      src={d.image}
                      alt={`${d.label} — ${d.title}`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
                      {d.label.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl tracking-[0.05em] text-ink leading-tight">
                      {d.title}
                    </h2>
                    <p className="font-serif italic text-[0.9rem] text-ink/65 mt-2 leading-relaxed">
                      {d.caption}
                    </p>
                    <Link
                      to={d.href}
                      className="mt-3 inline-flex items-center gap-2 eyebrow text-[0.6rem] tracking-[0.3em] text-gold hover:text-ink transition-colors border-b border-gold/60 pb-1"
                    >
                      View Full Day Edit <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* RIGHT — Three looks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                  {d.looks.map((look) => (
                    <Link
                      key={look.slug}
                      to="/portofino/day-$day/look-$look"
                      params={{ day: d.slug, look: look.slug }}
                      search={{ tier }}
                      className="group block bg-ivory border border-border/60 hover:border-gold transition-colors"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        <img
                          src={look.image}
                          alt={`${d.label} ${look.label} — ${look.title}`}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.5rem]">
                          {look.label.toUpperCase()} — {look.title.toUpperCase()}
                        </div>
                      </div>
                      <div className="p-3 md:p-4 text-center">
                        <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink group-hover:text-gold transition-colors">
                          View Full Look →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="bg-cream py-16 md:py-20 border-y border-border/40">
        <div className="mx-auto max-w-3xl px-6 text-center mb-10 md:mb-12">
          <span className="eyebrow text-gold">The Experiences</span>
          <h3 className="font-display text-3xl md:text-4xl mt-3 tracking-wide">Bookable Moments</h3>
          <div className="mx-auto my-4 h-px w-12 bg-gold" />
          <p className="font-serif italic text-base text-ink/65 leading-relaxed">
            Six concierge-curated moments along the Ligurian coast.
          </p>
        </div>
        <div className="mx-auto max-w-5xl px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((exp) => (
            <a
              key={exp.name}
              href={exp.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group block bg-ivory border border-ink/15 hover:border-gold transition-colors"
            >
              <div className="h-[180px] overflow-hidden bg-muted">
                <img src={exp.image} alt={exp.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <span className="eyebrow text-gold text-[9px] tracking-[0.3em]">{exp.tier}</span>
                <h4 className="font-display text-[15px] tracking-wide mt-1.5 leading-snug">{exp.name}</h4>
                <p className="font-serif italic text-ink/65 text-[12.5px] mt-1.5 leading-snug line-clamp-2">{exp.description}</p>
                <span className="mt-2.5 inline-block eyebrow text-[10px] tracking-[0.28em] text-ink group-hover:text-gold transition-colors">Book →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* HOTELS */}
      <section className="bg-ivory py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center mb-10">
          <span className="eyebrow text-gold">Where To Stay</span>
          <h3 className="font-display text-3xl md:text-4xl mt-3 tracking-wide">The Hotels</h3>
          <div className="mx-auto my-4 h-px w-12 bg-gold" />
          <p className="font-serif italic text-base text-ink/65 leading-relaxed">
            Three addresses on the promontory — each one a different way to wake up in Portofino.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Belmond Hotel Splendido", tier: "Iconic", note: "Pastel-pink cliffside legend with the most photographed pool in the Riviera.", image: hotelSplendido, href: "https://www.booking.com/searchresults.html?ss=Belmond+Hotel+Splendido+Portofino" },
            { name: "Splendido Mare, A Belmond Hotel", tier: "Harborfront", note: "Right on the piazzetta — wake to the boats, dine on the waterfront.", image: hotelSplendidoMare, href: "https://www.booking.com/searchresults.html?ss=Splendido+Mare+Belmond+Portofino" },
            { name: "Eight Hotel Portofino", tier: "Boutique", note: "Quietly elegant, walkable to everything, a more intimate alternative.", image: hotelEight, href: "https://www.booking.com/searchresults.html?ss=Eight+Hotel+Portofino" },
          ].map((h) => (
            <a
              key={h.name}
              href={h.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group block bg-ivory border border-border/60 hover:border-gold transition-colors overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={h.image} alt={h.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
                  {h.tier.toUpperCase()}
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-display text-xl tracking-wide leading-snug">{h.name}</h4>
                <p className="font-serif italic text-ink/70 mt-2.5 leading-relaxed text-sm">{h.note}</p>
                <span className="mt-4 inline-block eyebrow text-[10px] tracking-[0.3em] text-ink group-hover:text-gold transition-colors">Review / Book →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* TIER OPTIONS — bottom of page (spec §8) */}
      <section id="tier-options" className="bg-cream border-t border-border/60 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <span className="eyebrow text-gold tracking-[0.32em] text-[0.7rem]">Tier Options</span>
          <h3 className="font-display text-2xl md:text-3xl tracking-[0.06em] mt-2">
            Choose Your Shopping Lane
          </h3>
          <div className="mx-auto my-3 h-px w-12 bg-gold" />
          <p className="font-serif italic text-ink/65 text-sm md:text-base max-w-xl mx-auto">
            Same aesthetic. Three investment levels. Your selection updates every product across all five days.
          </p>
          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {TIER_SLUGS.map((t) => {
              const active = t === tier;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  aria-pressed={active}
                  className={
                    "text-left p-5 border transition-colors " +
                    (active
                      ? "bg-gold/90 border-gold text-ink"
                      : "bg-ivory border-border text-ink hover:border-gold hover:bg-gold/10")
                  }
                >
                  <div className="eyebrow text-[0.65rem] tracking-[0.32em] text-ink/80">
                    {TIER_LABEL[t].toUpperCase()} EDIT
                  </div>
                  <div className="font-serif italic text-[0.95rem] text-ink/80 mt-2 leading-snug">
                    {TIER_TAGLINE[t]}
                  </div>
                  <div className="font-display text-lg mt-3 tracking-wide">
                    {TIER_RANGE[t]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* STICKY BOTTOM TIER BAR — always-accessible selector */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-ivory/95 backdrop-blur border-t border-border/60 shadow-[0_-4px_18px_-12px_rgba(0,0,0,0.2)]">
        <div className="mx-auto max-w-[1280px] px-3 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline eyebrow text-[0.6rem] tracking-[0.3em] text-ink/55">
            Shopping Tier
          </span>
          <div className="flex-1 flex gap-1.5 sm:gap-2 justify-center sm:justify-start">
            {TIER_SLUGS.map((t) => {
              const active = t === tier;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  aria-pressed={active}
                  className={
                    "eyebrow tracking-[0.25em] text-[0.6rem] sm:text-[0.65rem] px-3 sm:px-4 py-2 border transition-colors " +
                    (active
                      ? "bg-gold/90 border-gold text-ink font-semibold"
                      : "bg-cream border-border text-ink hover:border-gold hover:text-gold")
                  }
                >
                  {TIER_LABEL[t].toUpperCase()}
                </button>
              );
            })}
          </div>
          <span className="hidden md:inline font-serif italic text-ink/55 text-xs">
            {TIER_RANGE[tier]}
          </span>
        </div>
      </div>
    </div>
  );
}
