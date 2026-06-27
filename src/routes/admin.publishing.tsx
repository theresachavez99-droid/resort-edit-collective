import { createFileRoute, Link } from "@tanstack/react-router";

// Step 1 placeholder — full mission-control table lands in Step 2.
export const Route = createFileRoute("/admin/publishing")({
  head: () => ({
    meta: [
      { title: "Publishing — Resort Edit" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PublishingPage,
});

function PublishingPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 space-y-6">
      <header className="space-y-2">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
          Founder · Mission Control
        </p>
        <h1 className="font-serif text-3xl">Publishing</h1>
        <p className="text-stone-600 text-sm max-w-2xl">
          Every destination and editorial moment in one place. The full
          mission-control table — status, looks, banner, last updated,
          one-click actions — arrives in the next step of this rollout.
        </p>
      </header>
      <Link
        to="/admin"
        className="inline-block text-[0.65rem] tracking-[0.3em] uppercase underline"
      >
        ← Founder Dashboard
      </Link>
    </main>
  );
}
