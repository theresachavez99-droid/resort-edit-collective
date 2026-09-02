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

/**
 * Redirect-only tombstone for the retired Day-N / Look-X architecture.
 * Canonical complete-look pages use explicit static route files so this
 * dynamic route can never fall through into legacy commerce rendering.
 */
export const Route = createFileRoute("/portofino/$day/$look")({
  beforeLoad: ({ params }) => {
    if (DAY_SLUGS.has(params.day as LegacyDaySlug)) {
      throw redirect({
        to: "/portofino/$moment",
        params: {
          moment: momentSlugForLookKey(params.day as LegacyDaySlug, params.look),
        },
        replace: true,
        statusCode: 301,
      });
    }
    throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Retired Portofino Look | Resort Edit" },
      { name: "description", content: "This legacy Portofino look has moved." },
      { property: "og:title", content: "Retired Portofino Look | Resort Edit" },
      { property: "og:description", content: "This legacy Portofino look has moved." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => null,
});
