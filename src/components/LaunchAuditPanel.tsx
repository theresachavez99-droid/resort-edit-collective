/**
 * Read-only launch-readiness panel for the Studio dashboard.
 *
 * Reports, per Portofino moment: how many exact product links are live, which
 * canonical slots are still unfilled, and any URL that is not a real product
 * page. Pure computation over static curated data — it never writes and never
 * calls the network, so it is safe to render on every dashboard load.
 */
import { Link } from "@tanstack/react-router";
import { runLaunchAudit } from "@/lib/launch-audit";
import { SLOT_DISPLAY } from "@/lib/product-slots";

export function LaunchAuditPanel() {
  const audit = runLaunchAudit();
  const { totals } = audit;

  return (
    <section className="space-y-4">
      <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-2">
        Launch Readiness · Shop Coverage
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Product Links" value={totals.productUrls} />
        <Stat
          label="Empty Shops"
          value={totals.zeroLinkPages}
          accent={totals.zeroLinkPages > 0 ? "amber" : undefined}
        />
        <Stat
          label="Non-Product URLs"
          value={totals.badUrls}
          accent={totals.badUrls > 0 ? "red" : undefined}
        />
        <Stat label="Moments" value={totals.moments} />
      </div>

      <div className="border border-stone-200 divide-y divide-stone-100">
        {audit.moments.map((m) => (
          <div key={m.slug} className="px-4 py-3 text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <Link
                to="/portofino/$moment"
                params={{ moment: m.slug }}
                className="font-medium text-ink underline decoration-stone-300"
              >
                {m.name}
              </Link>
              <span
                className={
                  m.badUrls.length > 0
                    ? "text-red-600"
                    : m.zeroLinkPage
                      ? "text-amber-700"
                      : "text-emerald-700"
                }
              >
                {m.badUrls.length > 0
                  ? `${m.badUrls.length} bad link${m.badUrls.length === 1 ? "" : "s"}`
                  : m.zeroLinkPage
                    ? "no products yet"
                    : `${m.productUrls} product links`}
              </span>
            </div>
            {m.missingRequiredSlots.length > 0 && (
              <p className="text-stone-500 mt-1">
                Missing:{" "}
                {m.missingRequiredSlots.map((s) => SLOT_DISPLAY[s]).join(", ")}
              </p>
            )}
            {m.badUrls.map((b) => (
              <p key={b.url} className="text-red-600 mt-1 break-all">
                {b.displayLabel}: {b.urlKind} — {b.url}
              </p>
            ))}
          </div>
        ))}
      </div>

      <p className="text-[0.7rem] text-stone-500 leading-relaxed max-w-2xl">
        A moment counts as shoppable only when a link points at an exact retailer
        product page. Search, category, and homepage links are never published.
      </p>
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
  const tone =
    accent === "red"
      ? "text-red-600"
      : accent === "amber"
        ? "text-amber-700"
        : "text-ink";
  return (
    <div className="border border-stone-200 px-3 py-2">
      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-stone-500">
        {label}
      </div>
      <div className={`font-serif text-2xl ${tone}`}>{value}</div>
    </div>
  );
}