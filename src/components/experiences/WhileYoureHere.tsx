import { upcomingEvents, formatEventDates } from "@/data/destinationEvents";

/**
 * Compact dated-events block. Renders nothing unless a verified, future,
 * officially-announced event exists for this destination.
 */
export function WhileYoureHere({ destinationSlug }: { destinationSlug: string }) {
  const events = upcomingEvents(destinationSlug);
  if (events.length === 0) return null;

  return (
    <div className="mt-10 md:mt-12">
      <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
        <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">
          WHILE YOU'RE HERE
        </h3>
        <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">
          Confirmed dates only
        </span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {events.map((e) => (
          <li key={e.key} className="bg-ivory border border-border/60 p-3.5 md:p-4">
            <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold">
              {formatEventDates(e)}
            </span>
            <h4 className="font-display text-[1.02rem] tracking-wide leading-snug mt-1.5">
              {e.name}
            </h4>
            <p className="font-serif italic text-ink/65 text-[0.84rem] mt-1.5 leading-relaxed">
              {e.note}
            </p>
            <p className="font-serif text-[0.78rem] text-ink/55 mt-1.5">{e.where}</p>
            <a
              href={e.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex eyebrow text-[0.58rem] tracking-[0.3em] text-ink hover:text-gold"
            >
              OFFICIAL DETAILS →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
