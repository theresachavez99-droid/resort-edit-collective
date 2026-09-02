import type { StagedLook, StagedLookRow } from "@/data/previewStagedLooks";
import { safeHref } from "@/lib/safe-url";
import { trackOutbound } from "@/lib/utils";
import { canonicalVisibleSlot } from "@/lib/look-atomic-completeness";

/**
 * "The Resort Edit" itemization for a preview-staged look.
 *
 * Renders atomically: the caller only mounts this when every visible product
 * category has a live, valid link, so there is never a partial set, a disabled
 * row, or a status line. Prices are never rendered — the data carries none.
 */
const CHAPTERS = [
  { key: "look", label: "THE LOOK", slots: ["outfit", "layer"] },
  {
    key: "finishing",
    label: "FINISHING TOUCHES",
    slots: ["shoes", "bag", "sunglasses", "hat", "belt", "scarf"],
  },
  { key: "jewelry", label: "JEWELRY", slots: ["necklace", "earrings", "bracelet"] },
] as const;

function Row({ row }: { row: StagedLookRow }) {
  const href = safeHref(row.url);
  if (!href) return null;
  return (
    <li className="[&:not(:first-child)]:mt-3.5">
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() =>
          trackOutbound({ brand: row.brand, item: row.name, href, category: row.slot })
        }
        className="group block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
      >
        <div>
          <div className="font-serif italic text-[0.88rem] text-ink/55 leading-snug">
            {row.brand}
          </div>
          <div className="font-display text-[1.1rem] md:text-[1.15rem] leading-snug text-ink group-hover:text-gold transition-colors duration-300 mt-1">
            {row.name}
            {row.color ? ` — ${row.color}` : ""}
          </div>
          <div className="eyebrow text-[0.62rem] tracking-[0.32em] text-gold/80 mt-2 group-hover:text-gold transition-colors duration-300">
            VIEW PRODUCT →
          </div>
        </div>
      </a>
    </li>
  );
}

export function StagedLookItemization({ look }: { look: StagedLook }) {
  const chapters = CHAPTERS.map((c) => ({
    ...c,
    items: c.slots.flatMap((slot) =>
      look.rows.filter((r) => canonicalVisibleSlot(r.slot) === slot),
    ),
  })).filter((c) => c.items.length > 0);
  if (chapters.length === 0) return null;

  return (
    <div className="pt-2">
      <div className="pt-4 border-t border-border/40">
        <span className="eyebrow text-[0.6rem] tracking-[0.34em] text-gold">THE EDIT</span>
        <h3 className="font-display text-2xl md:text-[1.75rem] tracking-[0.04em] text-ink mt-2 leading-[1.1]">
          The Resort Edit
        </h3>
        <p className="font-serif italic text-[0.95rem] text-ink/70 mt-2 leading-relaxed max-w-prose">
          The exact pieces in this photograph — the complete look, nothing missing.
        </p>
      </div>
      <div className="mt-2">
        {chapters.map((chapter, ci) => (
          <section key={chapter.key} className={ci === 0 ? "mt-6" : "mt-11 md:mt-12"}>
            <h4 className="eyebrow text-[0.64rem] tracking-[0.38em] text-ink/45 mb-5">
              {chapter.label}
            </h4>
            <ul>
              {chapter.items.map((r) => (
                <Row key={`${r.slot}-${r.name}`} row={r} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
