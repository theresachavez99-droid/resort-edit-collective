import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { brandCategories, type Brand } from "@/data/brands";
import { absoluteUrl } from "@/lib/site";
import { Input } from "@/components/ui/input";

import brandsHero from "@/assets/brands-hero-mediterranean-dressing-room.jpg.asset.json";
import { EditorialHero } from "@/components/EditorialHero";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands We Love | Resort Edit | Dressed for the destination" },
      {
        name: "description",
        content:
          "The international resort houses, swim ateliers, and destination labels behind every Resort Edit look — Italian, Greek, Iberian, Latin American, and Australian.",
      },
      { property: "og:title", content: "Brands We Love | Resort Edit | Dressed for the destination" },
      {
        property: "og:description",
        content:
          "Mediterranean icons, swim & beach club, resortwear & kaftans, raffia, jewelry, and destination finds.",
      },
      { property: "og:url", content: absoluteUrl("/brands") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/brands") }],
  }),
  component: BrandsPage,
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CATEGORY_INTROS: Record<string, string> = {
  "Mediterranean Icons": "The houses that define modern Riviera dressing.",
  "Swim & Beach Club": "Sculptural swim for yachts, cabanas, and long afternoons by the sea.",
  "Resortwear & Kaftans": "Linen, embroidery, and breezy separates built for heat and light.",
  "Accessories & Raffia": "The hand-woven and Italian-leather pieces that finish every look.",
  Jewelry: "Saltwater-proof gold and the heirlooms we layer from morning to night.",
  "Resort Footwear": "Greek sandals, Spanish espadrilles, Florentine evening heels.",
  "Beyond the Riviera": "The labels that take Resort Edit beyond the Mediterranean.",
};

// Editor's Picks — tight 8-brand founder edit (order matters).
const FOUNDER_FAVORITE_SLUGS = [
  "alexandra-miro",
  "vix-paula-hermanny",
  "zimmermann",
  "la-doublej",
  "loewe",
  "melissa-odabash",
  "sir",
  "aquazzura",
];

const FAVORITE_TAGLINES: Record<string, string> = {
  "alexandra-miro":
    "Glamorous swim-to-lunch dressing — flattering silhouettes and refined Mediterranean femininity.",
  "vix-paula-hermanny":
    "Polished Brazilian swim and beach-to-lunch separates with a grown-up ease.",
  "zimmermann": "Romantic Australian resort that photographs beautifully by the sea.",
  "la-doublej": "Vintage Italian prints, modern cut — Milan via Sicily.",
  "loewe": "For Paula's Ibiza — raffia and leather bags and accessories, not the clothing.",
  "melissa-odabash": "The Riviera swim authority — cabana-ready one-pieces and bikinis.",
  "sir": "Australian softness, perfectly cut — dinner dresses that travel.",
  "aquazzura": "Florentine sandals and heels with cinematic poise.",
};

// Page-local hierarchy badges (public /brands only).
const BRAND_BADGE: Record<string, string> = {
  "alexandra-miro": "Editor's Pick",
  "vix-paula-hermanny": "Editor's Pick",
  "zimmermann": "Resort Edit Essential",
  "la-doublej": "Mediterranean Icon",
  "loewe": "Paula's Ibiza — Accessories",
  "melissa-odabash": "Resort Edit Essential",
  "sir": "Editor's Pick",
  "aquazzura": "Resort Edit Essential",
  // Ambient category badges (no Editor's Pick treatment)
  "etro": "Mediterranean Icon",
  "missoni": "Mediterranean Icon",
  "missoni-mare": "Mediterranean Icon",
  "emporio-sirenuse": "Mediterranean Icon",
  "loretta-caponi": "Mediterranean Icon",
  "dolce-and-gabbana": "Mediterranean Icon",
  "karla-colletto": "Resort Edit Essential",
  "oseree": "Editor's Pick",
  "matteau": "Editor's Pick",
  "charo-ruiz-ibiza": "Mediterranean Icon",
  "l-agence": "Resort Edit Essential",
  "ancient-greek-sandals": "Resort Edit Essential",
  "k-jacques": "Mediterranean Icon",
  "manolo-blahnik": "Mediterranean Icon",
  "rene-caovilla": "Mediterranean Icon",
  "castaner": "Mediterranean Icon",
  "dragon-diffusion": "Editor's Pick",
  "cult-gaia": "Editor's Pick",
  "hereu": "Editor's Pick",
  "farm-rio": "Editor's Pick",
};

// Public founder notes — only for brands the founder truly champions.
const FOUNDER_NOTES: Record<string, string> = {
  "alexandra-miro":
    "One of our favorite houses for swim-to-lunch dressing — the cuts are effortlessly flattering.",
  "vix-paula-hermanny":
    "Brazilian swim done to a European standard — the beach-to-lunch pieces travel beautifully.",
  "zimmermann": "Consistently photographs beautifully in coastal destinations.",
  "loewe": "For Paula's Ibiza only — the raffia and leather accessories we carry for years.",
  "ancient-greek-sandals": "We pack a pair on every Mediterranean trip.",
};

// Page-local restrained copy overrides (leaves shared data untouched).
const BRAND_BLURB_OVERRIDES: Record<string, string> = {
  "pucci": "Florentine heritage — an occasional splurge, not a staple.",
  "loewe":
    "Paula's Ibiza accessories — raffia baskets, woven leather, and the resort bags we return to.",
};

// Slugs hidden from the public /brands page (page-local only; approvals unchanged).
const HIDDEN_SLUGS = new Set<string>(["callas-milano"]);

// Page-local re-homing: brands whose visible category on /brands differs from shared data.
const CATEGORY_RELOCATIONS: Record<string, string> = {
  loewe: "Accessories & Raffia",
};

function applyOverrides(brand: Brand): Brand {
  const blurb = BRAND_BLURB_OVERRIDES[brand.slug] ?? brand.blurb;
  return { ...brand, blurb };
}

// Build a page-local view of the brand directory: hide + relocate + override copy.
const viewCategories: Array<{ title: string; description: string; brands: Brand[] }> =
  brandCategories.map((cat) => {
    const kept = cat.brands
      .filter((b) => !HIDDEN_SLUGS.has(b.slug))
      .filter((b) => (CATEGORY_RELOCATIONS[b.slug] ?? cat.title) === cat.title)
      .map(applyOverrides);
    // Add relocated arrivals
    const relocated = brandCategories
      .flatMap((c) => c.brands)
      .filter(
        (b) =>
          CATEGORY_RELOCATIONS[b.slug] === cat.title &&
          !HIDDEN_SLUGS.has(b.slug) &&
          !kept.some((k) => k.slug === b.slug),
      )
      .map(applyOverrides);
    return { ...cat, brands: [...kept, ...relocated] };
  });

const allBrands: Array<Brand & { category: string }> = viewCategories.flatMap((c) =>
  c.brands.map((b) => ({ ...b, category: c.title })),
);

const founderFavorites = FOUNDER_FAVORITE_SLUGS.map((slug) =>
  allBrands.find((b) => b.slug === slug),
).filter(Boolean) as Array<Brand & { category: string }>;

const FILTERS = [
  "All",
  "Editor's Picks",
  "Mediterranean Icons",
  "Swim & Beach Club",
  "Resortwear & Kaftans",
  "Accessories & Raffia",
  "Jewelry",
  "Resort Footwear",
  "Beyond the Riviera",
] as const;

const INITIAL_VISIBLE = 8;

function BrandCard({ brand }: { brand: Brand & { category?: string } }) {
  const badge = BRAND_BADGE[brand.slug];
  const note = FOUNDER_NOTES[brand.slug];
  return (
    <Link
      to="/brands/$slug"
      params={{ slug: brand.slug }}
      className="group block bg-ivory border border-border/40 hover:border-gold/60 transition-colors p-6 md:p-7 h-full"
    >
      <div className="flex items-start justify-between gap-3 min-h-[1.75rem]">
        {badge ? (
          <span className="eyebrow text-[0.55rem] text-gold">{badge}</span>
        ) : (
          <span />
        )}
        <span className="eyebrow text-[0.55rem] text-ink/35 group-hover:text-gold transition-colors">
          Explore →
        </span>
      </div>
      <h3 className="mt-3 font-display text-2xl tracking-wide text-ink group-hover:text-gold transition-colors">
        {brand.name}
      </h3>
      {brand.blurb && (
        <p className="mt-2 font-serif text-[0.95rem] text-ink/70 leading-snug">{brand.blurb}</p>
      )}
      {brand.bestFor && brand.bestFor.length > 0 && (
        <p className="mt-4 eyebrow text-[0.55rem] text-ink/55">
          <span className="text-gold">Best for</span>
          <span className="mx-1.5 text-ink/30">·</span>
          {brand.bestFor.join(" · ")}
        </p>
      )}
      {note && (
        <p className="mt-4 border-t border-border/40 pt-3 font-serif italic text-[0.85rem] text-ink/60 leading-snug">
          <span className="eyebrow not-italic text-[0.55rem] text-gold block mb-1">
            Editor's Note
          </span>
          “{note}”
        </p>
      )}
    </Link>
  );
}

function CategorySection({
  category,
}: {
  category: { title: string; brands: Brand[] };
}) {
  const [expanded, setExpanded] = React.useState(false);
  const intro = CATEGORY_INTROS[category.title];
  const visible = expanded ? category.brands : category.brands.slice(0, INITIAL_VISIBLE);
  const hidden = Math.max(0, category.brands.length - INITIAL_VISIBLE);

  return (
    <section id={slugify(category.title)} className="scroll-mt-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-4">
          <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink">
            {category.title}
          </h2>
          <span className="eyebrow text-[0.55rem] text-ink/45 whitespace-nowrap">
            {String(category.brands.length).padStart(2, "0")} Labels
          </span>
        </div>
        {intro && (
          <p className="mt-4 font-serif italic text-base text-ink/65 leading-snug max-w-2xl">
            {intro}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {visible.map((brand) => (
            <BrandCard key={brand.slug} brand={brand} />
          ))}
        </div>
        {hidden > 0 && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="eyebrow text-[0.65rem] text-ink border-b border-gold/60 pb-1 hover:text-gold transition-colors"
            >
              {expanded ? "Show Less" : `View All Brands (${category.brands.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function BrandsPage() {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("All");

  const q = query.trim().toLowerCase();
  const isSearchActive = q.length > 0 || filter !== "All";

  const searchResults = React.useMemo(() => {
    if (!isSearchActive) return [];
    return allBrands.filter((b) => {
      if (filter === "Editor's Picks") {
        if (!FOUNDER_FAVORITE_SLUGS.includes(b.slug)) return false;
      } else if (filter !== "All") {
        if (b.category !== filter) return false;
      }
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        (b.blurb ?? "").toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.bestFor ?? []).some((x) => x.toLowerCase().includes(q))
      );
    });
  }, [q, filter, isSearchActive]);

  return (
    <div className="bg-ivory">
      {/* HERO */}
      <EditorialHero
        src={brandsHero.url}
        alt="Mediterranean dressing room — curated resort wardrobe, raffia, and quiet luxury overlooking the sea"
        focal={{
          base: { x: 50, y: 55 },
          md: { x: 50, y: 58 },
          lg: { x: 50, y: 62 },
        }}
        heightClassName="h-[43vw] md:h-[38vw] max-h-[560px] min-h-[180px]"
        width={1754}
        imgHeight={896}
        priority
      />
      <h1 className="sr-only">Brands We Love</h1>

      {/* WHY THESE BRANDS */}
      <section className="mx-auto max-w-[1180px] px-6 pt-16 md:pt-20 pb-10 md:pb-14">
        <div className="grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
    <span className="eyebrow text-gold">Our Standard</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl tracking-[0.04em] text-ink">
              Our Editorial Standard
            </h2>
          </div>
          <div className="md:col-span-7 space-y-4 font-serif text-lg text-ink/75 leading-relaxed">
            <p>
              Every brand featured on Resort Edit is evaluated through the same editorial lens. We look for exceptional craftsmanship, destination relevance, timeless design, and the ability to create wardrobes that feel both beautiful and effortless to travel with.
            </p>
            <p>
              Some are globally recognized luxury houses. Others are remarkable discoveries. What they share is a place within the Resort Edit point of view.
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="mx-auto max-w-[1180px] px-6 pt-10 md:pt-14 pb-8 md:pb-10" id="discover">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow text-gold">Discover</span>
          <h2 className="mt-4 font-display text-3xl md:text-4xl tracking-[0.04em] text-ink">
            Find a Designer
          </h2>
        </div>
        <div className="mt-8 max-w-xl mx-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search designers, categories, or moments…"
            className="h-12 rounded-none border-x-0 border-t-0 border-b border-ink/30 bg-transparent text-center font-serif text-lg focus-visible:ring-0 focus-visible:border-gold placeholder:text-ink/40"
          />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "eyebrow text-[0.6rem] px-3 py-1.5 border transition-colors " +
                (filter === f
                  ? "bg-ink text-ivory border-ink"
                  : "border-border/60 text-ink/65 hover:border-gold hover:text-gold")
              }
            >
              {f}
            </button>
          ))}
        </div>
        {isSearchActive && (
          <div className="mt-10">
            <p className="text-center eyebrow text-[0.6rem] text-ink/55">
              {searchResults.length} {searchResults.length === 1 ? "Designer" : "Designers"}
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResults.map((brand) => (
                <BrandCard key={brand.slug} brand={brand} />
              ))}
            </div>
            {searchResults.length === 0 && (
              <p className="mt-8 text-center font-serif italic text-ink/55">
                No designers matched. Try a different category or search term.
              </p>
            )}
          </div>
        )}
      </section>

      {/* FOUNDER FAVORITES */}
      <section className="bg-cream/40 border-y border-border/40">
        <div className="mx-auto max-w-[1360px] px-6 pt-12 md:pt-16 pb-16 md:pb-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-gold">The Edit</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-[0.04em] text-ink">
              Editor's Picks
            </h2>
            <p className="mt-5 font-serif italic text-ink/65">
              A curated collection of designers that best represent the Resort Edit aesthetic and editorial point of view.
            </p>
          </div>
          <div className="mt-14 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {founderFavorites.map((brand) => (
              <Link
                key={brand.slug}
                to="/brands/$slug"
                params={{ slug: brand.slug }}
                className="group block bg-ivory border border-border/50 hover:border-gold transition-colors p-7"
              >
                <span className="eyebrow text-[0.55rem] text-gold">
                  {BRAND_BADGE[brand.slug] ?? "Editor's Pick"}
                </span>
                <h3 className="mt-3 font-display text-3xl tracking-wide text-ink group-hover:text-gold transition-colors">
                  {brand.name}
                </h3>
                <p className="mt-3 font-serif italic text-[0.95rem] text-ink/70 leading-snug min-h-[2.75rem]">
                  {FAVORITE_TAGLINES[brand.slug] ?? brand.blurb}
                </p>
                <span className="mt-6 inline-block eyebrow text-[0.6rem] text-ink border-b border-gold/60 pb-0.5 group-hover:text-gold transition-colors">
                  Explore Brand →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY SECTIONS */}
      <div className="mt-8 md:mt-10 space-y-8 md:space-y-10">
        {viewCategories.map((cat) => (
          <CategorySection key={cat.title} category={cat} />
        ))}
      </div>

      {/* AFFILIATE DISCLOSURE */}
      <p className="mt-10 text-center eyebrow text-[0.55rem] text-ink/45 max-w-xl mx-auto px-6">
        Resort Edit is reader-supported. Some links may earn a small commission at no cost to you.
      </p>

      {/* EDITORIAL SIGN-OFF */}
      <section className="mx-auto max-w-[1180px] px-6 pt-10 pb-16 md:pb-20 text-center">
        <div className="border-t border-border/30 pt-10 md:pt-14">
          <p className="font-serif italic text-base md:text-lg text-ink/55 max-w-2xl mx-auto leading-relaxed">
            Every designer featured here has earned a place in the Resort Edit wardrobe.
          </p>
        </div>
      </section>
    </div>
  );
}
