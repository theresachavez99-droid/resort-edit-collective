import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useEffect, useId, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { getPortofinoMoment } from "@/lib/portofino-moments.functions";
import { getMomentSlotHealth } from "@/lib/product-health.functions";
import { slotKey, REPLACEMENT_IN_REVIEW_LABEL, type SlotResolution } from "@/lib/product-health";
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
import { isSuppressedProduct } from "@/lib/suppressed-products";
import { EditorialClosetSection } from "@/components/EditorialClosetSection";
import { MAX_SUPPORTING_LOOKS } from "@/lib/look-completeness";

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
  base: HeroFocal; // <640px (mobile portrait)
  md?: HeroFocal; // ≥768px (tablet)
  lg?: HeroFocal; // ≥1024px (desktop)
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
 * Slugs whose hero video is temporarily withheld (e.g. pending a re-export).
 * The entry stays in MOMENT_HERO_VIDEO and the asset stays in the repo — just
 * delete the slug here to re-enable the cinematic hero.
 */
const HERO_VIDEO_DISABLED = new Set<string>(["nightcap", "pool-lounging", "arrival"]);

/**
 * Slugs whose static hero renders as a full-width 16:9 scene banner instead of
 * the default viewport-height crop. Used for environment-only heroes where the
 * place (not a model) is the subject, so the frame should stay intact.
 */
const HERO_STATIC_WIDE = new Set<string>(["pool-lounging", "arrival"]);

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
      body: "She steps into the Riviera slowly — ivory tailoring, sunlit stone, and the first feeling that the trip has truly begun.",
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
      body: "A slow espresso. The first stroll along the harbor. The Riviera waking around you.",
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
      body: "The climb to Castello Brown and the path to the lighthouse, through Portofino's hidden corners and colorful streets.",
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
      headline: "Beach Club.",
      body: "A leisurely afternoon at Paraggi, the emerald cove where even Portofino comes to swim.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Beach Club in Portofino",
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
      body: "The crossing to San Fruttuoso — the abbey in a cove reachable only by boat or on foot — in effortless style.",
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
      body: "From the hill above the harbor, the coast glows as the sun disappears into the sea.",
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
      body: "One final cocktail on the piazzetta before the perfect day comes to a close.",
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
      headline: "Pool Lounging.",
      body: "An elegant afternoon by the pool, above the bay, beneath striped umbrellas.",
      ctaLabel: "Shop The Look",
      ctaHref: "#shop-the-look",
    },
    ariaLabel: "Pool Lounging in Portofino",
  },
};
import {
  getPortofinoMomentDef,
  PORTOFINO_MOMENT_SLUG_ALIASES,
  momentSlugForLookKey,
} from "@/lib/portofino-moment-fallbacks";
import { OtherPortofinoMoments } from "@/components/OtherPortofinoMoments";
import { MomentExperience } from "@/components/experiences/MomentExperience";
import { ShopOmissionRows, SHOP_ACCURACY_NOTE } from "@/components/ShopOmissionRows";
import { absoluteUrl } from "@/lib/site";
import { trackOutbound } from "@/lib/utils";
import { isPublishableProductUrl } from "@/lib/shop-url-policy";
import { publicFeaturedTitle } from "@/lib/moment-display";
import { countShoppableRows, shopCtaAllowed } from "@/lib/commerce-cta-policy";
import type { LegacyDaySlug } from "@/lib/portofino-moment-fallbacks";
import { SaveLookButton } from "@/components/SaveLookButton";
import { ShopTheLookItems, lookItemsQuery } from "@/components/commerce/ShopTheLookItems";
import {
  ResortEditItemization,
  heroLookEligibility,
  shopSlotsQuery,
} from "@/components/commerce/ResortEditItemization";

import { StagedLookItemization } from "@/components/commerce/StagedLookItemization";
import { PREVIEW_STAGED_LOOKS } from "@/data/previewStagedLooks";
import { previewStagingQuery } from "@/lib/preview-staging.functions";
import { CommissionNotice } from "@/components/CommissionNotice";
import { evaluateAtomicLook } from "@/lib/look-atomic-completeness";
import { isLillaLookComplete } from "@/lib/lilla-look-audit";
// Locked Pool Lounging editorial reference — the seated poolside portrait
// (Aperol Spritz, white lounge chair, Splendido pool). This asset is the
// permanent visual for the Pool Lounging moment and must not be replaced
// when product links, styling, or layout change.
import poolLoungingEditorial from "@/assets/uploads/portofino/pool-lounging-lilla-green-floral-splendido.png.asset.json";
import longLunchEditorial from "@/assets/uploads/portofino/long-lunch-lilla-rima-ice-blue-editorial.png.asset.json";
import arrivalIvoryLinenQuayEditorial from "@/assets/uploads/lilla/arrival-lilla-ivory-linen-quay-v7.png.asset.json";

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
      context.queryClient.ensureQueryData(shopSlotsQuery(`portofino/${params.moment}`)),
      context.queryClient.ensureQueryData(previewStagingQuery()),
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
              {
                "@type": "ListItem",
                position: 2,
                name: "Portofino",
                item: absoluteUrl("/portofino"),
              },
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
        <Link
          to="/portofino"
          className="mt-4 inline-block eyebrow tracking-[0.28em] text-[0.7rem] border-b border-gold text-gold"
        >
          Return to Portofino
        </Link>
      </div>
    </main>
  ),
  notFoundComponent: () => (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-ink">
      <div className="text-center">
        <p className="eyebrow text-gold tracking-[0.3em] text-[0.7rem]">Portofino</p>
        <h1 className="font-display text-2xl mt-2">
          That moment doesn't exist in Portofino — yet.
        </h1>
        <Link
          to="/portofino"
          className="mt-4 inline-block eyebrow tracking-[0.28em] text-[0.7rem] border-b border-gold text-gold"
        >
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
  // DB-driven commerce layers for this moment (prefetched in the loader) —
  // read here as well so the hero CTA gate reflects exactly what renders.
  const momentLookKey = `portofino/${slug}`;
  const { data: shopSlotsData } = useSuspenseQuery(shopSlotsQuery(momentLookKey));
  const { data: lookItemsData } = useSuspenseQuery(lookItemsQuery(momentLookKey));
  // PREVIEW-ONLY STAGING — founder-approved hero replacements render on the
  // Lovable preview host only; the production hostname keeps its currently
  // deployed behaviour until approval (see `@/lib/preview-staging`).
  const { data: previewStagingData } = useSuspenseQuery(previewStagingQuery());
  const previewStaging = previewStagingData?.staging ?? false;
  const stagedCandidate = previewStaging ? PREVIEW_STAGED_LOOKS[slug] : undefined;
  // ATOMIC COMPLETENESS — a staged look renders only when EVERY visible
  // product category has an active, valid exact-product link.
  const stagedLook =
    stagedCandidate &&
    evaluateAtomicLook({
      visibleProductSlots: stagedCandidate.visibleProductSlots,
      rows: stagedCandidate.rows,
    }).complete
      ? stagedCandidate
      : undefined;
  const card = data.ok ? data.moment : null;
  if (!card) throw notFound();

  const { resolved } = card;
  const heroImage = card.hero_banner_image;
  const isFounderLook = resolved.source === "founder_look";

  // Admin/debug visibility: source badge only renders with ?debug=1.
  const isDebug =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");

  // HONEST COMMERCE CTA — a shoppable-set CTA ("Shop The Look") may only
  // render when the featured section actually publishes verified product
  // links. Both sources are DB-driven (public_shop_slot_display +
  // look_items_public), so the gate reflects exactly what the page renders —
  // there is no static registry to drift. Zero-link pages stay editorial:
  // no CTA, no placeholder, no "Coming Soon".
  const heroRows = (shopSlotsData?.slots ?? []).filter((r) => r.brand || r.product_name);
  // ONE PUBLIC ELIGIBILITY RULE — the hero outfit is shoppable only when every
  // visible category has an active exact-product link. Otherwise the whole
  // shoppable unit (model image, itemization, Save control, CTA) is withheld.
  const heroEligible = stagedLook
    ? true
    : heroRows.length > 0 && heroLookEligibility(momentLookKey, heroRows).eligible;
  const shoppableRowCount = stagedLook
    ? countShoppableRows(stagedLook.rows)
    : heroEligible
      ? countShoppableRows(heroRows) +
        countShoppableRows((lookItemsData?.items ?? []).map((it) => ({ url: it.affiliate_url })))
      : 0;
  const showShopCta = shopCtaAllowed(shoppableRowCount);


  // Public-facing display title for the featured look. Founder look titles are
  // often blank or workflow-y; map to an editorial name per moment so the page
  // never shows internal/legacy names like "The Slow Departure" on Arrival.
  const founderDisplayTitle =
    (resolved.title && resolved.title.trim()) ||
    FOUNDER_LOOK_DISPLAY_TITLE[slug] ||
    card.moment_name;
  const featuredDisplayTitle = isFounderLook
    ? (FOUNDER_LOOK_DISPLAY_TITLE[slug] ?? founderDisplayTitle)
    : resolved.title;

  const extraCards = MOMENT_EXTRA_EDITORIAL_CARDS[slug] ?? [];
  // ATOMIC COMPLETENESS (preview) — a supporting Lilla card renders only when
  // every product category visible in its photograph has an active, valid
  // link. Incomplete looks (e.g. "Green Eyelet on Via Roma", whose visible
  // shoes and raffia bag are unlinked) are hidden entirely: no card, no
  // expansion, no "Still sourcing" row.
  // Complete-look rule applies on every environment, not just preview: a
  // supporting look with an unlinked visible slot is hidden entirely.
  const publishableExtraCards = extraCards.filter((c) => isLillaLookComplete(slug, c.key));
  const renderedExtraCards = publishableExtraCards.slice(0, MAX_SUPPORTING_LOOKS);

  // Moments registered in MOMENT_HERO_VIDEO get the shared cinematic video
  // hero. All other moments keep the canonical image hero.
  // Temporarily disabled slugs fall back to the static place-led hero image;
  // remove the slug from HERO_VIDEO_DISABLED to re-enable its video.
  const cinematicHero = HERO_VIDEO_DISABLED.has(slug) ? undefined : MOMENT_HERO_VIDEO[slug];

  // Optional editorial-image override — some moments (e.g. Pool Lounging)
  // publish an approved Resort Edit editorial image separate from the DB
  // `resolved.image`. When present, this becomes the left-column image.
  const editorialImage = stagedLook?.image ?? MOMENT_EDITORIAL_IMAGE[slug] ?? resolved.image;
  // Optional "View Complete Look" destination for moments that publish
  // a dedicated Complete Look page. Rendered as a centered CTA under the
  // Resort Edit shopping list.
  const completeLookHref = MOMENT_COMPLETE_LOOK[slug];
  // Public featured heading — canonical-journey policy: approved editorial
  // override → candidate title → canonical moment name. Retired legacy look
  // titles ("Via Roma Boutiques", "Capri Aperitivo") can never render.
  const editorialTitle = publicFeaturedTitle(slug, featuredDisplayTitle, card.moment_name);

  return (
    <div className="pb-4 md:pb-6">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[1180px] px-4 sm:px-6 pt-5 pb-2">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 eyebrow text-[0.6rem] tracking-[0.26em] text-ink/55">
          <li>
            <Link to="/" className="hover:text-gold transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-gold/50">
            /
          </li>
          <li>
            <Link to="/portofino" className="hover:text-gold transition-colors">
              Portofino
            </Link>
          </li>
          <li aria-hidden className="text-gold/50">
            /
          </li>
          <li aria-current="page" className="text-ink">
            {card.moment_name}
          </li>
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
        <MomentCinematicHero config={cinematicHero} showShopCta={showShopCta} />
      ) : (
        <section
          className={
            "relative w-full overflow-hidden bg-ink " +
            (HERO_STATIC_WIDE.has(slug)
              ? "aspect-[16/9] max-h-[70vh]"
              : "h-[36vh] md:h-[48vh] min-h-[280px]")
          }
        >
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
          <div
            className={
              heroEligible
                ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)] gap-8 md:gap-12 items-start"
                : "max-w-3xl"
            }
          >
            {/* The model image renders ONLY with a complete shoppable outfit —
                an incomplete outfit is withheld in full, image included. */}
            {heroEligible && (
              <div className="relative aspect-[4/5] overflow-hidden bg-cream/40 border border-border/60">
                <img
                  src={editorialImage}
                  alt={stagedLook?.alt ?? `${editorialTitle} — Portofino featured look`}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
                  INSPIRED BY
                </span>
              </div>
            )}

            <div className="space-y-4 lg:pl-2">
              <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink leading-[1.1]">
                {editorialTitle}
              </h2>
              {/* Save control lives in the featured column so every moment —
                  including those rendering the cinematic hero, which has no
                  overlay controls — exposes an identical Save action. It is
                  withheld with the rest of an incomplete shoppable unit. */}
              {heroEligible && (
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
              )}

              <p className="font-serif italic text-[1rem] md:text-[1.05rem] text-ink/80 leading-relaxed max-w-prose">
                {stagedLook?.caption ??
                  MOMENT_FEATURED_COPY[slug]?.body ??
                  card.narrative}
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
              {/* THE RESORT EDIT — itemization rendered exclusively from the
                  `public_shop_slot_display` view (status = 'active'), or, in
                  preview staging, from the atomically complete staged look. */}
              {stagedLook ? (
                <StagedLookItemization look={stagedLook} />
              ) : (
                <ResortEditItemization lookKey={`portofino/${slug}`} />
              )}
              {completeLookHref && heroEligible && (
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
          </div>
          {/* SHOP THE LOOK — live `look_items_public` rows for this moment.
              Renders nothing when the look has no items. Suppressed while a
              staged look owns the hero so the set stays atomic. */}
          {stagedLook || !heroEligible ? null : <ShopTheLookItems lookKey={`portofino/${slug}`} />}
        </div>
      </section>

      {/* EDITORIAL CLOSET — dynamic, secondary alternative-shopping layer.
          Never counts toward the two supporting looks; only approved +
          live-verified options render. */}
      <EditorialClosetSection
        momentSlug={slug}
        momentName={card.moment_name}
        heroCategory={shopSlotsData?.slots?.[0]?.slot_label ?? shopSlotsData?.slots?.[0]?.slot ?? null}
      />

      {/* MORE WAYS TO DRESS FOR THIS MOMENT — editorial look grid.
          Nightcap uses an editorial-only override (two approved Lilla
          references) until affiliate product sets for those looks land. */}
      {slug === "nightcap" ? (
        <section id="more-looks" className="bg-cream/40 border-t border-border/40 scroll-mt-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-9 md:py-12">
            <div className="mb-6 md:mb-8 max-w-2xl">
              <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">THE EDIT</span>
              <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
                More Resort Edit Looks
              </h3>
              <p className="font-serif italic text-[0.95rem] text-ink/70 mt-3 leading-relaxed">
                Other interpretations of this editorial moment.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {NIGHTCAP_EDITORIAL_CARDS.filter(
                (c) => isLillaLookComplete("nightcap", c.key),
              ).map((c) => (
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
      ) : (
        renderedExtraCards.length > 0 && (
          <section id="more-looks" className="bg-cream/40 border-t border-border/40 scroll-mt-16">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-9 md:py-12">
              <div className="mb-6 md:mb-8 max-w-2xl">
                <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">THE EDIT</span>
                <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
                  More Resort Edit Looks
                </h3>
                <p className="font-serif italic text-[0.95rem] text-ink/70 mt-3 leading-relaxed">
                  Other interpretations of this editorial moment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
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
        )
      )}

      <MomentExperience momentSlug={slug} />

      <OtherPortofinoMoments excludeSlugs={[slug]} />
    </div>
  );
}

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
function MomentCinematicHero({
  config,
  showShopCta,
}: {
  config: MomentHeroVideo;
  /** Honest-commerce gate: the shop CTA renders only when the page publishes verified product links. */
  showShopCta: boolean;
}) {
  const {
    video,
    poster,
    focal,
    fit = "cover",
    overlay,
    ariaLabel,
    containerHeightClasses,
  } = config;
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
  const focalLg = focal.lg ? `${focal.lg.x}% ${focal.lg.y}%` : focalMd;

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
              mediaClasses +
              " hero-media" +
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
            {showShopCta && (
              <a
                href={overlay.ctaHref}
                className="mt-8 inline-flex items-center gap-3 eyebrow font-medium text-[0.82rem] tracking-[0.34em] text-ivory bg-ink/80 hover:bg-gold border border-ivory/50 hover:border-gold backdrop-blur-sm px-9 py-[0.95rem] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] transition-colors"
              >
                {overlay.ctaLabel} →
              </a>
            )}
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
  arrival: "The Ivory Arrival",
  "espresso-morning": "The Espresso Morning",
  "yacht-day": "The Yacht Day",
  "harbor-aperitivo": "The Harbor Aperitivo",
  "sunset-views": "The Sunset Hour",
  "riviera-dinner": "The Riviera Dinner",
  "exploring-the-harbor": "Exploring the Harbor",
  "beach-club": "The Beach Club",
  "long-lunch": "The Long Lunch",
  shopping: "The Shopping Afternoon",
  nightcap: "The Nightcap",
  "pool-lounging": "Poolside in Portofino",
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
    body: "Faithfull's Maya vest and Isotta pant in natural linen — tonal, quietly tailored, and finished with warm tan leather and slim gold for the first walk along the harbor.",
  },
  nightcap: {
    label: "Inspired by",
    body: "A sculpted satin corset paired with fluid tailoring creates an effortlessly elegant Riviera silhouette for evenings along the Portofino harbor.",
  },
  "pool-lounging": {
    label: "Inspired by",
    body: "A polished Riviera poolside look designed for long afternoons overlooking Portofino — vibrant Capri print, natural raffia, and sculptural gold.",
  },
  "long-lunch": {
    label: "Inspired by",
    body: "A pale mist blue midi with a structured bodice and long front zipper — walked slowly along the Portofino quay after a lingering waterfront lunch. Warm tan leather, woven cognac, and floating 18k gold.",
  },
};

// Featured-look title overrides live in `@/lib/moment-display`
// (MOMENT_FEATURED_TITLE_OVERRIDES) so tests and CI audits share them.

/**
 * Optional approved editorial image override for the left column. Uses the
 * founder-approved Resort Edit image rather than the database `resolved.image`
 * when a moment publishes its own editorial photograph.
 */
const MOMENT_EDITORIAL_IMAGE: Record<string, string> = {
  arrival: arrivalIvoryLinenQuayEditorial.url,
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
 * A URL is shoppable only when it points at an exact retailer product page.
 * The policy itself lives in `@/lib/shop-url-policy` so curated data files,
 * the launch audit, and CI all apply the same rule.
 */
function isUsableShopUrl(url: string | undefined | null): url is string {
  return isPublishableProductUrl(url);
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
  url: string;
  unsourced?: boolean;
  inReview: boolean;
};

function applyLookRowHealth(
  row: {
    slot: string;
    brand: string;
    name: string;
    price?: string;
    url: string;
    unsourced?: boolean;
  },
  lookKey: string | undefined,
  looks: Record<string, SlotResolution> | undefined,
): HealthedShopRow {
  const resolution = lookKey && looks ? looks[`${lookKey}::${slotKey(row.slot)}`] : undefined;
  if (!resolution) return { ...row, inReview: false };
  if (resolution.state === "live") {
    const p = resolution.product;
    return {
      ...row,
      brand: p.brand,
      name: p.product_name,
      url: p.url ?? "",
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
      ...(p.inReview ? { label: REPLACEMENT_IN_REVIEW_LABEL } : {}),
    }));
  return { live, omitted };
}

/**
 * Build a short, deduped list of slot labels for the "Complete Outfit Includes"
 * summary. Counts live (non-placeholder) entries only, preserves canonical order,
 * and falls back gracefully for override-driven looks.
 */

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
          <CommissionNotice className="mb-5" />
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
                    <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/70 group-hover:text-gold transition-colors">
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
  // Failed-audit products are gated out entirely (no omission row, no status
  // copy) — see `src/lib/suppressed-products.ts`.
  const referenceSuppressed = isSuppressedProduct(lookKey, r.brand, r.name);
  const shopProducts = (card.shop?.products ?? []).filter(
    (p) => !isSuppressedProduct(lookKey, p.brand, p.name),
  );
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
        {editorialOnly || referenceSuppressed ? (
          editorialOnly ? (
            <Link
              to="/portofino/$moment"
              params={{ moment: momentSlug }}
              className="mt-2 inline-flex items-center gap-2 eyebrow text-[0.64rem] tracking-[0.32em] text-ivory bg-ink hover:bg-gold transition-colors px-5 py-2.5 self-start"
            >
              VIEW THE EDIT →
            </Link>
          ) : null
        ) : (
          <div className="mt-4 border-t border-border/50 pt-5">
            {referenceShoppable && <CommissionNotice className="mb-4" />}
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
                  <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/70 group-hover:text-gold transition-colors">
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
                    ...(reference.inReview ? { label: REPLACEMENT_IN_REVIEW_LABEL } : {}),
                  },
                ]}
              />
            )}
          </div>
        )}
        {!editorialOnly && card.shop && shopProducts.length > 0 && (
          <ExtraCompleteLookExpander
            title={card.title}
            shop={{ ...card.shop, products: shopProducts }}
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
          <CommissionNotice className="mb-5" />
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
                    <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/70 group-hover:text-gold transition-colors">
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
