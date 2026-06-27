import { createFileRoute, redirect } from "@tanstack/react-router";

// Retired top-level index — merged into Destination Moments (collections tab).
// Detail pages at /admin/collections/$id remain reachable.
export const Route = createFileRoute("/admin/collections")({
  beforeLoad: () => {
    throw redirect({
      to: "/admin/destination-moments",
      search: { tab: "collections" },
      replace: true,
    });
  },
  component: () => null,
});
