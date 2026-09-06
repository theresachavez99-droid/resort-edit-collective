import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  activatePortofinoVersion,
  generatePortofinoVersion,
  getPortofinoLaunchAudit,
  rollbackPortofinoLook,
} from "@/lib/auto-edit-sitewide.functions";

/**
 * /admin/launch-audit — the honest sitewide launch board.
 *
 * One row per Portofino moment: what is missing, stale, sold out, off-policy,
 * and whether the live hero image matches the live outfit. Nothing here
 * publishes on its own: generation produces an inactive version with its
 * blocked reasons, and activation runs through the atomic database switch.
 */
export const Route = createFileRoute("/admin/launch-audit")({
  head: () => ({
    meta: [
      { title: "Launch Audit — Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LaunchAuditPage,
});

function LaunchAuditPage() {
  const load = useServerFn(getPortofinoLaunchAudit);
  const generate = useServerFn(generatePortofinoVersion);
  const activate = useServerFn(activatePortofinoVersion);
  const rollback = useServerFn(rollbackPortofinoLook);

  const audit = useQuery({ queryKey: ["portofino-launch-audit"], queryFn: () => load() });

  const runGenerate = useMutation({
    mutationFn: (momentSlug: string) =>
      generate({ data: { momentSlug, withHero: true, activateIfClean: true } }),
    onSuccess: () => audit.refetch(),
  });
  const runActivate = useMutation({
    mutationFn: (versionId: string) => activate({ data: { versionId } }),
    onSuccess: () => audit.refetch(),
  });
  const runRollback = useMutation({
    mutationFn: (lookKey: string) => rollback({ data: { lookKey } }),
    onSuccess: () => audit.refetch(),
  });

  const data = audit.data;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">Studio</p>
        <h1 className="font-serif text-3xl text-stone-900">Launch Audit</h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          Every Portofino moment, checked against its editorial brief: complete slot coverage,
          approved merchants, fresh stock evidence, a real stylist verdict and a matching muse hero.
          A moment is only launch-ready when all of them pass.
        </p>
      </header>

      {audit.isLoading ? <p className="text-sm text-stone-500">Loading…</p> : null}
      {audit.error ? (
        <p className="text-sm text-red-700">Could not load the audit. Sign in to the Studio again.</p>
      ) : null}

      {data ? (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Moments" value={String(data.summary.totalMoments)} />
          <Stat label="Launch ready" value={String(data.summary.launchReady)} />
          <Stat label="No products" value={String(data.summary.withNoProducts)} />
          <Stat label="Stale checks" value={String(data.summary.staleChecks)} />
        </section>
      ) : null}

      <div className="space-y-6">
        {(data?.audits ?? []).map((moment) => (
          <article key={moment.momentSlug} className="border border-stone-200 p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-stone-900">{moment.momentName}</h2>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-stone-500">
                  {moment.timeOfDay} · /portofino/{moment.momentSlug}
                </p>
              </div>
              <span
                className={`text-[0.65rem] uppercase tracking-[0.2em] px-2 py-1 ${
                  moment.launchReady ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
                }`}
              >
                {moment.launchReady ? "Launch ready" : "Not ready"}
              </span>
            </div>

            {moment.blockers.length ? (
              <ul className="text-sm text-stone-700 list-disc pl-5 space-y-1">
                {moment.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}

            {moment.looks.map((look) => (
              <div key={look.lookKey} className="border-t border-stone-100 pt-3 space-y-2">
                <p className="text-xs font-medium text-stone-800">{look.lookKey}</p>
                <div className="grid gap-1">
                  {look.slots.map((slot, i) => (
                    <p key={`${look.lookKey}-${i}`} className="text-xs text-stone-600">
                      <span className="uppercase tracking-[0.15em] text-stone-500">
                        {slot.slot ?? slot.rawSlot}
                      </span>{" "}
                      — {slot.brand} {slot.productName} · {slot.availability}
                      {slot.failures.length ? (
                        <span className="text-red-700"> · {slot.failures.map((f) => f.gate).join(", ")}</span>
                      ) : null}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => runGenerate.mutate(moment.momentSlug)}
                disabled={runGenerate.isPending}
                className="text-[0.65rem] uppercase tracking-[0.2em] border border-stone-900 px-4 py-2 disabled:opacity-40"
              >
                {runGenerate.isPending ? "Working…" : "Generate version"}
              </button>
              {moment.activeVersion ? (
                <>
                  <button
                    type="button"
                    onClick={() => runActivate.mutate(moment.activeVersion!.id)}
                    className="text-[0.65rem] uppercase tracking-[0.2em] border border-stone-300 px-4 py-2"
                  >
                    Re-activate v{moment.activeVersion.version}
                  </button>
                  <button
                    type="button"
                    onClick={() => runRollback.mutate(`portofino/${moment.momentSlug}`)}
                    className="text-[0.65rem] uppercase tracking-[0.2em] border border-stone-300 px-4 py-2"
                  >
                    Roll back
                  </button>
                </>
              ) : null}
            </div>

            {runGenerate.data && runGenerate.data.momentSlug === moment.momentSlug ? (
              <p className="text-xs text-stone-700">
                {runGenerate.data.published
                  ? "Published a complete, verified version."
                  : `Held: ${runGenerate.data.blockedReason ?? "gates not met"}`}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-stone-200 p-4">
      <p className="text-[0.6rem] uppercase tracking-[0.25em] text-stone-500">{label}</p>
      <p className="font-serif text-2xl text-stone-900">{value}</p>
    </div>
  );
}
