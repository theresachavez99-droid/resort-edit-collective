import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listSourcedProducts,
  updateSourcedProductStatus,
} from "@/lib/firecrawl.functions";
import { promoteSourcedToVault } from "@/lib/vault.functions";

export const Route = createFileRoute("/admin/review-queue")({
  head: () => ({
    meta: [
      { title: "Review Queue — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReviewQueuePage,
});

const STORAGE_KEY = "admin_review_queue_pw";

type SourcedRow = {
  id: string;
  source_url: string;
  retailer_domain: string | null;
  brand: string | null;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  slot_category: string | null;
  status: string;
  notes: string | null;
  scraped_at: string | null;
  created_at: string;
  look: number | null;
};

const CATEGORY_OPTIONS = [
  "swimwear", "coverup", "dress", "sandals", "bag",
  "sunglasses", "earrings", "necklace", "bracelet", "ring", "hair",
];

function ReviewQueuePage() {
  const verify = useServerFn(verifyAdmin);
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      setPw(stored);
      verify({ data: { password: stored } })
        .then((r) => { if (r.ok) setAuthed(true); else window.localStorage.removeItem(STORAGE_KEY); })
        .catch(() => window.localStorage.removeItem(STORAGE_KEY));
    }
  }, [verify]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const r = await verify({ data: { password: pw } });
      if (r.ok) { window.localStorage.setItem(STORAGE_KEY, pw); setAuthed(true); }
      else setAuthError("Wrong password");
    } catch { setAuthError("Auth error"); }
  };

  if (!authed) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="font-serif text-2xl mb-4">Review Queue — Admin</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            placeholder="Admin password" className="w-full border px-3 py-2 rounded" />
          <button type="submit" className="w-full bg-black text-white py-2 rounded">Enter</button>
          {authError && <p className="text-sm text-red-600">{authError}</p>}
        </form>
      </main>
    );
  }

  return <ReviewQueueInner password={pw} />;
}

function ReviewQueueInner({ password }: { password: string }) {
  const listFn = useServerFn(listSourcedProducts);
  const promoteFn = useServerFn(promoteSourcedToVault);
  const updateStatusFn = useServerFn(updateSourcedProductStatus);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "all" | "rejected" | "promoted">("pending");

  const query = useQuery({
    queryKey: ["review-queue"],
    queryFn: () => listFn({ data: { password } }),
  });

  const promote = useMutation({
    mutationFn: (vars: { sourced_id: string; category: string }) =>
      promoteFn({ data: { password, sourced_id: vars.sourced_id, overrides: { category: vars.category } } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["review-queue"] }),
  });

  const reject = useMutation({
    mutationFn: (id: string) =>
      updateStatusFn({ data: { password, id, status: "rejected" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["review-queue"] }),
  });

  const rows: SourcedRow[] = (query.data?.ok ? query.data.rows : []) as SourcedRow[];
  const visible = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "scraped" || r.status === "queued";
    return r.status === filter;
  });

  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl">Review Queue</h1>
        <p className="text-sm text-muted-foreground">
          Sourced products awaiting human review. Approve to promote into the Product Vault,
          or reject. Only approved products may be used by the Look Builder.
        </p>
      </header>

      <section className="flex flex-wrap gap-2 text-sm">
        {(["pending", "rejected", "promoted", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded border ${filter === f ? "bg-black text-white" : "bg-white"}`}>
            {f} {f === "pending"
              ? ((counts.scraped ?? 0) + (counts.queued ?? 0))
              : (counts[f] ?? (f === "all" ? rows.length : 0))}
          </button>
        ))}
        <button onClick={() => query.refetch()} className="ml-auto px-3 py-1 rounded border">
          Refresh
        </button>
      </section>

      {query.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {query.data && !query.data.ok && (
        <p className="text-sm text-red-600">Failed to load: {query.data.error}</p>
      )}

      <ul className="space-y-3">
        {visible.map((r) => (
          <ReviewCard
            key={r.id}
            row={r}
            onApprove={(category) => promote.mutate({ sourced_id: r.id, category })}
            onReject={() => reject.mutate(r.id)}
            isApproving={promote.isPending && promote.variables?.sourced_id === r.id}
            isRejecting={reject.isPending && reject.variables === r.id}
          />
        ))}
        {visible.length === 0 && !query.isLoading && (
          <li className="text-sm text-muted-foreground border rounded p-6 text-center">
            No products in this view.
          </li>
        )}
      </ul>

      {(promote.error || reject.error) && (
        <p className="text-sm text-red-600">
          Action failed: {String(promote.error ?? reject.error)}
        </p>
      )}
    </main>
  );
}

function ReviewCard({
  row, onApprove, onReject, isApproving, isRejecting,
}: {
  row: SourcedRow;
  onApprove: (category: string) => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const initialCategory = row.slot_category && CATEGORY_OPTIONS.includes(row.slot_category)
    ? row.slot_category
    : "swimwear";
  const [category, setCategory] = useState<string>(initialCategory);
  const dnaMatch = row.notes?.match(/DNA:\s*([^\s|]+)/);
  const dna = dnaMatch?.[1] ?? null;
  const blocked = row.notes?.includes("SCRAPE_BLOCKED");
  const pending = row.status === "scraped" || row.status === "queued";

  return (
    <li className="border rounded-lg p-4 flex gap-4">
      <div className="w-32 h-32 shrink-0 bg-muted rounded overflow-hidden flex items-center justify-center">
        {row.image_url ? (
          <img src={row.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-xs text-muted-foreground">no image</span>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-medium">{row.brand ?? "—"}</span>
          <span className="text-xs text-muted-foreground">· {row.retailer_domain ?? "—"}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            row.status === "scraped" ? "bg-blue-100" :
            row.status === "promoted" ? "bg-green-100" :
            row.status === "rejected" ? "bg-red-100" : "bg-gray-100"
          }`}>{row.status}</span>
          {dna && <span className="text-xs bg-amber-100 px-2 py-0.5 rounded">DNA: {dna}</span>}
          {blocked && <span className="text-xs bg-red-100 px-2 py-0.5 rounded">scrape blocked</span>}
        </div>
        <div className="text-sm line-clamp-2">{row.product_name ?? <em className="text-muted-foreground">no title</em>}</div>
        <div className="text-sm tabular-nums">
          {row.price != null ? `${row.currency ?? "USD"} ${row.price}` : <span className="text-muted-foreground">no price</span>}
        </div>
        <a href={row.source_url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-600 break-all block">{row.source_url}</a>
        {row.notes && <div className="text-xs text-muted-foreground line-clamp-2">{row.notes}</div>}

        {pending && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <label className="text-xs">
              Category:&nbsp;
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="border rounded px-2 py-1 text-sm">
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <button onClick={() => onApprove(category)} disabled={isApproving || isRejecting}
              className="bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50">
              {isApproving ? "Approving…" : "Approve → Vault"}
            </button>
            <button onClick={onReject} disabled={isApproving || isRejecting}
              className="bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50">
              {isRejecting ? "Rejecting…" : "Reject"}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}