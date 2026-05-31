import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, ShoppingBag } from "lucide-react";
import { useEffect, useMemo } from "react";
import { absoluteUrl } from "@/lib/site";
import { trackOutbound } from "@/lib/utils";
import {
  isLookSlug,
  isTierSlug,
  LOOK_SLUG_LABEL,
  persistTier,
  TIER_LABEL,
  TIER_SLUGS,
  type LookSlug,
  type TierSlug,
} from "@/lib/portofino-spec";
import {
  findLook,
  formatUsd,
  LOOK_CATEGORY_LABEL,
  LOOK_CATEGORY_ORDER,
  priceTotalFor,
  type Look,
  type LookCategory,
  type LookProduct,
} from "@/data/lookbook";

type Search = { tier: TierSlug };
type DaySlug = Look["daySlug"];

function isDaySlug(v: string): v is DaySlug {
  return v === "day-1" || v === "day-2" || v === "day-3" || v === "day-4" || v === "day-5";
}

export const Route = createFileRoute("/portofino/day-$day/look-$look")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    tier: isTierSlug(search.tier) ? search.tier : "luxury",
  }),
  head: () => ({
    meta: [
      { title: "Shop the Full Look — Portofino · Resort Edit" },
      {
        name: "description",
        content:
          "A complete editorial look — outfit, shoes, bag, jewelry, sunglasses, hair and layer — each piece linked to its exact affiliate product.",
      },
      { property: "og:url", content: absoluteUrl("/portofino") },
    ],
  }),
  component: ViewFullLookPage,
});

function ViewFullLookPage() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const day = params.day as string;
  const look = params.look as string;
  const tier: TierSlug = isTierSlug(search.tier) ? search.tier : "luxury";

  if (!isDaySlug(day) || !isLookSlug(look)) throw notFound();

  const lookData = findLook(day, look as LookSlug);
  if (!lookData) throw notFound();

  useEffect(() => {
    persistTier(tier);
  }, [tier]);

  const activeTier = lookData.tiers[tier];
  const products = activeTier.products;
  const totalsByTier = useMemo(() => {
    const out = {} as Record<TierSlug, number>;
    for (const t of TIER_SLUGS) out[t] = priceTotalFor(lookData.tiers[t].products);
    return out;
  }, [lookData]);

  const shoppableCount = LOOK_CATEGORY_ORDER.filter(
    (c) => !products[c].isPlaceholder,
  ).length;

  return (
    <div className="bg-ivory min-h-screen pb-28 md:pb-16">
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-6 md:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 eyebrow text-[0.6rem] tracking-[0.3em] text-ink/60">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="text-ink/30">/</span>
            <Link to="/portofino" search={{ tier }} className="hover:text-gold transition-colors">
              Portofino
            </Link>
            <span className="text-ink/30">/</span>
            <span className="text-ink/80">{lookData.day}</span>
            <span className="text-ink/30">/</span>
            <span className="text-gold">{lookData.lookLabel}</span>
          </nav>
          <Link
            to="/portofino"
            search={{ tier }}
            className="inline-flex items-center gap-2 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Edit
          </Link>
        </div>
      </div>

      {/* HERO: LEFT image + title, RIGHT shopping grid */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-6 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-8 lg:gap-12 items-start">
          {/* LEFT — Look image + occasion copy */}
          <div className="lg:sticky lg:top-6">
            <div className="relative overflow-hidden rounded-[14px] bg-muted border border-border/50 shadow-[0_20px_60px_-30px_rgba(60,30,10,0.25)] aspect-[4/5]">
              <img
                src={lookData.heroImage}
                alt={`${lookData.day} · ${lookData.lookLabel} — ${lookData.title}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/0" />
              <div className="absolute top-4 left-4 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2.5 py-1 rounded-full">
                {TIER_LABEL[tier].toUpperCase()} EDIT
              </div>
              <div className="absolute left-5 right-5 bottom-5 text-ivory">
                <p className="eyebrow tracking-[0.32em] text-[0.6rem] text-ivory/85">
                  {lookData.day.toUpperCase()} · {lookData.lookLabel.toUpperCase()}
                </p>
                <h1 className="font-display text-3xl md:text-4xl xl:text-5xl leading-[1.05] tracking-[0.04em] mt-2">
                  {lookData.title}
                </h1>
                <p className="font-serif italic text-[0.95rem] md:text-base text-ivory/90 mt-2 max-w-md">
                  {lookData.subtitle}
                </p>
              </div>
            </div>
            <p className="font-serif text-[0.95rem] text-ink/75 leading-relaxed mt-5">
              {lookData.caption}
            </p>
          </div>

          {/* RIGHT — Shopping grid */}
          <div>
            <header className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow tracking-[0.3em] text-[0.6rem] text-gold">
                  Shop the full look
                </span>
                <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink mt-2">
                  {LOOK_CATEGORY_ORDER.length} pieces · {shoppableCount} live now
                </h2>
              </div>
              <span className="font-display text-2xl md:text-3xl text-ink tracking-[0.04em]">
                {formatUsd(totalsByTier[tier])}
              </span>
            </header>

            {/* Tier toggle */}
            <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 bg-ivory border border-border/60 rounded-full">
              {TIER_SLUGS.map((t) => {
                const active = t === tier;
                return (
                  <Link
                    key={t}
                    to="/portofino/day-$day/look-$look"
                    params={{ day, look }}
                    search={{ tier: t }}
                    replace
                    className={
                      "text-center eyebrow tracking-[0.22em] text-[0.55rem] py-2 rounded-full transition-colors " +
                      (active
                        ? "bg-gold text-ink font-semibold"
                        : "text-ink/70 hover:text-gold")
                    }
                  >
                    {TIER_LABEL[t].toUpperCase()}
                  </Link>
                );
              })}
            </div>

            {/* Category-organised product grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LOOK_CATEGORY_ORDER.map((cat) => (
                <ProductCategoryCard
                  key={cat}
                  category={cat}
                  product={products[cat]}
                />
              ))}
            </div>

            {/* Tier compare strip */}
            <div className="mt-8 grid grid-cols-3 gap-2">
              {TIER_SLUGS.map((t) => {
                const active = t === tier;
                return (
                  <Link
                    key={t}
                    to="/portofino/day-$day/look-$look"
                    params={{ day, look }}
                    search={{ tier: t }}
                    replace
                    className={
                      "rounded-[10px] border p-3 text-center transition-colors " +
                      (active
                        ? "bg-gold/15 border-gold"
                        : "bg-cream/60 border-border/60 hover:border-gold")
                    }
                  >
                    <p className="eyebrow tracking-[0.28em] text-[0.55rem] text-gold">
                      {TIER_LABEL[t].toUpperCase()}
                    </p>
                    <p className="font-display text-lg text-ink mt-1 tracking-[0.04em]">
                      {formatUsd(totalsByTier[t])}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ivory/95 backdrop-blur border-t border-border/60 px-4 py-3 flex items-center gap-3 shadow-[0_-10px_30px_-15px_rgba(60,30,10,0.25)]">
        <div className="flex-1">
          <p className="eyebrow tracking-[0.22em] text-[0.55rem] text-ink/60">
            {TIER_LABEL[tier]} total
          </p>
          <p className="font-display text-lg text-ink leading-none">
            {formatUsd(totalsByTier[tier])}
          </p>
        </div>
        <a
          href="#shopping-grid"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-gold text-ink eyebrow tracking-[0.2em] text-[0.65rem] font-semibold"
        >
          <ShoppingBag className="w-4 h-4" /> Shop {shoppableCount} pieces
        </a>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Product card — single component for every category
// ──────────────────────────────────────────────────────────────
function ProductCategoryCard({
  category,
  product,
}: {
  category: LookCategory;
  product: LookProduct;
}) {
  const label = LOOK_CATEGORY_LABEL[category];

  if (product.isPlaceholder) {
    return (
      <article className="flex flex-col bg-cream/60 border border-dashed border-border/60 rounded-[12px] p-4 min-h-[260px]">
        <p className="eyebrow tracking-[0.28em] text-[0.55rem] text-gold">{label}</p>
        <div className="mt-3 flex-1 flex items-center justify-center text-center px-2">
          <p className="font-serif italic text-[0.85rem] text-ink/55 leading-relaxed">
            {product.title}
          </p>
        </div>
        <p className="mt-3 eyebrow tracking-[0.22em] text-[0.5rem] text-ink/45 text-center">
          Not available through approved affiliate partners
        </p>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-ivory border border-border/60 rounded-[12px] p-3 hover:border-gold/70 transition-colors min-h-[260px]">
      <div className="flex items-center justify-between">
        <p className="eyebrow tracking-[0.28em] text-[0.55rem] text-gold">{label}</p>
        {product.replaced && (
          <span className="eyebrow text-[0.5rem] tracking-[0.2em] text-gold bg-cream border border-gold/50 px-1.5 py-px rounded">
            Updated
          </span>
        )}
      </div>

      <a
        href={product.url!}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() =>
          trackOutbound({ brand: product.brand, item: product.title, href: product.url! })
        }
        className="mt-3 relative aspect-square w-full bg-cream border border-border/60 rounded-[10px] overflow-hidden flex items-center justify-center"
      >
        <img
          src={product.image!}
          alt={`${product.brand} ${product.title}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </a>

      <div className="mt-3 flex flex-col flex-1">
        <p className="font-serif text-[0.92rem] text-ink leading-snug">{product.brand}</p>
        <p className="font-serif text-[0.82rem] text-ink/70 leading-snug line-clamp-2">
          {product.title}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="font-display text-base text-ink tracking-[0.03em]">{product.price}</span>
          <a
            href={product.url!}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackOutbound({ brand: product.brand, item: product.title, href: product.url! })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold text-ink eyebrow tracking-[0.2em] text-[0.55rem] hover:bg-gold/85 transition-colors"
          >
            Shop <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}