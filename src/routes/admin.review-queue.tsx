import { createFileRoute, Link, redirect } from "@tanstack/react-router";

/**
 * Resort Edit no longer moderates products one at a time. The admin
 * workflow is now the Look Studio — humans approve complete LOOKS, and
 * approved looks auto-promote their products into the Vault.
 *
 * This route now redirects to /admin/look-studio.
 */
export const Route = createFileRoute("/admin/review-queue")({
  head: () => ({
    meta: [
      { title: "Review Queue — Moved" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/admin/look-studio" });
  },
  component: ReviewQueueRedirect,
});

function ReviewQueueRedirect() {
  return (
    <main className="mx-auto max-w-xl p-10 text-center space-y-3">
      <h1 className="font-display text-2xl tracking-[0.14em] uppercase">Review Queue retired</h1>
      <p className="font-serif italic text-ink/70">
        The unit of approval is now the LOOK, not the product.
      </p>
      <Link to="/admin/look-studio" className="inline-block bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.24em] uppercase">
        Open Look Studio
      </Link>
    </main>
  );
}
