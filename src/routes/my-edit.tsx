import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Retired with the outfit catalog. Saved-look pages have no content in the
 * Instagram-led publication, so the route is a permanent redirect only. The
 * saved-look libraries remain in the repo for recovery but are not imported.
 */
export const Route = createFileRoute("/my-edit")({
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
