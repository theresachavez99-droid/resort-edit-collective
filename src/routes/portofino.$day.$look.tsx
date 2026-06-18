import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, MapPin, Shirt, ShoppingBag, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { absoluteUrl } from "@/lib/site";
import { trackOutbound } from "@/lib/utils";
import { NewsletterForm } from "@/components/NewsletterForm";
import { MoreLikeThis } from "@/components/MoreLikeThis";
import {
  isLookSlug,
  type LookSlug,
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
import {
  alternativesFor,
  type AlternativeProduct,
} from "@/data/lookAlternatives";
import { lookOverrideFor, type OverrideItem } from "@/data/lookOverrides";
import {
  CUSTOMIZE_OPTIONS,
  enrichmentFor,
  HOTEL_DETAILS,
} from "@/data/lookEnrichment";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";

const HOTEL_IMAGES = {
  splendido: hotelSplendido,
  eight: hotelEight,
  piccolo: hotelPiccolo,
} as const;

const DAY_NEXT: Record<string, { day: string; title: string; daySlug: "day-1" | "day-2" | "day-3" | "day-4" | "day-5" }> = {
  "day-1": { day: "Day 2", title: "Beach Club & Long Lunches", daySlug: "day-2" },
  "day-2": { day: "Day 3", title: "Pool Lounging & Shopping", daySlug: "day-3" },
  "day-3": { day: "Day 4", title: "Sunset Cocktails & Dinner", daySlug: "day-4" },
  "day-4": { day: "Day 5", title: "Market Strolls & Coastal Goodbyes", daySlug: "day-5" },
};

type DaySlug = Look["daySlug"];

function isDaySlug(v: string): v is DaySlug {
  return v === "day-1" || v === "day-2" || v === "day-3" || v === "day-4" || v === "day-5";
}

export const Route = createFileRoute("/portofino/$day/$look")({
  // Tier query params were removed. Strip any legacy ?tier=... so URLs stay clean.
  validateSearch: (search: Record<string, unknown>): Record<string, never> => {
    if (search && "tier" in search) {
      // Returning an empty object effectively drops the param on the next render.
    }
    return {};
  },
  beforeLoad: ({ search, params }) => {
    if (search && (search as Record<string, unknown>).tier !== undefined) {
      throw redirect({
        to: "/portofino/$day/$look",
        params,
        search: {},
        replace: true,
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Shop the Full Look — Portofino | Resort Edit | Dressed for the destination" },
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
  const day = params.day as string;
  const look = params.look as string;

  if (!isDaySlug(day) || !isLookSlug(look)) throw notFound();

  const lookData = findLook(day, look as LookSlug);
  if (!lookData) throw notFound();

  const editorial = lookEditorialFor(day, look);
  const alternatives = alternativesFor(day, look);
  const override = lookOverrideFor(day, look as LookSlug);

  // Source of truth for the product grid:
  //   1. A per-look override (custom slot grid, e.g. Day 1 Look C)
  //   2. Otherwise, the legacy categorised products from the first available
  //      tier on the look — falls back gracefully if no tier data exists.
  const fallbackProducts: Record<LookCategory, LookProduct> | null = useMemo(() => {
    if (override) return null;
    const tiers = (lookData.tiers ?? {}) as Record<string, { products: Record<LookCategory, LookProduct> } | undefined>;
    const firstKey = Object.keys(tiers)[0];
    return firstKey ? (tiers[firstKey]?.products ?? null) : null;
  }, [lookData, override]);

  const shoppableCount = useMemo(() => {
    if (override) return override.main.length;
    if (!fallbackProducts) return 0;
    return LOOK_CATEGORY_ORDER.filter((c) => !fallbackProducts[c]?.isPlaceholder).length;
  }, [override, fallbackProducts]);

  const flatIndex = lookbook.findIndex((l) => l.daySlug === day && l.lookSlug === look);
  const prevLook = flatIndex > 0 ? lookbook[flatIndex - 1] : null;
  const nextLook =
    flatIndex >= 0 && flatIndex < lookbook.length - 1 ? lookbook[flatIndex + 1] : null;

  const enrichment = enrichmentFor(day, look as LookSlug);
  const nextDay = DAY_NEXT[day];
  const nextDayFirstLook = nextDay
    ? lookbook.find((l) => l.daySlug === nextDay.daySlug && l.lookSlug === "look-a")
    : undefined;

  const [customize, setCustomize] = useState<Set<string>>(new Set());
  const toggleCustomize = (opt: string) => {
    setCustomize((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };
  const customizeActive = customize.size > 0;

  const sellOutItems = useMemo(() => alternatives.flatMap((g) => g.items).slice(0, 4), [alternatives]);

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
            <Link to="/portofino" className="hover:text-gold transition-colors">
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
                to="/portofino/$day/$look"
                params={{ day: prevLook.daySlug, look: prevLook.lookSlug }}
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
                to="/portofino/$day/$look"
                params={{ day: nextLook.daySlug, look: nextLook.lookSlug }}
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

      {/* ───────────────────────── ACTIVE VIEW FULL LOOK · TWO COLUMN TEMPLATE ───────────────────────── */}
      <section className="mx-auto max-w-[1480px] px-4 sm:px-8 lg:px-10 pt-8 md:pt-12">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,44fr)_minmax(0,56fr)] gap-10 xl:gap-14 items-start">
          <div className="xl:sticky xl:top-8 xl:self-start">
            <figure className="relative overflow-hidden border border-ink/10 bg-cream/35 aspect-[3/4] lg:aspect-[4/5.25]">
              <img
                src={lookData.heroImage}
                alt={`${lookData.day} · ${lookData.title}`}
                className="absolute inset-0 h-full w-full object-contain"
                style={{ objectPosition: "center center" }}
              />
            </figure>

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
          </div>

          <aside className="border-t border-ink/15 xl:border-t-0 xl:border-l xl:pl-12 border-ink/15 pt-10 xl:pt-2">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-ink/15 pb-8">
              <div>
                <div className="inline-flex items-center gap-2 text-gold">
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.4} />
                  <span className="eyebrow tracking-[0.34em] text-[0.62rem]">CURATED EDIT</span>
                </div>
                <h2 className="font-display text-[1.65rem] md:text-[2.15rem] tracking-[0.16em] text-ink uppercase mt-3">
                  Complete the Look
                </h2>
                <p className="font-serif text-[0.95rem] text-ink/55 mt-2">
                  {shoppableCount} sourced pieces · {lookData.destination}
                </p>
              </div>
            </div>

            <div id="full-look-grid" className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
              {override
                ? override.main.map((item) => (
                    <OverrideProductCard key={item.brand + item.title} item={item} />
                  ))
                : fallbackProducts
                  ? LOOK_CATEGORY_ORDER.map((cat) => (
                      <ProductCategoryCard key={cat} category={cat} product={fallbackProducts[cat]} />
                    ))
                  : null}
            </div>
          </aside>
        </div>
      </section>

      {/* ───────────────────────── WHERE YOU'LL ACTUALLY WEAR THIS ───────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-10 mt-24 md:mt-32">
        <div className="border-t border-ink/15 pt-12">
          <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">THE DAY</p>
          <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
            Where You'll Actually Wear This
          </h2>
          <p className="font-serif italic text-[1rem] text-ink/65 mt-3 max-w-2xl leading-relaxed">
            The arc of the day this look was styled for — hour by hour.
          </p>
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
            {enrichment.activities.map((a, i) => (
              <li key={a} className="flex items-baseline gap-4 border-b border-ink/10 pb-4">
                <span className="eyebrow tracking-[0.32em] text-[0.62rem] text-gold w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-[1.02rem] text-ink/85 leading-relaxed">{a}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────────────── WHY THIS LOOK WORKS ───────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-10 mt-24 md:mt-32">
        <div className="border-t border-ink/15 pt-12">
          <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">EDITORIAL NOTE</p>
          <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
            Why This Look Works
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
            {enrichment.whyItWorks.map((p, i) => (
              <p key={i} className="font-serif text-[1.02rem] text-ink/80 leading-[1.75]">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CUSTOMIZE THIS LOOK ───────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-10 mt-24 md:mt-32">
        <div className="border-t border-ink/15 pt-12">
          <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">STYLED FOR YOU</p>
          <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
            Customize This Look
          </h2>
          <p className="font-serif italic text-[1rem] text-ink/65 mt-3 max-w-2xl leading-relaxed">
            Tell us how you like to wear it — we'll surface alternates that match.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {CUSTOMIZE_OPTIONS.map((opt) => {
              const active = customize.has(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleCustomize(opt)}
                  className={
                    "eyebrow tracking-[0.22em] text-[0.62rem] px-4 py-2.5 border transition-colors " +
                    (active
                      ? "bg-ink text-ivory border-ink"
                      : "bg-ivory text-ink/75 border-ink/25 hover:border-gold hover:text-gold")
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="mt-8 border border-ink/10 bg-cream/30 px-6 py-5">
            <p className="font-serif italic text-[0.98rem] text-ink/75 leading-relaxed">
              {customizeActive
                ? `Matching ${customize.size} preference${customize.size > 1 ? "s" : ""} — alternates appear below in "If This Sells Out".`
                : "Select one or more preferences to surface alternate pieces from the Resort Edit product library."}
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────── PACKING INTELLIGENCE ───────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-10 mt-24 md:mt-32">
        <div className="border-t border-ink/15 pt-12">
          <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">THE LIST</p>
          <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
            Packing Intelligence
          </h2>
          <p className="font-serif italic text-[1rem] text-ink/65 mt-3 max-w-2xl leading-relaxed">
            For this activity, bring:
          </p>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-3">
            {enrichment.packing.map((p) => (
              <li key={p} className="flex items-center gap-3 border-b border-ink/10 py-2.5">
                <Check className="w-4 h-4 text-gold shrink-0" strokeWidth={1.5} />
                <span className="font-serif text-[1rem] text-ink/80">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────────────── IF THIS SELLS OUT ───────────────────────── */}
      {sellOutItems.length > 0 && (
        <section className="mx-auto max-w-[1480px] px-4 sm:px-8 lg:px-10 mt-24 md:mt-32">
          <div className="border-t border-ink/15 pt-12">
            <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">ALWAYS A PLAN B</p>
            <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
              If This Sells Out
            </h2>
            <p className="font-serif italic text-[1rem] text-ink/65 mt-3 max-w-3xl leading-relaxed">
              Every Resort Edit look includes approved alternatives selected by our styling engine.
            </p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              {sellOutItems.map((item) => (
                <AlternativeCard key={item.brand + item.title} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────────── BOOK THE EXPERIENCE ───────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-10 mt-24 md:mt-32">
        <div className="border-t border-ink/15 pt-12">
          <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">COMPLETE THE TRIP</p>
          <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
            Book the Experience
          </h2>
          <p className="font-serif italic text-[1rem] text-ink/65 mt-3 max-w-2xl leading-relaxed">
            The pieces of the day that turn the outfit into a memory.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {enrichment.experiences.map((e) => (
              <Link
                key={e.label}
                to={e.href}
                className="h-16 bg-gold hover:bg-ink text-ivory transition-colors flex items-center justify-center eyebrow tracking-[0.22em] text-[0.7rem] text-center px-4 no-underline"
              >
                {e.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── BEST PAIRED WITH ───────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-10 mt-24 md:mt-32">
        <div className="border-t border-ink/15 pt-12">
          <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">WHERE WE'D STAY</p>
          <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
            Best Paired With
          </h2>
          <p className="font-serif italic text-[1rem] text-ink/65 mt-3 max-w-2xl leading-relaxed">
            The hotels that turn this look into a stay.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {enrichment.hotels.map((key) => {
              const h = HOTEL_DETAILS[key];
              return (
                <a
                  key={key}
                  href={h.href}
                  target="_blank"
                  rel="noreferrer noopener sponsored"
                  className="bg-ivory border border-ink/15 hover:border-gold transition-colors flex flex-col no-underline text-inherit"
                >
                  <div className="relative aspect-[4/3] bg-cream/30 overflow-hidden">
                    <img src={HOTEL_IMAGES[key]} alt={h.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute left-3 bottom-3 bg-ink/75 text-ivory eyebrow text-[0.55rem] tracking-[0.24em] px-2.5 py-1 backdrop-blur-sm">
                      {h.tag}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="eyebrow tracking-[0.3em] text-[0.58rem] text-gold">PORTOFINO, ITALY</p>
                    <h3 className="font-display text-[1.25rem] tracking-[0.06em] text-ink mt-2">{h.name}</h3>
                    <p className="font-serif italic text-[0.9rem] text-ink/60 mt-3 flex-1">{h.note}</p>
                    <span className="mt-4 eyebrow tracking-[0.26em] text-[0.6rem] text-ink border-b border-gold pb-0.5 self-start">
                      EXPLORE STAY →
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── THE DETAILS (beauty / finishing) ───────────────────────── */}
      {override?.details && (
        <section className="mx-auto max-w-[1100px] px-4 sm:px-8 lg:px-10 mt-20 md:mt-24">
          <div className="border-t border-ink/15 pt-10">
            <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">{override.details.title.toUpperCase()}</p>
            <h2 className="font-display text-[1.35rem] md:text-[1.7rem] tracking-[0.12em] text-ink uppercase mt-2">
              {override.details.title}
            </h2>
            {override.details.subtitle && (
              <p className="font-serif italic text-[0.95rem] text-ink/60 mt-2 max-w-xl">
                {override.details.subtitle}
              </p>
            )}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
              {override.details.items.map((item) => (
                <OverrideProductCard key={item.brand + item.title} item={item} subtle />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────────── EDITOR'S ALTERNATIVES ───────────────────────── */}
      {alternatives.length > 0 && (
        <section className="mx-auto max-w-[1480px] px-4 sm:px-8 lg:px-10 mt-24 md:mt-32">
          <div className="border-t border-ink/15 pt-12">
            <div className="inline-flex items-center gap-2 text-gold">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.4} />
              <span className="eyebrow tracking-[0.34em] text-[0.62rem]">EDITOR'S ALTERNATIVES</span>
            </div>
            <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
              More Pieces in This Aesthetic
            </h2>
            <p className="font-serif text-[0.98rem] text-ink/60 mt-3 max-w-2xl leading-relaxed">
              Same destination, same energy — additional sourced options for the days you want to swap a piece in or out without leaving the look behind.
            </p>
          </div>

          <div className="mt-12 space-y-16">
            {alternatives.map((group) => (
              <div key={group.title}>
                <div className="flex flex-col gap-2 border-b border-ink/15 pb-5">
                  <p className="eyebrow tracking-[0.32em] text-[0.58rem] text-gold">{group.title.toUpperCase()}</p>
                  {group.description && (
                    <p className="font-serif italic text-[1rem] text-ink/70 leading-relaxed max-w-3xl">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
                  {group.items.map((item) => (
                    <AlternativeCard key={item.brand + item.title} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ───────────────────────── MORE LIKE THIS (DNA-matched discovery) ───────────────────────── */}
      <MoreLikeThis daySlug={day} lookSlug={look} />

      {/* ───────────────────────── BOTTOM · GET THE NEXT EDIT ───────────────────────── */}
      {nextDay && nextDayFirstLook && (
        <section className="mx-auto max-w-[1100px] px-4 sm:px-10 mt-24 md:mt-32">
          <Link
            to="/portofino/$day/$look"
            params={{ day: nextDayFirstLook.daySlug, look: nextDayFirstLook.lookSlug }}
            className="group border-t border-ink/15 pt-12 grid grid-cols-1 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-8 md:gap-12 items-center no-underline text-inherit"
          >
            <figure className="w-full aspect-[3/4] overflow-hidden bg-cream/35">
              <img
                src={nextDayFirstLook.heroImage}
                alt={`${nextDay.day} · ${nextDay.title}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </figure>
            <div>
              <p className="eyebrow tracking-[0.4em] text-[0.65rem] text-gold">CONTINUE THE EDIT</p>
              <h3 className="font-display text-[2rem] md:text-[2.6rem] tracking-[0.04em] text-ink uppercase mt-3 group-hover:text-gold transition-colors">
                Continue to {nextDay.day} →
              </h3>
              <p className="font-serif italic text-[1.1rem] text-ink/70 mt-3">
                {nextDay.title}
              </p>
            </div>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-[1100px] px-4 sm:px-10 mt-28 md:mt-36">
        <div className="border-t border-ink/15 pt-14 grid grid-cols-1 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)] gap-8 md:gap-12 items-center">
          <figure className="w-full aspect-[3/4] md:aspect-[3/4] overflow-hidden bg-cream/35 flex items-center justify-center">
            <img
              src={lookData.heroImage}
              alt=""
              aria-hidden
              className="h-full w-full object-contain"
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
// Alternative card — same editorial card style as the primary grid,
// but with a custom slot label (e.g. "Swim Alt 1 · One-Piece") and
// an optional stylist note instead of a fixed category.
// ──────────────────────────────────────────────────────────────
function AlternativeCard({ item }: { item: AlternativeProduct }) {
  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-ivory transition-colors hover:border-gold/60">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackOutbound({ brand: item.brand, item: item.title, href: item.url })}
        className="relative aspect-[4/5] w-full bg-cream/30 overflow-hidden flex items-center justify-center border-b border-ink/10"
      >
        <img
          src={item.image}
          alt={`${item.brand} ${item.title}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </a>
      <div className="flex flex-1 flex-col items-center px-4 py-5 text-center">
        <p className="eyebrow tracking-[0.28em] text-[0.56rem] text-gold">{item.slotLabel}</p>
        <p className="eyebrow tracking-[0.18em] text-[0.68rem] text-ink uppercase mt-2 leading-snug">
          {item.brand}
        </p>
        <p className="font-serif italic text-[0.94rem] text-ink/75 leading-snug mt-1.5 max-w-[15rem]">
          {item.title}
        </p>
        <p className="font-serif text-[0.95rem] text-ink mt-2">{item.price}</p>
        {item.note && (
          <p className="font-serif text-[0.82rem] text-ink/55 mt-3 leading-relaxed max-w-[16rem]">
            {item.note}
          </p>
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackOutbound({ brand: item.brand, item: item.title, href: item.url })}
          className="mt-auto pt-5 eyebrow tracking-[0.24em] text-[0.58rem] text-ink border-b border-gold hover:text-gold transition-colors pb-0.5"
          aria-label={`Shop ${item.brand} ${item.title} (opens in new tab)`}
        >
          SHOP PIECE →
        </a>
      </div>
    </article>
  );
}

// ──────────────────────────────────────────────────────────────
// Product card — editorial: image-led, refined border,
// brand · name · price · Shop link. No broken image or raw URL output.
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
    return null;
  }

  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-ivory transition-colors hover:border-gold/60">
      <a
        href={product.url!}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() =>
          trackOutbound({ brand: product.brand, item: product.title, href: product.url! })
        }
        className="relative aspect-[4/5] w-full bg-cream/30 overflow-hidden flex items-center justify-center border-b border-ink/10"
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

      <div className="flex flex-1 flex-col items-center px-4 py-5 text-center">
        <p className="eyebrow tracking-[0.28em] text-[0.56rem] text-gold">{label}</p>
        <p className="eyebrow tracking-[0.18em] text-[0.68rem] text-ink uppercase mt-2 leading-snug">
          {product.brand}
        </p>
        <p className="font-serif italic text-[0.94rem] text-ink/75 leading-snug mt-1.5 max-w-[15rem]">
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
          className="mt-auto pt-5 eyebrow tracking-[0.24em] text-[0.58rem] text-ink border-b border-gold hover:text-gold transition-colors pb-0.5"
          aria-label={`Shop ${product.brand} ${product.title} (opens in new tab)`}
        >
          SHOP PIECE →
        </a>
      </div>
    </article>
  );
}

// ──────────────────────────────────────────────────────────────
// Override card — flexible slot for looks that don't fit the
// rigid 7-category schema (multiple jewelry, beauty details, etc.)
// ──────────────────────────────────────────────────────────────
function OverrideProductCard({ item, subtle = false }: { item: OverrideItem; subtle?: boolean }) {
  return (
    <article className={
      "group flex h-full flex-col border bg-ivory transition-colors " +
      (subtle ? "border-ink/10 hover:border-gold/40" : "border-ink/10 hover:border-gold/60")
    }>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackOutbound({ brand: item.brand, item: item.title, href: item.url })}
        className="relative aspect-[4/5] w-full bg-cream/30 overflow-hidden flex items-center justify-center border-b border-ink/10"
      >
        <img
          src={item.image}
          alt={`${item.brand} ${item.title}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-6 md:p-8 transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </a>
      <div className="flex flex-1 flex-col items-center px-4 py-5 text-center">
        <p className="eyebrow tracking-[0.28em] text-[0.56rem] text-gold">{item.slotLabel}</p>
        <p className="eyebrow tracking-[0.18em] text-[0.68rem] text-ink uppercase mt-2 leading-snug">
          {item.brand}
        </p>
        <p className="font-serif italic text-[0.94rem] text-ink/75 leading-snug mt-1.5 max-w-[15rem]">
          {item.title}
        </p>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackOutbound({ brand: item.brand, item: item.title, href: item.url })}
          className="mt-auto pt-5 eyebrow tracking-[0.24em] text-[0.58rem] text-ink border-b border-gold hover:text-gold transition-colors pb-0.5"
          aria-label={`Shop ${item.brand} ${item.title} (opens in new tab)`}
        >
          SHOP PIECE →
        </a>
      </div>
    </article>
  );
}
