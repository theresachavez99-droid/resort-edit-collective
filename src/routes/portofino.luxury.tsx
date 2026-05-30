import { createFileRoute } from "@tanstack/react-router";
import { TierPortofinoView } from "@/components/TierPortofinoView";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/portofino/luxury")({
  head: () => ({
    meta: [
      { title: "Portofino · luxury — Resort Edit" },
      { name: "description", content: "Portofino looks at the luxury price tier — five days, three looks per day, fully shoppable." },
      { property: "og:title", content: "Portofino · luxury — Resort Edit" },
      { property: "og:url", content: absoluteUrl("/portofino/luxury") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino/luxury") }],
  }),
  component: () => <TierPortofinoView tierSlug="luxury" />,
});
