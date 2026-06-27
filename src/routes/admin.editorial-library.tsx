import { createFileRoute, redirect } from "@tanstack/react-router";

// Retired — merged into Look Studio (library tab).
export const Route = createFileRoute("/admin/editorial-library")({
  beforeLoad: () => {
    throw redirect({ href: "/admin/look-studio?tab=library", replace: true });
  },
  component: () => null,
});
