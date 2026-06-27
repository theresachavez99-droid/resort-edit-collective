import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getPortofinoMoment } from "@/lib/portofino-moments.functions";
import {
  getPortofinoMomentDef,
  getJourneyNeighbors,
  PORTOFINO_MOMENT_SLUG_ALIASES,
} from "@/lib/portofino-moment-fallbacks";
import { OtherPortofinoMoments } from "@/components/OtherPortofinoMoments";
import { absoluteUrl } from "@/lib/site";
import { findLook, lookbook, LOOK_CATEGORY_LABEL, LOOK_CATEGORY_ORDER, type Look, type LookProduct } from "@/data/lookbook";
import { lookOverrideForPublic, type OverrideItem } from "@/data/lookOverrides";
import { trackOutbound } from "@/lib/utils";
import { TIER_SLUGS, type LookSlug } from "@/lib/portofino-spec";
import type { LegacyDaySlug } from "@/lib/portofino-moment-fallbacks";
import { SaveLookButton } from "@/components/SaveLookButton";

const momentQuery = (slug: string) =>
  queryOptions({
    queryKey: ["portofino-moment", slug],
    queryFn: () => getPortofinoMoment({ data: { moment_slug: slug } }),
  });

export const Route = createFileRoute("/portofino/$moment")({
  loader: async ({ params, context }) => {
    // Redirect legacy/alias slugs to the canonical moment slug.
    const aliased = PORTOFINO_MOMENT_SLUG_ALIASES[params.moment];
    if (aliased) {
      throw redirect({
        to: "/portofino/$moment",
        params: { moment: aliased },
        replace: true,
      });
    }
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
          Browse all curated moments
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

  // Featured (canonical) look for this moment.
  const featuredLook = findLook(card.legacy_day_slug, card.look_slug);
  const featuredShop = resolveShopProducts(card.legacy_day_slug, card.look_slug);
  const featuredPieceCount = featuredShop.filter(shopEntryIsLive).length;
  const featuredSlots = summarizeSlots(featuredShop);

  // Sibling looks within the same day — "More Ways to Dress for {moment}".
  const siblings: Look[] = lookbook.filter(
    (l) => l.daySlug === card.legacy_day_slug && l.lookSlug !== card.look_slug,
  );

  // Inline expansion state: which look's shop grid is currently open.
  // `featured` opens the featured look; `look-a|b|c` opens that sibling.
  const [openShop, setOpenShop] = useState<string | null>(null);

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
      <section className="relative h-[36vh] md:h-[48vh] min-h-[280px] w-full overflow-hidden bg-ink">
        <img
          src={heroImage}
          alt={`${card.moment_name} — Portofino`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/45" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-6 md:pb-8 text-ivory">
          <Link
            to="/portofino"
            className="eyebrow text-[0.62rem] tracking-[0.34em] text-ivory/85 hover:text-gold border-b border-ivory/40 hover:border-gold pb-1"
          >
            PORTOFINO
          </Link>
          <h1 className="font-display text-4xl md:text-5xl mt-3 tracking-[0.05em] leading-[1.05]">
            {card.moment_name}
          </h1>
          <p className="font-serif italic text-base md:text-lg text-ivory/90 mt-2.5 max-w-2xl leading-relaxed">
            {card.narrative}
          </p>
          <div className="mt-4">
            <SaveLookButton
              tone="light"
              source="portofino_moment_hero"
              look={{
                id: `portofino/${slug}`,
                destination: "Portofino",
                activity: card.moment_name,
                title: card.moment_name,
                description: card.narrative,
                image: card.hero_banner_image ?? heroImage,
                url: `/portofino/${slug}`,
              }}
            />
          </div>
        </div>
      </section>

      {/* FEATURED LOOK — editorial hero styling recommendation */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_minmax(280px,0.9fr)] gap-8 md:gap-12 items-center">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream/40 border border-border/60">
              <img
                src={resolved.image}
                alt={`${resolved.title} — Portofino featured look`}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
            <div className="space-y-4 lg:pl-4">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                Editor's Pick
              </span>
              <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink leading-[1.1]">
                {featuredLook?.title ?? resolved.title}
              </h2>
              <p className="font-serif italic text-[1rem] md:text-[1.05rem] text-ink/80 leading-relaxed max-w-prose">
                {featuredLook?.caption ?? card.narrative}
              </p>
              {featuredSlots.length > 0 && (
                <div className="border-t border-border/60 pt-4">
                  <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-ink/55">
                    Complete Outfit Includes
                  </span>
                  <ul className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 font-serif italic text-[0.92rem] text-ink/80">
                    {featuredSlots.map((s) => (
                      <li key={s} className="flex items-baseline gap-2">
                        <span className="text-gold/70 text-[0.6rem]">●</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
              {featuredShop.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenShop((cur) => (cur === "featured" ? null : "featured"))
                    }
                    aria-expanded={openShop === "featured"}
                    aria-controls="shop-featured"
                    className="inline-flex items-center gap-3 eyebrow text-[0.7rem] tracking-[0.32em] text-ivory bg-ink hover:bg-gold transition-colors px-6 py-3"
                  >
                    {openShop === "featured" ? "Hide Complete Look" : "Shop Complete Look"}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${openShop === "featured" ? "rotate-180" : ""}`}
                    />
                  </button>
                  {featuredPieceCount > 0 && (
                    <span className="font-serif italic text-[0.85rem] text-ink/55">
                      {featuredPieceCount} curated pieces
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {openShop === "featured" && featuredShop.length > 0 && (
            <InlineShop
              id="shop-featured"
              heading={`Shop ${featuredLook?.title ?? card.moment_name}`}
              entries={featuredShop}
            />
          )}
        </div>
      </section>

      {/* MORE WAYS TO DRESS FOR THIS MOMENT — editorial look grid */}
      {siblings.length > 0 && (
        <section className="bg-cream/40 border-t border-border/40">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
            <div className="mb-8 md:mb-10 max-w-2xl">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                THE EDIT
              </span>
              <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
                More Ways to Dress for {card.moment_name}
              </h3>
              <p className="font-serif italic text-[0.95rem] text-ink/70 mt-3 leading-relaxed">
                Additional looks styled for this moment — each one a complete outfit, ready when you are.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {siblings.map((sib) => (
                <EditorialLookCard
                  key={sib.id}
                  look={sib}
                  isOpen={openShop === sib.lookSlug}
                  onToggle={() =>
                    setOpenShop((cur) => (cur === sib.lookSlug ? null : sib.lookSlug))
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <JourneyPrevNext slug={slug} />
      <OtherPortofinoMoments excludeSlugs={[slug]} />
    </div>
  );
}

function JourneyPrevNext({ slug }: { slug: string }) {
  const { prev, next } = getJourneyNeighbors(slug);
  return (
    <section className="bg-ivory border-t border-border/40">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="text-left">
          {prev ? (
            <Link
              to="/portofino/$moment"
              params={{ moment: prev.moment_slug }}
              className="group inline-flex flex-col"
            >
              <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-ink/55">← Previous Chapter</span>
              <span className="font-display text-lg md:text-xl text-ink mt-1.5 group-hover:text-gold transition-colors">
                {prev.moment_name}
              </span>
            </Link>
          ) : (
            <Link to="/portofino" className="group inline-flex flex-col">
              <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-ink/55">← Back</span>
              <span className="font-display text-lg md:text-xl text-ink mt-1.5 group-hover:text-gold transition-colors">
                Portofino Overview
              </span>
            </Link>
          )}
        </div>
        <div className="text-right sm:text-right">
          {next ? (
            <Link
              to="/portofino/$moment"
              params={{ moment: next.moment_slug }}
              className="group inline-flex flex-col items-end"
            >
              <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-gold">Next Chapter →</span>
              <span className="font-display text-lg md:text-xl text-ink mt-1.5 group-hover:text-gold transition-colors">
                {next.moment_name}
              </span>
            </Link>
          ) : (
            <Link to="/portofino" className="group inline-flex flex-col items-end">
              <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-gold">Return to Portofino →</span>
              <span className="font-display text-lg md:text-xl text-ink mt-1.5 group-hover:text-gold transition-colors">
                The Full Itinerary
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// Helpers — shop product resolution + inline editorial cards
// ──────────────────────────────────────────────────────────────
type ShopEntry = {
  category?: string;
  product: LookProduct | OverrideItem;
  kind: "category" | "override";
};

function resolveShopProducts(daySlug: LegacyDaySlug, lookSlug: LookSlug): ShopEntry[] {
  const look = findLook(daySlug, lookSlug);
  const override = look ? lookOverrideForPublic(daySlug, lookSlug) : null;
  if (override) {
    return override.main.map((p) => ({ product: p, kind: "override" as const }));
  }
  if (!look) return [];
  const firstTierSlug =
    TIER_SLUGS.find((t) =>
      LOOK_CATEGORY_ORDER.some((c) => !look.tiers[t].products[c].isPlaceholder),
    ) ?? TIER_SLUGS[0];
  const products = look.tiers[firstTierSlug].products;
  return LOOK_CATEGORY_ORDER.map((c) => ({
    category: LOOK_CATEGORY_LABEL[c],
    product: products[c],
    kind: "category" as const,
  }));
}

function shopEntryIsLive(entry: ShopEntry): boolean {
  if (entry.kind === "override") {
    const o = entry.product as OverrideItem;
    return !!o.url && !o.url.startsWith("AFF-");
  }
  const p = entry.product as LookProduct;
  return !p.isPlaceholder;
}

/**
 * Build a short, deduped list of slot labels for the "Complete Outfit Includes"
 * summary. Counts live (non-placeholder) entries only, preserves canonical order,
 * and falls back gracefully for override-driven looks.
 */
function summarizeSlots(entries: ShopEntry[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of entries) {
    if (!shopEntryIsLive(e)) continue;
    let label: string | undefined;
    if (e.kind === "category") label = e.category;
    else label = (e.product as OverrideItem).slotLabel;
    if (!label) continue;
    const norm = label.trim();
    if (seen.has(norm.toLowerCase())) continue;
    seen.add(norm.toLowerCase());
    out.push(norm);
  }
  return out;
}

function EditorialLookCard({
  look,
  isOpen,
  onToggle,
}: {
  look: Look;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const entries = resolveShopProducts(look.daySlug, look.lookSlug);
  const liveCount = entries.filter(shopEntryIsLive).length;
  return (
    <article className="flex flex-col bg-ivory border border-border/40">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <img
          src={look.heroImage}
          alt={`${look.title} — additional Portofino look`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
          COMPLETE OUTFIT
        </span>
      </div>
      <div className="p-6 md:p-8 flex flex-col gap-3">
        <h4 className="font-display text-2xl md:text-[1.75rem] tracking-[0.04em] text-ink leading-[1.15]">
          {look.title}
        </h4>
        <p className="font-serif italic text-[0.95rem] text-ink/75 leading-relaxed line-clamp-3">
          {look.caption}
        </p>
        <p className="eyebrow text-[0.58rem] tracking-[0.32em] text-ink/60">
          Complete Outfit{liveCount > 0 ? ` · ${liveCount} Curated Pieces` : ""}
        </p>
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={`shop-${look.daySlug}-${look.lookSlug}`}
            className="inline-flex items-center gap-2 eyebrow text-[0.64rem] tracking-[0.32em] text-ivory bg-ink hover:bg-gold transition-colors px-5 py-2.5 self-start"
          >
            {isOpen ? "Hide Complete Look" : "View Complete Look"}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
      {isOpen && entries.length > 0 && (
        <div className="border-t border-border/40 px-5 md:px-7 py-7">
          <InlineShop
            id={`shop-${look.daySlug}-${look.lookSlug}`}
            heading={`Shop ${look.title}`}
            entries={entries}
            compact
          />
        </div>
      )}
    </article>
  );
}

function InlineShop({
  id,
  heading,
  entries,
  compact = false,
}: {
  id: string;
  heading: string;
  entries: ShopEntry[];
  compact?: boolean;
}) {
  return (
    <div id={id} className={compact ? "" : "mt-14 md:mt-16 border-t border-border/40 pt-10"}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="eyebrow text-[0.6rem] tracking-[0.34em] text-gold">
            Shop The Look
          </span>
          <h4 className="font-display text-xl md:text-2xl tracking-[0.04em] text-ink mt-2">
            {heading}
          </h4>
        </div>
      </div>
      <div
        className={`grid gap-4 md:gap-5 ${
          compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {entries.map((entry, i) => (
          <ShopCard key={i} entry={entry} />
        ))}
      </div>
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
