import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Retired while @resort.edit is not launched: there is no real feed to show, so
 * /latest permanently redirects to the Portofino guide instead of presenting an
 * empty "coming soon" page. Nothing else runs before the redirect.
 */
export const Route = createFileRoute("/latest")({
  beforeLoad: () => {
    throw redirect({ to: "/portofino", replace: true, statusCode: 301 });
  },
  head: () => ({
    meta: [
      { title: "Portofino Guide | Resort Edit" },
      { name: "description", content: "The Resort Edit guide to Portofino." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => null,
});
