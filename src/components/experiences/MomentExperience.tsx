import { experienceForMoment, experienceCta } from "@/data/destinationExperiences";
import { trackOutbound } from "@/lib/utils";

/**
 * On a Moment page: the one experience this moment's looks were styled for.
 * Renders nothing when no verified experience maps to the moment.
 */
export function MomentExperience({ momentSlug }: { momentSlug: string }) {
  const e = experienceForMoment(momentSlug);
  if (!e) return null;

  return (
    <section
      className="bg-cream border-t border-border/40"
      aria-labelledby="moment-experience-heading"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 md:py-12">
        <div
          className={`grid grid-cols-1 gap-4 md:gap-6 items-start ${
            e.image ? "md:grid-cols-[38%_1fr]" : ""
          }`}
        >
          {e.image ? (
            <div className="relative aspect-[4/3] overflow-hidden bg-muted border border-border/60">
              <img
                src={e.image}
                alt={e.imageAlt ?? `${e.destinationName} — ${e.kind.toLowerCase()} scene`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {e.imageCaption ? (
                <span className="absolute bottom-0 inset-x-0 bg-ink/70 text-ivory text-[0.6rem] tracking-[0.14em] font-sans px-2.5 py-1 backdrop-blur-sm">
                  {e.imageCaption}
                </span>
              ) : null}
            </div>
          ) : null}
          <div>
            <span className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">
              The experience behind this look
            </span>
            <h2
              id="moment-experience-heading"
              className="font-display text-2xl md:text-3xl tracking-[0.04em] mt-2 text-ink"
            >
              {e.name}
            </h2>
            <p className="font-serif italic text-ink/70 text-[0.95rem] mt-2 leading-relaxed max-w-2xl">
              {e.editorial}
            </p>
            <ul className="mt-3 space-y-1">
              {e.facts.map((f) => (
                <li key={f} className="font-serif text-[0.85rem] text-ink/70 leading-snug">
                  · {f}
                </li>
              ))}
            </ul>
            <p className="mt-2.5 font-serif text-[0.76rem] text-ink/45 leading-snug max-w-2xl">
              Operated by {e.operator}.
              {e.image
                ? " Imagery is an illustration of the destination, not a photograph of the operator's venue."
                : " We have no verified photograph of this venue, so none is shown."}{" "}
              Booking and enquiry links open the listed operator or booking platform, and are not
              commission-bearing.
            </p>
            <a
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
              data-experience-key={e.key}
              data-experience-placement={`moment-${momentSlug}`}
              onClick={() =>
                trackOutbound({
                  item: e.name,
                  href: e.href,
                  category: "experience",
                  tier: `moment-${momentSlug}`,
                })
              }
              className="mt-4 inline-flex eyebrow text-[0.66rem] tracking-[0.3em] text-ink border-b border-ink/40 pb-1 hover:text-gold hover:border-gold transition-colors"
            >
              {experienceCta(e).toUpperCase()} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
