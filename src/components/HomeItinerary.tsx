import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { homeDays, type HomeDay, type HomePiece, type HomeBagPiece } from "@/data/homeEdit";
import { SaveButton } from "@/components/SavedCounter";
import { savedKey } from "@/lib/saved";
import { useDayImageOverrides, type DaySlug } from "@/data/dayImageRegistry";

function applyDayOverride(d: HomeDay, overrides: Record<string, string>): HomeDay {
  const slug = `day-${d.n}` as DaySlug;
  const override = overrides[slug];
  return override ? { ...d, image: override } : d;
}

/**
 * Homepage Portofino Itinerary — five day cards. Tapping a card expands
 * one complete look in-place below the rail, with a slim prev/next pager.
 */
export function HomeItinerary() {
  const [openN, setOpenN] = useState<HomeDay["n"] | null>(null);
  const dayOverrides = useDayImageOverrides();
  const days = homeDays.map((d) => applyDayOverride(d, dayOverrides));
  const idx = openN == null ? -1 : days.findIndex((d) => d.n === openN);
  const open = idx >= 0 ? days[idx] : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
        {days.map((d) => {
          const isOpen = openN === d.n;
          return (
            <button
              key={d.n}
              type="button"
              onClick={() => setOpenN(isOpen ? null : d.n)}
              aria-expanded={isOpen}
              aria-controls="home-itinerary-panel"
              className={`group bg-card border flex flex-col text-left transition-colors ${
                isOpen ? "border-gold" : "border-border/50 hover:border-gold/60"
              }`}
            >
              <div className="text-center pt-5 px-3">
                <div className="eyebrow text-[0.62rem] tracking-[0.28em] text-gold">
                  Day {d.n}
                </div>
                <h3 className="mt-3 eyebrow text-[0.72rem] tracking-[0.2em] leading-snug text-ink min-h-[2.5rem]">
                  {d.title}
                </h3>
              </div>
              <div className="relative aspect-[4/5] mt-4 overflow-hidden bg-muted">
                <img
                  src={d.image}
                  alt={d.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: d.n === 5 ? "center center" : "center top" }}
                />
              </div>
              <div className="px-4 pt-5 text-center flex-1 flex flex-col">
                <p className="font-serif italic text-[0.96rem] text-ink/70 leading-relaxed flex-1">
                  {d.subtitle}
                </p>
              </div>
              <span
                className={`mt-5 block text-center eyebrow text-[0.7rem] tracking-[0.24em] py-4 transition-colors ${
                  isOpen
                    ? "bg-ink text-ivory"
                    : "bg-gold text-ivory group-hover:bg-ink"
                }`}
              >
                {isOpen ? "Hide the Look ▴" : "View the Look ▾"}
              </span>
            </button>
          );
        })}
      </div>

      {open && (
        <div
          id="home-itinerary-panel"
          className="mt-8 border border-gold/50 bg-card"
        >
          {/* Pager */}
          <div className="flex items-center justify-between px-5 lg:px-8 py-4 border-b border-border/50">
            <button
              type="button"
              onClick={() => setOpenN(days[(idx - 1 + days.length) % days.length].n)}
              className="inline-flex items-center gap-1.5 eyebrow text-[0.65rem] tracking-[0.24em] text-ink/70 hover:text-gold transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              Prev day
            </button>
            <span className="eyebrow text-[0.65rem] tracking-[0.28em] text-ink/60">
              · {idx + 1}/{days.length} ·
            </span>
            <button
              type="button"
              onClick={() => setOpenN(days[(idx + 1) % days.length].n)}
              className="inline-flex items-center gap-1.5 eyebrow text-[0.65rem] tracking-[0.24em] text-ink/70 hover:text-gold transition-colors"
            >
              Next day
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-0">
            {/* Hero image */}
            <div className="relative aspect-[4/5] lg:aspect-auto bg-muted lg:min-h-[640px]">
              <img
                src={open.image}
                alt={open.title}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: open.n === 5 ? "center center" : "center top" }}
              />
              <div className="absolute top-4 left-4 bg-ivory/90 backdrop-blur-sm px-3 py-1.5 eyebrow text-[0.6rem] tracking-[0.28em] text-ink">
                {open.dayLabel}
              </div>
            </div>

            {/* Pieces + bag */}
            <div className="p-6 lg:p-10 flex flex-col">
              <div className="eyebrow text-[0.62rem] tracking-[0.28em] text-gold">
                {open.dayLabel}
              </div>
              <h3 className="font-display text-[2rem] sm:text-[2.4rem] lg:text-[2.8rem] leading-[1.05] tracking-[0.01em] text-ink mt-2">
                {open.title}
              </h3>
              <p className="font-serif italic text-[1rem] sm:text-[1.05rem] text-ink/70 mt-3 leading-relaxed">
                {open.caption}
              </p>

              <div className="mt-7">
                <div className="flex items-center gap-3">
                  <h4 className="eyebrow text-[0.68rem] tracking-[0.3em] text-ink">
                    The Look
                  </h4>
                  <span className="h-px flex-1 bg-border/60" />
                </div>
                <ul className="mt-4 divide-y divide-border/50">
                  {open.outfit.map((p) => (
                    <OutfitRow key={`${p.category}-${p.brand}-${p.item}`} piece={p} />
                  ))}
                </ul>
              </div>

              <div className="mt-9">
                <div className="flex items-center gap-3">
                  <h4 className="eyebrow text-[0.68rem] tracking-[0.3em] text-ink">
                    What's in her bag — the details
                  </h4>
                  <span className="h-px flex-1 bg-border/60" />
                </div>
                <ul className="mt-4 divide-y divide-border/50">
                  {open.bag.map((p) => (
                    <BagRow key={`${p.category}-${p.brand}-${p.item}`} piece={p} />
                  ))}
                </ul>
              </div>

              <p className="mt-8 font-serif text-[0.78rem] text-ink/45 leading-relaxed">
                Resort Edit curates — we don't sell. Each link opens at the retailer
                in a new tab; some are affiliate and may earn a commission at no
                additional cost to you.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OutfitRow({ piece }: { piece: HomePiece }) {
  const id = savedKey(piece.brand, piece.item);
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="eyebrow text-[0.6rem] tracking-[0.26em] text-gold w-24 sm:w-28 shrink-0">
        {piece.category}
      </span>
      <a
        href={piece.href}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="flex-1 min-w-0 group inline-flex items-baseline gap-2 hover:text-gold transition-colors"
      >
        <span className="eyebrow text-[0.62rem] tracking-[0.24em] text-ink/80 group-hover:text-gold">
          {piece.brand}
        </span>
        <span className="font-serif text-[0.95rem] text-ink/85 truncate">
          {piece.item}
        </span>
        <ExternalLink className="w-3 h-3 text-ink/40 shrink-0" strokeWidth={1.5} />
      </a>
      {piece.price && (
        <span className="font-serif text-[0.85rem] text-gold tabular-nums">
          {piece.price}
        </span>
      )}
      <SaveButton id={id} label={`${piece.brand} ${piece.item}`} />
    </li>
  );
}

function BagRow({ piece }: { piece: HomeBagPiece }) {
  const id = savedKey(piece.brand, piece.item);
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="eyebrow text-[0.6rem] tracking-[0.26em] text-gold w-24 sm:w-28 shrink-0">
        {piece.category}
      </span>
      <a
        href={piece.href}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="flex-1 min-w-0 group inline-flex items-baseline gap-2 hover:text-gold transition-colors"
      >
        <span className="eyebrow text-[0.62rem] tracking-[0.24em] text-ink/80 group-hover:text-gold">
          {piece.brand}
        </span>
        <span className="font-serif text-[0.95rem] text-ink/85 truncate">
          {piece.item}
        </span>
        <ExternalLink className="w-3 h-3 text-ink/40 shrink-0" strokeWidth={1.5} />
      </a>
      <SaveButton id={id} label={`${piece.brand} ${piece.item}`} />
    </li>
  );
}