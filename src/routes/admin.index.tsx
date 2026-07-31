import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import { getAdminMetrics } from "@/lib/admin-metrics.functions";

/**
 * Founder dashboard at /admin — the permanent editorial home.
 *
 * Workflow:  Look Studio → Review Queue → Publish.
 * Backend routes/functions are unchanged; this page just curates IA.
 */
export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Studio — Resort Edit" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type NavItem = {
  label: string;
  to: string;
  description: string;
};

const WORKFLOW: NavItem[] = [
  {
    label: "Moment Runs",
    to: "/admin/moments",
    description:
      "The consolidated editorial workspace — one engine per (destination, moment) with the 5-stage Run Contract (Compile · Feed · Rank · Curate · Publish). Replaces the legacy Buying Office surface.",
  },
  {
    label: "Looks",
    to: "/admin/looks",
    description:
      "Author the hero look per moment — editorial DNA, accessory rules, palette. Publishing fans out to references + brands automatically.",
  },
];

const EDITORIAL_LIBRARY: NavItem[] = [
  {
    label: "Destination Moments",
    to: "/admin/destination-moments",
    description: "Moments, archetypes, and every editorial Collection in one place.",
  },
  {
    label: "Day Images",
    to: "/admin/day-images",
    description: "Canonical hero imagery for every moment.",
  },
  {
    label: "Product Vault",
    to: "/admin/product-vault",
    description: "The single inventory surface — every product, sourced and approved.",
  },
  {
    label: "Brands",
    to: "/admin/brands",
    description: "Approved brands plus the Performance tab — affinity, approvals, publications.",
  },
  {
    label: "Editorial Memory",
    to: "/admin/editorial-memory",
    description:
      "Every product ever published. Track brand concentration, mark Signature Pieces, and keep destinations feeling curated.",
  },
];

const OPERATIONS: NavItem[] = [
  {
    label: "Inventory Health",
    to: "/admin/inventory-health",
    description: "Sold-out items, broken links, missing thumbnails.",
  },
  {
    label: "System",
    to: "/admin/system",
    description:
      "Seeds, migration utilities, and list management — including Subscribers.",
  },
];

const STORAGE_KEY = "admin_dashboard_pw";

function AdminDashboard() {
  const verify = useServerFn(verifyAdmin);
  const metricsFn = useServerFn(getAdminMetrics);

  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const c = sessionStorage.getItem(STORAGE_KEY);
    if (c) setPw(c);
  }, []);

  const auth = useMutation({
    mutationFn: () => {
      if (!pw) throw new Error("Password required");
      return verify({ data: { password: pw } });
    },
    onSuccess: () => {
      sessionStorage.setItem(STORAGE_KEY, pw);
      setAuthed(true);
    },
  });

  const metrics = useQuery({
    queryKey: ["admin-metrics"],
    enabled: authed,
    queryFn: () => metricsFn({ data: { password: pw } }),
  });

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 mb-2">
          Founder · Internal Only
        </p>
        <h1 className="font-serif text-3xl mb-6">Resort Edit</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Admin password"
          className="w-full border border-stone-300 px-3 py-2 mb-3"
          onKeyDown={(e) => {
            if (e.key === "Enter") auth.mutate();
          }}
        />
        <button
          onClick={() => auth.mutate()}
          disabled={!pw}
          className="bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
        >
          Enter
        </button>
        {auth.error && (
          <p className="text-red-600 text-xs mt-3">{(auth.error as Error).message}</p>
        )}
      </main>
    );
  }

  const m = metrics.data?.metrics;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Studio
          </p>
          <h1 className="font-serif text-3xl">Resort Edit</h1>
        </div>
      <p className="text-xs text-stone-500 italic max-w-xs text-right hidden sm:block">
          Moment Runs → Looks → Publish
        </p>
      </header>

      {/* Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Metric label="Draft" value={m?.looksDraft} />
        <Metric label="Awaiting Review" value={m?.looksAwaiting} />
        <Metric label="Approved" value={m?.looksApproved} />
        <Metric label="Published" value={m?.looksPublished} accent="emerald" />
        <Metric label="Studio Looks" value={m?.candidatesTotal} />
        <Metric label="Products" value={m?.productsLibrary} />
        <Metric label="Inventory Issues" value={m?.inventoryIssues} accent="amber" />
      </section>

      {/* Quick actions */}
      <section className="flex flex-wrap gap-2">
        <QuickAction to="/admin/moments" label="Open Moment Runs" />
        <QuickAction to="/admin/looks" label="Looks" />
        <QuickAction to="/admin/destination-moments" label="Destination Moments" />
      </section>

      {/* Workflow */}
      <section className="space-y-4">
        <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-2">
          Workflow
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group block border border-ink bg-ink text-ivory p-6 hover:bg-ink/90 transition min-h-[140px]"
            >
              <div className="text-sm tracking-[0.2em] uppercase">{item.label}</div>
              <div className="text-xs text-ivory/75 mt-3 leading-relaxed">
                {item.description}
              </div>
              <div className="text-[0.65rem] tracking-[0.3em] uppercase text-ivory/60 mt-4 group-hover:text-ivory">
                Open →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Library */}
      <section className="space-y-4">
        <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-2">
          Editorial Library
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {EDITORIAL_LIBRARY.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block border border-stone-300 p-4 hover:border-stone-500 transition"
            >
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-stone-500 mt-1 leading-relaxed">
                {item.description}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Operations */}
      <section className="space-y-3">
        <button
          onClick={() => setAdvancedOpen((v) => !v)}
          className="w-full flex items-center justify-between text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-2 hover:text-ink"
        >
          <span>Operations</span>
          <span>{advancedOpen ? "−" : "+"}</span>
        </button>
        {advancedOpen && (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {OPERATIONS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block border border-stone-200 p-3 hover:border-stone-400 transition text-stone-700"
                >
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {item.description}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | undefined;
  accent?: "emerald" | "amber";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-700"
      : accent === "amber"
        ? "text-amber-700"
        : "text-ink";
  return (
    <div className="border border-stone-200 p-3">
      <div className="text-[0.6rem] tracking-[0.24em] uppercase text-stone-500">
        {label}
      </div>
      <div className={`text-2xl font-light mt-1 ${color}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="border border-stone-300 px-3 py-2 text-[0.65rem] tracking-[0.24em] uppercase hover:bg-ink hover:text-ivory transition"
    >
      {label}
    </Link>
  );
}
