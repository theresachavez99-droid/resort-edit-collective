import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  getBrandPerformance,
  recomputeBrandAffinitySignals,
} from "@/lib/brand-performance.functions";

export const Route = createFileRoute("/admin/brand-performance")({
  head: () => ({
    meta: [
      { title: "Brand Performance — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BrandPerformancePage,
});

const STORAGE_KEY = "admin_brand_perf_pw";

function BrandPerformancePage() {
  const verify = useServerFn(verifyAdmin);
  const getPerf = useServerFn(getBrandPerformance);
  const recompute = useServerFn(recomputeBrandAffinitySignals);
  const [pw, setPw] = useState<string>("");
  const [authed, setAuthed] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) setPw(cached);
  }, []);

  const auth = useMutation({
    mutationFn: () => verify({ data: { password: pw } }),
    onSuccess: () => {
      sessionStorage.setItem(STORAGE_KEY, pw);
      setAuthed(true);
    },
  });

  const perf = useQuery({
    queryKey: ["brand-performance"],
    enabled: authed,
    queryFn: () => getPerf({ data: { password: pw } }),
  });

  const recomputeMut = useMutation({
    mutationFn: () => recompute({ data: { password: pw } }),
    onSuccess: () => perf.refetch(),
  });

  if (!authed) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-light mb-4">Brand Performance</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Admin password"
          className="w-full border px-3 py-2 mb-3"
        />
        <button
          onClick={() => auth.mutate()}
          className="bg-black text-white px-4 py-2 text-sm tracking-widest uppercase"
        >
          Enter
        </button>
        {auth.error && (
          <p className="text-red-600 text-xs mt-2">{(auth.error as Error).message}</p>
        )}
      </div>
    );
  }

  const brands = perf.data?.brands ?? [];
  const filtered = brands.filter((b) =>
    filter ? b.name.toLowerCase().includes(filter.toLowerCase()) : true,
  );

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light tracking-wide">Brand Performance</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Editorial Affinity, Founder signals, and commerce metadata per brand.
            Internal only — not exposed to public routes.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter brand…"
            className="border px-3 py-2 text-sm"
          />
          <button
            onClick={() => recomputeMut.mutate()}
            disabled={recomputeMut.isPending}
            className="border border-black px-4 py-2 text-xs tracking-widest uppercase hover:bg-black hover:text-white"
          >
            {recomputeMut.isPending ? "Recomputing…" : "Recompute Founder Signals"}
          </button>
        </div>
      </div>

      {recomputeMut.data && (
        <div className="mb-6 border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm">
          Updated {recomputeMut.data.updatedBrands} brand
          {recomputeMut.data.updatedBrands === 1 ? "" : "s"}.{" "}
          {recomputeMut.data.adjustments.length} affinity adjustment
          {recomputeMut.data.adjustments.length === 1 ? "" : "s"} applied.
        </div>
      )}

      {perf.isLoading && <p className="text-sm text-neutral-500">Loading…</p>}
      {perf.error && (
        <p className="text-sm text-red-600">{(perf.error as Error).message}</p>
      )}

      <div className="overflow-x-auto border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2">Brand</th>
              <th className="px-3 py-2">Commerce</th>
              <th className="px-3 py-2">Top Affinity</th>
              <th className="px-3 py-2 text-right">Appearances</th>
              <th className="px-3 py-2 text-right">Approvals</th>
              <th className="px-3 py-2 text-right">Rejections</th>
              <th className="px-3 py-2 text-right">Published</th>
              <th className="px-3 py-2 text-right">Approval Rate</th>
              <th className="px-3 py-2 text-right">Avg Score</th>
              <th className="px-3 py-2">Legacy Tier</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-t align-top">
                <td className="px-3 py-2">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-neutral-500">
                    {b.activities.slice(0, 3).join(" · ") || "—"}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs">{b.commerceSource ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {b.topAffinity.length ? (
                      b.topAffinity.map(([ctx, score]) => (
                        <span
                          key={ctx}
                          className="border border-neutral-300 px-2 py-0.5 text-[11px]"
                          title={ctx}
                        >
                          {ctx.split(":").slice(-1)[0]}{" "}
                          <span className="font-semibold">{score}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400">No affinity yet</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {b.totals.appearances}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-700">
                  {b.totals.approvals}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-red-600">
                  {b.totals.rejections}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {b.totals.publications}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {b.totals.approvalRate === null
                    ? "—"
                    : `${Math.round(b.totals.approvalRate * 100)}%`}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {b.totals.avgEditorialScore === null
                    ? "—"
                    : b.totals.avgEditorialScore.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-xs text-neutral-500">{b.tier ?? "—"}</td>
              </tr>
            ))}
            {!filtered.length && !perf.isLoading && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-sm text-neutral-500">
                  No brands match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-neutral-500">
        Editorial Affinity is the primary brand-context signal used by the Stylist
        Engine. The legacy <code>tier</code> field is retained as backward-compatible
        metadata and only used as a fallback when no affinity data exists.
      </p>
    </div>
  );
}
