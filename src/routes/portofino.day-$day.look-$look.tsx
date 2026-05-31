import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, ShoppingBag, ExternalLink } from "lucide-react";
import { useEffect, useMemo } from "react";
import { portofinoEdit, categoryOrder, type AccessoryCategory } from "@/data/portofinoEdit";
import { portofinoLooks, resolveProductLink, type ShopItem } from "@/data/portofino";
import { trackOutbound } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";
import {
  LOOK_INDEX_OF,
  LOOK_SLUG_LABEL,
  LOOK_KEY_TO_SLUG,
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
  "day-1": 0, "day-2": 1, "day-3": 2, "day-4": 3, "day-5": 4,
};
const DAY_SLUGS: DaySlug[] = ["day-1", "day-2", "day-3", "day-4", "day-5"];

function isDaySlug(v: string): v is DaySlug {
  return v === "day-1" || v === "day-2" || v === "day-3" || v === "day-4" || v === "day-5";
}

// ──────────────────────────────────────────────────────────────
// Editorial context (itinerary + destination notes) per day
// ──────────────────────────────────────────────────────────────
type DayContext = {
  tagline: string;
  itinerary: string[];
  wear: { when: string; packing: string; why: string };
};

const DAY_CONTEXT: Record<DaySlug, DayContext> = {
  "day-1": {
    tagline: "Open water, tan lines & hidden coves",
    itinerary: ["Morning yacht departure", "Lunch at the beach club", "Golden hour drinks"],
    wear: {
      when: "Late yacht departure followed by lunch at Langosteria, drinks back at the marina.",
      packing: "Linen, silk, raffia. Pack pieces that wear well in salt air and look effortless folded.",
      why: "Whites and woven texture read instantly Mediterranean and photograph beautifully against teak and sea.",
    },
  },
  "day-2": {
    tagline: "Cabanas, lemon trees & long, lazy lunches",
    itinerary: ["Morning swim", "Lunch at the cabana", "Sunset aperitivo"],
    wear: {
      when: "A full day cabana-side at Bagni Fiore — swim, lunch, light reading until aperitivo.",
      packing: "A swimsuit you can lunch in, a kaftan you can dance in, sandals that survive sand.",
      why: "Print and raffia are the Riviera language — easy to layer over swim, dressy enough for the harbour bar.",
    },
  },
  "day-3": {
    tagline: "Day club hours: pool to terrace, slow and sun-warm",
    itinerary: ["Brunch arrival", "Pool & lounger hours", "Afternoon DJ + spritz"],
    wear: {
      when: "Day-club hours at Marina Grande — brunch into a pool afternoon, terrace until sunset.",
      packing: "One statement dress, low heels you can dance in, a bag small enough for a daybed.",
      why: "Print and crochet hold their shape through the heat; gold accessories transition cleanly into evening.",
    },
  },
  "day-4": {
    tagline: "Dinner in the piazzetta, candlelight on the harbour",
    itinerary: ["Sunset cocktails", "Dinner in the piazzetta", "Late aperitivo by the harbour"],
    wear: {
      when: "Cocktails at Splendido, dinner at Puny on the piazzetta, a slow walk along the harbour after.",
      packing: "Silk, satin, sculpted leather. Pieces that read polished by candlelight and on the boat back.",
      why: "Slip dressing and quiet luxury are Portofino at night — let the destination be the colour story.",
    },
  },
  "day-5": {
    tagline: "Espressos, boutique browsing & one last aperitivo",
    itinerary: ["Morning espresso in the piazza", "Boutique browsing & souvenirs", "Aperitivo hour"],
    wear: {
      when: "A long, slow last day in town — coffees, the cobbled lanes, a final spritz before the train.",
      packing: "Linen and easy tailoring you can walk in; nothing that needs steaming after a long morning.",
      why: "Stripe shirts and crinkled linen are the unofficial uniform of the Ligurian seaside.",
    },
  },
};

// ──────────────────────────────────────────────────────────────
// Outfit grid build (editorial + sourced enrichment)
// ──────────────────────────────────────────────────────────────
type LookGridItem = ShopItem & {
  fromEditorial: boolean;
  hasLiveSource: boolean;
  editCategory?: AccessoryCategory;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const CATEGORY_TOKENS: Record<string, string[]> = {
  shoes: ["sandal", "heel", "mule", "espadrille", "loafer", "slide"],
  bag: ["bag", "tote", "clutch", "minaudi", "pouch", "shoulder", "bucket"],
  jewelry: ["earring", "hoop", "drop", "bracelet", "cuff", "necklace", "pendant", "lariat", "ring"],
  sunglasses: ["sunglass"],
  clothing: ["dress", "top", "skirt", "pants", "trousers", "polo", "blouse", "shirt", "set", "swimsuit", "bikini", "maillot", "shorts"],
  layer: ["caftan", "kimono", "jacket", "robe", "layer", "kaftan", "cover"],
  finishing: ["scarf", "hat", "headband", "barrette"],
};

function categoryBonus(editCat: string | undefined, sourcedName: string, sourcedCat?: string): number {
  if (!editCat) return 0;
  const tokens = CATEGORY_TOKENS[editCat] || [];
  const hay = (sourcedName + " " + (sourcedCat ?? "")).toLowerCase();
  return tokens.some((t) => hay.includes(t)) ? 6 : 0;
}

const CATEGORY_LABEL: Record<AccessoryCategory, string> = {
  clothing: "Outfit",
  shoes: "Shoes",
  bag: "Bag",
  jewelry: "Jewelry",
  sunglasses: "Sunglasses",
  layer: "Optional Layer",
  finishing: "Finishing Touch",
};

// Mandated product order from spec
const SPEC_ORDER: AccessoryCategory[] = ["clothing", "shoes", "bag", "jewelry", "sunglasses", "finishing", "layer"];

function shortDescriptor(item: LookGridItem): string {
  const c = item.editCategory ?? (item.category as AccessoryCategory | undefined);
  switch (c) {
    case "clothing": return "Main piece · Mediterranean palette";
    case "shoes": return "Easy resort sole · all-day wear";
    case "bag": return "Hand-finished · day to evening";
    case "jewelry": return "Layering piece · gold tones";
    case "sunglasses": return "Sun-soft tortoise · UV ready";
    case "layer": return "Throw-on layer · breezy weight";
    case "finishing": return "Finishing detail · editorial touch";
    default: return "Curated for the look";
  }
}

function buildLookGrid(dayIdx: number, lookIdx: 0 | 1 | 2, tier: TierSlug): {
  outfit: LookGridItem[];
  extras: ShopItem[];
} {
  const editTier = TIER_SLUG_TO_ID[tier];
  const editorial = portofinoEdit[dayIdx]?.looks?.[lookIdx]?.tiers?.[editTier] ?? [];
  const dayShop = portofinoLooks[dayIdx]?.shop ?? [];

  const live = dayShop.filter((it) => it.not_available || resolveProductLink(it) !== null);

  const sourcedByBrand = new Map<string, ShopItem[]>();
  for (const s of live) {
    const k = norm(s.brand);
    if (!sourcedByBrand.has(k)) sourcedByBrand.set(k, []);
    sourcedByBrand.get(k)!.push(s);
  }

  const used = new Set<ShopItem>();

  const outfit: LookGridItem[] = editorial.map((ed) => {
    const candidates = sourcedByBrand.get(norm(ed.brand)) ?? [];
    let best: ShopItem | undefined;
    let bestScore = -1;
    for (const cand of candidates) {
      if (used.has(cand)) continue;
      let score = 0;
      if (norm(ed.item) === norm(cand.item)) score += 100;
      for (const tok of ed.item.toLowerCase().split(/\s+/)) {
        if (tok.length > 3 && cand.item.toLowerCase().includes(tok)) score += tok.length;
      }
      score += categoryBonus(ed.category, cand.item, cand.category);
      if (score > bestScore) { best = cand; bestScore = score; }
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
      editCategory: ed.category,
      fromEditorial: true,
      hasLiveSource: Boolean(best),
    };
  });

  // Sort by mandated spec order
  outfit.sort((a, b) => {
    const ai = SPEC_ORDER.indexOf((a.editCategory ?? "finishing") as AccessoryCategory);
    const bi = SPEC_ORDER.indexOf((b.editCategory ?? "finishing") as AccessoryCategory);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  const extras = live.filter((s) => !used.has(s));
  return { outfit, extras };
}

// Parse "$1,495" → 1495
function priceNum(p?: string): number {
  if (!p) return 0;
  const m = p.replace(/[^0-9.]/g, "");
  const n = parseFloat(m);
  return isNaN(n) ? 0 : n;
}
function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// ──────────────────────────────────────────────────────────────
// Route
// ──────────────────────────────────────────────────────────────
export const Route = createFileRoute("/portofino/day-$day/look-$look")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    tier: isTierSlug(search.tier) ? search.tier : "luxury",
  }),
  head: () => ({
    meta: [
      { title: "Look Detail — Portofino · Resort Edit" },
      { name: "description", content: "Shop the complete editorial look — every piece curated and linked to approved affiliate partners." },
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

  const { outfit, extras } = buildLookGrid(dayIdx, lookIdx, tier);

  useEffect(() => { persistTier(tier); }, [tier]);

  const dayLabel = dayData.day;
  const lookLabel = LOOK_SLUG_LABEL[look as LookSlug];
  const ctx = DAY_CONTEXT[day as DaySlug];

  // Totals per tier
  const totalsByTier = useMemo(() => {
    const out: Record<TierSlug, number> = { luxury: 0, "mid-luxe": 0, "riviera-finds": 0 };
    for (const t of TIER_SLUGS) {
      const editTier = TIER_SLUG_TO_ID[t];
      const items = dayData.looks?.[lookIdx]?.tiers?.[editTier] ?? [];
      out[t] = items.reduce((sum, it) => sum + priceNum(it.price), 0);
    }
    return out;
  }, [dayData, lookIdx]);

  // Related looks — 4 other looks across days
  const related = useMemo(() => {
    const all: Array<{ daySlug: DaySlug; lookSlug: LookSlug; image?: string; name: string; dayLabel: string; lookLabel: string; category: string }> = [];
    DAY_SLUGS.forEach((dSlug, di) => {
      const dd = portofinoEdit[di];
      dd?.looks?.forEach((lk) => {
        const lSlug = LOOK_KEY_TO_SLUG[lk.id];
        if (dSlug === day && lSlug === look) return;
        all.push({
          daySlug: dSlug,
          lookSlug: lSlug,
          image: lk.image,
          name: lk.name,
          dayLabel: dd.day,
          lookLabel: LOOK_SLUG_LABEL[lSlug],
          category: lk.category,
        });
      });
    });
    // Pick 4: prefer same day first, then spread
    const sameDay = all.filter((l) => l.daySlug === day);
    const otherDays = all.filter((l) => l.daySlug !== day);
    const picked = [...sameDay, ...otherDays].slice(0, 4);
    return picked;
  }, [day, look]);

  // Thumbnail strip = main + variants from other looks of the same day
  const thumbStrip = useMemo(() => {
    const others = (dayData.looks ?? []).filter((_, i) => i !== lookIdx).map((lk, i) => ({
      image: lk.image,
      label: LOOK_SLUG_LABEL[LOOK_KEY_TO_SLUG[lk.id]],
      slug: LOOK_KEY_TO_SLUG[lk.id],
      key: `o${i}`,
    }));
    return [
      { image: lookData.image, label: "Full Look", slug: look as LookSlug, key: "main", active: true as const },
      ...others.map((o) => ({ ...o, active: false as const })),
    ];
  }, [dayData, lookData, lookIdx, look]);

  return (
    <div className="bg-ivory min-h-screen pb-24 md:pb-12">
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-6 md:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 eyebrow text-[0.6rem] tracking-[0.3em] text-ink/60">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="text-ink/30">/</span>
            <Link to="/portofino" search={{ tier }} className="hover:text-gold transition-colors">Portofino</Link>
            <span className="text-ink/30">/</span>
            <span className="text-ink/80">{dayLabel}</span>
            <span className="text-ink/30">/</span>
            <span className="text-gold">{lookLabel}</span>
          </nav>
          <Link to="/portofino" search={{ tier }} className="inline-flex items-center gap-2 hover:text-gold transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Edit
          </Link>
        </div>
      </div>

      {/* HERO: 55/45 split */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-6 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.22fr_1fr] gap-6 lg:gap-10 items-start">
          {/* LEFT — Editorial muse */}
          <div>
            <div className="relative overflow-hidden rounded-[14px] bg-muted border border-border/50 shadow-[0_20px_60px_-30px_rgba(60,30,10,0.25)] aspect-[4/5]">
              {lookData.image && (
                <img
                  src={lookData.image}
                  alt={`${dayLabel} · ${lookLabel} — ${lookData.name}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {/* Overlay gradient bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
              {/* Top-right utility icons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button aria-label="Save look" className="w-10 h-10 rounded-full bg-ivory/95 backdrop-blur-sm flex items-center justify-center text-ink hover:text-gold transition-colors shadow">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              {/* Tier badge */}
              <div className="absolute top-4 left-4 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2.5 py-1 rounded-full">
                {TIER_LABEL[tier].toUpperCase()} EDIT
              </div>
              {/* Overlay text bottom-left */}
              <div className="absolute left-5 right-5 bottom-5 text-ivory">
                <p className="eyebrow tracking-[0.32em] text-[0.6rem] text-ivory/85">
                  {dayLabel.toUpperCase()} · {lookLabel.toUpperCase()}
                </p>
                <h1 className="font-display text-3xl md:text-4xl xl:text-5xl leading-[1.05] tracking-[0.04em] mt-2 drop-shadow">
                  {lookData.name}
                </h1>
                <p className="font-serif italic text-[0.95rem] md:text-base text-ivory/90 mt-2 max-w-md">
                  &ldquo;{ctx.tagline}&rdquo;
                </p>
              </div>
            </div>

            {/* Itinerary context */}
            <div className="mt-5 flex flex-wrap gap-2">
              {ctx.itinerary.map((step) => (
                <span key={step} className="eyebrow tracking-[0.22em] text-[0.6rem] bg-cream border border-border/60 text-ink/75 px-3 py-1.5 rounded-full">
                  {step}
                </span>
              ))}
            </div>

            {/* Thumbnail strip */}
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {thumbStrip.map((t) =>
                t.active ? (
                  <div key={t.key} className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-[10px] overflow-hidden border-2 border-gold">
                    {t.image && <img src={t.image} alt={t.label} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                ) : (
                  <Link
                    key={t.key}
                    to="/portofino/day-$day/look-$look"
                    params={{ day, look: t.slug }}
                    search={{ tier }}
                    className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-[10px] overflow-hidden border border-border/60 hover:border-gold transition-colors"
                  >
                    {t.image && <img src={t.image} alt={t.label} className="w-full h-full object-cover" loading="lazy" />}
                  </Link>
                ),
              )}
            </div>

            {/* Look story */}
            <div className="mt-7 max-w-xl">
              <p className="font-serif italic text-[0.85rem] text-ink/55">{lookData.category}</p>
              <p className="font-serif text-[1rem] text-ink/80 leading-relaxed mt-2">{lookData.description}</p>
              <p className="font-serif italic text-[0.8rem] text-ink/55 mt-3">{lookData.fabric}</p>
              {lookData.finishingNote && (
                <p className="font-serif italic text-[0.8rem] text-ink/55 mt-1">Finishing: {lookData.finishingNote}</p>
              )}
            </div>
          </div>

          {/* RIGHT — Shopping rail (sticky on desktop) */}
          <aside className="lg:sticky lg:top-6 self-start">
            <div className="bg-cream/70 border border-border/60 rounded-[14px] p-5 md:p-6 shadow-[0_10px_40px_-25px_rgba(60,30,10,0.25)]">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink">Shop the Full Look</h2>
                  <p className="eyebrow tracking-[0.28em] text-[0.6rem] text-ink/60 mt-1">
                    {outfit.length} pieces · Curated for you
                  </p>
                </div>
              </div>

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
                        (active ? "bg-gold text-ink font-semibold" : "text-ink/70 hover:text-gold")
                      }
                    >
                      {TIER_LABEL[t].toUpperCase()}
                    </Link>
                  );
                })}
              </div>

              {/* Product stack */}
              <div className="mt-5 max-h-[640px] overflow-y-auto pr-1 space-y-3">
                {outfit.map((item, i) => (
                  <ShopRow key={item.brand + item.item + i} item={item} index={i + 1} />
                ))}
              </div>

              {/* Summary */}
              <div className="mt-5 pt-5 border-t border-border/60 flex items-baseline justify-between">
                <span className="font-serif text-[0.95rem] text-ink/75">Total Look Price</span>
                <span className="font-display text-2xl text-ink tracking-[0.04em]">
                  {fmt(totalsByTier[tier])}
                </span>
              </div>
              <button className="mt-3 w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-gold text-ink font-medium tracking-[0.18em] eyebrow text-[0.7rem] hover:bg-gold/85 transition-colors">
                <ShoppingBag className="w-4 h-4" /> Shop All Items
              </button>
              <button className="mt-2 w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border border-ink/70 text-ink eyebrow tracking-[0.18em] text-[0.7rem] hover:bg-ink hover:text-ivory transition-colors">
                <Heart className="w-4 h-4" /> Save This Look
              </button>
              <p className="mt-3 eyebrow tracking-[0.22em] text-[0.55rem] text-ink/55 text-center">
                Free shipping on orders over $100 · Easy 30-day returns
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* TIER COMPARE BAND */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-12 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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
                  "rounded-[12px] border p-5 transition-colors " +
                  (active
                    ? "bg-gold/15 border-gold"
                    : "bg-cream/60 border-border/60 hover:border-gold")
                }
              >
                <p className="eyebrow tracking-[0.3em] text-[0.6rem] text-gold">{TIER_LABEL[t].toUpperCase()}</p>
                <p className="font-display text-2xl text-ink mt-2 tracking-[0.04em]">{fmt(totalsByTier[t])}</p>
                <p className="font-serif italic text-[0.85rem] text-ink/60 mt-1">complete this look in {TIER_LABEL[t].toLowerCase()}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* DESTINATION CONTEXT */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-14 md:mt-20">
        <div className="bg-cream/60 border border-border/60 rounded-[14px] p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-6 md:gap-10">
            <div>
              <span className="eyebrow tracking-[0.3em] text-[0.65rem] text-gold">Where We&rsquo;d Wear This</span>
              <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
                {dayLabel} in Portofino
              </h2>
              <div className="my-3 h-px w-10 bg-gold" />
              <p className="font-serif italic text-[0.95rem] text-ink/65">{ctx.tagline}.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <ContextNote label="When" body={ctx.wear.when} />
              <ContextNote label="Packing" body={ctx.wear.packing} />
              <ContextNote label="Why it fits" body={ctx.wear.why} />
            </div>
          </div>
        </div>
      </section>

      {/* ALSO SOURCED (preserves Firecrawl-sourced hero pieces) */}
      {extras.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-14 md:mt-20">
          <header className="text-center mb-6">
            <span className="eyebrow tracking-[0.3em] text-[0.65rem] text-gold">Also Sourced This Day</span>
            <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink mt-2">Editor&rsquo;s additional finds</h2>
          </header>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {extras.map((item, i) => (
              <SourcedTile key={item.brand + item.item + i} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* YOU MAY ALSO LIKE */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-14 md:mt-20">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="eyebrow tracking-[0.3em] text-[0.65rem] text-gold">You May Also Like</span>
            <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink mt-2">More looks from the edit</h2>
          </div>
          <Link to="/portofino" search={{ tier }} className="hidden md:inline-flex eyebrow tracking-[0.28em] text-[0.6rem] text-gold hover:text-ink">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {related.map((r) => (
            <Link
              key={r.daySlug + r.lookSlug}
              to="/portofino/day-$day/look-$look"
              params={{ day: r.daySlug, look: r.lookSlug }}
              search={{ tier }}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[12px] bg-muted border border-border/60">
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-ivory">
                  <p className="eyebrow tracking-[0.28em] text-[0.55rem] text-ivory/85">{r.dayLabel.toUpperCase()} · {r.lookLabel.toUpperCase()}</p>
                  <p className="font-display text-base md:text-lg leading-tight mt-1 line-clamp-2">{r.name}</p>
                </div>
              </div>
              <p className="font-serif italic text-[0.78rem] text-ink/60 mt-2">{r.category}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ivory/95 backdrop-blur border-t border-border/60 px-4 py-3 flex items-center gap-3 shadow-[0_-10px_30px_-15px_rgba(60,30,10,0.25)]">
        <div className="flex-1">
          <p className="eyebrow tracking-[0.22em] text-[0.55rem] text-ink/60">{TIER_LABEL[tier]} total</p>
          <p className="font-display text-lg text-ink leading-none">{fmt(totalsByTier[tier])}</p>
        </div>
        <button className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-gold text-ink eyebrow tracking-[0.2em] text-[0.65rem] font-semibold">
          <ShoppingBag className="w-4 h-4" /> Shop This Look
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Subcomponents
// ──────────────────────────────────────────────────────────────
function ContextNote({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <span className="eyebrow tracking-[0.3em] text-[0.55rem] text-gold">{label}</span>
      <p className="font-serif text-[0.92rem] text-ink/80 leading-relaxed mt-2">{body}</p>
    </div>
  );
}

function ShopRow({ item, index }: { item: LookGridItem; index: number }) {
  const href = item.hasLiveSource ? resolveProductLink(item) : null;
  const cat = item.editCategory ? CATEGORY_LABEL[item.editCategory] : "Piece";

  return (
    <div className="group flex gap-3 bg-ivory border border-border/60 rounded-[12px] p-3 hover:border-gold/70 transition-colors">
      {/* Numbered thumb */}
      <div className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 bg-cream border border-border/60 rounded-[10px] overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={`${item.brand} ${item.item}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-2"
          />
        ) : (
          <div className={"w-10 h-10 rounded-full border flex items-center justify-center font-serif text-sm " + (href ? "border-gold/40 text-gold" : "border-ink/20 text-ink/40")}>
            {item.brand.charAt(0)}
          </div>
        )}
        <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-gold text-ink text-[0.6rem] font-semibold flex items-center justify-center">
          {index}
        </span>
      </div>

      {/* Copy + actions */}
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="eyebrow tracking-[0.22em] text-[0.55rem] text-ink/55">{cat}</p>
        <p className="font-serif text-[0.92rem] text-ink leading-snug truncate">{item.brand}</p>
        <p className="font-serif text-[0.82rem] text-ink/70 leading-snug line-clamp-2">{item.item}</p>
        <p className="font-serif italic text-[0.7rem] text-ink/50 mt-0.5">{shortDescriptor(item)}</p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="font-display text-base text-ink tracking-[0.03em]">{item.price}</span>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => trackOutbound({ brand: item.brand, item: item.item, href })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold text-ink eyebrow tracking-[0.2em] text-[0.55rem] hover:bg-gold/85 transition-colors"
            >
              Shop <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="eyebrow tracking-[0.22em] text-[0.55rem] text-ink/40">Sourcing</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SourcedTile({ item }: { item: ShopItem }) {
  const href = resolveProductLink(item);
  const inner = (
    <>
      <div className="relative aspect-square bg-cream border border-border/60 rounded-[10px] overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt={`${item.brand} ${item.item}`} loading="lazy" className="absolute inset-0 h-full w-full object-contain p-3" />
        ) : (
          <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center font-serif text-gold">{item.brand.charAt(0)}</div>
        )}
      </div>
      <p className="eyebrow tracking-[0.22em] text-[0.55rem] text-ink/55 mt-2">{item.brand}</p>
      <p className="font-serif text-[0.85rem] text-ink/85 leading-snug line-clamp-2">{item.item}</p>
      <p className="font-serif text-[0.78rem] text-gold mt-0.5">{item.price}</p>
    </>
  );
  if (!href) {
    return <div className="bg-ivory border border-dashed border-border/60 rounded-[12px] p-3">{inner}</div>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackOutbound({ brand: item.brand, item: item.item, href })}
      className="group block bg-ivory border border-border/60 rounded-[12px] p-3 hover:border-gold transition-colors"
    >
      {inner}
      <span className="eyebrow tracking-[0.22em] text-[0.55rem] text-gold mt-1 inline-block">Shop →</span>
    </a>
  );
}
