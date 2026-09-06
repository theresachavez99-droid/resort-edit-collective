import { Link } from "@tanstack/react-router";
import { trackOutbound } from "@/lib/utils";
import { experienceCta, type DestinationExperience } from "@/data/destinationExperiences";

type Props = {
  experience: DestinationExperience;
  /** Analytics placement label, e.g. "home-featured" or "portofino-collection". */
  placement: string;
  /** Show the destination tag (used on the multi-destination homepage). */
  showDestination?: boolean;
};

export function ExperienceCard({ experience: e, placement, showDestination = false }: Props) {
  return (
    <article className="bg-ivory border border-border/60 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={e.image}
          alt={`${e.destinationName} — ${e.kind.toLowerCase()} scene`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {showDestination && (
          <span className="absolute top-3 left-3 bg-ink/75 text-ivory eyebrow px-2.5 py-1 tracking-[0.28em] text-[0.55rem] backdrop-blur-sm">
            {e.destinationName}
          </span>
        )}
      </div>
      <div className="p-3.5 md:p-4 flex flex-col flex-1">
        <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold">{e.kind}</span>
        <h3 className="font-display text-[1.05rem] tracking-wide leading-snug mt-1.5">{e.name}</h3>
        <p className="font-serif italic text-ink/65 text-[0.86rem] mt-1.5 leading-relaxed">{e.editorial}</p>
        <ul className="mt-2.5 space-y-1">
          {e.facts.map((f) => (
            <li key={f} className="font-serif text-[0.8rem] text-ink/70 leading-snug">
              · {f}
            </li>
          ))}
        </ul>
        <p className="mt-2.5 font-serif text-[0.74rem] text-ink/45 leading-snug flex-1">
          Operated by {e.operator}.{e.imageIsIllustrative ? " Imagery is our own editorial photography of the destination, not the operator's." : ""}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 pt-2.5 border-t border-border/50">
          <a
            href={e.href}
            target="_blank"
            rel="noopener noreferrer"
            data-experience-key={e.key}
            data-experience-placement={placement}
            onClick={() =>
              trackOutbound({ item: e.name, href: e.href, category: "experience", tier: placement })
            }
            className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink hover:text-gold"
          >
            {experienceCta(e).toUpperCase()} →
          </a>
          <Link
            to="/portofino/$moment"
            params={{ moment: e.momentSlug }}
            className="eyebrow text-[0.6rem] tracking-[0.3em] text-gold hover:text-ink"
          >
            WHAT TO WEAR →
          </Link>
        </div>
      </div>
    </article>
  );
}
