import { excludeUnmerchandisable } from "@/lib/merchandising-exclusions";

/**
 * Omission rows for curated shopping lists.
 *
 * Customer-facing sourcing placeholders ("STILL SOURCING", "replacement in
 * review") are no longer rendered: under the standing complete-look rule an
 * incomplete commerce unit is hidden rather than shown with gaps. The stored
 * row data and every caller are preserved, so the styling intent remains in
 * the data layer and internal audits can still read it — this component simply
 * renders nothing publicly.
 */
export type OmittedRow = {
  slot: string;
  brand: string;
  name: string;
  price?: string;
  /** Status line override, e.g. "Replacement in review" for a failed link. */
  label?: string;
};

export function ShopOmissionRows({ rows }: { rows: OmittedRow[] }) {
  // Rings are permanently excluded from Resort Edit merchandising, and no
  // sourcing placeholder is shown to readers at all.
  const visible = excludeUnmerchandisable(rows);
  void visible;
  return null;
}

/** Retained markup, unused publicly; kept for internal/admin surfaces only. */
function OmissionRowsMarkup({ rows }: { rows: OmittedRow[] }) {
  const visible = excludeUnmerchandisable(rows);
  if (visible.length === 0) return null;
  return (
    <ul className="mt-5 border-t border-border/40 divide-y divide-border/30">
      {visible.map((p) => (
        <li
          key={`${p.slot}-${p.brand}-${p.name}`}
          className="py-4 flex items-baseline justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="eyebrow text-[0.55rem] tracking-[0.34em] text-ink/45">
              {p.slot}
            </div>
            <div className="eyebrow text-[0.65rem] tracking-[0.28em] text-ink/60 mt-1.5">
              {p.brand}
            </div>
            <div className="font-serif italic text-[0.95rem] text-ink/55 leading-snug mt-1">
              {p.name}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/40">
              {(p.label ?? "Still sourcing").toUpperCase()}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export { OmissionRowsMarkup };

/** Standing disclosure shown beneath any curated shopping list. */
export const SHOP_ACCURACY_NOTE =
  "Pieces are chosen to match the editorial image. Colour, drape and trim can differ from the retailer's own photography, which is the accurate reference for what you receive.";
