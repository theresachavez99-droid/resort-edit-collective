import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PORTOFINO_JOURNEY } from "@/lib/portofino-moment-fallbacks";

/**
 * Canonical "Other Moments in Portofino" strip.
 * Renders every canonical Portofino moment except those whose slug is in
 * `excludeSlugs`. Used on day pages, day/look pages, and moment pages so
 * every Portofino surface ends with the same cross-sell.
 */
export function OtherPortofinoMoments({
  excludeSlugs = [],
}: {
  excludeSlugs?: readonly string[];
}) {
  const exclude = new Set(excludeSlugs);
  const moments = PORTOFINO_JOURNEY.filter((m) => !exclude.has(m.moment_slug));
  if (moments.length === 0) return null;

  return (
    <section className="bg-cream border-y border-border/40">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-14 md:py-16">
        <div className="mb-8">
          <span className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">
            MORE PORTOFINO LOOKS
          </span>
          <h3 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-ink mt-2">
            Other Moments in Portofino
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {moments.map((m) => (
            <Link
              key={m.moment_slug}
              to="/portofino/$moment"
              params={{ moment: m.moment_slug }}
              className="group flex flex-col bg-ivory border border-border/40 hover:border-gold transition-colors"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                <img
                  src={m.moment_card_image}
                  alt={m.moment_name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4">
                <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-gold">
                  Portofino Moment
                </span>
                <h4 className="font-display text-base md:text-lg tracking-[0.03em] text-ink mt-1.5 group-hover:text-gold transition-colors">
                  {m.moment_name}
                </h4>
                <span className="mt-2 inline-flex items-center gap-1.5 eyebrow text-[0.58rem] tracking-[0.32em] text-ink/60 group-hover:text-gold">
                  VIEW MOMENT <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}