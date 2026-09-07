import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Retired: the per-moment clothing-look pages have been folded into the single
 * Portofino destination hub. Every legacy moment URL permanently redirects to
 * /portofino so historic links and shares never 404.
 */
export const Route = createFileRoute("/portofino/$moment")({
  beforeLoad: () => {
    throw redirect({ to: "/portofino", replace: true, statusCode: 301 });
  },
  head: () => ({
    meta: [
      { title: "Portofino | Resort Edit" },
      { name: "description", content: "This Portofino moment now lives in the Portofino edit." },
      { property: "og:title", content: "Portofino | Resort Edit" },
      { property: "og:description", content: "This Portofino moment now lives in the Portofino edit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => null,
});
