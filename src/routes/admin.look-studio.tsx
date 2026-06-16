import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
} from "@/lib/look-studio.functions";
import {
  IMPROVE_FEEDBACK_PRESETS,
  LOOK_SCORE_CATEGORIES,
  LOOK_SCORE_LABELS,
  LOOK_SLOT_LABELS,
  type LookSlot,
} from "@/lib/lookScoring";

export const Route = createFileRoute("/admin/look-studio")({
  head: () => ({
    meta: [
      { title: "Look Studio — Resort Edit Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
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
      </header>

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
    </main>
  );
}

function DNAStudio({ password, dnaId }: { password: string; dnaId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCandidatesForDNA);
  const generateFn = useServerFn(generateLookCandidates);

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
  const candidates = (data.data?.candidates ?? []) as LookCandidateRow[];
  const slots = (data.data?.slots ?? []) as LookSlotRow[];
  const pool = data.data?.pool ?? { sourced: 0, eligible: 0 };

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
        <button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="bg-ink text-ivory px-5 py-2.5 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-50"
        >
          {generate.isPending ? "Generating…" : "Generate 3 candidates"}
        </button>
      </header>

      {/* Product pool visibility — the Steven Dann buyer's room ledger */}
      <div className="text-[0.7rem] tracking-[0.04em] text-ink/65 font-serif italic">
        Pulled from <span className="font-mono not-italic">{pool.sourced}</span> sourced products ·{" "}
        <span className="font-mono not-italic">{pool.eligible}</span> eligible after auto-validation ·{" "}
        candidates assembled from this pool.
      </div>

      {generate.error && (
        <p className="text-sm text-red-700">Failed: {String((generate.error as Error).message)}</p>
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
          : "bg-blue-50 text-blue-900 border-blue-300";

  return (
    <article className="border border-ink/15 bg-ivory">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ink/10 flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-sm tracking-[0.06em]">Variant {candidate.variant}</p>
          <p className="text-[0.7rem] text-ink/55 mt-0.5">
            Composite{" "}
            <span className="font-mono">
              {candidate.composite_score != null ? candidate.composite_score.toFixed(2) : "—"}
            </span>
          </p>
        </div>
        <span className={`text-[0.6rem] tracking-[0.2em] uppercase border px-2 py-0.5 ${statusColor}`}>
          {candidate.status.replace(/_/g, " ")}
        </span>
      </div>

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
          {sortedSlots.map((s) => (
            <div
              key={s.id}
              className="aspect-square bg-ivory border border-ink/10 overflow-hidden relative"
              title={`${LOOK_SLOT_LABELS[s.slot as LookSlot] ?? s.slot}${s.product?.brand ? ` · ${s.product.brand}` : ""}`}
            >
              {s.product?.image_url ? (
                <img
                  src={s.product.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[0.55rem] uppercase tracking-[0.16em] text-ink/35 text-center px-1">
                  {LOOK_SLOT_LABELS[s.slot as LookSlot] ?? s.slot}
                </div>
              )}
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