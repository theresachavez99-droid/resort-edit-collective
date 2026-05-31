import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  ShoppingBag,
  ChevronDown,
  ArrowLeft,
  Plus,
} from "lucide-react";
import {
  portofinoEdit,
  tiers,
  lookMetas,
  type Tier,
  type LookKey,
  type EditItem,
} from "@/data/portofinoEdit";
import { resolveProductLink } from "@/data/portofino";
import { ProductCard } from "@/components/ProductCard";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/portofino-edit")({
  head: () => ({
    meta: [
      { title: "Portofino Resort Edit — Across Price Points" },
      {
        name: "description",
        content:
          "One destination, three style directions per day — print forward, quiet luxury, texture forward — across designer, mid-luxe, and accessible tiers.",
      },
      { property: "og:title", content: "Portofino Resort Edit — Across Price Points" },
      {
        property: "og:description",
        content:
          "Same aesthetic. Different investment. Three looks per vacation day in Portofino.",
      },
      { property: "og:url", content: absoluteUrl("/portofino-edit") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino-edit") }],
  }),
  component: PortofinoEditPage,
});

type Filter = Tier | "all";

function CategorizedItems({
  items,
  finishingNote,
}: {
  items: EditItem[];
  finishingNote?: string;
}) {
  const visible = items.filter((it) => resolveProductLink(it) !== null);

  return (
    <div className="flex-1 px-4 sm:px-5 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {visible.map((item) => (
          <ProductCard key={item.brand + item.item} item={item} variant="editorial" />
        ))}
      </div>
      {finishingNote && (
        <p className="mt-5 font-serif italic text-[0.82rem] text-ink/60 leading-relaxed">
          {finishingNote}
        </p>
      )}
    </div>
  );
}

function PortofinoEditPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openDays, setOpenDays] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(portofinoEdit.map((d) => [d.day, true])),
  );
  // Per-day: which look is expanded (only one at a time). null = all collapsed.
  const [expandedLook, setExpandedLook] = useState<Record<string, LookKey | null>>(
    () => Object.fromEntries(portofinoEdit.map((d) => [d.day, null])),
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [activeDay, setActiveDay] = useState<string>(portofinoEdit[0].day);

  const visibleTiers = useMemo(
    () => (filter === "all" ? tiers : tiers.filter((t) => t.id === filter)),
    [filter],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveDay(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    portofinoEdit.forEach((d) => {
      const el = document.getElementById(d.day);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const toggleDay = (day: string) =>
    setOpenDays((p) => ({ ...p, [day]: !p[day] }));
  const toggleLook = (day: string, look: LookKey) =>
    setExpandedLook((p) => ({ ...p, [day]: p[day] === look ? null : look }));
  const toggleSave = (key: string) =>
    setSaved((p) => ({ ...p, [key]: !p[key] }));

  const shareEdit = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Portofino Resort Edit", url });
      } catch {
        /* dismissed */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="bg-ivory min-h-screen">
      {/* MASTHEAD */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-10 md:pt-16 pb-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 eyebrow text-[0.6rem] text-ink/60 hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to the Edit
        </Link>
        <p className="eyebrow text-gold mt-10 text-[0.7rem] tracking-[0.3em]">
          The Portofino Edit · Three Ways To Vacation
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-[0.08em] mt-6 text-ink">
          One Destination.
          <br className="sm:hidden" /> Multiple Ways To Vacation Beautifully.
        </h1>
        <p className="font-serif text-[0.95rem] sm:text-base text-ink/70 max-w-2xl mx-auto mt-6 leading-relaxed">
          Each day, three style directions — print forward, quiet luxury, and
          texture forward — translated across designer, mid-luxe, and accessible
          tiers. Same aesthetic. Different investment.
        </p>
        <p className="font-serif italic text-[0.95rem] text-ink/55 max-w-xl mx-auto mt-4">
          Each look includes options across multiple price points.
        </p>
      </div>

      {/* TIER LEGEND */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {tiers.map((t) => (
            <div
              key={t.id}
              className="border border-gold/40 bg-card px-6 py-7 text-center"
            >
              <div className="eyebrow text-gold text-[0.65rem] tracking-[0.28em]">
                {t.label}
              </div>
              <div className="mx-auto mt-3 h-px w-10 bg-gold/60" />
              <p className="font-serif italic text-[0.95rem] text-ink/80 mt-4">
                {t.tagline}
              </p>
              <p className="font-display text-lg text-ink mt-3 tracking-[0.1em]">
                {t.range}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* STICKY NAV */}
      <div className="sticky top-0 z-30 bg-ivory/95 backdrop-blur border-y border-border/60">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <nav className="flex gap-1 sm:gap-2 overflow-x-auto -mx-1 px-1">
            {portofinoEdit.map((d) => (
              <a
                key={d.day}
                href={`#${d.day}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(d.day)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`eyebrow text-[0.6rem] sm:text-[0.65rem] whitespace-nowrap px-3 py-2 border transition-colors ${
                  activeDay === d.day
                    ? "border-gold bg-gold text-ivory"
                    : "border-border/60 text-ink hover:border-gold hover:text-gold"
                }`}
              >
                {d.day}
              </a>
            ))}
          </nav>
          <div className="flex gap-1 sm:gap-2 overflow-x-auto -mx-1 px-1">
            {(["designer", "mid", "riviera", "all"] as Filter[]).map((f) => {
              const labelMap: Record<Filter, string> = {
                designer: "Designer",
                mid: "Mid-Luxe",
                riviera: "Riviera Finds",
                all: "Show All",
              };
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`eyebrow text-[0.6rem] sm:text-[0.65rem] whitespace-nowrap px-3 py-2 border transition-colors cursor-pointer ${
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-border/60 text-ink hover:border-gold hover:text-gold"
                  }`}
                >
                  {labelMap[f]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DAYS */}
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16 md:py-20 space-y-24 md:space-y-32">
        {portofinoEdit.map((day) => {
          const isOpen = openDays[day.day];
          const openLookKey = expandedLook[day.day];
          return (
            <section key={day.day} id={day.day} className="scroll-mt-32">
              {/* Day header */}
              <header className="flex items-end justify-between gap-4 border-b border-border/60 pb-6 mb-12">
                <div>
                  <div className="eyebrow text-gold text-[0.8rem] tracking-[0.38em]">
                    {day.day}
                  </div>
                  <h2 className="font-display text-3xl sm:text-5xl md:text-6xl tracking-[0.06em] text-ink mt-4">
                    {day.title}
                  </h2>
                  <p className="font-serif italic text-[0.95rem] text-ink/60 mt-3 max-w-xl">
                    {day.subtitle}
                  </p>
                </div>
                <button
                  onClick={() => toggleDay(day.day)}
                  className="eyebrow text-[0.6rem] text-ink/70 hover:text-gold inline-flex items-center gap-2 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  {isOpen ? "Collapse" : "Expand"}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </header>

              {isOpen && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.4fr] gap-8 lg:gap-12">
                    {/* LEFT — Editorial anchor */}
                    <aside>
                      <figure className="bg-card">
                        <div className="aspect-[2/3] overflow-hidden bg-muted">
                          <img
                            src={day.image}
                            alt={`${day.title} editorial look`}
                            loading="lazy"
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <figcaption className="text-center py-4 px-3">
                          <div className="eyebrow text-[0.6rem] text-gold tracking-[0.25em]">
                            The Editorial Reference
                          </div>
                        </figcaption>
                      </figure>
                      <div className="mt-5">
                        <div className="eyebrow text-[0.6rem] text-ink/50 tracking-[0.3em]">
                          {day.day}
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl tracking-[0.06em] text-ink mt-2">
                          {day.title}
                        </h3>
                        <p className="font-serif italic text-[0.85rem] text-ink/60 mt-2">
                          {day.subtitle}
                        </p>
                        <p className="mt-5 eyebrow text-[0.6rem] tracking-[0.28em] text-ink/55">
                          Three Styling Pathways · Tap To Explore
                        </p>
                      </div>
                    </aside>

                    {/* RIGHT — Look accordion */}
                    <div className="space-y-4">
                      {day.looks.map((look) => {
                        const meta = lookMetas.find((m) => m.id === look.id)!;
                        const isLookOpen = openLookKey === look.id;
                        const tags = [day.title, meta.category];
                        return (
                          <article
                            key={look.id}
                            className={`border bg-card transition-all duration-300 ${
                              isLookOpen
                                ? "border-gold shadow-[0_18px_40px_-20px_rgba(141,110,68,0.35)]"
                                : "border-border/60 hover:border-gold/60"
                            }`}
                          >
                            {/* Collapsed header */}
                            <button
                              onClick={() => toggleLook(day.day, look.id)}
                              aria-expanded={isLookOpen}
                              className="w-full text-left px-5 sm:px-6 py-5 cursor-pointer"
                            >
                              <div className="flex items-start gap-4 sm:gap-5">
                                {look.image && (
                                  <div className="shrink-0 w-24 sm:w-32 aspect-[3/4] overflow-hidden bg-muted border border-border/50">
                                    <img
                                      src={look.image}
                                      alt={`${look.name} editorial`}
                                      loading="lazy"
                                      width={640}
                                      height={896}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`eyebrow text-[0.6rem] tracking-[0.3em] ${
                                      isLookOpen ? "text-gold" : "text-ink/55"
                                    }`}
                                  >
                                    {meta.shortLabel} · {meta.category}
                                  </div>
                                  <h4 className="font-display text-lg sm:text-xl tracking-[0.06em] text-ink mt-2">
                                    {look.name}
                                  </h4>
                                  <div className="font-serif italic text-[0.8rem] text-ink/65 mt-1.5">
                                    {look.fabric}
                                  </div>
                                  <p className="font-serif text-[0.85rem] text-ink/70 mt-2 max-w-xl leading-relaxed">
                                    {look.description}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {tags.map((t) => (
                                      <span
                                        key={t}
                                        className="eyebrow text-[0.55rem] tracking-[0.22em] text-ink/70 border border-border/70 px-2.5 py-1"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 self-start inline-flex items-center gap-2 eyebrow text-[0.6rem] tracking-[0.28em] px-3 py-2 border transition-colors ${
                                    isLookOpen
                                      ? "border-gold bg-gold text-ivory"
                                      : "border-ink text-ink"
                                  }`}
                                >
                                  {isLookOpen ? "Close" : "View This Look"}
                                  <Plus
                                    className={`w-3 h-3 transition-transform ${
                                      isLookOpen ? "rotate-45" : ""
                                    }`}
                                  />
                                </span>
                              </div>
                            </button>

                            {/* Expanded body */}
                            {isLookOpen && (
                              <div className="border-t border-border/60 px-5 sm:px-6 py-6 bg-ivory/40">
                                <div className="space-y-8 md:space-y-10">
                                  {visibleTiers.map((tier) => {
                                    const items = look.tiers[tier.id];
                                    const saveKey = `${day.day}-${look.id}-${tier.id}`;
                                    return (
                                      <article
                                        key={tier.id}
                                        className="bg-card border border-border/50 flex flex-col"
                                      >
                                        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                                          <div>
                                            <div className="eyebrow text-gold text-[0.6rem] tracking-[0.25em]">
                                              {tier.label}
                                            </div>
                                            <div className="font-serif text-[0.75rem] text-ink/60 italic mt-0.5">
                                              {tier.range}
                                            </div>
                                          </div>
                                        </div>
                                        <CategorizedItems
                                          items={items}
                                          finishingNote={look.finishingNote}
                                        />
                                      </article>
                                    );
                                  })}
                                </div>

                                {/* Look-level CTAs */}
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                  <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer sponsored"
                                    className="eyebrow text-[0.65rem] tracking-[0.28em] inline-flex items-center gap-2 px-6 py-3 bg-ink text-ivory hover:bg-gold transition-colors"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    Shop Full Look
                                  </a>
                                  <button
                                    onClick={() =>
                                      toggleSave(`look-${day.day}-${look.id}`)
                                    }
                                    className="eyebrow text-[0.65rem] tracking-[0.28em] inline-flex items-center gap-2 px-5 py-3 border border-gold/60 text-ink hover:bg-gold/5 transition-colors cursor-pointer"
                                  >
                                    <Heart
                                      className={`w-3.5 h-3.5 ${saved[`look-${day.day}-${look.id}`] ? "fill-gold text-gold" : ""}`}
                                    />
                                    Save Look ♡
                                  </button>
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day-level actions */}
                  <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="eyebrow text-[0.65rem] tracking-[0.25em] inline-flex items-center gap-2 px-6 py-3 bg-gold text-ivory hover:bg-ink transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Shop Full Look
                    </a>
                    <button
                      onClick={() => toggleSave(`day-${day.day}`)}
                      className="eyebrow text-[0.65rem] tracking-[0.25em] inline-flex items-center gap-2 px-5 py-3 border border-gold/60 text-ink hover:bg-gold/5 transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${saved[`day-${day.day}`] ? "fill-gold text-gold" : ""}`}
                      />
                      Save Look ♡
                    </button>
                  </div>
                </>
              )}
            </section>
          );
        })}
      </main>

      {/* FOOTER */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-10">
        <Link
          to="/"
          className="block text-center bg-gold text-ivory py-4 eyebrow text-[0.7rem] tracking-[0.3em] hover:bg-ink transition-colors"
        >
          Return to the Portofino Edit
        </Link>
        <p className="mt-4 text-center eyebrow text-[0.55rem] text-ink/50">
          Prices are subject to change. Links may earn a small commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
