import { createFileRoute } from "@tanstack/react-router";
import { destinations, destinationHref } from "@/data/destinations";
import { WorldMap } from "@/components/WorldMap";
import { DestinationLink } from "@/components/DestinationLink";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Destinations — Resort Edit" },
      { name: "description", content: "An interactive atlas of curated escapes — from Portofino and Capri to Tulum and Phuket. Luxury travel guides for the worldly woman." },
      { property: "og:title", content: "Destinations — Resort Edit" },
      { property: "og:description", content: "An interactive atlas of editorial travel guides from the Mediterranean to the tropics." },
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

function DestinationsPage() {
  const featured = destinations;

  return (
    <div className="bg-ivory">
      {/* HERO + MAP — tight editorial atlas */}
      <section className="bg-ivory pt-12 md:pt-16 pb-6 md:pb-8 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <span className="eyebrow text-gold">The Atlas</span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] mt-3 md:mt-4 tracking-wide text-ink leading-[1.02]">
            Where in the World
          </h1>
          <p className="mt-4 md:mt-5 font-serif italic text-ink/65 text-lg md:text-xl">
            Curated escapes, styled destination by destination.
          </p>
        </div>
        <div className="mx-auto max-w-6xl mt-6 md:mt-8 hidden md:block">
          <WorldMap />
        </div>
      </section>

      {/* FEATURED DESTINATIONS — horizontal editorial carousel */}
      <section className="bg-cream/30 border-t border-border/40 py-10 md:py-14">
        <div className="mx-auto max-w-[1400px] px-6 flex items-baseline justify-between mb-5 md:mb-7">
          <span className="eyebrow text-gold">Featured Destinations</span>
          <a href="#all" className="eyebrow text-ink/60 hover:text-gold transition-colors hidden md:inline">
            View All Destinations →
          </a>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <ul className="flex gap-4 md:gap-5 px-6 min-w-max pb-2">
            {featured.map((d) => {
              const vibe = vibeBySlug[d.slug] ?? d.travelType;
              const count = editsBySlug[d.slug] ?? 10;
              return (
                <li key={d.slug} className="w-[220px] md:w-[240px] lg:w-[260px] shrink-0">
                  <DestinationLink d={d} className="group block relative overflow-hidden aspect-[3/4] bg-ink rounded-sm">
                    <img
                      src={d.image}
                      alt={d.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-all duration-[1400ms] ease-out group-hover:scale-[1.06] group-hover:brightness-[0.85]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                      <h3 className="font-display text-2xl md:text-3xl tracking-wide leading-tight">
                        {d.name}
                      </h3>
                      <p className="font-serif italic text-ivory/85 mt-1 text-sm">{vibe}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-ivory/25 pt-3">
                        <span className="eyebrow text-ivory/80 text-[0.65rem]">{count} edits</span>
                        <span
                          aria-hidden
                          className="text-ivory transition-transform duration-500 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </DestinationLink>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CURRENTLY EDITING — premium pills with thumbnails */}
      <section id="all" className="border-t border-border/40 bg-ivory">
        <div className="mx-auto max-w-[1400px] px-6 py-5 md:py-7 flex items-center gap-5 md:gap-8">
          <span className="eyebrow text-gold whitespace-nowrap hidden md:inline">Currently Editing</span>
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <ul className="flex items-center gap-2 md:gap-3 min-w-max">
              {featured.map((d) => (
                <li key={d.slug}>
                  <DestinationLink
                    d={d}
                    className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-ink/10 hover:border-gold/60 hover:bg-cream/40 transition-colors"
                  >
                    <img
                      src={d.image}
                      alt=""
                      aria-hidden
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <span className="font-serif text-sm text-ink/80 group-hover:text-ink whitespace-nowrap">
                      {d.name}
                    </span>
                  </DestinationLink>
                </li>
              ))}
              <li className="pl-2 text-ink/40" aria-hidden>→</li>
            </ul>
          </div>
        </div>
      </section>

      {/* JOIN THE EDIT CTA */}
      <section className="bg-ink text-ivory py-20 px-6 text-center">
        <span className="eyebrow text-gold-soft">Join the Edit</span>
        <h2 className="font-display text-3xl md:text-5xl tracking-wide mt-4 max-w-2xl mx-auto">
          New destinations, exclusive edits, insider escapes.
        </h2>
        <a
          href="#newsletter"
          className="mt-8 inline-block eyebrow bg-gold text-ink px-8 py-4 rounded-md hover:bg-ivory transition-colors"
        >
          Get the Edit →
        </a>
      </section>
    </div>
  );
}

// Re-export so tree-shaking keeps the helper next to its consumers.
export { destinationHref };