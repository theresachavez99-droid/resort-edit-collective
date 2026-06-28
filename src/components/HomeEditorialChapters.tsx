import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { portofinoMomentsQuery } from "@/components/HomeItinerary";
import { PortofinoMomentCard } from "@/components/PortofinoMomentCard";
import type { PortofinoMomentCard as PortofinoMomentCardData } from "@/lib/portofino-moments.functions";

type Chapter = {
  key: string;
  title: string;
  blurb: string;
  slugs: string[];
};

/**
 * Four editorial chapters that organize Portofino's twelve moments into
 * the rhythm of a single day on the Riviera. Order within each chapter
 * matches `editorial_order` on the moment defs.
 */
const CHAPTERS: Chapter[] = [
  {
    key: "arrival",
    title: "Arrival",
    blurb: "Ease into la dolce vita.",
    slugs: ["arrival", "espresso-morning", "exploring-the-harbor"],
  },
  {
    key: "by-the-water",
    title: "By the Water",
    blurb: "Sun, salt, and a slow Italian afternoon.",
    slugs: ["yacht-day", "beach-club", "pool-lounging"],
  },
  {
    key: "around-town",
    title: "Around Town",
    blurb: "Boutique windows, linen daywear, and a long lunch by the sea.",
    slugs: ["shopping", "long-lunch", "harbor-aperitivo"],
  },
  {
    key: "evening",
    title: "Evening",
    blurb: "The harbor turns gold, then candlelit.",
    slugs: ["sunset-views", "riviera-dinner", "nightcap"],
  },
];

export function HomeEditorialChapters() {
  const { data } = useSuspenseQuery(portofinoMomentsQuery);
  const moments: PortofinoMomentCardData[] = data.ok ? data.moments : [];
  const bySlug = new Map(moments.map((m) => [m.moment_slug, m]));

  return (
    <div className="space-y-8 md:space-y-12">
      {CHAPTERS.map((ch) => {
        const cards = ch.slugs
          .map((s) => bySlug.get(s))
          .filter((m): m is PortofinoMomentCardData => Boolean(m));
        if (!cards.length) return null;
        return (
          <section key={ch.key} aria-labelledby={`chapter-${ch.key}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 lg:gap-x-5 gap-y-4 items-start">
              {/* Chapter title rail — sits beside the cards on desktop */}
              <header className="lg:col-span-3 lg:sticky lg:top-24 lg:pr-2">
                <p className="eyebrow text-gold text-[0.62rem] tracking-[0.34em]">
                  Chapter {String(CHAPTERS.indexOf(ch) + 1).padStart(2, "0")}
                </p>
                <h3
                  id={`chapter-${ch.key}`}
                  className="mt-2 font-display text-3xl md:text-4xl tracking-[0.04em] text-ink leading-[0.95]"
                >
                  {ch.title}
                </h3>
                <p className="mt-2 font-serif italic text-[1rem] text-ink/65 leading-snug max-w-[22ch]">
                  {ch.blurb}
                </p>
                <div className="mt-3 h-px w-12 bg-gold/60" />
              </header>

              {/* Cards — tighter gutters than the prior grid */}
              <div
                className={
                  "lg:col-span-9 grid gap-3 md:gap-4 " +
                  (cards.length === 3
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2")
                }
              >
                {cards.map((m) => (
                  <PortofinoMomentCard key={m.moment_slug} m={m} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <div className="pt-2 flex justify-center">
        <Link
          to="/portofino"
          className="inline-flex items-center gap-2 eyebrow text-[0.72rem] tracking-[0.3em] text-gold border-b border-gold/50 pb-1 hover:text-ink hover:border-ink transition-colors"
        >
          View All Editorial Moments <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}