import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  getQueueBadge,
  getLatestAuditSummary,
} from "@/lib/replacement-queue.functions";

/**
 * Studio dashboard panel — durable replacement/audit status.
 *
 * The post-audit toast disappears; this panel does not. It keeps the last audit
 * result and the live unresolved replacement count visible, with a direct link
 * into the queue filtered to that run. Internal only.
 */
export function auditSummaryLine(input: {
  failed: number;
  promoted: number;
  needsReview: number;
}): string {
  return `${input.failed} products failed · ${input.promoted} approved backups promoted · ${input.needsReview} replacements need review`;
}

export function QueueStatusPanel({ password }: { password: string }) {
  const badgeFn = useServerFn(getQueueBadge);
  const summaryFn = useServerFn(getLatestAuditSummary);

  const badge = useQuery({
    queryKey: ["queue-badge"],
    queryFn: () => badgeFn(),
  });
  const latest = useQuery({
    queryKey: ["latest-audit-summary", password],
    enabled: !!password,
    queryFn: () => summaryFn({ data: { password } }),
  });

  const summary = badge.data?.summary;
  const run = latest.data?.run;
  const counts = (run?.counts ?? {}) as Record<string, number>;
  const failed =
    (counts["sold_out"] ?? 0) +
    (counts["404"] ?? 0) +
    (counts["non_product_url"] ?? 0) +
    (counts["title_mismatch"] ?? 0) +
    (counts["unavailable"] ?? 0);

  return (
    <div className="border border-stone-300 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Replacements</h3>
        <Link
          to="/admin/product-health/queue"
          className="text-[0.65rem] tracking-[0.24em] uppercase underline"
        >
          Review replacements →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        {[
          ["Needs styling", summary?.needs_styling ?? 0],
          ["Generating", summary?.generating ?? 0],
          ["Ready to review", summary?.ready_to_review ?? 0],
          ["Needs verification", summary?.needs_verification ?? 0],
          ["Approved today", summary?.approved_today ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-stone-200 p-3">
            <div className="text-xl font-serif">{String(value)}</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-stone-500 mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>

      {run ? (
        <div className="mt-4 text-xs text-stone-600">
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
            Last audit
          </span>
          <p className="mt-1">
            {run.scope}
            {run.destination ? ` · ${run.destination}` : ""}
            {run.moment ? `/${run.moment}` : ""} ·{" "}
            {new Date(run.started_at).toLocaleString()} · {run.urls_audited} URLs checked
          </p>
          <p className="mt-1 text-stone-900">
            {auditSummaryLine({
              failed,
              promoted: run.auto_promoted ?? 0,
              needsReview: summary?.unresolved ?? run.awaiting_styling ?? 0,
            })}
          </p>
          <Link
            to="/admin/product-health/queue"
            search={{ runId: run.id }}
            className="inline-block mt-2 border border-stone-900 px-3 py-1.5 text-[0.65rem] tracking-[0.24em] uppercase"
          >
            Review replacements
          </Link>
        </div>
      ) : (
        <p className="mt-4 text-xs text-stone-500">
          No audit has been run yet — start one from Product Audit.
        </p>
      )}
    </div>
  );
}
