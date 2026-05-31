import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { destinations, destinationHref } from "@/data/destinations";
import { DestinationLink } from "@/components/DestinationLink";
import { absoluteUrl } from "@/lib/site";
import heroCannes from "@/assets/hero-muse-cannes.jpg";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Destinations — Resort Edit" },
      { name: "description", content: "An interactive atlas of curated escapes — from Portofino and Capri to Tulum and Phuket. Luxury travel guides for the worldly woman." },
      { property: "og:title", content: "Destinations — Resort Edit" },
      { property: "og:description", content: "An interactive atlas of editorial travel guides from the Mediterranean to the tropics." },
      { property: "og:url", content: absoluteUrl("/destinations") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/destinations") }],
  }),
  component: DestinationsPage,
});

const vibeBySlug: Record<string, string> = {
  portofino: "Italian Riviera",
  capri: "Coastal Glam",
  sttropez: "Beach Clubs",
  ibiza: "Beach Clubs",
  mallorca: "Mediterranean Escape",
  tulum: "Bohemian Escape",
  phuket: "Island Luxury",
};

const editsBySlug: Record<string, number> = {
  portofino: 16,
  capri: 18,
  sttropez: 12,
  ibiza: 22,
  mallorca: 14,
  tulum: 20,
  phuket: 15,
};

const FEATURED_SLUGS = ["portofino", "phuket"] as const;

const COMING_SOON = [
  "Cannes",
  "Mallorca",
  "St. Barths",
  "Nantucket",
  "Capri",
  "Ibiza",
] as const;

type FilterKey = "All" | "Italian Riviera" | "Beach Clubs" | "Island Escapes" | "Mediterranean" | "Tropical";

const FILTERS: FilterKey[] = [
  "All",
  "Italian Riviera",
  "Beach Clubs",
  "Island Escapes",
  "Mediterranean",
  "Tropical",
];

const filterTagsBySlug: Record<string, FilterKey[]> = {
  portofino: ["Italian Riviera", "Mediterranean"],
  phuket: ["Island Escapes", "Tropical"],
};

function DestinationsPage() {
  const featured = useMemo(
    () =>
      FEATURED_SLUGS.map((slug) => destinations.find((d) => d.slug === slug)!).filter(Boolean),
    [],
  );
  const [filter, setFilter] = useState<FilterKey>("All");
  const visible = useMemo(
    () =>
      filter === "All"
        ? featured
        : featured.filter((d) => filterTagsBySlug[d.slug]?.includes(filter)),
    [featured, filter],
  );
  const heroImage = heroCannes;

  return (
    <div className="bg-ivory">
      {/* HERO — split editorial, no map */}
      <section className="bg-ivory border-b border-border/40">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-2">
          <div className="px-6 lg:px-12 py-10 md:py-14 lg:py-16 flex flex-col justify-center">
            <span className="eyebrow text-gold">The Atlas</span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mt-3 tracking-wide text-ink leading-[1.02]">
              Where to Dress Next
            </h1>
            <p className="mt-5 font-serif italic text-ink/65 text-lg md:text-xl max-w-xl">
              Style guides for women who dress for the destination.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="/resort-edits"
                className="eyebrow bg-ink text-ivory px-6 py-3.5 rounded-md hover:bg-gold hover:text-ink transition-colors"
              >
                Explore Resort Edits →
              </a>
              <a
                href="#destinations"
                className="eyebrow border border-ink/30 text-ink px-6 py-3.5 rounded-md hover:border-gold hover:text-gold transition-colors"
              >
                Shop by Destination
              </a>
            </div>
          </div>
          <div className="relative min-h-[320px] md:min-h-[420px] lg:min-h-[560px] bg-ink overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt="Featured destination"
                className="absolute inset-0 h-full w-full object-cover object-[center_right] md:object-right"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-tr from-ink/30 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* FILTER ROW */}
      <section id="destinations" className="bg-ivory border-b border-border/40">
        <div className="mx-auto max-w-[1400px] px-6 py-5 md:py-6 flex items-center gap-5 md:gap-8">
          <span className="eyebrow text-gold whitespace-nowrap hidden md:inline">Filter by</span>
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <ul className="flex items-center gap-2 md:gap-3 min-w-max">
              {FILTERS.map((f) => {
                const active = f === filter;
                return (
                  <li key={f}>
                    <button
                      type="button"
                      onClick={() => setFilter(f)}
                      aria-pressed={active}
                      className={`eyebrow px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
                        active
                          ? "bg-gold/90 border-gold text-ink font-semibold"
                          : "bg-transparent border-ink/15 text-ink/70 hover:border-gold/60 hover:bg-cream/40"
                      }`}
                    >
                      {f}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS — large grid */}
      <section className="bg-ivory py-10 md:py-14">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex items-baseline justify-between mb-6 md:mb-8">
            <h2 className="font-display text-3xl md:text-4xl tracking-wide text-ink">
              Featured Destinations
            </h2>
            <span className="eyebrow text-ink/50 hidden md:inline">
              {visible.length} {visible.length === 1 ? "destination" : "destinations"}
            </span>
          </div>
          {visible.length === 0 ? (
            <p className="font-serif italic text-ink/55 py-12 text-center">
              No destinations match that filter yet.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 max-w-[1100px] mx-auto">
              {visible.map((d) => {
                const vibe = vibeBySlug[d.slug] ?? d.travelType;
                const count = editsBySlug[d.slug] ?? 10;
                return (
                  <li key={d.slug}>
                    <DestinationLink
                      d={d}
                      className="group block relative overflow-hidden aspect-[4/5] bg-ink rounded-sm"
                    >
                      <img
                        src={d.image}
                        alt={d.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-all duration-[1400ms] ease-out group-hover:scale-[1.06] group-hover:brightness-[0.85]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                        <p className="eyebrow text-gold-soft text-[0.7rem]">{vibe}</p>
                        <h3 className="font-display text-3xl md:text-4xl tracking-wide leading-tight mt-2">
                          {d.name}
                        </h3>
                        <div className="mt-5 flex items-center justify-between border-t border-ivory/25 pt-3">
                          <span className="eyebrow text-ivory/80 text-[0.65rem]">{count} edits</span>
                          <span className="eyebrow text-ivory transition-transform duration-500 group-hover:translate-x-1">
                            Explore →
                          </span>
                        </div>
                      </div>
                    </DestinationLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* COMING SOON — editorial chips */}
      <section id="coming-soon" className="border-t border-border/40 bg-cream/30">
        <div className="mx-auto max-w-[1100px] px-6 py-14 md:py-20 text-center">
          <div className="flex items-center gap-4 justify-center mb-5">
            <div className="h-px w-12 bg-gold/50" />
            <h2 className="eyebrow text-gold tracking-[0.3em]">Coming Soon</h2>
            <div className="h-px w-12 bg-gold/50" />
          </div>
          <p className="font-serif italic text-ink/70 text-lg md:text-xl">
            The destinations currently on our packing list.
          </p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
            {COMING_SOON.map((name) => (
              <li
                key={name}
                className="font-serif text-sm md:text-base text-ink/75 border border-ink/15 rounded-full px-5 py-2 bg-ivory/60"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

// Re-export so tree-shaking keeps the helper next to its consumers.
export { destinationHref };