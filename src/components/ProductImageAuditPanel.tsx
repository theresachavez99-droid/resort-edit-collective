/**
 * Read-only Studio panel: which product thumbnails point at external retailer
 * hosts, whether those hosts are permitted, and which pages are affected.
 * Pure computation over curated data — no network, no writes.
 */
import { runProductImageAudit } from "@/lib/product-image-audit";

export function ProductImageAuditPanel() {
  const audit = runProductImageAudit();
  const { totals } = audit;

  return (
    <section className="space-y-4">
      <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-2">
        Launch Readiness · Product Image Rights
      </h2>

      <p className="text-xs text-stone-600">
        Display mode:{" "}
        <span className="font-medium text-ink">{audit.mode}</span>
        {audit.mode === "pending_affiliate"
          ? " — external retailer thumbnails are withheld; commerce surfaces render text-first Resort Edit cards."
          : " — permitted, verified external imagery may render."}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Images Referenced" value={totals.imagesReferenced} />
        <Stat label="Project Assets" value={totals.internalAssets} />
        <Stat
          label="External Hotlinks"
          value={totals.externalHotlinks}
          accent={totals.externalHotlinks > 0 ? "amber" : undefined}
        />
        <Stat label="Withheld From Render" value={totals.blockedFromRendering} />
      </div>

      {audit.byHost.length > 0 && (
        <div className="border border-stone-200 divide-y divide-stone-100">
          {audit.byHost.map((h) => (
            <div key={h.host} className="px-4 py-2 flex items-baseline justify-between text-xs">
              <span className="font-mono text-ink">{h.host}</span>
              <span className="text-stone-500">
                {h.count} image{h.count === 1 ? "" : "s"} ·{" "}
                <span className={h.permitted ? "text-emerald-700" : "text-amber-700"}>
                  {h.permitted ? "permitted" : "not verified"}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {audit.pagesAffected.length > 0 && (
        <div className="text-xs text-stone-600">
          <p className="uppercase tracking-[0.2em] text-[0.6rem] text-stone-500 mb-1">
            Pages affected
          </p>
          <ul className="space-y-0.5">
            {audit.pagesAffected.map((p) => (
              <li key={p} className="font-mono">
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer text-stone-600">
          Full external image list ({audit.external.length})
        </summary>
        <div className="mt-2 border border-stone-200 divide-y divide-stone-100 max-h-80 overflow-auto">
          {audit.external.map((r, i) => (
            <div key={`${r.image}-${i}`} className="px-3 py-2">
              <p className="text-ink">
                {r.brand} — {r.name}
              </p>
              <p className="text-stone-500">
                {r.surface} · {r.page}
              </p>
              <p className="font-mono text-[0.65rem] text-stone-400 break-all">{r.image}</p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "red";
}) {
  return (
    <div className="border border-stone-200 px-3 py-2">
      <p className="text-[0.55rem] tracking-[0.25em] uppercase text-stone-500">{label}</p>
      <p
        className={`font-serif text-lg ${
          accent === "red" ? "text-red-600" : accent === "amber" ? "text-amber-700" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}