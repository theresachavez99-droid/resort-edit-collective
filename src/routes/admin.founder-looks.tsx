import { createFileRoute, redirect } from "@tanstack/react-router";

// Renamed to /admin/looks in the Step 2 admin streamlining pass.
// Kept as a permanent redirect so bookmarks and saved tabs keep working.
export const Route = createFileRoute("/admin/founder-looks")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/looks", replace: true, statusCode: 301 });
  },
  component: () => null,
});
