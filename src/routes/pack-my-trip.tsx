import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Retired: the Pack My Trip wizard was called off. The route stays only as a
 * permanent redirect so any shared link lands on the Portofino guide. No wizard
 * or catalog code is imported or executed here.
 */
export const Route = createFileRoute("/pack-my-trip")({
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
