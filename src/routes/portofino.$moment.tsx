import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useEffect, useId, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { getPortofinoMoment } from "@/lib/portofino-moments.functions";
import { getMomentSlotHealth } from "@/lib/product-health.functions";
import {
  slotKey,
  REPLACEMENT_IN_REVIEW_LABEL,
  type SlotResolution,
} from "@/lib/product-health";
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
import poolLoungingHeroVideo from "@/assets/uploads/portofino/pool-lounging-hero.mp4.asset.json";
import poolLoungingHeroPoster from "@/assets/uploads/portofino/pool-lounging-hero-poster.jpg.asset.json";
import {
  MOMENT_EXTRA_EDITORIAL_CARDS,
  NIGHTCAP_EDITORIAL_CARDS,
  type ExtraEditorialCard,
  type NightcapEditorialCard,
} from "@/data/momentEditorialCards";
import { MOMENT_SHOP_CURATED } from "@/data/momentShopCurated";
import {
  excludeUnmerchandisable,
  isExcludedProduct,
} from "@/lib/merchandising-exclusions";
import { ProductCommerceCard } from "@/components/commerce/ProductCommerceCard";
import { EditorialClosetSection } from "@/components/EditorialClosetSection";
import {
  MAX_SUPPORTING_LOOKS,
  isCompleteLook,
  isDaytimeMoment,
} from "@/lib/look-completeness";

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
    // Global hero rule: pin the crop to top-center on the model's eyeline
    // (50% 15%) so her head, hair, and shoulders are never cropped.
    focal: {
      base: { x: 50, y: 15 },
      md: { x: 50, y: 15 },
      lg: { x: 50, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO",
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
    // Global hero rule: top-center on the eyeline (50% 15%). Head, hair,
    // and shoulders are always preserved; lower body may crop first.
    focal: {
      base: { x: 50, y: 15 },
      md: { x: 50, y: 15 },
      lg: { x: 50, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO",
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
    // Global hero rule: top-center on the eyeline (50% 15%).
    focal: {
      base: { x: 50, y: 15 },
      md: { x: 50, y: 15 },
      lg: { x: 50, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO",
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
    // Global hero rule: top-center on the eyeline (50% 15%).
    focal: {
      base: { x: 50, y: 15 },
      md: { x: 50, y: 15 },
      lg: { x: 50, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO",
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
    // Global hero rule: top-center on the eyeline (50% 15%).
    focal: {
      base: { x: 50, y: 15 },
      md: { x: 50, y: 15 },
      lg: { x: 50, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO",
      headline: "Pool Lounging.",
      body:
        "An elegant afternoon by the pool, above the bay, beneath striped umbrellas.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Pool Lounging in Portofino",
  },
  "yacht-day": {
    video: yachtDayHeroVideo.url,
    poster: yachtDayHeroPoster.url,
    // Global hero rule: top-center on the eyeline (50% 15%).
    focal: {
      base: { x: 50, y: 15 },
      md: { x: 50, y: 15 },
      lg: { x: 50, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO",
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
    // Global hero rule: top-center on the eyeline (50% 15%).
    focal: {
      base: { x: 50, y: 15 },
      md: { x: 50, y: 15 },
      lg: { x: 50, y: 15 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO",
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
    // Global hero rule: top-center pinned tighter (50% 0%) for this taller
    // 4:3 source so Lilla's head clears the top edge. The taller container
    // below preserves head, hair, and shoulders across breakpoints.
    focal: {
      base: { x: 50, y: 0 },
      md: { x: 50, y: 0 },
      lg: { x: 50, y: 0 },
    },
    fit: "cover",
    // ~30% taller than the shared default so the portrait video isn't crushed
    // into a wide letterbox and Lilla's head clears the top edge.
    containerHeightClasses:
      "min-h-[650px] h-[clamp(650px,88vh,980px)] lg:min-h-[680px] lg:h-[clamp(680px,68vw,940px)]",
    overlay: {
      eyebrow: "PORTOFINO",
      headline: "Nightcap.",
      body:
        "One final cocktail on the piazzetta before the perfect day comes to a close.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Nightcap in Portofino",
  },
  "pool-lounging": {
    video: poolLoungingHeroVideo.url,
    poster: poolLoungingHeroPoster.url,
    // 16:9 landscape source. Lilla is composed in the left third, so bias
    // `object-position` to the left on narrower breakpoints where the frame
    // crops horizontally, preserving her fully; desktop keeps center-x.
    focal: {
      base: { x: 30, y: 30 },
      md: { x: 35, y: 30 },
      lg: { x: 50, y: 30 },
    },
    fit: "cover",
    overlay: {
      eyebrow: "PORTOFINO",
      headline: "Beach Club.",
      body:
        "A leisurely afternoon at Paraggi, the emerald cove where even Portofino comes to swim.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Beach Club in Portofino",
  },
};
import {
  getPortofinoMomentDef,
  PORTOFINO_MOMENT_SLUG_ALIASES,
  momentSlugForLookKey,
} from "@/lib/portofino-moment-fallbacks";
import { OtherPortofinoMoments } from "@/components/OtherPortofinoMoments";
import { ShopOmissionRows, SHOP_ACCURACY_NOTE } from "@/components/ShopOmissionRows";
import { absoluteUrl } from "@/lib/site";
import { findLook, lookbook, LOOK_CATEGORY_LABEL, LOOK_CATEGORY_ORDER, type Look, type LookProduct } from "@/data/lookbook";
import { lookOverrideForPublic, type OverrideItem } from "@/data/lookOverrides";
import { trackOutbound } from "@/lib/utils";
import { isPublishableProductUrl } from "@/lib/shop-url-policy";
import { TIER_SLUGS, type LookSlug } from "@/lib/portofino-spec";
import type { LegacyDaySlug } from "@/lib/portofino-moment-fallbacks";
import { SaveLookButton } from "@/components/SaveLookButton";
import { ShopTheLookItems, lookItemsQuery } from "@/components/commerce/ShopTheLookItems";
import { findResortEditLook } from "@/data/resortEditLooks";
// Locked Pool Lounging editorial reference — the seated poolside portrait
// (Aperol Spritz, white lounge chair, Splendido pool). This asset is the
// permanent visual for the Pool Lounging moment and must not be replaced
// when product links, styling, or layout change.
import poolLoungingEditorial from "@/assets/uploads/portofino/pool-lounging-lilla-green-floral-splendido.png.asset.json";
import longLunchEditorial from "@/assets/uploads/portofino/long-lunch-yellow-dress-harbor-v3.png.asset.json";
import arrivalLinenVestEditorial from "@/assets/uploads/lilla/arrival-lilla-linen-vest-harbor.jpg.asset.json";

const momentQuery = (slug: string) =>
  queryOptions({
    queryKey: ["portofino-moment", slug],
    queryFn: () => getPortofinoMoment({ data: { moment_slug: slug } }),
  });

/**
 * Slot availability overlay. Looks are permanent editorial concepts; the
 * commerce item in a slot is replaceable. This query resolves, per slot, which
 * single product may be displayed (primary, or an approved active backup) —
 * or `needs_review`, in which case the slot renders a non-clickable
 * "Replacement in review" state instead of a dead PDP link.
 */
const slotHealthQuery = (slug: string) =>
  queryOptions({
    queryKey: ["moment-slot-health", slug],
    queryFn: () => getMomentSlotHealth({ data: { moment: slug } }),
  });

export const Route = createFileRoute("/portofino/$moment")({
  loader: async ({ params, context }) => {
    // Legacy /portofino/day-N URLs are handled here rather than as their own
    // registered route files (route-tree cleanup, Aug 2026).
    if (/^day-[1-5]$/.test(params.moment)) {
      throw redirect({
        to: "/portofino/$moment",
        params: { moment: momentSlugForLookKey(params.moment as LegacyDaySlug) },
        replace: true,
        statusCode: 301,
      });
    }
    // Redirect legacy/alias slugs to the canonical moment slug.
    const aliased = PORTOFINO_MOMENT_SLUG_ALIASES[params.moment];
    if (aliased) {
      throw redirect({
        to: "/portofino/$moment",
        params: { moment: aliased },
        replace: true,
        statusCode: 301,
      });
    }
    const def = getPortofinoMomentDef(params.moment);
    if (!def) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(momentQuery(params.moment)),
      context.queryClient.ensureQueryData(slotHealthQuery(params.moment)),
      context.queryClient.ensureQueryData(lookItemsQuery(`portofino/${params.moment}`)),
    ]);
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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            image: absoluteUrl(def.hero_banner_image),
            mainEntityOfPage: absoluteUrl(path),
            about: { "@type": "Place", name: "Portofino, Italy" },
            publisher: {
              "@type": "Organization",
              name: "Resort Edit",
              url: absoluteUrl("/"),
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Resort Edit", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Portofino", item: absoluteUrl("/portofino") },
              { "@type": "ListItem", position: 3, name: def.moment_name, item: absoluteUrl(path) },
            ],
          }),
        },
      ],
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
  const { data: slotHealth } = useSuspenseQuery(slotHealthQuery(slug));
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
    // Resort Edit never merchandises rings.
    .filter((p) => !isExcludedProduct({ category: p.category, role: p.role }))
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
  // Moment-level curated Complete Edit takes priority over founder / fallback
  // data. This lets an editor lock a specific ordered set of pieces without
  // depending on the publish pipeline.
  const curatedForMoment = MOMENT_SHOP_CURATED[slug];
  const curatedShopEntries: ShopEntry[] = excludeUnmerchandisable(curatedForMoment)
    .map((o) => applySlotHealth(o, slotHealth.slots))
    .filter((o) => isUsableShopUrl(o.url) || o.inReview)
    .map((product) => ({ kind: "override" as const, product }));
  const featuredShop = curatedShopEntries.length
    ? curatedShopEntries
    : isFounderLook && founderShopEntries.length
      ? founderShopEntries
      : resolveShopProducts(card.legacy_day_slug, card.look_slug);
  const hasCuratedOverride = curatedShopEntries.length > 0;
  const featuredPieceCount = featuredShop.filter(shopEntryIsLive).length;
  // Slots whose product is being replaced still belong to the edit: they keep
  // their place in the panel with a "Replacement in review" line. When nothing
  // at all is shoppable the shop area is omitted entirely.
  const featuredInReviewCount = featuredShop.filter(
    (e) => e.kind === "override" && (e.product as OverrideItem).inReview,
  ).length;
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
  // Moments that publish only curated MOMENT_EXTRA_EDITORIAL_CARDS
  // (no legacy day-siblings) — keeps the "More Resort Edit Looks" grid
  // to exactly the approved editorial cards.
  const suppressLegacySiblings = slug === "arrival";
  const allSiblings: Look[] = suppressLegacySiblings
    ? []
    : lookbook.filter(
        (l) => l.daySlug === card.legacy_day_slug && l.lookSlug !== card.look_slug,
      ).filter(
        // Shopping: the legacy "Via Roma Boutiques" sibling is replaced by the
        // curated "Green Eyelet on Via Roma" editorial card below.
        (l) => !(slug === "shopping" && l.title === "Via Roma Boutiques"),
      );

  // EDITORIAL COMPLETION LAW
  // 1. A supporting look renders only when its shopping set is complete for
  //    the moment (outfit · shoes · bag · jewelry · sunglasses by day).
  //    Incomplete looks are unpublished from the page — never shown with a
  //    placeholder or "Coming Soon" affordance. The Studio replacement queue
  //    is the internal record of what still needs styling.
  // 2. Every moment renders exactly one hero look and AT MOST two supporting
  //    looks. Curated editorial cards take precedence over legacy siblings;
  //    extras beyond the cap stay in the data (nothing deleted) and simply
  //    aren't rendered.
  const daytimeMoment = isDaytimeMoment(slug);
  // Shopping publishes curated editorial cards only.
  const completeSiblings: Look[] =
    slug === "shopping"
      ? []
      : allSiblings.filter((sib) => {
          const entries = resolveShopProducts(sib.daySlug, sib.lookSlug);
          if (!entries.some(shopEntryIsLive)) return false;
          return isCompleteLook(summarizeSlots(entries), { daytime: daytimeMoment });
        });
  const extraCards = MOMENT_EXTRA_EDITORIAL_CARDS[slug] ?? [];
  const renderedExtraCards = extraCards.slice(0, MAX_SUPPORTING_LOOKS);
  const siblings: Look[] = completeSiblings.slice(
    0,
    Math.max(0, MAX_SUPPORTING_LOOKS - renderedExtraCards.length),
  );

  // Inline expansion state: which look's shop grid is currently open.
  // `featured` opens the featured look; `look-a|b|c` opens that sibling.
  const [openShop, setOpenShop] = useState<string | null>(null);

  // Moments registered in MOMENT_HERO_VIDEO get the shared cinematic video
  // hero. All other moments keep the canonical image hero.
  const cinematicHero = MOMENT_HERO_VIDEO[slug];

  // Optional editorial-image override — some moments (e.g. Pool Lounging)
  // publish an approved Resort Edit editorial image separate from the DB
  // `resolved.image`. When present, this becomes the left-column image.
  const editorialImage = MOMENT_EDITORIAL_IMAGE[slug] ?? resolved.image;
  // Optional "View Complete Look" destination for moments that publish
  // a dedicated Complete Look page. Rendered as a centered CTA under the
  // Resort Edit shopping list.
  const completeLookHref = MOMENT_COMPLETE_LOOK[slug];
  // Optional editorial title override (defaults to featuredDisplayTitle).
  const editorialTitle = MOMENT_EDITORIAL_TITLE[slug] ?? featuredDisplayTitle;
  // Reference the founder-approved Resort Edit Look purely for typechecks /
  // future related-look wiring; the page renders through the standard
  // Nightcap-canonical template so every moment stays visually identical.
  void findResortEditLook;

  return (
    <div className="pb-4 md:pb-6">
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
              ? "Curated Look"
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
          </div>
        </section>
      )}

      {/* FEATURED LOOK — editorial hero styling recommendation */}
      <section id="shop-the-look" className="bg-ivory scroll-mt-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-9 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)] gap-8 md:gap-12 items-start">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream/40 border border-border/60">
              <img
                src={editorialImage}
                alt={`${editorialTitle} — Portofino featured look`}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
                INSPIRED BY
              </span>
            </div>
            <div className="space-y-4 lg:pl-2">
              <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink leading-[1.1]">
                {editorialTitle}
              </h2>
              {/* Save control lives in the featured column so every moment —
                  including those rendering the cinematic hero, which has no
                  overlay controls — exposes an identical Save action. */}
              <SaveLookButton
                source="portofino_moment_featured"
                look={{
                  id: `portofino/${slug}`,
                  destination: "Portofino",
                  activity: card.moment_name,
                  title: editorialTitle,
                  description: card.narrative,
                  image: editorialImage,
                  url: `/portofino/${slug}`,
                }}
              />
              <p className="font-serif italic text-[1rem] md:text-[1.05rem] text-ink/80 leading-relaxed max-w-prose">
                {MOMENT_FEATURED_COPY[slug]?.body ??
                  (isFounderLook ? card.narrative : (featuredLook?.caption ?? card.narrative))}
              </p>
              {/* Legacy slot summary removed for editorial restraint. */}
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
              {/* Standardized shop area — a moment either publishes its live
                  Resort Edit shopping list or shows nothing at all. No
                  placeholder or "coming soon" states are ever rendered. */}
              {featuredPieceCount + featuredInReviewCount > 0 &&
              (isFounderLook || hasCuratedOverride) ? (
                <div className="pt-2">
                  <div className="pt-4 border-t border-border/40">
                    <span className="eyebrow text-[0.6rem] tracking-[0.34em] text-gold">
                      THE EDIT
                    </span>
                    <h3 className="font-display text-2xl md:text-[1.75rem] tracking-[0.04em] text-ink mt-2 leading-[1.1]">
                      The Resort Edit
                    </h3>
                    <p className="font-serif italic text-[0.95rem] text-ink/70 mt-2 leading-relaxed max-w-prose">
                      The pieces we would choose to wear this moment — matched to the photograph, from the designers we return to season after season.
                    </p>
                  </div>
                  <ShopLookPanel heading={shopHeading} entries={featuredShop} />
                  {completeLookHref && (
                    <div className="pt-6 flex justify-center lg:justify-start">
                      <Link
                        to={completeLookHref}
                        className="inline-flex items-center gap-3 eyebrow text-[0.7rem] tracking-[0.36em] text-ivory bg-ink hover:bg-gold transition-colors duration-300 px-8 py-4"
                      >
                        VIEW THE FULL EDIT →
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          {/* SHOP THE LOOK — live `look_items_public` rows for this moment.
              Renders nothing when the look has no items. */}
          <ShopTheLookItems lookKey={`portofino/${slug}`} />
        </div>
      </section>

      {/* EDITORIAL CLOSET — dynamic, secondary alternative-shopping layer.
          Never counts toward the two supporting looks; only approved +
          live-verified options render. */}
      <EditorialClosetSection
        momentSlug={slug}
        momentName={card.moment_name}
        heroCategory={featuredShop[0]?.category ?? null}
      />

      {/* MORE WAYS TO DRESS FOR THIS MOMENT — editorial look grid.
          Nightcap uses an editorial-only override (two approved Lilla
          references) until affiliate product sets for those looks land. */}
      {slug === "nightcap" ? (
        <section id="more-looks" className="bg-cream/40 border-t border-border/40 scroll-mt-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-9 md:py-12">
            <div className="mb-6 md:mb-8 max-w-2xl">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                THE EDIT
              </span>
              <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
                More Resort Edit Looks
              </h3>
              <p className="font-serif italic text-[0.95rem] text-ink/70 mt-3 leading-relaxed">
                Other interpretations of this editorial moment.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {NIGHTCAP_EDITORIAL_CARDS.map((c) => (
                <article key={c.key} className="flex flex-col bg-ivory border border-border/40">
                  <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                    <img
                      src={c.image}
                      alt={c.alt}
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full ${c.imageClassName ?? "object-cover object-center"}`}
                    />
                    <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
                      INSPIRED BY
                    </span>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col gap-3">
                    <h4 className="font-display text-2xl md:text-[1.75rem] tracking-[0.04em] text-ink leading-[1.15]">
                      {c.title}
                    </h4>
                    <p className="font-serif italic text-[0.95rem] text-ink/75 leading-relaxed">
                      {c.caption}
                    </p>
                    <SaveLookButton
                      source="portofino_more_looks_nightcap"
                      look={{
                        id: `portofino/${slug}#${c.key}`,
                        destination: "Portofino",
                        activity: card.moment_name,
                        title: c.title,
                        description: c.caption,
                        image: c.image,
                        url: `/portofino/${slug}#more-looks`,
                      }}
                    />
                    {c.shop && (
                      <NightcapShopExpander
                        card={c}
                        shop={c.shop}
                        lookKey={`portofino/${slug}/${c.key}`}
                        lookHealth={slotHealth.looks}
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : (siblings.length > 0 || renderedExtraCards.length > 0) && (
        <section id="more-looks" className="bg-cream/40 border-t border-border/40 scroll-mt-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-9 md:py-12">
            <div className="mb-6 md:mb-8 max-w-2xl">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
                THE EDIT
              </span>
              <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
                More Resort Edit Looks
              </h3>
              <p className="font-serif italic text-[0.95rem] text-ink/70 mt-3 leading-relaxed">
                Other interpretations of this editorial moment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {siblings.map((sib) => (
                <EditorialLookCard
                  key={sib.id}
                  look={sib}
                  momentName={card.moment_name}
                  editorialOnly={slug === "shopping"}
                  isOpen={openShop === sib.lookSlug}
                  onToggle={() =>
                    setOpenShop((cur) => (cur === sib.lookSlug ? null : sib.lookSlug))
                  }
                />
              ))}
              {renderedExtraCards.map((c) => (
                <ExtraEditorialReferenceCard
                  key={c.key}
                  card={c}
                  momentSlug={slug}
                  momentName={card.moment_name}
                  lookHealth={slotHealth.looks}
                />
              ))}
            </div>
          </div>
        </section>
      )}

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
  "beach-club": "Pool Lounging",
  "long-lunch": "Long Lunch",
  "shopping": "Shopping",
  "nightcap": "Nightcap",
  "pool-lounging": "Pool Lounging",
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
              className="mt-8 inline-flex items-center gap-3 eyebrow font-medium text-[0.82rem] tracking-[0.34em] text-ivory bg-ink/80 hover:bg-gold border border-ivory/50 hover:border-gold backdrop-blur-sm px-9 py-[0.95rem] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] transition-colors"
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
  "arrival": "The Ivory Arrival",
  "espresso-morning": "The Espresso Morning",
  "yacht-day": "The Yacht Day",
  "harbor-aperitivo": "The Harbor Aperitivo",
  "sunset-views": "The Sunset Hour",
  "riviera-dinner": "The Riviera Dinner",
  "exploring-the-harbor": "Exploring the Harbor",
  "beach-club": "Poolside in Portofino",
  "long-lunch": "The Long Lunch",
  "shopping": "The Shopping Afternoon",
  "nightcap": "The Nightcap",
  "pool-lounging": "The Beach Club",
};

/**
 * Moment-specific editorial copy for the featured-look section beneath the
 * hero. Keeps the same eyebrow / serif styling as every other moment while
 * allowing a polished rewrite for a single page without touching the database
 * narrative (used for meta descriptions and saved-look metadata).
 */
const MOMENT_FEATURED_COPY: Record<string, { label: string; body: string }> = {
  arrival: {
    label: "Inspired by",
    body:
      "Faithfull's Maya vest and Isotta pant in natural linen — tonal, quietly tailored, and finished with warm tan leather and slim gold for the first walk along the harbor.",
  },
  nightcap: {
    label: "Inspired by",
    body:
      "A sculpted satin corset paired with fluid tailoring creates an effortlessly elegant Riviera silhouette for evenings along the Portofino harbor.",
  },
  "pool-lounging": {
    label: "Inspired by",
    body:
      "A polished Riviera poolside look designed for long afternoons overlooking Portofino — vibrant Capri print, natural raffia, and sculptural gold.",
  },
  "long-lunch": {
    label: "Inspired by",
    body:
      "A pale mist blue midi with a structured bodice and long front zipper — walked slowly along the Portofino quay after a lingering waterfront lunch. Warm tan leather, woven cognac, and floating 18k gold.",
  },
};

/**
 * Optional editorial title override, keyed by moment slug. When present,
 * replaces the default featured-look title in the right column.
 */
const MOMENT_EDITORIAL_TITLE: Record<string, string> = {
  "pool-lounging": "Poolside Glam",
  "long-lunch": "The Long Lunch",
};

/**
 * Optional approved editorial image override for the left column. Uses the
 * founder-approved Resort Edit image rather than the database `resolved.image`
 * when a moment publishes its own editorial photograph.
 */
const MOMENT_EDITORIAL_IMAGE: Record<string, string> = {
  arrival: arrivalLinenVestEditorial.url,
  "pool-lounging": poolLoungingEditorial.url,
  "long-lunch": longLunchEditorial.url,
};

/**
 * Optional destination for the centered "VIEW COMPLETE LOOK →" CTA that
 * appears beneath the Resort Edit shopping list. Only moments with a
 * published Complete Look page appear here.
 */
const MOMENT_COMPLETE_LOOK: Record<string, string> = {
  "pool-lounging": "/portofino/pool-lounging/poolside-glam",
};

/**
 * Experiential rewrites for sibling "More X Looks" cards — sells the moment,
 * not the garment. Keyed by `${daySlug}/${lookSlug}`.
 */
const SIBLING_CAPTION_OVERRIDES: Record<string, string> = {
  "day-5/look-a":
    "For your first espresso and a slow morning discovering Portofino.",
  "day-5/look-b":
    "For the long walk home through quiet streets after dinner by the water.",
  "day-2/look-a":
    "For stretching the afternoon beneath a cream parasol before lunch overlooking the sea.",
  "day-4/look-a":
    "A bold, feminine silhouette designed for golden-hour cocktails overlooking the harbor.",
  "day-4/look-b":
    "An elegant draped evening silhouette that feels effortlessly romantic beneath the lights of Portofino.",
};

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
 * A URL is shoppable only when it points at an exact retailer product page.
 * The policy itself lives in `@/lib/shop-url-policy` so curated data files,
 * the launch audit, and CI all apply the same rule.
 */
function isUsableShopUrl(url: string | undefined | null): url is string {
  return isPublishableProductUrl(url);
}

/**
 * Overlay DB-resolved slot availability onto a curated editorial row.
 *
 * The editorial layer (image, title, copy, slot order) is never touched here —
 * only the commerce item. When an approved active backup exists it is swapped
 * in silently; when nothing is shoppable the row is flagged `inReview` so the
 * card renders a non-clickable placeholder rather than a dead link.
 */
function applySlotHealth(
  item: OverrideItem,
  slots: Record<string, SlotResolution>,
): OverrideItem {
  const key = slotKey(item.category ?? item.slotLabel ?? "");
  const resolution = key ? slots[key] : undefined;
  if (!resolution) return item;
  if (resolution.state === "live") {
    const p = resolution.product;
    return {
      ...item,
      brand: p.brand,
      title: p.product_name,
      url: p.url ?? "",
      ...(p.price ? { price: p.price } : {}),
      unsourced: false,
      inReview: false,
    };
  }
  return { ...item, url: "", unsourced: false, inReview: true };
}

/**
 * Look-scoped version of the overlay, used for every supporting/editorial look
 * on the page. Keyed by `lookKey::slot`, so each look's slots resolve
 * independently of the hero look and of each other — the same maintenance
 * behaviour applies sitewide, not only to the hero shop panel.
 */
type HealthedShopRow = {
  slot: string;
  brand: string;
  name: string;
  price?: string;
  url: string;
  unsourced?: boolean;
  inReview: boolean;
};

function applyLookRowHealth(
  row: { slot: string; brand: string; name: string; price?: string; url: string; unsourced?: boolean },
  lookKey: string | undefined,
  looks: Record<string, SlotResolution> | undefined,
): HealthedShopRow {
  const resolution =
    lookKey && looks ? looks[`${lookKey}::${slotKey(row.slot)}`] : undefined;
  if (!resolution) return { ...row, inReview: false };
  if (resolution.state === "live") {
    const p = resolution.product;
    return {
      ...row,
      brand: p.brand,
      name: p.product_name,
      url: p.url ?? "",
      ...(p.price ? { price: p.price } : {}),
      unsourced: false,
      inReview: false,
    };
  }
  return { ...row, url: "", unsourced: false, inReview: true };
}

/** Split healthed rows into shoppable rows and non-clickable status rows. */
function splitHealthedRows(rows: HealthedShopRow[]) {
  const live = rows.filter((p) => !p.unsourced && !p.inReview && isUsableShopUrl(p.url));
  const omitted = rows
    .filter((p) => p.unsourced || p.inReview || !isUsableShopUrl(p.url))
    .map((p) => ({
      slot: p.slot,
      brand: p.brand,
      name: p.name,
      ...(p.price ? { price: p.price } : {}),
      ...(p.inReview ? { label: REPLACEMENT_IN_REVIEW_LABEL } : {}),
    }));
  return { live, omitted };
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
  momentName,
  isOpen,
  onToggle,
  editorialOnly = false,
}: {
  look: Look;
  momentName: string;
  isOpen: boolean;
  onToggle: () => void;
  /** Editorial-only mode: no product grid, no outbound links — internal CTA only. */
  editorialOnly?: boolean;
}) {
  const entries = editorialOnly ? [] : resolveShopProducts(look.daySlug, look.lookSlug);
  const liveCount = entries.filter(shopEntryIsLive).length;
  const hasLive = liveCount > 0;
  // A shoppable supporting look with nothing live is unpublished rather than
  // shown with a disabled placeholder CTA.
  if (!editorialOnly && !hasLive) return null;
  const internalMomentSlug = momentSlugForLookKey(
    look.daySlug as LegacyDaySlug,
    look.lookSlug,
  );
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
          INSPIRED BY
        </span>
      </div>
      <div className="p-6 md:p-8 flex flex-col gap-3">
        <h4 className="font-display text-2xl md:text-[1.75rem] tracking-[0.04em] text-ink leading-[1.15]">
          {look.title}
        </h4>
        <p className="font-serif italic text-[0.95rem] text-ink/75 leading-relaxed line-clamp-3">
          {SIBLING_CAPTION_OVERRIDES[`${look.daySlug}/${look.lookSlug}`] ?? look.caption}
        </p>
        <div className="flex items-center justify-between pt-2">
          {editorialOnly ? (
            <Link
              to="/portofino/$moment"
              params={{ moment: internalMomentSlug }}
              className="inline-flex items-center gap-2 eyebrow text-[0.64rem] tracking-[0.32em] text-ivory bg-ink hover:bg-gold transition-colors px-5 py-2.5 self-start"
            >
              VIEW THE EDIT →
            </Link>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              aria-controls={`shop-${look.daySlug}-${look.lookSlug}`}
              className="inline-flex items-center gap-2 eyebrow text-[0.64rem] tracking-[0.32em] text-ivory bg-ink hover:bg-gold transition-colors px-5 py-2.5 self-start"
            >
              {isOpen ? "HIDE THE EDIT" : "VIEW THE EDIT"}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          )}
          <SaveLookButton
            variant="icon"
            source="portofino_more_looks_sibling"
            look={{
              id: `portofino/${look.daySlug}/${look.lookSlug}`,
              destination: "Portofino",
              activity: momentName,
              title: look.title,
              description:
                SIBLING_CAPTION_OVERRIDES[`${look.daySlug}/${look.lookSlug}`] ?? look.caption,
              image: look.heroImage,
              url: `/portofino/${look.daySlug}#more-looks`,
            }}
          />
        </div>
      </div>
      {!editorialOnly && isOpen && hasLive && (
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
    return (
      <ProductCommerceCard
        brand={p.brand}
        name={p.title}
        {...(category ? { category } : {})}
        {...(p.price ? { price: p.price } : {})}
        url={p.isPlaceholder ? null : p.url}
        image={p.image ?? null}
        unavailableLabel="NOT AVAILABLE THROUGH APPROVED PARTNERS"
      />
    );
  }

  // Override item (free-form curated grid)
  const o = product as OverrideItem;
  return (
    <ProductCommerceCard
      brand={o.brand}
      name={o.title}
      {...(o.slotLabel ? { category: o.slotLabel } : {})}
      url={isUsableShopUrl(o.url) ? o.url : null}
      image={o.image ?? null}
      unavailableLabel={REPLACEMENT_IN_REVIEW_LABEL.toUpperCase()}
    />
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
  const chapters = groupShopChapters(rows);
  const renderRow = (o: OverrideItem, i: number) => {
    const href = isUsableShopUrl(o.url) ? o.url : "";
    const Inner = (
      <div>
        {o.brand && (
          <div className="font-serif italic text-[0.88rem] text-ink/55 leading-snug">
            {o.brand}
          </div>
        )}
        <div className="font-display text-[1.1rem] md:text-[1.15rem] leading-snug text-ink group-hover:text-gold transition-colors duration-300 mt-1">
          {o.title || o.brand}
        </div>
        {href && (
          <div className="eyebrow text-[0.62rem] tracking-[0.32em] text-gold/80 mt-2 group-hover:text-gold transition-colors duration-300">
            VIEW PRODUCT →
          </div>
        )}
        {!href && o.inReview && (
          <div className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/45 mt-2">
            {REPLACEMENT_IN_REVIEW_LABEL.toUpperCase()}
          </div>
        )}
      </div>
    );
    return (
      <li key={i} className="[&:not(:first-child)]:mt-3.5">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackOutbound({ brand: o.brand, item: o.title, href })}
            className="group block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
          >
            {Inner}
          </a>
        ) : (
          <div className="opacity-70">{Inner}</div>
        )}
      </li>
    );
  };
  return (
    <div className="mt-2">
      {chapters.map((chapter, ci) => (
        <section
          key={chapter.key}
          className={ci === 0 ? "mt-6" : "mt-11 md:mt-12"}
        >
          <h4 className="eyebrow text-[0.64rem] tracking-[0.38em] text-ink/45 mb-5">
            {chapter.label}
          </h4>
          <ul>{chapter.items.map(renderRow)}</ul>
        </section>
      ))}
    </div>
  );
}

/**
 * Chapter grouping — mirrors how a luxury stylist walks a client through
 * dressing: the outfit first, then the finishing touches (shoes, bag,
 * sunglasses, hat, scarf, belt, cover-up), then fine jewelry. Chapters
 * with no items are skipped so the layout adapts to any moment.
 */
const THE_LOOK_CATEGORIES = new Set([
  "corset", "top", "blouse", "shirt", "tee", "t-shirt",
  "vest", "waistcoat",
  "pant", "pants", "trouser", "trousers", "skirt",
  "dress", "gown", "jumpsuit", "romper",
  "swimsuit", "bikini", "bikini top", "bikini bottom", "one-piece", "swim",
  "jacket", "blazer", "coat", "cardigan", "sweater", "knit",
]);
const FINISHING_CATEGORIES = new Set([
  "shoe", "shoes", "sandal", "sandals",
  "bag", "clutch", "tote", "pouch",
  "sunglasses", "hat", "scarf", "belt",
  "coverup", "cover-up", "cover up",
]);
const JEWELRY_CATEGORIES = new Set([
  "earrings", "necklace", "bracelet", "jewelry", "cuff",
]);
const FINISHING_ORDER = ["shoe", "shoes", "sandal", "sandals", "bag", "clutch", "tote", "pouch", "sunglasses", "hat", "scarf", "belt", "coverup", "cover-up", "cover up"];
const JEWELRY_ORDER = ["necklace", "earrings", "bracelet", "cuff", "jewelry"];

type ShopChapter = { key: string; label: string; items: OverrideItem[] };

function groupShopChapters(rows: OverrideItem[]): ShopChapter[] {
  const norm = (s?: string) => (s ?? "").trim().toLowerCase();
  const catOf = (r: OverrideItem) => norm(r.category ?? r.slotLabel);
  const look: OverrideItem[] = [];
  const finishing: OverrideItem[] = [];
  const jewelry: OverrideItem[] = [];
  for (const r of rows) {
    const c = catOf(r);
    if (JEWELRY_CATEGORIES.has(c)) jewelry.push(r);
    else if (FINISHING_CATEGORIES.has(c)) finishing.push(r);
    else if (THE_LOOK_CATEGORIES.has(c)) look.push(r);
    else finishing.push(r);
  }
  const rankBy = (order: string[]) => (r: OverrideItem) => {
    const i = order.indexOf(catOf(r));
    return i === -1 ? order.length : i;
  };
  finishing.sort((a, b) => rankBy(FINISHING_ORDER)(a) - rankBy(FINISHING_ORDER)(b));
  jewelry.sort((a, b) => rankBy(JEWELRY_ORDER)(a) - rankBy(JEWELRY_ORDER)(b));
  const chapters: ShopChapter[] = [
    { key: "look", label: "THE LOOK", items: look },
    { key: "finishing", label: "FINISHING TOUCHES", items: finishing },
    { key: "jewelry", label: "JEWELRY", items: jewelry },
  ];
  return chapters.filter((c) => c.items.length > 0);
}

/**
 * Inline "Shop Complete Look" expander for the Nightcap "Ivory After Dark"
 * editorial card. Text-based linked rows (no fabricated thumbnails), using
 * the site's outbound tracking convention.
 */
function NightcapShopExpander({
  card,
  shop,
  lookKey,
  lookHealth,
}: {
  card: NightcapEditorialCard;
  shop: NonNullable<NightcapEditorialCard["shop"]>;
  /** Registry look key (`portofino/<moment>/<cardKey>`) for slot health lookup. */
  lookKey?: string;
  lookHealth?: Record<string, SlotResolution>;
}) {
  const [open, setOpen] = useState(false);
  const { live: rows, omitted } = splitHealthedRows(
    shop.products.map((p) => applyLookRowHealth(p, lookKey, lookHealth)),
  );
  if (rows.length === 0) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 eyebrow text-[0.64rem] tracking-[0.32em] text-ivory bg-ink hover:bg-gold transition-colors duration-300 px-5 py-2.5"
      >
        {open ? "HIDE THE EDIT" : "SHOP THE EDIT"}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="mt-6 border-t border-border/50 pt-6">
          <ul className="divide-y divide-border/40">
            {rows.map((p) => (
              <li key={p.url} className="py-4">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() =>
                    trackOutbound({
                      brand: p.brand,
                      item: p.name,
                      href: p.url,
                      category: p.slot,
                    })
                  }
                  className="group flex items-baseline justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="eyebrow text-[0.55rem] tracking-[0.34em] text-gold">
                      {p.slot}
                    </div>
                    <div className="eyebrow text-[0.65rem] tracking-[0.28em] text-ink mt-1.5">
                      {p.brand}
                    </div>
                    <div className="font-serif italic text-[0.95rem] text-ink/85 leading-snug mt-1">
                      {p.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-serif text-gold text-[0.95rem]">{p.price}</div>
                    <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/70 mt-2 group-hover:text-gold transition-colors">
                      SHOP →
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <ShopOmissionRows rows={omitted} />
          {shop.stylingNote && (
            <p className="font-serif italic text-[0.85rem] text-ink/60 mt-6 leading-relaxed">
              {shop.stylingNote}
            </p>
          )}
          <p className="font-serif text-[0.78rem] text-ink/45 mt-3 leading-relaxed">
            {SHOP_ACCURACY_NOTE}
          </p>
          <p className="sr-only">Complete look for {card.title}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Single-reference editorial card appended to the "More Resort Edit Looks"
 * grid on select moments. Renders the Lilla editorial image with the shared
 * INSPIRED BY badge, the caption, and a restrained outbound "SHOP THE
 * REFERENCE" link to the real designer product.
 */
function ExtraEditorialReferenceCard({
  card,
  momentSlug,
  momentName,
  editorialOnly = false,
  lookHealth,
}: {
  card: ExtraEditorialCard;
  momentSlug: string;
  momentName: string;
  /** Editorial-only mode: no reference product row, no expander, no outbound links. */
  editorialOnly?: boolean;
  /** Look-scoped slot health, keyed `lookKey::slot`. */
  lookHealth?: Record<string, SlotResolution>;
}) {
  const r = card.reference;
  const lookKey = `portofino/${momentSlug}/${card.key}`;
  // The reference product is maintained like any other slot: an approved backup
  // swaps in silently, and a failed link renders as a non-clickable status line.
  const reference = applyLookRowHealth(
    {
      slot: r.slot ?? "Reference",
      brand: r.brand,
      name: r.name,
      ...(r.price ? { price: r.price } : {}),
      url: r.url,
    },
    lookKey,
    lookHealth,
  );
  const referenceShoppable = !reference.inReview && isUsableShopUrl(reference.url);
  return (
    <article className="flex flex-col bg-ivory border border-border/40">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <img
          src={card.image}
          alt={card.alt}
          loading="lazy"
          className={`absolute inset-0 h-full w-full ${card.imageClassName ?? "object-cover object-center"}`}
        />
        <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
          INSPIRED BY
        </span>
      </div>
      <div className="p-6 md:p-8 flex flex-col gap-3">
        <h4 className="font-display text-2xl md:text-[1.75rem] tracking-[0.04em] text-ink leading-[1.15]">
          {card.title}
        </h4>
        <p className="font-serif italic text-[0.95rem] text-ink/75 leading-relaxed">
          {card.caption}
        </p>
        <SaveLookButton
          source="portofino_more_looks_reference"
          look={{
            id: `portofino/${momentSlug}#${card.key}`,
            destination: "Portofino",
            activity: momentName,
            title: card.title,
            description: card.caption,
            image: card.image,
            url: `/portofino/${momentSlug}#more-looks`,
          }}
        />
        {editorialOnly ? (
          <Link
            to="/portofino/$moment"
            params={{ moment: momentSlug }}
            className="mt-2 inline-flex items-center gap-2 eyebrow text-[0.64rem] tracking-[0.32em] text-ivory bg-ink hover:bg-gold transition-colors px-5 py-2.5 self-start"
          >
            VIEW THE EDIT →
          </Link>
        ) : (
        <div className="mt-4 border-t border-border/50 pt-5">
          {referenceShoppable ? (
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackOutbound({
                brand: reference.brand,
                item: reference.name,
                href: reference.url,
                category: r.slot ?? "Reference",
              })
            }
            className="group flex items-baseline justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="eyebrow text-[0.55rem] tracking-[0.34em] text-gold">
                {r.slot ?? "Reference"}
              </div>
              <div className="eyebrow text-[0.65rem] tracking-[0.28em] text-ink mt-1.5">
                {reference.brand}
              </div>
              <div className="font-serif italic text-[0.95rem] text-ink/85 leading-snug mt-1">
                {reference.name}
                {r.color ? ` — ${r.color}` : ""}
              </div>
              <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/55 mt-1.5">
                {r.retailer}
              </div>
            </div>
            <div className="text-right shrink-0">
              {reference.price && (
                <div className="font-serif text-gold text-[0.95rem]">{reference.price}</div>
              )}
              <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/70 mt-2 group-hover:text-gold transition-colors">
                SHOP THE REFERENCE →
              </div>
            </div>
          </a>
          ) : (
            <ShopOmissionRows
              rows={[
                {
                  slot: r.slot ?? "Reference",
                  brand: reference.brand,
                  name: reference.name,
                  ...(reference.price ? { price: reference.price } : {}),
                  ...(reference.inReview ? { label: REPLACEMENT_IN_REVIEW_LABEL } : {}),
                },
              ]}
            />
          )}
        </div>
        )}
        {!editorialOnly && card.shop && card.shop.products.length > 0 && (
          <ExtraCompleteLookExpander
            title={card.title}
            shop={card.shop}
            lookKey={lookKey}
            {...(lookHealth ? { lookHealth } : {})}
          />
        )}
      </div>
    </article>
  );
}

/**
 * Inline expander that reveals a complete-look shopping list beneath an
 * editorial reference card. Text-only rows — no fabricated thumbnails —
 * matching the Nightcap expander pattern.
 */
function ExtraCompleteLookExpander({
  title,
  shop,
  lookKey,
  lookHealth,
}: {
  title: string;
  shop: NonNullable<ExtraEditorialCard["shop"]>;
  lookKey?: string;
  lookHealth?: Record<string, SlotResolution>;
}) {
  const [open, setOpen] = useState(false);
  const { live: rows, omitted } = splitHealthedRows(
    shop.products.map((p) => applyLookRowHealth(p, lookKey, lookHealth)),
  );
  if (rows.length === 0) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 eyebrow text-[0.64rem] tracking-[0.32em] text-ivory bg-ink hover:bg-gold transition-colors duration-300 px-5 py-2.5"
      >
        {open ? "HIDE THE EDIT" : "SHOP THE EDIT"}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="mt-6 border-t border-border/50 pt-6">
          <ul className="divide-y divide-border/40">
            {rows.map((p) => (
              <li key={p.url} className="py-4">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() =>
                    trackOutbound({
                      brand: p.brand,
                      item: p.name,
                      href: p.url,
                      category: p.slot,
                    })
                  }
                  className="group flex items-baseline justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="eyebrow text-[0.55rem] tracking-[0.34em] text-gold">
                      {p.slot}
                    </div>
                    <div className="eyebrow text-[0.65rem] tracking-[0.28em] text-ink mt-1.5">
                      {p.brand}
                    </div>
                    <div className="font-serif italic text-[0.95rem] text-ink/85 leading-snug mt-1">
                      {p.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {p.price && (
                      <div className="font-serif text-gold text-[0.95rem]">{p.price}</div>
                    )}
                    <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/70 mt-2 group-hover:text-gold transition-colors">
                      SHOP →
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <ShopOmissionRows rows={omitted} />
          {shop.stylingNote && (
            <p className="font-serif italic text-[0.85rem] text-ink/60 mt-6 leading-relaxed">
              {shop.stylingNote}
            </p>
          )}
          <p className="font-serif text-[0.78rem] text-ink/45 mt-3 leading-relaxed">
            {SHOP_ACCURACY_NOTE}
          </p>
          <p className="sr-only">Complete look for {title}</p>
        </div>
      )}
    </div>
  );
}
