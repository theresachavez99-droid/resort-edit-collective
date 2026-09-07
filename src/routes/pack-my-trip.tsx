import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import type { PortofinoMomentCard } from "@/lib/portofino-moments.functions";
import {
  PRICE_LEVELS,
  PRICE_LEVEL_LABELS,
  SHOE_PREFERENCES,
  SHOE_PREFERENCE_LABELS,
  STYLE_MOODS,
  STYLE_MOOD_LABELS,
  TRIP_LENGTHS,
  buildItinerary,
  coreItinerary,
  packingSummary,
  portofinoLandingMomentsQuery,
  type PriceLevel,
  type ShoePreference,
  type StyleMood,
  type TripLength,
} from "@/lib/pack-my-trip";

type Step = 1 | 2 | 3 | 4 | 5;

type Search = {
  step?: Step;
  days?: TripLength;
  moments?: string;
  mood?: StyleMood;
  price?: PriceLevel;
  shoes?: ShoePreference;
};

const TITLE = "Pack My Trip — Portofino | Resort Edit";
const DESC =
  "Tell us where you're going. We'll dress the entire trip. Complete outfits for every moment of Portofino — from arrival to last call.";

export const Route = createFileRoute("/pack-my-trip")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const num = Number(search.step);
    const step = num >= 1 && num <= 5 ? (num as Step) : undefined;
    const days = TRIP_LENGTHS.find((d) => d === Number(search.days));
    return {
      ...(step ? { step } : {}),
      ...(days ? { days } : {}),
      ...(typeof search.moments === "string" && search.moments
        ? { moments: search.moments }
        : {}),
      ...(STYLE_MOODS.includes(search.mood as StyleMood)
        ? { mood: search.mood as StyleMood }
        : {}),
      ...(PRICE_LEVELS.includes(search.price as PriceLevel)
        ? { price: search.price as PriceLevel }
        : {}),
      ...(SHOE_PREFERENCES.includes(search.shoes as ShoePreference)
        ? { shoes: search.shoes as ShoePreference }
        : {}),
    };
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/pack-my-trip") }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(portofinoLandingMomentsQuery),
  component: PackMyTrip,
});

const wrap = "mx-auto w-full max-w-[1100px] px-4 sm:px-6";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow text-gold text-[0.62rem] sm:text-[0.68rem] tracking-[0.34em]">
      {children}
    </span>
  );
}

function StepHeading({
  step,
  title,
  note,
}: {
  step: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <Eyebrow>{step}</Eyebrow>
      <h2 className="mt-2 font-display text-[1.9rem] sm:text-4xl tracking-[0.03em] text-ink leading-[1.05]">
        {title}
      </h2>
      <div className="mx-auto mt-3 h-px w-12 bg-gold/60" />
      {note && (
        <p className="mt-3 font-serif italic text-[0.98rem] text-ink/65 leading-relaxed">{note}</p>
      )}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  label,
  sub,
  role = "radio",
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
  role?: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={
        "w-full text-left px-5 py-4 border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/70 " +
        (selected
          ? "border-gold bg-cream/70"
          : "border-border/60 bg-ivory hover:border-gold/70")
      }
    >
      <span className="flex items-center justify-between gap-3">
        <span>
          <span className="block font-display text-[1.05rem] tracking-[0.04em] text-ink">
            {label}
          </span>
          {sub && (
            <span className="block font-serif italic text-[0.86rem] text-ink/60 mt-1">{sub}</span>
          )}
        </span>
        <span
          aria-hidden
          className={
            "shrink-0 h-5 w-5 border flex items-center justify-center " +
            (selected ? "border-gold text-gold" : "border-border/70 text-transparent")
          }
        >
          <Check className="h-3 w-3" />
        </span>
      </span>
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 eyebrow text-[0.7rem] tracking-[0.3em] text-ivory bg-ink px-7 py-3.5 hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-ivory"
    >
      {children}
    </button>
  );
}

function QuietButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="eyebrow text-[0.68rem] tracking-[0.3em] text-ink/60 border-b border-ink/25 pb-1 hover:text-gold hover:border-gold transition-colors"
    >
      {children}
    </button>
  );
}

function PackMyTrip() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/pack-my-trip" });
  const { data } = useSuspenseQuery(portofinoLandingMomentsQuery);
  const live: PortofinoMomentCard[] = data.ok ? data.moments : [];

  const step: Step = search.step ?? 1;
  const days = search.days;
  const selected = React.useMemo(
    () => (search.moments ? search.moments.split(",").filter(Boolean) : []),
    [search.moments],
  );

  const setSearch = (next: Partial<Search>) =>
    navigate({ to: "/pack-my-trip", search: { ...search, ...next }, resetScroll: true });

  const chooseDays = (d: TripLength) =>
    setSearch({ days: d, moments: coreItinerary(d, live).join(","), step: 3 });

  const toggleMoment = (slug: string) => {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    navigate({
      to: "/pack-my-trip",
      search: { ...search, moments: next.join(",") },
      resetScroll: false,
    });
  };

  const itinerary = React.useMemo(
    () => (days ? buildItinerary(days, selected, live) : []),
    [days, selected, live],
  );
  const packing = React.useMemo(() => packingSummary(itinerary), [itinerary]);

  return (
    <main className="bg-ivory min-h-screen pb-16 md:pb-24">
      {/* PROMISE */}
      <section className={`${wrap} pt-10 md:pt-16 text-center`}>
        <Eyebrow>RESORT EDIT · DRESSED FOR THE DESTINATION™</Eyebrow>
        <h1 className="mt-3 font-display text-[2.2rem] sm:text-[3.2rem] lg:text-[3.8rem] leading-[1.03] tracking-[0.01em] text-ink max-w-[24ch] mx-auto">
          Tell us where you're going. We'll dress the entire trip.
        </h1>
        <p className="mt-4 font-serif italic text-[1.02rem] sm:text-[1.15rem] text-ink/70 max-w-[46ch] mx-auto leading-relaxed">
          Complete outfits for every moment of the destination—from arrival to last call.
        </p>
        <div className="mt-6 mx-auto h-px w-16 bg-gold/60" />
      </section>

      {/* STEP RAIL */}
      {step < 5 && (
        <nav aria-label="Progress" className={`${wrap} mt-8 md:mt-10`}>
          <ol className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            {[
              { n: 1, label: "Destination" },
              { n: 2, label: "Trip Length" },
              { n: 3, label: "Moments" },
              { n: 4, label: "Preferences" },
            ].map((s) => (
              <li key={s.n} className="flex items-center gap-2">
                <span
                  className={
                    "eyebrow text-[0.6rem] tracking-[0.28em] " +
                    (s.n === step ? "text-gold" : "text-ink/40")
                  }
                  aria-current={s.n === step ? "step" : undefined}
                >
                  {String(s.n).padStart(2, "0")} {s.label}
                </span>
                {s.n < 4 && <span aria-hidden className="text-ink/20">·</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* STEP 1 — DESTINATION */}
      {step === 1 && (
        <section className={`${wrap} mt-10 md:mt-14`}>
          <StepHeading
            step="STEP ONE"
            title="Where are you going?"
            note="Portofino is the destination we dress today."
          />
          <div className="mt-8 max-w-md mx-auto" role="radiogroup" aria-label="Destination">
            <OptionButton
              selected
              onClick={() => setSearch({ step: 2 })}
              label="Portofino, Italy"
              sub="Italian Riviera · twelve editorial moments"
            />
          </div>
          <div className="mt-8 flex justify-center">
            <PrimaryButton onClick={() => setSearch({ step: 2 })}>
              CONTINUE <ArrowRight className="h-3 w-3" />
            </PrimaryButton>
          </div>
        </section>
      )}

      {/* STEP 2 — TRIP LENGTH */}
      {step === 2 && (
        <section className={`${wrap} mt-10 md:mt-14`}>
          <StepHeading
            step="STEP TWO"
            title="How long are you staying?"
            note="We'll shape the itinerary around your days on the Riviera."
          />
          <div
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto"
            role="radiogroup"
            aria-label="Trip length"
          >
            {TRIP_LENGTHS.map((d) => (
              <OptionButton
                key={d}
                selected={days === d}
                onClick={() => chooseDays(d)}
                label={`${d} Days`}
                sub={
                  d === 3
                    ? "A long weekend"
                    : d === 5
                      ? "The classic stay"
                      : "The full Riviera week"
                }
              />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <QuietButton onClick={() => setSearch({ step: 1 })}>BACK</QuietButton>
            <PrimaryButton onClick={() => setSearch({ step: 3 })} disabled={!days}>
              CONTINUE <ArrowRight className="h-3 w-3" />
            </PrimaryButton>
          </div>
        </section>
      )}

      {/* STEP 3 — MOMENTS */}
      {step === 3 && (
        <section className={`${wrap} mt-10 md:mt-14`}>
          <StepHeading
            step="STEP THREE"
            title="Which moments are yours?"
            note="We've chosen a core itinerary. Add or remove as you like."
          />
          <div
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
            role="group"
            aria-label="Portofino moments"
          >
            {live.map((m) => {
              const on = selected.includes(m.moment_slug);
              return (
                <button
                  key={m.moment_slug}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggleMoment(m.moment_slug)}
                  className={
                    "group text-left border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/70 " +
                    (on ? "border-gold bg-cream/60" : "border-border/60 bg-ivory hover:border-gold/70")
                  }
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-cream/40">
                    <img
                      src={m.moment_card_image}
                      alt={`${m.moment_name} — Portofino`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {on && (
                      <span
                        aria-hidden
                        className="absolute right-3 top-3 h-6 w-6 bg-ink/85 text-ivory flex items-center justify-center"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </span>
                  <span className="block px-4 py-4">
                    <span className="block font-display text-[1.1rem] tracking-[0.04em] text-ink">
                      {m.moment_name}
                    </span>
                    <span className="block font-serif italic text-[0.86rem] text-ink/60 mt-1 leading-relaxed">
                      {m.narrative}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-center font-serif italic text-[0.9rem] text-ink/55">
            {selected.length} {selected.length === 1 ? "moment" : "moments"} selected
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            <QuietButton onClick={() => setSearch({ step: 2 })}>BACK</QuietButton>
            <PrimaryButton onClick={() => setSearch({ step: 4 })} disabled={selected.length === 0}>
              CONTINUE <ArrowRight className="h-3 w-3" />
            </PrimaryButton>
          </div>
        </section>
      )}

      {/* STEP 4 — PREFERENCES */}
      {step === 4 && (
        <section className={`${wrap} mt-10 md:mt-14`}>
          <StepHeading
            step="STEP FOUR"
            title="How do you like to dress?"
            note="Noted in your trip brief, and used to guide the order we show your looks."
          />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <fieldset>
              <legend className="eyebrow text-[0.62rem] tracking-[0.32em] text-ink/45 mb-3">
                STYLE MOOD
              </legend>
              <div className="space-y-2" role="radiogroup" aria-label="Style mood">
                {STYLE_MOODS.map((v) => (
                  <OptionButton
                    key={v}
                    selected={search.mood === v}
                    onClick={() => setSearch({ mood: v })}
                    label={STYLE_MOOD_LABELS[v]}
                  />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow text-[0.62rem] tracking-[0.32em] text-ink/45 mb-3">
                PRICE LEVEL
              </legend>
              <div className="space-y-2" role="radiogroup" aria-label="Price level">
                {PRICE_LEVELS.map((v) => (
                  <OptionButton
                    key={v}
                    selected={search.price === v}
                    onClick={() => setSearch({ price: v })}
                    label={PRICE_LEVEL_LABELS[v]}
                  />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow text-[0.62rem] tracking-[0.32em] text-ink/45 mb-3">
                SHOES
              </legend>
              <div className="space-y-2" role="radiogroup" aria-label="Shoe preference">
                {SHOE_PREFERENCES.map((v) => (
                  <OptionButton
                    key={v}
                    selected={search.shoes === v}
                    onClick={() => setSearch({ shoes: v })}
                    label={SHOE_PREFERENCE_LABELS[v]}
                  />
                ))}
              </div>
            </fieldset>
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
            <QuietButton onClick={() => setSearch({ step: 3 })}>BACK</QuietButton>
            <PrimaryButton onClick={() => setSearch({ step: 5 })} disabled={!days}>
              SEE MY PORTOFINO EDIT <ArrowRight className="h-3 w-3" />
            </PrimaryButton>
          </div>
        </section>
      )}

      {/* RESULT */}
      {step === 5 && (
        <section className={`${wrap} mt-10 md:mt-14`}>
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>YOUR TRIP BRIEF</Eyebrow>
            <h2 className="mt-2 font-display text-[2rem] sm:text-4xl tracking-[0.03em] text-ink leading-[1.05]">
              Your Portofino Edit
            </h2>
            <div className="mx-auto mt-3 h-px w-12 bg-gold/60" />
            <p className="mt-3 font-serif italic text-[0.98rem] text-ink/65 leading-relaxed">
              {days ? `${days} days · ` : ""}
              {selected.length} {selected.length === 1 ? "moment" : "moments"}
              {search.mood ? ` · ${STYLE_MOOD_LABELS[search.mood]}` : ""}
              {search.price ? ` · ${PRICE_LEVEL_LABELS[search.price]}` : ""}
              {search.shoes ? ` · ${SHOE_PREFERENCE_LABELS[search.shoes]}` : ""}
            </p>
          </div>

          <div className="mt-10 md:mt-14 space-y-10 md:space-y-14">
            {itinerary
              .filter((d) => d.moments.length > 0)
              .map((d) => (
                <div key={d.day}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="eyebrow text-[0.62rem] tracking-[0.32em] text-gold">
                      DAY {String(d.day).padStart(2, "0")}
                    </span>
                    <span className="h-px flex-1 bg-gold/30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {d.moments.map((m) => (
                      <article
                        key={m.moment_slug}
                        className="flex flex-col bg-ivory border border-border/60"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-cream/40">
                          <img
                            src={m.moment_card_image}
                            alt={`${m.moment_name} — Portofino`}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-display text-xl tracking-[0.04em] text-ink leading-tight">
                            {m.moment_name}
                          </h3>
                          <p className="font-serif italic text-ink/70 text-[0.9rem] mt-2 leading-relaxed flex-1">
                            {m.narrative}
                          </p>
                          <Link
                            to="/portofino/$moment"
                            params={{ moment: m.moment_slug }}
                            className="mt-4 inline-flex items-center gap-2 eyebrow text-[0.62rem] tracking-[0.3em] text-gold border-b border-gold/60 pb-1 self-start hover:text-ink hover:border-ink transition-colors"
                          >
                            VIEW COMPLETE LOOK <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* PACKING SUMMARY — categories already published on these looks. */}
          <PackingSummary slugs={itinerary.flatMap((d) => d.moments.map((m) => m.moment_slug))} />


          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <QuietButton onClick={() => setSearch({ step: 3 })}>EDIT MY TRIP</QuietButton>
            <QuietButton
              onClick={() =>
                navigate({
                  to: "/pack-my-trip",
                  search: {},
                  resetScroll: true,
                })
              }
            >
              START OVER
            </QuietButton>
          </div>
          <p className="mt-6 text-center font-serif italic text-[0.86rem] text-ink/50 max-w-xl mx-auto leading-relaxed">
            This page's address holds your edit — bookmark it or send it on, and it will open exactly
            as you left it.
          </p>
        </section>
      )}
    </main>
  );
}
