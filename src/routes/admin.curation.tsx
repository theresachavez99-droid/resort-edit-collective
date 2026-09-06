import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  approveLongLunchLook,
  getLongLunchCurationDesk,
  proposeLongLunchCandidate,
  rejectLongLunchLook,
} from "@/lib/long-lunch-auto-edit.functions";

/**
 * /admin/curation — the founder's curation desk.
 *
 * Software proposes a COMPLETE candidate look from real product records; the
 * founder approves or rejects it. Nothing publishes automatically, and a look
 * with an unverified slot cannot be approved at all.
 */
export const Route = createFileRoute("/admin/curation")({
  head: () => ({
    meta: [
      { title: "Curation Desk — Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CurationDeskPage,
});

const VERIFICATION_LABEL: Record<string, string> = {
  verified: "Verified",
  needs_verification: "Needs verification",
  failed: "Failed",
};

function CurationDeskPage() {
  const load = useServerFn(getLongLunchCurationDesk);
  const propose = useServerFn(proposeLongLunchCandidate);
  const approve = useServerFn(approveLongLunchLook);
  const reject = useServerFn(rejectLongLunchLook);

  const desk = useQuery({ queryKey: ["long-lunch-curation"], queryFn: () => load() });

  const generate = useMutation({
    mutationFn: () => propose(),
    onSuccess: () => desk.refetch(),
  });
  const doApprove = useMutation({
    mutationFn: (versionId: string) => approve({ data: { versionId } }),
    onSuccess: () => desk.refetch(),
  });
  const doReject = useMutation({
    mutationFn: (versionId: string) => reject({ data: { versionId } }),
    onSuccess: () => desk.refetch(),
  });

  const d = desk.data;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">Studio</p>
        <h1 className="text-2xl font-light">Curation Desk — Portofino, The Long Lunch</h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          Generate a candidate look from real product records, then approve it. A candidate is
          only publishable when every required slot has a live, verified product link. Nothing
          here goes live without your approval.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="bg-black text-white px-4 py-2 text-[0.65rem] tracking-[0.2em] uppercase disabled:opacity-50"
        >
          {generate.isPending ? "Generating…" : "Generate candidate look"}
        </button>
      </div>

      {generate.data && (
        <p className="text-sm text-stone-700 border-l-2 border-stone-300 pl-3">
          {generate.data.complete
            ? `Candidate created · score ${generate.data.score ?? "—"}/100`
            : `Blocked — missing ${generate.data.missing.join(", ") || "products"}`}
          {generate.data.rationale ? ` · ${generate.data.rationale}` : ""}
        </p>
      )}

      {desk.isLoading && <p className="text-sm text-stone-500">Loading…</p>}

      {d && (
        <>
          <VersionBlock title="Live on the site" version={d.live} emptyLabel="Nothing published — the look is hidden." />

          <section className="space-y-4">
            <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
              Awaiting your approval
            </h2>
            {d.candidates.length === 0 && (
              <p className="text-sm text-stone-500">No candidates pending.</p>
            )}
            {d.candidates.map((c) => (
              <article key={c.id} className="border border-stone-200 bg-white p-5 space-y-3">
                <header className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="text-sm text-stone-700">
                      v{c.version} · {c.completeness_ok ? "complete" : "incomplete"} ·{" "}
                      {c.styling_score ?? "—"}/100 · {c.engine}
                    </p>
                    {c.rationale && <p className="text-sm italic text-stone-600">{c.rationale}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => doApprove.mutate(c.id)}
                      disabled={doApprove.isPending}
                      className="bg-black text-white px-3 py-2 text-[0.6rem] tracking-[0.2em] uppercase disabled:opacity-50"
                    >
                      Approve &amp; publish
                    </button>
                    <button
                      onClick={() => doReject.mutate(c.id)}
                      disabled={doReject.isPending}
                      className="border border-stone-300 px-3 py-2 text-[0.6rem] tracking-[0.2em] uppercase disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </header>
                <SlotTable slots={c.slots} required={d.requiredSlots} />
              </article>
            ))}
            {doApprove.data && !doApprove.data.ok && (
              <p className="text-sm text-amber-700">{doApprove.data.reason}</p>
            )}
            {doApprove.data?.ok && (
              <p className="text-sm text-emerald-700">
                Published version {doApprove.data.publishedVersion}.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 mb-2">
              History
            </h2>
            <ul className="space-y-1 text-sm">
              {d.history.map((h) => (
                <li key={h.id} className="border-t border-stone-100 pt-1 text-stone-600">
                  v{h.version} · {h.state} · {h.completeness_ok ? "complete" : "incomplete"} ·{" "}
                  {h.styling_score ?? "—"}/100
                  {h.replacement_reason ? ` · ${h.replacement_reason}` : ""}
                </li>
              ))}
            </ul>
          </section>

          {!d.feedAdapterConnected && (
            <p className="text-xs text-stone-500">
              No live retailer feed is connected yet, so candidates are drawn from product records
              already in the system. Slots without a recent check are labelled Needs verification
              and block publishing.
            </p>
          )}
        </>
      )}
    </main>
  );
}

type Slot = {
  slot: string;
  slot_label: string;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string;
  verification?: string;
  last_checked_at?: string | null;
  provenance?: string | null;
};

function VersionBlock({
  title,
  version,
  emptyLabel,
}: {
  title: string;
  version: { version: number; styling_score: number | null; slots: Slot[] } | null;
  emptyLabel: string;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">{title}</h2>
      {!version ? (
        <p className="text-sm text-stone-500">{emptyLabel}</p>
      ) : (
        <div className="border border-stone-200 bg-white p-5 space-y-3">
          <p className="text-sm text-stone-700">
            v{version.version} · {version.styling_score ?? "—"}/100
          </p>
          <SlotTable slots={version.slots} />
        </div>
      )}
    </section>
  );
}

function SlotTable({ slots, required }: { slots: Slot[]; required?: readonly string[] }) {
  const missing = (required ?? []).filter((r) => !slots.some((s) => s.slot === r && s.url));
  return (
    <div>
      <table className="w-full text-sm">
        <tbody>
          {slots.map((s) => (
            <tr key={`${s.slot}-${s.url}`} className="border-t border-stone-100 align-top">
              <td className="py-2 pr-3 text-stone-500 whitespace-nowrap">{s.slot_label}</td>
              <td className="py-2 pr-3">
                <span className="text-stone-500">{s.brand}</span> {s.product_name}
                {s.retailer && <span className="block text-stone-400">{s.retailer}</span>}
                {s.provenance && (
                  <span className="block text-[0.65rem] text-stone-400">
                    source: {s.provenance}
                  </span>
                )}
              </td>
              <td className="py-2 pr-3 whitespace-nowrap">
                <span
                  className={
                    s.verification === "verified"
                      ? "text-emerald-700"
                      : s.verification === "failed"
                        ? "text-red-700"
                        : "text-amber-700"
                  }
                >
                  {VERIFICATION_LABEL[s.verification ?? "needs_verification"]}
                </span>
                {s.last_checked_at && (
                  <span className="block text-[0.65rem] text-stone-400">
                    {new Date(s.last_checked_at).toLocaleDateString()}
                  </span>
                )}
              </td>
              <td className="py-2 text-right">
                <a
                  href={s.url}
                  target="_blank"
                  rel="sponsored noopener"
                  className="text-[0.6rem] tracking-[0.2em] uppercase underline text-stone-500"
                >
                  Open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {missing.length > 0 && (
        <p className="text-sm text-amber-700 mt-2">Missing required: {missing.join(", ")}</p>
      )}
    </div>
  );
}
