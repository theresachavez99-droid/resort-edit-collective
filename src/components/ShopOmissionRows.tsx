/**
 * Explicit-omission rendering for curated shopping lists (Batch 2 —
 * required-slot doctrine).
 *
 * Rows whose exact product URL has not been verified are never dropped
 * silently: they render as muted, unlinked "STILL SOURCING" lines so the
 * reader sees the complete styling intent and understands that the link,
 * not the piece, is what is missing.
 */
export type OmittedRow = {
  slot: string;
  brand: string;
  name: string;
  price?: string;
};

export function ShopOmissionRows({ rows }: { rows: OmittedRow[] }) {
  if (rows.length === 0) return null;
  return (
    <ul className="mt-5 border-t border-border/40 divide-y divide-border/30">
      {rows.map((p) => (
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
            {p.price && (
              <div className="font-serif text-ink/40 text-[0.95rem]">{p.price}</div>
            )}
            <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/40 mt-2">
              STILL SOURCING
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Standing disclosure shown beneath any curated shopping list. */
export const SHOP_ACCURACY_NOTE =
  "Every piece is chosen to match the photograph. Where an exact colorway or size is not stocked, we link the closest available version and say so.";
