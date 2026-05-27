import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Heart, Share2, ShoppingBag, ChevronDown, ArrowLeft } from "lucide-react";
import { portofinoEdit, tiers, type Tier } from "@/data/portofinoEdit";
import logo from "@/assets/resort-edit-logo.png";

export const Route = createFileRoute("/portofino-edit")({
  head: () => ({
    meta: [
      { title: "Portofino Resort Edit — Across Price Points" },
      {
        name: "description",
        content:
          "The same Portofino aesthetic, translated across designer, mid-luxe, and accessible investment levels.",
      },
      { property: "og:title", content: "Portofino Resort Edit — Across Price Points" },
      {
        property: "og:description",
        content: "Same aesthetic. Different investment. Explore the Portofino edit.",
      },
    ],
  }),
  component: PortofinoEditPage,
});

type Filter = Tier | "all";

function PortofinoEditPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openDays, setOpenDays] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(portofinoEdit.map((d) => [d.day, true])),
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [activeDay, setActiveDay] = useState<string>(portofinoEdit[0].day);

  const visibleTiers = useMemo(
    () => (filter === "all" ? tiers : tiers.filter((t) => t.id === filter)),
    [filter],
  );

  // Track which day is in view for sticky nav highlighting.
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
        <Link to="/" className="inline-flex items-center gap-2 eyebrow text-[0.6rem] text-ink/60 hover:text-gold transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to the Edit
        </Link>
        <img
          src={logo}
          alt="Resort Edit"
          className="mx-auto mt-6 w-[220px] sm:w-[300px] h-auto"
        />
        <p className="eyebrow text-gold mt-4 text-[0.7rem] tracking-[0.3em]">
          The Portofino Edit · Across Price Points
        </p>
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl tracking-[0.08em] mt-6 text-ink">
          Same Aesthetic.
          <br className="sm:hidden" /> Different Investment.
        </h1>
        <p className="font-serif text-[0.95rem] sm:text-base text-ink/70 max-w-2xl mx-auto mt-5 leading-relaxed">
          Explore each Resort Edit look translated across multiple price points
          while keeping the same destination aesthetic.
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
          {/* Day nav */}
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
          {/* Filters */}
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
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 space-y-16">
        {portofinoEdit.map((day) => {
          const isOpen = openDays[day.day];
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
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8 lg:gap-10">
                    {/* Visual anchor */}
                    <figure className="bg-card">
                      <div className="aspect-[2/3] overflow-hidden bg-muted">
                        <img
                          src={day.image}
                          alt={`${day.title} look`}
                          loading="lazy"
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <figcaption className="text-center py-4 px-3">
                        <div className="eyebrow text-[0.6rem] text-gold tracking-[0.25em]">
                          The Original Look
                        </div>
                      </figcaption>
                    </figure>

                    {/* Tier cards */}
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
                        const items = day.tiers[tier.id];
                        const saveKey = `${day.day}-${tier.id}`;
                        return (
                          <article
                            key={tier.id}
                            className="group bg-card border border-border/50 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(141,110,68,0.35)] hover:border-gold/60"
                          >
                            {/* Tier label */}
                            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                              <div>
                                <div className="eyebrow text-gold text-[0.6rem] tracking-[0.25em]">
                                  {tier.label}
                                </div>
                                <div className="font-serif text-[0.75rem] text-ink/60 italic mt-0.5">
                                  {tier.range}
                                </div>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => toggleSave(saveKey)}
                                  aria-label="Save this edit"
                                  className="w-8 h-8 inline-flex items-center justify-center border border-border/60 hover:border-gold hover:text-gold transition-colors cursor-pointer"
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 ${saved[saveKey] ? "fill-gold text-gold" : ""}`}
                                  />
                                </button>
                                <button
                                  onClick={shareEdit}
                                  aria-label="Share this edit"
                                  className="w-8 h-8 inline-flex items-center justify-center border border-border/60 hover:border-gold hover:text-gold transition-colors cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Hero image (reuses day image, tinted differently per tier) */}
                            <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                              <img
                                src={day.image}
                                alt={`${day.title} — ${tier.label}`}
                                loading="lazy"
                                className={`h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03] ${
                                  tier.id === "designer"
                                    ? ""
                                    : tier.id === "mid"
                                      ? "saturate-[0.95]"
                                      : "saturate-[0.9] brightness-[1.02]"
                                }`}
                              />
                            </div>

                            {/* Items */}
                            <ul className="px-4 py-5 space-y-3 flex-1">
                              {items.map((item) => (
                                <li key={item.brand + item.item}>
                                  <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="flex justify-between gap-3 group/item"
                                  >
                                    <div className="text-left leading-tight min-w-0">
                                      <div className="eyebrow text-[0.55rem] text-ink group-hover/item:text-gold transition-colors truncate">
                                        {item.brand}
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
                            </ul>

                            {/* Shop CTA */}
                            <div className="px-4 pb-4">
                              <a
                                href="#"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="block text-center eyebrow text-[0.65rem] tracking-[0.25em] py-3 border border-ink text-ink hover:bg-ink hover:text-ivory transition-colors"
                              >
                                Shop the {tier.label.replace(" Edit", "")}
                              </a>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day-level actions */}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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