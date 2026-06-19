import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { trackOutbound } from "@/lib/utils";
import { type ProductDNA } from "@/data/productLibrary";
import { founderProductsQuery } from "@/components/MoreLikeThis";
import type { ActivityTag } from "@/data/styleDNA";
import type { ShopItem } from "@/data/portofino";
import { portofinoVisualDnaScore } from "@/lib/portofino-visual-dna";
import { filterAndDedupImages } from "@/lib/product-image-integrity";

/**
 * "More From The Edit" — dynamic, founder-library-driven discovery rail
 * that sits BELOW the editorially-curated Complete Looks on each
 * Portofino day. The editorial Complete Looks remain the source of
 * truth for the day's narrative; this rail surfaces the rest of the
 * 147-piece founder library that maps onto the same day's moments so
 * it becomes visible to users without ever overriding the hand-curated
 * looks above it.
 *
 * Rules:
 *   - Affiliate-eligible only (`affiliate` channel — covers both
 *     affiliate_retailer and affiliate_direct_brand).
 *   - Activity-tag intersection with the day's moments.
 *   - One product per brand (brand-diversity cap).
 *   - Excludes any product whose host+path already appears in the
 *     hand-curated Complete Look above, so the rail never repeats
 *     what the user just saw.
 */
export function MoreFromTheEdit({
  dayLabel,
  moments,
  hiddenItems,
  max = 8,
}: {
  dayLabel: string;
  moments: readonly ActivityTag[];
  hiddenItems: readonly ShopItem[];
  max?: number;
}) {
  const { data: founder = [] as ProductDNA[] } = useQuery({
    ...founderProductsQuery("portofino"),
    initialData: [] as ProductDNA[],
    initialDataUpdatedAt: 0,
  });

  const picks = useMemo(() => {
    if (!founder.length) return [] as ProductDNA[];
    const hiddenHosts = new Set(
      hiddenItems
        .map((s) => hostPath(s.href))
        .filter((v): v is string => Boolean(v)),
    );
    const momentSet = new Set<ActivityTag>(moments);
    const seenBrand = new Set<string>();
    const out: ProductDNA[] = [];

    const candidates = founder
      .filter((p) => p.channel === "affiliate")
      .filter((p) => p.activityTags.some((a) => momentSet.has(a)))
      .filter((p) => {
        const h = hostPath(p.href);
        return !h || !hiddenHosts.has(h);
      });

    // Portofino Visual DNA ranking — heavily rewards Mediterranean embroidery,
    // blue-and-white porcelain, Riviera florals, Italian harbor cues, and
    // destination color stories. Generic, technically-correct items sort to
    // the bottom. Day-scoped seed only breaks ties so each day surfaces a
    // slightly different cut without overriding the visual signal.
    const seed = hashString(dayLabel);
    const ranked = candidates
      .map((p, i) => ({ p, s: portofinoVisualDnaScore(p), tie: (seed ^ i) >>> 0 }))
      .sort((a, b) => (b.s - a.s) || (a.tie - b.tie))
      .map((x) => x.p);

    // Image integrity gate — drop placeholders, sketches, cross-brand image
    // collisions, and same-URL duplicates BEFORE the brand-cap loop, so a
    // quarantined card is replaced by the next eligible product.
    const { kept } = filterAndDedupImages(ranked);

    for (const p of kept) {
      const brand = p.brand.toLowerCase();
      if (seenBrand.has(brand)) continue;
      seenBrand.add(brand);
      out.push(p);
      if (out.length >= max) break;
    }
    return out;
  }, [founder, moments, hiddenItems, dayLabel, max]);

  if (picks.length === 0) return null;

  return (
    <section className="bg-cream/40 border-y border-border/40 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="eyebrow text-gold tracking-[0.4em] text-[0.6rem]">
            FROM THE FOUNDER LIBRARY
          </span>
          <div className="mx-auto my-5 h-px w-12 bg-gold/70" />
          <h2 className="font-display text-[1.6rem] md:text-[2.2rem] tracking-[0.08em] uppercase text-ink">
            More From The Edit
          </h2>
          <p className="font-serif italic text-base md:text-[1.05rem] text-ink/65 mt-3 max-w-2xl mx-auto leading-snug">
            Additional founder-curated pieces that share this day's mood — to
            extend the look beyond the editorial picks above.
          </p>
        </div>

        <ul
          className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
          aria-label="More from the founder edit"
        >
          {picks.map((p) => (
            <li key={p.id}>
              <EditTile product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EditTile({ product }: { product: ProductDNA }) {
  const href = product.href;
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener sponsored"
      onClick={() =>
        trackOutbound({ brand: product.brand, item: product.name, href })
      }
      className="group flex flex-col bg-ivory border border-ink/10 hover:border-gold/60 transition-colors"
    >
      <div className="relative aspect-[3/4] bg-cream/60 overflow-hidden">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {product.editorialLabel ? (
          <span className="absolute left-2.5 top-2.5 bg-ivory/90 text-ink eyebrow tracking-[0.22em] text-[0.55rem] px-2 py-1 backdrop-blur-sm border border-ink/10">
            {product.editorialLabel}
          </span>
        ) : null}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="eyebrow tracking-[0.28em] text-[0.6rem] text-gold">
          {product.brand.toUpperCase()}
        </p>
        <h3 className="font-serif text-[0.98rem] text-ink leading-snug mt-1.5 line-clamp-2">
          {product.name}
        </h3>
        <p className="eyebrow tracking-[0.22em] text-[0.55rem] text-ink/45 mt-2">
          {product.channel === "affiliate"
            ? `AT ${product.retailer.replace(/\.com$/, "").toUpperCase()}`
            : "DIRECT FROM BRAND"}
        </p>
        <span className="mt-4 eyebrow tracking-[0.26em] text-[0.6rem] text-ink border-b border-gold pb-0.5 self-start group-hover:text-gold transition-colors">
          SHOP →
        </span>
      </div>
    </a>
  );
}

function hostPath(href: string | undefined | null): string | null {
  if (!href) return null;
  try {
    const u = new URL(href);
    return (u.hostname.replace(/^www\./, "") + u.pathname).toLowerCase();
  } catch {
    return null;
  }
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
