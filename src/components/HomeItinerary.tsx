import { Link } from "@tanstack/react-router";
import { homeDays, type HomeDay } from "@/data/homeEdit";
import { useDayImageOverrides, type DaySlug } from "@/data/dayImageRegistry";

function applyDayOverride(d: HomeDay, overrides: Record<string, string>): HomeDay {
  const slug = `day-${d.n}` as DaySlug;
  const override = overrides[slug];
  return override ? { ...d, image: override } : d;
}

/**
 * Homepage Portofino Itinerary — five day cards. Each card is a single
 * tap target that routes directly to its destination moment page.
 * Products live on the moment page, not on the homepage.
 */
export function HomeItinerary() {
  const dayOverrides = useDayImageOverrides();
  const days = homeDays.map((d) => applyDayOverride(d, dayOverrides));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
      {days.map((d) => (
        <Link
          key={d.n}
          to="/portofino/$moment"
          params={{ moment: d.momentSlug }}
          className="group bg-card border border-border/50 hover:border-gold/60 flex flex-col text-left transition-all duration-300 hover:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.18)] cursor-pointer"
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
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              style={{ objectPosition: d.n === 5 ? "center center" : "center top" }}
            />
          </div>
          <div className="px-4 pt-5 text-center flex-1 flex flex-col">
            <p className="font-serif italic text-[0.96rem] text-ink/70 leading-relaxed flex-1">
              {d.subtitle}
            </p>
          </div>
          <span className="mt-5 block text-center eyebrow text-[0.7rem] tracking-[0.24em] py-4 bg-gold text-ivory group-hover:bg-ink transition-colors">
            Explore {d.momentLabel} →
          </span>
        </Link>
      ))}
    </div>
  );
}