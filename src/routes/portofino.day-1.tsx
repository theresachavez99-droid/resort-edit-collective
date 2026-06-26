import { createFileRoute, redirect } from "@tanstack/react-router";
import { momentSlugForLookKey } from "@/lib/portofino-moment-fallbacks";

// Legacy day route — permanently redirected to the canonical moment route.
export const Route = createFileRoute("/portofino/day-1")({
  beforeLoad: () => {
    throw redirect({
      to: "/portofino/$moment",
      params: { moment: momentSlugForLookKey("day-1") },
      replace: true,
    });
  },
  component: () => null,
});
