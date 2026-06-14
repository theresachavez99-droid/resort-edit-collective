import { Heart } from "lucide-react";
import { useSaved } from "@/lib/saved";

/**
 * Header "Saved" counter. No login — counts items stored in localStorage.
 */
export function SavedCounter() {
  const { count } = useSaved();
  return (
    <span
      aria-label={`Saved items (${count})`}
      className="inline-flex items-center gap-1.5 text-ink/80 hover:text-gold transition-colors"
      style={{ fontSize: "16px", fontWeight: 500, letterSpacing: "0.12em", lineHeight: 1 }}
    >
      <Heart
        className="w-[18px] h-[18px]"
        strokeWidth={1.5}
        fill={count > 0 ? "currentColor" : "none"}
      />
      <span className="eyebrow text-[0.7rem] tracking-[0.22em]">Saved {count}</span>
    </span>
  );
}

/**
 * Inline save button rendered on every shoppable item card.
 */
export function SaveButton({ id, label }: { id: string; label: string }) {
  const { has, toggle } = useSaved();
  const saved = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from saved` : `Save ${label}`}
      className="inline-flex items-center justify-center w-7 h-7 text-ink/50 hover:text-gold transition-colors"
    >
      <Heart
        className="w-4 h-4"
        strokeWidth={1.5}
        fill={saved ? "currentColor" : "none"}
        style={saved ? { color: "var(--gold, #b08948)" } : undefined}
      />
    </button>
  );
}