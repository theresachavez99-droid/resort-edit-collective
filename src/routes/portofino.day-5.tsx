import { createFileRoute, redirect } from "@tanstack/react-router";
import { momentSlugForLookKey } from "@/lib/portofino-moment-fallbacks";

// Legacy day route — permanently redirected to the canonical moment route.
export const Route = createFileRoute("/portofino/day-5")({
  beforeLoad: () => {
    throw redirect({
      to: "/portofino/$moment",
      params: { moment: momentSlugForLookKey("day-5") },
      replace: true,
      statusCode: 301,
    });
  },
  component: () => null,
});
