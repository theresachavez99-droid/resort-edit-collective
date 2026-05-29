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
import { trackOutbound } from "@/lib/utils";

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
    ],
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
  const grouped = items.reduce<Record<AccessoryCategory, EditItem[]>>(
    (acc, it) => {
      // Hide cards that have no resolvable link (inventory unavailable + no backup).
      if (resolveProductLink(it) === null) return acc;
      (acc[it.category] ||= []).push(it);
      return acc;
    },
    {} as Record<AccessoryCategory, EditItem[]>,
  );

  return (
    <div className="px-4 py-5 divide-y divide-border/40 flex-1">
      {categoryOrder.map((cat) => {
        const list = grouped[cat] ?? [];
        const isRequired = requiredCategories.includes(cat);
        const hasNote = cat === "finishing" && finishingNote;

        // Optional cats with nothing to show -> hide entirely
        if (!isRequired && list.length === 0 && !hasNote) return null;

        const Icon = categoryIcons[cat];
        return (
          <div key={cat} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3 h-3 text-gold/80" />
              <div className="eyebrow text-[0.55rem] text-ink/60 tracking-[0.28em]">
                {categoryLabels[cat]}
              </div>
            </div>

            {list.length > 0 ? (
              <ul className="space-y-2">
                {list.map((item) => (
                  <li key={item.brand + item.item}>
                    <a
                      href={resolveProductLink(item) ?? "#"}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={() =>
                        trackOutbound({
                          brand: item.brand,
                          item: item.item,
                          href: resolveProductLink(item),
                          category: item.category,
                        })
                      }
                      className="flex justify-between gap-3 group/item rounded-sm -mx-1 px-1 py-1 transition-colors hover:bg-gold/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
                    >
                      <div className="text-left leading-tight min-w-0">
                        <div className="eyebrow text-[0.55rem] text-ink group-hover/item:text-gold transition-colors truncate flex items-center gap-1.5">
                          <span className="truncate">{item.brand}</span>
                          {item.replaced && (
                            <span className="eyebrow text-[0.5rem] tracking-[0.2em] text-gold border border-gold/50 px-1 py-px shrink-0">
                              Updated Pick
                            </span>
                          )}
                        </div>
                        <div className="font-serif text-[0.82rem] text-ink/80 mt-0.5 truncate">
                          {item.item}
                        </div>
                      </div>
                      <div className="font-serif text-[0.82rem] text-gold shrink-0 self-center">
                        {item.price}
                      </div>
                    </a>
                  </li>
                ))}
                {hasNote && (
                  <li className="font-serif italic text-[0.78rem] text-ink/65 pt-1">
                    {finishingNote}
                  </li>
                )}
              </ul>
            ) : hasNote ? (
              <p className="font-serif italic text-[0.78rem] text-ink/65">
                {finishingNote}
              </p>
            ) : (
              <p className="font-serif italic text-[0.72rem] text-ink/40">
                Not needed for this look
              </p>
            )}
          </div>
        );
      })}
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
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-8 md:pt-12 pb-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 eyebrow text-[0.6rem] text-ink/60 hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to the Edit
        </Link>
        <img
          src={logo}
          alt="Resort Edit"
          className="mx-auto mt-6 w-[220px] sm:w-[300px] h-auto"
        />
        <p className="eyebrow text-gold mt-4 text-[0.7rem] tracking-[0.3em]">
          The Portofino Edit · Three Ways To Vacation
        </p>
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl tracking-[0.08em] mt-6 text-ink">
          One Destination.
          <br className="sm:hidden" /> Multiple Ways To Vacation Beautifully.
        </h1>
        <p className="font-serif text-[0.95rem] sm:text-base text-ink/70 max-w-2xl mx-auto mt-5 leading-relaxed">
          Each day, three style directions — print forward, quiet luxury, and
          texture forward — translated across designer, mid-luxe, and accessible
          tiers. Same aesthetic. Different investment.
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
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 space-y-20">
        {portofinoEdit.map((day) => {
          const isOpen = openDays[day.day];
          const openLookKey = expandedLook[day.day];
          return (
            <section key={day.day} id={day.day} className="scroll-mt-32">
              {/* Day header */}
              <header className="flex items-end justify-between gap-4 border-b border-border/60 pb-4 mb-8">
                <div>
                  <div className="eyebrow text-gold text-[0.65rem] tracking-[0.3em]">
                    {day.day}
                  </div>
                  <h2 className="font-display text-2xl sm:text-4xl tracking-[0.06em] text-ink mt-2">
                    {day.title}
                  </h2>
                  <p className="font-serif italic text-[0.9rem] text-ink/60 mt-2 max-w-xl">
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
                                <div
                                  className={`grid gap-5 sm:gap-6 ${
                                    visibleTiers.length === 1
                                      ? "grid-cols-1"
                                      : visibleTiers.length === 2
                                        ? "grid-cols-1 md:grid-cols-2"
                                        : "grid-cols-1 md:grid-cols-3"
                                  }`}
                                >
                                  {visibleTiers.map((tier) => {
                                    const items = look.tiers[tier.id];
                                    const saveKey = `${day.day}-${look.id}-${tier.id}`;
                                    return (
                                      <article
                                        key={tier.id}
                                        className="group bg-card border border-border/50 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(141,110,68,0.35)] hover:border-gold/60"
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
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                  <a
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="eyebrow text-[0.65rem] tracking-[0.28em] inline-flex items-center gap-2 px-6 py-3 bg-ink text-ivory hover:bg-gold transition-colors"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    Shop This Look
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
                                    Save Look
                                  </button>
                                  <button
                                    onClick={shareEdit}
                                    className="eyebrow text-[0.65rem] tracking-[0.28em] inline-flex items-center gap-2 px-5 py-3 border border-gold/60 text-ink hover:bg-gold/5 transition-colors cursor-pointer"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                    Share Look
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
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => toggleSave(`day-${day.day}`)}
                      className="eyebrow text-[0.65rem] tracking-[0.25em] inline-flex items-center gap-2 px-5 py-3 border border-gold/60 text-ink hover:bg-gold/5 transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${saved[`day-${day.day}`] ? "fill-gold text-gold" : ""}`}
                      />
                      Save This Edit
                    </button>
                    <button
                      onClick={shareEdit}
                      className="eyebrow text-[0.65rem] tracking-[0.25em] inline-flex items-center gap-2 px-5 py-3 border border-gold/60 text-ink hover:bg-gold/5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share Edit
                    </button>
                    <a
                      href="#"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="eyebrow text-[0.65rem] tracking-[0.25em] inline-flex items-center gap-2 px-5 py-3 bg-gold text-ivory hover:bg-ink transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Shop Entire Day
                    </a>
                  </div>
                </>
              )}
            </section>
          );
        })}
      </main>

      {/* FOOTER */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-16">
        <Link
          to="/"
          className="block text-center bg-gold text-ivory py-5 eyebrow text-[0.7rem] tracking-[0.3em] hover:bg-ink transition-colors"
        >
          Return to the Portofino Edit
        </Link>
        <p className="mt-6 text-center eyebrow text-[0.55rem] text-ink/50">
          Prices are subject to change. Links may earn a small commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
