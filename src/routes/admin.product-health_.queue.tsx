import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listReplacementQueue,
  generateQueueReplacements,
} from "@/lib/replacement-queue.functions";
import {
  QUEUE_STATES,
  QUEUE_STATE_LABELS,
  queueCta,
  queueStateLabel,
  type QueueItem,
  type QueueState,
} from "@/lib/replacement-queue";
import { PRODUCT_STATUS_LABELS, type ProductStatus } from "@/lib/product-health";

/**
 * /admin/product-health/queue — the replacement desk.
 *
 * Every slot whose public product failed and what it is waiting on. Internal
 * only: public pages continue to show a validated product, an approved
 * validated backup, or the non-clickable "Replacement in review" state.
 */
export const Route = createFileRoute("/admin/product-health_/queue")({
  validateSearch: (search: Record<string, unknown>) => ({
    runId: typeof search.runId === "string" ? search.runId : undefined,
    state: QUEUE_STATES.includes(search.state as QueueState)
      ? (search.state as QueueState)
      : undefined,
    destination: typeof search.destination === "string" ? search.destination : undefined,
    moment: typeof search.moment === "string" ? search.moment : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Replacement Queue — Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QueuePage,
});

const STORAGE_KEY = "admin_dashboard_pw";

function fmt(ts: string | null): string {
  return ts ? new Date(ts).toLocaleString() : "—";
}

function stateTone(state: QueueState): string {
  if (state === "candidates_ready" || state === "awaiting_approval") return "text-emerald-700";
  if (state === "needs_manual_verification") return "text-amber-700";
  if (state === "backup_promoted" || state === "resolved") return "text-stone-500";
  return "text-red-700";
}

function QueuePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const listFn = useServerFn(listReplacementQueue);
  const generateFn = useServerFn(generateQueueReplacements);
  const qc = useQueryClient();
  const [pw, setPw] = useState("");

  useEffect(() => {
    const c = sessionStorage.getItem(STORAGE_KEY);
    if (c) setPw(c);
  }, []);

  const queue = useQuery({
    queryKey: ["replacement-queue", pw, search.runId, search.state, search.destination, search.moment],
    enabled: !!pw,
    queryFn: () =>
      listFn({
        data: {
          password: pw,
          ...(search.runId ? { runId: search.runId } : {}),
          ...(search.state ? { state: search.state } : {}),
          ...(search.destination ? { destination: search.destination } : {}),
          ...(search.moment ? { moment: search.moment } : {}),
        },
      }),
  });

  const generate = useMutation({
    mutationFn: (slotProductId: string) => generateFn({ data: { password: pw, slotProductId } }),
    onSuccess: (res) => {
      toast.success(`${res.candidates} replacements generated — awaiting your approval`);
      qc.invalidateQueries({ queryKey: ["replacement-queue"] });
      qc.invalidateQueries({ queryKey: ["queue-badge"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not generate replacements"),
  });

  if (!pw) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-serif text-2xl mb-4">Replacement Queue</h1>
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

  const items = (queue.data?.items ?? []) as QueueItem[];
  const summary = queue.data?.summary;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Replacement Queue</h1>
          <p className="text-sm text-stone-600 mt-1">
            Internal triage for failed product links. Nothing here publishes automatically.
          </p>
        </div>
        <div className="flex gap-4 text-xs uppercase tracking-[0.2em]">
          <Link to="/admin/product-health" className="underline">
            Product Health →
          </Link>
          <Link to="/admin/product-audit" className="underline">
            Product Audit →
          </Link>
        </div>
      </div>

      {search.runId && (
        <p className="mt-4 text-xs text-stone-600 border border-stone-200 px-4 py-2 inline-block">
          Filtered to audit run {search.runId.slice(0, 8)} ·{" "}
          <button
            type="button"
            className="underline"
            onClick={() => navigate({ search: (p: typeof search) => ({ ...p, runId: undefined }) })}
          >
            show whole queue
          </button>
        </p>
      )}

      {/* Summary counters */}
      <section className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ["Needs styling", summary?.needs_styling ?? 0],
          ["Generating", summary?.generating ?? 0],
          ["Ready to review", summary?.ready_to_review ?? 0],
          ["Needs verification", summary?.needs_verification ?? 0],
          ["Approved today", summary?.approved_today ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-stone-200 p-4">
            <div className="text-2xl font-serif">{String(value)}</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-stone-500 mt-1">
              {label}
            </div>
          </div>
        ))}
      </section>

      {/* State filter */}
      <section className="mt-6 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => navigate({ search: (p: typeof search) => ({ ...p, state: undefined }) })}
          className={`border px-3 py-1 ${!search.state ? "border-stone-900" : "border-stone-300"}`}
        >
          All
        </button>
        {QUEUE_STATES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => navigate({ search: (p: typeof search) => ({ ...p, state: s }) })}
            className={`border px-3 py-1 ${search.state === s ? "border-stone-900" : "border-stone-300"}`}
          >
            {QUEUE_STATE_LABELS[s]}
          </button>
        ))}
      </section>

      {/* Queue */}
      <section className="mt-6 border border-stone-200">
        <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 px-5 py-3 border-b border-stone-200">
          {items.length} items
        </h2>
        <ul className="divide-y divide-stone-100">
          {items.map((item) => {
            const cta = queueCta(item.state, item.candidateCount || 3);
            return (
              <li key={item.key} className="px-5 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-stone-500">
                      {item.destination} · {item.moment} · {item.route}
                    </div>
                    <div className="font-serif text-lg">
                      {item.lookTitle ?? item.lookKey}
                    </div>
                    <div className="text-xs text-stone-500">
                      {item.lookKey} · slot: {item.slotLabel ?? item.slot}
                      {item.isAccessory ? " (accessory)" : " (hero garment)"}
                    </div>
                  </div>
                  <span className={`text-xs ${stateTone(item.state)}`}>
                    {queueStateLabel(item.state, item.candidateCount || 3)}
                  </span>
                </div>

                <div className="mt-3 text-sm">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-stone-500">
                    Failed product
                  </span>
                  <div>
                    {item.failedBrand} — {item.failedProduct}
                    {item.failedRetailer ? ` · ${item.failedRetailer}` : ""}
                  </div>
                  <div className="text-xs text-stone-500 break-all">{item.failedUrl ?? "—"}</div>
                  <div className="text-xs text-red-700 mt-1">
                    {PRODUCT_STATUS_LABELS[item.failureStatus as ProductStatus] ??
                      item.failureStatus}
                    {item.failureVerdict ? ` · ${item.failureVerdict}` : ""}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone-600">
                  <span>Entered queue: {fmt(item.enteredQueueAt)}</span>
                  <span>
                    Approved backup: {item.hasApprovedBackup ? "yes" : "none"}
                  </span>
                  <span>
                    ChatGPT candidates: {item.candidateCount} ({item.verifiedCandidateCount}{" "}
                    verified)
                  </span>
                </div>

                <div className="mt-4">
                  {cta.action === "generate" && (
                    <button
                      type="button"
                      disabled={generate.isPending}
                      onClick={() => generate.mutate(item.slotProductId)}
                      className="bg-stone-900 text-white px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                      {generate.isPending && generate.variables === item.slotProductId
                        ? "Generating…"
                        : cta.label}
                    </button>
                  )}
                  {cta.action === "none" && (
                    <button
                      type="button"
                      disabled
                      className="border border-stone-300 text-stone-400 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                    >
                      {cta.label}
                    </button>
                  )}
                  {(cta.action === "review" ||
                    cta.action === "verify" ||
                    cta.action === "view_backup") && (
                    <Link
                      to="/admin/product-health"
                      search={{ lookKey: item.lookKey } as never}
                      className="border border-stone-900 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                    >
                      {cta.label}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
          {items.length === 0 && (
            <li className="px-5 py-8 text-sm text-stone-500">
              {queue.isLoading ? "Loading queue…" : "Nothing waiting — every slot is resolved."}
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
