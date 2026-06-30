import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { runMoment, type MomentRunOutput } from "@/lib/moment-run.functions";

export const Route = createFileRoute("/admin/moments/$id/run")({
  head: () => ({
    meta: [
      { title: "Moment Run — Resort Edit" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MomentRunWorkspace,
});

type RunResult = MomentRunOutput | { ok: false; stage: string; error: string };

function MomentRunWorkspace() {
  const { id } = useParams({ from: "/admin/moments/$id/run" });
  const run = useServerFn(runMoment);
  const [pw, setPw] = useState("");
  useEffect(() => {
    const c = sessionStorage.getItem("admin_dashboard_pw");
    if (c) setPw(c);
  }, []);
  const mut = useMutation<RunResult, Error>({
    mutationFn: () => run({ data: { password: pw, momentId: id } }),
  });
  const r = mut.data;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
            <Link to="/admin/moments" className="hover:underline">Moment Runs</Link>
            <span className="mx-2">/</span>
            Run workspace
          </p>
          <h1 className="mt-2 font-serif text-3xl text-stone-900">Run</h1>
          <p className="mt-2 text-sm text-stone-600">
            5-stage contract — Compile · Feed · Rank · Curate · Publish.
          </p>
        </div>
        <button
          onClick={() => mut.mutate()}
          disabled={!pw || mut.isPending}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-40"
        >
          {mut.isPending ? "Running…" : "Run engine"}
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        <Panel title="Run params">
          {r && "ok" in r && r.ok ? (
            <dl className="space-y-2 text-xs text-stone-700">
              <Row k="Destination" v={r.destination} />
              <Row k="Moment" v={r.momentSlug} />
              <Row k="Provider" v={r.feed.providerId} />
              <Row k="Feed status" v={r.feed.connected ? "connected" : "not-connected"} />
            </dl>
          ) : (
            <p className="text-xs text-stone-500">Press Run to populate.</p>
          )}
        </Panel>

        <Panel title="Look view">
          {r && "ok" in r && r.ok ? (
            <div className="space-y-3 text-xs text-stone-700">
              <StageRow label="1. Compile" status={r.stages.compile.status} note={`${r.stages.compile.references} references`} />
              <StageRow label="2. Feed" status={r.stages.feed.status} note={`${r.stages.feed.rawCandidates} raw`} />
              <StageRow label="3. Rank" status={r.stages.rank.status} note={`${r.stages.rank.ranked} ranked`} />
              <StageRow label="4. Curate" status={r.stages.curate.status} note={`${r.stages.curate.pool.length} in pool`} />
              <StageRow label="5. Publish" status={r.stages.publish.status} note={r.stages.publish.reason} />
            </div>
          ) : r && !r.ok ? (
            <p className="text-xs text-rose-600">Stage {r.stage} rejected: {r.error}</p>
          ) : (
            <p className="text-xs text-stone-500">Awaiting run.</p>
          )}
        </Panel>

        <Panel title="Product view">
          {r && "ok" in r && r.ok ? (
            r.stages.curate.pool.length === 0 ? (
              <p className="text-xs text-stone-500">
                Empty pool — no candidates to curate. Engine produces zero
                looks rather than fabricate (Gate&nbsp;C).
              </p>
            ) : (
              <ul className="space-y-2 text-xs text-stone-700">
                {r.stages.curate.pool.slice(0, 12).map((c) => (
                  <li key={c.source_url} className="border-b border-stone-100 pb-2">
                    <p className="font-medium">{c.brand ?? "—"}</p>
                    <p className="text-stone-500 truncate">{c.title}</p>
                    <p className="text-[10px] text-stone-400">rank {c.rank.toFixed(1)}</p>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="text-xs text-stone-500">—</p>
          )}
        </Panel>

        <Panel title="Output">
          {r && "ok" in r && r.ok ? (
            <div className="text-xs text-stone-700 space-y-2">
              <p>
                <span className="font-medium">Publish:</span>{" "}
                <span className={r.stages.publish.status === "blocked" ? "text-amber-700" : "text-emerald-700"}>
                  {r.stages.publish.status}
                </span>
              </p>
              <p className="text-stone-500">{r.stages.publish.reason}</p>
              {!r.feed.connected && (
                <p className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-800">
                  Gate B active: {r.feed.detail}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-stone-500">—</p>
          )}
        </Panel>
      </div>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500">Reference Library</h2>
        <p className="mt-2 text-sm text-stone-600 max-w-2xl">
          Editorial references feed into <code className="text-xs">Moment.brief.references</code>.
          Open the <Link to="/admin/editorial-memory" className="underline">Editorial Memory</Link> panel to
          attach or revise references for this moment.
        </p>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="text-[10px] uppercase tracking-[0.18em] text-stone-500 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-stone-500">{k}</dt>
      <dd className="text-stone-900 truncate">{v}</dd>
    </div>
  );
}

function StageRow({ label, status, note }: { label: string; status: string; note: string }) {
  const color =
    status === "ok" || status === "pending"
      ? "text-emerald-700"
      : status === "empty" || status === "blocked"
      ? "text-amber-700"
      : "text-stone-700";
  return (
    <div className="flex justify-between gap-2 border-b border-stone-100 pb-1">
      <span className="font-medium">{label}</span>
      <span className={`${color} text-right text-[11px]`}>{status} · {note}</span>
    </div>
  );
}