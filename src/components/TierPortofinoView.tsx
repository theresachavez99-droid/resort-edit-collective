import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  portofinoEdit,
  tiers,
  type Tier,
} from "@/data/portofinoEdit";
import { resolveProductLink } from "@/data/portofino";
import { ProductCard } from "@/components/ProductCard";

export type TierSlug = "luxury" | "mid-luxe" | "riviera-finds";

export const tierSlugToId: Record<TierSlug, Tier> = {
  "luxury": "designer",
  "mid-luxe": "mid",
  "riviera-finds": "riviera",
};

export const tierNav: Array<{ slug: TierSlug; label: string }> = [
  { slug: "luxury", label: "Luxury" },
  { slug: "mid-luxe", label: "Mid-Luxe" },
  { slug: "riviera-finds", label: "Riviera Finds" },
];

export function TierNavBar({ active }: { active?: TierSlug }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3" role="tablist" aria-label="Price tier">
      {tierNav.map((t) => {
        const isActive = active === t.slug;
        return (
          <Link
            key={t.slug}
            to={`/portofino/${t.slug}` as "/portofino/luxury" | "/portofino/mid-luxe" | "/portofino/riviera-finds"}
            role="tab"
            aria-selected={isActive}
            className={
              isActive
                ? "eyebrow tracking-[0.3em] text-[0.72rem] px-6 py-3 border bg-gold/90 border-gold text-ink font-bold transition-colors"
                : "eyebrow tracking-[0.3em] text-[0.72rem] px-6 py-3 border border-border bg-cream text-ink hover:bg-gold/20 hover:border-gold/60 transition-colors"
            }
          >
            {t.label.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}

export function TierPortofinoView({ tierSlug }: { tierSlug: TierSlug }) {
  const tierId = tierSlugToId[tierSlug];
  const tierMeta = tiers.find((t) => t.id === tierId)!;
  const [activeDay, setActiveDay] = useState<string>(portofinoEdit[0].day);
  const day = portofinoEdit.find((d) => d.day === activeDay) ?? portofinoEdit[0];

  return (
    <div className="bg-ivory min-h-screen">
      {/* HEADER */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-10 md:pt-14 pb-8 text-center">
        <Link
          to="/portofino"
          className="inline-flex items-center gap-2 eyebrow text-[0.6rem] text-ink/60 hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to the Portofino Edit
        </Link>
        <p className="eyebrow text-gold mt-8 text-[0.72rem] tracking-[0.32em]">
          The Portofino Edit · {tierMeta.label}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-[0.06em] mt-4 text-ink">
          Portofino · {tierMeta.label}
        </h1>
        <p className="font-serif italic text-[0.95rem] sm:text-base text-ink/70 max-w-2xl mx-auto mt-4 leading-relaxed">
          {tierMeta.tagline} <span className="text-ink/50">({tierMeta.range})</span>
        </p>
      </div>

      {/* TIER NAV */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-8">
        <TierNavBar active={tierSlug} />
      </div>

      {/* DAY TABS */}
      <div className="sticky top-0 z-20 bg-ivory/95 backdrop-blur border-y border-border/60">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3 flex gap-1 sm:gap-2 overflow-x-auto" role="tablist" aria-label="Day">
          {portofinoEdit.map((d) => {
            const isActive = activeDay === d.day;
            return (
              <button
                key={d.day}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveDay(d.day)}
                className={`eyebrow text-[0.65rem] whitespace-nowrap px-4 py-2 border transition-colors cursor-pointer ${
                  isActive
                    ? "border-gold bg-gold/90 text-ink font-semibold"
                    : "border-border/60 text-ink hover:border-gold hover:text-gold"
                }`}
              >
                {d.day.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* DAY HEADER + LOOKS */}
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
        <header className="border-b border-border/60 pb-6 mb-10">
          <div className="eyebrow text-gold text-[0.8rem] tracking-[0.38em]">{day.day}</div>
          <h2 className="font-display text-3xl sm:text-5xl tracking-[0.06em] text-ink mt-3">{day.title}</h2>
          <p className="font-serif italic text-[0.95rem] text-ink/65 mt-3 max-w-xl">{day.subtitle}</p>
        </header>

        <div className="space-y-16 md:space-y-24">
          {day.looks.map((look) => {
            const items = (look.tiers[tierId] ?? []).filter((it) => resolveProductLink(it) !== null);
            return (
              <article
                key={look.id}
                className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 lg:gap-10 bg-card border border-border/60"
              >
                {/* Left: editorial image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  {look.image && (
                    <img
                      src={look.image}
                      alt={look.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
                    {look.category}
                  </div>
                </div>

                {/* Right: products for this tier */}
                <div className="p-5 sm:p-6 lg:p-8 flex flex-col">
                  <div className="eyebrow text-[0.6rem] tracking-[0.3em] text-gold">{tierMeta.label}</div>
                  <h3 className="font-display text-2xl sm:text-3xl tracking-[0.06em] text-ink mt-2">{look.name}</h3>
                  <p className="font-serif italic text-[0.85rem] text-ink/65 mt-2">{look.fabric}</p>
                  <p className="font-serif text-[0.9rem] text-ink/75 mt-3 leading-relaxed">{look.description}</p>

                  {items.length === 0 ? (
                    <p className="mt-6 font-serif italic text-ink/55">No {tierMeta.label} picks for this look yet.</p>
                  ) : (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                      {items.map((item) => (
                        <ProductCard key={item.brand + item.item} item={item} variant="editorial" />
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
