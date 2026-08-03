import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listClosetCandidates,
  generateMomentCloset,
  setClosetCandidateStatus,
  reverifyClosetCandidate,
  deleteClosetCandidate,
  setClosetEnabled,
  getClosetAnalytics,
} from "@/lib/editorial-closet.functions";
import {
  CLOSET_STATUS_LABELS,
  NEEDS_VERIFICATION_LABEL,
  type ClosetStatus,
} from "@/lib/editorial-closet";
import { PORTOFINO_JOURNEY } from "@/lib/portofino-moment-fallbacks";

/**
 * /admin/editorial-closet — the Editorial Closet desk.
 *
 * ChatGPT proposes; this screen verifies, approves and expires. Nothing here
 * publishes an editorial look: approved candidates only feed the secondary
 * alternative-shopping module on the moment page.
 */
export const Route = createFileRoute("/admin/editorial-closet")({
  head: () => ({
    meta: [
      { title: "Editorial Closet — Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClosetPage,
});

const STORAGE_KEY = "admin_dashboard_pw";

type Row = {
  id: string;
  moment_slug: string;
  category: string;
  context_label: string | null;
  brand: string;
  product_name: string;
  retailer: string;
  product_url: string;
  price: string | null;
  availability: string;
  editorial_rationale: string;
  rationale_tag: string | null;
  match_score: number | null;
  status: string;
  verification_status: string;
  verification_verdict: string | null;
  verified_at: string | null;
  availability_checked_at: string | null;
  click_count: number;
  retailer_click_count: number;
  full_look_pairing: unknown;
  created_at: string;
};

function fmt(ts: string | null): string {
  return ts ? new Date(ts).toLocaleString() : "—";
}

function statusTone(status: string): string {
  if (status === "approved") return "text-emerald-700";
  if (status === "verified") return "text-emerald-600";
  if (status === "ready_for_review") return "text-amber-700";
  if (status === "rejected" || status === "expired") return "text-stone-500";
  return "text-stone-600";
}

function ClosetPage() {
  const listFn = useServerFn(listClosetCandidates);
  const generateFn = useServerFn(generateMomentCloset);
  const statusFn = useServerFn(setClosetCandidateStatus);
  const reverifyFn = useServerFn(reverifyClosetCandidate);
  const deleteFn = useServerFn(deleteClosetCandidate);
  const enabledFn = useServerFn(setClosetEnabled);
  const analyticsFn = useServerFn(getClosetAnalytics);
  const qc = useQueryClient();

  const [pw, setPw] = useState("");
  const [moment, setMoment] = useState<string>(PORTOFINO_JOURNEY[0]?.moment_slug ?? "arrival");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const c = sessionStorage.getItem(STORAGE_KEY);
    if (c) setPw(c);
  }, []);

  const list = useQuery({
    queryKey: ["closet-candidates", pw, moment],
    enabled: !!pw,
    queryFn: () => listFn({ data: { password: pw, moment } }),
  });

  const analytics = useQuery({
    queryKey: ["closet-analytics", pw],
    enabled: !!pw,
    queryFn: () => analyticsFn({ data: { password: pw } }),
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["closet-candidates"] });
    void qc.invalidateQueries({ queryKey: ["closet-analytics"] });
  };

  const generate = useMutation({
    mutationFn: () =>
      generateFn({
        data: { password: pw, moment, count: 12, feedback: feedback.trim() || null },
      }),
    onSuccess: (r) => {
      toast.success(
        `${r.generated} option${r.generated === 1 ? "" : "s"} returned — ${r.verified} verified live.`,
      );
      if (r.insufficientReason) toast.message(r.insufficientReason);
      setFeedback("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const act = useMutation({
    mutationFn: (args: { id: string; status: ClosetStatus }) =>
      statusFn({ data: { password: pw, id: args.id, status: args.status as never } }),
    onSuccess: () => {
      toast.success("Updated.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reverify = useMutation({
    mutationFn: (id: string) => reverifyFn({ data: { password: pw, id } }),
    onSuccess: (r) => {
      toast.success(`Verification: ${r.status} (${r.verdict})`);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { password: pw, id } }),
    onSuccess: () => {
      toast.success("Removed.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (enabled: boolean) =>
      enabledFn({ data: { password: pw, moment, destination: "Portofino", enabled } }),
    onSuccess: () => {
      toast.success("Editorial Closet setting saved.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (list.data?.candidates ?? []) as unknown as Row[];
  const settings = (list.data?.settings ?? []) as Array<{
    moment_slug: string;
    enabled: boolean;
  }>;
  const enabled = settings.find((s) => s.moment_slug === moment)?.enabled ?? true;

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of rows) out[r.status] = (out[r.status] ?? 0) + 1;
    return out;
  }, [rows]);

  const momentAnalytics = analytics.data?.byMoment?.[moment] ?? {};

  if (!pw) {
    return (
      <div className="p-8 font-sans text-sm text-stone-700">
        Unlock the Studio from the dashboard to manage the Editorial Closet.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 font-sans">
      <header className="space-y-2">
        <h1 className="font-display text-3xl tracking-[0.04em] text-ink">Editorial Closet</h1>
        <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
          Dynamic alternatives for each moment's hero product. ChatGPT styles; you approve. Only
          approved options with a live-verified product page appear publicly — the page still
          publishes 1 hero look and at most 2 More Resort Edit Looks.
        </p>
        <p className="text-xs text-stone-500">
          Styling engine:{" "}
          {list.data?.stylistConnected
            ? `connected (${list.data.stylistModel})`
            : "not connected — add OPENAI_API_KEY to generate options"}
        </p>
      </header>

      <section className="flex flex-wrap items-end gap-3">
        <label className="text-xs tracking-[0.2em] uppercase text-stone-500 flex flex-col gap-1">
          Moment
          <select
            value={moment}
            onChange={(e) => setMoment(e.target.value)}
            className="border border-stone-300 px-3 py-2 text-sm text-ink bg-white"
          >
            {PORTOFINO_JOURNEY.map((m) => (
              <option key={m.moment_slug} value={m.moment_slug}>
                {m.moment_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs tracking-[0.2em] uppercase text-stone-500 flex flex-col gap-1 flex-1 min-w-[260px]">
          Direction for this run (optional)
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="More color, quieter jewelry, avoid this brand…"
            className="border border-stone-300 px-3 py-2 text-sm text-ink bg-white"
          />
        </label>
        <button
          type="button"
          onClick={() => generate.mutate()}
          disabled={generate.isPending || !list.data?.stylistConnected}
          className="px-5 py-2.5 text-xs tracking-[0.28em] uppercase bg-ink text-ivory disabled:opacity-40"
        >
          {generate.isPending ? "Generating…" : "Generate options"}
        </button>
        <button
          type="button"
          onClick={() => toggle.mutate(!enabled)}
          className="px-5 py-2.5 text-xs tracking-[0.28em] uppercase border border-stone-400 text-ink"
        >
          {enabled ? "Disable for this moment" : "Enable for this moment"}
        </button>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {(["generating", "ready_for_review", "verified", "approved", "rejected", "expired"] as ClosetStatus[]).map(
          (s) => (
            <div key={s} className="border border-stone-200 p-4">
              <div className="text-xs tracking-[0.2em] uppercase text-stone-500">
                {CLOSET_STATUS_LABELS[s]}
              </div>
              <div className="font-display text-2xl text-ink mt-1">{counts[s] ?? 0}</div>
            </div>
          ),
        )}
        <div className="border border-stone-200 p-4">
          <div className="text-xs tracking-[0.2em] uppercase text-stone-500">Drawer opens</div>
          <div className="font-display text-2xl text-ink mt-1">
            {momentAnalytics["closet_drawer_open"] ?? 0}
          </div>
        </div>
        <div className="border border-stone-200 p-4">
          <div className="text-xs tracking-[0.2em] uppercase text-stone-500">Retailer clicks</div>
          <div className="font-display text-2xl text-ink mt-1">
            {momentAnalytics["closet_retailer_click"] ?? 0}
          </div>
        </div>
      </section>

      {!enabled && (
        <p className="text-sm text-amber-700">
          The Editorial Closet is disabled for this moment — nothing renders publicly.
        </p>
      )}

      <section className="space-y-4">
        {list.isLoading && <p className="text-sm text-stone-500">Loading…</p>}
        {!list.isLoading && rows.length === 0 && (
          <p className="text-sm text-stone-500">
            No options yet for this moment. Generate a set to begin.
          </p>
        )}
        {rows.map((r) => (
          <article
            key={r.id}
            className="border border-stone-200 p-4 md:p-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs tracking-[0.22em] uppercase ${statusTone(r.status)}`}>
                  {CLOSET_STATUS_LABELS[r.status as ClosetStatus] ?? r.status}
                </span>
                {r.verification_status !== "verified" && (
                  <span className="text-xs tracking-[0.22em] uppercase text-amber-700">
                    {NEEDS_VERIFICATION_LABEL}
                  </span>
                )}
                {r.rationale_tag && (
                  <span className="text-xs text-stone-500">{r.rationale_tag}</span>
                )}
                {r.match_score !== null && (
                  <span className="text-xs text-stone-500">Match {r.match_score}</span>
                )}
              </div>
              <h3 className="font-display text-lg text-ink">
                {r.brand} — {r.product_name}
              </h3>
              <p className="text-sm text-stone-600">
                {r.category} · {r.retailer || "—"} · {r.price ?? "—"} · {r.availability}
              </p>
              {r.editorial_rationale && (
                <p className="text-sm italic text-stone-600">{r.editorial_rationale}</p>
              )}
              <a
                href={r.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-700 underline break-all"
              >
                {r.product_url}
              </a>
              <p className="text-xs text-stone-500">
                Verified {fmt(r.verified_at)} · checked {fmt(r.availability_checked_at)} ·{" "}
                {r.verification_verdict ?? "—"} · {r.click_count} card clicks ·{" "}
                {r.retailer_click_count} retailer clicks
              </p>
            </div>
            <div className="flex flex-wrap md:flex-col gap-2 md:w-44">
              <button
                type="button"
                onClick={() => reverify.mutate(r.id)}
                className="px-3 py-2 text-[0.65rem] tracking-[0.22em] uppercase border border-stone-400"
              >
                Re-verify
              </button>
              <button
                type="button"
                onClick={() => act.mutate({ id: r.id, status: "approved" })}
                className="px-3 py-2 text-[0.65rem] tracking-[0.22em] uppercase bg-ink text-ivory"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => act.mutate({ id: r.id, status: "rejected" })}
                className="px-3 py-2 text-[0.65rem] tracking-[0.22em] uppercase border border-stone-400"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => act.mutate({ id: r.id, status: "expired" })}
                className="px-3 py-2 text-[0.65rem] tracking-[0.22em] uppercase border border-stone-400"
              >
                Expire
              </button>
              <button
                type="button"
                onClick={() => remove.mutate(r.id)}
                className="px-3 py-2 text-[0.65rem] tracking-[0.22em] uppercase text-red-700 border border-red-300"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}