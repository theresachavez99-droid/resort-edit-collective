import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Hand,
  Heart,
  MapPin,
  Shirt,
  ShoppingBag,
  Sun,
  Tag,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { absoluteUrl } from "@/lib/site";
import { trackOutbound } from "@/lib/utils";
import {
  isLookSlug,
  isTierSlug,
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
  lookbook,
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

  const shoppableCount = LOOK_CATEGORY_ORDER.filter((c) => !products[c].isPlaceholder).length;

  const flatIndex = lookbook.findIndex((l) => l.daySlug === day && l.lookSlug === look);
  const prevLook = flatIndex > 0 ? lookbook[flatIndex - 1] : null;
  const nextLook =
    flatIndex >= 0 && flatIndex < lookbook.length - 1 ? lookbook[flatIndex + 1] : null;

  return (
    <div className="bg-ivory min-h-screen pb-16">
      {/* TOP BAR — breadcrumb + prev/next */}
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8 pt-6 md:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 font-serif text-[0.85rem] text-ink/55">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-ink/30" />
            <Link to="/portofino" search={{ tier }} className="hover:text-gold transition-colors">
              5 Days in Portofino
            </Link>
            <ChevronRight className="w-3 h-3 text-ink/30" />
            <span className="text-ink/65">{lookData.day}</span>
            <ChevronRight className="w-3 h-3 text-ink/30" />
            <span className="text-gold">View Full Look</span>
          </nav>
          <div className="flex items-center gap-4 text-[0.85rem]">
            {prevLook ? (
              <Link
                to="/portofino/day-$day/look-$look"
                params={{ day: prevLook.daySlug, look: prevLook.lookSlug }}
                search={{ tier }}
                className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev Look
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-ink/25">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev Look
              </span>
            )}
            <span className="text-ink/25">|</span>
            {nextLook ? (
              <Link
                to="/portofino/day-$day/look-$look"
                params={{ day: nextLook.daySlug, look: nextLook.lookSlug }}
                search={{ tier }}
                className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
              >
                Next Look <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-ink/25">
                Next Look <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* HERO TWO-COLUMN */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-8 pt-6 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
          {/* LEFT — Editorial image + copy */}
          <div>
            <div className="relative overflow-hidden bg-muted aspect-[4/5]">
              <img
                src={lookData.heroImage}
                alt={`${lookData.day} · ${lookData.title}`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "center center" }}
              />
            </div>

            <p className="eyebrow tracking-[0.32em] text-[0.7rem] text-gold mt-6">
              {lookData.day.toUpperCase()}
            </p>
            <h1 className="font-display text-3xl md:text-4xl xl:text-[2.6rem] leading-[1.05] tracking-[0.04em] text-ink mt-3 uppercase">
              {lookData.title}
            </h1>
            <p className="font-serif text-[1rem] text-ink/70 leading-relaxed mt-5 max-w-md">
              {lookData.caption}
            </p>

            <ul className="mt-6 space-y-2.5 font-serif text-[0.95rem] text-ink/75">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-ink/55" /> {lookData.destination}, Italy
              </li>
              <li className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-ink/55" /> {lookData.subtitle}
              </li>
              <li className="flex items-center gap-2.5">
                <Shirt className="w-4 h-4 text-ink/55" /> {lookData.lookLabel}
              </li>
            </ul>

            {/* SHOP THE FULL LOOK card */}
            <div className="mt-8 border border-gold/50 p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border border-gold/60 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="eyebrow tracking-[0.28em] text-[0.7rem] text-ink font-semibold">
                  SHOP THE FULL LOOK
                </p>
                <p className="font-serif text-[0.85rem] text-ink/70 mt-1 leading-snug">
                  {shoppableCount} hand-picked pieces to complete your {lookData.destination} look.
                </p>
                <a
                  href="#full-look-grid"
                  className="inline-block mt-3 border border-gold px-4 py-2 eyebrow tracking-[0.28em] text-[0.65rem] text-gold hover:bg-gold hover:text-ivory transition-colors"
                >
                  ADD ALL TO WISHLIST
                </a>
              </div>
              <button
                type="button"
                aria-label="Save look"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-ink/50 hover:text-gold hover:border-gold transition-colors"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — Product grid */}
          <div id="full-look-grid">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-3xl md:text-[2.1rem] tracking-[0.05em] text-ink uppercase">
                  The Full Look
                </h2>
                <p className="font-serif text-[0.95rem] text-ink/55 mt-1">
                  {shoppableCount} curated pieces
                </p>
              </div>
              <span className="font-display text-xl md:text-2xl text-ink tracking-[0.04em]">
                {formatUsd(totalsByTier[tier])}
              </span>
            </div>

            {/* Tier toggle (compact) */}
            <div className="mt-4 inline-flex border border-border">
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
                      "px-3 py-1.5 eyebrow tracking-[0.22em] text-[0.55rem] transition-colors " +
                      (active ? "bg-ink text-ivory" : "bg-ivory text-ink/65 hover:text-ink")
                    }
                  >
                    {TIER_LABEL[t].toUpperCase()}
                  </Link>
                );
              })}
            </div>

            {/* 4-col card grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {LOOK_CATEGORY_ORDER.map((cat) => (
                <ProductCategoryCard key={cat} category={cat} product={products[cat]} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNAL ROW */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-8 mt-16 md:mt-20 border-t border-border/60 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {[
            { Icon: ShoppingBag, title: "Hand-picked pieces", body: "for your itinerary" },
            { Icon: Hand, title: "Mix & match", body: "for any occasion" },
            { Icon: Tag, title: "Luxury & affordable", body: "options included" },
            { Icon: ExternalLink, title: "Direct links open", body: "in new tabs" },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-ink/60 mt-0.5 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="font-serif text-[0.95rem] text-ink leading-snug">{title}</p>
                <p className="font-serif text-[0.9rem] text-ink/55 leading-snug">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOVE THIS LOOK */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-8 mt-10">
        <div className="border border-border/60 bg-ivory p-4 md:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
          <div className="w-full sm:w-44 aspect-[4/3] sm:aspect-[5/3] overflow-hidden bg-muted shrink-0">
            <img src={lookData.heroImage} alt="" aria-hidden className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="eyebrow tracking-[0.28em] text-[0.75rem] text-ink font-semibold uppercase">
              Love this look?
            </p>
            <p className="font-serif text-[0.95rem] text-ink/65 mt-1">
              Browse more looks from all 5 days in {lookData.destination}.
            </p>
          </div>
          <Link
            to="/portofino"
            search={{ tier }}
            className="self-start sm:self-center bg-gold text-ivory px-5 py-3 eyebrow tracking-[0.28em] text-[0.7rem] hover:bg-ink transition-colors"
          >
            VIEW ALL DAYS
          </Link>
        </div>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Product card — matches reference: image, brand, name, price, SHOP PRODUCT
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
      <article className="flex flex-col bg-cream/40 border border-dashed border-border/60 min-h-[360px]">
        <div className="px-3 pt-3">
          <p className="eyebrow tracking-[0.28em] text-[0.55rem] text-ink/45">{label}</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="font-serif italic text-[0.85rem] text-ink/50 leading-relaxed">
            {product.title}
          </p>
        </div>
        <p className="px-3 pb-3 eyebrow tracking-[0.22em] text-[0.5rem] text-ink/40 text-center">
          Not available through approved affiliate partners
        </p>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-ivory border border-border/40 hover:border-gold/60 transition-colors">
      <a
        href={product.url!}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() =>
          trackOutbound({ brand: product.brand, item: product.title, href: product.url! })
        }
        className="relative aspect-square w-full bg-cream/40 overflow-hidden flex items-center justify-center"
      >
        <img
          src={product.image!}
          alt={`${product.brand} ${product.title}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.replaced && (
          <span className="absolute top-2 right-2 eyebrow text-[0.5rem] tracking-[0.2em] text-gold bg-ivory/95 border border-gold/50 px-1.5 py-px">
            UPDATED
          </span>
        )}
      </a>

      <div className="p-3 md:p-4 flex flex-col flex-1">
        <p className="eyebrow tracking-[0.22em] text-[0.6rem] text-ink font-semibold uppercase leading-snug line-clamp-2">
          {product.brand}
        </p>
        <p className="font-serif text-[0.92rem] text-ink/70 leading-snug mt-1.5 line-clamp-2 min-h-[2.6em]">
          {product.title}
        </p>
        <p className="font-serif text-[0.95rem] text-ink mt-2">{product.price}</p>

        <a
          href={product.url!}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() =>
            trackOutbound({ brand: product.brand, item: product.title, href: product.url! })
          }
          className="mt-3 inline-flex items-center justify-center bg-ink text-ivory py-2.5 eyebrow tracking-[0.28em] text-[0.6rem] hover:bg-gold transition-colors"
          aria-label={`Shop ${product.brand} ${product.title} (opens in new tab)`}
        >
          SHOP PRODUCT
        </a>
        <span className="sr-only">Category: {label}</span>
      </div>
    </article>
  );
}
