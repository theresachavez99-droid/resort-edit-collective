import { createFileRoute, redirect } from "@tanstack/react-router";

// Retired — merged into Look Studio (library tab).
export const Route = createFileRoute("/admin/editorial-library")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/look-studio", search: { tab: "library" }, replace: true });
  },
  component: () => null,
});
