import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Retired complete-look page. Redirects to the Portofino destination hub.
 */
export const Route = createFileRoute("/portofino/pool-lounging/poolside-glam")({
  beforeLoad: () => {
    throw redirect({ to: "/portofino", replace: true, statusCode: 301 });
  },
  head: () => ({
    meta: [
      { title: "Portofino | Resort Edit" },
      { name: "description", content: "This Portofino look now lives in the Portofino edit." },
      { property: "og:title", content: "Portofino | Resort Edit" },
      { property: "og:description", content: "This Portofino look now lives in the Portofino edit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => null,
});
