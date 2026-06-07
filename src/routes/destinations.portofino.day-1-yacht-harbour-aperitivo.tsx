import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL — permanently moved to the canonical Day 1 page.
export const Route = createFileRoute(
  "/destinations/portofino/day-1-yacht-harbour-aperitivo",
)({
  beforeLoad: () => {
    throw redirect({ to: "/portofino/day-1", replace: true });
  },
  component: () => null,
});