import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listLookDNAQueue,
  listCandidatesForDNA,
  generateLookCandidates,
  approveLook,
  rejectLook,
  improveLook,
  rescoreCandidate,
  deleteCandidate,
  type LookCandidateRow,
  type LookSlotRow,
  type CandidateBriefLike,
  type QualityGateLike,
} from "@/lib/look-studio.functions";
import { fillPortofinoInventory, bulkSourceBrand } from "@/lib/brand-crawl.functions";
import { refreshLookInventory, getDestinationInventoryHealth } from "@/lib/source-availability.functions";
import { listDestinationMoments, setCandidateMoment } from "@/lib/destination-moments.functions";
import { NamingWarningChip } from "@/components/admin/NamingWarningChip";
import {
  IMPROVE_FEEDBACK_PRESETS,
  LOOK_SCORE_CATEGORIES,
  LOOK_SCORE_LABELS,
  LOOK_SLOT_LABELS,
  type LookSlot,
} from "@/lib/lookScoring";
import { listEditorialReferences, type EditorialReferenceRow } from "@/lib/editorial-library.functions";

export const Route = createFileRoute("/admin/look-studio")({
  head: () => ({
    meta: [
      { title: "Look Studio — Resort Edit Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search.tab === "library" ? ("library" as const) : ("studio" as const),
  }),
  component: LookStudioPage,
});

const STORAGE_KEY = "admin_look_studio_pw";

function LookStudioPage() {
  const verify = useServerFn(verifyAdmin);
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    setPw(stored);
    verify({ data: { password: stored } })
      .then((r) => {
        if (r.ok) setAuthed(true);
        else window.localStorage.removeItem(STORAGE_KEY);
      })
      .catch(() => window.localStorage.removeItem(STORAGE_KEY));
  }, [verify]);

  if (!authed) {
    return (
      <main className="min-h-screen bg-ivory text-ink flex items-center justify-center px-6">
        <form
          className="w-full max-w-sm border border-ink/20 bg-cream/30 p-8"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            try {
              await verify({ data: { password: pw } });
              window.localStorage.setItem(STORAGE_KEY, pw);
              setAuthed(true);
            } catch {
              setErr("Invalid password");
            }
          }}
        >
          <h1 className="font-display tracking-[0.18em] uppercase text-xl mb-6">Look Studio</h1>
          <label className="text-[0.65rem] tracking-[0.24em] uppercase text-ink/60">Admin password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-2 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            autoFocus
          />
          {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
          <button type="submit" className="mt-6 w-full bg-ink text-ivory py-2.5 text-[0.7rem] tracking-[0.24em] uppercase">
            Enter
          </button>
        </form>
      </main>
    );
  }

  return <StudioBoard password={pw} />;
}

function StudioBoard({ password }: { password: string }) {
  const qc = useQueryClient();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const queueFn = useServerFn(listLookDNAQueue);
  const queue = useQuery({
    queryKey: ["look-studio-queue"],
    queryFn: () => queueFn({ data: { password } }),
  });

  const [selectedDNA, setSelectedDNA] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDNA && queue.data?.ok && queue.data.dnas.length) {
      setSelectedDNA(queue.data.dnas[0].id);
    }
  }, [queue.data, selectedDNA]);

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-ink/15 px-6 md:px-10 py-6 sticky top-0 bg-ivory/95 backdrop-blur z-20">
        <div className="max-w-[1700px] mx-auto flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[0.62rem] tracking-[0.34em] uppercase text-gold">Resort Edit — Admin</p>
            <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] uppercase mt-2">Look Studio</h1>
            <p className="font-serif italic text-ink/65 mt-2 text-sm max-w-xl">
              The unit of approval is the LOOK. Products are ingredients. Review complete destination outfits,
              improve them with directional feedback, then approve to publish and promote products into the vault.
            </p>
          </div>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["look-studio-queue"] })}
            className="border border-ink/25 px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase"
          >
            Refresh
          </button>
        </div>
        <div className="max-w-[1700px] mx-auto mt-4 flex gap-1 border-b border-ink/10 -mb-6">
          {([
            { id: "studio", label: "Studio" },
            { id: "library", label: "Library" },
          ] as const).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate({ to: "/admin/look-studio", search: { tab: t.id } })}
                className={`px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase border-b-2 -mb-px ${
                  active ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      {tab === "library" ? (
        <LibraryTab />
      ) : (
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0">
        <aside className="border-r border-ink/10 px-4 py-6 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
          <h2 className="text-[0.65rem] tracking-[0.28em] uppercase text-ink/55 px-2 mb-3">Look DNA</h2>
          {queue.isLoading && <p className="text-sm text-ink/55 px-2">Loading…</p>}
          <ul className="space-y-1">
            {(queue.data?.ok ? queue.data.dnas : []).map((d) => {
              const isActive = selectedDNA === d.id;
              const needsWork = d.counts.total === 0 || d.counts.pending > 0;
              return (
                <li key={d.id}>
                  <button
                    onClick={() => setSelectedDNA(d.id)}
                    className={`w-full text-left px-3 py-3 border ${isActive ? "border-ink bg-cream/40" : "border-transparent hover:bg-cream/20"}`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-sm tracking-[0.04em]">{d.name}</span>
                      <span className="text-[0.6rem] tracking-[0.2em] uppercase text-ink/50">{d.tier}</span>
                    </div>
                    <p className="text-[0.7rem] text-ink/55 mt-0.5">
                      {d.destination} · {d.activity}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.18em]">
                      <span className={`px-1.5 py-0.5 border ${needsWork ? "border-amber-700 text-amber-800" : "border-emerald-700 text-emerald-800"}`}>
                        {d.counts.total === 0
                          ? "Needs generation"
                          : d.counts.pending > 0
                            ? `${d.counts.pending} in review`
                            : `${d.counts.approved} approved`}
                      </span>
                      {d.counts.best != null && (
                        <span className="text-ink/50">best {d.counts.best.toFixed(1)}</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="px-4 md:px-8 py-6">
          {selectedDNA ? (
            <DNAStudio password={password} dnaId={selectedDNA} />
          ) : (
            <p className="text-sm text-ink/60">Select a Look DNA from the left.</p>
          )}
        </section>
      </div>
      )}
    </main>
  );
}

function DNAStudio({ password, dnaId }: { password: string; dnaId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCandidatesForDNA);
  const generateFn = useServerFn(generateLookCandidates);
  const planFn = useServerFn(fillPortofinoInventory);
  const sourceFn = useServerFn(bulkSourceBrand);
  const healthFn = useServerFn(getDestinationInventoryHealth);
  const refreshOneFn = useServerFn(refreshLookInventory);
  const [sourcingLog, setSourcingLog] = useState<string[]>([]);
  const [sourcingBusy, setSourcingBusy] = useState(false);

  const data = useQuery({
    queryKey: ["look-candidates", dnaId],
    queryFn: () => listFn({ data: { password, dna_id: dnaId } }),
  });

  const generate = useMutation({
    mutationFn: () => generateFn({ data: { password, dna_id: dnaId, count: 3 } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["look-candidates", dnaId] });
      qc.invalidateQueries({ queryKey: ["look-studio-queue"] });
    },
  });

  const dna = data.data?.dna ?? null;
  const all = (data.data?.candidates ?? []) as LookCandidateRow[];
  const ready = ((data.data as { ready?: LookCandidateRow[] } | undefined)?.ready ?? all.filter((c) => c.status !== "discarded" && c.status !== "failed_gate" && c.status !== "rejected")) as LookCandidateRow[];
  const discarded = ((data.data as { discarded?: LookCandidateRow[] } | undefined)?.discarded ?? all.filter((c) => c.status === "discarded" || c.status === "failed_gate")) as LookCandidateRow[];
  const candidates = ready;
  const slots = (data.data?.slots ?? []) as LookSlotRow[];
  const pool = (data.data?.pool ?? { sourced: 0, eligible: 0, floor: 150 }) as {
    sourced: number;
    eligible: number;
    floor?: number;
  };
  const floor = pool.floor ?? 150;
  const depthShort = pool.eligible < floor;
  const isPortofino = (dna?.destination ?? "").toLowerCase().includes("portofino");

  const destination = dna?.destination ?? "";
  const health = useQuery({
    queryKey: ["inv-health", destination],
    queryFn: () => healthFn({ data: { password, destination } }),
    enabled: !!destination,
    refetchOnWindowFocus: false,
  });
  const refresh = useMutation({
    mutationFn: (candidate_id: string) => refreshOneFn({ data: { password, candidate_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inv-health", destination] }),
  });

  async function runPortofinoSourcing() {
    setSourcingBusy(true);
    setSourcingLog(["Planning Portofino inventory…"]);
    try {
      const plan = await planFn({ data: { password, target: 15, retailer: "mytheresa.com" } });
      if (!plan.ok || plan.plan.length === 0) {
        setSourcingLog((l) => [...l, "Inventory floor already met. Generate candidates now."]);
        setSourcingBusy(false);
        return;
      }
      setSourcingLog((l) => [...l, `${plan.plan.length} brands below target. Crawling…`]);
      // Cap to first 6 brands per run so the UI doesn't hang.
      for (const item of plan.plan.slice(0, 6)) {
        setSourcingLog((l) => [...l, `→ ${item.brand}: ${item.missing.join(", ")}`]);
        try {
          const res = await sourceFn({
            data: {
              password,
              brand_id: item.brand_id,
              retailer: "mytheresa.com",
              categories: item.missing as ("swimwear"|"dresses"|"coverups"|"shoes"|"bags"|"jewelry"|"sunglasses"|"hats")[],
              limit_per_category: 15,
            },
          });
          if (res.ok) {
            const total = res.results.reduce((a, r) => a + r.scraped, 0);
            setSourcingLog((l) => [...l, `   ✓ ${item.brand}: ${total} new products`]);
          } else {
            setSourcingLog((l) => [...l, `   ✗ ${item.brand}: ${res.error}`]);
          }
        } catch (e) {
          setSourcingLog((l) => [...l, `   ✗ ${item.brand}: ${(e as Error).message}`]);
        }
      }
      setSourcingLog((l) => [...l, "Done. Refresh sourcing depth and try generating again."]);
      qc.invalidateQueries({ queryKey: ["look-candidates", dnaId] });
    } finally {
      setSourcingBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3 border-b border-ink/10 pb-4">
        <div>
          <p className="text-[0.62rem] tracking-[0.3em] uppercase text-gold">{dna?.destination ?? "—"}</p>
          <h2 className="font-display text-2xl tracking-[0.1em] uppercase mt-1">
            {dna?.name ?? dnaId}
          </h2>
          {dna && (
            <p className="font-serif italic text-ink/70 mt-1 text-sm">
              {dna.mood} · {dna.activity}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {isPortofino && (
            <button
              onClick={runPortofinoSourcing}
              disabled={sourcingBusy}
              className="border border-ink text-ink px-4 py-2.5 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-50"
              title="Bulk-source approved hero brands tagged with Portofino across missing categories"
            >
              {sourcingBusy ? "Sourcing…" : "Source Portofino inventory"}
            </button>
          )}
          <button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="bg-ink text-ivory px-5 py-2.5 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-50"
          >
            {generate.isPending
              ? "Generating…"
              : candidates.length === 0
                ? "Generate 3 candidates"
                : "Generate 3 more"}
          </button>
        </div>
      </header>

      {sourcingLog.length > 0 && (
        <pre className="text-[0.65rem] leading-relaxed bg-cream/40 border border-ink/15 p-3 font-mono whitespace-pre-wrap max-h-56 overflow-auto">
          {sourcingLog.join("\n")}
        </pre>
      )}

      {health.data?.ok && health.data.looks.length > 0 && (
        <div className="border border-ink/15 bg-cream/20 p-3">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-[0.62rem] tracking-[0.3em] uppercase text-ink/65">Inventory health · published looks</h3>
            <span className="text-[0.6rem] text-ink/45 font-serif italic">Auto-resolves primary → alternate retailer → "If this sells out"</span>
          </div>
          <ul className="space-y-1.5">
            {(health.data.looks as Array<{
              candidate_id: string;
              variant: string;
              slot_count: number;
              status_counts: Record<string, number>;
            }>).map((l) => {
              const c: Record<string, number> = l.status_counts ?? {};
              const needs = (c.needs_review ?? 0);
              const alt = (c.using_alternative ?? 0);
              const swap = (c.switched_to_alternate ?? 0);
              const ok = (c.primary_active ?? 0);
              const tone = needs > 0 ? "border-red-700 text-red-800"
                : alt > 0 ? "border-amber-700 text-amber-800"
                : swap > 0 ? "border-blue-700 text-blue-800"
                : "border-emerald-700 text-emerald-800";
              return (
                <li key={l.candidate_id} className="flex items-center gap-2 text-[0.7rem]">
                  <span className="font-mono text-ink/60 w-24 truncate">{l.variant}</span>
                  <span className={`px-1.5 py-0.5 border text-[0.55rem] tracking-[0.18em] uppercase ${tone}`}>
                    {needs > 0 ? `${needs} needs review`
                      : alt > 0 ? `${alt} alt product`
                      : swap > 0 ? `${swap} alt retailer`
                      : "All primary"}
                  </span>
                  <span className="text-ink/55 font-serif italic">
                    {ok}/{l.slot_count} primary · {swap} swap · {alt} alt · {needs} review
                  </span>
                  <button
                    onClick={() => refresh.mutate(l.candidate_id)}
                    disabled={refresh.isPending}
                    className="ml-auto text-[0.55rem] tracking-[0.22em] uppercase border border-ink/30 px-2 py-1 hover:bg-ink hover:text-ivory disabled:opacity-40"
                  >
                    {refresh.isPending ? "…" : "Re-check"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Product pool visibility — the Steven Dann buyer's room ledger */}
      <div className={`flex items-center gap-3 px-3 py-2 border text-[0.7rem] ${depthShort ? "border-amber-600 bg-amber-50/60" : "border-ink/15 bg-cream/30"}`}>
        <span className="tracking-[0.18em] uppercase text-[0.6rem] text-ink/65">Sourcing depth</span>
        <div className="flex-1 h-1.5 bg-cream/60 rounded-sm overflow-hidden max-w-[200px]">
          <div
            className={`h-full ${depthShort ? "bg-amber-600" : "bg-emerald-700"}`}
            style={{ width: `${Math.min(100, (pool.eligible / floor) * 100)}%` }}
          />
        </div>
        <span className="font-mono text-ink/75">{pool.eligible} / {floor}</span>
        <span className="text-ink/55 font-serif italic ml-2">
          {depthShort
            ? "Below Resort Edit floor — looks will repeat. Source more inventory across approved brands."
            : "Pool meets Resort Edit floor."}
        </span>
      </div>

      {generate.error && (
        <p className="text-sm text-red-700">Failed: {String((generate.error as Error).message)}</p>
      )}
      {generate.data?.sourcing_warning && (
        <p className="text-[0.7rem] text-amber-800 font-serif italic">{generate.data.sourcing_warning}</p>
      )}

      {data.isLoading && <p className="text-sm text-ink/55">Loading…</p>}

      {!data.isLoading && candidates.length === 0 && (
        <div className="border border-dashed border-ink/20 p-10 text-center">
          <p className="font-serif italic text-ink/65">No candidates yet for this DNA.</p>
          <p className="text-xs text-ink/50 mt-2">
            Click <strong>Generate 3 candidates</strong> to pull from the sourced product pool.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {candidates.map((cand) => (
          <LookCandidateCard
            key={cand.id}
            password={password}
            candidate={cand}
            slots={slots.filter((s) => s.candidate_id === cand.id)}
            poolEligible={pool.eligible}
            onChanged={() => {
              qc.invalidateQueries({ queryKey: ["look-candidates", dnaId] });
              qc.invalidateQueries({ queryKey: ["look-studio-queue"] });
            }}
          />
        ))}
      </div>

      {discarded.length > 0 && (
        <details className="mt-10 border border-ink/15 bg-cream/20">
          <summary className="cursor-pointer px-4 py-3 text-[0.65rem] tracking-[0.28em] uppercase text-ink/65 flex items-center gap-3">
            <span>Discarded candidates</span>
            <span className="font-mono text-ink/50">({discarded.length})</span>
            <span className="font-serif italic text-ink/55 normal-case tracking-normal text-[0.78rem]">
              Failed quality gate — not surfaced for review. Regenerate to replace.
            </span>
          </summary>
          <ul className="divide-y divide-ink/10 px-4 pb-3">
            {discarded.map((c) => (
              <li key={c.id} className="py-3 text-[0.75rem]">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display tracking-[0.06em]">Variant {c.variant}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.18em] text-red-700">
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="font-serif italic text-ink/65 mt-1">
                  {(c as unknown as { failure_reason?: string | null }).failure_reason ??
                    (c.quality_gate?.reasons ?? []).join(" · ") ??
                    "No reason recorded."}
                </p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function LookCandidateCard({
  password,
  candidate,
  slots,
  poolEligible,
  onChanged,
}: {
  password: string;
  candidate: LookCandidateRow;
  slots: LookSlotRow[];
  poolEligible: number;
  onChanged: () => void;
}) {
  const approveFn = useServerFn(approveLook);
  const rejectFn = useServerFn(rejectLook);
  const improveFn = useServerFn(improveLook);
  const rescoreFn = useServerFn(rescoreCandidate);
  const deleteFn = useServerFn(deleteCandidate);

  const [showImprove, setShowImprove] = useState(false);
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  const approve = useMutation({
    mutationFn: () => approveFn({ data: { password, candidate_id: candidate.id } }),
    onSuccess: onChanged,
  });
  const reject = useMutation({
    mutationFn: () => rejectFn({ data: { password, candidate_id: candidate.id } }),
    onSuccess: onChanged,
  });
  const improve = useMutation({
    mutationFn: () =>
      improveFn({
        data: {
          password,
          candidate_id: candidate.id,
          feedback: Array.from(picks),
          note: note.trim() || undefined,
        },
      }),
    onSuccess: () => {
      setShowImprove(false);
      setPicks(new Set());
      setNote("");
      onChanged();
    },
  });
  const rescore = useMutation({
    mutationFn: () => rescoreFn({ data: { password, candidate_id: candidate.id } }),
    onSuccess: onChanged,
  });
  const del = useMutation({
    mutationFn: () => deleteFn({ data: { password, candidate_id: candidate.id } }),
    onSuccess: onChanged,
  });

  // Destination Moments — load the list for this candidate's destination so the
  // editor can tag the candidate. Shared cache key dedupes across cards.
  const momentsFn = useServerFn(listDestinationMoments);
  const moments = useQuery({
    queryKey: ["dest-moments-public", candidate.destination],
    queryFn: () => momentsFn({ data: { destination_slug: candidate.destination } }),
    staleTime: 60_000,
  });
  const setMomentFn = useServerFn(setCandidateMoment);
  const setMoment = useMutation({
    mutationFn: (slug: string | null) =>
      setMomentFn({ data: { password, candidate_id: candidate.id, moment_slug: slug } }),
    onSuccess: onChanged,
  });
  const momentList = moments.data?.ok ? moments.data.moments : [];
  const currentMoment = momentList.find((m) => m.moment_slug === candidate.moment_slug);

  const sortedSlots = useMemo(
    () => [...slots].sort((a, b) => a.position - b.position),
    [slots],
  );
  const score = candidate.scoring ?? {};

  const statusColor =
    candidate.status === "approved"
      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
      : candidate.status === "rejected"
        ? "bg-red-100 text-red-900 border-red-300"
        : candidate.status === "improving"
          ? "bg-amber-100 text-amber-900 border-amber-300"
          : candidate.status === "failed_gate"
            ? "bg-red-50 text-red-900 border-red-400"
            : candidate.status === "pending_muse" || candidate.status === "pending_score" || candidate.status === "assembling" || candidate.status === "briefing"
              ? "bg-cream/60 text-ink/70 border-ink/25"
              : "bg-blue-50 text-blue-900 border-blue-300";

  const brief = (candidate.brief ?? null) as CandidateBriefLike | null;
  const gate = (candidate.quality_gate ?? null) as QualityGateLike | null;

  return (
    <article className="border border-ink/15 bg-ivory">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ink/10 flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-sm tracking-[0.06em]">Variant {candidate.variant}</p>
          {brief?.title && (
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <p className="text-[0.7rem] text-ink/65 font-serif italic line-clamp-1">{brief.title}</p>
              <NamingWarningChip
                title={brief.title}
                size="xs"
                context={{
                  knownMomentNames: momentList.map((m) => m.moment_name),
                  knownDestinationSlugs: [candidate.destination],
                }}
              />
            </div>
          )}
          <p className="text-[0.7rem] text-ink/55 mt-0.5">
            Composite{" "}
            <span className="font-mono">
              {candidate.composite_score != null ? candidate.composite_score.toFixed(2) : "—"}
            </span>
          </p>
          {momentList.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[0.55rem] tracking-[0.22em] uppercase text-ink/45">Moment</span>
              <select
                value={candidate.moment_slug ?? ""}
                onChange={(e) => setMoment.mutate(e.target.value || null)}
                disabled={setMoment.isPending}
                className="text-[0.7rem] border border-ink/20 bg-ivory px-1.5 py-0.5"
              >
                <option value="">— untagged —</option>
                {momentList.map((m) => (
                  <option key={m.moment_slug} value={m.moment_slug}>
                    {m.moment_name}
                  </option>
                ))}
              </select>
              {currentMoment?.time_of_day && (
                <span className="text-[0.55rem] tracking-[0.18em] uppercase text-ink/45">
                  {currentMoment.time_of_day}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[0.6rem] tracking-[0.2em] uppercase border px-2 py-0.5 ${statusColor}`}>
            {candidate.status.replace(/_/g, " ")}
          </span>
          {gate && (
            <span
              className={`text-[0.55rem] tracking-[0.18em] uppercase border px-1.5 py-0.5 ${gate.passed ? "border-emerald-700 text-emerald-800" : "border-red-700 text-red-800"}`}
              title={gate.reasons?.join(" · ") || "Quality gate"}
            >
              {gate.passed ? "Gate ✓" : "Gate ✗"}
            </span>
          )}
          {gate?.muse?.face_similarity != null && (
            <span
              className={`text-[0.55rem] tracking-[0.18em] uppercase border px-1.5 py-0.5 ${
                gate.muse.face_similarity >= 0.85
                  ? "border-emerald-700 text-emerald-800"
                  : gate.muse.face_similarity >= 0.75
                    ? "border-amber-700 text-amber-800"
                    : "border-red-700 text-red-800"
              }`}
              title={gate.muse.identity_mismatch_reason ?? "Face identity match vs reference muse"}
            >
              {(gate.muse.muse_name ?? "Muse")} {Math.round((gate.muse.face_similarity ?? 0) * 100)}%
            </span>
          )}
          {gate?.muse?.outfit_fidelity != null && (
            <span
              className={`text-[0.55rem] tracking-[0.18em] uppercase border px-1.5 py-0.5 ${
                gate.muse.outfit_fidelity >= 0.85
                  ? "border-emerald-700 text-emerald-800"
                  : gate.muse.outfit_fidelity >= 0.7
                    ? "border-amber-700 text-amber-800"
                    : "border-red-700 text-red-800"
              }`}
              title={gate.muse.outfit_mismatch_reason ?? "Muse outfit ↔ sourced product fidelity"}
            >
              Outfit {Math.round((gate.muse.outfit_fidelity ?? 0) * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Aesthetic brief — the personal-shopper voice */}
      {brief && (
        <div className="px-4 py-3 border-b border-ink/10 bg-cream/25 space-y-2">
          {brief.destination_energy && (
            <p className="font-serif italic text-[0.78rem] text-ink/80 leading-snug">"{brief.destination_energy}"</p>
          )}
          {brief.color_story?.palette && brief.color_story.palette.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[0.55rem] tracking-[0.22em] uppercase text-ink/55">Palette</span>
              <div className="flex gap-1">
                {brief.color_story.palette.slice(0, 5).map((hex, idx) => (
                  <span
                    key={idx}
                    className="inline-block w-4 h-4 rounded-sm border border-ink/15"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          )}
          {brief.luxury_traveler_persona && (
            <p className="text-[0.68rem] text-ink/65 line-clamp-2">
              <span className="uppercase tracking-[0.18em] text-[0.55rem] text-ink/45 mr-1">Persona</span>
              {brief.luxury_traveler_persona}
            </p>
          )}
          {brief.silhouette_strategy && (
            <p className="text-[0.68rem] text-ink/65 line-clamp-2">
              <span className="uppercase tracking-[0.18em] text-[0.55rem] text-ink/45 mr-1">Silhouette</span>
              {brief.silhouette_strategy}
            </p>
          )}
          {brief.accessory_ecosystem && (
            <p className="text-[0.68rem] text-ink/65 line-clamp-2">
              <span className="uppercase tracking-[0.18em] text-[0.55rem] text-ink/45 mr-1">Accessories</span>
              {brief.accessory_ecosystem}
            </p>
          )}
        </div>
      )}

      {/* Quality gate failure — surfaced loudly */}
      {gate && !gate.passed && gate.reasons && gate.reasons.length > 0 && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-[0.68rem] text-red-900">
          <p className="uppercase tracking-[0.2em] text-[0.55rem] text-red-700 mb-1">Quality gate failed</p>
          <ul className="list-disc list-inside space-y-0.5">
            {gate.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="mt-1 italic text-red-700/80">Use Improve or Rescore to regenerate.</p>
        </div>
      )}

      {/* Editorial muse preview — large, top of card */}
      {candidate.muse_image_url ? (
        <img
          src={candidate.muse_image_url}
          alt=""
          className="w-full aspect-[4/5] object-cover bg-cream/40 border-b border-ink/10"
        />
      ) : (
        <div className="w-full aspect-[4/5] bg-gradient-to-br from-cream/60 to-ivory border-b border-ink/10 flex flex-col items-center justify-center text-ink/45 px-6 text-center gap-2">
          <p className="text-[0.6rem] tracking-[0.28em] uppercase">Editorial muse preview</p>
          <p className="font-serif italic text-xs">Awaiting render — approve scoring first</p>
        </div>
      )}

      {/* Product lookboard — flat-lay composite of every slot image */}
      <div className="p-3 border-b border-ink/10">
        <p className="text-[0.6rem] tracking-[0.24em] uppercase text-ink/55 mb-2">Product lookboard</p>
        <div className="grid grid-cols-4 gap-1.5 bg-cream/30 p-2">
          {sortedSlots.filter((s) => s.product?.image_url).map((s) => (
            <div
              key={s.id}
              className="aspect-square bg-ivory border border-ink/10 overflow-hidden relative"
              title={`${LOOK_SLOT_LABELS[s.slot as LookSlot] ?? s.slot}${s.product?.brand ? ` · ${s.product.brand}` : ""}`}
            >
              <img
                src={s.product!.image_url!}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[0.65rem] text-ink/55">
          <span className="font-mono">{sortedSlots.filter((s) => s.product).length}</span> of{" "}
          <span className="font-mono">{sortedSlots.length}</span> slots filled · pool{" "}
          <span className="font-mono">{poolEligible}</span> eligible
        </p>
      </div>

      {/* Scores */}
      <div className="px-4 pb-3">
        <p className="text-[0.6rem] tracking-[0.24em] uppercase text-ink/55 mb-2">Look scoring</p>
        <div className="grid grid-cols-2 gap-1 text-[0.7rem]">
          {LOOK_SCORE_CATEGORIES.map((cat) => {
            const v = score[cat];
            const pct = typeof v === "number" ? Math.max(0, Math.min(10, v)) * 10 : 0;
            const tone = pct >= 75 ? "bg-emerald-600" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
            return (
              <div key={cat} className="flex items-center gap-2">
                <span className="truncate w-28 text-ink/65">{LOOK_SCORE_LABELS[cat]}</span>
                <div className="flex-1 h-1.5 bg-cream/60">
                  <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="font-mono w-6 text-right text-ink/70">
                  {typeof v === "number" ? v.toFixed(0) : "—"}
                </span>
              </div>
            );
          })}
        </div>
        {score.rationale && (
          <p className="mt-2 text-[0.7rem] italic text-ink/60 line-clamp-3">{score.rationale}</p>
        )}
      </div>

      {/* Product list — stylist's ingredient ledger */}
      <div className="px-4 pb-3 border-t border-ink/10 pt-3">
        <p className="text-[0.6rem] tracking-[0.24em] uppercase text-ink/55 mb-2">Look ingredients</p>
        <ul className="divide-y divide-ink/10 text-[0.7rem]">
          {sortedSlots.map((s) => {
            const p = s.product;
            const hasBackup = !!p?.affiliate_url;
            return (
              <li key={s.id} className="py-1.5 flex items-center gap-2">
                <span className="w-20 shrink-0 uppercase tracking-[0.14em] text-ink/55 text-[0.6rem]">
                  {LOOK_SLOT_LABELS[s.slot as LookSlot] ?? s.slot}
                </span>
                <div className="flex-1 min-w-0">
                  {p ? (
                    <>
                      <p className="truncate">
                        <span className="font-display tracking-[0.04em]">{p.brand ?? "—"}</span>
                        <span className="text-ink/60"> · {p.product_name ?? "—"}</span>
                      </p>
                      <p className="truncate text-ink/45 text-[0.65rem]">
                        {p.retailer_domain ?? "—"}
                        {p.price != null && (
                          <>
                            {" · "}
                            <span className="font-mono">
                              {p.currency === "USD" || !p.currency ? "$" : `${p.currency} `}
                              {Math.round(Number(p.price))}
                            </span>
                          </>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-ink/40 italic">Empty slot — no eligible product</p>
                  )}
                </div>
                {p && (
                  <span
                    className={`text-[0.55rem] tracking-[0.16em] uppercase px-1.5 py-0.5 border ${hasBackup ? "border-emerald-700 text-emerald-800" : "border-amber-700 text-amber-800"}`}
                    title={hasBackup ? "Backup affiliate link present" : "No backup link"}
                  >
                    {hasBackup ? "Backup ✓" : "No backup"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-ink/10 flex flex-wrap gap-2 text-[0.7rem]">
        <button
          onClick={() => approve.mutate()}
          disabled={approve.isPending || candidate.status === "approved"}
          className="bg-emerald-800 text-ivory px-3 py-1.5 tracking-[0.18em] uppercase disabled:opacity-40"
        >
          {approve.isPending ? "Approving…" : "Approve look"}
        </button>
        <button
          onClick={() => setShowImprove((v) => !v)}
          className="border border-ink/30 px-3 py-1.5 tracking-[0.18em] uppercase"
        >
          Improve look
        </button>
        <button
          onClick={() => reject.mutate()}
          disabled={reject.isPending || candidate.status === "rejected"}
          className="border border-red-700 text-red-800 px-3 py-1.5 tracking-[0.18em] uppercase disabled:opacity-40"
        >
          Reject
        </button>
        <button
          onClick={() => rescore.mutate()}
          disabled={rescore.isPending}
          className="border border-ink/20 px-3 py-1.5 tracking-[0.18em] uppercase text-ink/70 disabled:opacity-40"
        >
          {rescore.isPending ? "…" : "Rescore"}
        </button>
        <button
          onClick={() => {
            if (confirm("Delete this candidate?")) del.mutate();
          }}
          className="ml-auto text-ink/45 hover:text-red-700 tracking-[0.18em] uppercase"
        >
          Delete
        </button>
      </div>
      {candidate.status === "approved" && (candidate as unknown as { slug?: string | null }).slug && (
        <div className="px-4 pb-3 -mt-1">
          <a
            href={`/look/${(candidate as unknown as { slug: string }).slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.62rem] tracking-[0.24em] uppercase text-emerald-800 underline"
          >
            View published look →
          </a>
        </div>
      )}

      {showImprove && (
        <div className="border-t border-ink/10 bg-cream/30 p-4 space-y-3">
          <p className="text-[0.65rem] tracking-[0.24em] uppercase text-ink/65">
            Direct the AI — pick chips, then submit
          </p>
          <div className="flex flex-wrap gap-2">
            {IMPROVE_FEEDBACK_PRESETS.map((chip) => {
              const active = picks.has(chip);
              return (
                <button
                  key={chip}
                  onClick={() => {
                    const next = new Set(picks);
                    if (next.has(chip)) next.delete(chip);
                    else next.add(chip);
                    setPicks(next);
                  }}
                  className={`text-[0.7rem] px-3 py-1 border ${active ? "bg-ink text-ivory border-ink" : "border-ink/25 text-ink/70 hover:border-ink/50"}`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional: more specific direction…"
            className="w-full border border-ink/20 bg-ivory p-2 text-sm h-16"
          />
          <div className="flex gap-2">
            <button
              onClick={() => improve.mutate()}
              disabled={improve.isPending || (picks.size === 0 && !note.trim())}
              className="bg-ink text-ivory px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
            >
              {improve.isPending ? "Rebuilding…" : "Rebuild look"}
            </button>
            <button
              onClick={() => {
                setShowImprove(false);
                setPicks(new Set());
                setNote("");
              }}
              className="border border-ink/25 px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase"
            >
              Cancel
            </button>
          </div>
          {improve.error && (
            <p className="text-xs text-red-700">{String((improve.error as Error).message)}</p>
          )}
        </div>
      )}
    </article>
  );
}

function LibraryTab() {
  const listFn = useServerFn(listEditorialReferences);
  const q = useQuery({
    queryKey: ["editorial-references"],
    queryFn: () => listFn(),
  });
  const refs = (q.data?.references ?? []) as EditorialReferenceRow[];
  const grouped = useMemo(() => {
    const g: Record<string, EditorialReferenceRow[]> = {};
    for (const r of refs) (g[r.collection || "Other"] ??= []).push(r);
    return g;
  }, [refs]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h2 className="font-display tracking-[0.18em] uppercase text-lg">Editorial Reference Library</h2>
        <p className="font-serif italic text-ink/65 text-sm mt-1">
          The visual substrate Resort Edit looks are styled against. Browse references by collection.
        </p>
      </div>
      {q.isLoading && <p className="text-sm text-ink/55">Loading library…</p>}
      {!q.isLoading && !refs.length && (
        <p className="text-sm text-ink/55 italic">No editorial references yet.</p>
      )}
      <div className="space-y-10">
        {Object.entries(grouped).map(([coll, rows]) => (
          <section key={coll}>
            <h3 className="font-display tracking-[0.2em] uppercase text-base border-b border-ink/15 pb-2 mb-4">
              {coll}{" "}
              <span className="text-[0.62rem] tracking-[0.24em] text-ink/45">
                ({rows.length})
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rows.map((r) => (
                <article key={r.id} className="border border-ink/15 bg-ivory">
                  {r.reference_image ? (
                    <img
                      src={r.reference_image}
                      alt={r.title}
                      className="w-full aspect-[3/4] object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-cream/40" />
                  )}
                  <div className="p-3">
                    <p className="font-display tracking-[0.08em] text-sm truncate">{r.title}</p>
                    <p className="text-[0.62rem] tracking-[0.18em] uppercase text-ink/45 mt-1">
                      {r.destination ?? "—"} · {r.mood ?? r.occasion ?? r.source_type}
                    </p>
                    {r.editorial_story && (
                      <p className="font-serif italic text-ink/70 text-xs mt-2 line-clamp-3">
                        {r.editorial_story}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}