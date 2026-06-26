import { createFileRoute, redirect, notFound } from "@tanstack/react-router";
import {
  momentSlugForLookKey,
  type LegacyDaySlug,
} from "@/lib/portofino-moment-fallbacks";

const DAY_SLUGS = new Set<LegacyDaySlug>([
  "day-1",
  "day-2",
  "day-3",
  "day-4",
  "day-5",
]);

// Legacy /portofino/day-N/look-X — redirect to canonical moment.
// Non-canonical look variants resolve to the day's primary moment so no
// legacy bookmark 404s during the slug migration.
export const Route = createFileRoute("/portofino/$day/$look")({
  beforeLoad: ({ params }) => {
    if (!DAY_SLUGS.has(params.day as LegacyDaySlug)) throw notFound();
    const moment = momentSlugForLookKey(
      params.day as LegacyDaySlug,
      params.look,
    );
    throw redirect({
      to: "/portofino/$moment",
      params: { moment },
      replace: true,
    });
  },
  component: () => null,
});
