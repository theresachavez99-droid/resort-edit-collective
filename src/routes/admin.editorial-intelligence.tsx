import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MomentRunsPanel } from "@/components/admin/MomentRunsPanel";
import { EditorialMemoryPanel } from "@/components/admin/EditorialMemoryPanel";
import { DestinationMomentsPanel } from "@/components/admin/DestinationMomentsPanel";
import { DayImagesPanel } from "@/components/admin/DayImagesPanel";

/**
 * /admin/editorial-intelligence — the consolidated editorial-knowledge surface.
 *
 * Absorbs the former standalone /admin/moments, /admin/editorial-memory,
 * /admin/destination-moments and /admin/day-images routes as tabs so the
 * router (and Lovable's path dropdown) carries one entry instead of four.
 */
export const Route = createFileRoute("/admin/editorial-intelligence")({
  head: () => ({
    meta: [
      { title: "Editorial Intelligence — Studio (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditorialIntelligencePage,
});

type Tab = "runs" | "memory" | "moments" | "images";

const TABS: Array<[Tab, string]> = [
  ["runs", "Moment Runs"],
  ["memory", "Editorial Memory"],
  ["moments", "Destination Moments"],
  ["images", "Day Images"],
];

function EditorialIntelligencePage() {
  const [tab, setTab] = useState<Tab>("runs");
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Studio
          </p>
          <h1 className="font-serif text-3xl">Editorial Intelligence</h1>
        </div>
        <Link to="/admin" className="text-sm text-stone-500 underline">
          ← Studio
        </Link>
      </header>

      <nav className="flex flex-wrap gap-6 border-b border-stone-200">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-[0.7rem] tracking-[0.24em] uppercase ${
              tab === key ? "border-b-2 border-ink text-ink" : "text-stone-500"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "runs" && <MomentRunsPanel />}
      {tab === "memory" && <EditorialMemoryPanel />}
      {tab === "moments" && <DestinationMomentsPanel />}
      {tab === "images" && <DayImagesPanel />}
    </main>
  );
}
