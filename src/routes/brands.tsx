import { createFileRoute, Link } from "@tanstack/react-router";
import { brandCategories } from "@/data/brands";
import { EditorialDisclosure } from "@/components/EditorialDisclosure";
import { ArrowUpRight } from "lucide-react";
import destPortofino from "@/assets/dest-portofino.jpg";
import destCapri from "@/assets/dest-capri.jpg";
import destSttropez from "@/assets/dest-sttropez.jpg";
import destIbiza from "@/assets/dest-ibiza.jpg";
import destMallorca from "@/assets/dest-mallorca.jpg";
import destStbarths from "@/assets/dest-stbarths.jpg";
import destTulum from "@/assets/dest-tulum.jpg";
import destPhuket from "@/assets/dest-phuket.jpg";

const categoryImages: Record<string, string> = {
  portofino: destPortofino,
  capri: destCapri,
  sttropez: destSttropez,
  ibiza: destIbiza,
  mallorca: destMallorca,
  stbarths: destStbarths,
  tulum: destTulum,
  phuket: destPhuket,
};

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands We Love — Resort Edit" },
      {
        name: "description",
        content:
          "The luxury, quiet luxury, swim, and resort labels behind every Resort Edit look. Curated international brands across price points.",
      },
      { property: "og:title", content: "Brands We Love — Resort Edit" },
      {
        property: "og:description",
        content:
          "Resort icons, quiet luxury, swim & beach club, accessories, and Riviera finds.",
      },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-[1180px] px-6 pt-12 md:pt-16 pb-16">
        {/* HERO */}
        <header className="max-w-3xl">
          <span className="eyebrow text-gold">The Index</span>
          <h1 className="font-display text-4xl md:text-6xl tracking-[0.04em] mt-4 text-ink leading-[1.05]">
            Brands We Love
          </h1>
          <p className="mt-6 font-serif italic text-ink/75 text-lg md:text-xl leading-relaxed">
            These are the labels Resort Edit returns to season after season —
            selected for craftsmanship, destination relevance, and timeless
            resort dressing.
          </p>
          <div className="mt-6 flex items-center gap-3 text-ink/55">
            <span className="h-px w-10 bg-gold" />
            <span className="eyebrow text-[0.6rem]">By Invitation. Not Submission.</span>
          </div>
        </header>

        {/* CATEGORIES */}
        <div className="mt-14 space-y-16 md:space-y-20">
          {brandCategories.map((cat, i) => (
            <section key={cat.title} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
              {/* Editorial image */}
              <figure
                className={`md:col-span-4 ${i % 2 === 1 ? "md:order-2" : ""}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  {cat.image && categoryImages[cat.image] && (
                    <img
                      src={categoryImages[cat.image]}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="eyebrow text-[0.6rem] text-ivory bg-ink/55 backdrop-blur-sm px-3 py-1.5">
                      Edit {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </figure>

              {/* Category content */}
              <div className="md:col-span-8">
                <div className="flex items-baseline justify-between gap-6 border-b border-ink/15 pb-3">
                  <h2 className="font-display text-2xl md:text-3xl tracking-[0.06em] text-ink">
                    {cat.title}
                  </h2>
                  <span className="eyebrow text-gold text-[0.6rem]">
                    {String(cat.brands.length).padStart(2, "0")} Labels
                  </span>
                </div>
                <p className="mt-4 font-serif italic text-ink/65 max-w-xl">
                  {cat.description}
                </p>

                <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  {cat.brands.map((brand) => (
                    <li key={brand.slug}>
                      <Link
                        to="/brands/$slug"
                        params={{ slug: brand.slug }}
                        className="group block border-t border-ink/10 pt-3 hover:border-gold transition-colors"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-display text-lg tracking-wide text-ink group-hover:text-gold transition-colors">
                            {brand.name}
                          </span>
                          <span className="inline-flex items-center gap-1 eyebrow text-[0.55rem] text-ink/40 group-hover:text-gold transition-all group-hover:translate-x-0.5">
                            View
                            <ArrowUpRight size={11} strokeWidth={1.75} />
                          </span>
                        </div>
                        {brand.blurb && (
                          <p className="mt-1.5 font-serif text-[0.9rem] text-ink/65 leading-snug">
                            {brand.blurb}
                          </p>
                        )}
                        {(brand.bestFor || brand.destinations?.length) && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            {brand.bestFor && (
                              <span className="eyebrow text-[0.5rem] text-gold tracking-[0.22em]">
                                Best for {brand.bestFor}
                              </span>
                            )}
                            {brand.bestFor && brand.destinations?.length ? (
                              <span className="text-ink/30">·</span>
                            ) : null}
                            {brand.destinations?.map((d) => (
                              <span
                                key={d}
                                className="eyebrow text-[0.5rem] text-ink/55 tracking-[0.18em] border border-ink/15 px-1.5 py-0.5"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        <EditorialDisclosure className="mt-20" />

        {/* Partner CTA — editorial, by invitation */}
        <section className="mt-12 border-t border-b border-ink/15 py-12 md:py-14 grid md:grid-cols-[1fr_auto] items-center gap-8">
          <div>
            <span className="eyebrow text-gold">Collaborations</span>
            <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] mt-3 text-ink">
              Inclusion is curated, not open.
            </h2>
            <p className="mt-4 font-serif italic text-ink/70 max-w-xl leading-relaxed">
              Resort Edit partners with a small number of houses each season on
              destination-led editorial, featured edits, and considered
              placements. We review introductions from press offices, founders,
              and agencies on a rolling basis.
            </p>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 eyebrow text-[0.7rem] border border-ink text-ink px-7 py-4 hover:bg-ink hover:text-ivory transition-colors whitespace-nowrap self-start md:self-center"
          >
            Begin a Conversation
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </Link>
        </section>
      </div>
    </div>
  );
}