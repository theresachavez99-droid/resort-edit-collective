import { createFileRoute, redirect } from "@tanstack/react-router";
import { momentSlugForLookKey } from "@/lib/portofino-moment-fallbacks";

// Legacy day route — permanently redirected to the canonical moment route.
export const Route = createFileRoute("/portofino/day-3")({
  beforeLoad: () => {
    throw redirect({
      to: "/portofino/$moment",
      params: { moment: momentSlugForLookKey("day-3") },
      replace: true,
      statusCode: 301,
    });
  },
  component: () => null,
});
