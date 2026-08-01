import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

/**
 * Canonical + breadcrumb owner for /destinations. The parent `destinations.tsx`
 * route is an ancestor of /destinations/$slug, so it must not declare a
 * canonical of its own.
 */
export const Route = createFileRoute("/destinations/")({
  head: () => ({
    links: [{ rel: "canonical", href: absoluteUrl("/destinations") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Resort Edit", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Destinations", item: absoluteUrl("/destinations") },
          ],
        }),
      },
    ],
  }),
  component: () => null,
});