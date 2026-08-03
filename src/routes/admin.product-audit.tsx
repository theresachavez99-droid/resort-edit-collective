import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  runSiteAudit,
  getProductIndex,
  listAuditRuns,
  listAuditEvents,
} from "@/lib/product-audit.functions";
import { auditSummaryLine } from "@/components/QueueStatusPanel";
import { PRODUCT_STATUS_LABELS, isFailedStatus, type ProductStatus } from "@/lib/product-health";

/**
 * /admin/product-audit — sitewide link-integrity desk.
 *
 * Every customer-facing product URL, where it is used, its live verdict, and the
 * automated actions taken. Nothing publishes from here: only approved backups
 * that pass independent validation are promoted, and pending AI candidates are
 * approved on the Product Health screen.
 */
export const Route = createFileRoute("/admin/product-audit")({
  head: () => ({
    meta: [
      { title: "Product Audit — Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProductAuditPage,
});

const STORAGE_KEY = "admin_dashboard_pw";

type Usage = {
  route: string;
  destination: string;
  moment: string;
  lookKey: string;
  lookTitle: string | null;
  slot: string;
  isPrimary: boolean;
  replacementPriority: number;
  source: string;
};

function fmt(ts: string | null): string {
  return ts ? new Date(ts).toLocaleString() : "—";
}

function tone(status: string): string {
  if (status === "active") return "text-emerald-700";
  if (status === "blocked_or_inconclusive" || status === "needs_review") return "text-amber-700";
  return "text-red-700";
}

function ProductAuditPage() {
  const navigate = Route.useNavigate();
  const auditFn = useServerFn(runSiteAudit);
  const indexFn = useServerFn(getProductIndex);
  const runsFn = useServerFn(listAuditRuns);
  const eventsFn = useServerFn(listAuditEvents);
  const qc = useQueryClient();

  const [pw, setPw] = useState("");
  const [destination, setDestination] = useState("");
  const [moment, setMoment] = useState("");
  const [lookKey, setLookKey] = useState("");
  const [retailer, setRetailer] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const c = sessionStorage.getItem(STORAGE_KEY);
    if (c) setPw(c);
  }, []);

  const index = useQuery({
    queryKey: ["product-index", pw],
    enabled: !!pw,
    queryFn: () => indexFn({ data: { password: pw } }),
  });
  const runs = useQuery({
    queryKey: ["audit-runs", pw],
    enabled: !!pw,
    queryFn: () => runsFn({ data: { password: pw } }),
  });
  const events = useQuery({
    queryKey: ["audit-events", pw],
    enabled: !!pw,
    queryFn: () => eventsFn({ data: { password: pw, limit: 100 } }),
  });

  const audit = useMutation({
    mutationFn: (scope: { destination?: string; moment?: string; lookKey?: string }) =>
      auditFn({ data: { password: pw, ...scope } }),
    onSuccess: (report) => {
      const line = auditSummaryLine({
        failed: report.failures.length,
        promoted: report.autoPromoted.length,
        needsReview: report.queuedForStyling.length + report.inReview.length,
      });
      toast.success(line, {
        duration: 12_000,
        action: {
          label: "Review replacements",
          onClick: () =>
            navigate({
              to: "/admin/product-health/queue",
              search: report.runId ? { runId: report.runId } : {},
            }),
        },
      });
      qc.invalidateQueries({ queryKey: ["product-index"] });
      qc.invalidateQueries({ queryKey: ["audit-runs"] });
      qc.invalidateQueries({ queryKey: ["audit-events"] });
      qc.invalidateQueries({ queryKey: ["queue-badge"] });
      qc.invalidateQueries({ queryKey: ["latest-audit-summary"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Audit failed"),
  });

  const products = index.data?.products ?? [];
  const destinations = useMemo(
    () => [...new Set(products.flatMap((p) => p.usages.map((u) => u.destination)))].sort(),
    [products],
  );
  const moments = useMemo(
    () => [...new Set(products.flatMap((p) => p.usages.map((u) => u.moment)))].sort(),
    [products],
  );
  const retailers = useMemo(
    () => [...new Set(products.map((p) => p.retailer).filter((r): r is string => !!r))].sort(),
    [products],
  );

  const filtered = products.filter((p) => {
    if (status && p.status !== status) return false;
    if (retailer && p.retailer !== retailer) return false;
    const u = p.usages as Usage[];
    if (destination && !u.some((x) => x.destination === destination)) return false;
    if (moment && !u.some((x) => x.moment === moment)) return false;
    if (lookKey && !u.some((x) => x.lookKey.includes(lookKey))) return false;
    return true;
  });

  if (!pw) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-serif text-2xl mb-4">Product Audit</h1>
        <p className="text-sm text-stone-600 mb-4">
          Enter the Studio password (or unlock from the Studio dashboard).
        </p>
        <input
          type="password"
          placeholder="Admin password"
          className="w-full border border-stone-300 px-3 py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value;
              if (v) {
                sessionStorage.setItem(STORAGE_KEY, v);
                setPw(v);
              }
            }
          }}
        />
      </main>
    );
  }

  const report = audit.data ?? (runs.data?.runs?.[0]?.report as typeof audit.data | undefined);
  const counts = (report?.counts ?? index.data?.counts ?? {}) as Record<string, number>;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Product Audit</h1>
          <p className="text-sm text-stone-600 mt-1">
            Sitewide link integrity. Failed links are suppressed the moment they are detected.
          </p>
        </div>
        <Link to="/admin/product-health" className="text-xs uppercase tracking-[0.2em] underline">
          Product Health →
        </Link>
      </div>

      {/* Run controls */}
      <section className="mt-8 border border-stone-200 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500">Run audit</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={audit.isPending}
            onClick={() => audit.mutate({})}
            className="bg-stone-900 text-white px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
          >
            {audit.isPending ? "Auditing…" : "Run full-site audit"}
          </button>
          <button
            type="button"
            disabled={audit.isPending || (!destination && !moment && !lookKey)}
            onClick={() =>
              audit.mutate({
                ...(destination ? { destination } : {}),
                ...(moment ? { moment } : {}),
                ...(lookKey ? { lookKey } : {}),
              })
            }
            className="border border-stone-900 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-40"
          >
            Run for current filter
          </button>
          {audit.isError && (
            <span className="text-xs text-red-700">
              {audit.error instanceof Error ? audit.error.message : "Audit failed"}
            </span>
          )}
        </div>
      </section>

      {/* Totals */}
      <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Products indexed", index.data?.totals.products ?? 0],
          ["Unique URLs", index.data?.totals.uniqueUrls ?? 0],
          ["URLs audited", report?.urlsAudited ?? 0],
          ["Auto-promoted", report?.autoPromoted.length ?? 0],
          ["Awaiting styling", report?.queuedForStyling.length ?? 0],
          ["Replacement in review", report?.inReview.length ?? 0],
          ["Unsourced editorial slots", index.data?.totals.unsourced ?? 0],
          ["Inconclusive domains", report?.inconclusiveDomains.length ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-stone-200 p-4">
            <div className="text-2xl font-serif">{String(value)}</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-stone-500 mt-1">{label}</div>
          </div>
        ))}
      </section>

      <section className="mt-4 flex flex-wrap gap-3 text-sm">
        {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((s) => (
          <span key={s} className={`border border-stone-200 px-3 py-1 ${tone(s)}`}>
            {PRODUCT_STATUS_LABELS[s]}: {counts[s] ?? 0}
          </span>
        ))}
      </section>

      {/* Filters */}
      <section className="mt-8 flex flex-wrap gap-2">
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={moment}
          onChange={(e) => setMoment(e.target.value)}
          className="border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">All moments</option>
          {moments.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={retailer}
          onChange={(e) => setRetailer(e.target.value)}
          className="border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">All retailers</option>
          {retailers.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((s) => (
            <option key={s} value={s}>
              {PRODUCT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          value={lookKey}
          onChange={(e) => setLookKey(e.target.value)}
          placeholder="Look key contains…"
          className="border border-stone-300 px-3 py-2 text-sm"
        />
      </section>

      {/* Product index */}
      <section className="mt-6 border border-stone-200">
        <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 px-5 py-3 border-b border-stone-200">
          Products ({filtered.length})
        </h2>
        <ul className="divide-y divide-stone-100">
          {filtered.map((p) => (
            <li key={p.url} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-stone-500">{p.brand}</span>
                  <div className="font-serif">{p.productName}</div>
                </div>
                <span className={`text-xs ${tone(p.status)}`}>
                  {PRODUCT_STATUS_LABELS[p.status as ProductStatus] ?? p.status}
                </span>
              </div>
              <div className="text-xs text-stone-500 mt-1 break-all">
                {p.retailer ? `${p.retailer} · ` : ""}
                {p.url}
              </div>
              <ul className="mt-2 space-y-1">
                {(p.usages as Usage[]).map((u) => (
                  <li key={`${u.lookKey}-${u.slot}-${u.replacementPriority}`} className="text-xs text-stone-600">
                    {u.route} · {u.lookTitle ?? u.lookKey} · {u.slot} ·{" "}
                    {u.isPrimary ? "primary" : `backup #${u.replacementPriority}`} · {u.source}
                  </li>
                ))}
              </ul>
              {isFailedStatus(p.status) && (
                <p className="text-[11px] text-red-700 mt-2">
                  Suppressed publicly — not rendered as a link.
                </p>
              )}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-6 text-sm text-stone-500">No products match these filters.</li>
          )}
        </ul>
      </section>

      {/* Latest report detail */}
      {report && (
        <section className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="border border-stone-200 p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500">Auto-promoted backups</h3>
            <ul className="mt-3 space-y-2 text-xs text-stone-600">
              {report.autoPromoted.map((a) => (
                <li key={`${a.lookKey}-${a.slot}`}>
                  {a.route} · {a.slot} → {a.replacedWith.brand} {a.replacedWith.productName}
                </li>
              ))}
              {report.autoPromoted.length === 0 && <li>None.</li>}
            </ul>
          </div>
          <div className="border border-stone-200 p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500">Replacement in review</h3>
            <ul className="mt-3 space-y-2 text-xs text-stone-600">
              {report.inReview.map((r) => (
                <li key={`${r.lookKey}-${r.slot}`}>
                  {r.route} · {r.slot} — {r.reason}
                </li>
              ))}
              {report.inReview.length === 0 && <li>None.</li>}
            </ul>
          </div>
          <div className="border border-stone-200 p-5">
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500">Styling queue</h3>
            <ul className="mt-3 space-y-2 text-xs text-stone-600">
              {report.queuedForStyling.map((q) => (
                <li key={`${q.lookKey}-${q.slot}`}>
                  {q.route} · {q.slot} — {q.candidates} candidates pending approval
                </li>
              ))}
              {report.queuedForStyling.length === 0 && <li>None.</li>}
              {report.stylingQueueErrors.map((e) => (
                <li key={e} className="text-amber-700">
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {report && report.routesAffected.length > 0 && (
        <section className="mt-6 border border-stone-200 p-5">
          <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500">Routes most affected</h3>
          <ul className="mt-3 text-xs text-stone-600 space-y-1">
            {report.routesAffected.map((r) => (
              <li key={r.route}>
                {r.route} — {r.failures} failing links
              </li>
            ))}
          </ul>
          {report.inconclusiveDomains.length > 0 && (
            <p className="text-xs text-amber-700 mt-3">
              Could not conclusively check: {report.inconclusiveDomains.join(", ")}
            </p>
          )}
        </section>
      )}

      {/* Audit log */}
      <section className="mt-8 border border-stone-200">
        <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 px-5 py-3 border-b border-stone-200">
          Audit log
        </h2>
        <ul className="divide-y divide-stone-100">
          {(events.data?.events ?? []).map((e) => (
            <li key={e.id} className="px-5 py-3 text-xs text-stone-600">
              <span className="text-stone-900">{e.event_type}</span> · {e.look_key} · {e.slot} ·{" "}
              {e.from_status ?? "—"} → {e.to_status ?? "—"} · {e.actor} · {fmt(e.created_at)}
            </li>
          ))}
          {(events.data?.events ?? []).length === 0 && (
            <li className="px-5 py-6 text-sm text-stone-500">No audit activity recorded yet.</li>
          )}
        </ul>
      </section>

      {/* Runs */}
      <section className="mt-8 border border-stone-200">
        <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 px-5 py-3 border-b border-stone-200">
          Recent runs
        </h2>
        <ul className="divide-y divide-stone-100">
          {(runs.data?.runs ?? []).map((r) => (
            <li key={r.id} className="px-5 py-3 text-xs text-stone-600">
              {r.scope}
              {r.destination ? ` · ${r.destination}` : ""}
              {r.moment ? `/${r.moment}` : ""} · {r.urls_audited} URLs · {r.auto_promoted} promoted ·{" "}
              {r.awaiting_styling} awaiting · {fmt(r.started_at)} → {fmt(r.finished_at)} · {r.triggered_by}
            </li>
          ))}
          {(runs.data?.runs ?? []).length === 0 && (
            <li className="px-5 py-6 text-sm text-stone-500">No runs yet.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
