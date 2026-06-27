import { createFileRoute, redirect } from "@tanstack/react-router";

// Retired top-level index — merged into Destination Moments (collections tab).
// Detail pages at /admin/collections/$id remain reachable directly.
export const Route = createFileRoute("/admin/collections")({
  beforeLoad: () => {
    throw redirect({
      href: "/admin/destination-moments?tab=collections",
      replace: true,
    });
  },
  component: () => null,
});
