import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { getPortofinoMoment } from "@/lib/portofino-moments.functions";
import { getPortofinoMomentDef, PORTOFINO_MOMENT_DEFS } from "@/lib/portofino-moment-fallbacks";
import { absoluteUrl } from "@/lib/site";

const momentQuery = (slug: string) =>
  queryOptions({
    queryKey: ["portofino-moment", slug],
    queryFn: () => getPortofinoMoment({ data: { moment_slug: slug } }),
  });

export const Route = createFileRoute("/portofino/$moment")({
  loader: async ({ params, context }) => {
    const def = getPortofinoMomentDef(params.moment);
    if (!def) throw notFound();
    await context.queryClient.ensureQueryData(momentQuery(params.moment));
    return { def };
  },
  head: ({ params }) => {
    const def = getPortofinoMomentDef(params.moment);
    if (!def) return { meta: [{ title: "Moment — Portofino | Resort Edit" }] };
    const title = `${def.moment_name} in Portofino — Resort Edit | Dressed for the Destination`;
    const description = def.narrative;
    const path = `/portofino/${def.moment_slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: absoluteUrl(def.hero_banner_image) },
        { property: "og:url", content: absoluteUrl(path) },
        { name: "twitter:image", content: absoluteUrl(def.hero_banner_image) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(path) }],
    };
  },
  errorComponent: () => (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-ink">
      <div className="text-center">
        <p className="eyebrow text-gold tracking-[0.3em] text-[0.7rem]">Portofino</p>
        <h1 className="font-display text-2xl mt-2">This moment couldn't be loaded.</h1>
        <Link to="/portofino" className="mt-4 inline-block eyebrow tracking-[0.28em] text-[0.7rem] border-b border-gold text-gold">
          Return to Portofino
        </Link>
      </div>
    </main>
  ),
  notFoundComponent: () => (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-ink">
      <div className="text-center">
        <p className="eyebrow text-gold tracking-[0.3em] text-[0.7rem]">Portofino</p>
        <h1 className="font-display text-2xl mt-2">That moment doesn't exist in Portofino — yet.</h1>
        <Link to="/portofino" className="mt-4 inline-block eyebrow tracking-[0.28em] text-[0.7rem] border-b border-gold text-gold">
          Browse the six moments
        </Link>
      </div>
    </main>
  ),
  component: MomentPage,
});

function MomentPage() {
  const { moment: slug } = Route.useParams();
  const { data } = useSuspenseQuery(momentQuery(slug));
  const card = data.ok ? data.moment : null;
  if (!card) throw notFound();

  const { resolved } = card;
  const heroImage = card.hero_banner_image;
  const currentIdx = PORTOFINO_MOMENT_DEFS.findIndex((m) => m.moment_slug === slug);
  const nextMoment =
    currentIdx >= 0
      ? PORTOFINO_MOMENT_DEFS[(currentIdx + 1) % PORTOFINO_MOMENT_DEFS.length]
      : null;

  return (
    <div className="pb-16 md:pb-20">
      {/* BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-[1180px] px-4 sm:px-6 pt-5 pb-2"
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 eyebrow text-[0.6rem] tracking-[0.26em] text-ink/55">
          <li>
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          </li>
          <li aria-hidden className="text-gold/50">/</li>
          <li>
            <Link to="/portofino" className="hover:text-gold transition-colors">Portofino</Link>
          </li>
          <li aria-hidden className="text-gold/50">/</li>
          <li aria-current="page" className="text-ink">{card.moment_name}</li>
        </ol>
      </nav>

      {/* HERO */}
      <section className="relative h-[44vh] md:h-[58vh] min-h-[320px] w-full overflow-hidden bg-ink">
        <img
          src={heroImage}
          alt={`${card.moment_name} — Portofino`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/45" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-8 md:pb-10 text-ivory">
          <Link
            to="/portofino"
            className="eyebrow text-[0.62rem] tracking-[0.34em] text-ivory/85 hover:text-gold border-b border-ivory/40 hover:border-gold pb-1"
          >
            PORTOFINO
          </Link>
          <h1 className="font-display text-4xl md:text-6xl mt-3 tracking-[0.05em] leading-[1.05]">
            {card.moment_name}
          </h1>
          <p className="font-serif italic text-base md:text-xl text-ivory/90 mt-3 max-w-2xl leading-relaxed">
            {card.narrative}
          </p>
        </div>
      </section>

      {/* THE LOOK */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_1.4fr] gap-8 md:gap-12 items-start">
            <div className="relative aspect-[3/4] overflow-hidden bg-cream/40 border border-border/60 flex items-center justify-center">
              <img
                src={resolved.image}
                alt={resolved.title}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
            <div className="space-y-5">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                {resolved.source === "tagged" ? "Resort Edit Look" : "Editor's Pick"}
              </span>
              <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink leading-tight">
                {resolved.title}
              </h2>

              {resolved.why_it_works && (
                <p className="font-serif italic text-[1rem] md:text-[1.05rem] text-ink/80 leading-relaxed">
                  "{resolved.why_it_works}"
                </p>
              )}

              {resolved.best_for && resolved.best_for.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {resolved.best_for.map((b) => (
                    <span
                      key={b}
                      className="text-[0.62rem] tracking-[0.22em] uppercase border border-ink/25 text-ink/70 px-2.5 py-1"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-border/50 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  to={resolved.legacy_day_path ?? card.legacy_day}
                  className="inline-flex items-center gap-2 eyebrow text-[0.65rem] tracking-[0.3em] text-gold hover:text-ink border-b border-gold/60 hover:border-ink pb-1"
                >
                  Shop the Full Look <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/portofino"
                  className="eyebrow text-[0.62rem] tracking-[0.3em] text-ink/60 hover:text-gold"
                >
                  ← All six moments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTINUE THE JOURNEY */}
      {nextMoment && (
        <section className="bg-cream border-t border-border/40">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 py-14 md:py-20 text-center">
            <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
              Continue the Journey
            </span>
            <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3">
              {nextMoment.moment_name}
            </h3>
            <p className="font-serif italic text-[1rem] md:text-[1.1rem] text-ink/70 mt-3 max-w-xl mx-auto leading-relaxed">
              {nextMoment.narrative}
            </p>
            <Link
              to="/portofino/$moment"
              params={{ moment: nextMoment.moment_slug }}
              className="mt-6 inline-flex items-center gap-2 eyebrow text-[0.7rem] tracking-[0.3em] bg-gold text-ivory px-8 py-4 hover:bg-ink transition-colors"
            >
              Continue to {nextMoment.moment_name} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}