import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import { listEditorialCollections } from "@/lib/editorial-review.functions";

export const Route = createFileRoute("/admin/collections")({
  head: () => ({
    meta: [
      { title: "Editorial Collections — Founder Review (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CollectionsPage,
});

const STORAGE_KEY = "admin_yacht_pilot_pw";
const STATUSES = ["all", "draft", "in_review", "approved", "rejected"] as const;
type StatusFilter = (typeof STATUSES)[number];

function CollectionsPage() {
  const verify = useServerFn(verifyAdmin);
  const list = useServerFn(listEditorialCollections);

  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) return;
    setPw(stored);
    verify({ data: { password: stored } })
      .then((r) => {
        if (r.ok) setAuthed(true);
        else window.localStorage.removeItem(STORAGE_KEY);
      })
      .catch(() => window.localStorage.removeItem(STORAGE_KEY));
  }, [verify]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const r = await verify({ data: { password: pw } });
      if (r.ok) {
        window.localStorage.setItem(STORAGE_KEY, pw);
        setAuthed(true);
      } else setAuthError("Wrong password");
    } catch {
      setAuthError("Auth error");
    }
  };

  const query = useQuery({
    queryKey: ["editorial_collections", statusFilter, authed],
    enabled: authed,
    queryFn: () =>
      list({
        data: {
          password: pw,
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 100,
        },
      }),
  });

  if (!authed) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-4">Editorial Collections — Admin</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder="Admin password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">
            Enter
          </button>
          {authError && <p className="text-red-600 text-sm">{authError}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8 space-y-6">
      <header className="space-y-2">
        <p className="uppercase tracking-widest text-xs text-stone-500">
          Founder Review · Internal Only
        </p>
        <h1 className="text-3xl font-serif">Editorial Collections</h1>
        <p className="text-stone-600 max-w-2xl text-sm">
          Internal review queue for stylist-engine output. Approving a collection here marks
          it as approved for the founder; it does not publish to any public route.
        </p>
        <div className="flex gap-3 text-xs uppercase tracking-widest pt-2">
          <a href="/admin" className="underline">
            ← Admin Hub
          </a>
          <a href="/admin/editorial-review-queue" className="underline">
            Review Queue →
          </a>
          <a href="/admin/inventory-health" className="underline">
            Inventory Health →
          </a>
        </div>
      </header>

      <nav className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded border text-sm ${
              statusFilter === s ? "bg-black text-white border-black" : "bg-white"
            }`}
          >
            {s}
          </button>
        ))}
      </nav>

      {query.isLoading && <p className="text-stone-500">Loading…</p>}
      {query.error && (
        <p className="text-red-600 text-sm">{String((query.error as Error).message)}</p>
      )}
      {query.data?.ok && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Destination</th>
              <th className="py-2 pr-3">Activity</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Looks</th>
              <th className="py-2 pr-3">Created</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {query.data.collections.map((c) => (
              <tr key={c.id} className="border-b align-top">
                <td className="py-2 pr-3">{c.destination}</td>
                <td className="py-2 pr-3">{c.activity}</td>
                <td className="py-2 pr-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="py-2 pr-3">
                  {c.lookCounts.total} ({c.lookCounts.approved}✓ / {c.lookCounts.rejected}✗)
                </td>
                <td className="py-2 pr-3 text-stone-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <Link
                    to="/admin/collections/$id"
                    params={{ id: c.id }}
                    className="text-blue-600 underline"
                  >
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
            {query.data.collections.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-stone-500">
                  No collections in this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
        ? "bg-red-100 text-red-800"
        : status === "in_review"
          ? "bg-amber-100 text-amber-900"
          : "bg-stone-100 text-stone-700";
  return <span className={`inline-block rounded px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
}