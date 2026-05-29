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
  portofino: "Coastal Glam",
  capri: "Mediterranean Escape",
  sttropez: "Beach Clubs",
  ibiza: "Island Luxury",
  mallorca: "Mediterranean Escape",
  tulum: "Dinner Destinations",
  phuket: "Island Luxury",
};

function editsCount(slug: string): number {
  // Simple heuristic — Portofino has the full standalone edit; others get 1 base edit each.
  return slug === "portofino" ? 5 : 3;
}

function DestinationsPage() {
  const featured = destinations;
  const hero = destinations[0];

  return (
    <div className="bg-ivory">
      {/* HERO */}
      <section className="relative h-[68vh] min-h-[460px] max-h-[720px] w-full overflow-hidden">
        <img
          src={hero.image}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/20 to-ink/55" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 text-ivory">
          <span className="eyebrow text-gold-soft">The Atlas</span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mt-5 tracking-wide max-w-4xl leading-[1.05]">
            Explore the Edit by Destination
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="hairline bg-ivory/40" />
            <span className="font-serif italic text-ivory/90 text-lg md:text-xl">
              Curated escapes, styled destination by destination.
            </span>
            <span className="hairline bg-ivory/40" />
          </div>
        </div>
      </section>

      {/* CURRENTLY EDITING — scrolling chips */}
      <section className="border-y border-border/60 bg-cream/40">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center gap-6">
          <span className="eyebrow text-gold whitespace-nowrap hidden md:inline">Currently Editing</span>
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <ul className="flex items-center gap-2 md:gap-3 min-w-max">
              {featured.map((d) => (
                <li key={d.slug}>
                  <DestinationLink
                    d={d}
                    className="eyebrow border border-ink/15 hover:border-gold hover:text-gold text-ink/75 px-4 py-2 rounded-full whitespace-nowrap transition-colors"
                  >
                    {d.name}
                  </DestinationLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS — primary UX */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow text-gold">Featured</span>
          <h2 className="font-display text-3xl md:text-5xl tracking-wide mt-4 text-ink">
            The Edit, Destination by Destination
          </h2>
          <p className="mt-5 font-serif italic text-ink/70">
            Editorial guides for the places we keep returning to.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {featured.map((d) => {
            const vibe = vibeBySlug[d.slug] ?? d.travelType;
            const count = editsCount(d.slug);
            return (
              <DestinationLink key={d.slug} d={d} className="group block">
                <div className="relative overflow-hidden bg-muted aspect-[4/5]">
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="eyebrow bg-ivory/90 text-ink px-2.5 py-1">{vibe}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-ivory">
                    <span className="eyebrow text-gold-soft">{d.region}</span>
                    <h3 className="font-display text-3xl md:text-4xl mt-2 tracking-wide">{d.name}</h3>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <p className="font-serif italic text-ink/70">{d.tagline}</p>
                  <span className="eyebrow text-ink/45 whitespace-nowrap">{count} edits</span>
                </div>
              </DestinationLink>
            );
          })}
        </div>
      </section>

      {/* EDITORIAL MAP — supporting visual */}
      <section className="bg-cream/40 border-t border-border/60 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow text-gold">The Atlas</span>
            <h2 className="font-display text-2xl md:text-4xl tracking-wide mt-4 text-ink">
              Where in the World
            </h2>
            <p className="mt-4 font-serif italic text-ink/65">
              A quiet map of where we're traveling next.
            </p>
          </div>
          <div className="hidden md:block">
            <WorldMap />
          </div>
          <p className="md:hidden text-center font-serif italic text-ink/50">
            Best viewed on a larger screen.
          </p>
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