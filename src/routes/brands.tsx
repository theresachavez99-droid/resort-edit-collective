import { createFileRoute, Link } from "@tanstack/react-router";
import { brandCategories } from "@/data/brands";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands We Love — Resort Edit" },
      {
        name: "description",
        content:
          "The international resort houses, swim ateliers, and destination labels behind every Resort Edit look — Italian, Greek, Iberian, Latin American, and Australian.",
      },
      { property: "og:title", content: "Brands We Love — Resort Edit" },
      {
        property: "og:description",
        content:
          "Mediterranean icons, swim & beach club, resortwear & kaftans, raffia, jewelry, and destination finds.",
      },
      { property: "og:url", content: absoluteUrl("/brands") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/brands") }],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-[1180px] px-6 pt-16 md:pt-24 pb-20">
        <header className="text-center max-w-2xl mx-auto">
          <span className="eyebrow text-gold">The Index</span>
          <h1 className="font-display text-4xl md:text-6xl tracking-[0.06em] mt-5 text-ink">
            Brands We Love
          </h1>
          <p className="mt-6 font-serif italic text-ink/70 text-lg leading-relaxed">
            A living index of the international resort ateliers, swim houses, and
            destination labels we return to season after season — from Capri to
            Cartagena, Sydney to Saint-Tropez.
          </p>
        </header>

        <div className="mt-20 space-y-20">
          {brandCategories.map((cat) => (
            <section key={cat.title}>
              <div className="flex items-baseline justify-between gap-6 border-b border-border/60 pb-4">
                <h2 className="font-display text-2xl md:text-3xl tracking-[0.08em] text-ink">
                  {cat.title}
                </h2>
                <span className="eyebrow text-gold text-[0.6rem] hidden sm:block">
                  {String(cat.brands.length).padStart(2, "0")} Labels
                </span>
              </div>
              <p className="mt-4 font-serif italic text-ink/60 max-w-2xl">
                {cat.description}
              </p>
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                {cat.brands.map((brand) => (
                  <li key={brand.slug}>
                    <Link
                      to="/brands/$slug"
                      params={{ slug: brand.slug }}
                      className="group block border-t border-border/40 pt-4"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-lg tracking-wide text-ink group-hover:text-gold transition-colors">
                          {brand.name}
                        </span>
                        <span className="eyebrow text-[0.55rem] text-ink/40 group-hover:text-gold transition-colors">
                          View →
                        </span>
                      </div>
                      {brand.blurb && (
                        <p className="mt-1.5 font-serif text-[0.9rem] text-ink/65 leading-snug">
                          {brand.blurb}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-24 text-center eyebrow text-[0.55rem] text-ink/50 max-w-xl mx-auto">
          Resort Edit is reader-supported. Some links may earn a small commission at no cost to you.
        </p>

        {/* Partner CTA */}
        <section className="mt-20 border border-border/60 bg-cream/60 px-8 py-14 text-center">
          <span className="eyebrow text-gold">Partnerships</span>
          <h2 className="font-display text-3xl md:text-4xl tracking-wide mt-4 text-ink">
            Partner with Resort Edit
          </h2>
          <p className="mt-4 font-serif italic text-ink/70 max-w-xl mx-auto">
            Brand collaborations, featured edits, and curated placements for labels we love.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-block eyebrow bg-ink text-ivory px-8 py-4 rounded-sm hover:bg-gold transition-colors"
          >
            Get in touch →
          </Link>
        </section>
      </div>
    </div>
  );
}