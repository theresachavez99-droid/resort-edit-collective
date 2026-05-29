import { createFileRoute, Link } from "@tanstack/react-router";
import { destinations } from "@/data/destinations";
import { DestinationLink } from "@/components/DestinationLink";

export const Route = createFileRoute("/resort-edits")({
  head: () => ({
    meta: [
      { title: "Resort Edits — Curated Vacation Style | Resort Edit" },
      { name: "description", content: "Curated vacation style guides, packing edits, and shoppable looks — browse by destination, occasion, or collection." },
      { property: "og:title", content: "Resort Edits — Resort Edit" },
      { property: "og:description", content: "Curated vacation style guides, packing edits, and shoppable looks." },
    ],
    links: [{ rel: "canonical", href: "/resort-edits" }],
  }),
  component: ResortEditsPage,
});

const occasions = [
  { label: "Beach Day", note: "Sun, salt, and one perfect caftan." },
  { label: "Day Club", note: "Rosé hours and crochet under cabanas." },
  { label: "Dinner Glam", note: "Silk slips and gold at golden hour." },
  { label: "Airport Style", note: "Linen sets that survive long-hauls." },
  { label: "Poolside", note: "The one-piece, the wrap, the hat." },
  { label: "Excursions", note: "Cliff walks, market days, boat hops." },
] as const;

const collections = [
  { label: "Designer", note: "The Row, Khaite, Zimmermann." },
  { label: "Mid-Luxe", note: "Faithfull, Posse, Sir." },
  { label: "Riviera Finds", note: "Boutique discoveries & under-the-radar labels." },
] as const;

function ResortEditsPage() {
  const featured = destinations.slice(0, 6);

  return (
    <div className="bg-ivory">
      {/* Hero */}
      <section className="text-center pt-20 md:pt-28 pb-12 px-6 max-w-3xl mx-auto">
        <span className="eyebrow text-gold">Shop the Edit</span>
        <h1 className="font-display text-5xl md:text-7xl mt-6 tracking-wide">Resort Edits</h1>
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="hairline" />
          <span className="font-serif italic text-ink/70">What to wear, wherever you're going.</span>
          <span className="hairline" />
        </div>
        <p className="mt-8 font-serif text-lg md:text-xl text-ink/80 leading-relaxed">
          Curated vacation style guides, packing edits, and shoppable looks.
        </p>
      </section>

      {/* By Destination */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-20">
        <div className="flex items-baseline justify-between mb-8 border-b border-border/60 pb-4">
          <h2 className="font-display text-2xl md:text-3xl tracking-wide">By Destination</h2>
          <Link to="/destinations" className="eyebrow text-gold hover:text-ink">All destinations →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {featured.map((d) => (
            <DestinationLink key={d.slug} d={d} className="group block">
              <div className="relative overflow-hidden bg-muted aspect-[4/5]">
                <img
                  src={d.image}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-ivory">
                  <span className="eyebrow text-gold-soft">The {d.name} Edit</span>
                  <h3 className="font-display text-3xl md:text-4xl mt-2 tracking-wide">{d.name}</h3>
                </div>
              </div>
              <p className="font-serif italic text-ink/70 mt-4">{d.tagline}</p>
            </DestinationLink>
          ))}
        </div>
      </section>

      {/* By Occasion */}
      <section className="bg-cream/60 border-y border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow text-gold">Shop by Occasion</span>
            <h2 className="font-display text-3xl md:text-5xl tracking-wide mt-4">For Every Moment</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border/60">
            {occasions.map((o) => (
              <Link
                key={o.label}
                to="/portofino"
                className="group bg-ivory p-8 md:p-10 text-center hover:bg-cream transition-colors"
              >
                <h3 className="font-display text-xl md:text-2xl tracking-wide text-ink group-hover:text-gold transition-colors">
                  {o.label}
                </h3>
                <p className="mt-3 font-serif italic text-sm text-ink/65">{o.note}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* By Collection */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow text-gold">By Collection</span>
          <h2 className="font-display text-3xl md:text-5xl tracking-wide mt-4">Curated Price Points</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((c) => (
            <Link
              key={c.label}
              to="/brands"
              className="group border border-border/60 bg-ivory p-10 hover:border-gold transition-colors"
            >
              <span className="eyebrow text-gold">Collection</span>
              <h3 className="font-display text-3xl tracking-wide mt-3 text-ink group-hover:text-gold transition-colors">
                {c.label}
              </h3>
              <p className="mt-4 font-serif italic text-ink/70">{c.note}</p>
              <span className="mt-6 inline-block eyebrow text-ink/50 group-hover:text-gold">Browse →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Join the Edit CTA */}
      <section className="bg-ink text-ivory py-20 px-6 text-center">
        <span className="eyebrow text-gold-soft">Join the Edit</span>
        <h2 className="font-display text-3xl md:text-5xl tracking-wide mt-4 max-w-2xl mx-auto">
          New edits, exclusive drops, and insider escapes.
        </h2>
        <a
          href="#newsletter"
          className="mt-8 inline-block eyebrow bg-gold text-ink px-8 py-4 rounded-sm hover:bg-ivory transition-colors"
        >
          Get the Edit →
        </a>
      </section>
    </div>
  );
}