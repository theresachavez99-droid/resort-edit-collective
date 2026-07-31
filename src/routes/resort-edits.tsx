import { createFileRoute, Link } from "@tanstack/react-router";
import { destinations } from "@/data/destinations";
import { DestinationLink } from "@/components/DestinationLink";
import { absoluteUrl } from "@/lib/site";
import { PORTOFINO_JOURNEY } from "@/lib/portofino-moment-fallbacks";

export const Route = createFileRoute("/resort-edits")({
  head: () => ({
    meta: [
      { title: "Resort Edits — Shoppable Looks by Moment | Resort Edit | Dressed for the destination" },
      {
        name: "description",
        content:
          "Every shoppable Resort Edit look, moment by moment — from arrival afternoons to a final nightcap. The wardrobe layer of every destination.",
      },
      { property: "og:title", content: "Resort Edits | Resort Edit | Dressed for the destination" },
      { property: "og:description", content: "Curated vacation style guides, packing edits, and shoppable looks." },
      { property: "og:url", content: absoluteUrl("/resort-edits") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/resort-edits") }],
  }),
  component: ResortEditsPage,
});

const LIVE_SLUGS = ["portofino", "mallorca"] as const;

function ResortEditsPage() {
  const featured = LIVE_SLUGS
    .map((slug) => destinations.find((d) => d.slug === slug)!)
    .filter(Boolean);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14 max-w-[1100px] mx-auto">
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
        <div className="mt-16 text-center">
          <div className="flex items-center gap-4 justify-center mb-5">
            <div className="h-px w-12 bg-gold/50" />
            <h3 className="eyebrow text-gold tracking-[0.3em]">Coming Soon</h3>
            <div className="h-px w-12 bg-gold/50" />
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
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

    </div>
  );
}