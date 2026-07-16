import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useEffect, useId, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { getPortofinoMoment } from "@/lib/portofino-moments.functions";
import arrivalHeroVideo from "@/assets/uploads/portofino/arrival-hero.mp4.asset.json";
import arrivalHeroPoster from "@/assets/uploads/portofino/arrival-hero-poster.jpg.asset.json";
import espressoHeroVideo from "@/assets/uploads/portofino/espresso-morning-hero.mp4.asset.json";
import espressoHeroPoster from "@/assets/uploads/portofino/espresso-morning-hero-poster.jpg.asset.json";
import exploringHarborHeroVideo from "@/assets/uploads/portofino/exploring-the-harbor-hero.mp4.asset.json";
import exploringHarborHeroPoster from "@/assets/uploads/portofino/exploring-the-harbor-hero-poster.jpg.asset.json";
import harborAperitivoHeroVideo from "@/assets/uploads/portofino/harbor-aperitivo-hero.mp4.asset.json";
import harborAperitivoHeroPoster from "@/assets/uploads/portofino/harbor-aperitivo-hero-poster.jpg.asset.json";
import beachClubHeroVideo from "@/assets/uploads/portofino/beach-club-hero.mp4.asset.json";
import beachClubHeroPoster from "@/assets/uploads/portofino/beach-club-hero-poster.jpg.asset.json";
import yachtDayHeroVideo from "@/assets/uploads/portofino/yacht-day-hero.mp4.asset.json";
import yachtDayHeroPoster from "@/assets/uploads/portofino/yacht-day-hero-poster.jpg.asset.json";
import sunsetViewsHeroVideo from "@/assets/uploads/portofino/sunset-views-hero.mp4.asset.json";
import sunsetViewsHeroPoster from "@/assets/uploads/portofino/sunset-views-hero-poster.jpg.asset.json";
import nightcapHeroVideo from "@/assets/uploads/portofino/nightcap-hero.mp4.asset.json";
import nightcapHeroPoster from "@/assets/uploads/portofino/nightcap-hero-poster.jpg.asset.json";

/**
 * Focal point for a hero video / poster expressed as CSS `object-position`
 * percentages per breakpoint. `y` is measured from the top: lower values keep
 * more of the top of the frame (subject's head) visible when the container
 * is shorter than the source aspect ratio.
 *
 * A smaller `y` at wider breakpoints protects the subject's face on desktop
 * where the hero container is proportionally shorter than the 16:9 source.
 */
type HeroFocal = { x: number; y: number };
type ResponsiveHeroFocal = {
  base: HeroFocal;      // <640px (mobile portrait)
  md?: HeroFocal;       // ≥768px (tablet)
  lg?: HeroFocal;       // ≥1024px (desktop)
};

type MomentHeroVideo = {
  video: string;
  poster: string;
  focal: ResponsiveHeroFocal;
  fit?: CSSProperties["objectFit"];
  /**
   * Optional Tailwind classes to override the hero container height. Portrait-
   * oriented source videos (e.g. Nightcap) need a taller frame so `object-cover`
   * doesn't crop the model's head. Omit to inherit the shared default.
   */
  containerHeightClasses?: string;
  overlay: {
    eyebrow: string;
    headline: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  };
  ariaLabel: string;
};

/**
 * Registry of cinematic video heroes per moment slug. Each new destination or
 * moment that ships a hero video adds an entry here; the shared
 * `MomentCinematicHero` component reads focal points and overlay copy from
 * this map so we never re-tune CSS on a per-page basis.
 */
const MOMENT_HERO_VIDEO: Record<string, MomentHeroVideo> = {
  arrival: {
    video: arrivalHeroVideo.url,
    poster: arrivalHeroPoster.url,
    // Lilla enters from the left third. Keep mobile centered, but pin tablet
    // and desktop to the top of the frame so her head/hair are never cropped.
    focal: {
      base: { x: 50, y: 50 },
      md: { x: 50, y: 0 },
      lg: { x: 50, y: 0 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO  ·  ARRIVAL DAY",
      headline: "The Arrival in Portofino.",
      body:
        "She steps into the Riviera slowly — ivory tailoring, sunlit stone, and the first feeling that the trip has truly begun.",
      ctaLabel: "Shop The Arrival Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Arrival in Portofino",
  },
  "espresso-morning": {
    video: espressoHeroVideo.url,
    poster: espressoHeroPoster.url,
    // Lilla sits in the left third with the harbor filling the frame.
    // Keep her head/tote in-frame across breakpoints — never crop the top.
    focal: {
      base: { x: 30, y: 30 },
      md: { x: 35, y: 15 },
      lg: { x: 40, y: 10 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO  ·  ESPRESSO MORNING",
      headline: "Espresso Morning.",
      body:
        "A slow espresso. The first stroll along the harbor. The Riviera waking around you.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Espresso morning in Portofino",
  },
  "exploring-the-harbor": {
    video: exploringHarborHeroVideo.url,
    poster: exploringHarborHeroPoster.url,
    // Lilla occupies the left third of the frame; the harbor and colorful
    // streets fill the rest. Keep her head, hair, coffee cup, and tote bag
    // visible — never crop the top or left edge where she lives.
    focal: {
      base: { x: 25, y: 30 },
      md: { x: 25, y: 20 },
      lg: { x: 30, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO  ·  EXPLORE THE HARBOR",
      headline: "Exploring the Harbor.",
      body:
        "The climb to Castello Brown and the path to the lighthouse, through Portofino's hidden corners and colorful streets.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Exploring the harbor in Portofino",
  },
  "harbor-aperitivo": {
    video: harborAperitivoHeroVideo.url,
    poster: harborAperitivoHeroPoster.url,
    // Lilla sits at the left third of the harborside table with cocktail
    // glass and purse in-frame. Keep her head, hair, glass, and upper body
    // visible across breakpoints — pin toward the top-left of the frame on
    // wider viewports so nothing crops from above her.
    focal: {
      base: { x: 40, y: 40 },
      md: { x: 35, y: 20 },
      lg: { x: 30, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO  ·  HARBOR APERITIVO",
      headline: "Harbor Aperitivo.",
      body: "Golden-hour cocktails overlooking the harbor.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Harbor aperitivo in Portofino",
  },
  "beach-club": {
    video: beachClubHeroVideo.url,
    poster: beachClubHeroPoster.url,
    // Lilla stands at the left third of the emerald Paraggi cove.
    // Keep her head, hair, tote bag, and full body visible — never crop
    // from the top or left edge where she lives.
    focal: {
      base: { x: 25, y: 30 },
      md: { x: 25, y: 20 },
      lg: { x: 30, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO  ·  BEACH CLUB",
      headline: "Beach Club.",
      body:
        "A leisurely afternoon at Paraggi, the emerald cove where even Portofino comes to swim.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Beach Club at Paraggi",
  },
  "yacht-day": {
    video: yachtDayHeroVideo.url,
    poster: yachtDayHeroPoster.url,
    // Lilla stands at the left third of the yacht scene with the harbor
    // and coastline filling the frame. Keep her head, hair, and full body
    // visible — never crop from the top or left edge where she lives.
    focal: {
      base: { x: 25, y: 30 },
      md: { x: 25, y: 20 },
      lg: { x: 30, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO  ·  YACHT DAY",
      headline: "Yacht Day.",
      body:
        "The crossing to San Fruttuoso — the abbey in a cove reachable only by boat or on foot — in effortless style.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Yacht Day in Portofino",
  },
  "sunset-views": {
    video: sunsetViewsHeroVideo.url,
    poster: sunsetViewsHeroPoster.url,
    // Lilla occupies the left third of the frame on a hill above the harbor.
    // Keep her head, hair, outfit, and full body visible — never crop from
    // the top or left edge where she lives.
    focal: {
      base: { x: 25, y: 30 },
      md: { x: 25, y: 20 },
      lg: { x: 30, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO  ·  SUNSET VIEWS",
      headline: "Sunset Views.",
      body:
        "From the hill above the harbor, the coast glows as the sun disappears into the sea.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Sunset Views in Portofino",
  },
  nightcap: {
    video: nightcapHeroVideo.url,
    poster: nightcapHeroPoster.url,
    // Lilla walks along the harbor at night in the left third of the frame.
    // The 4:3 source is much taller than the hero band, so pin `object-cover`
    // to the top of the frame across breakpoints — otherwise the default
    // center crop clips her head. The taller container below (see
    // `containerHeightClasses`) gives her hair breathing room above.
    focal: {
      base: { x: 25, y: 0 },
      md: { x: 25, y: 0 },
      lg: { x: 30, y: 0 },
    },
    fit: "cover",
    // ~30% taller than the shared default so the portrait video isn't crushed
    // into a wide letterbox and Lilla's head clears the top edge.
    containerHeightClasses:
      "min-h-[650px] h-[clamp(650px,88vh,980px)] lg:min-h-[680px] lg:h-[clamp(680px,68vw,940px)]",
    overlay: {
      eyebrow: "PORTOFINO  ·  NIGHTCAP",
      headline: "Nightcap.",
      body:
        "One final cocktail on the piazzetta before the perfect day comes to a close.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Nightcap in Portofino",
  },
};
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
  const isFounderLook = resolved.source === "founder_look";
  const founderProducts = resolved.founder_hero_products ?? [];

  // Admin/debug visibility: source badge only renders with ?debug=1.
  const isDebug =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debug");

  // Featured (canonical) look for this moment.
  const featuredLook = findLook(card.legacy_day_slug, card.look_slug);
  const founderShopEntries: ShopEntry[] = founderProducts
    .filter((p) => (p.brand || p.product_name))
    // Public Founder Look shop panel: only render rows with a usable
    // retailer URL. Search-engine fallback or AFF- placeholder URLs are
    // suppressed in production (visible only with ?debug=1) so the page
    // never ships a dead "Shop →" card.
    .filter((p) => isDebug || isUsableShopUrl(p.url))
    .map((p) => ({
      kind: "override" as const,
      product: {
        slotLabel:
          p.role === "Hero Garment"
            ? "The Look"
            : p.role === "Optional"
              ? prettifyCategory(p.category)
              : prettifyCategory(p.category),
        brand: p.brand || p.product_name.split(" ")[0] || "—",
        title: p.product_name || p.brand || "",
        url: isUsableShopUrl(p.url) ? p.url : "",
        image: p.image_url ?? "",
        isOptional: p.role === "Optional",
      },
    }));
  const featuredShop = isFounderLook && founderShopEntries.length
    ? founderShopEntries
    : resolveShopProducts(card.legacy_day_slug, card.look_slug);
  const featuredPieceCount = featuredShop.filter(shopEntryIsLive).length;
  const featuredSlots = summarizeSlots(featuredShop);

  const shortMomentName = SHORT_MOMENT_NAME[slug] ?? card.moment_name;
  const editorPickLabel = `Editor's ${shortMomentName} Pick`;

  // Public-facing display title for the featured look. Founder look titles are
  // often blank or workflow-y; map to an editorial name per moment so the page
  // never shows internal/legacy names like "The Slow Departure" on Arrival.
  const founderDisplayTitle =
    (resolved.title && resolved.title.trim()) ||
    FOUNDER_LOOK_DISPLAY_TITLE[slug] ||
    card.moment_name;
  const featuredDisplayTitle = isFounderLook
    ? FOUNDER_LOOK_DISPLAY_TITLE[slug] ?? founderDisplayTitle
    : featuredLook?.title ?? resolved.title;
  const shopHeading = isFounderLook
    ? `Shop ${featuredDisplayTitle}`
    : `Shop ${featuredLook?.title ?? card.moment_name}`;

  // Sibling looks within the same day — "More Ways to Dress for {moment}".
  const siblings: Look[] = lookbook.filter(
    (l) => l.daySlug === card.legacy_day_slug && l.lookSlug !== card.look_slug,
  );

  // Inline expansion state: which look's shop grid is currently open.
  // `featured` opens the featured look; `look-a|b|c` opens that sibling.
  const [openShop, setOpenShop] = useState<string | null>(null);

  // Moments registered in MOMENT_HERO_VIDEO get the shared cinematic video
  // hero. All other moments keep the canonical image hero.
  const cinematicHero = MOMENT_HERO_VIDEO[slug];

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

      {/* SOURCE INDICATOR — admin/debug only (append ?debug=1 to view). */}
      {isDebug && (
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 pb-3">
          <span
            className={
              "inline-flex items-center gap-2 text-[0.55rem] tracking-[0.24em] uppercase px-2 py-1 border " +
              (resolved.source === "founder_look"
                ? "border-violet-700/60 text-violet-800 bg-violet-50"
                : resolved.source === "tagged"
                  ? "border-emerald-700/60 text-emerald-800 bg-emerald-50"
                  : "border-amber-700/60 text-amber-800 bg-amber-50")
            }
          >
            Rendering:{" "}
            {resolved.source === "founder_look"
              ? "Founder Look"
              : resolved.source === "tagged"
                ? "Tagged Look"
                : "Legacy Fallback"}
          </span>
        </div>
      )}

      {/* HERO */}
      {cinematicHero ? (
        <MomentCinematicHero config={cinematicHero} />
      ) : (
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
            <p className="font-serif italic text-base md:text-lg text-ivory/90 mt-2.5 max-w-3xl leading-snug line-clamp-2">
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
      )}

      {/* FEATURED LOOK — editorial hero styling recommendation */}
      <section id="shop-the-look" className="bg-ivory scroll-mt-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-9 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)] gap-8 md:gap-12 items-start">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream/40 border border-border/60">
              <img
                src={resolved.image}
                alt={`${resolved.title} — Portofino featured look`}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
            <div className="space-y-4 lg:pl-2">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                {editorPickLabel}
              </span>
              <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink leading-[1.1]">
                {featuredDisplayTitle}
              </h2>
              <p className="font-serif italic text-[1rem] md:text-[1.05rem] text-ink/80 leading-relaxed max-w-prose">
                {isFounderLook ? card.narrative : (featuredLook?.caption ?? card.narrative)}
              </p>
              {!isFounderLook && featuredSlots.length > 0 && (
                <div className="border-t border-border/60 pt-4">
                  <div className="flex items-baseline justify-between gap-4 flex-wrap">
                    <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-ink/55">
                      The Complete Edit
                    </span>
                    {featuredPieceCount > 0 && (
                      <span className="font-serif italic text-[0.85rem] text-gold">
                        {featuredPieceCount} Curated Pieces
                      </span>
                    )}
                  </div>
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
              {/* Founder Look: always-visible shop panel on the right. */}
              {isFounderLook && featuredShop.length > 0 && (
                <ShopLookPanel heading={shopHeading} entries={featuredShop} />
              )}
              {/* Legacy/tagged look: keep collapsible "View Complete Look". */}
              {!isFounderLook && featuredShop.length > 0 && (
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
                    {openShop === "featured" ? "Hide Complete Look" : "View Complete Look"}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${openShop === "featured" ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isFounderLook && openShop === "featured" && featuredShop.length > 0 && (
            <InlineShop
              id="shop-featured"
              heading={shopHeading}
              entries={featuredShop}
            />
          )}
        </div>
      </section>

      {/* MORE WAYS TO DRESS FOR THIS MOMENT — editorial look grid */}
      {siblings.length > 0 && (
        <section className="bg-cream/40 border-t border-border/40">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-9 md:py-12">
            <div className="mb-6 md:mb-8 max-w-2xl">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                THE EDIT
              </span>
              <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
                More {shortMomentName} Looks
              </h3>
              <p className="font-serif italic text-[0.95rem] text-ink/70 mt-3 leading-relaxed">
                Other ways to dress the moment — each one a complete edit, ready when you are.
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

/**
 * Short, conversational moment names for editorial section headings such as
 * "More {Short} Looks". Falls back to full moment name when missing.
 */
const SHORT_MOMENT_NAME: Record<string, string> = {
  "arrival": "Arrival",
  "espresso-morning": "Espresso",
  "yacht-day": "Yacht",
  "harbor-aperitivo": "Harbor",
  "sunset-views": "Sunset",
  "riviera-dinner": "Riviera Dinner",
  "exploring-the-harbor": "Harbor",
  "beach-club": "Beach Club",
  "long-lunch": "Long Lunch",
  "shopping": "Shopping",
  "nightcap": "Nightcap",
  "pool-lounging": "Pool",
};

/**
 * Shared cinematic video hero used across moment pages. Reads video, poster,
 * per-breakpoint focal point, and overlay copy from a config so every moment
 * uses the same DOM structure and only tunes its own focal point + copy.
 *
 * Focal points are pushed into CSS custom properties (`--hero-focal-*`) at
 * the section level and consumed by the video/poster via `object-position`.
 * Tailwind media queries switch which variable the media element reads at
 * each breakpoint, so mobile / tablet / desktop can each keep the subject's
 * face inside the visible frame without changing zoom.
 */
function MomentCinematicHero({ config }: { config: MomentHeroVideo }) {
  const { video, poster, focal, fit = "cover", overlay, ariaLabel, containerHeightClasses } = config;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const focalBase = `${focal.base.x}% ${focal.base.y}%`;
  const focalMd = focal.md ? `${focal.md.x}% ${focal.md.y}%` : focalBase;
  const focalLg = focal.lg
    ? `${focal.lg.x}% ${focal.lg.y}%`
    : focalMd;

  // Per-hero scope id so the media-query style block below only affects
  // this instance's media elements. Focal points are seeded as CSS custom
  // properties and swapped per breakpoint — Tailwind's JIT can't produce
  // arbitrary `object-position` classes from runtime values, so we ship
  // the breakpoints as a scoped <style> tag instead.
  const scopeId = useId().replace(/:/g, "").toLowerCase();
  const scopeAttr = `data-hero-scope-${scopeId}`;

  const mediaClasses = "absolute inset-0 h-full w-full";
  const mediaStyle: CSSProperties = {
    objectFit: fit,
  };
  const scopeStyle: CSSProperties = {
    ["--hero-focal" as string]: focalBase,
  };
  const responsiveCss = `
    [${scopeAttr}] .hero-media { object-position: ${focalBase}; }
    @media (min-width: 768px) {
      [${scopeAttr}] .hero-media { object-position: ${focalMd}; }
    }
    @media (min-width: 1024px) {
      [${scopeAttr}] .hero-media { object-position: ${focalLg}; }
    }
  `;

  return (
    <section
      aria-label={ariaLabel}
      className={
        "relative w-full overflow-hidden bg-ink " +
        (containerHeightClasses ??
          "min-h-[500px] h-[clamp(500px,70vh,760px)] lg:min-h-[520px] lg:h-[clamp(520px,52vw,720px)]")
      }
      {...{ [scopeAttr]: "" }}
      style={scopeStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      {reduceMotion ? (
        <img
          src={poster}
          alt={ariaLabel}
          fetchPriority="high"
          className={mediaClasses + " hero-media"}
          style={mediaStyle}
        />
      ) : (
        <>
          <img
            src={poster}
            alt=""
            aria-hidden
            fetchPriority="high"
            className={mediaClasses + " hero-media"}
            style={mediaStyle}
          />
          <video
            key={`cinematic-${video}`}
            src={video}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            onCanPlay={() => setReady(true)}
            className={
              mediaClasses + " hero-media" +
              " transition-opacity duration-700 ease-out " +
              (ready ? "opacity-100" : "opacity-0")
            }
            style={mediaStyle}
          />
        </>
      )}

      {/* Right-side readability gradient — transparent over the subject on the
          left so the destination is never darkened. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(20,18,16,0) 0%, rgba(20,18,16,0) 46%, rgba(20,18,16,0.14) 64%, rgba(20,18,16,0.28) 100%)",
        }}
      />

      <div className="relative z-10 h-full mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-14">
        <div className="h-full flex items-center justify-end">
          <div className="max-w-[520px] text-ivory text-left">
            <p className="eyebrow text-[0.7rem] sm:text-[0.75rem] tracking-[0.38em] text-ivory/90">
              {overlay.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-[2.2rem] sm:text-[2.8rem] lg:text-[3.4rem] leading-[1.05] tracking-[0.01em]">
              {overlay.headline}
            </h1>
            <p className="mt-4 font-serif italic text-[1rem] sm:text-[1.08rem] text-ivory/85 leading-relaxed">
              {overlay.body}
            </p>
            <a
              href={overlay.ctaHref}
              className="mt-7 inline-flex items-center gap-3 eyebrow text-[0.72rem] tracking-[0.32em] text-ivory bg-ink/70 hover:bg-gold border border-ivory/40 hover:border-gold backdrop-blur-sm px-6 py-3 transition-colors"
            >
              {overlay.ctaLabel} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Editorial display titles for Founder Look hero sections. Founder Look rows
 * can ship with blank or workflow-y titles; this map gives each moment a
 * polished public name so the page never reads as internal data.
 */
const FOUNDER_LOOK_DISPLAY_TITLE: Record<string, string> = {
  "arrival": "The Splendido Arrival",
  "espresso-morning": "The Espresso Morning",
  "yacht-day": "The Yacht Day",
  "harbor-aperitivo": "The Harbor Aperitivo",
  "sunset-views": "The Sunset Hour",
  "riviera-dinner": "The Riviera Dinner",
  "exploring-the-harbor": "Exploring the Harbor",
  "beach-club": "The Beach Club",
  "long-lunch": "The Long Lunch",
  "shopping": "The Shopping Afternoon",
  "nightcap": "The Nightcap",
  "pool-lounging": "Poolside in Portofino",
};

/**
 * Experiential rewrites for sibling "More X Looks" cards — sells the moment,
 * not the garment. Keyed by `${daySlug}/${lookSlug}`.
 */
const SIBLING_CAPTION_OVERRIDES: Record<string, string> = {
  "day-5/look-a":
    "For your first espresso, flower markets, and a slow morning discovering Portofino.",
  "day-5/look-b":
    "For the long walk home through quiet streets after dinner by the water.",
  "day-2/look-a":
    "For stretching the afternoon beneath striped umbrellas before lunch overlooking the sea.",
};

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
    return isUsableShopUrl(o.url);
  }
  const p = entry.product as LookProduct;
  return !p.isPlaceholder;
}

/**
 * A URL is shoppable only when it points at a retailer product page,
 * not at a placeholder (`AFF-…`) or a search-engine redirect that an
 * import fallback wrote into the database.
 */
function isUsableShopUrl(url: string | undefined | null): url is string {
  if (!url) return false;
  if (url.startsWith("AFF-")) return false;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("google.com") && u.pathname.startsWith("/search")) return false;
    if (u.hostname.endsWith("bing.com") && u.pathname.startsWith("/search")) return false;
    return true;
  } catch {
    return false;
  }
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
          THE EDIT
        </span>
      </div>
      <div className="p-6 md:p-8 flex flex-col gap-3">
        <h4 className="font-display text-2xl md:text-[1.75rem] tracking-[0.04em] text-ink leading-[1.15]">
          {look.title}
        </h4>
        <p className="font-serif italic text-[0.95rem] text-ink/75 leading-relaxed line-clamp-3">
          {SIBLING_CAPTION_OVERRIDES[`${look.daySlug}/${look.lookSlug}`] ?? look.caption}
        </p>
        <p className="eyebrow text-[0.58rem] tracking-[0.32em] text-ink/60">
          The Complete Edit{liveCount > 0 ? ` · ${liveCount} Curated Pieces` : ""}
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
            Shop Individual Pieces
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
  const isPlaceholderUrl = !isUsableShopUrl(o.url);
  const hasImage = !!o.image;

  // No usable URL → quiet "coming soon" tile (with or without image).
  if (isPlaceholderUrl) {
    return (
      <div
        className="flex flex-col bg-ivory border border-border/60 h-full"
        aria-disabled="true"
      >
        {hasImage && (
          <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
            <img
              src={o.image}
              alt={`${o.brand} ${o.title}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-4"
            />
            {o.slotLabel && (
              <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.3em] text-gold bg-ivory/85 px-1.5 py-0.5">
                {o.slotLabel}
              </span>
            )}
          </div>
        )}
        <div className="flex flex-col flex-1 p-4">
          {!hasImage && o.slotLabel && (
            <div className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold/80 mb-1.5">
              {o.slotLabel}
            </div>
          )}
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
      {hasImage && (
        <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
          <img
            src={o.image}
            alt={`${o.brand} ${o.title}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {o.slotLabel && (
            <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.3em] text-gold bg-ivory/85 px-1.5 py-0.5">
              {o.slotLabel}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col flex-1 p-4">
        {!hasImage && o.slotLabel && (
          <div className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold/80 mb-1.5">
            {o.slotLabel}
          </div>
        )}
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

// ──────────────────────────────────────────────────────────────
// Editorial "Shop This Look" side panel (text-first, link priority)
// ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  hero: "The Look",
  top: "Top",
  bottom: "Bottom",
  dress: "Dress",
  outerwear: "Outerwear",
  shoes: "Shoes",
  bag: "Bag",
  sunglasses: "Sunglasses",
  hat: "Hat",
  jewelry: "Jewelry",
  necklace: "Necklace",
  earrings: "Earrings",
  bracelet: "Bracelet",
  ring: "Ring",
  scarf: "Scarf",
  belt: "Belt",
  swim: "Swim",
  coverup: "Cover-up",
};

function prettifyCategory(c: string): string {
  const key = (c || "").toLowerCase();
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function ShopLookPanel({
  heading,
  entries,
}: {
  heading: string;
  entries: ShopEntry[];
}) {
  // Founder look entries are all "override" items mapped from hero_urls.
  const rows = entries
    .filter((e) => e.kind === "override")
    .map((e) => e.product as OverrideItem);
  const requiredRows = rows.filter((r) => !r.isOptional);
  const optionalRows = rows.filter((r) => r.isOptional);
  const renderRow = (o: OverrideItem, i: number) => {
    const href = isUsableShopUrl(o.url) ? o.url : "";
    const hasImg = !!o.image;
    const Inner = (
      <div className="flex items-start gap-3 py-3">
        {hasImg ? (
          <div className="shrink-0 w-14 h-14 bg-cream border border-border/50 overflow-hidden flex items-center justify-center">
            <img
              src={o.image}
              alt={`${o.brand} ${o.title}`}
              loading="lazy"
              className="w-full h-full object-contain p-1"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          {o.slotLabel && (
            <div className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold/80">
              {o.slotLabel}
            </div>
          )}
          <div className="font-serif text-[0.95rem] text-ink leading-snug mt-0.5">
            <span className="font-medium">{o.brand}</span>
            {o.title ? <span className="text-ink/70"> — {o.title}</span> : null}
          </div>
          <div className="mt-1">
            {href ? (
              <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink group-hover:text-gold transition-colors">
                Shop →
              </span>
            ) : (
              <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-ink/45">
                Link unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    );
    return (
      <li key={i}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackOutbound({ brand: o.brand, item: o.title, href })}
            className="group block hover:bg-cream/40 -mx-2 px-2 transition-colors"
          >
            {Inner}
          </a>
        ) : (
          <div className="-mx-2 px-2">{Inner}</div>
        )}
      </li>
    );
  };
  return (
    <div className="border-t border-border/60 pt-5 mt-2">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg md:text-xl tracking-[0.04em] text-ink">
          {heading}
        </h3>
        <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-ink/55">
          {requiredRows.length} Pieces
        </span>
      </div>
      <ul className="mt-4 divide-y divide-border/50">
        {requiredRows.map(renderRow)}
      </ul>
      {optionalRows.length > 0 && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-4">
            <h4 className="font-display text-[0.95rem] md:text-base tracking-[0.04em] text-ink/85">
              Complete the Look
            </h4>
            <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-ink/55">
              {optionalRows.length} {optionalRows.length === 1 ? "Item" : "Items"}
            </span>
          </div>
          <ul className="mt-3 divide-y divide-border/50">
            {optionalRows.map(renderRow)}
          </ul>
        </div>
      )}
    </div>
  );
}
