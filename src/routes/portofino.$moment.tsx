import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { getPortofinoMoment } from "@/lib/portofino-moments.functions";
import {
  getPortofinoMomentDef,
  PORTOFINO_MOMENT_DEFS,
} from "@/lib/portofino-moment-fallbacks";
import { absoluteUrl } from "@/lib/site";
import { findLook, LOOK_CATEGORY_LABEL, LOOK_CATEGORY_ORDER, type LookProduct } from "@/data/lookbook";
import { lookOverrideFor, type OverrideItem } from "@/data/lookOverrides";
import { trackOutbound } from "@/lib/utils";
import { TIER_SLUGS } from "@/lib/portofino-spec";
import { getCanonicalDayImage, useDayImageOverrides } from "@/data/dayImageRegistry";
import editD1aAdditional from "@/assets/generated/resort-edit/edit-d1-a-card-thumb.jpg";

const beachLongLunchDefault = getCanonicalDayImage("day-2", "destination_card");

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
  // "Other Moments in Portofino" — the six canonical moments minus this page.
  const otherMoments = PORTOFINO_MOMENT_DEFS.filter((m) => m.moment_slug !== slug);
  const dayOverrides = useDayImageOverrides();
  const beachLongLunchImage = dayOverrides["day-2"] ?? beachLongLunchDefault;
  type SiblingLook =
    | { title: string; image: string; to: "/portofino/$day/$look"; params: { day: string; look: string } }
    | { title: string; image: string; to: "/portofino/day-3"; params?: undefined };
  const siblingLooks: SiblingLook[] =
    slug === "pool-lounging-shopping"
      ? [
          {
            title: "Beach Club + Long Lunch",
            image: beachLongLunchImage,
            to: "/portofino/$day/$look",
            params: { day: "day-2", look: "look-a" },
          },
          {
            title: "Exploring the Harbor",
            image: editD1aAdditional,
            to: "/portofino/day-3",
          },
        ]
      : [];

  // Resolve the canonical shoppable Look from the lookbook.
  const look = findLook(card.legacy_day_slug, card.look_slug);
  const override = look ? lookOverrideFor(card.legacy_day_slug, card.look_slug) : null;

  // Prefer the override product set if defined; otherwise pick the first
  // tier that actually has sourced products. The look_slug guarantees a
  // dedicated product set per moment.
  let shopProducts: Array<{ category?: string; product: LookProduct | OverrideItem; kind: "category" | "override" }> = [];
  if (override) {
    shopProducts = override.main.map((p) => ({ product: p, kind: "override" as const }));
  } else if (look) {
    const firstTierSlug =
      TIER_SLUGS.find((t) =>
        LOOK_CATEGORY_ORDER.some((c) => !look.tiers[t].products[c].isPlaceholder),
      ) ?? TIER_SLUGS[0];
    const products = look.tiers[firstTierSlug].products;
    shopProducts = LOOK_CATEGORY_ORDER.map((c) => ({
      category: LOOK_CATEGORY_LABEL[c],
      product: products[c],
      kind: "category" as const,
    }));
  }

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

      {/* SHOP THIS LOOK — inline product grid; no off-page handoff */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.85fr)_1.4fr] gap-8 md:gap-12 items-start">
            <div className="lg:sticky lg:top-6 space-y-5">
              <div className="relative aspect-[3/4] overflow-hidden bg-cream/40 border border-border/60 flex items-center justify-center">
                <img
                  src={resolved.image}
                  alt={resolved.title}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                {resolved.source === "tagged" ? "Resort Edit Look" : "Editor's Pick"}
              </span>
              <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink leading-tight">
                {card.moment_name}
              </h2>
              <p className="font-serif italic text-[0.95rem] text-ink/80 leading-relaxed">
                {card.narrative}
              </p>
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
            </div>

            <div>
              <div className="flex items-end justify-between border-b border-ink/15 pb-5">
                <div>
                  <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">Shop This Look</span>
                  <h3 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink mt-2">
                    This Full Outfit →
                  </h3>
                </div>
                <span className="font-serif text-[0.85rem] text-ink/55 hidden md:inline">
                  {shopProducts.filter((p) => (p.kind === "override" ? true : !(p.product as LookProduct).isPlaceholder)).length} pieces
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {shopProducts.map((entry, i) => (
                  <ShopCard key={i} entry={entry} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OTHER MOMENTS IN PORTOFINO — unified canonical strip */}
      {siblingLooks.length > 0 && (
        <section className="bg-ivory border-t border-border/40">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-14 md:py-16">
            <div className="mb-8">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                MORE WAYS TO DRESS FOR PORTOFINO
              </span>
              <h3 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink mt-2">
                Other Looks for the Day
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {siblingLooks.map((l) => (
                <Link
                  key={l.title}
                  to={l.to}
                  params={l.params as never}
                  className="group flex flex-col bg-ivory border border-border/40 hover:border-gold transition-colors"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                    <img
                      src={l.image}
                      alt={`${l.title} — Portofino additional look`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
                      ADDITIONAL LOOK
                    </span>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <h4 className="font-display text-xl md:text-2xl tracking-[0.04em] text-ink leading-tight">
                      {l.title}
                    </h4>
                    <span className="mt-4 inline-flex items-center gap-2 eyebrow text-[0.62rem] tracking-[0.3em] text-gold group-hover:text-ink border-b border-gold/60 group-hover:border-ink pb-1 self-start">
                      Get The Look <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {otherMoments.length > 0 && (
        <section className="bg-cream border-y border-border/40">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-14 md:py-16">
            <div className="mb-8">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                MORE PORTOFINO LOOKS
              </span>
              <h3 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink mt-2">
                Other Moments in Portofino
              </h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {otherMoments.map((m) => (
                <Link
                  key={m.moment_slug}
                  to="/portofino/$moment"
                  params={{ moment: m.moment_slug }}
                  className="group flex flex-col bg-ivory border border-border/40 hover:border-gold transition-colors"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                    <img
                      src={m.moment_card_image}
                      alt={m.moment_name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-gold">
                      Portofino Moment
                    </span>
                    <h4 className="font-display text-base md:text-lg tracking-[0.03em] text-ink mt-1.5 group-hover:text-gold transition-colors">
                      {m.moment_name}
                    </h4>
                    <span className="mt-2 inline-flex items-center gap-1.5 eyebrow text-[0.58rem] tracking-[0.32em] text-ink/60 group-hover:text-gold">
                      VIEW MOMENT <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ShopCard({
  entry,
}: {
  entry: { category?: string; product: LookProduct | OverrideItem; kind: "category" | "override" };
}) {
  const { product, kind, category } = entry;

  if (kind === "category") {
    const p = product as LookProduct;
    if (p.isPlaceholder || !p.url || !p.image) {
      return (
        <div className="flex flex-col bg-ivory border border-border/60 h-full" aria-disabled="true">
          <div className="relative aspect-square bg-cream flex items-center justify-center px-3 text-center">
            {category && (
              <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.3em] text-gold/80">
                {category}
              </span>
            )}
            <span className="font-serif italic text-ink/60 text-[0.72rem] leading-snug">
              {p.brand} — {p.title}
            </span>
          </div>
          <div className="p-3">
            <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/55">
              Not available through approved affiliate partners
            </span>
          </div>
        </div>
      );
    }
    return (
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackOutbound({ brand: p.brand, item: p.title, href: p.url! })}
        className="group flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors h-full"
      >
        <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
          <img
            src={p.image}
            alt={`${p.brand} ${p.title}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {category && (
            <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.3em] text-gold bg-ivory/85 px-1.5 py-0.5">
              {category}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 p-4">
          <div className="eyebrow text-ink text-[0.6rem] tracking-[0.32em]">{p.brand}</div>
          <div className="font-serif italic text-ink/90 text-[0.92rem] leading-snug mt-1.5 line-clamp-2">
            {p.title}
          </div>
          <div className="font-serif text-gold text-[0.9rem] mt-1.5">{p.price}</div>
          <div className="mt-auto pt-3">
            <span className="eyebrow text-[0.6rem] tracking-[0.35em] text-ink group-hover:text-gold transition-colors">
              SHOP →
            </span>
          </div>
        </div>
      </a>
    );
  }

  // Override item (free-form curated grid)
  const o = product as OverrideItem;
  const isPlaceholderUrl = !o.url || o.url.startsWith("AFF-");
  if (isPlaceholderUrl) {
    return (
      <div
        className="flex flex-col bg-ivory border border-border/60 h-full"
        aria-disabled="true"
      >
        <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
          {o.image && (
            <img
              src={o.image}
              alt={`${o.brand} ${o.title}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-4"
            />
          )}
          {o.slotLabel && (
            <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.3em] text-gold bg-ivory/85 px-1.5 py-0.5">
              {o.slotLabel}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 p-4">
          <div className="eyebrow text-ink text-[0.6rem] tracking-[0.32em]">{o.brand}</div>
          <div className="font-serif italic text-ink/90 text-[0.92rem] leading-snug mt-1.5 line-clamp-2">
            {o.title}
          </div>
          <div className="mt-auto pt-3">
            <span className="eyebrow text-[0.6rem] tracking-[0.35em] text-ink/55">
              COMING SOON
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <a
      href={o.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackOutbound({ brand: o.brand, item: o.title, href: o.url })}
      className="group flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
        {o.image && (
          <img
            src={o.image}
            alt={`${o.brand} ${o.title}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        {o.slotLabel && (
          <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.3em] text-gold bg-ivory/85 px-1.5 py-0.5">
            {o.slotLabel}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4">
        <div className="eyebrow text-ink text-[0.6rem] tracking-[0.32em]">{o.brand}</div>
        <div className="font-serif italic text-ink/90 text-[0.92rem] leading-snug mt-1.5 line-clamp-2">
          {o.title}
        </div>
        <div className="mt-auto pt-3">
          <span className="eyebrow text-[0.6rem] tracking-[0.35em] text-ink group-hover:text-gold transition-colors">
            SHOP →
          </span>
        </div>
      </div>
    </a>
  );
}
