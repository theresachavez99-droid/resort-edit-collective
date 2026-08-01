import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

/**
 * Canonical + breadcrumb owner for /brands. The parent `brands.tsx` route is an
 * ancestor of /brands/$slug, so its head() must not declare a canonical — that
 * would emit two canonical links on every brand page.
 */
export const Route = createFileRoute("/brands/")({
  head: () => ({
    links: [{ rel: "canonical", href: absoluteUrl("/brands") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Resort Edit", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Brands We Love", item: absoluteUrl("/brands") },
          ],
        }),
      },
    ],
  }),
  component: () => null,
});