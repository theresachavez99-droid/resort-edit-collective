import { Bookmark } from "lucide-react";
import { useMyEdit, toggleLook, type SavedLook } from "@/lib/myEdit";

type Props = {
  look: Omit<SavedLook, "savedAt">;
  source?: string;
  /** "icon" — bare bookmark; "inline" — bookmark + label text */
  variant?: "icon" | "inline";
  /** Color tone — "dark" on light bg, "light" on imagery overlays */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Elegant editorial save control for a complete look. Reads/writes through
 * `src/lib/myEdit` only — never touches localStorage directly.
 */
export function SaveLookButton({
  look,
  source,
  variant = "inline",
  tone = "dark",
  className = "",
}: Props) {
  const { isLookSaved } = useMyEdit();
  const saved = isLookSaved(look.id);

  const toneClass =
    tone === "light"
      ? "text-ivory/90 hover:text-gold"
      : "text-ink/70 hover:text-gold";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLook(look, source);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from My Edit" : "Save to My Edit"}
      className={`group inline-flex items-center gap-2 transition-colors ${toneClass} ${className}`}
    >
      <Bookmark
        className="w-4 h-4"
        strokeWidth={1.5}
        fill={saved ? "currentColor" : "none"}
        style={saved ? { color: "var(--gold, #b08948)" } : undefined}
      />
      {variant === "inline" && (
        <span
          className="eyebrow text-[0.6rem] tracking-[0.28em] uppercase"
          style={saved ? { color: "var(--gold, #b08948)" } : undefined}
        >
          {saved ? "Added to My Edit" : "Save Look"}
        </span>
      )}
    </button>
  );
}