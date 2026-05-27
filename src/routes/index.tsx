import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-portofino.jpg";
import { destinations } from "@/data/destinations";
import { portofinoLooks } from "@/data/portofino";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resort Edit — Curated Escapes. Inspired By You." },
      { name: "description", content: "Editorial travel and fashion for sophisticated women. Mediterranean itineraries, resort wardrobes and quiet luxury addresses." },
      { property: "og:title", content: "Resort Edit — Curated Escapes" },
      { property: "og:description", content: "A luxury digital publication for travel and fashion." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = destinations.slice(0, 4);
  const portofinoPreview = portofinoLooks.slice(0, 3);
  return (
    <div>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Woman in silk dress on a Portofino terrace at golden hour"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-ivory/40" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
          <span className="eyebrow text-ivory drop-shadow-md">Volume I · The Riviera Issue</span>
          <h1 className="font-display text-ivory text-5xl md:text-8xl lg:text-9xl tracking-[0.2em] mt-6 drop-shadow-lg">
            RESORT EDIT
          </h1>
          <div className="mt-6 flex items-center gap-4">
            <span className="hairline bg-ivory/80" />
            <span className="font-serif italic text-ivory text-lg md:text-xl">Curated Escapes. Inspired By You.</span>
            <span className="hairline bg-ivory/80" />
          </div>
          <Link to="/portofino" className="mt-12 eyebrow text-ink bg-ivory px-8 py-4 hover:bg-gold hover:text-ivory transition-colors">
            Open the Portofino Edit
          </Link>
        </div>
      </section>

      {/* EDITOR'S LETTER */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <span className="eyebrow text-gold">From the Editor</span>
        <p className="font-serif italic text-2xl md:text-3xl leading-relaxed mt-8 text-ink">
          “There is a quiet kind of luxury in knowing where to be, what to wear, and when to do nothing at all. This issue is a love letter to the long Mediterranean afternoon — the printed silks, the harbor lunches, the boats that wait.”
        </p>
        <p className="eyebrow text-ink/60 mt-10">— The Resort Edit</p>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section className="bg-cream py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <span className="eyebrow text-gold">The Atlas</span>
              <h2 className="font-display text-4xl md:text-6xl mt-4 tracking-wide">Featured Destinations</h2>
            </div>
            <Link to="/destinations" className="eyebrow text-ink border-b border-gold pb-1 hover:text-gold w-fit">
              View the full atlas →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((d) => (
              <Link
                key={d.slug}
                to={d.href ? "/portofino" : "/destinations"}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 text-center">
                  <span className="eyebrow text-gold">{d.region}</span>
                  <h3 className="font-display text-2xl md:text-3xl mt-2 tracking-wider">{d.name}</h3>
                  <p className="font-serif italic text-ink/60 mt-2 text-sm">{d.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE: 5 DAYS IN PORTOFINO */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <span className="eyebrow text-gold">Featured Editorial</span>
            <h2 className="font-display text-5xl md:text-7xl mt-6 tracking-[0.05em]">5 Days in Portofino</h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="hairline" />
              <span className="eyebrow text-ink/60">A Style & Itinerary Guide</span>
              <span className="hairline" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {portofinoPreview.map((look) => (
              <article key={look.title} className="bg-card border border-border/60">
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={look.image}
                    alt={look.title}
                    loading="lazy"
                    width={1024}
                    height={1408}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-7 text-center">
                  <span className="eyebrow text-gold">{look.day}</span>
                  <h3 className="font-display text-3xl mt-3 tracking-wide">{look.title}</h3>
                  <p className="font-serif italic text-ink/70 mt-3 text-sm">{look.subtitle}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/portofino" className="eyebrow text-ivory bg-ink px-10 py-5 hover:bg-gold transition-colors inline-block">
              Read the Full Edit →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
