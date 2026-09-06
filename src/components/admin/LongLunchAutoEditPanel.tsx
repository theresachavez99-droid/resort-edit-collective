import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  clearLongLunchSimulations,
  getLongLunchAutoEditStatus,
  runLongLunchAutoEdit,
  simulateLongLunchSlot,
} from "@/lib/long-lunch-auto-edit.functions";

/**
 * Internal Long Lunch Auto-Edit status panel. Not customer-facing.
 * Gated by the same signed admin session cookie as the rest of the Studio.
 */
export function LongLunchAutoEditPanel() {
  const getStatus = useServerFn(getLongLunchAutoEditStatus);
  const runEval = useServerFn(runLongLunchAutoEdit);
  const simulate = useServerFn(simulateLongLunchSlot);
  const clearSims = useServerFn(clearLongLunchSimulations);

  const status = useQuery({
    queryKey: ["long-lunch-auto-edit"],
    queryFn: () => getStatus(),
  });

  const run = useMutation({
    mutationFn: (force: boolean) => runEval({ data: { force } }),
    onSuccess: () => status.refetch(),
  });
  const sim = useMutation({
    mutationFn: (id: string) =>
      simulate({ data: { slotProductId: id, simulatedStatus: "404", active: true } }),
    onSuccess: () => status.refetch(),
  });
  const unsim = useMutation({
    mutationFn: () => clearSims(),
    onSuccess: () => status.refetch(),
  });

  const d = status.data;
  const active = d?.active ?? null;

  return (
    <section className="border border-stone-200 bg-white p-5 space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Long Lunch Auto-Edit
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            The styling engine decides the outfit. A look is only published when every required
            piece is live and the whole outfit clears the coherence bar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => run.mutate(false)}
            disabled={run.isPending}
            className="bg-black text-white px-3 py-2 text-[0.65rem] tracking-[0.2em] uppercase disabled:opacity-50"
          >
            {run.isPending ? "Evaluating…" : "Run styling evaluation"}
          </button>
          <button
            onClick={() => run.mutate(true)}
            disabled={run.isPending}
            className="border border-stone-300 px-3 py-2 text-[0.65rem] tracking-[0.2em] uppercase disabled:opacity-50"
          >
            Force restyle
          </button>
        </div>
      </header>

      {status.isLoading && <p className="text-sm text-stone-500">Loading…</p>}

      {d && (
        <>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat
              label="Public state"
              value={active ? "Published" : "Hidden (incomplete)"}
              tone={active ? "ok" : "warn"}
            />
            <Stat label="Styling score" value={active ? `${active.styling_score}/100` : "—"} />
            <Stat
              label="Last evaluated"
              value={active ? new Date(active.evaluated_at).toLocaleString() : "—"}
            />
            <Stat
              label="Fashion director"
              value={d.aiConfigured ? "AI + rules" : "Rules only (no AI key)"}
              tone={d.aiConfigured ? "ok" : "warn"}
            />
          </dl>

          {active?.rationale && (
            <p className="text-sm italic text-stone-700 border-l-2 border-stone-300 pl-3">
              {active.rationale}
            </p>
          )}

          <div>
            <h3 className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500 mb-2">
              Declared slots &amp; health
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {d.slots.map((s) => (
                  <tr key={s.id} className="border-t border-stone-100">
                    <td className="py-2 pr-3 text-stone-500 whitespace-nowrap">
                      {s.slot ?? s.rawSlot}
                    </td>
                    <td className="py-2 pr-3">
                      <span className="text-stone-500">{s.brand}</span> {s.productName}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span className={s.eligible ? "text-emerald-700" : "text-red-700"}>
                        {s.status}
                        {s.simulated ? " (simulated)" : ""}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {!s.simulated && (
                        <button
                          onClick={() => sim.mutate(s.id)}
                          className="text-[0.6rem] tracking-[0.2em] uppercase text-stone-500 underline"
                        >
                          Simulate unavailable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {d.slots.some((s) => s.simulated) && (
              <button
                onClick={() => unsim.mutate()}
                className="mt-2 text-[0.6rem] tracking-[0.2em] uppercase text-stone-500 underline"
              >
                Clear all simulations
              </button>
            )}
            {d.requiredSlots.length > 0 && (
              <p className="text-xs text-stone-500 mt-2">
                Required: {d.requiredSlots.join(" · ")} — rings are never merchandised.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500 mb-2">
              Replacement history
            </h3>
            <ul className="space-y-2 text-sm">
              {d.history.length === 0 && (
                <li className="text-stone-500">No evaluation has run yet.</li>
              )}
              {d.history.map((h) => (
                <li key={h.id} className="border-t border-stone-100 pt-2">
                  <span className="text-stone-500">v{h.version}</span> · {h.change_kind} ·{" "}
                  {h.completeness_ok ? "complete" : "incomplete"} · {h.styling_score ?? "—"}/100 ·{" "}
                  {h.engine}
                  {h.replacement_reason && (
                    <span className="block text-stone-500">{h.replacement_reason}</span>
                  )}
                  {h.requires_review && (
                    <span className="block text-amber-700">Needs founder review</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {!d.feedAdapterConnected && (
            <p className="text-xs text-stone-500">
              No live affiliate feed is connected. Candidates come from existing product records
              only; the feed adapter interface is ready for real credentials.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div>
      <dt className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-400">{label}</dt>
      <dd
        className={
          tone === "warn"
            ? "text-amber-700"
            : tone === "ok"
              ? "text-emerald-700"
              : "text-stone-800"
        }
      >
        {value}
      </dd>
    </div>
  );
}
