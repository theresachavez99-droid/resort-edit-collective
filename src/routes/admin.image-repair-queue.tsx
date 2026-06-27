import { createFileRoute, redirect } from "@tanstack/react-router";

// Retired — issue badges now surface inside Editorial Review.
export const Route = createFileRoute("/admin/image-repair-queue")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/editorial-review-queue", replace: true });
  },
  component: () => null,
});
