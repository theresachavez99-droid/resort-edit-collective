import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/portofino/")({
  head: () => ({
    links: [{ rel: "canonical", href: absoluteUrl("/portofino") }],
  }),
  component: () => null,
});