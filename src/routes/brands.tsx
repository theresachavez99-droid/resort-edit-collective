import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { brandCategories, type Brand } from "@/data/brands";
import { absoluteUrl } from "@/lib/site";
import { Input } from "@/components/ui/input";

import heroEditorial from "@/assets/about-hero-portofino-golden-harbor.png.asset.json";
import bannerMedIcons from "@/assets/uploads/portofino/arrival-banner-peach-facade-bougainvillea.png.asset.json";
import bannerSwim from "@/assets/uploads/portofino/beach-club-long-lunch-banner-cabanas.png.asset.json";
import bannerResort from "@/assets/uploads/portofino/exploring-the-harbor-banner-lemon-quay.png.asset.json";
import bannerAccessories from "@/assets/uploads/portofino/harbor-aperitivo-banner-golden-hour.png.asset.json";
import bannerJewelry from "@/assets/uploads/portofino/riviera-dinner-harbor-terrace-sunset.png.asset.json";
import bannerFootwear from "@/assets/uploads/portofino/sunset-views-harbor-golden-hour.png.asset.json";
import bannerBeyond from "@/assets/uploads/portofino/yacht-day-harbor.png.asset.json";

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

const CATEGORY_BANNERS: Record<string, { url: string; intro: string }> = {
  "Mediterranean Icons": {
    url: bannerMedIcons.url,
    intro: "The houses that define modern Riviera dressing.",
  },
  "Swim & Beach Club": {
    url: bannerSwim.url,
    intro: "Sculptural swim for yachts, cabanas, and long afternoons by the sea.",
  },
  "Resortwear & Kaftans": {
    url: bannerResort.url,
    intro: "Linen, embroidery, and breezy separates built for heat and light.",
  },
  "Accessories & Raffia": {
    url: bannerAccessories.url,
    intro: "The hand-woven and Italian-leather pieces that finish every look.",
  },
  Jewelry: {
    url: bannerJewelry.url,
    intro: "Saltwater-proof gold and the heirlooms we layer from morning to night.",
  },
  "Resort Footwear": {
    url: bannerFootwear.url,
    intro: "Greek sandals, Spanish espadrilles, Florentine evening heels.",
  },
  "Beyond the Riviera": {
    url: bannerBeyond.url,
    intro: "The labels that take Resort Edit beyond the Mediterranean.",
  },
};

const EMPHASIS_CATEGORIES = new Set([
  "Mediterranean Icons",
  "Swim & Beach Club",
  "Resortwear & Kaftans",
]);

// Editorial tagline overrides for Founder Favorites
const FOUNDER_FAVORITE_SLUGS = [
  "johanna-ortiz",
  "alexandra-miro",
  "zimmermann",
  "agua-by-agua-bendita",
  "la-doublej",
  "eres",
  "missoni",
  "loewe",
  "hereu",
  "aquazzura",
];

const FAVORITE_TAGLINES: Record<string, string> = {
  "johanna-ortiz": "Master of destination dressing.",
  "alexandra-miro": "Capri-print cottons, embroidered ease.",
  "zimmermann": "Romantic resort, unmistakably Australian.",
  "agua-by-agua-bendita": "Embroidered Colombian craft, slow resort.",
  "la-doublej": "Vintage Italian prints, modern cut.",
  "eres": "The definitive luxury swim collection.",
  "missoni": "Varese chevrons, eternal Riviera.",
  "loewe": "Spanish raffia and sculptural leather.",
  "hereu": "Modern Spanish artisan.",
  "aquazzura": "Florentine heels with cinematic poise.",
};

// Founder hierarchy badges
const BRAND_BADGE: Record<string, string> = {
  "johanna-ortiz": "Founder Favorite",
  "alexandra-miro": "Founder Favorite",
  "zimmermann": "Resort Edit Essential",
  "agua-by-agua-bendita": "Founder Favorite",
  "la-doublej": "Mediterranean Icon",
  "eres": "Resort Edit Essential",
  "missoni": "Mediterranean Icon",
  "loewe": "Mediterranean Icon",
  "hereu": "Founder Favorite",
  "aquazzura": "Resort Edit Essential",
  "pucci": "Mediterranean Icon",
  "etro": "Mediterranean Icon",
  "missoni-mare": "Mediterranean Icon",
  "emporio-sirenuse": "Mediterranean Icon",
  "callas-milano": "Mediterranean Icon",
  "loretta-caponi": "Mediterranean Icon",
  "dolce-and-gabbana": "Mediterranean Icon",
  "melissa-odabash": "Resort Edit Essential",
  "karla-colletto": "Resort Edit Essential",
  "oseree": "Founder Favorite",
  "matteau": "Founder Favorite",
  "maygel-coronel": "Emerging Designer",
  "marysia": "Emerging Designer",
  "vix-paula-hermanny": "Emerging Designer",
  "posse": "Emerging Designer",
  "sir": "Founder Favorite",
  "alemais": "Emerging Designer",
  "borgo-de-nor": "Emerging Designer",
  "silvia-tcherassi": "Emerging Designer",
  "patbo": "Emerging Designer",
  "charo-ruiz-ibiza": "Mediterranean Icon",
  "l-agence": "Resort Edit Essential",
  "ancient-greek-sandals": "Resort Edit Essential",
  "k-jacques": "Mediterranean Icon",
  "manolo-blahnik": "Mediterranean Icon",
  "rene-caovilla": "Mediterranean Icon",
  "castaner": "Mediterranean Icon",
  "dragon-diffusion": "Founder Favorite",
  "cult-gaia": "Founder Favorite",
  "heimat-atlantica": "Emerging Designer",
  "farm-rio": "Founder Favorite",
};

// Optional founder insider notes shown beneath selected brands
const FOUNDER_NOTES: Record<string, string> = {
  "alexandra-miro": "One of our favorite destinations for Mediterranean embroidery.",
  "callas-milano": "The first place we look for elevated linen tailoring.",
  "zimmermann": "Consistently photographs beautifully in coastal destinations.",
  "eres": "Quiet, sculptural, and the most discreet luxury swim on the boat.",
  "loewe": "Worth the investment — the raffia bags we carry for years.",
  "ancient-greek-sandals": "We pack a pair on every Mediterranean trip.",
};

const allBrands: Array<Brand & { category: string }> = brandCategories.flatMap((c) =>
  c.brands.map((b) => ({ ...b, category: c.title })),
);

const founderFavorites = FOUNDER_FAVORITE_SLUGS.map((slug) =>
  allBrands.find((b) => b.slug === slug),
).filter(Boolean) as Array<Brand & { category: string }>;

const FILTERS = [
  "All",
  "Founder Favorites",
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
            Founder Note
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
  const banner = CATEGORY_BANNERS[category.title];
  const emphasis = EMPHASIS_CATEGORIES.has(category.title);
  const visible = expanded ? category.brands : category.brands.slice(0, INITIAL_VISIBLE);
  const hidden = Math.max(0, category.brands.length - INITIAL_VISIBLE);

  return (
    <section id={slugify(category.title)} className="scroll-mt-24">
      {banner && (
        <div
          className={
            "relative overflow-hidden " +
            (emphasis ? "h-[260px] md:h-[280px]" : "h-[200px] md:h-[220px]")
          }
        >
          <img
            src={banner.url}
            alt={`${category.title} editorial banner`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/15 via-transparent to-ink/55" />
          <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 py-5 md:py-6">
            <div className="mx-auto max-w-[1180px] flex items-end justify-between gap-6">
              <div>
                <span className="eyebrow text-[0.55rem] text-ivory/80">The Edit</span>
                <h2
                  className={
                    "mt-1.5 font-display tracking-[0.05em] text-ivory " +
                    (emphasis ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")
                  }
                >
                  {category.title}
                </h2>
              </div>
              <span className="eyebrow text-[0.55rem] text-ivory/75 whitespace-nowrap pb-1">
                {String(category.brands.length).padStart(2, "0")} Labels
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-[1180px] px-6 mt-6 md:mt-7">
        <p
          className={
            "font-serif italic text-ink/70 leading-snug max-w-2xl " +
            (emphasis ? "text-lg" : "text-base")
          }
        >
          {banner?.intro}
        </p>
        <div
          className={
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 " +
            (emphasis ? "mt-7" : "mt-6")
          }
        >
          {visible.map((brand) => (
            <BrandCard key={brand.slug} brand={brand} />
          ))}
        </div>
        {hidden > 0 && (
          <div className="mt-6 text-center">
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
      if (filter === "Founder Favorites") {
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
      <section className="mx-auto max-w-[1180px] px-6 pt-14 md:pt-20 pb-10 text-center">
        <span className="eyebrow text-gold">Founder Edit</span>
        <h1 className="font-display text-5xl md:text-7xl tracking-[0.04em] mt-5 text-ink">
          Brands We Love
        </h1>
        <p className="mt-6 font-serif italic text-lg md:text-xl text-ink/70 leading-relaxed max-w-2xl mx-auto">
          The designers shaping the Resort Edit wardrobe — from iconic luxury houses to
          emerging labels worth discovering.
        </p>
      </section>

      {/* Editorial lifestyle image */}
      <div className="relative w-full aspect-[21/9] md:aspect-[21/8] overflow-hidden">
        <img
          src={heroEditorial.url}
          alt="Resort Edit editorial — golden hour on the Mediterranean"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* WHY THESE BRANDS */}
      <section className="mx-auto max-w-[1180px] px-6 pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <span className="eyebrow text-gold">The Selection</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl tracking-[0.04em] text-ink">
              Why We Choose <br className="hidden md:block" />These Designers
            </h2>
          </div>
          <div className="md:col-span-7 space-y-5 font-serif text-lg text-ink/75 leading-relaxed">
            <p>
              Every brand on Resort Edit is personally curated. Nothing is included because
              it is trending or paid for placement.
            </p>
            <p>
              Selection is based on five quiet criteria: <em>destination relevance,
              craftsmanship, quality, longevity,</em> and <em>editorial fit</em>.
            </p>
            <p>
              These designers are chosen because they solve specific travel wardrobe
              moments — the linen for the harbor lunch, the swim for the yacht, the sandal
              that finishes everything else.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDER FAVORITES */}
      <section className="bg-cream/40 border-y border-border/40">
        <div className="mx-auto max-w-[1360px] px-6 py-20 md:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-gold">The Heart of the Edit</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-[0.04em] text-ink">
              Founder Favorites
            </h2>
            <p className="mt-5 font-serif italic text-ink/65">
              The houses we return to season after season — the ten labels that most
              define the Resort Edit point of view.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {founderFavorites.map((brand) => (
              <Link
                key={brand.slug}
                to="/brands/$slug"
                params={{ slug: brand.slug }}
                className="group block bg-ivory border border-border/50 hover:border-gold transition-colors p-7"
              >
                <span className="eyebrow text-[0.55rem] text-gold">
                  {BRAND_BADGE[brand.slug] ?? "Founder Favorite"}
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

      {/* BROWSE BY STYLE — visual tiles */}
      <section className="mx-auto max-w-[1360px] px-6 pt-20 md:pt-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow text-gold">The Categories</span>
          <h2 className="mt-4 font-display text-3xl md:text-4xl tracking-[0.04em] text-ink">
            Browse by Style
          </h2>
          <p className="mt-4 font-serif italic text-ink/65">
            Seven editorial worlds — choose the one that matches the moment.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {brandCategories.map((cat) => {
            const banner = CATEGORY_BANNERS[cat.title];
            return (
              <a
                key={cat.title}
                href={`#${slugify(cat.title)}`}
                className="group relative block overflow-hidden aspect-[4/5]"
              >
                {banner && (
                  <img
                    src={banner.url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="eyebrow text-[0.55rem] text-ivory/80">
                    {String(cat.brands.length).padStart(2, "0")} Labels
                  </span>
                  <h3 className="mt-2 font-display text-2xl md:text-3xl tracking-wide text-ivory">
                    {cat.title}
                  </h3>
                  <p className="mt-2 font-serif italic text-sm text-ivory/85 leading-snug line-clamp-2">
                    {cat.description.split(".")[0]}.
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="mx-auto max-w-[1180px] px-6 pt-20 md:pt-24" id="discover">
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

      {/* CATEGORY SECTIONS */}
      <div className="mt-14 md:mt-16 space-y-14 md:space-y-16">
        {brandCategories.map((cat) => (
          <CategorySection key={cat.title} category={cat} />
        ))}
      </div>

      {/* AFFILIATE DISCLOSURE */}
      <p className="mt-24 text-center eyebrow text-[0.55rem] text-ink/45 max-w-xl mx-auto px-6">
        Resort Edit is reader-supported. Some links may earn a small commission at no cost to you.
      </p>

      {/* PARTNER CTA */}
      <section className="mx-auto max-w-[1180px] px-6 mt-16 mb-24">
        <div className="border border-border/60 bg-cream/60 px-8 py-16 text-center">
          <span className="eyebrow text-gold">Partnerships</span>
          <h2 className="font-display text-3xl md:text-4xl tracking-wide mt-4 text-ink">
            Partner with Resort Edit
          </h2>
          <p className="mt-4 font-serif italic text-ink/70 max-w-xl mx-auto">
            Brand collaborations, featured edits, and curated placements for labels we love.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-block eyebrow bg-ink text-ivory px-8 py-4 rounded-sm hover:bg-gold transition-colors"
          >
            Get in touch →
          </Link>
        </div>
      </section>
    </div>
  );
}