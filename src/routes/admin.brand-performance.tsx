import { createFileRoute, redirect } from "@tanstack/react-router";

// Retired — merged into Brands (performance tab).
export const Route = createFileRoute("/admin/brand-performance")({
  beforeLoad: () => {
    throw redirect({ href: "/admin/brands?tab=performance", replace: true });
  },
  component: () => null,
});
