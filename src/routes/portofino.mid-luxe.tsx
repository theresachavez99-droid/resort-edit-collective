import { createFileRoute } from "@tanstack/react-router";
import { TierPortofinoView } from "@/components/TierPortofinoView";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/portofino/mid-luxe")({
  head: () => ({
    meta: [
      { title: "Portofino · mid-luxe — Resort Edit" },
      { name: "description", content: "Portofino looks at the mid-luxe price tier — five days, three looks per day, fully shoppable." },
      { property: "og:title", content: "Portofino · mid-luxe — Resort Edit" },
      { property: "og:url", content: absoluteUrl("/portofino/mid-luxe") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino/mid-luxe") }],
  }),
  component: () => <TierPortofinoView tierSlug="mid-luxe" />,
});
