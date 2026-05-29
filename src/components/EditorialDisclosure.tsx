import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Show the small serif "Disclosure" eyebrow heading. Default true. */
  showHeading?: boolean;
  /** Tone — light backgrounds (default) vs. dark footer. */
  tone?: "light" | "dark";
};

/**
 * Editorial, understated affiliate disclosure. Reads like a magazine
 * colophon line rather than a legal warning. Never wrap in a colored
 * box or banner — let the whitespace carry it.
 */
export function EditorialDisclosure({
  className,
  showHeading = true,
  tone = "light",
}: Props) {
  const headingTone = tone === "dark" ? "text-ivory/55" : "text-ink/45";
  const bodyTone = tone === "dark" ? "text-ivory/55" : "text-ink/55";
  return (
    <aside
      aria-label="Affiliate disclosure"
      className={cn("my-10 sm:my-14 max-w-xl", className)}
    >
      {showHeading && (
        <h3
          className={cn(
            "font-serif italic text-[0.78rem] tracking-wide mb-2",
            headingTone,
          )}
        >
          Disclosure
        </h3>
      )}
      <p
        className={cn(
          "text-[0.78rem] sm:text-[0.8rem] leading-relaxed font-light",
          bodyTone,
        )}
      >
        Resort Edit may earn commissions from select links featured throughout
        the site, at no additional cost to you.
      </p>
    </aside>
  );
}