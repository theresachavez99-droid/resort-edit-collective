import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Retired with the outfit catalog: the brand directory only made sense when
 * Resort Edit merchandised clothing. This layout route redirects /brands and
 * every /brands/* child permanently to the Portofino guide's packing advice.
 * The brand data stays in the repo for recovery; nothing here imports it.
 */
export const Route = createFileRoute("/brands")({
  beforeLoad: () => {
    throw redirect({ to: "/portofino", hash: "wear", replace: true, statusCode: 301 });
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
