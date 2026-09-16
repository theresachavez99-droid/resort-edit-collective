import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Only Portofino is published. Rather than send a reader into an unfinished
 * destination page, /destinations/portofino redirects to the real guide and
 * every other slug returns to the destinations index. Destination data stays in
 * the repo for the next launch.
 */
export const Route = createFileRoute("/destinations/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug === "portofino") {
      throw redirect({ to: "/portofino", replace: true, statusCode: 301 });
    }
    throw redirect({ to: "/destinations", replace: true, statusCode: 301 });
  },
  head: () => ({
    meta: [
      { title: "Destinations | Resort Edit" },
      { name: "description", content: "Resort Edit destination guides." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => null,
});
