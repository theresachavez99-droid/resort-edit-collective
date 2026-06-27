import { createFileRoute, redirect } from "@tanstack/react-router";

// Retired — merged into Product Vault.
export const Route = createFileRoute("/admin/product-library")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/product-vault", replace: true });
  },
  component: () => null,
});
