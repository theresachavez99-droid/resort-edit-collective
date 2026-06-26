import { createFileRoute, Link } from "@tanstack/react-router";
import { brandCategories } from "@/data/brands";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands We Love | Resort Edit | Dressed for the destination" },
      {
        name: "description",
        content:
          "The international resort houses, swim ateliers, and destination labels behind every Resort Edit look — Italian, Greek, Iberian, Latin American, and Australian.",
      },
      { property: "og:title", content: "Brands We Love | Resort Edit | Dressed for the destination" },
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
  const slugify = (s: string) =>
    s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-[1180px] px-6 pt-16 md:pt-20 pb-20">
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

        <nav aria-label="Brand categories" className="mt-10 border-y border-border/40 py-3">
          <ul className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-x-6 gap-y-2 overflow-x-auto no-scrollbar">
            {brandCategories.map((cat) => (
              <li key={cat.title} className="whitespace-nowrap">
                <a
                  href={`#${slugify(cat.title)}`}
                  className="eyebrow text-[0.65rem] text-ink/70 hover:text-gold transition-colors"
                >
                  {cat.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="rhythm-major space-y-16 md:space-y-20">
          {brandCategories.map((cat) => (
            <section key={cat.title} id={slugify(cat.title)} className="scroll-mt-24">
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
                          Why We Love It →
                        </span>
                      </div>
                      {brand.blurb && (
                        <p className="mt-1.5 font-serif text-[0.9rem] text-ink/65 leading-snug">
                          {brand.blurb}
                        </p>
                      )}
                      {(brand.bestFor && brand.bestFor.length > 0) && (
                        <p className="mt-2 eyebrow text-[0.55rem] text-ink/55">
                          <span className="text-gold">Best for</span>
                          <span className="mx-1.5 text-ink/30">·</span>
                          {brand.bestFor.join(" · ")}
                        </p>
                      )}
                      {(brand.resortEditLoves && brand.resortEditLoves.length > 0) && (
                        <p className="mt-1 eyebrow text-[0.55rem] text-ink/55">
                          <span className="text-gold">Resort Edit loves</span>
                          <span className="mx-1.5 text-ink/30">·</span>
                          {brand.resortEditLoves.join(" · ")}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="rhythm-major text-center eyebrow text-[0.55rem] text-ink/50 max-w-xl mx-auto">
          Resort Edit is reader-supported. Some links may earn a small commission at no cost to you.
        </p>

        {/* Partner CTA */}
        <section className="rhythm-major border border-border/60 bg-cream/60 px-8 py-14 text-center">
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