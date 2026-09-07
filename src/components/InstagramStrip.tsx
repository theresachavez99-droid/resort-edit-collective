import { Instagram } from "lucide-react";
import {
  INSTAGRAM_COMING_SOON_LINE,
  INSTAGRAM_HANDLE,
  INSTAGRAM_LAUNCHED,
  INSTAGRAM_PROFILE_URL,
  instagramCardCta,
  instagramHref,
  latestInstagramCards,
  type InstagramCard,
} from "@/data/instagramPosts";

type Props = {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  limit?: number;
  cards?: readonly InstagramCard[];
  /** Show the follow CTA under the strip. */
  showFollow?: boolean;
  className?: string;
};

/**
 * Editorial magazine strip of curated Instagram posts.
 * Cards are presentation-only and open the post in a new tab — no live feed,
 * nothing that can break when Instagram changes its embed rules.
 */
export function InstagramStrip({
  eyebrow = `LATEST FROM ${INSTAGRAM_HANDLE}`,
  heading = "The Feed",
  intro = "The stories, reels and scenes behind the destinations — published first on Instagram.",
  limit = 6,
  cards,
  showFollow = true,
  className = "",
}: Props) {
  const items = cards ?? latestInstagramCards(limit);
  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby="instagram-strip-heading">
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow text-gold text-[0.68rem] tracking-[0.34em]">{eyebrow}</p>
        <h2
          id="instagram-strip-heading"
          className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl tracking-[0.03em] text-ink leading-[1.05]"
        >
          {heading}
        </h2>
        <div className="mt-4 mx-auto h-px w-16 bg-gold/60" />
        {intro && (
          <p className="mt-4 font-serif italic text-ink/65 text-[0.98rem] sm:text-[1.05rem] leading-relaxed">
            {intro}
          </p>
        )}
      </div>

      <ul className="mt-7 md:mt-9 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {items.map((card) => {
          const href = instagramHref(card);
          const media = (
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <img
                src={card.image}
                alt={card.imageAlt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-ink/70 text-ivory eyebrow text-[0.55rem] tracking-[0.26em] px-2.5 py-1 backdrop-blur-sm">
                <Instagram className="w-3 h-3" strokeWidth={1.6} />
                {href ? (card.kind === "reel" ? "REEL" : "POST") : "COMING SOON"}
              </span>
            </div>
          );
          return (
            <li key={card.key}>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-card border border-border/50 hover:border-gold transition-colors h-full"
                >
                  {media}
                  <div className="p-4 md:p-5">
                    <h3 className="font-display text-[1.05rem] md:text-xl tracking-wide text-ink leading-snug">
                      {card.title}
                    </h3>
                    <p className="mt-2 font-serif italic text-ink/65 text-[0.86rem] md:text-[0.92rem] leading-relaxed">
                      {card.caption}
                    </p>
                    <span className="mt-3 inline-block eyebrow text-[0.58rem] tracking-[0.28em] text-gold border-b border-gold/40 pb-1 group-hover:text-ink group-hover:border-ink transition-colors">
                      {instagramCardCta(card)} →
                    </span>
                  </div>
                </a>
              ) : (
                <article className="block bg-card border border-border/50 h-full">
                  {media}
                  <div className="p-4 md:p-5">
                    <h3 className="font-display text-[1.05rem] md:text-xl tracking-wide text-ink leading-snug">
                      {card.title}
                    </h3>
                    <p className="mt-2 font-serif italic text-ink/65 text-[0.86rem] md:text-[0.92rem] leading-relaxed">
                      {INSTAGRAM_COMING_SOON_LINE}
                    </p>
                    <span className="mt-3 inline-block eyebrow text-[0.58rem] tracking-[0.28em] text-gold/80 border-b border-gold/30 pb-1">
                      {INSTAGRAM_HANDLE} · COMING SOON
                    </span>
                  </div>
                </article>
              )}
            </li>
          );
        })}
      </ul>

      {showFollow && (
        <div className="mt-7 text-center">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 eyebrow text-[0.68rem] tracking-[0.3em] text-ink bg-transparent border border-ink/25 px-6 py-3.5 hover:border-gold hover:text-gold transition-colors"
          >
            <Instagram className="w-4 h-4" strokeWidth={1.6} />
            FOLLOW {INSTAGRAM_HANDLE}
          </a>
        </div>
      )}
    </section>
  );
}
