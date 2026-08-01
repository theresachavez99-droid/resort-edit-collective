import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";
import portofinoImg from "@/assets/hero-portofino-harbor.jpg";

export const Route = createFileRoute("/portofino/")({
  head: () => ({
    meta: [
      { property: "og:image", content: absoluteUrl(portofinoImg) },
      { property: "og:url", content: absoluteUrl("/portofino") },
      { name: "twitter:image", content: absoluteUrl(portofinoImg) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Resort Edit", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Portofino", item: absoluteUrl("/portofino") },
          ],
        }),
      },
    ],
  }),
  component: () => null,
});