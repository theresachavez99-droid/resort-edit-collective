/**
 * Day Image Registry — single source of truth for the canonical mood image
 * of each Portofino day / moment.
 *
 * When a founder approves a new primary image for a day, update the
 * `CANONICAL_DAY_IMAGES` entry below (or, in the future, the matching row
 * in the `canonical_day_images` table) and every surface that reads from
 * this registry — hero banner, editorial reference card, destination /
 * home card, experience tile, preview / fallback / social-share image —
 * picks it up automatically.
 *
 * Surface-specific overrides ARE allowed but must be explicit. Add a key
 * under `DAY_IMAGE_OVERRIDES[daySlug]` (e.g. `hero_override`,
 * `editorial_override`, `experience_override`). If no override is set, the
 * canonical image wins.
 *
 * Rule: no Day page may show two different primary mood images unless an
 * override is explicitly registered here.
 */
import yachtDay1HeroAsset from "@/assets/generated/resort-edit/look-yacht-day1-hero.png.asset.json";
import lillaLemonBeachClub from "@/assets/uploads/lilla/lilla-lemon-beach-club.png.asset.json";
import cira9 from "@/assets/uploads/cira/cira-9.png.asset.json";
import cira10 from "@/assets/uploads/cira/cira-10.png.asset.json";
import cira13 from "@/assets/uploads/cira/cira-13.png.asset.json";
import poolLoungingShopping from "@/assets/uploads/portofino/pool-lounging-shopping-lilla-red-capri.jpg.asset.json";
import { createContext, createElement, useContext, type ReactNode } from "react";

export type DaySlug = "day-1" | "day-2" | "day-3" | "day-4" | "day-5";

export type DayImageSurface =
  | "hero"
  | "editorial"
  | "destination_card"
  | "experience"
  | "preview"
  | "fallback"
  | "social";

/**
 * Canonical primary image per day. Replace the import + value when the
 * founder approves a new canonical anchor.
 *
 * Day 1 canonical: blue-and-white Lilla yacht image (Majolica bikini +
 * porcelain-print sarong on a Portofino yacht deck). The previous coral
 * Johanna Ortiz reference has been retired from Day 1 and may be reused
 * for Harbor Aperitivo / Sunset Views / Long Lunch / Riviera Dinner only.
 */
export const CANONICAL_DAY_IMAGES: Record<DaySlug, string> = {
  "day-1": yachtDay1HeroAsset.url,
  "day-2": lillaLemonBeachClub.url,
  "day-3": poolLoungingShopping.url,
  "day-4": cira10.url,
  "day-5": cira13.url,
};

/**
 * Explicit per-surface overrides. Empty by default. Populate only when the
 * founder intentionally wants a different image on a specific surface.
 */
export const DAY_IMAGE_OVERRIDES: Partial<
  Record<DaySlug, Partial<Record<DayImageSurface, string>>>
> = {};

/** Resolve the image a given Day surface should render. */
export function getCanonicalDayImage(
  daySlug: DaySlug,
  surface: DayImageSurface = "hero",
): string {
  return (
    DAY_IMAGE_OVERRIDES[daySlug]?.[surface] ?? CANONICAL_DAY_IMAGES[daySlug]
  );
}

/**
 * Report which image each Day 1 surface currently resolves to. Used by the
 * admin sync action and for QA after a canonical-image replacement.
 */
export function describeDayImageBindings(daySlug: DaySlug) {
  const surfaces: DayImageSurface[] = [
    "hero",
    "editorial",
    "destination_card",
    "experience",
    "preview",
    "fallback",
    "social",
  ];
  return surfaces.map((surface) => ({
    surface,
    image: getCanonicalDayImage(daySlug, surface),
    isOverride: Boolean(DAY_IMAGE_OVERRIDES[daySlug]?.[surface]),
  }));
}

/* ---------------------------------------------------------------------------
 * Runtime DB override layer
 * ------------------------------------------------------------------------- */

/**
 * React context carrying founder-approved DB overrides from
 * `canonical_day_images`. Populated once at the root by a loader call to
 * `loadCanonicalDayImageOverrides`. When a surface uses
 * `useCanonicalDayImage(slug, surface)`, the DB row wins; otherwise the TS
 * fallback above wins. Pending uploads are NEVER routed through this
 * context — only approved canonical rows are.
 */
const DayImageOverridesContext = createContext<Record<string, string>>({});

export function DayImageOverridesProvider({
  value,
  children,
}: {
  value: Record<string, string>;
  children: ReactNode;
}) {
  return createElement(
    DayImageOverridesContext.Provider,
    { value: value ?? {} },
    children,
  );
}

export function useDayImageOverrides(): Record<string, string> {
  return useContext(DayImageOverridesContext);
}

/** Render-time resolver: DB override > explicit fallback > TS canonical. */
export function useCanonicalDayImage(
  daySlug: DaySlug,
  surface: DayImageSurface = "hero",
  fallback?: string,
): string {
  const overrides = useContext(DayImageOverridesContext);
  return (
    overrides[daySlug] ??
    DAY_IMAGE_OVERRIDES[daySlug]?.[surface] ??
    fallback ??
    CANONICAL_DAY_IMAGES[daySlug]
  );
}