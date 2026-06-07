import { createFileRoute } from "@tanstack/react-router";
import { TierPortofinoView } from "@/components/TierPortofinoView";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/portofino/riviera-finds")({
  head: () => ({
    meta: [
      { title: "Portofino · riviera-finds | Resort Edit | Dressed for the destination" },
      { name: "description", content: "Portofino looks at the riviera-finds price tier — five days, three looks per day, fully shoppable." },
      { property: "og:title", content: "Portofino · riviera-finds | Resort Edit | Dressed for the destination" },
      { property: "og:url", content: absoluteUrl("/portofino/riviera-finds") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino/riviera-finds") }],
  }),
  component: () => <TierPortofinoView tierSlug="riviera-finds" />,
});
