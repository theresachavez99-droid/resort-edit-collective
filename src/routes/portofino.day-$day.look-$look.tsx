import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { portofinoEdit } from "@/data/portofinoEdit";
import { portofinoLooks, resolveProductLink, type ShopItem } from "@/data/portofino";
import { trackOutbound } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";
import {
  LOOK_INDEX_OF,
  LOOK_SLUG_LABEL,
  TIER_LABEL,
  TIER_SLUG_TO_ID,
  TIER_SLUGS,
  inferSpecCategory,
  isLookSlug,
  isTierSlug,
  persistTier,
  type LookSlug,
  type TierSlug,
} from "@/lib/portofino-spec";
import type { DaySlug } from "@/components/PortofinoDayPage";

type Search = { tier: TierSlug };

const DAY_INDEX: Record<DaySlug, 0 | 1 | 2 | 3 | 4> = {
  "day-1": 0,
  "day-2": 1,
  "day-3": 2,
  "day-4": 3,
  "day-5": 4,
};

function isDaySlug(v: string): v is DaySlug {
  return v === "day-1" || v === "day-2" || v === "day-3" || v === "day-4" || v === "day-5";
}

// Parse a price string ("$1,495", "$295", "—") to a number for tier-bucketing.
function parsePrice(p: string): number {
  const n = Number(String(p).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Pick the shop items for a given day + look + tier from the sourced catalog.
 *
 * Strategy:
 *  - Start from portofinoLooks[dayIdx].shop (real affiliate items).
 *  - Keep only "live" items: a usable href OR an explicit not_available card.
 *  - If any item carries an explicit `lookIndex`, scope to that look; otherwise
 *    use the whole day's catalog (fallback for days not yet tagged per-look).
 *  - Split the resulting set into three price-tier buckets (top / middle /
 *    bottom third) and return the bucket matching the user's selected tier.
 */
function selectLookItems(
  dayIdx: number,
  lookNum: 1 | 2 | 3,
  tier: TierSlug,
): ShopItem[] {
  const day = portofinoLooks[dayIdx];
  if (!day) return [];
  const live = day.shop.filter(
    (it) => it.not_available || resolveProductLink(it) !== null,
  );
  const tagged = live.filter((it) => it.lookIndex === lookNum);
  const anyTagged = live.some((it) => it.lookIndex);
  const pool = anyTagged ? tagged : live;
  if (!pool.length) return [];

  const sortedDesc = [...pool].sort(
    (a, b) => parsePrice(b.price) - parsePrice(a.price),
  );
  const third = Math.max(1, Math.ceil(sortedDesc.length / 3));
  const buckets: Record<TierSlug, ShopItem[]> = {
    luxury: sortedDesc.slice(0, third),
    "mid-luxe": sortedDesc.slice(third, third * 2),
    "riviera-finds": sortedDesc.slice(third * 2),
  };
  return buckets[tier] ?? [];
}

export const Route = createFileRoute("/portofino/day-$day/look-$look")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    tier: isTierSlug(search.tier) ? search.tier : "luxury",
  }),
  head: () => ({
    meta: [
      { title: "Look Detail — Portofino · Resort Edit" },
      { name: "description", content: "Shop the complete look — every piece in the editorial muse, in your selected tier." },
      { property: "og:url", content: absoluteUrl("/portofino") },
    ],
  }),
  component: LookDetailPage,
});

function LookDetailPage() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const day = params.day as string;
  const look = params.look as string;
  const tier: TierSlug = isTierSlug(search.tier) ? search.tier : "luxury";

  if (!isDaySlug(day) || !isLookSlug(look)) throw notFound();

  const dayIdx = DAY_INDEX[day];
  const lookIdx = LOOK_INDEX_OF[look as LookSlug];
  const dayData = portofinoEdit[dayIdx];
  const lookData = dayData?.looks?.[lookIdx];
  if (!dayData || !lookData) throw notFound();

  // Source live affiliate products from the sourced catalog (portofinoLooks).
  // portofinoEdit drives copy (muse name, description, fabric, hero image);
  // portofinoLooks drives the shoppable grid (exact URLs + retailer thumbnails).
  const items = selectLookItems(dayIdx, (lookIdx + 1) as 1 | 2 | 3, tier);

  // Persist tier across visits so the overview reflects the user's lane.
  useEffect(() => {
    persistTier(tier);
  }, [tier]);

  const dayLabel = dayData.day; // "Day 1"
  const lookLabel = LOOK_SLUG_LABEL[look as LookSlug]; // "Look A"

  return (
    <div className="bg-ivory min-h-screen">
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-8 md:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 eyebrow text-[0.6rem] tracking-[0.3em] text-ink/60">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="text-ink/30">/</span>
            <Link to="/portofino" search={{ tier }} className="hover:text-gold transition-colors">
              Portofino
            </Link>
            <span className="text-ink/30">/</span>
            <span className="text-ink/80">{dayLabel}</span>
            <span className="text-ink/30">/</span>
            <span className="text-gold">{lookLabel}</span>
          </nav>
          <Link
            to="/portofino"
            search={{ tier }}
            className="inline-flex items-center gap-2 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to {dayLabel}
          </Link>
        </div>
      </div>

      {/* LOOK HERO — image left, copy right */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-8 md:pt-10 pb-10 md:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-8 md:gap-14 items-start">
          {/* Editorial Muse */}
          <div className="relative aspect-[4/5] overflow-hidden bg-muted border border-border/60">
            {lookData.image && (
              <img
                src={lookData.image}
                alt={`${dayLabel} · ${lookLabel} — ${lookData.name}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
              Editorial Muse
            </div>
            <div className="absolute top-3 right-3 bg-gold/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
              {TIER_LABEL[tier].toUpperCase()}
            </div>
          </div>

          {/* Copy */}
          <div>
            <p className="eyebrow text-gold tracking-[0.32em] text-[0.7rem]">
              {dayLabel} · {lookLabel}
            </p>
            <h1 className="font-display text-4xl md:text-5xl tracking-[0.06em] text-ink mt-3 leading-[1.05]">
              {lookData.name}
            </h1>
            <p className="font-serif italic text-[0.95rem] text-ink/65 mt-3">
              {lookData.category}
            </p>
            <div className="mx-0 my-5 h-px w-12 bg-gold" />
            <p className="font-serif text-[1rem] text-ink/80 leading-relaxed">
              {lookData.description}
            </p>
            <p className="font-serif italic text-[0.85rem] text-ink/55 mt-4">
              {lookData.fabric}
            </p>

            {/* Tier switcher (in-page, instant) */}
            <div className="mt-7">
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/55">Shopping Tier</span>
              <div className="mt-2 flex flex-wrap gap-2">
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
                        active
                          ? "eyebrow tracking-[0.3em] text-[0.65rem] px-4 py-2 border bg-gold/90 border-gold text-ink font-semibold"
                          : "eyebrow tracking-[0.3em] text-[0.65rem] px-4 py-2 border border-border bg-cream text-ink hover:border-gold hover:text-gold transition-colors"
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

      {/* COMPLETE THE LOOK */}
      <section className="bg-cream border-y border-border/60 py-12 md:py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <header className="text-center mb-8 md:mb-10">
            <span className="eyebrow text-gold tracking-[0.32em] text-[0.7rem]">
              {TIER_LABEL[tier]} Edit
            </span>
            <h2 className="font-display text-3xl md:text-4xl tracking-[0.06em] text-ink mt-2">
              Complete the Look
            </h2>
            <div className="mx-auto my-3 h-px w-12 bg-gold" />
            <p className="font-serif italic text-ink/65 text-sm md:text-base">
              Every piece in the muse — only products available in your selected tier.
            </p>
          </header>

          {items.length === 0 ? (
            <p className="text-center font-serif italic text-ink/55 py-10">
              No {TIER_LABEL[tier]} picks for this look yet. Try a different tier.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10">
              {items.map((item) => {
                const href = resolveProductLink(item);
                if (!href) return null;
                const specCat = inferSpecCategory(item);
                return (
                  <a
                    key={item.brand + item.item}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackOutbound({ brand: item.brand, item: item.item, href })}
                    className="group flex flex-col text-center bg-ivory border border-border/60 p-3 hover:border-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
                  >
                    <span className="eyebrow text-gold text-[0.55rem] tracking-[0.3em]">
                      {specCat}
                    </span>
                    <div className="relative aspect-square w-full bg-cream border border-border/60 rounded-[6px] mt-2 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={`${item.brand} ${item.item}`}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 px-3">
                          <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center font-serif text-gold text-base">
                            {item.brand.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 space-y-0.5">
                      <div className="eyebrow text-[0.55rem] text-ink/70">{item.brand}</div>
                      <div className="font-serif text-[0.82rem] text-ink/85 leading-snug line-clamp-2">
                        {item.item}
                      </div>
                      <div className="font-serif text-[0.78rem] text-gold">{item.price}</div>
                      <div className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold group-hover:text-ink transition-colors pt-1">
                        Shop Now →
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* BACK */}
          <div className="mt-12 md:mt-14 flex justify-center">
            <Link
              to="/portofino"
              search={{ tier }}
              className="inline-flex items-center gap-2 eyebrow tracking-[0.3em] text-[0.7rem] px-6 py-3 border border-ink bg-ivory text-ink hover:bg-gold/90 hover:border-gold transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to {dayLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}