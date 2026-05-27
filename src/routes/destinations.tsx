import { createFileRoute, Link } from "@tanstack/react-router";
import { destinations } from "@/data/destinations";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Destinations — Resort Edit" },
      { name: "description", content: "An atlas of curated escapes — from Portofino and Capri to Tulum and Phuket. Luxury travel guides for the worldly woman." },
      { property: "og:title", content: "Destinations — Resort Edit" },
      { property: "og:description", content: "Editorial travel guides from the Mediterranean to the tropics." },
    ],
  }),
  component: DestinationsPage,
});

function DestinationsPage() {
  return (
    <div>
      <section className="text-center py-24 md:py-32 px-6 max-w-3xl mx-auto">
        <span className="eyebrow text-gold">The Atlas</span>
        <h1 className="font-display text-5xl md:text-7xl mt-6 tracking-wide">Destinations</h1>
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="hairline" />
          <span className="font-serif italic text-ink/70">A curated map of where to go next.</span>
          <span className="hairline" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {destinations.map((d, i) => (
            <Link
              key={d.slug}
              to={d.href ?? "/destinations"}
              className={`group block ${i % 5 === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
            >
              <div className={`relative overflow-hidden bg-muted ${i % 5 === 0 ? "aspect-[5/6]" : "aspect-[4/5]"}`}>
                <img
                  src={d.image}
                  alt={d.name}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-ivory">
                  <span className="eyebrow text-gold-soft">{d.region}</span>
                  <h2 className="font-display text-3xl md:text-4xl mt-2 tracking-wide">{d.name}</h2>
                </div>
              </div>
              <p className="font-serif italic text-ink/70 mt-4 text-center">{d.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}