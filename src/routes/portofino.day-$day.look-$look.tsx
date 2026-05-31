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

/** Resolve a display category label for a sourced ShopItem. */
function shopItemCategory(item: ShopItem): string {
  if (item.category) return item.category;
  const n = item.item.toLowerCase();
  if (n.includes("sunglass")) return "Sunglasses";
  if (n.includes("sandal") || n.includes("espadrille") || n.includes("heel") || n.includes("mule")) return "Shoes";
  if (n.includes("tote") || n.includes("clutch") || n.includes("bag")) return "Bag";
  if (n.includes("earring") || n.includes("hoop") || n.includes("drop")) return "Earrings";
  if (n.includes("necklace") || n.includes("pendant") || n.includes("collar") || n.includes("lariat")) return "Necklace";
  if (n.includes("bracelet") || n.includes("cuff") || n.includes("bangle")) return "Bracelet";
  if (n.includes("ring")) return "Ring";
  if (n.includes("scarf") || n.includes("barrette") || n.includes("headband")) return "Hair Detail";
  if (n.includes("shirt") || n.includes("layer") || n.includes("jacket") || n.includes("kimono")) return "Optional Layer";
  return "Outfit";
}

/** Row rendered in the Complete the Look grid. */
type LookGridItem = ShopItem & {
  /** True when this slot came from the editorial outfit composition. */
  fromEditorial: boolean;
  /** True when the editorial slot was successfully matched to a real product. */
  hasLiveSource: boolean;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const CATEGORY_TOKENS: Record<string, string[]> = {
  shoes: ["sandal", "heel", "mule", "espadrille", "loafer", "slide"],
  bag: ["bag", "tote", "clutch", "minaudi", "pouch", "shoulder"],
  jewelry: ["earring", "hoop", "drop", "bracelet", "cuff", "necklace", "pendant", "lariat", "ring"],
  sunglasses: ["sunglass"],
  clothing: ["dress", "top", "skirt", "pants", "trousers", "polo", "blouse", "shirt", "set", "swimsuit", "bikini"],
  layer: ["caftan", "kimono", "jacket", "robe", "layer"],
};

function categoryBonus(editCat: string | undefined, sourcedName: string, sourcedCat?: string): number {
  if (!editCat) return 0;
  const tokens = CATEGORY_TOKENS[editCat] || [];
  const hay = (sourcedName + " " + (sourcedCat ?? "")).toLowerCase();
  return tokens.some((t) => hay.includes(t)) ? 6 : 0;
}

/**
 * Build the full outfit grid for a look.
 *
 * Strategy:
 *  1. Start from the editorial outfit composition for this look + tier
 *     (portofinoEdit.looks[lookIdx].tiers[editTier]) — always 5 categorised
 *     pieces (dress, shoes, bag, jewelry, sunglasses, etc).
 *  2. Enrich each slot with the real affiliate product from the day's
 *     sourced catalog (portofinoLooks[dayIdx].shop) when brand + item line
 *     up. Enrichment adds the product thumbnail, live href, and backups.
 *  3. Append any remaining sourced products that aren't part of the
 *     editorial five — surfaced as "Also From This Day" extras so the
 *     hero pieces (e.g. Aquazzura Tequila Crystal in Powder Pink) always
 *     show with a thumbnail even when they don't slot into one of the
 *     editorial categories.
 */
function buildLookGrid(dayIdx: number, lookIdx: 0 | 1 | 2, tier: TierSlug): {
  outfit: LookGridItem[];
  extras: ShopItem[];
} {
  const editTier = TIER_SLUG_TO_ID[tier];
  const editorial = portofinoEdit[dayIdx]?.looks?.[lookIdx]?.tiers?.[editTier] ?? [];
  const dayShop = portofinoLooks[dayIdx]?.shop ?? [];

  const live = dayShop.filter(
    (it) => it.not_available || resolveProductLink(it) !== null,
  );

  // Group sourced products by normalized brand for fast lookup.
  const sourcedByBrand = new Map<string, ShopItem[]>();
  for (const s of live) {
    const key = norm(s.brand);
    if (!sourcedByBrand.has(key)) sourcedByBrand.set(key, []);
    sourcedByBrand.get(key)!.push(s);
  }

  const used = new Set<ShopItem>();

  const outfit: LookGridItem[] = editorial.map((ed) => {
    const candidates = sourcedByBrand.get(norm(ed.brand)) ?? [];
    let best: ShopItem | undefined;
    let bestScore = -1;
    for (const cand of candidates) {
      if (used.has(cand)) continue;
      let score = 0;
      const a = norm(ed.item);
      const b = norm(cand.item);
      if (a === b) score += 100;
      // Shared word tokens (> 3 chars).
      for (const tok of ed.item.toLowerCase().split(/\s+/)) {
        if (tok.length > 3 && cand.item.toLowerCase().includes(tok)) {
          score += tok.length;
        }
      }
      score += categoryBonus(ed.category, cand.item, cand.category);
      if (score > bestScore) {
        best = cand;
        bestScore = score;
      }
    }
    if (best) used.add(best);
    return {
      brand: ed.brand,
      item: ed.item,
      price: best?.price ?? ed.price,
      href: best?.href ?? "",
      image: best?.image,
      backup_link_1: best?.backup_link_1,
      backup_link_2: best?.backup_link_2,
      inventory_status: best?.inventory_status,
      category: best?.category ?? ed.category,
      fromEditorial: true,
      hasLiveSource: Boolean(best),
    };
  });

  // Sourced products NOT claimed by an editorial slot — keep them so users
  // see every hero product the editor sourced for the day (including
  // statement pieces like the Aquazzura Tequila Crystal sandal).
  const extras = live.filter((s) => !used.has(s));

  return { outfit, extras };
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

  // The look detail page renders the FULL editorial outfit (always five
  // categorised pieces from portofinoEdit), enriched with live affiliate
  // products + thumbnails from the sourced catalog (portofinoLooks). Any
  // remaining sourced products that aren't part of the editorial five are
  // appended as extras so every hero product the editor sourced shows up
  // with a thumbnail.
  const { outfit, extras } = buildLookGrid(dayIdx, lookIdx, tier);

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
              Every piece in the muse — with live affiliate links where available.
            </p>
          </header>

          {outfit.length === 0 && extras.length === 0 ? (
            <p className="text-center font-serif italic text-ink/55 py-10">
              No {TIER_LABEL[tier]} picks for this look yet. Try a different tier.
            </p>
          ) : (
            <>
              {outfit.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10">
                  {outfit.map((item) => (
                    <OutfitCard key={item.brand + item.item} item={item} />
                  ))}
                </div>
              )}

              {extras.length > 0 && (
                <div className="mt-14 md:mt-16">
                  <div className="flex items-center gap-4 justify-center mb-6">
                    <div className="h-px w-12 bg-gold/40" />
                    <span className="eyebrow text-gold tracking-[0.32em] text-[0.65rem]">
                      Also From This Day
                    </span>
                    <div className="h-px w-12 bg-gold/40" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10">
                    {extras.map((item) => (
                      <SourcedCard key={item.brand + item.item} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </>
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

/**
 * Editorial outfit slot. Renders the brand + item as authored in
 * portofinoEdit and, when the slot has been matched to a real affiliate
 * product, surfaces the thumbnail and "Shop Now" link. Unmatched slots
 * stay visible as a brand-monogram placeholder so the full outfit always
 * reads as a complete look.
 */
function OutfitCard({ item }: { item: LookGridItem }) {
  const href = item.hasLiveSource ? resolveProductLink(item) : null;
  const specCat = shopItemCategory(item);

  const CardInner = (
    <>
      <span
        className={
          "eyebrow text-[0.55rem] tracking-[0.3em] " +
          (href ? "text-gold" : "text-ink/40")
        }
      >
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
            <div
              className={
                "w-12 h-12 rounded-full border flex items-center justify-center font-serif text-base " +
                (href ? "border-gold/40 text-gold" : "border-ink/20 text-ink/40")
              }
            >
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
        {href ? (
          <div className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold group-hover:text-ink transition-colors pt-1">
            Shop Now →
          </div>
        ) : (
          <div className="eyebrow text-[0.55rem] tracking-[0.3em] text-ink/40 pt-1">
            Sourcing
          </div>
        )}
      </div>
    </>
  );

  if (!href) {
    return (
      <div className="flex flex-col text-center bg-ivory border border-dashed border-border/60 p-3">
        {CardInner}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackOutbound({ brand: item.brand, item: item.item, href })}
      className="group flex flex-col text-center bg-ivory border border-border/60 p-3 hover:border-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
    >
      {CardInner}
    </a>
  );
}

/**
 * Sourced affiliate product not claimed by the editorial composition —
 * e.g. statement pieces like the Aquazzura Tequila Crystal sandal. Always
 * renders with a live thumbnail.
 */
function SourcedCard({ item }: { item: ShopItem }) {
  const href = resolveProductLink(item);
  const specCat = shopItemCategory(item);

  if (!href) {
    if (!item.not_available) return null;
    return (
      <div className="flex flex-col text-center bg-ivory border border-dashed border-border/60 p-3">
        <span className="eyebrow text-ink/40 text-[0.55rem] tracking-[0.3em]">{specCat}</span>
        <div className="relative aspect-square w-full bg-cream border border-border/60 rounded-[6px] mt-2 flex items-center justify-center overflow-hidden">
          <div className="w-12 h-12 rounded-full border border-ink/20 flex items-center justify-center font-serif text-ink/40 text-base">
            {item.brand.charAt(0)}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="eyebrow text-[0.55rem] text-ink/55">{item.brand}</div>
          <div className="font-serif text-[0.82rem] text-ink/70 leading-snug line-clamp-2">{item.item}</div>
          <div className="font-serif italic text-[0.7rem] text-ink/45 pt-1 leading-snug">
            Not available through approved affiliate partners
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackOutbound({ brand: item.brand, item: item.item, href })}
      className="group flex flex-col text-center bg-ivory border border-border/60 p-3 hover:border-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
    >
      <span className="eyebrow text-gold text-[0.55rem] tracking-[0.3em]">{specCat}</span>
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
        <div className="font-serif text-[0.82rem] text-ink/85 leading-snug line-clamp-2">{item.item}</div>
        <div className="font-serif text-[0.78rem] text-gold">{item.price}</div>
        <div className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold group-hover:text-ink transition-colors pt-1">
          Shop Now →
        </div>
      </div>
    </a>
  );
}