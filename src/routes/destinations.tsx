import { createFileRoute } from "@tanstack/react-router";
import { destinations, destinationHref } from "@/data/destinations";
import { DestinationLink } from "@/components/DestinationLink";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Destinations — Resort Edit" },
      { name: "description", content: "Curated escapes, destination-inspired style, and places worth dressing for — from Portofino and Capri to St. Barths and Phuket." },
      { property: "og:title", content: "Destinations — Resort Edit" },
      { property: "og:description", content: "Curated escapes, destination-inspired style, and places worth dressing for." },
      { property: "og:url", content: "/destinations" },
    ],
    links: [{ rel: "canonical", href: "/destinations" }],
  }),
  component: DestinationsPage,
});

const vibeBySlug: Record<string, string> = {
  portofino: "Italian Riviera",
  capri: "Coastal Glam",
  sttropez: "Beach Clubs",
  ibiza: "Beach Clubs",
  mallorca: "Mediterranean Escape",
  stbarths: "Island Luxury",
  tulum: "Bohemian Escape",
  phuket: "Tropical Bliss",
};

const editsBySlug: Record<string, number> = {
  portofino: 16,
  capri: 18,
  sttropez: 12,
  ibiza: 22,
  mallorca: 14,
  stbarths: 11,
  tulum: 20,
  phuket: 15,
};

const featuredOrder = ["portofino", "capri", "ibiza", "stbarths", "mallorca", "tulum", "phuket"];
const trendingOrder = ["capri", "ibiza", "portofino", "mallorca", "stbarths"];

function DestinationsPage() {
  const bySlug = Object.fromEntries(destinations.map((d) => [d.slug, d]));
  const featured = featuredOrder.map((s) => bySlug[s]).filter(Boolean);
  const trending = trendingOrder.map((s) => bySlug[s]).filter(Boolean);
  const [hero, ...rest] = featured;
  const heroPair = rest.slice(0, 2);
  const gridRest = rest.slice(2);

  return (
    <div className="bg-ivory">
      {/* HERO — compact editorial */}
      <section className="bg-ivory pt-10 md:pt-14 pb-6 md:pb-8 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <span className="eyebrow text-gold">Destinations</span>
          <h1 className="font-display text-5xl md:text-7xl mt-3 tracking-wide text-ink leading-[1.02]">
            Where in the World
          </h1>
          <p className="mt-4 font-serif italic text-ink/65 text-base md:text-lg max-w-xl mx-auto">
            Curated escapes, destination-inspired style, and places worth dressing for.
          </p>
        </div>
      </section>

      {/* FEATURED DESTINATIONS — asymmetric editorial grid */}
      <section className="bg-ivory pb-12 md:pb-20 px-4 md:px-6">
        <div className="mx-auto max-w-[1400px]">
          {/* Row 1 — one oversized feature + two supporting */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            {hero && (
              <div className="lg:col-span-2 lg:row-span-2">
                <FeatureCard d={hero} size="xl" />
              </div>
            )}
            {heroPair.map((d) => (
              <FeatureCard key={d.slug} d={d} size="md" />
            ))}
          </div>
          {/* Row 2 — supporting grid (mobile: swipeable carousel) */}
          {gridRest.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
                {gridRest.map((d) => (
                  <FeatureCard key={d.slug} d={d} size="sm" />
                ))}
              </div>
              <div className="md:hidden mt-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                <ul className="flex gap-3 min-w-max pb-1">
                  {gridRest.map((d) => (
                    <li key={d.slug} className="w-[72vw] max-w-[300px] shrink-0">
                      <FeatureCard d={d} size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      {/* TRENDING — visual destination chips */}
      <section className="border-t border-border/40 bg-cream/30">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 md:py-10">
          <div className="flex items-baseline justify-between mb-4 md:mb-5">
            <span className="eyebrow text-gold">Trending Destinations</span>
            <span className="font-serif italic text-ink/50 text-sm hidden md:inline">Edited this week</span>
          </div>
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <ul className="flex gap-3 md:gap-4 min-w-max pb-1">
              {trending.map((d) => (
                <li key={d.slug}>
                  <DestinationLink
                    d={d}
                    className="group flex items-center gap-3 pr-5 pl-2 py-2 rounded-full bg-ivory border border-ink/10 hover:border-gold/60 transition-colors"
                  >
                    <img
                      src={d.image}
                      alt=""
                      aria-hidden
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <span className="font-display text-base md:text-lg tracking-wide text-ink whitespace-nowrap">
                      {d.name}
                    </span>
                  </DestinationLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* JOIN THE EDIT CTA */}
      <section id="newsletter" className="bg-ink text-ivory py-14 md:py-16 px-6 text-center">
        <span className="eyebrow text-gold-soft">Join the Edit</span>
        <h2 className="font-display text-3xl md:text-5xl tracking-wide mt-3 max-w-2xl mx-auto leading-tight">
          Get the next destination before everyone else.
        </h2>
        <p className="mt-4 font-serif italic text-ivory/70 max-w-xl mx-auto">
          New destinations, resort edits, and curated escapes delivered first.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            placeholder="Your email address"
            className="flex-1 bg-transparent border border-ivory/30 px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold rounded-md"
          />
          <button
            type="submit"
            className="eyebrow bg-gold text-ink px-6 py-3.5 rounded-md hover:bg-ivory transition-colors whitespace-nowrap"
          >
            Join the Edit →
          </button>
        </form>
      </section>
    </div>
  );
}

function FeatureCard({
  d,
  size,
}: {
  d: import("@/data/destinations").Destination;
  size: "xl" | "md" | "sm";
}) {
  const vibe = vibeBySlug[d.slug] ?? d.travelType;
  const count = editsBySlug[d.slug] ?? 10;
  const aspect =
    size === "xl"
      ? "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[640px]"
      : size === "md"
        ? "aspect-[4/5] lg:aspect-[5/6]"
        : "aspect-[4/5]";
  const nameSize =
    size === "xl"
      ? "text-4xl md:text-6xl"
      : size === "md"
        ? "text-2xl md:text-3xl"
        : "text-xl md:text-2xl";

  return (
    <DestinationLink
      d={d}
      className={`group block relative overflow-hidden bg-ink rounded-sm ${aspect}`}
    >
      <img
        src={d.image}
        alt={d.name}
        loading="lazy"
        className="h-full w-full object-cover transition-all duration-[1400ms] ease-out group-hover:scale-[1.05] group-hover:brightness-[0.8]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent transition-opacity duration-500 group-hover:from-ink/90" />
      <div className={`absolute inset-x-0 bottom-0 text-ivory ${size === "xl" ? "p-7 md:p-10" : "p-5 md:p-6"}`}>
        <p className="font-serif italic text-ivory/85 text-sm md:text-base">{vibe}</p>
        <h3 className={`font-display tracking-wide leading-[1.05] mt-1.5 ${nameSize}`}>
          {d.name}
        </h3>
        <div className="mt-4 flex items-center justify-between border-t border-ivory/25 pt-3">
          <span className="eyebrow text-ivory/80 text-[0.65rem]">{count} edits</span>
          <span
            aria-hidden
            className="opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0 text-ivory"
          >
            →
          </span>
        </div>
      </div>
    </DestinationLink>
  );
}

// Re-export so tree-shaking keeps the helper next to its consumers.
export { destinationHref };