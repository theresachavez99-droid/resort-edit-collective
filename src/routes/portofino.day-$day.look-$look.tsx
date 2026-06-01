import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MapPin, Shirt, Sun } from "lucide-react";
import { useEffect, useMemo } from "react";
import { absoluteUrl } from "@/lib/site";
import { trackOutbound } from "@/lib/utils";
import { NewsletterForm } from "@/components/NewsletterForm";
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
  LOOK_CATEGORY_LABEL,
  LOOK_CATEGORY_ORDER,
  lookbook,
  type Look,
  type LookCategory,
  type LookProduct,
} from "@/data/lookbook";
import { lookEditorialFor } from "@/data/lookEditorial";

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
  const shoppableCount = useMemo(
    () => LOOK_CATEGORY_ORDER.filter((c) => !products[c].isPlaceholder).length,
    [products],
  );
  const editorial = lookEditorialFor(day, look);

  const flatIndex = lookbook.findIndex((l) => l.daySlug === day && l.lookSlug === look);
  const prevLook = flatIndex > 0 ? lookbook[flatIndex - 1] : null;
  const nextLook =
    flatIndex >= 0 && flatIndex < lookbook.length - 1 ? lookbook[flatIndex + 1] : null;

  return (
    <div className="bg-ivory min-h-screen pb-24">
      {/* TOP BAR — breadcrumb + prev/next */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-10 pt-6 md:pt-8">
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

      {/* ───────────────────────── SECTION 1 · EDITORIAL HERO ───────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-10 pt-10 md:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] gap-12 lg:gap-20 items-start">
          {/* LEFT — Full-bleed editorial muse */}
          <figure className="relative overflow-hidden bg-muted aspect-[4/5] lg:aspect-[4/5.4]">
            <img
              src={lookData.heroImage}
              alt={`${lookData.day} · ${lookData.title}`}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "center center" }}
            />
          </figure>

          {/* RIGHT — Editorial copy */}
          <div className="lg:pt-6">
            <p className="eyebrow tracking-[0.42em] text-[0.7rem] text-gold">
              {lookData.day.toUpperCase()}
            </p>
            <h1 className="font-display text-[2.1rem] md:text-[3rem] xl:text-[3.4rem] leading-[1.02] tracking-[0.03em] text-ink mt-5 uppercase">
              {lookData.title}
            </h1>

            {editorial?.mood && (
              <p className="font-serif italic text-[1.15rem] md:text-[1.2rem] text-ink/75 leading-[1.55] mt-6 max-w-[36rem]">
                {editorial.mood}
              </p>
            )}

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-serif text-[0.92rem] text-ink/70">
              <li className="inline-flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-ink/45" strokeWidth={1.5} />
                {lookData.destination}, Italy
              </li>
              <li className="text-ink/25">·</li>
              <li className="inline-flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-ink/45" strokeWidth={1.5} />
                {lookData.subtitle}
              </li>
              <li className="text-ink/25">·</li>
              <li className="inline-flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-ink/45" strokeWidth={1.5} />
                {lookData.lookLabel}
              </li>
            </ul>

            {editorial?.whyWeChose && (
              <div className="mt-10 border-t border-ink/15 pt-8 max-w-[36rem]">
                <p className="eyebrow tracking-[0.4em] text-[0.65rem] text-ink/60">
                  WHY WE CHOSE THIS LOOK
                </p>
                <p className="font-serif text-[1.02rem] text-ink/80 leading-[1.7] mt-4">
                  {editorial.whyWeChose}
                </p>
              </div>
            )}

            {/* Tier toggle — discreet, editorial */}
            <div className="mt-10 flex items-center gap-3">
              <span className="eyebrow tracking-[0.32em] text-[0.6rem] text-ink/45">TIER</span>
              <div className="inline-flex">
                {TIER_SLUGS.map((t, i) => {
                  const active = t === tier;
                  return (
                    <Link
                      key={t}
                      to="/portofino/day-$day/look-$look"
                      params={{ day, look }}
                      search={{ tier: t }}
                      replace
                      className={
                        "px-3 py-1 eyebrow tracking-[0.28em] text-[0.6rem] transition-colors " +
                        (i > 0 ? "border-l border-ink/15 " : "") +
                        (active ? "text-ink" : "text-ink/40 hover:text-ink/70")
                      }
                    >
                      {TIER_LABEL[t].toUpperCase()}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── SECTION 2 · COMPLETE THE LOOK ───────────────────────── */}
      <section id="full-look-grid" className="mx-auto max-w-[1400px] px-4 sm:px-10 mt-24 md:mt-32">
        <header className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-[1.7rem] md:text-[2.2rem] tracking-[0.18em] text-ink uppercase">
            Complete the Look
          </h2>
          <p className="font-serif italic text-[1rem] text-ink/55 mt-3">
            Curated piece by piece.
          </p>
          <p className="font-serif text-[0.85rem] text-ink/45 mt-1">
            {shoppableCount} pieces · {lookData.destination}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14 md:gap-x-10 md:gap-y-16">
          {LOOK_CATEGORY_ORDER.map((cat) => (
            <ProductCategoryCard key={cat} category={cat} product={products[cat]} />
          ))}
        </div>
      </section>

      {/* ───────────────────────── BOTTOM · GET THE NEXT EDIT ───────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-10 mt-28 md:mt-36">
        <div className="border-t border-ink/15 pt-14 grid grid-cols-1 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)] gap-8 md:gap-12 items-center">
          <figure className="w-full aspect-[4/5] md:aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={lookData.heroImage}
              alt=""
              aria-hidden
              className="h-full w-full object-cover"
            />
          </figure>
          <div className="max-w-xl">
            <p className="eyebrow tracking-[0.42em] text-[0.7rem] text-gold">THE LIST</p>
            <h3 className="font-display text-[1.7rem] md:text-[2.1rem] tracking-[0.04em] text-ink uppercase mt-3">
              Get the Next Edit
            </h3>
            <p className="font-serif text-[1rem] text-ink/65 mt-4 leading-relaxed">
              Destination dressing delivered occasionally.
            </p>
            <div className="mt-6">
              <NewsletterForm
                ctaSource="view-full-look-bottom"
                variant="inline-light"
                buttonLabel="Get the Next Edit"
                placeholder="Email address"
              />
            </div>
            <p className="font-serif text-[0.78rem] text-ink/45 mt-4 leading-relaxed">
              Join for destination edits, hotel finds, and destination dressing inspiration.
              Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Product card — editorial: image-led, generous whitespace,
// brand · name · price · Shop link. No borders, no chrome.
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
      <article className="flex flex-col">
        <div className="aspect-[4/5] w-full bg-cream/40 flex items-center justify-center px-6 text-center">
          <p className="font-serif italic text-[0.92rem] text-ink/55 leading-relaxed">
            {product.title}
          </p>
        </div>
        <div className="mt-5 text-center">
          <p className="eyebrow tracking-[0.32em] text-[0.6rem] text-ink/45">{label}</p>
          <p className="font-serif italic text-[0.78rem] text-ink/40 mt-2 leading-snug">
            Sourcing in progress
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <a
        href={product.url!}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() =>
          trackOutbound({ brand: product.brand, item: product.title, href: product.url! })
        }
        className="relative aspect-[4/5] w-full bg-cream/30 overflow-hidden flex items-center justify-center"
      >
        <img
          src={product.image!}
          alt={`${product.brand} ${product.title}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-6 md:p-8 transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {product.replaced && (
          <span className="absolute top-3 right-3 eyebrow text-[0.5rem] tracking-[0.24em] text-gold bg-ivory/95 px-1.5 py-px">
            UPDATED
          </span>
        )}
      </a>

      <div className="pt-5 flex flex-col items-center text-center">
        <p className="eyebrow tracking-[0.3em] text-[0.58rem] text-ink/45">{label}</p>
        <p className="eyebrow tracking-[0.24em] text-[0.7rem] text-ink uppercase mt-2 leading-snug">
          {product.brand}
        </p>
        <p className="font-serif italic text-[0.95rem] text-ink/75 leading-snug mt-1.5 max-w-[16rem]">
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
          className="mt-4 eyebrow tracking-[0.32em] text-[0.62rem] text-ink border-b border-ink/40 hover:border-gold hover:text-gold transition-colors pb-0.5"
          aria-label={`Shop ${product.brand} ${product.title} (opens in new tab)`}
        >
          SHOP
        </a>
      </div>
    </article>
  );
}
