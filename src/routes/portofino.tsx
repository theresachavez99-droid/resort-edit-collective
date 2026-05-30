import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { portofinoLooks, resolveProductLink, type ShopItem, type Look } from "@/data/portofino";
import { trackOutbound } from "@/lib/utils";
import portofinoImg from "@/assets/dest-portofino.jpg";
import { absoluteUrl } from "@/lib/site";
import d1a from "@/assets/edit-d1-a.jpg";
import d1b from "@/assets/edit-d1-b.jpg";
import d1c from "@/assets/edit-d1-c.jpg";
import d2a from "@/assets/edit-d2-a.jpg";
import d2b from "@/assets/edit-d2-b.jpg";
import d2c from "@/assets/edit-d2-c.jpg";
import d3a from "@/assets/edit-d3-a.jpg";
import d3b from "@/assets/edit-d3-b.jpg";
import d3c from "@/assets/edit-d3-c.jpg";
import d4a from "@/assets/edit-d4-a.jpg";
import d4b from "@/assets/edit-d4-b.jpg";
import d4c from "@/assets/edit-d4-c.jpg";
import d5a from "@/assets/edit-d5-a.jpg";
import d5b from "@/assets/edit-d5-b.jpg";
import d5c from "@/assets/edit-d5-c.jpg";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "5 Days in Portofino — A Style & Itinerary Guide | Resort Edit" },
      { name: "description", content: "Five complete resort looks and a five-day itinerary for Portofino — yacht days, beach cabanas, sunset dinners and quiet harbor mornings." },
      { property: "og:title", content: "5 Days in Portofino — Resort Edit" },
      { property: "og:description", content: "A luxury style and travel guide to the Italian Riviera." },
      { property: "og:image", content: absoluteUrl(portofinoImg) },
      { property: "og:url", content: absoluteUrl("/portofino") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino") }],
  }),
  component: PortofinoPage,
});

function PortofinoPage() {
  const allExperiences = portofinoLooks.flatMap((l) => l.experiences);

  const lookImages: Record<string, [string, string, string]> = {
    "Day 1": [d1a, d1b, d1c],
    "Day 2": [d2a, d2b, d2c],
    "Day 3": [d3a, d3b, d3c],
    "Day 4": [d4a, d4b, d4c],
    "Day 5": [d5a, d5b, d5c],
  };
  const lookTitlesByDay: Record<string, [string, string, string]> = {
    "Day 1": ["Harbor Hero", "Marina Edit", "Riviera Daywear"],
    "Day 2": ["Cabana Statement", "Long-Lunch Linen", "Seaside Easy"],
    "Day 3": ["Piazzetta Polish", "Via Roma Wander", "Aperitivo Casual"],
    "Day 4": ["Sunset Showstopper", "Candlelit Cocktail", "Waterfront Dinner"],
    "Day 5": ["Last-Day Luxe", "Market Morning", "Coastal Farewell"],
  };
  const tipByDay: Record<string, string> = {
    "Day 1": "Book the yacht. Stay through golden hour.",
    "Day 2": "Reserve your cabana. Linger past lunch.",
    "Day 3": "Hit Via Roma early. Aperitivo at sunset.",
    "Day 4": "Book the cliffside terrace. Stay for digestivos.",
    "Day 5": "Take the boat to San Fruttuoso. One last swim.",
  };

  return (
    <div>
      {/* HERO — Editorial full-bleed */}
      <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="Portofino harbor — editorial hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-16 md:pb-24 text-ivory">
          <span className="eyebrow text-ivory/80 tracking-[0.4em]">The Resort Edit · Portofino</span>
          <h1 className="font-display text-5xl md:text-8xl mt-6 tracking-[0.05em] leading-[1]">
            5 Days in Portofino
          </h1>
          <p className="font-serif italic text-lg md:text-2xl text-ivory/85 mt-6 max-w-2xl leading-relaxed">
            Five days. Five looks. Dressed for the Italian Riviera.
          </p>
        </div>
      </section>

      {/* DAY 1–5 — multi-look shopping experience */}
      <section className="bg-ivory py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center mb-16 md:mb-20">
          <span className="eyebrow text-gold">The Wardrobe</span>
          <h2 className="font-display text-4xl md:text-6xl mt-4 tracking-[0.05em]">
            Five Days, Three Ways
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Every day, three shoppable looks — Designer, Mid-Luxe, and Riviera Finds.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-6 space-y-28 md:space-y-36">
          {portofinoLooks.map((look) => {
            const images = lookImages[look.day] ?? [look.image, look.image, look.image];
            const titles = lookTitlesByDay[look.day] ?? ["Look 1", "Look 2", "Look 3"];
            const tip = tipByDay[look.day] ?? "";

            return (
              <DayLooks
                key={look.day}
                look={look}
                images={images}
                titles={titles}
                tip={tip}
              />
            );
          })}
        </div>
      </section>

      {/* SHOP BY PRICE TIER */}
      <section className="bg-cream py-24 md:py-28 border-y border-border/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="eyebrow text-gold">Shop By Price Point</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            Explore This Edit Across Price Points
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Same aesthetic. Different investment. Three styling pathways across designer, mid-luxe, and Riviera finds.
          </p>
          <Link
            to="/portofino-edit"
            className="mt-10 inline-block eyebrow text-ivory bg-ink px-8 py-4 hover:bg-gold transition-colors"
          >
            Open The Price-Point Edit →
          </Link>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center mb-16">
          <span className="eyebrow text-gold">The Experiences</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            Bookable Moments
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Curated by day — yacht charters, cliffside cabanas, candlelit dinners.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allExperiences.map((exp) => {
            const href = exp.affiliate_link || exp.backup_link || "#";
            return (
              <a
                key={exp.experience_name}
                href={href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group block bg-ivory border border-border/60 hover:border-gold transition-colors"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={exp.experience_image}
                    alt={exp.experience_name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="eyebrow text-gold text-[10px]">{exp.price_tier}</span>
                  <h4 className="font-display text-lg tracking-wide mt-2 leading-snug">
                    {exp.experience_name}
                  </h4>
                  <p className="font-serif italic text-ink/65 text-sm mt-2 leading-relaxed">
                    {exp.experience_description}
                  </p>
                  <span className="mt-4 inline-block eyebrow text-[10px] text-ink group-hover:text-gold transition-colors">
                    Book This Experience →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* HOTELS */}
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center mb-16">
          <span className="eyebrow text-gold">Where To Stay</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            The Hotels
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Three addresses on the promontory — each one a different way to wake up in Portofino.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Belmond Hotel Splendido",
              tier: "Iconic",
              note: "Pastel-pink cliffside legend with the most photographed pool in the Riviera.",
              href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
            },
            {
              name: "Splendido Mare, A Belmond Hotel",
              tier: "Harborfront",
              note: "Right on the piazzetta — wake to the boats, dine on the waterfront.",
              href: "https://www.belmond.com/hotels/europe/italy/portofino/splendido-mare/",
            },
            {
              name: "Eight Hotel Portofino",
              tier: "Boutique",
              note: "Quietly elegant, walkable to everything, a more intimate alternative.",
              href: "https://www.eighthotelportofino.com/",
            },
          ].map((h) => (
            <a
              key={h.name}
              href={h.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group block bg-ivory border border-border/60 hover:border-gold transition-colors p-7"
            >
              <span className="eyebrow text-gold text-[10px]">{h.tier}</span>
              <h3 className="font-display text-2xl tracking-wide mt-3 leading-snug">{h.name}</h3>
              <p className="font-serif italic text-ink/70 mt-4 leading-relaxed">{h.note}</p>
              <span className="mt-6 inline-block eyebrow text-[10px] text-ink group-hover:text-gold transition-colors">
                Reserve →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span className="eyebrow text-gold">The Newsletter</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            New Edits, Quietly Delivered
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Resort edits, packing lists, and destination notes — sent only when there's something worth wearing.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 bg-ivory border border-border/60 px-5 py-4 font-serif italic text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="eyebrow text-ivory bg-ink px-7 py-4 hover:bg-gold transition-colors cursor-pointer"
            >
              Subscribe →
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function DayLooks({
  look,
  images,
  titles,
  tip,
}: {
  look: Look;
  images: [string, string, string];
  titles: [string, string, string];
  tip: string;
}) {
  const [active, setActive] = useState(0);
  const liveItems = look.shop.filter((i) => resolveProductLink(i) !== null);
  // Build three "looks" from the day's shop list. Look 1 shows the full
  // curated product list; Looks 2 & 3 are price-tier curations of the same
  // items so the tabs always have something meaningful to swap to.
  const parsePrice = (p: string) => Number(p.replace(/[^0-9.]/g, "")) || 0;
  const sortedDesc = [...liveItems].sort(
    (a, b) => parsePrice(b.price) - parsePrice(a.price),
  );
  const half = Math.ceil(sortedDesc.length / 2);
  const lookItems: ShopItem[][] = [
    liveItems,
    sortedDesc.slice(0, half),
    sortedDesc.slice(half).length ? sortedDesc.slice(half) : sortedDesc,
  ];
  const tierLabels = ["Designer", "Mid-Luxe", "Riviera Finds"] as const;
  const items = lookItems[active] ?? liveItems;

  return (
    <article className="space-y-10 md:space-y-14">
      {/* Day Header */}
      <header className="max-w-4xl">
        <span className="eyebrow text-gold tracking-[0.4em]">
          {look.day.toUpperCase()} — {look.title}
        </span>
        <p className="font-serif italic text-lg md:text-xl text-ink/65 mt-4 leading-relaxed">
          {look.subtitle}
        </p>
        <div className="mt-6 h-px w-16 bg-gold" />
      </header>

      {/* Two-Column: AI model + full product grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT: AI model image */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden bg-muted h-full min-h-[420px] lg:min-h-[640px] aspect-[3/4] lg:aspect-auto lg:sticky lg:top-6">
            <img
              src={images[active]}
              alt={`${look.title} — ${titles[active]}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            />
            <div className="absolute top-4 left-4 bg-ivory/95 text-ink eyebrow px-4 py-2 tracking-[0.3em]">
              {look.day}
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-ivory/95 text-ink px-4 py-3">
              <span className="eyebrow text-gold text-[0.55rem] tracking-[0.3em]">
                {tierLabels[active]}
              </span>
              <div className="font-display text-xl tracking-wide mt-1">
                {titles[active]}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: full product grid + look tabs */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-baseline justify-between mb-5">
            <span className="eyebrow text-ink tracking-[0.35em]">
              Shop {look.day.toUpperCase()} · Look {active + 1}
            </span>
            <span className="eyebrow text-ink/40 text-[0.55rem]">
              {items.length} {items.length === 1 ? "Piece" : "Pieces"}
            </span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl tracking-wide mb-6">
            {titles[active]}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {items.map((item) => {
              const href = resolveProductLink(item)!;
              return (
                <a
                  key={item.item}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() =>
                    trackOutbound({ brand: item.brand, item: item.item, href })
                  }
                  className="group flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors h-full"
                >
                  <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={`${item.brand} ${item.item}`}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                        className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold/80 mb-2">
                          {item.brand}
                        </span>
                        <span className="font-serif italic text-ink/60 text-[0.78rem] leading-snug">
                          {item.item}
                        </span>
                      </div>
                    )}
                    {item.replaced && (
                      <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.2em] text-gold bg-ivory/90 border border-gold/50 px-1.5 py-0.5">
                        Updated
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    <div className="eyebrow text-ink text-[0.55rem] tracking-[0.3em]">
                      {item.brand}
                    </div>
                    <div className="font-serif italic text-ink/85 text-[0.95rem] leading-snug mt-1.5">
                      {item.item}
                    </div>
                    <div className="font-serif text-gold text-[0.95rem] mt-1.5">
                      {item.price}
                    </div>
                    <div className="mt-auto pt-4">
                      <span className="eyebrow text-[0.6rem] tracking-[0.35em] text-ink group-hover:text-gold transition-colors">
                        Shop →
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Look tabs */}
          <div
            role="tablist"
            aria-label={`${look.day} looks`}
            className="mt-8 grid grid-cols-3 gap-0 border border-ink"
          >
            {titles.map((t, i) => {
              const isActive = i === active;
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={`eyebrow text-[0.6rem] tracking-[0.35em] py-4 px-3 transition-colors ${
                    isActive
                      ? "bg-ink text-ivory"
                      : "bg-ivory text-ink hover:bg-cream"
                  }`}
                >
                  Look {i + 1}
                  <span className="hidden md:inline">
                    {" "}
                    · {t}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resort Edit Tip Banner */}
      {tip && (
        <div className="bg-cream border-y border-gold/40 px-6 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="eyebrow text-gold tracking-[0.35em] text-[0.65rem]">
            Resort Edit Tip
          </span>
          <p className="font-serif italic text-ink/80 text-base md:text-lg">{tip}</p>
        </div>
      )}

      {/* Destination Footer Callout */}
      <div className="flex items-center justify-center gap-3 text-ink/70">
        <MapPin className="h-4 w-4 text-gold" />
        <span className="eyebrow tracking-[0.4em] text-ink">Portofino, Italy</span>
        <span className="text-ink/30">·</span>
        <span className="font-serif italic text-ink/65">Sun. Style. Aperitivo.</span>
      </div>
    </article>
  );
}