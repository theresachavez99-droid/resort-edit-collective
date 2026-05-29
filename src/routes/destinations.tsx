import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  destinations,
  destinationHref,
  regionGroups,
  travelTypes,
  type TravelType,
} from "@/data/destinations";
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

function DestinationsPage() {
  const [filter, setFilter] = useState<TravelType | "All">("All");
  const [mapOpen, setMapOpen] = useState(false);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? destinations
        : destinations.filter((d) => d.travelType === filter),
    [filter],
  );

  return (
    <div>
      <section className="text-center pt-20 md:pt-28 pb-10 px-6 max-w-3xl mx-auto">
        <span className="eyebrow text-gold">The Atlas</span>
        <h1 className="font-display text-5xl md:text-7xl mt-6 tracking-wide">Explore the Edit by Destination</h1>
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="hairline" />
          <span className="font-serif italic text-ink/70">An interactive map of where to go next.</span>
          <span className="hairline" />
        </div>
      </section>

      {/* Map: always visible on desktop; collapsible on mobile */}
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="md:hidden mb-4 flex justify-center">
          <button
            type="button"
            onClick={() => setMapOpen((v) => !v)}
            className="eyebrow border border-ink/30 text-ink px-5 py-3 hover:bg-ink hover:text-ivory transition-colors"
            aria-expanded={mapOpen}
          >
            {mapOpen ? "Hide the map" : "Explore the world map"}
          </button>
        </div>
        <div className={`${mapOpen ? "block" : "hidden"} md:block bg-cream/60 border border-border/60 rounded-sm p-3 md:p-6`}>
          <WorldMap />
        </div>
      </section>

      {/* Travel-type filter */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(["All", ...travelTypes] as const).map((t) => {
            const isActive = filter === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`eyebrow px-4 py-2.5 border transition-colors ${
                  isActive
                    ? "bg-ink text-ivory border-ink"
                    : "border-ink/20 text-ink/70 hover:text-ink hover:border-ink/60"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grouped destination grid */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        {regionGroups.map((group) => {
          const inGroup = filtered.filter((d) => d.regionGroup === group);
          if (inGroup.length === 0) return null;
          return (
            <div key={group} className="mt-20 first:mt-8">
              <div className="flex items-baseline justify-between mb-8 border-b border-border/60 pb-4">
                <h2 className="font-display text-2xl md:text-3xl tracking-wide">{group}</h2>
                <span className="eyebrow text-ink/50">{inGroup.length} edits</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {inGroup.map((d) => (
                  <DestinationLink key={d.slug} d={d} className="group block">
                    <div className="relative overflow-hidden bg-muted aspect-[4/5]">
                      <img
                        src={d.image}
                        alt={d.name}
                        loading="lazy"
                        width={1024}
                        height={1280}
                        className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="eyebrow bg-ivory/90 text-ink px-2.5 py-1">{d.travelType}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-ivory">
                        <span className="eyebrow text-gold-soft">{d.region}</span>
                        <h3 className="font-display text-3xl md:text-4xl mt-2 tracking-wide">{d.name}</h3>
                      </div>
                    </div>
                    <p className="font-serif italic text-ink/70 mt-4">{d.tagline}</p>
                  </DestinationLink>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center font-serif italic text-ink/60 mt-20">
            No destinations match that filter yet — more on the way.
          </p>
        )}
      </section>
    </div>
  );
}

// Re-export so tree-shaking keeps the helper next to its consumers.
export { destinationHref };